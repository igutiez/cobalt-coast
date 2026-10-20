import './style.css'
import { Game } from './game/Game.ts'

const canvas = document.getElementById('scene') as HTMLCanvasElement
const boot = document.getElementById('boot')!
const fill = document.getElementById('boot-fill')!
const status = document.getElementById('boot-status')!
const rotate = document.getElementById('rotate-hint')!

declare global {
  interface Window {
    __game?: Game
    __buildId?: string
    __checkUpdate?: () => Promise<void>
    __forceUpdate?: () => Promise<void>
  }
}

function updateOrientation() {
  const portrait = window.innerHeight > window.innerWidth
  const touch = matchMedia('(pointer: coarse)').matches
  rotate.classList.toggle('hidden', !(touch && portrait))
}

function showFatal(message: string) {
  const boot = document.getElementById('boot')
  if (boot) {
    boot.classList.remove('done')
    const status = document.getElementById('boot-status')
    if (status) status.textContent = message
  }
  showFatalOverlay(message)
}

const VERSION_KEY = 'cobalt-build-id'

async function checkForUpdate() {
  if (!import.meta.env.PROD) return
  try {
    const response = await fetch(`./build.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) return
    const data = (await response.json()) as { id?: string }
    if (!data.id || data.id === __BUILD_ID__) return
    if (sessionStorage.getItem(VERSION_KEY) === data.id) return
    sessionStorage.setItem(VERSION_KEY, data.id)
    showUpdateBanner()
  } catch {
    // Offline or blocked storage: keep playing the cached version.
  }
}

function showFatalOverlay(message: string) {
  const fatal = document.getElementById('fatal')
  const text = document.getElementById('fatal-text')
  if (fatal) fatal.classList.remove('hidden')
  if (text) text.textContent = message
}

async function hardUpdate() {
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  } catch {
    // Storage blocked: the cache-busted navigation still fetches the network copy.
  }
  location.replace(`${location.pathname}?u=${Date.now()}`)
}

function showUpdateBanner() {
  const banner = document.getElementById('update-banner')
  if (!banner) return
  banner.classList.remove('hidden')
  banner.onclick = () => void hardUpdate()
}

document.getElementById('fatal-reload')?.addEventListener('click', () => location.reload())
window.addEventListener('webglcontextlost', () => {
  showFatalOverlay('El navegador perdió el contexto gráfico. Pulsa RECARGAR.')
})

async function main() {
  window.__buildId = __BUILD_ID__
  window.__forceUpdate = hardUpdate
  const badge = document.getElementById('build-badge')
  if (badge) {
    badge.textContent = `v ${__BUILD_ID__} · ACTUALIZAR`
    badge.addEventListener('click', () => void hardUpdate())
  }
  window.__checkUpdate = checkForUpdate
  window.addEventListener('error', (event) => {
    showFatal(`ERROR: ${event.message}`)
  })
  window.addEventListener('unhandledrejection', (event) => {
    showFatal(`ERROR: ${String(event.reason)}`)
  })
  updateOrientation()
  window.addEventListener('resize', updateOrientation)
  fill.style.width = '18%'
  await new Promise((r) => requestAnimationFrame(() => r(null)))
  status.textContent = 'SHAPING THE COASTLINE'
  await new Promise((r) => setTimeout(r, 60))
  fill.style.width = '46%'
  await new Promise((r) => requestAnimationFrame(() => r(null)))

  let game: Game
  try {
    game = new Game(canvas)
  } catch (error) {
    status.textContent = 'TU NAVEGADOR NO PUEDE CREAR EL CONTEXTO WEBGL'
    console.error(error)
    return
  }
  window.__game = game
  fill.style.width = '82%'
  status.textContent = 'TUNING THE BUGGIES'
  await new Promise((r) => setTimeout(r, 320))
  fill.style.width = '100%'
  status.textContent = 'READY'

  const started = performance.now()
  while (!game.hasRendered && performance.now() - started < 8000) {
    await new Promise((r) => setTimeout(r, 150))
  }
  if (!game.hasRendered) {
    status.textContent = `NO SE PUDO DIBUJAR · ${game.webglInfo}`
    showFatalOverlay(`WebGL no ha dibujado. ${game.webglInfo}`)
    return
  }

  await new Promise((r) => setTimeout(r, 200))
  boot.classList.add('done')
  window.setTimeout(() => boot.remove(), 900)

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => registration.update())
      .catch(() => {
        /* offline support is optional; the game runs without it */
      })
  }
  void checkForUpdate()
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkForUpdate()
  })
  window.setInterval(() => {
    if (document.visibilityState === 'visible') void checkForUpdate()
  }, 300000)
}

void main()
