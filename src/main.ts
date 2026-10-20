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
  }
}

function updateOrientation() {
  const portrait = window.innerHeight > window.innerWidth
  const touch = matchMedia('(pointer: coarse)').matches
  rotate.classList.toggle('hidden', !(touch && portrait))
}

function showFatal(message: string) {
  const boot = document.getElementById('boot')
  if (!boot) return
  boot.classList.remove('done')
  const status = document.getElementById('boot-status')
  if (status) status.textContent = message
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
    const toast = document.createElement('div')
    toast.className = 'update-toast'
    toast.textContent = 'NUEVA VERSIÓN · ACTUALIZANDO…'
    document.body.appendChild(toast)
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }
    window.setTimeout(() => location.reload(), 500)
  } catch {
    // Offline or blocked storage: keep playing the cached version.
  }
}

async function main() {
  window.__buildId = __BUILD_ID__
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
