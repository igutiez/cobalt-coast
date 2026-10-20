import * as THREE from 'three'

const cache = new Map<string, THREE.Texture>()

function canvas(size: number, height = size): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = size
  c.height = height
  const ctx = c.getContext('2d')!
  return [c, ctx]
}

function finish(c: HTMLCanvasElement, repeat?: [number, number]): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(repeat[0], repeat[1])
  }
  return tex
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, alpha: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount
    d[i] = Math.max(0, Math.min(255, d[i] + n))
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n))
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n))
    d[i + 3] = Math.max(0, Math.min(255, d[i + 3] * alpha + 255 * (1 - alpha)))
  }
  ctx.putImageData(img, 0, 0)
}

export function roadTexture(): THREE.Texture {
  const key = 'road'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(512)
  const g = ctx.createLinearGradient(0, 0, 512, 0)
  g.addColorStop(0, '#5c6168')
  g.addColorStop(0.5, '#727880')
  g.addColorStop(1, '#5c6168')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const r = Math.random() * 2.2
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0},${Math.random() > 0.5 ? 255 : 0},255,${Math.random() * 0.05})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(255,255,255,0.62)'
  ctx.fillRect(18, 0, 5, 512)
  ctx.fillRect(489, 0, 5, 512)
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  for (let y = 0; y < 512; y += 128) {
    ctx.fillRect(254, y + 24, 5, 80)
  }
  grain(ctx, 512, 512, 26, 0.6)
  const tex = finish(c, [1, 1])
  cache.set(key, tex)
  return tex
}

export function sandNormal(): THREE.Texture {
  const key = 'sand-normal'
  if (cache.has(key)) return cache.get(key)!
  const size = 128
  const height = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size
      const v = y / size
      height[y * size + x] =
        Math.sin(u * Math.PI * 2 * 9 + Math.sin(v * Math.PI * 2 * 4) * 1.6) * 0.5 +
        Math.sin(v * Math.PI * 2 * 13 + Math.sin(u * Math.PI * 2 * 5) * 1.2) * 0.35 +
        (Math.random() - 0.5) * 0.18
    }
  }
  const [c, ctx] = canvas(size)
  const img = ctx.createImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const l = height[y * size + ((x - 1 + size) % size)]
      const r = height[y * size + ((x + 1) % size)]
      const d = height[((y - 1 + size) % size) * size + x]
      const u = height[((y + 1) % size) * size + x]
      const nx = (l - r) * 1.2
      const ny = (d - u) * 1.2
      const i = (y * size + x) * 4
      img.data[i] = Math.max(0, Math.min(255, (nx * 0.5 + 0.5) * 255))
      img.data[i + 1] = Math.max(0, Math.min(255, (ny * 0.5 + 0.5) * 255))
      img.data[i + 2] = 255
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  const tex = finish(c, [38, 38])
  cache.set(key, tex)
  return tex
}

