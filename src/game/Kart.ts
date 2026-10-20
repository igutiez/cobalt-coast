import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { numberTexture, paintNormal, shadowTexture, tireTexture } from './textures.ts'
import type { NearestHit, Track } from './Track.ts'
import { forwardFromYaw, rightFromYaw } from './Track.ts'
import type { ItemKind } from './textures.ts'

export interface KartStats {
  maxSpeed: number
  accel: number
  turn: number
  grip: number
}

export interface KartSpec {
  id: string
  name: string
  tag: string
  number: number
  body: number
  accent: number
  trim: number
  style: 'buggy' | 'formula' | 'muscle' | 'rally'
  stats: KartStats
}

export const KART_SPECS: KartSpec[] = [
  {
    id: 'dune',
    name: 'DUNAS',
    tag: 'EQUILIBRADO',
    number: 7,
    body: 0xff6b35,
    accent: 0x2ff2df,
    trim: 0x14212b,
    style: 'buggy',
    stats: { maxSpeed: 35.5, accel: 19, turn: 2.15, grip: 1 },
  },
  {
    id: 'reef',
    name: 'ARRECIFE',
    tag: 'VELOCIDAD',
    number: 3,
    body: 0x2f7bff,
    accent: 0xffd166,
    trim: 0x101a2b,
    style: 'formula',
    stats: { maxSpeed: 37.5, accel: 16.5, turn: 1.92, grip: 0.94 },
  },
  {
    id: 'mango',
    name: 'MANGO',
    tag: 'ACELERACIÓN',
    number: 11,
    body: 0xffc93c,
    accent: 0xff4d6d,
    trim: 0x231a10,
    style: 'muscle',
    stats: { maxSpeed: 34.5, accel: 22, turn: 2.25, grip: 1.02 },
  },
  {
    id: 'kelp',
    name: 'ALGAS',
    tag: 'CURVAS',
    number: 5,
    body: 0x2fbf71,
    accent: 0xeafff8,
    trim: 0x0d1f18,
    style: 'rally',
    stats: { maxSpeed: 35, accel: 18, turn: 2.42, grip: 1.08 },
  },
]

export interface KartInput {
  steer: number
  brake: boolean
  drift: boolean
  item: boolean
}

export const EMPTY_INPUT: KartInput = { steer: 0, brake: false, drift: false, item: false }

export interface WheelSet {
  fl: THREE.Object3D
  fr: THREE.Object3D
  rl: THREE.Object3D
  rr: THREE.Object3D
}

export class Kart {
  readonly spec: KartSpec
  readonly isPlayer: boolean
  readonly group = new THREE.Group()
  readonly body = new THREE.Group()
  readonly wheels: WheelSet
  readonly shieldMesh: THREE.Mesh
  readonly flames: THREE.Group
  readonly brakeMats: THREE.MeshStandardMaterial[]
  readonly driverParts: { steering: THREE.Object3D; arms: THREE.Mesh[] }
  readonly pos = new THREE.Vector3()
  yaw = 0
  speed = 0
  steer = 0
  brakeInput = 0
  driftAmount = 0
  driftBlend = 0
  private boostPower = 1.35
  driftCharge = 0
  driftTier = 0
  drifting = false
  boostTime = 0
  spinTime = 0
  shieldTime = 0
  lapCount = 0
  hasCrossedStart = false
  index = 0
  hint = -1
  finished = false
  finishTime = 0
  lapStart = 0
  lastLap = 0
  bestLap = Infinity
  rank = 1
  item: ItemKind | null = null
  offroad = false
  wallHit = 0
  bumpTimer = 0
  private wheelSpin = 0
  private bodyRoll = 0
  private bodyPitch = 0
  private bob = Math.random() * 6.28
  private readonly span: number
  speedScale = 1

