import type { Kart } from '../game/Kart.ts'
import type { Track } from '../game/Track.ts'
import { itemIcon, type ItemKind } from '../game/textures.ts'

const fmt = (t: number) => {
  if (!isFinite(t)) return '--:--.---'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  const ms = Math.floor((t % 1) * 1000)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

export class HUD {
  private readonly root = document.getElementById('hud')!
  private readonly posNumber = document.getElementById('pos-number')!
  private readonly posSuffix = document.getElementById('pos-suffix')!
  private readonly lapCurrent = document.getElementById('lap-current')!
  private readonly timer = document.getElementById('race-timer')!
  private readonly lapTime = document.getElementById('lap-time')!
  private readonly speedo = document.getElementById('speedo') as HTMLCanvasElement
  private readonly speedoCtx = this.speedo.getContext('2d')!
  private readonly minimap = document.getElementById('minimap') as HTMLCanvasElement
  private readonly minimapCtx = this.minimap.getContext('2d')!
  private readonly itemSlot = document.getElementById('item-slot')!
  private readonly itemHint = document.getElementById('item-hint')!
  private readonly itemCanvas = document.getElementById('item-icon') as HTMLCanvasElement
  private readonly drift = document.getElementById('drift-meter')!
  private readonly driftBars = Array.from(this.drift.querySelectorAll('i'))
  private readonly boostFill = document.getElementById('boost-fill')!
  private readonly countdownEl = document.getElementById('countdown')!
  private readonly countdownText = document.getElementById('countdown-text')!
  private readonly messageEl = document.getElementById('race-message')!
  private readonly wrongWayEl = document.getElementById('wrong-way')!
  private readonly lapFlash = document.getElementById('lap-flash')!
  private readonly touch = document.getElementById('touch-controls')!
  private messageTimer = 0
  private lastItem: ItemKind | null = null
  private minimapClock = 0

  constructor(track: Track, isTouch: boolean) {
    this.track = track
    this.bounds = this.computeBounds(track)
    if (isTouch) this.touch.classList.remove('hidden')
  }

  private track: Track
  private bounds: { minX: number; minZ: number; w: number; h: number }

  private computeBounds(track: Track) {
    let minX = Infinity
    let maxX = -Infinity
    let minZ = Infinity
    let maxZ = -Infinity
    for (const n of track.nodes) {
      minX = Math.min(minX, n.pos.x)
      maxX = Math.max(maxX, n.pos.x)
      minZ = Math.min(minZ, n.pos.z)
      maxZ = Math.max(maxZ, n.pos.z)
    }
    const pad = 24
    return { minX: minX - pad, minZ: minZ - pad, w: maxX - minX + pad * 2, h: maxZ - minZ + pad * 2 }
  }

  setTrack(track: Track) {
    this.track = track
    this.bounds = this.computeBounds(track)
  }

  show(on: boolean) {
    this.root.classList.toggle('hidden', !on)
  }

  setItem(kind: ItemKind | null) {
    if (kind === this.lastItem) return
    this.lastItem = kind
    this.itemSlot.classList.toggle('empty', !kind)
    this.itemSlot.classList.toggle('ready', !!kind)
    this.itemHint.textContent = kind ? 'USE' : 'ITEM'
    const ctx = this.itemCanvas.getContext('2d')!
    ctx.clearRect(0, 0, 128, 128)
    if (kind) {
      ctx.drawImage(itemIcon(kind), 0, 0, 128, 128)
    }
  }

  countdown(text: string | null) {
    if (text === null) {
      this.countdownEl.classList.add('hidden')
      return
    }
    this.countdownEl.classList.remove('hidden')
    this.countdownText.textContent = text
    this.countdownText.style.animation = 'none'
    void this.countdownText.offsetWidth
    this.countdownText.style.animation = ''
  }

  message(text: string, seconds = 1.6) {
    this.messageEl.textContent = text
    this.messageEl.classList.remove('hidden')
    this.messageEl.style.animation = 'none'
    void this.messageEl.offsetWidth
    this.messageEl.style.animation = ''
    this.messageTimer = seconds
  }

  flashLap() {
    this.lapFlash.classList.remove('hidden')
    this.lapFlash.style.animation = 'none'
    void this.lapFlash.offsetWidth
    this.lapFlash.style.animation = ''
    window.setTimeout(() => this.lapFlash.classList.add('hidden'), 800)
  }

  wrongWay(on: boolean) {
    this.wrongWayEl.classList.toggle('hidden', !on)
  }

  update(dt: number, player: Kart, karts: Kart[], raceTime: number, lap: number, totalLaps: number) {
    if (this.messageTimer > 0) {
      this.messageTimer -= dt
      if (this.messageTimer <= 0) this.messageEl.classList.add('hidden')
    }

    const suffix = player.rank === 1 ? 'st' : player.rank === 2 ? 'nd' : player.rank === 3 ? 'rd' : 'th'
    this.posNumber.textContent = String(player.rank)
    this.posSuffix.textContent = suffix
    this.lapCurrent.textContent = String(Math.min(lap, totalLaps))
    this.timer.textContent = fmt(raceTime)
    this.lapTime.textContent = `LAP ${fmt(raceTime - player.lapStart)}`

    this.setItem(player.item)
    const charge = Math.min(1, player.driftCharge / 2.4)
    this.drift.classList.toggle('active', player.driftCharge > 0.1)
    this.driftBars.forEach((bar, i) => {
      bar.classList.toggle('on', charge > i / 3)
      bar.classList.toggle('hot', player.driftTier >= 3 && i === 2)
    })
    this.boostFill.style.width = `${Math.min(100, (player.boostTime / 1.6) * 100 + 8)}%`
    this.boostFill.style.background =
      player.boostTime > 0
        ? 'linear-gradient(90deg,#ffb347,#ff5b2e)'
        : 'linear-gradient(90deg,#35e0ff,#2ff2df)'

    this.drawSpeedo(player)
    this.minimapClock += dt
    if (this.minimapClock > 0.05) {
      this.minimapClock = 0
      this.drawMinimap(player, karts)
    }
  }

  private drawSpeedo(player: Kart) {
    const ctx = this.speedoCtx
    const w = this.speedo.width
    const cx = w / 2
    const cy = w / 2 + 10
    const r = 96
    const kmh = Math.min(170, Math.max(0, player.speed * 3.6))
    ctx.clearRect(0, 0, w, w)

    const start = Math.PI * 0.78
    const end = Math.PI * 2.22
    ctx.lineCap = 'round'
    ctx.lineWidth = 12
    ctx.strokeStyle = 'rgba(6, 30, 44, 0.62)'
    ctx.beginPath()
    ctx.arc(cx, cy, r, start, end)
    ctx.stroke()

    const angle = start + (end - start) * (kmh / 170)
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy)
    grad.addColorStop(0, '#2ff2df')
    grad.addColorStop(0.65, '#7dfcff')
    grad.addColorStop(1, player.boostTime > 0 ? '#ff8a3d' : '#ffd166')
    ctx.strokeStyle = grad
    ctx.shadowColor = 'rgba(47,242,223,0.65)'
    ctx.shadowBlur = 18
    ctx.beginPath()
    ctx.arc(cx, cy, r, start, angle)
    ctx.stroke()
    ctx.shadowBlur = 0

    ctx.lineWidth = 2
    for (let i = 0; i <= 17; i++) {
      const a = start + (end - start) * (i / 17)
      const inner = i % 2 === 0 ? r - 24 : r - 14
      ctx.strokeStyle = i / 17 <= kmh / 170 ? 'rgba(200,250,255,0.9)' : 'rgba(160,210,230,0.28)'
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
      ctx.lineTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4))
      ctx.stroke()
    }

    ctx.fillStyle = '#ffffff'
    ctx.font = '700 66px Rajdhani, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'rgba(47,242,223,0.55)'
    ctx.shadowBlur = 22
    ctx.fillText(String(Math.round(kmh)), cx, cy - 6)
    ctx.shadowBlur = 0
    ctx.font = '600 15px Rajdhani, sans-serif'
    ctx.fillStyle = 'rgba(180,226,240,0.7)'
    ctx.fillText('KM/H', cx, cy + 40)

    if (player.boostTime > 0) {
      ctx.strokeStyle = 'rgba(255,179,71,0.85)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(cx, cy, r + 14, start, end)
      ctx.stroke()
    }
  }

  private drawMinimap(player: Kart, karts: Kart[]) {
    const ctx = this.minimapCtx
    const { width: w, height: h } = this.minimap
    const b = this.bounds
    ctx.clearRect(0, 0, w, h)
    const pad = 14
    const scale = Math.min((w - pad * 2) / b.w, (h - pad * 2) / b.h)
    const ox = (w - b.w * scale) / 2
    const oy = (h - b.h * scale) / 2
    const px = (x: number) => ox + (x - b.minX) * scale
    const py = (z: number) => oy + (z - b.minZ) * scale

    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(4, 20, 32, 0.75)'
    ctx.lineWidth = 16
    ctx.beginPath()
    this.track.nodes.forEach((n, i) => {
      if (i === 0) ctx.moveTo(px(n.pos.x), py(n.pos.z))
      else ctx.lineTo(px(n.pos.x), py(n.pos.z))
    })
    ctx.closePath()
    ctx.stroke()

    ctx.strokeStyle = 'rgba(120, 235, 255, 0.55)'
    ctx.lineWidth = 3
    ctx.stroke()

    const start = this.track.nodes[0].pos
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(px(start.x) - 4, py(start.z) - 4, 8, 8)

    for (const k of karts) {
      const isPlayer = k === player
      ctx.beginPath()
      ctx.arc(px(k.pos.x), py(k.pos.z), isPlayer ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = isPlayer ? '#ffd166' : `#${k.spec.body.toString(16).padStart(6, '0')}`
      ctx.fill()
      if (isPlayer) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  }
}
