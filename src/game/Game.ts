import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { Track } from './Track.ts'
import { World } from './World.ts'
import { Kart, KART_SPECS, type KartInput, type KartSpec } from './Kart.ts'
import { CameraRig } from './CameraRig.ts'
import { Effects } from './Effects.ts'
import { Items } from './Items.ts'
import { AudioEngine } from './Audio.ts'
import { Input } from './Input.ts'
import { HUD } from '../ui/HUD.ts'
import { Menu, type CupResult, type Quality, type Standing } from '../ui/Menu.ts'
import { TRACKS } from './tracks.ts'

type State = 'menu' | 'countdown' | 'race' | 'finished' | 'paused'

interface AIState {
  kart: Kart
  itemTimer: number
  lane: number
  laneTarget: number
}

const AI_NAMES = ['SAND SHARK', 'RIPTIDE', 'CORAL KING', 'SHELL SHOCK', 'TIDAL WAVE']
const AI_COLORS: [number, number][] = [
  [0xff4d6d, 0xffd166],
  [0x7c4dff, 0x2ff2df],
  [0x00c2ff, 0xffffff],
  [0xffb347, 0x2b2b2b],
  [0x8d6e63, 0xffe0b2],
]

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uVignette: { value: 0.42 },
    uSaturation: { value: 1.02 },
    uContrast: { value: 1.05 },
    uGrain: { value: 0.02 },
    uAberration: { value: 0.00045 },
    uSpeed: { value: 0 },
    uBoost: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uGrain;
    uniform float uAberration;
    uniform float uSpeed;
    uniform float uBoost;
    varying vec2 vUv;

    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }

    void main() {
      vec2 uv = vUv;
      vec2 center = uv - 0.5;
      float r2 = dot(center, center);
      vec2 dir = normalize(center + 0.0001);
      float ca = uAberration * r2 * r2 + uBoost * 0.0025 * r2;
      float edge = smoothstep(0.04, 0.32, r2);
      vec2 smear = dir * (uSpeed * 0.005 + uBoost * 0.008) * edge;
      vec3 base = texture2D(tDiffuse, uv).rgb;
      vec3 spread = texture2D(tDiffuse, uv + smear).rgb + texture2D(tDiffuse, uv - smear).rgb;
      vec3 col = mix(base, spread * 0.5, clamp(uSpeed * 0.3 + uBoost * 0.25, 0.0, 0.4) * edge);
      float r = texture2D(tDiffuse, uv + dir * ca).r;
      float b = texture2D(tDiffuse, uv - dir * ca).b;
      col.r = mix(col.r, r, 0.6);
      col.b = mix(col.b, b, 0.6);

      float luma = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(luma), col, uSaturation);
      col = (col - 0.5) * uContrast + 0.5;

      float vig = smoothstep(0.95, 0.25, r2 * 2.0);
      col *= mix(1.0, vig, uVignette);

      col = mix(col, col * vec3(1.03, 1.0, 0.96), 0.6);
      float grain = (rand(uv * 1024.0) - 0.5) * uGrain;
      col += grain;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
}

export class Game {
  readonly renderer: THREE.WebGLRenderer
  readonly scene = new THREE.Scene()
  readonly composer: EffectComposer
  readonly cameraRig: CameraRig
  track: Track
  world: World
  readonly effects = new Effects()
  private fillLight!: THREE.DirectionalLight
  items: Items
  readonly audio = new AudioEngine()
  readonly input = new Input()
  readonly hud: HUD
  readonly menu: Menu
  private readonly clock = new THREE.Clock()
  private readonly bloom: UnrealBloomPass
  private readonly grade: ShaderPass
  private readonly smaa: SMAAPass
  private readonly gtao: GTAOPass
  private karts: Kart[] = []
  private ai: AIState[] = []
  private player!: Kart
  private state: State = 'menu'
  private raceTime = 0
  private countdown = 0
  private finishedShown = false
  private totalLaps = 3
  private quality: Quality = 'high'
  private gtaoSupported = false
  private lastBoost = false
  private driftClock = 0
  private readonly groundAt = (x: number, z: number) => this.world.groundHeight(x, z)
  private wrongWayTimer = 0
  private bootProgress = 0
  private heroAngle = 0
  private trackIndex = 0
  private cup = { active: false, index: 0, points: {} as Record<string, number> }

