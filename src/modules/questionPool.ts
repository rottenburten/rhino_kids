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

    case 'seq': {
      // Eksik sayıyı bul: ardışık 3'lü dizi, biri "?" olur.
      // adım: easy=1-2, mid=1-2, hard=1-3. Başlangıç hi'ye göre sınırlı.
      // Her dizi için 3 eksik-konum varyantı → her seviyede 10+ benzersiz soru.
      const steps = level === 'easy' ? [1, 2] : level === 'mid' ? [1, 2] : [1, 2, 3]
      for (const step of steps) {
        const maxStart = Math.max(lo, hi - step * 2)
        for (let start = lo; start <= maxStart; start++) {
          const s = [start, start + step, start + step * 2]
          for (const mi of [0, 1, 2]) {
            pool.push({ type: 'seq', a: start, ans: s[mi], seq: s, missingIndex: mi })
          }
        }
      }
      break
    }

    case 'shape': {
      // Şekli tanı: 0=daire 1=kare 2=üçgen 3=yıldız 4=kalp.
      // easy 3 şekil, mid 4, hard 5. Her şekil birkaç kez (3 tekrar) → 10+ soru.
      const shapeCount = level === 'easy' ? 3 : level === 'mid' ? 4 : 5
      for (let rep = 0; rep < 4; rep++) {
        for (let k = 0; k < shapeCount; k++) {
          // choices: doğru + 2 yanlış şekil index'i (karışık)
          const wrongs = shuffle(
            Array.from({ length: shapeCount }, (_, i) => i).filter((i) => i !== k)
          ).slice(0, 2)
          const choices = shuffle([k, ...wrongs])
          pool.push({ type: 'shape', a: k, ans: k, choices })
        }
      }
      break
    }

    case 'clock': {
      // Saat oku: easy tam saat (m=0), mid/hard yarım saat de (m=0|30).
      const minutes = level === 'easy' ? [0] : [0, 30]
      for (let rep = 0; rep < 2; rep++) {
        for (let h = 1; h <= 12; h++) {
          for (const m of minutes) {
            // ans kodu: h*100 + m (ör. 3:30 → 330). choices: 3 farklı saat.
            const ansCode = h * 100 + m
            const choiceSet = new Set<number>([ansCode])
            let guard = 0
            while (choiceSet.size < 3 && guard < 50) {
              const rh = 1 + Math.floor(Math.random() * 12)
              const rm = minutes[Math.floor(Math.random() * minutes.length)]
              choiceSet.add(rh * 100 + rm)
              guard++
            }
            pool.push({
              type: 'clock',
              a: ansCode,
              ans: ansCode,
              clockH: h,
              clockM: m,
              choices: shuffle(Array.from(choiceSet)),
            })
          }
        }
      }
      break
    }

    default:
      break
  }

  return shuffle(pool)
}

/** Saat kodunu (h*100+m) "3:00" / "3:30" metnine çevirir. */
export function formatClock(code: number): string {
  const h = Math.floor(code / 100)
  const m = code % 100
  return `${h}:${m.toString().padStart(2, '0')}`
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