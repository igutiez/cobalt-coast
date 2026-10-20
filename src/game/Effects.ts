import * as THREE from 'three'
import { softDotTexture, smokeTexture } from './textures.ts'

interface Particle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  life: number
  max: number
  size: number
  color: THREE.Color
  gravity: number
  drag: number
}

class ParticlePool {
  readonly points: THREE.Points
  private readonly items: Particle[] = []
  private readonly max: number
  private readonly posAttr: THREE.BufferAttribute
  private readonly colorAttr: THREE.BufferAttribute
  private readonly alphaAttr: THREE.BufferAttribute
  private readonly sizeAttr: THREE.BufferAttribute
  private cursor = 0

  constructor(max: number, texture: THREE.Texture, additive: boolean) {
    this.max = max
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(max * 3)
    const colors = new Float32Array(max * 3)
    const alphas = new Float32Array(max)
    const sizes = new Float32Array(max)
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    this.posAttr = geo.attributes.position as THREE.BufferAttribute
    this.colorAttr = geo.attributes.aColor as THREE.BufferAttribute
    this.alphaAttr = geo.attributes.aAlpha as THREE.BufferAttribute
    this.sizeAttr = geo.attributes.aSize as THREE.BufferAttribute
    geo.setDrawRange(0, 0)
    const mat = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: texture } },
      transparent: true,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aColor;
        attribute float aAlpha;
        attribute float aSize;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp(aSize * (420.0 / max(0.001, -mv.z)), 1.0, 120.0);
          vColor = aColor;
          vAlpha = aAlpha;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vec4 t = texture2D(uMap, gl_PointCoord);
          float a = t.a * vAlpha;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor, a);
        }
      `,
    })
    this.points = new THREE.Points(geo, mat)
    this.points.frustumCulled = false
    this.points.renderOrder = 3
    for (let i = 0; i < max; i++) {
      this.items.push({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        max: 1,
        size: 1,
        color: new THREE.Color(1, 1, 1),
        gravity: 0,
        drag: 0.5,
      })
    }
  }

  spawn(
    pos: THREE.Vector3,
    vel: THREE.Vector3,
    life: number,
    size: number,
    color: THREE.Color,
    gravity = 0,
    drag = 0.8,
  ) {
    const p = this.items[this.cursor]
    this.cursor = (this.cursor + 1) % this.max
    p.pos.copy(pos)
    p.vel.copy(vel)
    p.life = life
    p.max = life
    p.size = size
    p.color.copy(color)
    p.gravity = gravity
    p.drag = drag
  }

  update(dt: number) {
    let count = 0
    for (let i = 0; i < this.max; i++) {
      const p = this.items[i]
      if (p.life <= 0) continue
      p.life -= dt
      if (p.life <= 0) continue
      p.vel.y -= p.gravity * dt
      p.vel.multiplyScalar(1 - p.drag * dt)
      p.pos.addScaledVector(p.vel, dt)
      const t = p.life / p.max
      this.posAttr.setXYZ(count, p.pos.x, p.pos.y, p.pos.z)
      this.colorAttr.setXYZ(count, p.color.r, p.color.g, p.color.b)
      this.alphaAttr.setX(count, Math.min(1, t * 1.6))
      this.sizeAttr.setX(count, p.size * (1.6 - t * 0.6))
      count++
    }
    this.posAttr.needsUpdate = true
    this.colorAttr.needsUpdate = true
    this.alphaAttr.needsUpdate = true
    this.sizeAttr.needsUpdate = true
    this.points.geometry.setDrawRange(0, count)
  }
}

const DUST = new THREE.Color(0xe2c79a)
const SMOKE = new THREE.Color(0xdfe6ea)
const SPARK = new THREE.Color(0xffb347)
const WATER = new THREE.Color(0xd9f6ff)

export class Effects {
  readonly group = new THREE.Group()
  private readonly smoke: ParticlePool
  private readonly glow: ParticlePool
  private readonly skids: THREE.InstancedMesh
  private readonly skidFade: Float32Array
  private readonly skidCount = 220
  private skidCursor = 0
  private skidClock = 0
  private time = 0

  constructor() {
    this.smoke = new ParticlePool(420, smokeTexture(), false)
    this.glow = new ParticlePool(360, softDotTexture(), true)
    this.group.add(this.smoke.points, this.glow.points)

    const geo = new THREE.PlaneGeometry(0.42, 1.05)
    geo.rotateX(-Math.PI / 2)
    const fade = new Float32Array(this.skidCount)
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      uniforms: { uOpacity: { value: 0.42 } },
      vertexShader: /* glsl */ `
        attribute float aFade;
        varying float vFade;
        void main() {
          vFade = aFade;
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying float vFade;
        void main() {
          if (vFade <= 0.01) discard;
          gl_FragColor = vec4(0.045, 0.04, 0.045, uOpacity * vFade);
        }
      `,
    })
    geo.setAttribute('aFade', new THREE.InstancedBufferAttribute(fade, 1))
    this.skids = new THREE.InstancedMesh(geo, mat, this.skidCount)
    this.skids.frustumCulled = false
    this.skids.renderOrder = 2
    const m = new THREE.Matrix4().makeScale(0, 0, 0)
    for (let i = 0; i < this.skidCount; i++) this.skids.setMatrixAt(i, m)
    this.skidFade = fade
    this.group.add(this.skids)
  }

  dust(pos: THREE.Vector3, dir: THREE.Vector3, amount = 1) {
    for (let i = 0; i < amount; i++) {
      const v = dir
        .clone()
        .multiplyScalar(2 + Math.random() * 3)
        .add(new THREE.Vector3((Math.random() - 0.5) * 3, 1 + Math.random() * 2, (Math.random() - 0.5) * 3))
      this.smoke.spawn(
        pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.6, 0.1, (Math.random() - 0.5) * 1.6)),
        v,
        0.6 + Math.random() * 0.5,
        0.45 + Math.random() * 0.35,
        DUST,
        -0.4,
        1.6,
      )
    }
  }

  spray(pos: THREE.Vector3) {
    for (let i = 0; i < 2; i++) {
      this.smoke.spawn(
        pos.clone(),
        new THREE.Vector3((Math.random() - 0.5) * 4, 2 + Math.random() * 3, (Math.random() - 0.5) * 4),
        0.4,
        0.7,
        WATER,
        9,
        1.2,
      )
    }
  }

  smokePuff(pos: THREE.Vector3, amount = 3) {
    for (let i = 0; i < amount; i++) {
      this.smoke.spawn(
        pos.clone(),
        new THREE.Vector3((Math.random() - 0.5) * 2, 1 + Math.random(), (Math.random() - 0.5) * 2),
        0.8 + Math.random() * 0.4,
        0.5 + Math.random() * 0.4,
        SMOKE,
        -0.2,
        1.4,
      )
    }
  }

  sparks(pos: THREE.Vector3, color = SPARK, count = 14) {
    for (let i = 0; i < count; i++) {
      this.glow.spawn(
        pos.clone(),
        new THREE.Vector3((Math.random() - 0.5) * 12, Math.random() * 7, (Math.random() - 0.5) * 12),
        0.4 + Math.random() * 0.5,
        0.16 + Math.random() * 0.14,
        color,
        12,
        0.6,
      )
    }
  }

  explosion(pos: THREE.Vector3) {
    this.sparks(pos, new THREE.Color(0xffd166), 26)
    this.sparks(pos, new THREE.Color(0xff5b2e), 18)
    this.smokePuff(pos, 12)
  }

  confetti(pos: THREE.Vector3) {
    for (let i = 0; i < 60; i++) {
      const c = new THREE.Color().setHSL(Math.random(), 0.85, 0.6)
      this.glow.spawn(
        pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 8, Math.random() * 4, (Math.random() - 0.5) * 8)),
        new THREE.Vector3((Math.random() - 0.5) * 10, 6 + Math.random() * 8, (Math.random() - 0.5) * 10),
        2 + Math.random() * 1.6,
        0.4,
        c,
        4,
        0.5,
      )
    }
  }

  skid(pos: THREE.Vector3, yaw: number, dt: number) {
    this.skidClock += dt
    if (this.skidClock < 0.035) return
    this.skidClock = 0
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0))
    const m = new THREE.Matrix4().compose(pos, q, new THREE.Vector3(1, 1, 1))
    this.skids.setMatrixAt(this.skidCursor, m)
    this.skidFade[this.skidCursor] = 1
    this.skids.geometry.attributes.aFade.needsUpdate = true
    this.skids.instanceMatrix.needsUpdate = true
    this.skidCursor = (this.skidCursor + 1) % this.skidCount
  }

  update(dt: number) {
    this.time += dt
    this.smoke.update(dt)
    this.glow.update(dt)
    let dirty = false
    for (let i = 0; i < this.skidCount; i++) {
      if (this.skidFade[i] > 0) {
        this.skidFade[i] = Math.max(0, this.skidFade[i] - dt * 0.045)
        dirty = true
      }
    }
    if (dirty) this.skids.geometry.attributes.aFade.needsUpdate = true
  }
}