  constructor(canvas: HTMLCanvasElement) {
    this.quality = Game.detectQuality()
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
    })
    this.renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 0.95
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.cameraRig = new CameraRig(window.innerWidth / window.innerHeight)
    this.track = new Track(TRACKS[0])
    this.scene.add(this.track.group)
    this.world = new World(this.track, this.renderer, this.scene, TRACKS[0].theme)
    this.scene.add(this.world.group)
    const fill = new THREE.DirectionalLight(0xbfe4ff, 0.55)
    fill.position.set(0, 6, 10)
    this.scene.add(fill)
    this.fillLight = fill
    this.scene.add(this.effects.group)
    this.items = new Items(this.track, this.effects)
    this.scene.add(this.items.group)

    this.hud = new HUD(this.track, this.input.isTouch)
    this.input.attachTouch(document.getElementById('hud')!)
    this.menu = new Menu({
      onStart: (car) => void this.startRace(car),
      onCar: (car) => {
        this.currentCar = car
        if (this.state === 'menu') this.createHero()
      },
      onTrack: (i) => this.selectTrack(i),
      onCup: () => this.startCup(),
      onQuality: (q) => this.setQuality(q),
      onSound: (on) => this.audio.setEnabled(on),
      onResume: () => this.resume(),
      onRestart: () => void this.startRace(this.selectedCar()),
      onQuit: () => this.toMenu(),
      onAgain: () => this.nextRace(),
      onMenu: () => this.toMenu(),
    })

    const size = new THREE.Vector2(window.innerWidth, window.innerHeight)
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.cameraRig.camera))
    this.gtaoSupported = this.renderer.capabilities.isWebGL2 && this.renderer.extensions.has('EXT_color_buffer_float')
    this.gtao = new GTAOPass(this.scene, this.cameraRig.camera, window.innerWidth, window.innerHeight)
    this.gtao.output = GTAOPass.OUTPUT.Default
    this.gtao.blendIntensity = 0.85
    this.gtao.enabled = this.quality === 'high' && this.gtaoSupported
    this.composer.addPass(this.gtao)
    this.bloom = new UnrealBloomPass(size, 0.22, 0.45, 1.05)
    this.composer.addPass(this.bloom)
    this.composer.addPass(new OutputPass())
    this.grade = new ShaderPass(GradeShader)
    this.composer.addPass(this.grade)
    this.smaa = new SMAAPass()
    this.composer.addPass(this.smaa)
    this.composer.setPixelRatio(Math.min(1.75, window.devicePixelRatio))

    this.wireItems()

    this.menu.setQuality(this.quality)
    this.setQuality(this.quality)
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault()
      const boot = document.getElementById('boot-status')
      if (boot) boot.textContent = 'CONTEXTO GRÁFICO PERDIDO · RECARGA LA PÁGINA'
      document.getElementById('boot')?.classList.remove('done')
    })
    window.addEventListener('resize', () => this.onResize())
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'race') this.pause()
    })
    this.createHero()
    this.menu.showTitle()
    this.loop()
  }

  get booted(): number {
    return this.bootProgress
  }

  private selectedCar(): number {
    return this.menu?.car ?? this.currentCar
  }

  private currentCar = 0

  private wireItems() {
    this.items.onPickup = (kart) => {
      if (kart === this.player) this.audio.pickup()
      this.effects.sparks(kart.pos.clone().add(new THREE.Vector3(0, 1.2, 0)), new THREE.Color(0x8ffcff), 12)
    }
    this.items.onLaunch = () => this.audio.itemUse()
    this.items.onExplode = () => {
      this.audio.explosion()
      if (this.player) this.cameraRig.kick(0.5)
    }
  }

  private disposeObject(root: THREE.Object3D) {
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry?.dispose()
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) material?.dispose()
    })
  }

  private rebuildWorld() {
    this.disposeKarts()
    this.scene.remove(this.track.group)
    this.scene.remove(this.world.group)
    this.scene.remove(this.items.group)
    this.disposeObject(this.track.group)
    this.disposeObject(this.world.group)
    this.disposeObject(this.items.group)
    const spec = TRACKS[this.trackIndex]
    this.track = new Track(spec)
    this.scene.add(this.track.group)
    this.world = new World(this.track, this.renderer, this.scene, spec.theme)
    this.scene.add(this.world.group)
    this.items = new Items(this.track, this.effects)
    this.scene.add(this.items.group)
    this.wireItems()
    this.hud.setTrack(this.track)
  }

  private selectTrack(index: number) {
    if (index === this.trackIndex) return
    this.trackIndex = index
    this.rebuildWorld()
    this.state = 'menu'
    this.hud.show(false)
    this.menu.showTitle()
    this.createHero()
  }

  private startCup() {
    this.cup = { active: true, index: 0, points: {} }
    this.audio.click()
    if (this.trackIndex !== 0) {
      this.trackIndex = 0
      this.rebuildWorld()
      this.hud.setTrack(this.track)
    }
    void this.startRace(this.selectedCar())
  }

  private cupPointsFor(rank: number): number {
    const table = [10, 8, 6, 4, 3, 2]
    return table[Math.min(table.length - 1, Math.max(0, rank - 1))]
  }

  private awardCupPoints() {
    if (!this.cup.active) return
    for (const k of this.karts) {
      const key = k.isPlayer ? 'YOU' : k.spec.name
      this.cup.points[key] = (this.cup.points[key] ?? 0) + this.cupPointsFor(k.rank)
    }
  }

  private cupResult(): CupResult | undefined {
    if (!this.cup.active) return undefined
    const final = this.cup.index >= TRACKS.length - 1
    const mine = this.cup.points.YOU ?? 0
    const best = Math.max(mine, ...Object.values(this.cup.points))
    return {
      points: mine,
      total: mine,
      next: final ? undefined : TRACKS[this.cup.index + 1].name,
      final,
      champion: final && mine >= best,
    }
  }

  private nextRace() {
    if (this.cup.active) {
      if (this.cup.index < TRACKS.length - 1) {
        this.cup.index++
        this.menu.hideResults()
        this.trackIndex = this.cup.index
        this.rebuildWorld()
        void this.startRace(this.currentCar)
        return
      }
      this.cup.active = false
      this.startCup()
      return
    }
    void this.startRace(this.currentCar)
  }

  private createHero() {
    this.disposeKarts()
    const spec = KART_SPECS[this.currentCar]
    const hero = new Kart(spec, true, this.track, 3)
    const heroNode = this.track.sample(210)
    hero.pos.copy(heroNode.pos).addScaledVector(heroNode.side, -4.4)
    hero.pos.y = heroNode.pos.y + 0.02
    hero.yaw = Math.atan2(heroNode.tan.x, heroNode.tan.z)
    hero.group.position.copy(hero.pos)
    hero.group.rotation.y = hero.yaw
    this.scene.add(hero.group)
    this.player = hero
    this.karts = [hero]
    this.ai = []
    this.bootProgress = 1
  }

  private disposeKarts() {
    for (const k of this.karts) {
      this.scene.remove(k.group)
      k.group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) mesh.geometry.dispose()
      })
    }
    this.karts = []
    this.ai = []
  }

  private buildAI() {
    const specs: KartSpec[] = AI_NAMES.map((name, i) => ({
      id: `ai-${i}`,
      name,
      tag: 'RIVAL',
      number: 2 + i * 2,
      style: (['muscle', 'formula', 'rally', 'buggy', 'formula'] as const)[i % 5],
      body: AI_COLORS[i][0],
      accent: AI_COLORS[i][1],
      trim: 0x141b22,
      stats: {
        maxSpeed: 39.4 + Math.random() * 2.4,
        accel: 19.5 + Math.random() * 2.4,
        turn: 2.2 + Math.random() * 0.25,
        grip: 1,
      },
    }))
    return specs
  }

  async startRace(carIndex: number) {
    this.currentCar = carIndex
    this.audio.unlock()
    this.audio.click()
    this.audio.setMusic(true)
    this.disposeKarts()
    this.state = 'countdown'
    this.finishedShown = false
    this.raceTime = 0
    this.countdown = 3.9

    const player = new Kart(KART_SPECS[carIndex], true, this.track, 3)
    this.scene.add(player.group)
    this.player = player
    this.karts = [player]

    const specs = this.buildAI()
    const slots = [0, 1, 2, 4, 5]
    specs.forEach((spec, i) => {
      const kart = new Kart(spec, false, this.track, slots[i])
      this.scene.add(kart.group)
      this.karts.push(kart)
      this.ai.push({ kart, itemTimer: 3 + Math.random() * 5, lane: 0, laneTarget: 0 })
    })

    this.menu.showRace()
    this.hud.show(true)
    this.hud.countdown('3')
    this.cameraRig.beginIntro()
    this.hud.setItem(null)
    this.audio.countdown(false)
    this.hud.message('GET READY', 1.6)
    this.track.setStartLights('red')

    for (const kart of this.karts) kart.item = null
  }

  private toMenu() {
    this.cup.active = false
    this.state = 'menu'
    this.menu.showTitle()
    this.hud.show(false)
    this.audio.stopMusic()
    this.audio.silenceEngine()
    this.createHero()
    this.hud.countdown(null)
  }

  private resume() {
    if (this.state !== 'paused') return
    this.state = 'race'
    this.menu.showPause(false)
  }

  private pause() {
    if (this.state !== 'race' && this.state !== 'countdown') return
    this.state = 'paused'
    this.menu.showPause(true)
    this.audio.silenceEngine()
  }

  static detectQuality(): Quality {
    const forced = new URLSearchParams(window.location.search).get('quality')
    if (forced === 'low' || forced === 'medium' || forced === 'high') return forced
    const touch =
      matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window
    if (touch || Math.min(window.innerWidth, window.innerHeight) < 600) return 'low'
    return 'high'
  }

  get webglInfo(): string {
    try {
      const gl = this.renderer.getContext()
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'GPU desconocida'
      return `${name} · WebGL2 ${this.renderer.capabilities.isWebGL2 ? 'sí' : 'no'}`
    } catch {
      return 'sin contexto WebGL'
    }
  }

  get hasRendered(): boolean {
    return this.firstFrameChecked
  }

  private setQuality(q: Quality) {
    this.quality = q
    const ratio = q === 'high' ? Math.min(1.75, window.devicePixelRatio) : q === 'medium' ? Math.min(1.2, window.devicePixelRatio) : 1
    this.renderer.setPixelRatio(ratio)
    this.composer.setPixelRatio(ratio)
    this.world.sunLight.castShadow = q !== 'low'
    this.bloom.enabled = q !== 'low'
    this.gtao.enabled = q === 'high' && this.gtaoSupported
    this.smaa.enabled = q !== 'low'
    this.grade.enabled = q !== 'low'
    this.onResize()
  }

  private onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h)
    this.composer.setSize(w, h)
    this.cameraRig.resize(w / h)
    this.bloom.setSize(w, h)
    this.gtao.setSize(w, h)
    this.smaa.setSize(w, h)
  }

  private aiInput(aiState: AIState, dt: number): KartInput {
    const k = aiState.kart
    const speed = k.speed
    const lookahead = Math.round(this.track.sampleCount * 0.0025 + speed * 1.4)
    const targetNode = this.track.sample(k.index + lookahead)
    const curveAhead = this.track.sample(k.index + lookahead * 2).curv

    aiState.laneTarget = THREE.MathUtils.clamp(-curveAhead * 1600, -3.0, 3.0)
    aiState.lane += (aiState.laneTarget - aiState.lane) * Math.min(1, dt * 1.6)

    let avoid = 0
    for (const other of this.karts) {
      if (other === k) continue
      const rel = other.pos.clone().sub(k.pos)
      const ahead = rel.dot(k.forward)
      if (ahead > 0 && ahead < 7) {
        const side = rel.dot(k.right)
        if (Math.abs(side) < 2.2) avoid -= Math.sign(side || 0.3) * 0.35
      }
    }
    const target = targetNode.pos.clone().addScaledVector(targetNode.side, aiState.lane)
    const dx = target.x - k.pos.x
    const dz = target.z - k.pos.z
    const desiredYaw = Math.atan2(dx, dz)
    let diff = desiredYaw - k.yaw
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    const steer = THREE.MathUtils.clamp(diff * 2.6 + avoid, -1, 1)

    let cornerSpeed = 999
    const absCurv = Math.abs(curveAhead)
    if (absCurv > 0.0008) cornerSpeed = Math.sqrt(26 / absCurv)
    const rubber = k.rank <= 2 ? 0.985 : k.rank >= 5 ? 1.06 : 1.02
    const targetSpeed = Math.min(k.spec.stats.maxSpeed * rubber, cornerSpeed)
    const brake = speed > targetSpeed * 1.02

    aiState.itemTimer -= dt
    if (k.item && aiState.itemTimer <= 0) {
      this.items.use(k, this.karts)
      aiState.itemTimer = 6 + Math.random() * 8
    } else if (k.item && k.rank > 3 && Math.random() < dt * 0.35) {
      this.items.use(k, this.karts)
      aiState.itemTimer = 6 + Math.random() * 8
    }

    return { steer, brake, drift: false, item: false }
  }

  private checkCollisions(dt: number) {
    for (let i = 0; i < this.karts.length; i++) {
      for (let j = i + 1; j < this.karts.length; j++) {
        const a = this.karts[i]
        const b = this.karts[j]
        const dx = b.pos.x - a.pos.x
        const dz = b.pos.z - a.pos.z
        const d2 = dx * dx + dz * dz
        if (d2 > 6.4 || d2 < 0.0001) continue
        const d = Math.sqrt(d2)
        const push = (2.9 - d) * 0.7
        const nx = dx / d
        const nz = dz / d
        a.pos.x -= nx * push
        a.pos.z -= nz * push
        b.pos.x += nx * push
        b.pos.z += nz * push
        a.speed *= 0.992
        b.speed *= 0.992
        if ((a === this.player || b === this.player) && dt > 0) {
          this.cameraRig.kick(0.35)
          this.audio.hit()
        }
        this.effects.sparks(
          new THREE.Vector3((a.pos.x + b.pos.x) / 2, a.pos.y + 0.7, (a.pos.z + b.pos.z) / 2),
          new THREE.Color(0xffd166),
          2,
        )
      }
    }
  }

  private updateRanks() {
    const sorted = [...this.karts].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime
      if (a.finished) return -1
      if (b.finished) return 1
      return b.totalProgress - a.totalProgress
    })
    sorted.forEach((k, i) => (k.rank = i + 1))
  }

  private standings(): Standing[] {
    const total = this.totalLaps * this.track.sampleCount
    const lapTime = Math.max(20, this.raceTime / Math.max(1, this.player.lapCount))
    return [...this.karts]
      .sort((a, b) => a.rank - b.rank)
      .map((k) => {
        const remaining = Math.max(0, total - k.totalProgress)
        const estimated = this.raceTime + (remaining / this.track.sampleCount) * lapTime
        return {
          rank: k.rank,
          name: k.isPlayer ? 'YOU' : k.spec.name,
          color: `#${k.spec.body.toString(16).padStart(6, '0')}`,
          time: k.finished ? k.finishTime : estimated,
          best: k.bestLap,
          isPlayer: k.isPlayer,
        }
      })
  }

  private updatePlayerEffects(dt: number, now: number) {
    const k = this.player
    if (!k) return
    const boosting = k.boostTime > 0
    if (boosting && !this.lastBoost) {
      this.audio.boost()
      this.cameraRig.kick(0.22)
    }
    this.lastBoost = boosting

    this.audio.engine(k.speed, k.spec.stats.maxSpeed, 1, boosting, k.offroad)
    this.audio.drift(k.drifting, Math.abs(k.steer))

    this.driftClock += dt
    if (k.drifting && k.speed > 8) {
      const back = k.pos.clone().addScaledVector(k.forward, -1.5)
      const side = k.right
      this.effects.skid(back.clone().addScaledVector(side, 0.9), k.yaw, dt)
      this.effects.skid(back.clone().addScaledVector(side, -0.9), k.yaw, dt)
      if (this.driftClock > 0.07) {
        this.driftClock = 0
        this.effects.smokePuff(back, 1)
      }
    }
    if (k.offroad && k.speed > 4 && this.driftClock > 0.09) {
      this.effects.dust(k.pos.clone().addScaledVector(k.forward, -1), k.forward, 1)
    }
    if (k.wallHit > 0.3 && Math.random() < 0.2) {
      this.effects.sparks(k.pos.clone().addScaledVector(k.right, 1.2), new THREE.Color(0xffd166), 4)
    }
    void now
  }

  private loop = () => {
    const dtRaw = this.clock.getDelta()
    const dt = Math.min(0.05, dtRaw)
    const time = this.clock.elapsedTime
    this.monitorPerformance(dtRaw)

    if (this.state === 'menu') {
      this.heroAngle += dt
      this.cameraRig.updateMenu(dt, this.player.pos, time)
      this.world.update(dt, time, this.player.pos, this.cameraRig.camera)
      this.effects.update(dt)
      const cam = this.cameraRig.camera
      for (const k of this.karts) {
        if (k !== this.player) k.group.visible = k.pos.distanceTo(cam.position) > 3.4
      }
      this.items.update(dt, this.karts, this.cameraRig.camera)
      this.player.group.rotation.y = this.player.yaw + Math.sin(this.heroAngle * 0.4) * 0.02
      this.hud.show(false)
    } else if (this.state === 'paused') {
      // freeze simulation, keep rendering the last frame
    } else {
      if (this.input.consumePause()) {
        if (this.state === 'race') this.pause()
        else if (this.isPaused()) this.resume()
      }
      if (this.isPaused()) {
        this.renderComposer()
        requestAnimationFrame(this.loop)
        return
      }

      if (this.state === 'countdown') {
        this.countdown -= dt
        const c = Math.ceil(this.countdown - 0.9)
        if (c > 0 && c <= 3) this.hud.countdown(String(c))
        if (this.countdown <= 0.9 && this.countdown + dt > 0.9) {
          this.hud.countdown('GO!')
          this.audio.countdown(true)
          this.track.setStartLights('green')
          window.setTimeout(() => this.track.setStartLights('off'), 1400)
          window.setTimeout(() => this.hud.countdown(null), 700)
        }
        if (this.countdown <= 0) {
          this.state = 'race'
          this.raceTime = 0
        }
      } else if (this.state === 'race') {
        this.raceTime += dt
      }

      const racing = this.state === 'race'
      const pInput = this.input.read()

      if (this.input.consumeItem() && this.player.item && racing) {
        this.items.use(this.player, this.karts)
      }
      if (this.input.consumeRespawn() && racing) {
        this.player.respawn(this.track)
      }

      for (const k of this.karts) {
        let input: KartInput = { steer: 0, brake: false, drift: false, item: false }
        if (k === this.player) {
          input = pInput
        } else if (racing && !k.finished) {
          const aiState = this.ai.find((a) => a.kart === k)
          if (aiState) input = this.aiInput(aiState, dt)
        }
        const prevLaps = k.lapCount
        k.update(dt, this.track, input, this.raceTime, racing, this.groundAt)
        if (k.lapCount > prevLaps) {
          if (k === this.player) {
            this.hud.flashLap()
            this.audio.lap()
            const remaining = this.totalLaps - k.lapCount
            if (remaining > 0) {
              this.hud.message(remaining === 1 ? 'FINAL LAP' : `LAP ${k.lapCount + 1}/${this.totalLaps}`, 1.6)
            }
          }
          if (k.lapCount >= this.totalLaps && !k.finished) {
            k.finished = true
            k.finishTime = this.raceTime
            if (k === this.player) this.finishRace()
          }
        }
      }

      this.checkCollisions(dt)
      const cam = this.cameraRig.camera
      for (const k of this.karts) {
        if (k !== this.player) k.group.visible = k.pos.distanceTo(cam.position) > 3.4
      }
      this.items.update(dt, this.karts, this.cameraRig.camera)
      this.effects.update(dt)
      this.world.update(dt, time, this.player.pos, this.cameraRig.camera)
      this.updateRanks()
      this.updatePlayerEffects(dt, time)

      if (this.state === 'race' || this.state === 'countdown') {
        this.cameraRig.update(dt, this.player, this.track, this.state === 'countdown' ? this.countdown : 0)
        const wrong = this.isWrongWay()
        this.wrongWayTimer = wrong ? this.wrongWayTimer + dt : 0
        this.hud.wrongWay(this.wrongWayTimer > 0.8)
      }

      this.hud.update(dt, this.player, this.karts, this.raceTime, Math.min(this.player.lapCount + 1, this.totalLaps), this.totalLaps)
    }

    const moving = this.state === 'race' || this.state === 'countdown'
    const speedRatio = moving ? THREE.MathUtils.clamp(this.player.speed / this.player.spec.stats.maxSpeed, 0, 1) : 0
    this.grade.uniforms.uSpeed.value = speedRatio * speedRatio
    this.grade.uniforms.uBoost.value = moving && this.player.boostTime > 0 ? 1 : 0
    this.fillLight.position.copy(this.cameraRig.camera.position).add(new THREE.Vector3(0, 2, 0))
    this.fillLight.target.position.copy(this.player.pos)
    this.fillLight.target.updateMatrixWorld()

    this.renderComposer()
    requestAnimationFrame(this.loop)
  }

  private perfFrames = 0
  private perfTime = 0
  private perfChecked = 0

  private monitorPerformance(dt: number) {
    if (this.state === 'menu' || this.perfChecked >= 2) return
    this.perfFrames++
    this.perfTime += dt
    if (this.perfTime < 2.5) return
    const fps = this.perfFrames / this.perfTime
    this.perfFrames = 0
    this.perfTime = 0
    if (fps < 32 && this.quality === 'high') {
      this.setQuality('medium')
      this.menu.setQuality('medium')
    } else if (fps < 24 && this.quality === 'medium') {
      this.setQuality('low')
      this.menu.setQuality('low')
    } else {
      this.perfChecked++
    }
  }

  private firstFrameChecked = false

  private renderComposer() {
    if (this.quality === 'low') {
      this.renderer.render(this.scene, this.cameraRig.camera)
    } else {
      this.composer.render()
    }
    if (!this.firstFrameChecked) {
      this.firstFrameChecked = true
      this.checkFrameNotBlank()
    }
  }

  /** Mobile GPUs without float render targets can produce an all-white frame; fall back to direct rendering. */
  private checkFrameNotBlank() {
    try {
      const gl = this.renderer.getContext()
      const canvas = this.renderer.domElement
      const px = new Uint8Array(4)
      const points: [number, number][] = [
        [0.25, 0.2],
        [0.5, 0.1],
        [0.75, 0.25],
      ]
      let white = 0
      for (const [fx, fy] of points) {
        gl.readPixels(
          Math.floor(canvas.width * fx),
          Math.floor(canvas.height * fy),
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          px,
        )
        if (px[0] > 248 && px[1] > 248 && px[2] > 248) white++
      }
      if (white >= 2 && this.quality !== 'low') {
        this.setQuality('low')
        this.menu.setQuality('low')
      }
    } catch {
      // readPixels can be unavailable on some drivers; rendering stays as configured.
    }
  }

  private isPaused(): boolean {
    return (this.state as State) === 'paused'
  }

  private isWrongWay(): boolean {
    const k = this.player
    const node = this.track.sample(k.index)
    const dot = node.tan.x * Math.sin(k.yaw) + node.tan.z * Math.cos(k.yaw)
    return dot < -0.45 && k.speed > 4
  }

  private finishRace() {
    if (this.finishedShown) return
    this.finishedShown = true
    this.state = 'finished'
    this.updateRanks()
    this.awardCupPoints()
    this.audio.finish()
    this.audio.silenceEngine()
    this.effects.confetti(this.player.pos.clone().add(new THREE.Vector3(0, 3, 0)))
    this.hud.message(this.player.rank === 1 ? 'VICTORY!' : 'RACE COMPLETE', 2.4)
    this.cameraRig.kick(0.6)
    const standings = this.standings()
    const cup = this.cupResult()
    window.setTimeout(() => {
      this.menu.showResults(standings, this.player.bestLap, this.raceTime, this.player.rank === 1, cup)
      this.hud.show(false)
    }, 2200)
  }
}