  constructor(spec: KartSpec, isPlayer: boolean, track: Track, slot: number) {
    this.spec = spec
    this.isPlayer = isPlayer
    this.span = track.sampleCount
    const grid = track.gridSlot(slot)
    this.pos.copy(grid.pos)
    this.yaw = grid.yaw
    this.hint = track.nearest(this.pos, -1).index

    const built = buildKartModel(spec)
    built.root.scale.setScalar(1.24)
    this.body.add(built.root)
    this.wheels = built.wheels
    this.flames = built.flames
    this.brakeMats = built.brakeMats
    this.driverParts = built.driverParts
    this.group.add(this.body)

    this.shieldMesh = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 24, 18),
      new THREE.MeshPhysicalMaterial({
        color: 0x7dfcff,
        transparent: true,
        opacity: 0.22,
        roughness: 0.05,
        metalness: 0,
        transmission: 0.6,
        clearcoat: 1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    )
    this.shieldMesh.position.y = 1.2
    this.shieldMesh.visible = false
    this.group.add(this.shieldMesh)

    const blob = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 4.2),
      new THREE.MeshBasicMaterial({
        map: shadowTexture(),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        color: 0x000000,
      }),
    )
    blob.rotation.x = -Math.PI / 2
    blob.position.y = 0.03
    blob.renderOrder = 1
    this.group.add(blob)
  }

  get forward(): THREE.Vector3 {
    return forwardFromYaw(this.yaw)
  }

  get right(): THREE.Vector3 {
    return rightFromYaw(this.yaw)
  }

  get kmh(): number {
    return this.speed * 3.6
  }

  get totalProgress(): number {
    return this.hasCrossedStart ? this.lapCount * this.span + this.index : this.index - this.span
  }

  resetAt(track: Track, slot: number) {
    const grid = track.gridSlot(slot)
    this.pos.copy(grid.pos)
    this.yaw = grid.yaw
    this.speed = 0
    this.steer = 0
    this.driftAmount = 0
    this.driftCharge = 0
    this.driftTier = 0
    this.boostTime = 0
    this.spinTime = 0
    this.shieldTime = 0
    this.lapCount = 0
    this.hasCrossedStart = false
    this.finished = false
    this.item = null
    this.offroad = false
    this.bestLap = Infinity
    const hit = track.nearest(this.pos, -1)
    this.hint = hit.index
    this.index = hit.index
    this.syncModel(hit, 0, 0)
  }

  startBoost() {
    this.boostTime = Math.max(this.boostTime, 1.6)
  }

  hit() {
    if (this.shieldTime > 0) {
      this.shieldTime = 0
      this.bumpTimer = 0.4
      return
    }
    if (this.spinTime > 0) return
    this.spinTime = 1.15
    this.speed *= 0.45
    this.driftCharge = 0
    this.driftAmount = 0
    this.drifting = false
  }

  useBoost(seconds: number, power = 1.35, kick = 0) {
    this.boostTime = Math.max(this.boostTime, seconds)
    this.boostPower = power
    if (kick > 0) this.speed = Math.min(this.speed + kick, this.spec.stats.maxSpeed * power * 1.1)
  }

  activateShield() {
    this.shieldTime = 7
  }

  respawn(track: Track) {
    const hit = track.nearest(this.pos, this.hint)
    const node = hit.node
    this.pos.copy(node.pos).addScaledVector(node.side, THREE.MathUtils.clamp(hit.lateral, -4, 4))
    this.yaw = Math.atan2(node.tan.x, node.tan.z)
    this.speed = 0
    this.spinTime = 0
    this.driftAmount = 0
    this.driftCharge = 0
    this.hint = hit.index
    this.index = hit.index
    this.syncModel(hit, 0, 0)
  }

  update(
    dt: number,
    track: Track,
    input: KartInput,
    time: number,
    racing: boolean,
    groundAt?: (x: number, z: number) => number,
  ) {
    const stats = this.spec.stats
    this.bumpTimer = Math.max(0, this.bumpTimer - dt)

    if (!racing) {
      this.speed = 0
      this.steer += (0 - this.steer) * Math.min(1, dt * 6)
      const idle = track.nearest(this.pos, this.hint)
      this.hint = idle.index
      this.index = idle.index
      this.pos.y = this.surfaceY(idle, track, groundAt)
      this.syncModel(idle, dt, time)
      return
    }

    const spin = this.spinTime > 0
    if (spin) {
      this.spinTime = Math.max(0, this.spinTime - dt)
      this.yaw += dt * 11
      this.speed *= 1 - 1.4 * dt
    }

    this.steer += (input.steer - this.steer) * Math.min(1, dt * 7.5)
    this.brakeInput = input.brake ? 1 : 0
    const drifting = input.drift && this.speed > 11 && Math.abs(this.steer) > 0.3 && !spin && racing
    this.driftBlend += ((drifting ? 1 : 0) - this.driftBlend) * Math.min(1, dt * (drifting ? 8 : 5))
    this.drifting = drifting

    let targetSpeed = stats.maxSpeed * this.speedScale
    if (this.offroad) targetSpeed *= 0.65
    if (this.boostTime > 0) {
      targetSpeed *= this.boostPower
      this.boostTime = Math.max(0, this.boostTime - dt)
    }


    if (!spin) {
      const accel = (this.boostTime > 0 ? stats.accel * (this.boostPower > 1.4 ? 2.2 : 1.5) : stats.accel) * (this.offroad ? 0.6 : 1)
      if (input.brake) {
        this.speed = Math.max(0, this.speed - 26 * dt)
      } else if (this.speed < targetSpeed) {
        this.speed += accel * dt * (1 - this.speed / (targetSpeed * 1.12))
      } else {
        this.speed -= 9 * dt
      }
      if (!input.brake && !drifting && this.speed > 10) {
        const ahead = Math.round(14 + this.speed * 1.0)
        const curv = Math.abs(track.sample(this.index + ahead).curv)
        if (curv > 0.0015) {
          const safe = Math.sqrt(13 / curv)
          if (this.speed > safe) this.speed -= (this.speed - safe) * 2.2 * dt
        }
      }
      if (this.speed < 0) this.speed = 0
      const turnMul = 1 + 0.2 * this.driftBlend
      const highSpeed = THREE.MathUtils.clamp((this.speed - 16) / 24, 0, 1)
      const turnRate = stats.turn * (0.98 - 0.42 * highSpeed) * turnMul
      this.yaw += this.steer * turnRate * dt
      if (Math.abs(this.steer) > 0.65 && this.speed > 24) {
        this.speed -= (this.speed - 24) * 0.4 * dt
      }
    }

    if (drifting) {
      this.driftAmount += (this.steer * 0.35 * this.driftBlend - this.driftAmount) * Math.min(1, dt * 7)
      this.driftCharge += dt * (0.8 + Math.abs(this.steer) * 1.1)
      this.speed *= 1 - 0.06 * dt
      this.driftTier = this.driftCharge > 2.2 ? 3 : this.driftCharge > 1.2 ? 2 : this.driftCharge > 0.5 ? 1 : 0
    } else {
      this.driftAmount += (0 - this.driftAmount) * Math.min(1, dt * 6)
      if (this.driftCharge > 0.5 && this.speed > 6) {
        const seconds = this.driftTier >= 3 ? 1.8 : this.driftTier === 2 ? 1.3 : 0.9
        const kick = this.driftTier >= 3 ? 5.5 : this.driftTier === 2 ? 4 : 2.5
        this.useBoost(seconds, 1.28, kick)
      }
      this.driftCharge = Math.max(0, this.driftCharge - dt * 1.4)
      this.driftTier = 0
    }

    const fwd = this.forward
    const right = this.right
    const slip = -this.driftAmount * this.speed * 0.32
    this.pos.addScaledVector(fwd, this.speed * dt)
    this.pos.addScaledVector(right, slip * dt)

    const prevIndex = this.index
    const hit = track.nearest(this.pos, this.hint)
    this.hint = hit.index
    this.index = hit.index
    const lateral = hit.lateral
    const limit = track.halfWidth + 1.2
    this.offroad = Math.abs(lateral) > limit
    const wall = track.halfWidth + 8.5
    if (Math.abs(lateral) > wall) {
      const node = hit.node
      const sign = Math.sign(lateral)
      this.pos.copy(node.pos).addScaledVector(node.side, sign * wall)
      this.speed *= 0.82
      this.wallHit = 0.35
    } else {
      this.wallHit = Math.max(0, this.wallHit - dt)
    }

    this.pos.y = this.surfaceY(hit, track, groundAt)

    this.checkLap(hit, time, prevIndex, track.sampleCount)
    this.syncModel(hit, dt, time)
  }

  private surfaceY(hit: NearestHit, track: Track, groundAt?: (x: number, z: number) => number): number {
    const lat = hit.lateral
    const abs = Math.abs(lat)
    const road = hit.node.pos.y - lat * Math.sin(hit.node.bank)
    if (abs <= track.halfWidth + 1.3) return road + 0.02
    if (abs <= track.halfWidth + 4.6) return road - 0.1 + 0.02
    if (!groundAt) return road + 0.02
    const terrain = groundAt(this.pos.x, this.pos.z)
    const blend = THREE.MathUtils.smoothstep(abs, track.halfWidth + 4.6, track.halfWidth + 7.2)
    return THREE.MathUtils.lerp(road - 0.1, terrain, blend) + 0.02
  }

  private checkLap(hit: NearestHit, time: number, prevIndex: number, n: number) {
    const idx = hit.index
    if (idx < n * 0.22 && prevIndex > n * 0.75) {
      if (!this.hasCrossedStart) {
        this.hasCrossedStart = true
        this.lapStart = time
        this.lastLap = time
      } else {
        const lapTime = time - this.lapStart
        this.bestLap = Math.min(this.bestLap, lapTime)
        this.lapCount++
        this.lapStart = time
        this.lastLap = time
      }
    }
  }

  private syncModel(hit: NearestHit, dt: number, time: number) {
    this.group.position.copy(this.pos)
    const visualYaw = this.yaw + this.driftAmount * 0.9
    this.group.rotation.y = visualYaw

    const leanTarget = -this.steer * 0.09 - this.driftAmount * 0.18
    this.bodyRoll += (leanTarget - this.bodyRoll) * Math.min(1, dt * 7)
    const accelPitch = -Math.min(0.06, this.speed * 0.0012)
    this.bodyPitch += (accelPitch - this.bodyPitch) * Math.min(1, dt * 5)
    this.body.rotation.z = this.bodyRoll - hit.node.bank
    this.body.rotation.x = this.bodyPitch

    this.bob += dt * (6 + this.speed * 0.35)
    const rough = this.offroad ? 0.055 : 0.012
    this.body.position.y = Math.sin(this.bob) * rough + (this.boostTime > 0 ? 0.06 : 0)

    this.wheelSpin += (this.speed / 0.46) * dt
    for (const w of [this.wheels.fl, this.wheels.fr, this.wheels.rl, this.wheels.rr]) {
      w.rotation.x = this.wheelSpin
    }
    const steerVis = this.steer * 0.42
    this.wheels.fl.parent!.rotation.y = steerVis
    this.wheels.fr.parent!.rotation.y = steerVis
    this.driverParts.steering.rotation.set(-1.0, 0, -this.steer * 1.35)
    this.driverParts.arms.forEach((arm, i) => {
      arm.rotation.z = (i === 0 ? -1 : 1) * 0.16 + this.steer * 0.13
      arm.rotation.x = -0.95 + Math.abs(this.steer) * 0.08
    })
    for (const mat of this.brakeMats) mat.emissiveIntensity = this.brakeInput > 0 ? 3.6 : 1.1

    this.shieldMesh.visible = this.shieldTime > 0
    if (this.shieldTime > 0) {
      this.shieldTime = Math.max(0, this.shieldTime - dt)
      const s = 1 + Math.sin(time * 6) * 0.03
      this.shieldMesh.scale.setScalar(s)
      ;(this.shieldMesh.material as THREE.MeshPhysicalMaterial).opacity = 0.16 + Math.sin(time * 9) * 0.05
    }

    const boosting = this.boostTime > 0
    this.flames.visible = boosting
    if (boosting) {
      const flick = 0.85 + Math.random() * 0.4
      this.flames.scale.set(flick, 1, flick)
    }
  }
}

