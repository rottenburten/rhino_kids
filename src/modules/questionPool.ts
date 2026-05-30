import type { ModuleId, Level, Question } from '../types'

const RANGES: Record<Level, [number, number]> = {
  easy: [1, 5],
  mid: [1, 10],
  hard: [1, 20],
}

// ─── Fisher-Yates shuffle ───
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Tüm olası soruları üret ───
export function buildPool(module: ModuleId, level: Level): Question[] {
  const [lo, hi] = RANGES[level]
  const pool: Question[] = []

  switch (module) {
    case 'count':
      // 3 tur: aynı sayılar farklı emojilerle gelir
      for (let rep = 0; rep < 3; rep++) {
        for (let n = lo; n <= hi; n++) {
          pool.push({ type: 'count', a: n, ans: n })
        }
      }
      break

    case 'add':
      for (let a = 1; a <= hi; a++) {
        for (let b = 1; b <= hi; b++) {
          pool.push({ type: 'add', a, b, ans: a + b })
        }
      }
      break

    case 'sub':
      for (let a = Math.max(lo, 2); a <= hi; a++) {
        for (let b = 1; b < a; b++) {
          pool.push({ type: 'sub', a, b, ans: a - b })
        }
      }
      break

    case 'mul': {
      const maxG = level === 'easy' ? 4 : level === 'mid' ? 5 : 6
      const maxN = level === 'easy' ? 5 : level === 'mid' ? 6 : 8
      for (let a = 2; a <= maxG; a++) {
        for (let b = 2; b <= maxN; b++) {
          pool.push({ type: 'mul', a, b, ans: a * b })
        }
      }
      break
    }

    case 'div': {
      const maxD = level === 'easy' ? 5 : level === 'mid' ? 6 : 7
      const maxQ = level === 'easy' ? 5 : level === 'mid' ? 6 : 7
      for (let b = 2; b <= maxD; b++) {
        for (let q = 2; q <= maxQ; q++) {
          pool.push({ type: 'div', a: b * q, b, ans: q })
        }
      }
      break
    }

    default:
      // Diğer modüller (seq, shape, clock) sonra
      break
  }

  return shuffle(pool)
}

// ─── Tur için 10 soru çıkar ───
export function buildRound(module: ModuleId, level: Level, size = 10): Question[] {
  let pool = buildPool(module, level)
  // Güvenlik: yetersizse tekrar oluştur
  let safety = 0
  while (pool.length < size && safety < 5) {
    pool = pool.concat(buildPool(module, level))
    safety++
  }
  return pool.slice(0, size)
}

// ─── Yanlış seçenekler üret ───
export function makeOptions(correct: number, hi: number): number[] {
  const opts = new Set<number>([correct])
  const candidates: number[] = []
  for (let d = -5; d <= 5; d++) {
    if (d === 0) continue
    const v = correct + d
    if (v >= 0 && v <= hi + 6) candidates.push(v)
  }
  // Karıştır
  candidates.sort(() => Math.random() - 0.5)
  for (const v of candidates) {
    if (!opts.has(v)) opts.add(v)
    if (opts.size === 3) break
  }
  // Yine yetmezse zorla doldur
  while (opts.size < 3) {
    const v = Math.floor(Math.random() * 11) + Math.max(0, correct - 5)
    if (!opts.has(v)) opts.add(v)
  }
  return Array.from(opts).sort(() => Math.random() - 0.5)
}

export function getRange(level: Level): [number, number] {
  return RANGES[level]
}