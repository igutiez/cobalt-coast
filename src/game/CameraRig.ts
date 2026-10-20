import * as THREE from 'three'
import type { Kart } from './Kart.ts'
import type { Track } from './Track.ts'

const UP = new THREE.Vector3(0, 1, 0)

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera
  private readonly desired = new THREE.Vector3()
  private readonly lookAt = new THREE.Vector3()
  private readonly shakeOffset = new THREE.Vector3()
  private readonly smoothLook = new THREE.Vector3()
  private shake = 0
  private fov = 66
  private orbit = 0
  private intro = 0
  mobile = false
  heightBias = 0
  mode: 'chase' | 'cockpit' = 'chase'

  constructor(aspect: number) {
    try {
      const saved = Number(localStorage.getItem('cobalt-cam-height'))
      if (Number.isFinite(saved)) this.heightBias = THREE.MathUtils.clamp(saved, -1.5, 4)
    } catch {
      // Storage blocked: the default camera height applies.
    }
    this.camera = new THREE.PerspectiveCamera(66, aspect, 0.35, 9000)
    this.camera.position.set(0, 12, 26)
    this.smoothLook.set(0, 0, 0)
  }

  resize(aspect: number) {
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
  }

  nudgeHeight(delta: number) {
    this.heightBias = THREE.MathUtils.clamp(this.heightBias + delta, -1.5, 4)
    try {
      localStorage.setItem('cobalt-cam-height', String(this.heightBias))
    } catch {
      // Storage blocked: the adjustment lasts for this session.
    }
  }

  kick(amount = 1) {
    this.shake = Math.min(1.4, this.shake + amount)
  }

  beginIntro() {
    this.intro = 0
  }

  updateMenu(dt: number, target: THREE.Vector3, time: number) {
    this.orbit += dt * 0.16
    const r = 8.6 + Math.sin(time * 0.2) * 0.8
    const h = 4.0 + Math.sin(time * 0.31) * 0.5
    this.desired.set(target.x + Math.sin(this.orbit) * r, target.y + h, target.z + Math.cos(this.orbit) * r)
    const damp = 1 - Math.exp(-dt * 3.5)
    this.camera.position.lerp(this.desired, damp)
    this.smoothLook.lerp(target, 1 - Math.exp(-dt * 6))
    this.camera.lookAt(this.smoothLook.x, this.smoothLook.y + 0.9, this.smoothLook.z)
    this.fov += (46 - this.fov) * Math.min(1, dt * 3)
    this.camera.fov = this.fov
    this.camera.updateProjectionMatrix()
  }

  private updateCockpit(dt: number, kart: Kart) {
    const fwd = kart.forward
    const head = kart.pos.clone().addScaledVector(UP, 1.98).addScaledVector(fwd, 0.25)
    this.camera.position.lerp(head, 1 - Math.exp(-dt * 30))
    const driftYaw = -kart.driftAmount * 0.9
    const lookDir = fwd.clone().applyAxisAngle(UP, driftYaw)
    const look = kart.pos
      .clone()
      .addScaledVector(lookDir, 24)
      .addScaledVector(UP, 1.9 + this.heightBias * 0.25)
    this.smoothLook.lerp(look, 1 - Math.exp(-dt * 16))
    this.camera.lookAt(this.smoothLook)
    const roll = THREE.MathUtils.clamp(-kart.driftAmount * 0.75, -0.3, 0.3)
    this.camera.rotateZ(roll)
    this.fov += (78 - this.fov) * Math.min(1, dt * 5)
    this.camera.fov = this.fov
    this.camera.updateProjectionMatrix()
  }

  update(dt: number, kart: Kart, track: Track, countdown: number) {
    if (this.mode === 'cockpit' && countdown <= 0) {
      this.updateCockpit(dt, kart)
      return
    }
    const speedRatio = THREE.MathUtils.clamp(kart.speed / kart.spec.stats.maxSpeed, 0, 1.2)
    const fwd = kart.forward
    const right = kart.right
    const back = 7.6 + speedRatio * 2.6 + (this.mobile ? 0 : 0) + this.heightBias * 0.25
    const height = 3.6 + speedRatio * 0.35 + (this.mobile ? 0.1 : 0) + this.heightBias
    const driftOffset = THREE.MathUtils.clamp(kart.driftAmount, -1, 1) * 2.4

    this.desired
      .copy(kart.pos)
      .addScaledVector(fwd, -back)
      .addScaledVector(right, -driftOffset)
      .addScaledVector(UP, height)

    const groundY = track.heightAt(track.nearest(this.desired, kart.hint))
    this.desired.y = Math.max(this.desired.y, groundY + 2.6, kart.pos.y + 2.2)

    if (countdown > 0) {
      this.intro = Math.min(1, this.intro + dt * 0.32)
      const t = 1 - Math.pow(1 - this.intro, 3)
      const radius = THREE.MathUtils.lerp(9.5, 7.4, t)
      const height = THREE.MathUtils.lerp(6.2, 3.2, t) + this.heightBias
      this.camera.position
        .copy(kart.pos)
        .addScaledVector(fwd, -radius)
        .addScaledVector(right, THREE.MathUtils.lerp(1.6, 0, t))
        .addScaledVector(UP, height)
      this.smoothLook.copy(kart.pos).addScaledVector(fwd, 3).addScaledVector(UP, 1.1 + this.heightBias * 0.4)
      this.camera.lookAt(this.smoothLook)
      this.camera.fov = THREE.MathUtils.lerp(52, 60, t)
      this.camera.updateProjectionMatrix()
      return
    }

    const damp = 1 - Math.exp(-dt * (5.5 + speedRatio * 3))
    this.camera.position.lerp(this.desired, damp)
    const away = this.camera.position.clone().sub(kart.pos)
    const flat = Math.hypot(away.x, away.z)
    if (flat < 4.6) {
      const scale = 4.6 / Math.max(0.001, flat)
      this.camera.position.x = kart.pos.x + away.x * scale
      this.camera.position.z = kart.pos.z + away.z * scale
    }

    this.lookAt.copy(kart.pos).addScaledVector(fwd, 11 + speedRatio * 6).addScaledVector(UP, 1.5 + this.heightBias * 0.4)
    this.smoothLook.lerp(this.lookAt, 1 - Math.exp(-dt * 7))

    this.shake = Math.max(0, this.shake - dt * 2.2)
    const s = this.shake * this.shake
    this.shakeOffset.set(
      (Math.random() - 0.5) * s * 0.9,
      (Math.random() - 0.5) * s * 0.7,
      (Math.random() - 0.5) * s * 0.9,
    )

    this.camera.position.add(this.shakeOffset)
    this.camera.lookAt(this.smoothLook)

    const targetFov = (this.mobile ? 64 : 62) + speedRatio * 9 + (kart.boostTime > 0 ? 7 : 0)
    this.fov += (targetFov - this.fov) * Math.min(1, dt * 3)
    this.camera.fov = this.fov
    this.camera.updateProjectionMatrix()
  }
}
