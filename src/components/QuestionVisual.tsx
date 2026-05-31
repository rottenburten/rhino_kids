import { motion } from 'framer-motion'
import type { Question } from '../types'

const EMOJIS = ['🍄', '🌰', '🍃', '🌿', '🐛', '🦋', '🐝', '🌸', '🍀', '🌻', '🫐', '🍓', '🥕', '🐞', '🌵']
const ANIMALS = ['🦊', '🐰', '🦔', '🐿️', '🦌', '🐸', '🦉', '🐨']

interface Props {
  question: Question
  /** Stabil seed: aynı soruda emoji değişmesin */
  seed: number
}

function pickWithSeed<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

// Animasyonlu ipucu başlangıç gecikmesi (sn) — çocuk önce sayıları görsün,
// sonra animasyon yardımcı olsun. Tüm aritmetik görsellerde ortak.
const HINT_DELAY = 1.0

export default function QuestionVisual({ question, seed }: Props) {
  const q = question

  // Stabil emoji seçimi
  const emoji = pickWithSeed(EMOJIS, seed)
  const emoji2 = pickWithSeed(EMOJIS, seed + 7)

  // ─── SAYMA ───
  if (q.type === 'count') {
    return (
      <div className="flex flex-wrap justify-center gap-2 min-h-[60px] items-center">
        {Array.from({ length: q.a }, (_, i) => (
          <span key={i} className="text-4xl">
            {emoji}
          </span>
        ))}
      </div>
    )
  }

  // ─── TOPLAMA ───
  // Mantık: "iki şeyi bir araya getirince toplanır". İki grup ("+" ile ayrı)
  // başlar; ~1.6s sonra birbirine kayar, "+" kaybolur, tek sıra (a+b) olur.
  // Toplamada İKİ grup DOĞRU (birleştirme) — çıkarmadaki tek-sıradan farklı.
  if (q.type === 'add' && q.b !== undefined) {
    const merge = { delay: HINT_DELAY, duration: 0.6, ease: 'easeOut' as const }
    return (
      <div className="flex justify-center items-center min-h-[60px]">
        {/* 1. grup (a tane) — sağa doğru kayıp birleşir */}
        <motion.div
          className="flex gap-1"
          initial={{ x: -28 }}
          animate={{ x: 0 }}
          transition={merge}
        >
          {Array.from({ length: q.a }, (_, i) => (
            <span key={i} className="text-3xl">{emoji}</span>
          ))}
        </motion.div>

        {/* "+" — birleşince kaybolur ve yer kaplamaz olur */}
        <motion.span
          className="text-2xl font-bold text-savana-deep overflow-hidden inline-block"
          initial={{ opacity: 1, width: 28 }}
          animate={{ opacity: 0, width: 0 }}
          transition={{ delay: HINT_DELAY, duration: 0.4, ease: 'easeIn' }}
        >
          +
        </motion.span>

        {/* 2. grup (b tane) — sola doğru kayıp birleşir */}
        <motion.div
          className="flex gap-1"
          initial={{ x: 28 }}
          animate={{ x: 0 }}
          transition={merge}
        >
          {Array.from({ length: q.b }, (_, i) => (
            <span key={i} className="text-3xl">{emoji2}</span>
          ))}
        </motion.div>
      </div>
    )
  }

  // ─── ÇIKARMA ───
  // Doğru mantık: TEK SIRA, a tane canlı emoji yan yana. Sondaki b tanesi
  // solup uçar (opacity→0, küçülme, yukarı kayma) → geriye a−b canlı kalır.
  // "kalanlar vs çıkanlar" diye İKİ ayrı kutu YOK.
  if (q.type === 'sub' && q.b !== undefined) {
    const total = q.a
    const removeFrom = q.a - q.b // bu index ve sonrası "çıkan" (solar/uçar)
    return (
      <div className="flex flex-wrap justify-center items-center gap-2 min-h-[60px]">
        {Array.from({ length: total }, (_, i) => {
          const leaving = i >= removeFrom
          return (
            <motion.span
              key={`${seed}-${i}`}
              className="text-3xl"
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={
                leaving
                  ? { opacity: 0, scale: 0.4, y: -28 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              transition={
                leaving
                  ? { duration: 0.5, ease: 'easeIn', delay: HINT_DELAY + (i - removeFrom) * 0.25 }
                  : { duration: 0 }
              }
            >
              {emoji}
            </motion.span>
          )
        })}
      </div>
    )
  }

  // ─── ÇARPMA ───
  // Mantık: "çarpma = aynı grubu tekrar tekrar toplamak". b'li emoji grubu
  // SIRAYLA a kez belirir (her grup ~0.3s arayla pop-in, scale 0→1). Gruplar
  // ayrı dursun (boşluk + "+") ki "a kere b" hissi olsun. ~1.6s sonra başlar.
  if (q.type === 'mul' && q.b !== undefined) {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2 min-h-[60px]">
        {Array.from({ length: q.a }, (_, i) => (
          <motion.div
            key={`${seed}-${i}`}
            className="flex items-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: HINT_DELAY + i * 0.3,
              type: 'spring',
              stiffness: 320,
              damping: 18,
            }}
          >
            <div className="flex gap-1 px-2 py-1 border-2 border-dashed border-savana-leaf rounded-xl bg-green-50">
              {Array.from({ length: q.b! }, (_, j) => (
                <span key={j} className="text-2xl">{emoji}</span>
              ))}
            </div>
            {i < q.a - 1 && (
              <span className="text-lg font-bold text-savana-deep mx-1">+</span>
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  // ─── BÖLME (hayvanlar arasında paylaşım) ───
  if (q.type === 'div' && q.b !== undefined) {
    return (
      <div className="flex flex-wrap justify-center items-end gap-3 min-h-[60px]">
        {Array.from({ length: q.b }, (_, i) => {
          const animal = pickWithSeed(ANIMALS, seed + i * 3)
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{animal}</span>
              <div className="flex gap-1 px-2 py-1 border-2 border-dashed border-savana-leaf rounded-xl bg-green-50">
                {Array.from({ length: q.ans }, (_, j) => (
                  <span key={j} className="text-2xl">{emoji}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return null
}