function buildKartModel(spec: KartSpec): {
  root: THREE.Group
  wheels: WheelSet
  flames: THREE.Group
  brakeMats: THREE.MeshStandardMaterial[]
  driverParts: { steering: THREE.Object3D; arms: THREE.Mesh[] }
} {
  const root = new THREE.Group()
  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: spec.body,
    roughness: 0.24,
    metalness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    normalMap: paintNormal(),
    normalScale: new THREE.Vector2(0.06, 0.06),
  })
  const accentMat = new THREE.MeshPhysicalMaterial({
    color: spec.accent,
    roughness: 0.28,
    metalness: 0.22,
    clearcoat: 0.9,
  })
  const trimMat = new THREE.MeshStandardMaterial({ color: spec.trim, roughness: 0.48, metalness: 0.5 })
  const rubberTread = new THREE.MeshStandardMaterial({ map: tireTexture(), color: 0xffffff, roughness: 0.92, metalness: 0.02 })
  const tread = new THREE.MeshStandardMaterial({ color: 0x2a2f33, roughness: 0.9, metalness: 0.05 })
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdbe6ec, roughness: 0.16, metalness: 1 })
  const suitMat = new THREE.MeshStandardMaterial({ color: 0x202c36, roughness: 0.8 })
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a1620,
    roughness: 0.04,
    metalness: 0.35,
    clearcoat: 1,
  })

  const rbox = (w: number, h: number, d: number, r = 0.1) => new RoundedBoxGeometry(w, h, d, 3, r)

  const skirt = new THREE.Mesh(rbox(1.62, 0.24, 2.6, 0.1), trimMat)
  skirt.position.set(0, 0.44, 0)
  root.add(skirt)

  const chassis = new THREE.Mesh(rbox(1.52, 0.46, 2.95, 0.16), bodyMat)
  chassis.position.set(0, 0.66, 0)
  root.add(chassis)

  const hood = new THREE.Mesh(rbox(1.32, 0.32, 1.25, 0.14), bodyMat)
  hood.position.set(0, 0.9, 0.92)
  hood.rotation.x = -0.1
  root.add(hood)

  const stripe = new THREE.Mesh(rbox(0.4, 0.34, 1.28, 0.08), accentMat)
  stripe.position.set(0, 0.92, 0.92)
  stripe.rotation.x = -0.1
  root.add(stripe)

  const bumper = new THREE.Mesh(rbox(1.66, 0.16, 0.3, 0.06), trimMat)
  bumper.position.set(0, 0.5, 1.62)
  root.add(bumper)

  for (const s of [-1, 1]) {
    const pod = new THREE.Mesh(rbox(0.32, 0.34, 1.4, 0.1), accentMat)
    pod.position.set(s * 0.84, 0.6, 0.05)
    root.add(pod)

    const step = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.9), chrome)
    step.position.set(s * 0.78, 0.4, 0.15)
    root.add(step)

    const number = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.52),
      new THREE.MeshBasicMaterial({ map: numberTexture(spec.number), transparent: true }),
    )
    number.position.set(s * 0.86, 0.78, 0.05)
    number.rotation.y = s * Math.PI * 0.5
    root.add(number)
  }

  const deck = new THREE.Mesh(rbox(1.46, 0.5, 1.15, 0.14), bodyMat)
  deck.position.set(0, 0.92, -1.08)
  root.add(deck)

  const engine = new THREE.Mesh(rbox(0.9, 0.42, 0.68, 0.08), trimMat)
  engine.position.set(0, 1.18, -1.05)
  root.add(engine)

  const intake = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.24, 10), chrome)
  intake.position.set(0, 1.45, -1.0)
  root.add(intake)

  for (const s of [-1, 1]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 0.75, 10), chrome)
    pipe.position.set(s * 0.38, 1.02, -1.48)
    pipe.rotation.x = Math.PI / 2 - 0.3
    root.add(pipe)
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.09, 10), trimMat)
    tip.position.set(s * 0.38, 1.08, -1.82)
    tip.rotation.x = Math.PI / 2 - 0.3
    root.add(tip)
  }

  const tube = (a: THREE.Vector3, b: THREE.Vector3, r = 0.045, mat = trimMat as THREE.Material) => {
    const dir = new THREE.Vector3().subVectors(b, a)
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 8), mat)
    mesh.position.copy(a).addScaledVector(dir, 0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
    return mesh
  }

  if (spec.style === 'buggy' || spec.style === 'rally') {
    for (const s of [-1, 1]) {
      root.add(tube(new THREE.Vector3(s * 0.56, 0.88, 0.42), new THREE.Vector3(s * 0.5, 1.76, 0.18)))
      root.add(tube(new THREE.Vector3(s * 0.56, 0.88, -0.78), new THREE.Vector3(s * 0.5, 1.7, -0.52)))
      root.add(tube(new THREE.Vector3(s * 0.5, 1.76, 0.18), new THREE.Vector3(s * 0.5, 1.7, -0.52)))
    }
    root.add(tube(new THREE.Vector3(-0.5, 1.76, 0.18), new THREE.Vector3(0.5, 1.76, 0.18)))
    root.add(tube(new THREE.Vector3(-0.5, 1.7, -0.52), new THREE.Vector3(0.5, 1.7, -0.52)))
  }

  const seat = new THREE.Mesh(rbox(0.62, 0.74, 0.54, 0.1), suitMat)
  seat.position.set(0, 1.06, -0.48)
  seat.rotation.x = -0.16
  root.add(seat)

  const driver = new THREE.Group()
  const arms: THREE.Mesh[] = []
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.3, 6, 12), suitMat)
  torso.position.set(0, 1.38, -0.36)
  torso.rotation.x = -0.14
  driver.add(torso)

  const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.34, 4, 8), accentMat)
  shoulders.position.set(0, 1.47, -0.38)
  shoulders.rotation.z = Math.PI / 2
  driver.add(shoulders)

  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 4, 8), suitMat)
    arm.position.set(s * 0.19, 1.4, 0.02)
    arm.rotation.x = -0.95
    arm.rotation.z = s * 0.16
    driver.add(arm)
    arms.push(arm)
  }

  const steering = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 10, 22), trimMat)
  steering.position.set(0, 1.38, 0.26)
  steering.rotation.x = -1.0
  const steerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10), chrome)
  steerHub.rotation.x = Math.PI / 2
  steerHub.position.z = 0.01
  steering.add(steerHub)
  for (let i = 0; i < 3; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.018, 0.02), chrome)
    spoke.rotation.z = (i / 3) * Math.PI
    steering.add(spoke)
  }
  driver.add(steering)

  for (const s of [-1, 1]) {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.42, 0.02), new THREE.MeshStandardMaterial({ color: 0x121a20, roughness: 0.9 }))
    belt.position.set(s * 0.11, 1.4, -0.14)
    belt.rotation.z = s * 0.28
    belt.rotation.x = -0.14
    driver.add(belt)
    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), new THREE.MeshStandardMaterial({ color: 0x1b242c, roughness: 0.7 }))
    glove.position.set(s * 0.13, 1.36, 0.16)
    driver.add(glove)
  }

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.25, 20, 16), accentMat)
  helmet.position.set(0, 1.8, -0.34)
  driver.add(helmet)
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.255, 20, 16, 0, Math.PI * 2, 0.72, 0.6), glassMat)
  visor.position.copy(helmet.position)
  visor.rotation.x = 0.22
  driver.add(visor)
  const helmetSpoiler = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.1), accentMat)
  helmetSpoiler.position.set(0, 1.86, -0.55)
  helmetSpoiler.rotation.x = 0.35
  driver.add(helmetSpoiler)
  if (spec.style === 'muscle') driver.position.y = -0.3
  if (spec.style === 'formula') driver.position.y = -0.12
  root.add(driver)
  const driverParts = { steering, arms }

  const brakeMats: THREE.MeshStandardMaterial[] = []
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfff4d6,
    emissive: 0xfff0c8,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  })
  for (const s of [-1, 1]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), headlightMat)
    lamp.position.set(s * 0.36, 0.98, 1.46)
    root.add(lamp)
    const brakeMat = new THREE.MeshStandardMaterial({
      color: 0xff3344,
      emissive: 0xff1122,
      emissiveIntensity: 1.1,
      roughness: 0.4,
    })
    brakeMats.push(brakeMat)
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.09, 0.06), brakeMat)
    tail.position.set(s * 0.46, 0.92, -1.66)
    root.add(tail)
  }

  const wing = new THREE.Mesh(rbox(1.68, 0.08, 0.46, 0.04), bodyMat)
  wing.position.set(0, 1.58, -1.62)
  wing.rotation.x = -0.14
  root.add(wing)
  for (const s of [-1, 1]) {
    const endplate = new THREE.Mesh(rbox(0.05, 0.28, 0.5, 0.03), accentMat)
    endplate.position.set(s * 0.86, 1.58, -1.62)
    root.add(endplate)
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.46, 0.14), trimMat)
    strut.position.set(s * 0.52, 1.34, -1.58)
    root.add(strut)
  }

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.35, 5), chrome)
  antenna.position.set(-0.64, 1.95, -0.9)
  antenna.rotation.z = 0.2
  root.add(antenna)
  const pennant = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.24),
    new THREE.MeshStandardMaterial({ color: spec.accent, side: THREE.DoubleSide, roughness: 0.7 }),
  )
  pennant.position.set(-0.45, 2.55, -0.88)
  root.add(pennant)

  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.56, 0.56),
    new THREE.MeshBasicMaterial({ map: numberTexture(spec.number), transparent: true }),
  )
  plate.position.set(0, 1.1, 1.42)
  plate.rotation.x = -Math.PI / 2 + 0.14
  root.add(plate)

  const makeWheel = (radius: number, width: number) => {
    const holder = new THREE.Group()
    const spin = new THREE.Group()
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 24), rubberTread)
    tire.rotation.z = Math.PI / 2
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.94, radius * 0.1, 6, 22), tread)
    ring.rotation.y = Math.PI / 2
    const rim = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.56, radius * 0.055, 10, 28), chrome)
    rim.rotation.y = Math.PI / 2
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.2, radius * 0.2, width + 0.08, 10), accentMat)
    hub.rotation.z = Math.PI / 2
    spin.add(tire, ring, rim, hub)
    for (const side of [-1, 1]) {
      const lip = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.52, radius * 0.035, 6, 20), chrome)
      lip.rotation.y = Math.PI / 2
      lip.position.x = side * (width / 2 + 0.015)
      spin.add(lip)
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.1, radius * 0.1, 0.04, 10), trimMat)
      cap.rotation.z = Math.PI / 2
      cap.position.x = side * (width / 2 + 0.04)
      spin.add(cap)
    }
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(width + 0.05, radius * 0.09, radius * 0.72), trimMat)
      spoke.rotation.x = (i / 5) * Math.PI
      spin.add(spoke)
    }
    const discMat = new THREE.MeshStandardMaterial({ color: 0x6a7076, roughness: 0.35, metalness: 0.85 })
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, 0.035, 26), discMat)
    disc.rotation.z = Math.PI / 2
    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, radius * 0.26, radius * 0.16),
      new THREE.MeshStandardMaterial({ color: 0xd83a2a, roughness: 0.35, metalness: 0.3 }),
    )
    caliper.position.set(0, radius * 0.32, 0)
    holder.add(spin, disc, caliper)
    return { holder, spin }
  }

  const fl = makeWheel(0.4, 0.3)
  const fr = makeWheel(0.4, 0.3)
  const rl = makeWheel(0.5, 0.4)
  const rr = makeWheel(0.5, 0.4)
  fl.holder.position.set(-0.85, 0.4, 0.98)
  fr.holder.position.set(0.85, 0.4, 0.98)
  rl.holder.position.set(-0.95, 0.5, -0.98)
  rr.holder.position.set(0.95, 0.5, -0.98)
  root.add(fl.holder, fr.holder, rl.holder, rr.holder)

  for (const s of [-1, 1]) {
    root.add(tube(new THREE.Vector3(s * 0.72, 0.55, -0.98), new THREE.Vector3(s * 0.95, 0.5, -0.98), 0.035, chrome))
    root.add(tube(new THREE.Vector3(s * 0.66, 0.55, 0.98), new THREE.Vector3(s * 0.85, 0.4, 0.98), 0.03, chrome))
  }

  if (spec.style === 'formula') {
    const frontWing = new THREE.Mesh(rbox(2.0, 0.06, 0.42, 0.03), bodyMat)
    frontWing.position.set(0, 0.3, 1.62)
    root.add(frontWing)
    for (const s of [-1, 1]) {
      const plate = new THREE.Mesh(rbox(0.05, 0.26, 0.44, 0.02), accentMat)
      plate.position.set(s * 0.96, 0.3, 1.62)
      root.add(plate)
    }
    const noseCone = new THREE.Mesh(rbox(0.62, 0.26, 1.0, 0.12), accentMat)
    noseCone.position.set(0, 0.72, 1.42)
    noseCone.rotation.x = -0.06
    root.add(noseCone)
    const engineCover = new THREE.Mesh(rbox(0.7, 0.42, 1.1, 0.14), accentMat)
    engineCover.position.set(0, 1.18, -0.85)
    root.add(engineCover)
    const headrest = new THREE.Mesh(rbox(0.5, 0.34, 0.4, 0.1), trimMat)
    headrest.position.set(0, 1.42, -0.62)
    root.add(headrest)
  }

  if (spec.style === 'muscle') {
    const hood = new THREE.Mesh(rbox(1.4, 0.16, 1.5, 0.08), bodyMat)
    hood.position.set(0, 1.0, 0.62)
    root.add(hood)
    const cabin = new THREE.Mesh(rbox(1.34, 0.58, 1.15, 0.14), bodyMat)
    cabin.position.set(0, 1.32, -0.35)
    root.add(cabin)
    const windshield = new THREE.Mesh(rbox(1.2, 0.4, 0.06, 0.03), glassMat)
    windshield.position.set(0, 1.4, 0.24)
    windshield.rotation.x = -0.45
    root.add(windshield)
    const blower = new THREE.Mesh(rbox(0.5, 0.28, 0.5, 0.06), chrome)
    blower.position.set(0, 1.16, 0.78)
    root.add(blower)
    const scoop = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.22, 8), trimMat)
    scoop.position.set(0, 1.36, 0.72)
    root.add(scoop)
    for (const s of [-1, 1]) {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.9, 8), chrome)
      pipe.rotation.x = Math.PI / 2
      pipe.position.set(s * 0.86, 0.52, -0.1)
      root.add(pipe)
    }
    const duck = new THREE.Mesh(rbox(1.5, 0.08, 0.3, 0.04), accentMat)
    duck.position.set(0, 1.34, -1.16)
    root.add(duck)
  }

  if (spec.style === 'rally') {
    const roof = new THREE.Mesh(rbox(1.36, 0.14, 1.3, 0.06), bodyMat)
    roof.position.set(0, 1.92, -0.32)
    root.add(roof)
    const roofScoop = new THREE.Mesh(rbox(0.42, 0.14, 0.42, 0.04), trimMat)
    roofScoop.position.set(0, 2.02, -0.1)
    root.add(roofScoop)
    for (const s of [-1, 1]) {
      const fender = new THREE.Mesh(rbox(0.5, 0.26, 1.3, 0.12), bodyMat)
      fender.position.set(s * 0.98, 0.84, -0.98)
      root.add(fender)
      const mud = new THREE.Mesh(rbox(0.4, 0.3, 0.1, 0.02), trimMat)
      mud.position.set(s * 0.98, 0.45, -1.6)
      root.add(mud)
    }
  }

  const ventMat = new THREE.MeshStandardMaterial({ color: 0x0d1216, roughness: 0.6, metalness: 0.4 })
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.022, 0.52), ventMat)
      slat.position.set(s * 0.99, 0.58 + i * 0.07, 0.02)
      root.add(slat)
    }
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.2, 6), trimMat)
    stalk.position.set(s * 0.6, 1.52, 0.3)
    stalk.rotation.z = s * 0.7
    root.add(stalk)
    const mirror = new THREE.Mesh(rbox(0.17, 0.1, 0.05, 0.02), accentMat)
    mirror.position.set(s * 0.7, 1.58, 0.3)
    mirror.rotation.y = s * 0.25
    root.add(mirror)
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.02), ventMat)
    belt.position.set(s * 0.13, 1.3, -0.68)
    belt.rotation.x = -0.18
    root.add(belt)
  }
  const chin = new THREE.Mesh(rbox(0.16, 0.06, 0.05, 0.02), ventMat)
  chin.position.set(0, 1.63, -0.1)
  root.add(chin)
  const lineMat = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.7 })
  for (const s of [-1, 1]) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.04, 1.1), lineMat)
    seam.position.set(s * 0.78, 0.9, 0.55)
    root.add(seam)
  }

  const flames = new THREE.Group()
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x4ae8ff, transparent: true, opacity: 0.8, toneMapped: false })
  const flameInner = new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0.95, toneMapped: false })
  for (const s of [-1, 1]) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.0, 10, 1, true), flameMat)
    cone.rotation.x = -Math.PI / 2 - 0.3
    cone.position.set(s * 0.38, 1.02, -2.25)
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.5, 8, 1, true), flameInner)
    inner.rotation.x = -Math.PI / 2 - 0.3
    inner.position.set(s * 0.38, 1.04, -2.12)
    flames.add(cone, inner)
  }
  flames.visible = false
  root.add(flames)

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })

  return { root, wheels: { fl: fl.spin, fr: fr.spin, rl: rl.spin, rr: rr.spin }, flames, brakeMats, driverParts }
}
