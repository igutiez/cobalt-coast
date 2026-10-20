import * as THREE from 'three'
import type { Kart } from './Kart.ts'
import type { Track } from './Track.ts'
import type { Effects } from './Effects.ts'
import { itemIcon, type ItemKind } from './textures.ts'

interface ItemBox {
  group: THREE.Group
  icon: THREE.Mesh
  halo: THREE.Mesh
  pos: THREE.Vector3
  index: number
  active: boolean
  respawn: number
  phase: number
}

interface Missile {
  mesh: THREE.Group
  pos: THREE.Vector3
  dir: THREE.Vector3
  target: Kart | null
  life: number
  trail: number
}

interface Oil {
  mesh: THREE.Mesh
  pos: THREE.Vector3
  life: number
}

const KINDS: ItemKind[] = ['turbo', 'missile', 'shield', 'oil']


export class Items {
  readonly group = new THREE.Group()
  private readonly boxes: ItemBox[] = []
  private readonly missiles: Missile[] = []
  private readonly oils: Oil[] = []
  private readonly effects: Effects
  private readonly iconCache = new Map<ItemKind, THREE.CanvasTexture>()
  private time = 0

  onPickup: (kart: Kart) => void = () => {}
  onLaunch: () => void = () => {}
  onExplode: () => void = () => {}