export function sandTexture(): THREE.Texture {
  const key = 'sand'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(256)
  ctx.fillStyle = '#e9d2a6'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const a = Math.random() * 0.12
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,250,235,${a})` : `rgba(120,90,55,${a})`
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2)
  }
  const tex = finish(c, [220, 220])
  cache.set(key, tex)
  return tex
}

export function asphaltNormal(): THREE.Texture {
  const key = 'asphaltNormal'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(256)
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const s = 1 + Math.random() * 2
    const nx = 128 + (Math.random() - 0.5) * 90
    const ny = 128 + (Math.random() - 0.5) * 90
    ctx.fillStyle = `rgb(${nx | 0},${ny | 0},255)`
    ctx.fillRect(x, y, s, s)
  }
  const tex = finish(c, [8, 8])
  tex.colorSpace = THREE.NoColorSpace
  cache.set(key, tex)
  return tex
}

export function palmFrondTexture(): THREE.Texture {
  const key = 'frond'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(512, 256)
  ctx.clearRect(0, 0, 512, 256)
  ctx.translate(10, 128)
  ctx.strokeStyle = '#2f6a2c'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(220, -26, 490, -4)
  ctx.stroke()
  for (let i = 0; i < 34; i++) {
    const t = i / 34
    const x = t * 470
    const y = -8 - Math.sin(t * Math.PI) * 20
    const len = 104 * (1 - t * 0.5) * (0.5 + Math.sin(t * Math.PI) * 0.7)
    const droop = 0.55 + t * 0.5
    for (const side of [-1, 1]) {
      const g = ctx.createLinearGradient(x, y, x + len * 0.6, y + side * len)
      g.addColorStop(0, '#5fae4c')
      g.addColorStop(0.6, '#3f8a37')
      g.addColorStop(1, '#2a5f28')
      ctx.strokeStyle = g
      ctx.lineWidth = 13
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.quadraticCurveTo(x + len * 0.5, y + side * len * 0.35 * droop, x + len * 0.8, y + side * len * droop)
      ctx.stroke()
    }
  }
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export function cloudTexture(): THREE.Texture {
  const key = 'cloud'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(256)
  ctx.clearRect(0, 0, 256, 256)
  for (let i = 0; i < 26; i++) {
    const x = 60 + Math.random() * 136
    const y = 90 + Math.random() * 76
    const r = 22 + Math.random() * 42
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(0.55, 'rgba(255,245,235,0.22)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export function checkerTexture(): THREE.Texture {
  const key = 'checker'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(256, 64)
  const n = 16
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < n; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#f4f8ff' : '#101820'
      ctx.fillRect((x * 256) / n, (y * 64) / 2, 256 / n, 32)
    }
  }
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export function bannerTexture(title: string, subtitle: string): THREE.Texture {
  const key = `banner:${title}`
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(1024, 256)
  const g = ctx.createLinearGradient(0, 0, 1024, 256)
  g.addColorStop(0, '#082a3c')
  g.addColorStop(0.5, '#0e4a63')
  g.addColorStop(1, '#082a3c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 1024, 256)
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 ? '#f2f7ff' : '#0c1a24'
    ctx.fillRect(i * 64, 0, 64, 18)
    ctx.fillStyle = (i + 1) % 2 ? '#f2f7ff' : '#0c1a24'
    ctx.fillRect(i * 64, 238, 64, 18)
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  let size = 150
  ctx.font = `${size}px "Bebas Neue", Impact, sans-serif`
  while (ctx.measureText(title).width > 930 && size > 58) {
    size -= 6
    ctx.font = `${size}px "Bebas Neue", Impact, sans-serif`
  }
  ctx.fillStyle = 'rgba(47,242,223,0.25)'
  ctx.fillText(title, 512, 134)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(title, 512, 130)
  let subSize = 30
  ctx.font = `600 ${subSize}px Rajdhani, sans-serif`
  while (ctx.measureText(subtitle).width > 930 && subSize > 16) {
    subSize -= 2
    ctx.font = `600 ${subSize}px Rajdhani, sans-serif`
  }
  ctx.fillStyle = 'rgba(255,179,71,0.95)'
  ctx.fillText(subtitle, 512, 205)
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export type ItemKind = 'turbo' | 'missile' | 'shield' | 'oil'

const ITEM_STYLE: Record<ItemKind, { a: string; b: string; glyph: string }> = {
  turbo: { a: '#ffd166', b: '#ff5b2e', glyph: '⚡' },
  missile: { a: '#ff8fa3', b: '#e01e37', glyph: '🚀' },
  shield: { a: '#7dfcff', b: '#1379c9', glyph: '🛡' },
  oil: { a: '#b0bec5', b: '#263238', glyph: '🛢' },
}

export function itemIcon(kind: ItemKind): HTMLCanvasElement {
  const [c, ctx] = canvas(128)
  const s = ITEM_STYLE[kind]
  const g = ctx.createRadialGradient(64, 54, 6, 64, 64, 62)
  g.addColorStop(0, s.a)
  g.addColorStop(1, s.b)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(64, 64, 50, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.font = '58px "Apple Color Emoji","Segoe UI Emoji",sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 10
  ctx.fillText(s.glyph, 64, 70)
  return c
}

export function numberTexture(n: number): THREE.Texture {
  const key = `num-${n}`
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(128)
  ctx.clearRect(0, 0, 128, 128)
  ctx.fillStyle = '#f7fbff'
  ctx.beginPath()
  ctx.arc(64, 64, 58, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(6, 24, 38, 0.85)'
  ctx.lineWidth = 5
  ctx.stroke()
  ctx.fillStyle = '#0b1b2b'
  ctx.font = '86px "Bebas Neue", Impact, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(n), 64, 72)
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export function boardTexture(label: string, a: string, b: string): THREE.Texture {
  const key = `board-${label}`
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(512, 192)
  const g = ctx.createLinearGradient(0, 0, 512, 192)
  g.addColorStop(0, a)
  g.addColorStop(1, b)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 192)
  ctx.fillStyle = 'rgba(4, 16, 27, 0.65)'
  ctx.fillRect(0, 132, 512, 60)
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(0, 0, 512, 10)
  ctx.font = '92px "Bebas Neue", Impact, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(label, 256, 74)
  ctx.font = '600 26px Rajdhani, sans-serif'
  ctx.fillStyle = 'rgba(234,252,255,0.85)'
  ctx.fillText('COBALT COAST', 256, 162)
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export function tireTexture(): THREE.Texture {
  const key = 'tire'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(512, 128)
  ctx.fillStyle = '#15181b'
  ctx.fillRect(0, 0, 512, 128)
  for (let i = 0; i < 32; i++) {
    const x = (i / 32) * 512
    ctx.fillStyle = '#0a0c0e'
    ctx.fillRect(x, 0, 7, 128)
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.fillRect(x + 9, 0, 3, 128)
  }
  for (const y of [4, 120]) {
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(0, y, 512, 4)
  }
  const tex = finish(c, [1, 1])
  cache.set(key, tex)
  return tex
}

export function paintNormal(): THREE.Texture {
  const key = 'paintNormal'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(256)
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 22000; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    ctx.fillStyle = `rgb(${128 + (Math.random() - 0.5) * 14},${128 + (Math.random() - 0.5) * 14},255)`
    ctx.fillRect(x, y, 1, 1)
  }
  const tex = finish(c, [4, 4])
  tex.colorSpace = THREE.NoColorSpace
  cache.set(key, tex)
  return tex
}

export function softDotTexture(): THREE.Texture {
  const key = 'dot'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(64)
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.5)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export function smokeTexture(): THREE.Texture {
  const key = 'smoke'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(128)
  for (let i = 0; i < 18; i++) {
    const x = 64 + (Math.random() - 0.5) * 46
    const y = 64 + (Math.random() - 0.5) * 46
    const r = 16 + Math.random() * 30
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.32)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export function shadowTexture(): THREE.Texture {
  const key = 'shadow'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(128)
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64)
  g.addColorStop(0, 'rgba(0,0,0,0.55)')
  g.addColorStop(0.6, 'rgba(0,0,0,0.25)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = finish(c)
  cache.set(key, tex)
  return tex
}

export function guardrailTexture(): THREE.Texture {
  const key = 'guardrail'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(256)
  ctx.fillStyle = '#c9d2d8'
  ctx.fillRect(0, 0, 256, 256)
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, 'rgba(255,255,255,0.5)')
  grad.addColorStop(0.45, 'rgba(255,255,255,0.05)')
  grad.addColorStop(1, 'rgba(20,28,34,0.35)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = 'rgba(30, 40, 48, 0.5)'
  for (let x = 0; x < 256; x += 64) ctx.fillRect(x, 0, 5, 256)
  ctx.fillStyle = 'rgba(200, 60, 40, 0.85)'
  ctx.fillRect(0, 18, 256, 12)
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  for (let x = 0; x < 256; x += 64) ctx.fillRect(x, 18, 32, 12)
  grain(ctx, 256, 256, 18, 0.5)
  const tex = finish(c, [1, 1])
  cache.set(key, tex)
  return tex
}

export function barrierTexture(): THREE.Texture {
  const key = 'barrier'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(256, 128)
  ctx.fillStyle = '#f2f2ef'
  ctx.fillRect(0, 0, 256, 128)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, 256, 128)
  ctx.clip()
  ctx.fillStyle = '#d8402a'
  for (let x = -128; x < 384; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + 32, 0)
    ctx.lineTo(x + 32 - 128, 128)
    ctx.lineTo(x - 128, 128)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
  const tex = finish(c, [1, 1])
  cache.set(key, tex)
  return tex
}

export function skyCubeTexture(): THREE.CubeTexture {
  const key = 'sky-cube'
  if (cache.has(key)) return cache.get(key)! as THREE.CubeTexture
  const face = (top: string, mid: string, bottom: string) => {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 64)
    g.addColorStop(0, top)
    g.addColorStop(0.55, mid)
    g.addColorStop(1, bottom)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    return c
  }
  const side = () => face('#7fb8e6', '#dff1ff', '#e6d3aa')
  const tex = new THREE.CubeTexture([
    side(),
    side(),
    face('#cfeaff', '#bfe4ff', '#bfe4ff'),
    face('#e0c79a', '#c9a97a', '#c9a97a'),
    side(),
    side(),
  ])
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  cache.set(key, tex)
  return tex
}

export function grimeTexture(): THREE.Texture {
  const key = 'grime'
  if (cache.has(key)) return cache.get(key)!
  const [c, ctx] = canvas(256)
  ctx.fillStyle = '#9aa0a4'
  ctx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 420; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const r = 2 + Math.random() * 16
    ctx.fillStyle = `rgba(40, 38, 34, ${0.02 + Math.random() * 0.06})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * 256
    ctx.fillStyle = `rgba(30, 28, 25, ${0.04 + Math.random() * 0.05})`
    ctx.fillRect(x, 90 + Math.random() * 120, 3 + Math.random() * 9, 140)
  }
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, 'rgba(255,255,255,0.06)')
  g.addColorStop(0.6, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(30,26,22,0.5)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = finish(c, [1, 1])
  cache.set(key, tex)
  return tex
}
