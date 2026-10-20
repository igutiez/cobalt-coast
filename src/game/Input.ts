import type { KartInput } from './Kart.ts'

export class Input {
  private keys = new Set<string>()
  private touch = { left: false, right: false, brake: false, drift: false }
  private wheelSteer = 0
  onCameraDrag: ((dy: number) => void) | null = null
  private itemQueued = false
  private pauseQueued = false
  private respawnQueued = false
  private cameraQueued = false
  private readonly onKeyDown: (e: KeyboardEvent) => void
  private readonly onKeyUp: (e: KeyboardEvent) => void
  readonly isTouch = matchMedia('(pointer: coarse)').matches

  constructor() {
    this.onKeyDown = (e) => {
      const k = e.key.toLowerCase()
      if (
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) ||
        ['w', 'a', 's', 'd'].includes(k)
      ) {
        e.preventDefault()
      }
      this.keys.add(k)
      if (k === ' ' || k === 'e' || k === 'shift' || k === 'enter') this.itemQueued = true
      if (k === 'escape' || k === 'p') this.pauseQueued = true
      if (k === 'r') this.respawnQueued = true
      if (k === 'c') this.cameraQueued = true
    }
    this.onKeyUp = (e) => this.keys.delete(e.key.toLowerCase())
    window.addEventListener('keydown', this.onKeyDown, { passive: false })
    window.addEventListener('keyup', this.onKeyUp)
  }

  attachTouch(root: HTMLElement) {
    const buttons = root.querySelectorAll<HTMLElement>('[data-touch]')
    const set = (el: HTMLElement, on: boolean) => {
      const key = el.dataset.touch as string
      if (key === 'item') {
        if (on) this.itemQueued = true
        el.classList.toggle('pressed', on)
        return
      }
      this.touch[key as keyof typeof this.touch] = on
      el.classList.toggle('pressed', on)
    }
    this.attachWheel(root)

    buttons.forEach((el) => {
      const down = (e: PointerEvent) => {
        e.preventDefault()
        try {
          el.setPointerCapture(e.pointerId)
        } catch {
          // Synthetic pointers have no capture target; the pressed state still applies.
        }
        set(el, true)
      }
      const up = (e: PointerEvent) => {
        e.preventDefault()
        set(el, false)
      }
      el.addEventListener('pointerdown', down)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
      el.addEventListener('lostpointercapture', up)
      el.addEventListener('contextmenu', (e) => e.preventDefault())
    })
  }

  private attachWheel(root: HTMLElement) {
    const wheel = root.querySelector<HTMLElement>('#touch-wheel')
    const rotor = root.querySelector<HTMLElement>('#touch-wheel-rotor')
    if (!wheel || !rotor) return
    const maxAngle = 105
    let pointerId: number | null = null
    let startX = 0
    let base = 0
    let current = 0
    const apply = (deg: number) => {
      current = deg
      rotor.style.transform = `rotate(${deg}deg)`
      const raw = -deg / maxAngle
      this.wheelSteer = Math.abs(raw) < 0.07 ? 0 : raw
    }
    wheel.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      pointerId = e.pointerId
      try {
        wheel.setPointerCapture(e.pointerId)
      } catch {
        // Synthetic pointers have no capture target; dragging still works.
      }
      startX = e.clientX
      base = current
      wheel.classList.add('active')
    })
    const end = (e: PointerEvent) => {
      if (pointerId === null || e.pointerId !== pointerId) return
      pointerId = null
      wheel.classList.remove('active')
      const from = current
      const t0 = performance.now()
      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / 260)
        const eased = 1 - Math.pow(1 - t, 3)
        apply(from * (1 - eased))
        if (t < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }
    window.addEventListener('pointermove', (e) => {
      if (pointerId === null || e.pointerId !== pointerId) return
      e.preventDefault()
      const deg = Math.max(-maxAngle, Math.min(maxAngle, base + (e.clientX - startX) * 1.45))
      apply(deg)
    })
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  attachCamera(canvas: HTMLCanvasElement) {
    let dragId: number | null = null
    let lastY = 0
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      dragId = e.pointerId
      lastY = e.clientY
    })
    window.addEventListener('pointermove', (e) => {
      if (dragId === null || e.pointerId !== dragId) return
      const dy = e.clientY - lastY
      lastY = e.clientY
      if (Math.abs(dy) > 0.4) this.onCameraDrag?.(dy)
    })
    const end = (e: PointerEvent) => {
      if (dragId === e.pointerId) dragId = null
    }
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  read(): KartInput {
    const left = this.keys.has('arrowleft') || this.keys.has('a') || this.touch.left
    const right = this.keys.has('arrowright') || this.keys.has('d') || this.touch.right
    const pressed = (left ? 1 : 0) - (right ? 1 : 0)
    return {
      steer: Math.max(-1, Math.min(1, pressed + this.wheelSteer)),
      brake: this.keys.has('arrowdown') || this.keys.has('s') || this.touch.brake,
      drift: this.keys.has(' ') || this.keys.has('shift') || this.touch.drift,
      item: false,
    }
  }

  consumeItem(): boolean {
    const v = this.itemQueued
    this.itemQueued = false
    return v
  }

  consumePause(): boolean {
    const v = this.pauseQueued
    this.pauseQueued = false
    return v
  }

  consumeCamera(): boolean {
    const v = this.cameraQueued
    this.cameraQueued = false
    return v
  }

  consumeRespawn(): boolean {
    const v = this.respawnQueued
    this.respawnQueued = false
    return v
  }
}
