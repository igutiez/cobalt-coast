import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { palmFrondTexture, sandTexture } from './textures.ts'
import type { Track, TrackNode } from './Track.ts'
import type { TrackTheme } from './tracks.ts'

function hash2(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

function fbm(x: number, y: number): number {
  let n = 0
  let amp = 0.5
  let fx = x
  let fy = y
  for (let i = 0; i < 4; i++) {
    n += valueNoise(fx, fy) * amp
    fx *= 2.03
    fy *= 2.03
    amp *= 0.5
  }
  return n
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

export class World {
  readonly group = new THREE.Group()
  readonly sunLight: THREE.DirectionalLight
  readonly sunDir = new THREE.Vector3()
  readonly sky: THREE.Mesh
  private readonly waterMat: THREE.ShaderMaterial
  private readonly trackPointGrid: TrackNode[] = []
  private readonly terrain: THREE.Mesh
  private readonly theme: TrackTheme
  private readonly shoreRadius = 405

  constructor(track: Track, renderer: THREE.WebGLRenderer, scene: THREE.Scene, theme: TrackTheme) {
    this.theme = theme
    const step = Math.max(1, Math.floor(track.nodes.length / 220))
    for (let i = 0; i < track.nodes.length; i += step) this.trackPointGrid.push(track.nodes[i])

    const sun = new THREE.Vector3().setFromSphericalCoords(
      1,
      THREE.MathUtils.degToRad(36),
      THREE.MathUtils.degToRad(248),
    )
    this.sunDir.copy(sun)
    this.sky = this.buildSky()
    this.group.add(this.sky)

    this.terrain = this.buildTerrain()
    this.group.add(this.terrain)

    this.waterMat = this.buildWater()
    const water = new THREE.Mesh(new THREE.PlaneGeometry(7000, 7000, 1, 1), this.waterMat)
    water.rotation.x = -Math.PI / 2
    water.position.y = -1.6
    this.group.add(water)

    this.buildPalms()
    this.buildRocks()
    this.buildBeachProps()
    this.buildIslands()
    this.buildTrackProps(track)
    this.buildGrandstand(track)
    this.buildBushes()

    const hemi = new THREE.HemisphereLight(0xe6eef8, this.theme.ambient, 0.32)
    const ambient = new THREE.AmbientLight(0xfff1e0, 0.62)
    this.group.add(hemi, ambient)

    this.sunLight = new THREE.DirectionalLight(this.theme.sunLight, 3.0)
    this.sunLight.position.copy(this.sunDir).multiplyScalar(180)
    this.sunLight.castShadow = true
    this.sunLight.shadow.mapSize.set(2048, 2048)
    this.sunLight.shadow.camera.near = 20
    this.sunLight.shadow.camera.far = 420
    const sc = this.sunLight.shadow.camera as THREE.OrthographicCamera
    sc.left = -58
    sc.right = 58
    sc.top = 58
    sc.bottom = -58
    sc.updateProjectionMatrix()
    this.sunLight.shadow.bias = -0.0004
    this.sunLight.shadow.normalBias = 0.35
    this.group.add(this.sunLight)
    this.group.add(this.sunLight.target)

    scene.environment = this.buildEnvironment(renderer)
    scene.environmentIntensity = 0.12
    scene.fog = new THREE.FogExp2(this.theme.fog, 0.00011)
  }

  private buildSky(): THREE.Mesh {
    const uniforms = {
      uTop: { value: new THREE.Color(this.theme.skyTop).convertSRGBToLinear() },
      uHorizon: { value: new THREE.Color(this.theme.skyHorizon).convertSRGBToLinear() },
      uSun: { value: this.sunDir.clone() },
      uSunColor: { value: new THREE.Color(this.theme.sunColor).convertSRGBToLinear() },
      uBelow: { value: new THREE.Color(0x123243).convertSRGBToLinear() },
    }
    const mat = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        uniform vec3 uSun;
        uniform vec3 uSunColor;
        uniform vec3 uBelow;
        varying vec3 vWorld;
        void main() {
          vec3 dir = normalize(vWorld - cameraPosition);
          float y = dir.y;
          vec3 col = mix(uHorizon, uTop, pow(clamp(y, 0.0, 1.0), 0.5));
          float sun = max(dot(dir, normalize(uSun)), 0.0);
          float disc = smoothstep(0.9992, 0.9996, sun);
          float glow = pow(sun, 14.0) * 0.18 + pow(sun, 140.0) * 0.9;
          col += uSunColor * (disc * 9.0 + glow);
          col = mix(col, uBelow, smoothstep(0.0, -0.12, y));
          col = mix(col, uHorizon * 1.05, smoothstep(0.07, -0.01, y) * 0.75);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 20), mat)
    mesh.frustumCulled = false
    return mesh
  }

  private buildEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
    const pmrem = new THREE.PMREMGenerator(renderer)
    const scene = new THREE.Scene()
    const dome = this.buildSky()
    dome.scale.setScalar(0.35)
    scene.add(dome)
    const rt = pmrem.fromScene(scene, 0, 1, 10000)
    pmrem.dispose()
    return rt.texture
  }

  private terrainHeight(x: number, z: number, near: { d: number; node: TrackNode; lateral: number }): number {
    const d = Math.hypot(x, z)
    const shore = this.shoreRadius + (fbm(x * 0.0035 + 11, z * 0.0035 - 7) - 0.5) * 90
    const inland = smoothstep(shore + 30, shore - 120, d)
    const dunes = (fbm(x * 0.014 + 3, z * 0.014 - 9) - 0.35) * 11
    const duneFade = smoothstep(shore - 130, shore - 250, d)
    let h = THREE.MathUtils.lerp(-9, 1.3, inland) + dunes * duneFade * inland
    const flat = smoothstep(22, 64, near.d)
    const lat = THREE.MathUtils.clamp(near.lateral, -7, 7)
    const apron = near.node.pos.y - lat * Math.sin(near.node.bank) - 0.18
    h = THREE.MathUtils.lerp(apron, h, flat)
    return h
  }

  private nearestTrack(x: number, z: number): { d: number; node: TrackNode; lateral: number } {
    let best = Infinity
    let node = this.trackPointGrid[0]
    for (const p of this.trackPointGrid) {
      const dx = x - p.pos.x
      const dz = z - p.pos.z
      const d = dx * dx + dz * dz
      if (d < best) {
        best = d
        node = p
      }
    }
    const lateral = (x - node.pos.x) * node.side.x + (z - node.pos.z) * node.side.z
    return { d: Math.sqrt(best), node, lateral }
  }

  private buildTerrain(): THREE.Mesh {
    const size = 1500
    const seg = 200
    const geo = new THREE.PlaneGeometry(size, size, seg, seg)
    geo.rotateX(-Math.PI / 2)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    const cWet = new THREE.Color(this.theme.sandWet)
    const cDry = new THREE.Color(this.theme.sandDry)
    const cHigh = new THREE.Color(this.theme.sandHigh)
    const cUnder = new THREE.Color(0x6f5a3d)
    const tmp = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const near = this.nearestTrack(x, z)
      const h = this.terrainHeight(x, z, near)
      pos.setY(i, h)
      const wet = smoothstep(0.9, -0.6, h)
      const high = smoothstep(2.6, 7, h)
      tmp.copy(cDry).lerp(cHigh, high).lerp(cWet, wet * 0.85)
      if (h < -1.2) tmp.lerp(cUnder, smoothstep(-1.2, -4, h))
      const n = 0.92 + hash2(x * 0.3, z * 0.3) * 0.16
      colors[i * 3] = tmp.r * n
      colors[i * 3 + 1] = tmp.g * n
      colors[i * 3 + 2] = tmp.b * n
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    const sand = sandTexture()
    const mat = new THREE.MeshStandardMaterial({
      map: sand,
      vertexColors: true,
      roughness: 0.94,
      metalness: 0,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.receiveShadow = true
    mesh.name = 'terrain'
    return mesh
  }

  private buildWater(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSun: { value: this.sunDir.clone() },
        uDeep: { value: new THREE.Color(this.theme.waterDeep) },
        uShallow: { value: new THREE.Color(this.theme.waterShallow) },
        uSky: { value: new THREE.Color(this.theme.waterSky) },
        uShore: { value: this.shoreRadius },
        uFog: { value: new THREE.Color(this.theme.fog).convertSRGBToLinear() },
      },
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorld = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        uniform float uTime;
        uniform vec3 uSun;
        uniform vec3 uDeep;
        uniform vec3 uShallow;
        uniform vec3 uSky;
        uniform float uShore;
        uniform vec3 uFog;
        varying vec3 vWorld;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          vec2 u = f*f*(3.0-2.0*f);
          return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
        }
        float wave(vec2 p, vec2 dir, float freq, float speed){
          return sin(dot(p, dir) * freq + uTime * speed);
        }
        float height(vec2 p){
          float h = 0.0;
          h += wave(p, normalize(vec2(1.0, 0.4)), 0.09, 1.1) * 0.55;
          h += wave(p, normalize(vec2(-0.5, 1.0)), 0.15, 1.6) * 0.32;
          h += wave(p, normalize(vec2(0.8, -0.8)), 0.31, 2.3) * 0.16;
          h += (noise(p * 0.22 + uTime * 0.05) - 0.5) * 0.28;
          return h;
        }

        void main() {
          vec2 p = vWorld.xz;
          float e = 0.6;
          float h0 = height(p);
          float hx = height(p + vec2(e, 0.0));
          float hz = height(p + vec2(0.0, e));
          vec3 n = normalize(vec3((h0 - hx) * 1.6, 1.0, (h0 - hz) * 1.6));

          vec3 viewDir = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(viewDir, n), 0.0), 4.0);
          fres = mix(0.06, 1.0, fres);

          float dist = length(p);
          float shoreWobble = 30.0 * (noise(p * 0.01) - 0.5);
          float shore = uShore - 62.0 + shoreWobble;
          float shallow = 1.0 - smoothstep(shore - 90.0, shore + 10.0, dist);
          vec3 base = mix(uDeep, uShallow, clamp(shallow, 0.0, 1.0) * 0.9);

          vec3 sunDir = normalize(uSun);
          vec3 halfV = normalize(sunDir + viewDir);
          float spec = pow(max(dot(n, halfV), 0.0), 220.0);
          float broad = pow(max(dot(n, halfV), 0.0), 18.0) * 0.22;

          vec3 col = mix(base, uSky, fres * 0.85);
          col += vec3(1.0, 0.86, 0.68) * (spec * 2.6 + broad);

          float foamBand = (1.0 - smoothstep(shore - 26.0, shore + 4.0, dist));
          float foamNoise = noise(p * 0.35 + uTime * 0.35) * 0.6 + noise(p * 0.9 - uTime * 0.2) * 0.4;
          float foam = smoothstep(0.52, 0.95, foamBand * 1.25 + foamNoise * 0.35 - 0.25);
          col = mix(col, vec3(0.96, 0.98, 0.98), clamp(foam, 0.0, 0.9) * 0.85);

          float sparkle = pow(noise(p * 3.0 + uTime * 0.8), 12.0) * 0.5;
          col += vec3(sparkle) * smoothstep(0.0, 0.35, fres);

          col = pow(max(col, 0.0), vec3(2.2));
          float fogDist = length(cameraPosition - vWorld);
          float fogF = 1.0 - exp(-pow(fogDist * 0.00022, 2.0));
          col = mix(col, uFog, fogF);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    })
  }

  private buildPalms() {
    const trunkGeo = new THREE.CylinderGeometry(0.24, 0.46, 8.4, 8, 8)
    trunkGeo.translate(0, 4.2, 0)
    const tp = trunkGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < tp.count; i++) {
      const y = tp.getY(i)
      const t = y / 8.4
      tp.setX(i, tp.getX(i) + t * t * 1.5)
      tp.setZ(i, tp.getZ(i) + t * t * 0.4)
    }
    trunkGeo.computeVertexNormals()

    const leafGeo = this.buildFrondGeometry()
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6d4b2f, roughness: 0.95, metalness: 0 })
    const leafMat = new THREE.MeshStandardMaterial({
      map: palmFrondTexture(),
      alphaTest: 0.22,
      side: THREE.DoubleSide,
      roughness: 0.82,
      metalness: 0,
      color: 0xffffff,
    })

    const positions = this.scatter(120, 20, (_x, _z, h) => h > 1.4 && h < 12)
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, positions.length)
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, positions.length)
    trunks.castShadow = true
    leaves.castShadow = false
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const s = new THREE.Vector3()
    const p = new THREE.Vector3()
    positions.forEach((pt, i) => {
      const scale = 0.8 + Math.random() * 0.7
      p.set(pt.x, pt.h - 0.2, pt.z)
      e.set(0, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.09)
      q.setFromEuler(e)
      s.set(scale, scale * (0.9 + Math.random() * 0.3), scale)
      m.compose(p, q, s)
      trunks.setMatrixAt(i, m)
      m.compose(p, q, s)
      leaves.setMatrixAt(i, m)
    })
    trunks.instanceMatrix.needsUpdate = true
    leaves.instanceMatrix.needsUpdate = true
    this.group.add(trunks, leaves)
  }

  private buildFrondGeometry(): THREE.BufferGeometry {
    const parts: THREE.BufferGeometry[] = []
    const count = 11
    for (let i = 0; i < count; i++) {
      const g = new THREE.PlaneGeometry(5.8, 3.1, 1, 1)
      g.rotateX(-Math.PI / 2)
      g.translate(2.8, 0, 0)
      g.rotateZ(-0.42 - Math.random() * 0.3)
      g.rotateY((i / count) * Math.PI * 2 + Math.random() * 0.25)
      g.translate(0.5, 8.1, 0.2)
      parts.push(g)
    }
    return mergeGeometries(parts)!
  }

  private buildRocks() {
    const geo = new THREE.IcosahedronGeometry(1, 1)
    const p = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i))
      const n = 0.72 + hash2(v.x * 4.3, v.z * 3.7) * 0.6
      v.multiplyScalar(n)
      p.setXYZ(i, v.x, v.y * 0.8, v.z)
    }
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({ color: 0x7b7168, roughness: 0.92, metalness: 0.02, flatShading: true })
    const spots = this.scatter(70, 24, (_x, _z, h) => h > 0.2)
    const inst = new THREE.InstancedMesh(geo, mat, spots.length)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const s = new THREE.Vector3()
    const pv = new THREE.Vector3()
    spots.forEach((pt, i) => {
      const scale = 0.5 + Math.random() * 2.1
      s.set(scale * (0.8 + Math.random() * 0.5), scale * (0.6 + Math.random() * 0.5), scale)
      q.setFromEuler(new THREE.Euler(0, Math.random() * 6.28, 0))
      pv.set(pt.x, pt.h - 0.2, pt.z)
      m.compose(pv, q, s)
      inst.setMatrixAt(i, m)
    })
    inst.castShadow = true
    inst.receiveShadow = true
    this.group.add(inst)
  }

  private buildBeachProps() {
    const umbrellaGold = new THREE.MeshStandardMaterial({ color: 0xff5b4a, roughness: 0.7 })
    const umbrellaAlt = new THREE.MeshStandardMaterial({ color: 0xf7e6c8, roughness: 0.8 })
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xd9d4c8, roughness: 0.5, metalness: 0.4 })
    const canopy = new THREE.ConeGeometry(2.4, 1.05, 16, 1, true)
    const pole = new THREE.CylinderGeometry(0.055, 0.055, 2.6, 6)
    const spots = this.scatter(26, 30, (_x, _z, h) => h > 0.3 && h < 3.6)
    spots.forEach((pt, i) => {
      const g = new THREE.Group()
      const p = new THREE.Mesh(pole, poleMat)
      p.position.y = 1.3
      const c = new THREE.Mesh(canopy, i % 2 ? umbrellaGold : umbrellaAlt)
      c.position.y = 2.6
      c.castShadow = true
      g.add(p, c)
      g.position.set(pt.x, pt.h, pt.z)
      g.rotation.y = Math.random() * 6.28
      g.rotation.z = (Math.random() - 0.5) * 0.12
      this.group.add(g)
    })

    const hutWall = new THREE.MeshStandardMaterial({ color: 0xe8d3ae, roughness: 0.9 })
    const hutRoof = new THREE.MeshStandardMaterial({ color: 0x8a5b34, roughness: 0.95 })
    const hutSpots = this.scatter(7, 46, (_x, _z, h) => h > 2 && h < 6)
    for (const pt of hutSpots) {
      const g = new THREE.Group()
      const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 3.4, 5), hutWall)
      wall.position.y = 1.7
      wall.castShadow = true
      const roof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 2.6, 4), hutRoof)
      roof.position.y = 4.4
      roof.rotation.y = Math.PI / 4
      roof.castShadow = true
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.1, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x3d2a1c, roughness: 0.8 }),
      )
      door.position.set(0, 1.05, 2.52)
      g.add(wall, roof, door)
      g.position.set(pt.x, pt.h, pt.z)
      g.rotation.y = Math.random() * 6.28
      this.group.add(g)
    }
  }

  private buildIslands() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x5c7f74, roughness: 1, flatShading: true })
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + 0.6
      const d = 950 + Math.random() * 380
      const geo = new THREE.ConeGeometry(150 + Math.random() * 130, 34 + Math.random() * 40, 7)
      const m = new THREE.Mesh(geo, mat)
      m.position.set(Math.cos(ang) * d, 2, Math.sin(ang) * d)
      m.rotation.y = Math.random() * 3
      this.group.add(m)
    }
  }

  private buildTrackProps(track: Track) {
    const tireGeo = new THREE.TorusGeometry(0.52, 0.19, 8, 16)
    tireGeo.rotateX(Math.PI / 2)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.95, metalness: 0.02 })
    const stacks: THREE.Matrix4[] = []
    for (let i = 0; i < 26; i++) {
      const idx = Math.floor((i / 26) * track.nodes.length + 37) % track.nodes.length
      const node = track.nodes[idx]
      if (Math.abs(node.curv) < 0.0018) continue
      const sideSign = node.curv > 0 ? 1 : -1
      const base = node.pos
        .clone()
        .addScaledVector(node.side, sideSign * (track.halfWidth + 2.6))
        .addScaledVector(new THREE.Vector3(0, 1, 0), -0.1)
      const yaw = Math.atan2(node.tan.x, node.tan.z)
      for (let k = 0; k < 3; k++) {
        stacks.push(
          new THREE.Matrix4().compose(
            base.clone().add(new THREE.Vector3(0, 0.19 + k * 0.4, 0)),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)),
            new THREE.Vector3(1, 1, 1),
          ),
        )
      }
    }
    const tires = new THREE.InstancedMesh(tireGeo, tireMat, stacks.length)
    stacks.forEach((m, i) => tires.setMatrixAt(i, m))
    tires.castShadow = true
    tires.receiveShadow = true
    this.group.add(tires)
  }

  private buildBushes() {
    const geo = new THREE.IcosahedronGeometry(1, 0)
    const p = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i))
      v.multiplyScalar(0.8 + hash2(v.x * 5.1, v.z * 4.3) * 0.5)
      p.setXYZ(i, v.x, v.y * 0.7, v.z)
    }
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({ color: 0x3f7a35, roughness: 0.9, flatShading: true })
    const spots = this.scatter(90, 16, (_x, _z, h) => h > 1.2 && h < 9)
    const inst = new THREE.InstancedMesh(geo, mat, spots.length)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const sc = new THREE.Vector3()
    const pv = new THREE.Vector3()
    spots.forEach((pt, i) => {
      const s = 0.7 + Math.random() * 1.6
      sc.set(s, s * (0.7 + Math.random() * 0.4), s)
      q.setFromEuler(new THREE.Euler(0, Math.random() * 6.28, 0))
      pv.set(pt.x, pt.h + s * 0.35, pt.z)
      m.compose(pv, q, sc)
      inst.setMatrixAt(i, m)
    })
    inst.castShadow = true
    inst.receiveShadow = true
    this.group.add(inst)
  }

  private buildGrandstand(track: Track) {
    const node = track.sample(track.sampleCount - 64)
    const base = node.pos.clone().addScaledVector(node.side, track.halfWidth + 14)
    const yaw = Math.atan2(node.tan.x, node.tan.z)
    const stand = new THREE.Group()
    const stepMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dd, roughness: 0.8 })
    for (let i = 0; i < 3; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(20, 0.55, 2.2), stepMat)
      step.position.set(0, 0.27 + i * 0.55, -i * 2.0)
      step.castShadow = true
      step.receiveShadow = true
      stand.add(step)
    }
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2c6e8f, roughness: 0.7 })
    const roof = new THREE.Mesh(new THREE.BoxGeometry(21, 0.25, 7.5), roofMat)
    roof.position.set(0, 6.1, -2.4)
    roof.rotation.x = 0.08
    roof.castShadow = true
    stand.add(roof)
    const postMat = new THREE.MeshStandardMaterial({ color: 0x8d9aa3, roughness: 0.5, metalness: 0.6 })
    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6.1, 6), postMat)
      post.position.set(s * 9.8, 3.05, -5.8)
      stand.add(post)
    }
    const bodyGeo = new THREE.CapsuleGeometry(0.24, 0.42, 5, 8)
    const skin = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 })
    const crowd = new THREE.InstancedMesh(bodyGeo, skin, 54)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const one = new THREE.Vector3(1, 1, 1)
    const pos = new THREE.Vector3()
    const palette = [0xff5b2e, 0x2ff2df, 0xffd166, 0xff4d6d, 0x7c4dff, 0x4caf50, 0xffffff]
    let idx = 0
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 18; col++) {
        pos.set(-8.5 + col * 1.0, 0.85 + row * 0.55, -0.6 - row * 2.0 + Math.random() * 0.3)
        q.setFromEuler(new THREE.Euler(0, Math.PI, 0))
        m.compose(pos, q, one)
        crowd.setMatrixAt(idx, m)
        crowd.setColorAt(idx, new THREE.Color(palette[idx % palette.length]))
        idx++
      }
    }
    if (crowd.instanceColor) crowd.instanceColor.needsUpdate = true
    crowd.castShadow = true
    stand.add(crowd)
    stand.position.set(base.x, base.y, base.z)
    stand.rotation.y = yaw + Math.PI / 2
    this.group.add(stand)
  }

  private scatter(
    count: number,
    minTrackDist: number,
    accept: (x: number, z: number, h: number) => boolean,
  ): { x: number; z: number; h: number }[] {
    const out: { x: number; z: number; h: number }[] = []
    let guard = 0
    while (out.length < count && guard++ < count * 60) {
      const ang = Math.random() * Math.PI * 2
      const r = 60 + Math.sqrt(Math.random()) * (this.shoreRadius - 80)
      const x = Math.cos(ang) * r
      const z = Math.sin(ang) * r
      const near = this.nearestTrack(x, z)
      if (near.d < minTrackDist) continue
      const h = this.terrainHeight(x, z, near)
      if (!accept(x, z, h)) continue
      out.push({ x, z, h })
    }
    return out
  }

  groundHeight(x: number, z: number): number {
    return this.terrainHeight(x, z, this.nearestTrack(x, z))
  }

  update(_dt: number, time: number, playerPos: THREE.Vector3, camera: THREE.Camera) {
    this.waterMat.uniforms.uTime.value = time
    this.sunLight.position.copy(playerPos).addScaledVector(this.sunDir, 190)
    this.sunLight.target.position.copy(playerPos)
    this.sunLight.target.updateMatrixWorld()
    this.sky.position.copy(camera.position)
  }
}
