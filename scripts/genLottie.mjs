import { writeFileSync } from 'fs'

// Elle üretilmiş, telifsiz Lottie JSON animasyonları (Rhino Kids savana paleti).
// Lottie schema v5.7. Birimler: fr=frame, ip/op=in/out point, ks=transform.
// Renkler 0..1 normalize RGB.

const OUT = '/Users/creditreform/Projects/rhino-app/src/animations'

const C = {
  mango: [0.98, 0.57, 0.24],
  yellow: [0.99, 0.88, 0.28],
  green: [0.44, 0.62, 0.34],
  pink: [0.96, 0.65, 0.72],
  cream: [0.99, 0.95, 0.88],
  deep: [0.36, 0.27, 0.21],
}

// ── Tek bir parçacık (kare) shape layer'ı: yukarıdan düşer, döner, solar ──
function confettiPiece(idx, color, startX, fall, rot, delay, fr) {
  const size = 18 + (idx % 3) * 8
  return {
    ddd: 0, ind: idx + 10, ty: 4, nm: `p${idx}`, sr: 1,
    ks: {
      o: { a: 1, k: [
        { t: delay, s: [0] },
        { t: delay + 6, s: [100] },
        { t: fr - 10, s: [100] },
        { t: fr, s: [0] },
      ] },
      r: { a: 1, k: [
        { t: delay, s: [0] },
        { t: fr, s: [rot] },
      ] },
      p: { a: 1, k: [
        { t: delay, s: [startX, -40] },
        { t: fr, s: [startX + (idx % 2 ? 60 : -60), fall] },
      ] },
      a: { a: 0, k: [0, 0] },
      s: { a: 0, k: [100, 100] },
    },
    shapes: [{
      ty: 'gr',
      it: [
        { ty: 'rc', d: 1, s: { a: 0, k: [size, size] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 4 } },
        { ty: 'fl', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, r: 1 },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
      ],
    }],
    ip: 0, op: fr, st: 0, bm: 0,
  }
}

function confetti() {
  const fr = 75 // ~1.25s @ 60fps
  const W = 512, H = 512
  const palette = [C.mango, C.yellow, C.green, C.pink, C.cream]
  const layers = []
  const N = 24
  for (let i = 0; i < N; i++) {
    const x = 40 + (i * 437) / N + ((i * 53) % 40)
    const color = palette[i % palette.length]
    const fall = 420 + ((i * 37) % 90)
    const rot = (i % 2 ? 1 : -1) * (180 + (i * 47) % 360)
    const delay = (i % 6) * 3
    layers.push(confettiPiece(i, color, x, fall, rot, delay, fr))
  }
  return {
    v: '5.7.4', fr: 60, ip: 0, op: fr, w: W, h: H, nm: 'confetti', ddd: 0,
    assets: [], layers,
  }
}

// ── Rozet pop: ortada büyüyüp hafif sallanan yıldız + parıltı halkası ──
function star(cx, cy, color, fr) {
  return {
    ddd: 0, ind: 2, ty: 4, nm: 'star', sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 1, k: [
        { t: 0, s: [-20] },
        { t: 14, s: [10] },
        { t: 26, s: [0] },
      ] },
      p: { a: 0, k: [cx, cy] },
      a: { a: 0, k: [0, 0] },
      s: { a: 1, k: [
        { t: 0, s: [0, 0] },
        { t: 16, s: [120, 120] },
        { t: 24, s: [100, 100] },
        { t: fr - 8, s: [100, 100] },
        { t: fr, s: [0, 0] },
      ] },
    },
    shapes: [{
      ty: 'gr',
      it: [
        { ty: 'sr', sy: 1, d: 1, pt: { a: 0, k: 5 }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 },
          ir: { a: 0, k: 40 }, is: { a: 0, k: 0 }, or: { a: 0, k: 95 }, os: { a: 0, k: 0 } },
        { ty: 'fl', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, r: 1 },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
      ],
    }],
    ip: 0, op: fr, st: 0, bm: 0,
  }
}

function ring(cx, cy, color, fr) {
  return {
    ddd: 0, ind: 1, ty: 4, nm: 'ring', sr: 1,
    ks: {
      o: { a: 1, k: [
        { t: 0, s: [0] },
        { t: 10, s: [80] },
        { t: 40, s: [0] },
      ] },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [cx, cy] },
      a: { a: 0, k: [0, 0] },
      s: { a: 1, k: [
        { t: 0, s: [20, 20] },
        { t: 40, s: [180, 180] },
      ] },
    },
    shapes: [{
      ty: 'gr',
      it: [
        { ty: 'el', d: 1, s: { a: 0, k: [120, 120] }, p: { a: 0, k: [0, 0] } },
        { ty: 'st', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 10 }, lc: 2, lj: 1 },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
      ],
    }],
    ip: 0, op: fr, st: 0, bm: 0,
  }
}

function badge() {
  const fr = 60 // 1s @ 60fps
  const W = 512, H = 512
  return {
    v: '5.7.4', fr: 60, ip: 0, op: fr, w: W, h: H, nm: 'badge', ddd: 0,
    assets: [],
    layers: [
      ring(256, 256, C.yellow, fr),
      star(256, 256, C.mango, fr),
    ],
  }
}

writeFileSync(`${OUT}/confetti.json`, JSON.stringify(confetti()))
writeFileSync(`${OUT}/badge.json`, JSON.stringify(badge()))
console.log('wrote confetti.json + badge.json')
