import { KART_SPECS } from '../game/Kart.ts'
import { TRACKS, trackOutline, type TrackSpec } from '../game/tracks.ts'

export type Quality = 'high' | 'medium' | 'low'

const QUALITY_LABELS: Record<Quality, string> = { high: 'ALTA', medium: 'MEDIA', low: 'BAJA' }

export interface Standing {
  rank: number
  name: string
  color: string
  time: number
  best: number
  isPlayer: boolean
}

export interface CupResult {
  points: number
  total: number
  next?: string
  final: boolean
  champion: boolean
}

export interface MenuCallbacks {
  onStart: (carIndex: number) => void
  onCar: (carIndex: number) => void
  onTrack: (trackIndex: number) => void
  onCup: () => void
  onQuality: (q: Quality) => void
  onSound: (on: boolean) => void
  onResume: () => void
  onRestart: () => void
  onQuit: () => void
  onAgain: () => void
  onMenu: () => void
}

const format = (t: number) => {
  if (!isFinite(t)) return '--:--.---'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  const ms = Math.floor((t % 1) * 1000)
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

function carSvg(style: string, body: string, accent: string): string {
  const wheel = (x: number) =>
    `<circle cx="${x}" cy="52" r="13" fill="#0d1216"/><circle cx="${x}" cy="52" r="6" fill="${accent}"/>`
  const base = `
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${body}"/><stop offset="1" stop-color="${accent}"/>
    </linearGradient></defs>`
  if (style === 'formula') {
    return `<svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${base}
      <g stroke="rgba(0,0,0,0.35)" stroke-width="1.2">
        <rect x="12" y="49" width="34" height="5" rx="2" fill="${accent}"/>
        <path d="M30 51 L40 43 L74 41 L96 33 L136 33 L156 41 L182 46 L182 52 L28 52 Z" fill="url(#g)"/>
        <path d="M96 33 L120 27 L138 27 L142 34 Z" fill="rgba(10,18,24,0.85)"/>
        <path d="M118 29 L136 29 L140 34 L116 34 Z" fill="rgba(120,235,255,0.35)"/>
        <rect x="158" y="24" width="30" height="5" rx="2" fill="${body}"/>
        <rect x="170" y="29" width="4" height="12" fill="${accent}"/>
        <rect x="162" y="29" width="4" height="12" fill="${accent}"/>
      </g>${wheel(58)}${wheel(156)}</svg>`
  }
  if (style === 'muscle') {
    return `<svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${base}
      <g stroke="rgba(0,0,0,0.35)" stroke-width="1.2">
        <path d="M22 52 L26 41 L58 37 L84 30 L130 30 L150 34 L174 39 L178 52 Z" fill="url(#g)"/>
        <path d="M86 32 L128 32 L142 40 L82 40 Z" fill="rgba(8,16,22,0.9)"/>
        <path d="M92 34 L124 34 L133 39 L90 39 Z" fill="rgba(120,235,255,0.3)"/>
        <rect x="62" y="34" width="18" height="6" rx="2" fill="#d7e2ea"/>
        <rect x="100" y="24" width="26" height="4" rx="2" fill="${accent}"/>
        <rect x="166" y="36" width="12" height="4" rx="2" fill="${accent}"/>
      </g>${wheel(56)}${wheel(154)}</svg>`
  }
  if (style === 'rally') {
    return `<svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${base}
      <g stroke="rgba(0,0,0,0.35)" stroke-width="1.2">
        <path d="M26 52 L30 38 L54 30 L104 26 L142 29 L166 38 L176 48 L176 52 Z" fill="url(#g)"/>
        <path d="M58 31 L104 27 L138 30 L142 38 L60 38 Z" fill="rgba(8,16,22,0.9)"/>
        <path d="M64 33 L102 30 L130 33 L133 37 L66 37 Z" fill="rgba(120,235,255,0.3)"/>
        <rect x="98" y="23" width="18" height="4" rx="2" fill="${accent}"/>
        <rect x="150" y="26" width="24" height="5" rx="2" fill="${body}"/>
        <path d="M68 38 a18 18 0 0 1 36 0" fill="${body}" stroke="rgba(0,0,0,0.3)"/>
        <path d="M126 38 a18 18 0 0 1 36 0" fill="${body}" stroke="rgba(0,0,0,0.3)"/>
      </g>${wheel(58)}${wheel(150)}</svg>`
  }
  return `<svg viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${base}
    <g stroke="rgba(0,0,0,0.35)" stroke-width="1.2">
      <path d="M28 50 L40 34 L150 32 L172 46 L172 52 L26 52 Z" fill="url(#g)"/>
      <path d="M78 34 L92 18 L128 18 L140 33 Z" fill="rgba(10,18,24,0.85)"/>
      <path d="M96 20 L124 20 L133 32 L92 32 Z" fill="rgba(120,235,255,0.35)"/>
      <rect x="150" y="26" width="22" height="6" rx="2" fill="${accent}"/>
      <path d="M74 34 L74 20 M146 32 L146 20 M74 20 L146 20" stroke="#1a232b" stroke-width="4" fill="none"/>
      <circle cx="110" cy="22" r="6" fill="${accent}"/>
    </g>${wheel(56)}${wheel(152)}</svg>`
}

export class Menu {
  private selected = 0
  private readonly cb: MenuCallbacks
  private readonly rail = document.getElementById('car-rail')!
  private readonly trackRail = document.getElementById('track-rail')!
  private readonly cupBtn = document.getElementById('btn-cup')!
  private selectedTrack = 0
  private readonly stats = document.getElementById('car-stats')!
  private readonly title = document.getElementById('title-screen')!
  private readonly results = document.getElementById('results-screen')!
  private readonly pause = document.getElementById('pause-screen')!
  private readonly startBtn = document.getElementById('start-race')!
  private readonly qualityBtn = document.getElementById('btn-quality')!
  private readonly soundBtn = document.getElementById('btn-sound')!
  private readonly installBtn = document.getElementById('btn-install')!
  private readonly installFab = document.getElementById('install-fab')!
  private readonly installToast = document.getElementById('install-toast')!
  private quality: Quality = 'high'
  private soundOn = true
  private installPrompt: (() => Promise<void>) | null = null

  constructor(cb: MenuCallbacks) {
    this.cb = cb
    this.buildRail()
    this.select(0)
    this.buildTracks()
    this.selectTrack(0, false)

    this.startBtn.addEventListener('click', () => {
      this.cb.onStart(this.selected)
    })
    this.cupBtn.addEventListener('click', () => {
      this.cb.onCup()
    })
    this.qualityBtn.addEventListener('click', () => {
      const order: Quality[] = ['high', 'medium', 'low']
      this.quality = order[(order.indexOf(this.quality) + 1) % order.length]
      this.qualityBtn.textContent = `CALIDAD: ${QUALITY_LABELS[this.quality]}`
      this.cb.onQuality(this.quality)
    })
    this.soundBtn.addEventListener('click', () => {
      this.soundOn = !this.soundOn
      this.soundBtn.textContent = `SONIDO: ${this.soundOn ? 'SÍ' : 'NO'}`
      this.cb.onSound(this.soundOn)
    })
    document.getElementById('btn-resume')!.addEventListener('click', () => this.cb.onResume())
    document.getElementById('btn-restart')!.addEventListener('click', () => this.cb.onRestart())
    document.getElementById('btn-quit')!.addEventListener('click', () => this.cb.onQuit())
    document.getElementById('btn-again')!.addEventListener('click', () => this.cb.onAgain())
    document.getElementById('btn-menu')!.addEventListener('click', () => this.cb.onMenu())
    document.getElementById('btn-settings')!.addEventListener('click', () => {
      document.getElementById('help-screen')!.classList.remove('hidden')
    })
    document.getElementById('btn-help-close')!.addEventListener('click', () => {
      document.getElementById('help-screen')!.classList.add('hidden')
    })

    const standalone =
      matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      const ev = e as Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: string }> }
      this.installPrompt = () => ev.prompt()
      this.showInstall()
    })
    window.addEventListener('appinstalled', () => {
      this.installFab.classList.add('hidden')
      this.installBtn.classList.add('hidden')
      this.showToast('App instalada. Ábrela desde el icono de tu pantalla de inicio.')
    })
    const openHelp = () => {
      const steps = document.getElementById('install-steps')!
      const note = document.getElementById('install-note')!
      if (ios) {
        steps.innerHTML = '<li>Toca el botón Compartir (⬆) de Safari.</li><li>Elige «Añadir a pantalla de inicio».</li><li>Confirma con «Añadir».</li>'
        note.textContent = 'En iPhone no existe el aviso automático: Apple obliga a hacerlo desde Compartir.'
      } else if (/Android/i.test(navigator.userAgent)) {
        steps.innerHTML = '<li>Abre el menú ⋮ de Chrome.</li><li>Toca «Instalar app» o «Añadir a pantalla de inicio».</li><li>Confirma con «Instalar».</li>'
        note.textContent = 'Si Chrome dice que ya está instalada y no ves el icono: escribe chrome://webapks en la barra, busca Cobalt Coast y pulsa Desinstalar. Después vuelve a intentarlo.'
      } else {
        steps.innerHTML = '<li>Pulsa el icono de instalar de la barra de direcciones.</li><li>O abre el menú ⋮ y elige «Instalar Cobalt Coast».</li>'
        note.textContent = 'Si el navegador dice que ya está instalada, desinstálala primero desde el menú de la app o desde la barra de direcciones.'
      }
      document.getElementById('install-help')!.classList.remove('hidden')
    }
    document.getElementById('install-help-close')!.addEventListener('click', () => {
      document.getElementById('install-help')!.classList.add('hidden')
    })
    this.installFab.addEventListener('click', () => {
      if (this.installPrompt) {
        void this.installPrompt()
        return
      }
      openHelp()
    })
    this.installBtn.addEventListener('click', () => {
      if (this.installPrompt) void this.installPrompt()
      else openHelp()
    })

    if (!standalone && (ios || matchMedia('(pointer: coarse)').matches)) {
      this.installFab.textContent = this.installPrompt ? 'INSTALAR APP' : 'CÓMO INSTALAR'
      this.installFab.classList.remove('hidden')
    }
  }

  private showInstall() {
    this.installFab.textContent = 'INSTALAR APP'
    this.installFab.classList.remove('hidden')
    this.installBtn.classList.remove('hidden')
  }

  private showToast(message: string) {
    this.installToast.textContent = message
    this.installToast.classList.remove('hidden')
    window.clearTimeout(this.toastTimer)
    this.toastTimer = window.setTimeout(() => this.installToast.classList.add('hidden'), 7000)
  }

  private toastTimer = 0

  private buildRail() {
    this.rail.innerHTML = ''
    KART_SPECS.forEach((spec, i) => {
      const body = `#${spec.body.toString(16).padStart(6, '0')}`
      const accent = `#${spec.accent.toString(16).padStart(6, '0')}`
      const card = document.createElement('button')
      card.className = 'car-card'
      card.innerHTML = `
        <div class="car-thumb" style="--c1:${body};--c2:${accent}">${carSvg(spec.style, body, accent)}</div>
        <div class="car-name">${spec.name}</div>
        <div class="car-tag">${spec.tag}</div>
      `
      card.addEventListener('click', () => this.select(i))
      this.rail.appendChild(card)
    })
  }

  private buildTracks() {
    this.trackRail.innerHTML = ''
    TRACKS.forEach((spec, i) => {
      const card = document.createElement('button')
      card.className = 'track-card'
      const canvas = document.createElement('canvas')
      canvas.width = 180
      canvas.height = 92
      const name = document.createElement('div')
      name.className = 'track-name'
      name.textContent = spec.name
      const tag = document.createElement('div')
      tag.className = 'track-tag'
      tag.textContent = spec.tagline
      card.append(canvas, name, tag)
      card.addEventListener('click', () => this.selectTrack(i))
      this.trackRail.appendChild(card)
      this.drawTrack(canvas, spec)
    })
  }

  private drawTrack(canvas: HTMLCanvasElement, spec: TrackSpec) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const outline = trackOutline(spec)
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
    for (const p of outline) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x)
      minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z)
    }
    const pad = 12
    const scale = Math.min((canvas.width - pad * 2) / (maxX - minX), (canvas.height - pad * 2) / (maxZ - minZ))
    const ox = (canvas.width - (maxX - minX) * scale) / 2
    const oy = (canvas.height - (maxZ - minZ) * scale) / 2
    const px = (x: number) => ox + (x - minX) * scale
    const py = (z: number) => oy + (z - minZ) * scale
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(4, 20, 32, 0.85)'
    ctx.lineWidth = 13
    ctx.beginPath()
    outline.forEach((p, i) => (i === 0 ? ctx.moveTo(px(p.x), py(p.z)) : ctx.lineTo(px(p.x), py(p.z))))
    ctx.closePath()
    ctx.stroke()
    ctx.strokeStyle = 'rgba(120, 235, 255, 0.9)'
    ctx.lineWidth = 3
    ctx.stroke()
    const start = outline[0]
    ctx.fillStyle = '#ffd166'
    ctx.beginPath()
    ctx.arc(px(start.x), py(start.z), 4, 0, Math.PI * 2)
    ctx.fill()
  }

  private selectTrack(index: number, notify = true) {
    this.selectedTrack = index
    Array.from(this.trackRail.children).forEach((el, i) => el.classList.toggle('selected', i === index))
    if (notify) this.cb.onTrack(index)
  }

  get track(): number {
    return this.selectedTrack
  }

  get car(): number {
    return this.selected
  }

  private select(index: number) {
    this.selected = index
    this.cb.onCar(index)
    Array.from(this.rail.children).forEach((el, i) => el.classList.toggle('selected', i === index))
    const stats = KART_SPECS[index].stats
    const bars: Record<string, number> = {
      speed: (stats.maxSpeed - 34) / 8,
      accel: (stats.accel - 14) / 9,
      grip: (stats.turn - 1.8) / 0.7,
    }
    for (const el of Array.from(this.stats.querySelectorAll<HTMLElement>('[data-stat]'))) {
      const key = el.dataset.stat!
      el.style.width = `${Math.round(Math.min(1, Math.max(0.2, bars[key])) * 100)}%`
    }
  }

  showTitle() {
    this.title.classList.remove('hidden')
    this.results.classList.add('hidden')
    this.pause.classList.add('hidden')
  }

  showRace() {
    this.title.classList.add('hidden')
    this.results.classList.add('hidden')
    this.pause.classList.add('hidden')
  }

  showPause(on: boolean) {
    this.pause.classList.toggle('hidden', !on)
  }

  showResults(
    standings: Standing[],
    playerBest: number,
    totalTime: number,
    win: boolean,
    cup?: CupResult,
  ) {
    const title = document.getElementById('results-title')!
    const time = document.getElementById('results-time')!
    const list = document.getElementById('standings')!
    const player = standings.find((s) => s.isPlayer)
    title.textContent = cup?.final && cup.champion ? 'CAMPEÓN DE COPA' : win ? '¡VICTORIA!' : `${player?.rank}º PUESTO`
    void win
    const cupEl = document.getElementById('results-cup')!
    const again = document.getElementById('btn-again')!
    const label = again.querySelector('.btn-label')!
    if (cup) {
      cupEl.classList.remove('hidden')
      if (cup.final) {
        cupEl.textContent = `TOTAL COPA · ${cup.total} PTS`
        label.textContent = 'NUEVA COPA'
      } else {
        cupEl.textContent = `COPA · ${cup.points} PTS · SIGUIENTE: ${cup.next ?? ''}`
        label.textContent = 'SIGUIENTE CARRERA'
      }
    } else {
      cupEl.classList.add('hidden')
      label.textContent = 'OTRA CARRERA'
    }
    time.textContent = `${format(totalTime)}  ·  MEJOR VUELTA ${format(playerBest)}`
    list.innerHTML = standings
      .map(
        (s) => `<div class="row ${s.isPlayer ? 'you' : ''}">
          <span class="rank">${s.rank}</span>
          <span class="swatch" style="background:${s.color}"></span>
          <span class="name">${s.name}</span>
          <span class="time">${format(s.time)}</span>
          <span class="best">${isFinite(s.best) ? format(s.best) : ''}</span>
        </div>`,
      )
      .join('')
    this.title.classList.add('hidden')
    this.pause.classList.add('hidden')
    this.results.classList.remove('hidden')
  }

  hideResults() {
    this.results.classList.add('hidden')
  }

  setTrackIndex(index: number) {
    this.selectTrack(index, false)
  }

  setQuality(q: Quality) {
    this.quality = q
    this.qualityBtn.textContent = `CALIDAD: ${QUALITY_LABELS[q]}`
  }
}