  constructor(track: Track, effects: Effects) {
    this.effects = effects
    track.itemSpots.forEach((spot, boxIndex) => {
      const node = track.sample(spot.index)
      const pos = node.pos
        .clone()
        .addScaledVector(node.side, spot.lateral)
        .add(new THREE.Vector3(0, 1.6, 0))
      const group = new THREE.Group()
      group.position.copy(pos)

      const halo = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.15, 1),
        new THREE.MeshPhysicalMaterial({
          color: 0x9ff6ff,
          transparent: true,
          opacity: 0.28,
          roughness: 0.05,
          metalness: 0.1,
          transmission: 0.6,
          emissive: 0x2ff2df,
          emissiveIntensity: 0.6,
          depthWrite: false,
        }),
      )
      const kind = KINDS[boxIndex % KINDS.length]
      const icon = new THREE.Mesh(
        new THREE.PlaneGeometry(1.25, 1.25),
        new THREE.MeshBasicMaterial({ map: this.iconTexture(kind), transparent: true, depthWrite: false, toneMapped: false }),
      )
      group.add(halo, icon)
      this.group.add(group)
      this.boxes.push({
        group,
        icon,
        halo,
        pos,
        index: spot.index,
        active: true,
        respawn: 0,
        phase: Math.random() * 6.28,
      })
    })
  }

  private iconTexture(kind: ItemKind): THREE.CanvasTexture {
    let t = this.iconCache.get(kind)
    if (!t) {
      t = new THREE.CanvasTexture(itemIcon(kind))
      t.colorSpace = THREE.SRGBColorSpace
      this.iconCache.set(kind, t)
    }
    return t
  }

  private assignKind(kart: Kart): ItemKind {
    const behind = 5 - Math.min(5, Math.max(0, kart.rank - 1))
    const weights: Record<ItemKind, number> = {
      turbo: 1.2 + behind * 0.5,
      missile: 1.4 + behind * 0.2,
      shield: 1.0,
      oil: 0.7 + Math.max(0, 2 - behind) * 0.4,
    }
    const total = KINDS.reduce((a, k) => a + weights[k], 0)
    let r = Math.random() * total
    for (const k of KINDS) {
      r -= weights[k]
      if (r <= 0) return k
    }
    return 'turbo'
  }

  give(kart: Kart) {
    if (kart.item) return
    kart.item = this.assignKind(kart)
    this.onPickup(kart)
  }

  use(kart: Kart, karts: Kart[]) {
    const kind = kart.item
    if (!kind) return
    kart.item = null
    if (kind === 'turbo') {
      kart.useBoost(2)
      this.effects.sparks(kart.pos.clone().add(new THREE.Vector3(0, 0.6, 0)), new THREE.Color(0x4ae8ff), 10)
    } else if (kind === 'shield') {
      kart.activateShield()
    } else if (kind === 'oil') {
      this.dropOil(kart)
    } else {
      this.fireMissile(kart, karts)
    }
  }

  private dropOil(kart: Kart) {
    const pos = kart.pos.clone().addScaledVector(kart.forward, -3)
    pos.y = kart.pos.y - 0.38
    const mesh = new THREE.Mesh(
      new THREE.CircleGeometry(1.5, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0x121619,
        roughness: 0.08,
        metalness: 0.55,
        clearcoat: 1,
        transparent: true,
        opacity: 0.92,
      }),
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.position.copy(pos)
    this.group.add(mesh)
    this.oils.push({ mesh, pos, life: 26 })
  }

  private fireMissile(kart: Kart, karts: Kart[]) {
    const target = karts
      .filter((k) => k !== kart && k.rank < kart.rank)
      .sort((a, b) => b.rank - a.rank)[0] ?? null
    const group = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.7, 6, 10),
      new THREE.MeshStandardMaterial({
        color: 0xff4d6d,
        emissive: 0xff2244,
        emissiveIntensity: 2.2,
        roughness: 0.3,
        metalness: 0.4,
      }),
    )
    body.rotation.x = Math.PI / 2
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xff8a3d, transparent: true, opacity: 0.42, toneMapped: false }),
    )
    group.add(body, glow)
    const pos = kart.pos.clone().addScaledVector(kart.forward, 2.6)
    pos.y += 0.9
    group.position.copy(pos)
    this.group.add(group)
    this.missiles.push({
      mesh: group,
      pos,
      dir: kart.forward.clone(),
      target,
      life: 7,
      trail: 0,
    })
    this.onLaunch()
  }

  update(dt: number, karts: Kart[], camera: THREE.Camera) {
    this.time += dt
    const player = karts.find((k) => k.isPlayer) ?? karts[0]

    for (const box of this.boxes) {
      if (!box.active) {
        box.respawn -= dt
        if (box.respawn <= 0) {
          box.active = true
          box.group.visible = true
          box.group.scale.setScalar(0.01)
        }
        continue
      }
      box.phase += dt
      const pop = Math.min(1, box.group.scale.x + dt * 4)
      const camDist = box.group.position.distanceTo(camera.position)
      const near = THREE.MathUtils.smoothstep(camDist, 2.5, 7)
      box.group.scale.setScalar(pop * (0.35 + near * 0.65))
      box.group.visible = camDist > 2.2
      box.halo.rotation.y += dt * 0.9
      box.halo.rotation.z += dt * 0.4
      box.group.position.y = box.pos.y + Math.sin(box.phase * 1.6) * 0.22
      box.icon.lookAt(camera.position)

      for (const kart of karts) {
        if (kart.finished) continue
        if (kart.pos.distanceTo(box.pos) < 3.1) {
          box.active = false
          box.group.visible = false
          box.respawn = 5
          this.give(kart)
          this.effects.sparks(box.pos, new THREE.Color(0x8ffcff), 16)
          break
        }
      }
    }

    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i]
      m.life -= dt
      if (m.target) {
        const desired = m.target.pos.clone().add(new THREE.Vector3(0, 1, 0)).sub(m.pos).normalize()
        m.dir.lerp(desired, Math.min(1, dt * 3.4)).normalize()
      }
      m.pos.addScaledVector(m.dir, dt * 62)
      m.mesh.position.copy(m.pos)
      m.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), m.dir)
      m.trail += dt
      if (m.trail > 0.02) {
        m.trail = 0
        this.effects.sparks(m.pos, new THREE.Color(0xffb347), 1)
      }
      let hit = false
      for (const kart of karts) {
        if (kart.pos.distanceTo(m.pos) < 2.3) {
          kart.hit()
          this.effects.explosion(m.pos)
          this.onExplode()
          hit = true
          break
        }
      }
      if (m.pos.distanceTo(player.pos) > 260) hit = true
      if (hit || m.life <= 0) {
        if (!hit) this.effects.sparks(m.pos, new THREE.Color(0xffb347), 6)
        this.group.remove(m.mesh)
        this.missiles.splice(i, 1)
      }
    }

    for (let i = this.oils.length - 1; i >= 0; i--) {
      const o = this.oils[i]
      o.life -= dt
      if (o.life < 3) o.mesh.scale.setScalar(Math.max(0.01, o.life / 3))
      for (const kart of karts) {
        if (kart.pos.distanceTo(o.pos) < 2.2 && kart.spinTime <= 0) {
          kart.hit()
          this.onExplode()
          o.life = 0
          break
        }
      }
      if (o.life <= 0) {
        this.group.remove(o.mesh)
        o.mesh.geometry.dispose()
        this.oils.splice(i, 1)
      }
    }
  }
}
