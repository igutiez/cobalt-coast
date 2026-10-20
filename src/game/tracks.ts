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
    name: 'COBALT COAST',
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
    name: 'LAGUNA TWIST',
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
    name: 'DUNE SPRINT',
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
