export type Flora = 'tropical' | 'sparse' | 'barren'

export interface TrackTheme {
  skyTop: number
  skyHorizon: number
  sunColor: number
  fog: number
  sandDry: number
  sandHigh: number
  sandWet: number
  waterDeep: number
  waterShallow: number
  waterSky: number
  sunLight: number
  ambient: number
  flora?: Flora
}

export interface TrackSpec {
  id: string
  name: string
  tagline: string
  radius: number
  a: number
  b: number
  c: number
  width: number
  accent: number
  bankScale: number
  elevA: number
  elevB: number
  h1: number
  h2: number
  h3: number
  theme: TrackTheme
}

export const TRACKS: TrackSpec[] = [
  {
    id: 'cobalt',
    accent: 0x2ff2df,
    name: 'COSTA DE COBALTO',
    tagline: 'CURVAS ABIERTAS · MAR EN CALMA',
    radius: 175,
    a: 24,
    b: 18,
    c: 8,
    width: 15.5,
    bankScale: 26,
    elevA: 0.7,
    elevB: 0.35,
    h1: 3,
    h2: 2,
    h3: 5,
    theme: {
      skyTop: 0x1f74bd,
      skyHorizon: 0xdff1ff,
      sunColor: 0xfff1d2,
      fog: 0xdcecf5,
      sandDry: 0xffe3b8,
      sandHigh: 0xf2d09a,
      sandWet: 0xb99a72,
      waterDeep: 0x04364f,
      waterShallow: 0x14a3a8,
      waterSky: 0xa6d9ee,
      sunLight: 0xffe8cc,
      ambient: 0xfff1e0,
    },
  },
  {
    id: 'laguna',
    accent: 0xff8a4c,
    name: 'LAGUNA REVUELTA',
    tagline: 'TRAMOS RATONEROS · ATARDECER',
    radius: 170,
    a: 22,
    b: 17,
    c: 7,
    width: 14,
    bankScale: 30,
    elevA: 0.9,
    elevB: 0.45,
    h1: 4,
    h2: 3,
    h3: 7,
    theme: {
      skyTop: 0x322a63,
      skyHorizon: 0xff9f63,
      sunColor: 0xffd49a,
      fog: 0xf2b48c,
      sandDry: 0xf6c692,
      sandHigh: 0xe4a878,
      sandWet: 0xa47c5c,
      waterDeep: 0x241a44,
      waterShallow: 0xd96b45,
      waterSky: 0xffb27a,
      sunLight: 0xffc9a0,
      ambient: 0xffd7bc,
    },
  },
  {
    id: 'dune',
    accent: 0xffc857,
    name: 'DUNAS VELOCES',
    tagline: 'RECTAS LARGAS · MEDIODÍA',
    radius: 200,
    a: 16,
    b: 28,
    c: 6,
    width: 16.5,
    bankScale: 18,
    elevA: 1.2,
    elevB: 0.5,
    h1: 2,
    h2: 3,
    h3: 4,
    theme: {
      skyTop: 0x1b6fb8,
      skyHorizon: 0xeaf8ff,
      sunColor: 0xffffff,
      fog: 0xe8f4ff,
      sandDry: 0xfff0cf,
      sandHigh: 0xf7dfa9,
      sandWet: 0xc9b08a,
      waterDeep: 0x0a4f6e,
      waterShallow: 0x2fd0c8,
      waterSky: 0xbfeaff,
      sunLight: 0xfff4dc,
      ambient: 0xfff8ea,
    },
  },
  {
    id: 'jungle',
    accent: 0x7bf06a,
    name: 'SELVA SALVAJE',
    tagline: 'TRAMOS CERRADOS · SELVA',
    radius: 152,
    a: 30,
    b: 14,
    c: 10,
    width: 14,
    bankScale: 30,
    elevA: 1.1,
    elevB: 0.55,
    h1: 5,
    h2: 4,
    h3: 9,
    theme: {
      skyTop: 0x11664f,
      skyHorizon: 0xe2f8cf,
      sunColor: 0xfff6c8,
      fog: 0xcfe9c4,
      sandDry: 0x9fb35e,
      sandHigh: 0x7f9448,
      sandWet: 0x51602f,
      waterDeep: 0x0b3b2f,
      waterShallow: 0x2f9e7a,
      waterSky: 0x9fe0c8,
      sunLight: 0xfff0c0,
      ambient: 0xd8f0c8,
      flora: 'tropical',
    },
  },
  {
    id: 'volcano',
    accent: 0xff4a2a,
    name: 'BORDE DEL VOLCÁN',
    tagline: 'PERALTES FUERTES · CENIZA',
    radius: 188,
    a: 21,
    b: 23,
    c: 12,
    width: 15,
    bankScale: 22,
    elevA: 1.4,
    elevB: 0.6,
    h1: 6,
    h2: 5,
    h3: 8,
    theme: {
      skyTop: 0x2a0f14,
      skyHorizon: 0xff5a2a,
      sunColor: 0xffb070,
      fog: 0x7a2a1e,
      sandDry: 0x3a2c28,
      sandHigh: 0x2e2422,
      sandWet: 0x1c1513,
      waterDeep: 0x2a0a06,
      waterShallow: 0xff6a2a,
      waterSky: 0xff9a5a,
      sunLight: 0xffb070,
      ambient: 0xff8a5a,
      flora: 'barren',
    },
  },
  {
    id: 'arctic',
    accent: 0x8fd8ff,
    name: 'BUCLE ÁRTICO',
    tagline: 'RÁPIDO Y ABIERTO · HIELO',
    radius: 212,
    a: 18,
    b: 20,
    c: 4,
    width: 17,
    bankScale: 16,
    elevA: 0.5,
    elevB: 0.3,
    h1: 2,
    h2: 2,
    h3: 3,
    theme: {
      skyTop: 0x9fc7e8,
      skyHorizon: 0xffffff,
      sunColor: 0xffffff,
      fog: 0xeaf6ff,
      sandDry: 0xf4fbff,
      sandHigh: 0xe2f0fa,
      sandWet: 0xc8dce8,
      waterDeep: 0x1d4f6e,
      waterShallow: 0x5fb8d8,
      waterSky: 0xd8f2ff,
      sunLight: 0xffffff,
      ambient: 0xe8f4ff,
      flora: 'barren',
    },
  },
  {
    id: 'harbor',
    accent: 0x9fb8c8,
    name: 'CIRCUITO DEL PUERTO',
    tagline: 'ASFALTO Y DIQUES · TARDE',
    radius: 162,
    a: 26,
    b: 13,
    c: 6,
    width: 15.5,
    bankScale: 28,
    elevA: 0.8,
    elevB: 0.4,
    h1: 3,
    h2: 2,
    h3: 6,
    theme: {
      skyTop: 0x3a5a72,
      skyHorizon: 0xd8e6ee,
      sunColor: 0xfff0d0,
      fog: 0xc8d8e0,
      sandDry: 0x9aa4a8,
      sandHigh: 0x8a9498,
      sandWet: 0x6a7478,
      waterDeep: 0x123a4a,
      waterShallow: 0x2a7a8a,
      waterSky: 0x8ab8c8,
      sunLight: 0xfff0d0,
      ambient: 0xd8e0e8,
      flora: 'sparse',
    },
  },
  {
    id: 'canyon',
    accent: 0xd85a2a,
    name: 'CAÑÓN VELOZ',
    tagline: 'CURVAS CIEGAS · ROCA ROJA',
    radius: 178,
    a: 14,
    b: 30,
    c: 10,
    width: 16,
    bankScale: 20,
    elevA: 1.3,
    elevB: 0.6,
    h1: 4,
    h2: 5,
    h3: 7,
    theme: {
      skyTop: 0x3a6aa8,
      skyHorizon: 0xffe0b0,
      sunColor: 0xffe0b0,
      fog: 0xf0c890,
      sandDry: 0xd88a4a,
      sandHigh: 0xc07038,
      sandWet: 0x8a4a24,
      waterDeep: 0x1a4a5a,
      waterShallow: 0x3aa0a0,
      waterSky: 0xa0d8d0,
      sunLight: 0xffe0b0,
      ambient: 0xffd8b0,
      flora: 'barren',
    },
  },
  {
    id: 'neon',
    accent: 0xff4ad8,
    name: 'BAHÍA NEÓN',
    tagline: 'NOCHE · CURVAS RÁPIDAS',
    radius: 168,
    a: 28,
    b: 16,
    c: 14,
    width: 15,
    bankScale: 26,
    elevA: 1.0,
    elevB: 0.5,
    h1: 4,
    h2: 3,
    h3: 7,
    theme: {
      skyTop: 0x050a1a,
      skyHorizon: 0x1a3a6a,
      sunColor: 0x9ac8ff,
      fog: 0x0a1428,
      sandDry: 0x1a2a3a,
      sandHigh: 0x22384a,
      sandWet: 0x0e1a26,
      waterDeep: 0x021018,
      waterShallow: 0x0a5a7a,
      waterSky: 0x2a9ac0,
      sunLight: 0x9ac8ff,
      ambient: 0x4a6a9a,
      flora: 'sparse',
    },
  },
]

/** Closed outline of a circuit for the menu mini-map, normalized to 0..1. */
export function trackOutline(spec: TrackSpec, count = 120): { x: number; z: number }[] {
  const pts: { x: number; z: number }[] = []
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2
    const r =
      spec.radius +
      spec.a * Math.sin(spec.h1 * t) +
      spec.b * Math.cos(spec.h2 * t) +
      spec.c * Math.sin(spec.h3 * t + 0.6)
    pts.push({ x: Math.cos(t) * r, z: Math.sin(t) * r })
  }
  return pts
}
