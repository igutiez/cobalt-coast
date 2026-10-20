/**
 * Procedural audio: engine, wind, drift, impact and UI cues plus a small synth
 * music loop. Everything is synthesized at runtime, so the PWA ships no audio
 * assets.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null
  private master!: GainNode
  private musicGain!: GainNode
  private sfxGain!: GainNode
  private engineGain!: GainNode
  private engineFilter!: BiquadFilterNode
  private engineOsc!: OscillatorNode
  private engineOsc2!: OscillatorNode
  private subOsc!: OscillatorNode
  private windGain!: GainNode
  private driftGain!: GainNode
  private driftFilter!: BiquadFilterNode
  private noiseBuffer: AudioBuffer | null = null
  private musicTimer: number | null = null
  private nextNote = 0
  private step = 0
  enabled = true
  musicOn = true

  get ready(): boolean {
    return this.ctx !== null
  }

  async unlock() {
    if (!this.ctx) this.build()
    if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume()
  }

  private build() {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0.75
    this.master.connect(ctx.destination)

    this.musicGain = ctx.createGain()
    this.musicGain.gain.value = 0.0
    this.musicGain.connect(this.master)
    this.sfxGain = ctx.createGain()
    this.sfxGain.gain.value = 0.9
    this.sfxGain.connect(this.master)

    this.noiseBuffer = this.makeNoise(ctx, 2)

    this.engineGain = ctx.createGain()
    this.engineGain.gain.value = 0
    this.engineFilter = ctx.createBiquadFilter()
    this.engineFilter.type = 'lowpass'
    this.engineFilter.frequency.value = 900
    this.engineFilter.Q.value = 3
    this.engineFilter.connect(this.engineGain)
    this.engineGain.connect(this.sfxGain)

    this.engineOsc = ctx.createOscillator()
    this.engineOsc.type = 'sawtooth'
    this.engineOsc.frequency.value = 70
    this.engineOsc.connect(this.engineFilter)
    this.engineOsc.start()

    this.engineOsc2 = ctx.createOscillator()
    this.engineOsc2.type = 'square'
    this.engineOsc2.frequency.value = 35
    const secondGain = ctx.createGain()
    secondGain.gain.value = 0.35
    this.engineOsc2.connect(secondGain)
    secondGain.connect(this.engineFilter)
    this.engineOsc2.start()

    this.subOsc = ctx.createOscillator()
    this.subOsc.type = 'sine'
    this.subOsc.frequency.value = 40
    const subGain = ctx.createGain()
    subGain.gain.value = 0.25
    this.subOsc.connect(subGain)
    subGain.connect(this.engineGain)
    this.subOsc.start()

    const wind = ctx.createBufferSource()
    wind.buffer = this.noiseBuffer
    wind.loop = true
    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'bandpass'
    windFilter.frequency.value = 700
    windFilter.Q.value = 0.7
    this.windGain = ctx.createGain()
    this.windGain.gain.value = 0
    wind.connect(windFilter)
    windFilter.connect(this.windGain)
    this.windGain.connect(this.sfxGain)
    wind.start()

    const drift = ctx.createBufferSource()
    drift.buffer = this.noiseBuffer
    drift.loop = true
    this.driftFilter = ctx.createBiquadFilter()
    this.driftFilter.type = 'bandpass'
    this.driftFilter.frequency.value = 2600
    this.driftFilter.Q.value = 4
    this.driftGain = ctx.createGain()
    this.driftGain.gain.value = 0
    drift.connect(this.driftFilter)
    this.driftFilter.connect(this.driftGain)
    this.driftGain.connect(this.sfxGain)
    drift.start()
  }

  private makeNoise(ctx: AudioContext, seconds: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  setEnabled(on: boolean) {
    this.enabled = on
    if (this.ctx) this.master.gain.value = on ? 0.75 : 0
  }

  setMusic(on: boolean) {
    this.musicOn = on
    if (!this.ctx) return
    this.musicGain.gain.setTargetAtTime(on ? 0.3 : 0, this.ctx.currentTime, 0.3)
    if (on) this.startMusic()
    else this.stopMusic()
  }

  engine(speed: number, max: number, throttle: number, boost: boolean, offroad: boolean) {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const ratio = Math.min(1.3, speed / max)
    const rpm = 0.25 + ratio
    const base = 58 + rpm * 120 + (boost ? 30 : 0)
    this.engineOsc.frequency.setTargetAtTime(base, t, 0.06)
    this.engineOsc2.frequency.setTargetAtTime(base * 0.5, t, 0.08)
    this.subOsc.frequency.setTargetAtTime(base * 0.5, t, 0.1)
    this.engineFilter.frequency.setTargetAtTime(560 + rpm * 1500 + (boost ? 900 : 0), t, 0.08)
    const vol = this.enabled ? (0.045 + throttle * 0.055 + ratio * 0.055) * (offroad ? 1.15 : 1) : 0
    this.engineGain.gain.setTargetAtTime(vol, t, 0.1)
    this.windGain.gain.setTargetAtTime(this.enabled ? ratio * ratio * 0.16 : 0, t, 0.2)
  }

  drift(active: boolean, intensity: number) {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.driftGain.gain.setTargetAtTime(active && this.enabled ? 0.1 + intensity * 0.16 : 0, t, 0.05)
    this.driftFilter.frequency.setTargetAtTime(1800 + intensity * 2200, t, 0.08)
  }

  silenceEngine() {
    if (!this.ctx) return
    this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
    this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
    this.driftGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1)
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, slide = 0, delay = 0) {
    if (!this.ctx || !this.enabled) return
    const t = this.ctx.currentTime + delay
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(t)
    osc.stop(t + dur + 0.05)
  }

  private noise(dur: number, vol: number, freq: number, type: BiquadFilterType = 'lowpass', delay = 0) {
    if (!this.ctx || !this.enabled || !this.noiseBuffer) return
    const t = this.ctx.currentTime + delay
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.setValueAtTime(freq, t)
    filter.frequency.exponentialRampToValueAtTime(Math.max(60, freq * 0.25), t + dur)
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain)
    src.start(t)
    src.stop(t + dur + 0.05)
  }

  click() {
    this.tone(520, 0.07, 'square', 0.05, 120)
  }

  pickup() {
    this.tone(660, 0.1, 'triangle', 0.1)
    this.tone(880, 0.12, 'triangle', 0.08, 0, 0.06)
    this.tone(1320, 0.16, 'sine', 0.05, 0, 0.12)
  }

  itemUse() {
    this.tone(180, 0.35, 'sawtooth', 0.1, 300)
    this.noise(0.4, 0.14, 1800, 'bandpass')
  }

  explosion() {
    this.noise(0.55, 0.35, 900)
    this.tone(70, 0.5, 'sine', 0.2, -40)
  }

  hit() {
    this.tone(140, 0.18, 'square', 0.12, -80)
    this.noise(0.22, 0.18, 1400)
  }

  boost() {
    this.noise(0.6, 0.2, 2600, 'bandpass')
    this.tone(220, 0.5, 'sawtooth', 0.07, 420)
  }

  lap() {
    this.tone(880, 0.12, 'triangle', 0.07)
    this.tone(1174, 0.18, 'triangle', 0.06, 0, 0.1)
  }

  countdown(final: boolean) {
    this.tone(final ? 1046 : 523, final ? 0.5 : 0.16, 'square', 0.09)
  }

  finish() {
    const notes = [523, 659, 784, 1046, 1318]
    notes.forEach((f, i) => this.tone(f, 0.32, 'triangle', 0.08, 0, i * 0.12))
  }

  startMusic() {
    if (!this.ctx || this.musicTimer !== null || !this.musicOn) return
    this.nextNote = this.ctx.currentTime + 0.1
    this.step = 0
    this.musicGain.gain.setTargetAtTime(0.26, this.ctx.currentTime, 0.4)
    this.musicTimer = window.setInterval(() => this.schedule(), 25)
  }

  stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer)
      this.musicTimer = null
    }
    if (this.ctx) this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4)
  }

  private schedule() {
    if (!this.ctx || !this.musicOn) return
    const tempo = 112
    const stepDur = 60 / tempo / 4
    while (this.nextNote < this.ctx.currentTime + 0.2) {
      this.playStep(this.step, this.nextNote, stepDur)
      this.step = (this.step + 1) % 64
      this.nextNote += stepDur
    }
  }

  private playStep(step: number, when: number, dur: number) {
    if (!this.ctx) return
    const bar = Math.floor(step / 16)
    const roots = [55, 43.65, 65.41, 49]
    const root = roots[bar]
    const inBar = step % 16
    const ctx = this.ctx
    const note = (freq: number, length: number, type: OscillatorType, vol: number, cutoff = 1400) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = cutoff
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, when)
      gain.gain.exponentialRampToValueAtTime(vol, when + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, when + length)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.musicGain)
      osc.start(when)
      osc.stop(when + length + 0.05)
    }
    if (inBar % 2 === 0) note(root, dur * 1.7, 'triangle', 0.22, 500)
    if (inBar === 0 || inBar === 6 || inBar === 10) note(root * 2, dur * 1.2, 'sawtooth', 0.05, 900)
    if (inBar === 4 || inBar === 12) {
      const chord = bar === 0 ? [220, 261.63, 329.63] : bar === 1 ? [174.61, 220, 261.63] : bar === 2 ? [261.63, 329.63, 392] : [196, 246.94, 293.66]
      chord.forEach((f) => note(f, dur * 6, 'sine', 0.035, 1200))
    }
    if (inBar % 4 === 2) this.hat(when, 0.05)
    if (step % 8 === 0) note(root / 2, dur * 1.4, 'sine', 0.18, 220)
  }

  private hat(when: number, vol: number) {
    if (!this.ctx || !this.noiseBuffer) return
    const src = this.ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 7000
    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(vol, when)
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.06)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(this.musicGain)
    src.start(when)
    src.stop(when + 0.08)
  }
}
