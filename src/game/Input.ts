import type { KartInput } from './Kart.ts'

export class Input {
  private keys = new Set<string>()
  private touch = { left: false, right: false, brake: false, drift: false }
  private itemQueued = false
  private pauseQueued = false
  private respawnQueued = false
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

  read(): KartInput {
    const left = this.keys.has('arrowleft') || this.keys.has('a') || this.touch.left
    const right = this.keys.has('arrowright') || this.keys.has('d') || this.touch.right
    return {
      steer: (left ? 1 : 0) - (right ? 1 : 0),
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

  consumeRespawn(): boolean {
    const v = this.respawnQueued
    this.respawnQueued = false
    return v
  }
}
