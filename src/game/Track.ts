import * as THREE from 'three'
import { asphaltNormal, bannerTexture, barrierTexture, checkerTexture, guardrailTexture, roadTexture, sandTexture } from './textures.ts'
import type { TrackSpec } from './tracks.ts'

export interface TrackNode {
  pos: THREE.Vector3
  tan: THREE.Vector3
  side: THREE.Vector3
  bank: number
  curv: number
  s: number
}

export interface NearestHit {
  index: number
  lateral: number
  forward: number
  node: TrackNode
}

const UP = new THREE.Vector3(0, 1, 0)

export function forwardFromYaw(yaw: number, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(Math.sin(yaw), 0, Math.cos(yaw))
}

export function rightFromYaw(yaw: number, out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(Math.cos(yaw), 0, -Math.sin(yaw))
}

export class Track {
  readonly group = new THREE.Group()
  readonly nodes: TrackNode[] = []
  readonly halfWidth: number
  readonly spec: TrackSpec
  readonly length: number
  readonly curve: THREE.CatmullRomCurve3
  readonly itemSpots: { index: number; lateral: number }[] = []
  private lightMat!: THREE.MeshStandardMaterial
  private readonly count: number

  constructor(spec: TrackSpec) {
    this.spec = spec
    this.halfWidth = spec.width / 2
    const pts: THREE.Vector3[] = []
    const R = spec.radius
    const A = spec.a
    const B = spec.b
    const C = spec.c
    const steps = 34
    for (let i = 0; i < steps; i++) {
      const th = (i / steps) * Math.PI * 2
      const r = R + A * Math.sin(spec.h1 * th) + B * Math.cos(spec.h2 * th) + C * Math.sin(spec.h3 * th + 0.6)
      const y = 0.8 + spec.elevA * Math.sin(2 * th + 0.7) + spec.elevB * Math.sin(4 * th + 1.9)
      pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r))
    }
    this.curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal', 0.5)
    this.count = 1400
    const total = this.curve.getLength()
    this.length = total

    for (let i = 0; i < this.count; i++) {
      const t = i / this.count
      const pos = this.curve.getPointAt(t)
      const tan = this.curve.getTangentAt(t).normalize()
      tan.y = 0
      tan.normalize()
      const side = new THREE.Vector3().crossVectors(UP, tan).normalize()
      this.nodes.push({ pos, tan, side, bank: 0, curv: 0, s: t * total })
    }
    // signed curvature, then smoothed bank
    const raw: number[] = []
    for (let i = 0; i < this.count; i++) {
      const a = this.nodes[i]
      const b = this.nodes[(i + 1) % this.count]
      const cross = new THREE.Vector3().crossVectors(a.tan, b.tan).y
      const dot = THREE.MathUtils.clamp(a.tan.dot(b.tan), -1, 1)
      const ds = Math.max(0.001, (b.s - a.s + total) % total)
      raw.push(Math.atan2(cross, dot) / ds)
    }
    const blurred: number[] = []
    for (let i = 0; i < this.count; i++) {
      let sum = 0
      for (let k = -14; k <= 14; k++) sum += raw[(i + k + this.count) % this.count]
      blurred.push(sum / 29)
    }
    for (let i = 0; i < this.count; i++) {
      const n = this.nodes[i]
      n.curv = blurred[i]
      n.bank = THREE.MathUtils.clamp(blurred[i] * spec.bankScale, -0.15, 0.15)
    }
    this.buildMeshes()
    this.placeItems()
  }

  get sampleCount(): number {
    return this.count
  }

  sample(i: number): TrackNode {
    return this.nodes[((i % this.count) + this.count) % this.count]
  }

  nearest(pos: THREE.Vector3, hint = -1): NearestHit {
    let best = hint
    if (hint >= 0) {
      let bestD = Infinity
      for (let k = -46; k <= 46; k++) {
        const i = (hint + k + this.count) % this.count
        const d = this.nodes[i].pos.distanceToSquared(pos)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
    } else {
      let bestD = Infinity
      for (let i = 0; i < this.count; i++) {
        const d = this.nodes[i].pos.distanceToSquared(pos)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
    }
    const node = this.nodes[best]
    const rel = new THREE.Vector3().subVectors(pos, node.pos)
    return {
      index: best,
      lateral: rel.dot(node.side),
      forward: rel.dot(node.tan),
      node,
    }
  }

  heightAt(hit: NearestHit): number {
    return hit.node.pos.y - hit.lateral * Math.sin(hit.node.bank)
  }

  progress(index: number, lap: number): number {
    return lap + index / this.count
  }

  private edge(node: TrackNode, lateral: number, lift = 0): THREE.Vector3 {
    const cos = Math.cos(node.bank)
    const sin = Math.sin(node.bank)
    return new THREE.Vector3()
      .copy(node.pos)
      .addScaledVector(node.side, lateral * cos)
      .addScaledVector(UP, -lateral * sin + lift)
  }

  private buildMeshes() {
    const road = new THREE.Mesh(
      this.buildRibbon(-this.halfWidth, this.halfWidth, 0, 0.02),
      new THREE.MeshStandardMaterial({
        map: roadTexture(),
        normalMap: asphaltNormal(),
        normalScale: new THREE.Vector2(0.18, 0.18),
        roughness: 0.93,
        metalness: 0.0,
        color: 0xffffff,
      }),
    )
    road.receiveShadow = true
    road.name = 'road'
    this.group.add(road)

    const curbMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.02 })
    const curbL = new THREE.Mesh(this.buildRibbon(-this.halfWidth - 1.3, -this.halfWidth, 0.06, 0.02, true), curbMat)
    const curbR = new THREE.Mesh(this.buildRibbon(this.halfWidth, this.halfWidth + 1.3, 0.06, 0.02, true), curbMat)
    curbL.receiveShadow = curbR.receiveShadow = true
    this.group.add(curbL, curbR)

    const shoulderTex = sandTexture().clone()
    shoulderTex.repeat.set(1, 1)
    shoulderTex.needsUpdate = true
    const shoulderMat = new THREE.MeshStandardMaterial({
      map: shoulderTex,
      color: 0xd8b98a,
      roughness: 1,
      metalness: 0,
    })
    const shoulderL = new THREE.Mesh(this.buildRibbon(-this.halfWidth - 4.6, -this.halfWidth - 1.3, -0.1, 0.0, false, 0.06), shoulderMat)
    const shoulderR = new THREE.Mesh(this.buildRibbon(this.halfWidth + 1.3, this.halfWidth + 4.6, -0.1, 0.0, false, 0.06), shoulderMat)
    shoulderL.receiveShadow = shoulderR.receiveShadow = true
    this.group.add(shoulderL, shoulderR)

    this.buildMarkers()
    this.buildRoadside()
    this.buildStartGate()
  }

  private buildRibbon(
    latA: number,
    latB: number,
    drop: number,
    lift: number,
    stripes = false,
    uvScale = 0.22,
  ): THREE.BufferGeometry {
    const n = this.count
    const pos = new Float32Array((n + 1) * 2 * 3)
    const nor = new Float32Array((n + 1) * 2 * 3)
    const uv = new Float32Array((n + 1) * 2 * 2)
    const col = stripes ? new Float32Array((n + 1) * 2 * 3) : null
    const idx: number[] = []
    for (let i = 0; i <= n; i++) {
      const node = this.sample(i)
      const a = this.edge(node, latA, lift)
      const b = this.edge(node, latB, lift)
      a.y -= drop
      b.y -= drop
      const o = i * 6
      pos[o] = a.x
      pos[o + 1] = a.y
      pos[o + 2] = a.z
      pos[o + 3] = b.x
      pos[o + 4] = b.y
      pos[o + 5] = b.z
      const len = Math.hypot(b.x - a.x, b.z - a.z)
      const nx = -(b.z - a.z) / len
      const nz = (b.x - a.x) / len
      nor[o] = nx
      nor[o + 1] = 1
      nor[o + 2] = nz
      nor[o + 3] = nx
      nor[o + 4] = 1
      nor[o + 5] = nz
      const vo = i * 4
      uv[vo] = 0
      uv[vo + 1] = node.s * uvScale
      uv[vo + 2] = 1
      uv[vo + 3] = node.s * uvScale
      if (col) {
        const on = Math.floor(node.s / 4) % 2 === 0
        const c = on ? [0.82, 0.1, 0.11] : [0.95, 0.95, 0.95]
        col[i * 6] = c[0]
        col[i * 6 + 1] = c[1]
        col[i * 6 + 2] = c[2]
        col[i * 6 + 3] = c[0]
        col[i * 6 + 4] = c[1]
        col[i * 6 + 5] = c[2]
      }
      if (i < n) {
        const k = i * 2
        idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    geo.setIndex(idx)
    return geo
  }

  private buildRoadside() {
    const rails = new THREE.MeshStandardMaterial({
      map: guardrailTexture(),
      roughness: 0.55,
      metalness: 0.4,
      side: THREE.DoubleSide,
    })
    for (const side of [-1, 1]) {
      for (const run of this.cornerRuns()) {
        this.group.add(new THREE.Mesh(this.buildRailGeometry(side * (this.halfWidth + 5.4), 0.8, run[0], run[1]), rails))
      }
    }

    const boardMat = new THREE.MeshStandardMaterial({ map: barrierTexture(), roughness: 0.7, metalness: 0.05 })
    const boardGeo = new THREE.PlaneGeometry(2.6, 0.9)
    const step = Math.max(6, Math.round(this.count / 26))
    let boards = 0
    for (let i = 20; i < this.count; i += step) {
      const node = this.nodes[i]
      if (Math.abs(node.curv) < 0.012 || boards > 13) continue
      for (const side of [-1, 1]) {
        const board = new THREE.Mesh(boardGeo, boardMat)
        const p = this.edge(node, side * (this.halfWidth + 3.1), 0.55)
        board.position.copy(p)
        board.rotation.y = Math.atan2(node.side.x, node.side.z) + (side < 0 ? Math.PI : 0)
        this.group.add(board)
      }
      boards++
    }

    const bodyGeo = new THREE.CylinderGeometry(0.15, 0.19, 1.0, 6)
    const headGeo = new THREE.SphereGeometry(0.15, 6, 5)
    const bodyMat = new THREE.MeshStandardMaterial({ roughness: 0.85 })
    const headMat = new THREE.MeshStandardMaterial({ color: 0xe8b48a, roughness: 0.8 })
    const slots: { pos: THREE.Vector3; yaw: number }[] = []
    let clusters = 0
    for (let i = 30; i < this.count; i += Math.max(20, Math.round(this.count / 9))) {
      const node = this.nodes[i]
      if (Math.abs(node.curv) < 0.011 || clusters > 8) continue
      for (let k = 0; k < 12; k++) {
        const t = this.nodes[(i + k) % this.count]
        const side = k % 2 === 0 ? 1 : -1
        const p = this.edge(t, side * (this.halfWidth + 6.4 + (k % 4) * 0.5), 0.52)
        slots.push({ pos: p, yaw: Math.atan2(t.tan.x, t.tan.z) })
      }
      clusters++
    }
    if (slots.length > 0) {
      const bodies = new THREE.InstancedMesh(bodyGeo, bodyMat, slots.length)
      const heads = new THREE.InstancedMesh(headGeo, headMat, slots.length)
      const m = new THREE.Matrix4()
      const q = new THREE.Quaternion()
      const up = new THREE.Vector3(0, 1, 0)
      const one = new THREE.Vector3(1, 1, 1)
      const color = new THREE.Color()
      slots.forEach((slot, k) => {
        q.setFromAxisAngle(up, slot.yaw)
        m.compose(slot.pos, q, one)
        bodies.setMatrixAt(k, m)
        bodies.setColorAt(k, color.setHSL(0.02 + Math.random() * 0.62, 0.35 + Math.random() * 0.3, 0.38 + Math.random() * 0.25))
        const head = slot.pos.clone()
        head.y += 0.62
        m.compose(head, q, one)
        heads.setMatrixAt(k, m)
      })
      bodies.instanceColor!.needsUpdate = true
      this.group.add(bodies, heads)
    }
  }

  private cornerRuns(): [number, number][] {
    const threshold = 0.0095
    const runs: [number, number][] = []
    let start = -1
    for (let i = 0; i < this.count; i++) {
      const tight = Math.abs(this.nodes[i].curv) > threshold
      if (tight && start < 0) start = i
      if (!tight && start >= 0) {
        if (i - start > 6) runs.push([Math.max(0, start - 6), i + 6])
        start = -1
      }
    }
    if (start >= 0 && this.count - start > 6) runs.push([Math.max(0, start - 6), this.count])
    return runs.slice(0, 10)
  }

  private buildRailGeometry(lat: number, height: number, from: number, to: number): THREE.BufferGeometry {
    const n = to - from
    const pos = new Float32Array((n + 1) * 2 * 3)
    const uv = new Float32Array((n + 1) * 2 * 2)
    const idx: number[] = []
    for (let i = 0; i <= n; i++) {
      const node = this.sample(from + i)
      const base = this.edge(node, lat, 0.04)
      const o = i * 6
      pos[o] = base.x
      pos[o + 1] = base.y
      pos[o + 2] = base.z
      pos[o + 3] = base.x
      pos[o + 4] = base.y + height
      pos[o + 5] = base.z
      const u = (from + i) * 0.55
      uv[i * 4] = u
      uv[i * 4 + 1] = 0
      uv[i * 4 + 2] = u
      uv[i * 4 + 3] = 1
      if (i < n) {
        const k = i * 2
        idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    return geo
  }

  private buildMarkers() {
    const step = 15
    const count = Math.max(3, Math.floor(this.length / step))
    const postGeo = new THREE.BoxGeometry(0.14, 0.8, 0.14)
    const capGeo = new THREE.BoxGeometry(0.17, 0.18, 0.17)
    const postMat = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.6, metalness: 0.05 })
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xe0442a,
      emissive: 0x5a120a,
      emissiveIntensity: 0.5,
      roughness: 0.35,
    })
    const posts = new THREE.InstancedMesh(postGeo, postMat, count * 2)
    const caps = new THREE.InstancedMesh(capGeo, capMat, count * 2)
    const matrix = new THREE.Matrix4()
    const quat = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    const one = new THREE.Vector3(1, 1, 1)
    let k = 0
    for (let i = 0; i < count; i++) {
      const node = this.sample(Math.round((i / count) * this.count))
      quat.setFromAxisAngle(up, Math.atan2(node.tan.x, node.tan.z))
      for (const side of [-1, 1]) {
        const base = this.edge(node, side * (this.halfWidth + 2.9), 0)
        const post = base.clone()
        post.y += 0.4
        matrix.compose(post, quat, one)
        posts.setMatrixAt(k, matrix)
        const cap = base.clone()
        cap.y += 0.86
        matrix.compose(cap, quat, one)
        caps.setMatrixAt(k, matrix)
        k++
      }
    }
    this.group.add(posts, caps)
  }

  private buildStartGate() {
    const node = this.sample(4)
    const gate = new THREE.Group()

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x3d5468, roughness: 0.45, metalness: 0.55 })
    const pillarGeo = new THREE.BoxGeometry(0.9, 8.4, 0.9)
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(pillarGeo, pillarMat)
      p.position.copy(this.edge(node, s * (this.halfWidth + 2.2), 4.2))
      p.castShadow = true
      gate.add(p)
    }
    const yaw = Math.atan2(node.tan.x, node.tan.z)
    const beam = new THREE.Mesh(new THREE.BoxGeometry((this.halfWidth + 2.7) * 2, 2.6, 0.7), pillarMat)
    beam.position.copy(this.edge(node, 0, 7.4))
    beam.rotation.y = yaw
    beam.castShadow = true
    gate.add(beam)

    const bannerGeo = new THREE.PlaneGeometry((this.halfWidth + 2.7) * 2 - 1.4, 2.2)
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTexture(this.spec.name, this.spec.tagline), toneMapped: false })
    for (const s of [-1, 1]) {
      const banner = new THREE.Mesh(bannerGeo, bannerMat)
      banner.position.copy(beam.position).addScaledVector(node.tan, s * 0.37)
      banner.rotation.y = yaw + (s < 0 ? Math.PI : 0)
      gate.add(banner)
    }

    this.lightMat = new THREE.MeshStandardMaterial({
      color: 0x2a0a0a,
      emissive: 0xff2a2a,
      emissiveIntensity: 1.4,
      roughness: 0.4,
    })
    const housing = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.5), pillarMat)
    housing.position.copy(beam.position).addScaledVector(node.tan, 0.5).addScaledVector(UP, -1.9)
    housing.rotation.y = yaw
    gate.add(housing)
    for (let i = 0; i < 3; i++) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 10), this.lightMat)
      lamp.position.copy(housing.position).addScaledVector(node.tan, 0.42).addScaledVector(node.side, (i - 1) * 1.0)
      gate.add(lamp)
    }

    const checkGeo = new THREE.PlaneGeometry(this.halfWidth * 2, 3.2)
    checkGeo.rotateX(-Math.PI / 2)
    const check = new THREE.Mesh(
      checkGeo,
      new THREE.MeshStandardMaterial({ map: checkerTexture(), roughness: 0.6, metalness: 0.05 }),
    )
    check.rotation.y = yaw
    check.position.copy(this.edge(node, 0, 0.05))
    check.receiveShadow = true
    gate.add(check)

    this.group.add(gate)
  }

  private placeItems() {
    const step = Math.round(this.count / 13)
    for (let k = 0; k < 13; k++) {
      const index = (k * step + 60) % this.count
      this.itemSpots.push({ index, lateral: k % 2 === 0 ? -3.6 : 3.6 })
    }
  }

  gridSlot(slot: number): { pos: THREE.Vector3; yaw: number } {
    const row = Math.floor(slot / 2)
    const col = slot % 2
    const index = (this.count - 10 - row * 12 + this.count) % this.count
    const node = this.sample(index)
    const lateral = (col === 0 ? -3.2 : 3.2) + (row % 2 === 0 ? -0.8 : 0.8)
    const pos = this.edge(node, lateral, 0.02)
    const yaw = Math.atan2(node.tan.x, node.tan.z)
    return { pos, yaw }
  }

  dispose() {
    this.group.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry?.dispose()
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) material?.dispose()
    })
  }

  setStartLights(color: 'red' | 'green' | 'off') {
    if (!this.lightMat) return
    if (color === 'off') this.lightMat.emissiveIntensity = 0.05
    else {
      this.lightMat.emissive.setHex(color === 'green' ? 0x2aff88 : 0xff2a2a)
      this.lightMat.emissiveIntensity = color === 'green' ? 2.4 : 1.6
    }
  }

  startBanner(index = 0): THREE.Vector3 {
    return this.sample(index).pos
  }
}
