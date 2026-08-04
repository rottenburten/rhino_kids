import { motion } from 'framer-motion'
import type { Question } from '../types'
import EmojiFitField from './EmojiFitField'

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

// Tüm emojiler kapsayıcının font-size'ından miras alır (EmojiFitField bunu
// ölçüp küçültür). 1em = ölçeklenen emoji; operatörler (+) biraz küçük.
const EMOJI = { fontSize: '1em' } as const
const OP = { fontSize: '0.7em' } as const

export default function QuestionVisual({ question, seed }: Props) {
  const q = question

  // Stabil emoji seçimi
  const emoji = pickWithSeed(EMOJIS, seed)
  const emoji2 = pickWithSeed(EMOJIS, seed + 7)

  // ─── SAYMA ───
  if (q.type === 'count') {
    return (
      <EmojiFitField
        fitKey={`count-${q.a}`}
        maxFont={36}
        minFont={14}
        maxHeight={150}
        className="flex flex-wrap justify-center items-center gap-2"
      >
        {Array.from({ length: q.a }, (_, i) => (
          <span key={i} style={EMOJI}>
            {emoji}
          </span>
        ))}
      </EmojiFitField>
    )
  }

  // ─── TOPLAMA ───
  // Mantık: "iki şeyi bir araya getirince toplanır". İki grup ("+" ile ayrı)
  // başlar; ~1s sonra birbirine kayar, "+" kaybolur, tek sıra (a+b) olur.
  // Her grup KENDİ İÇİNDE sarar (max-w) → çok emojide (9+9, hatta 20+20) bile
  // taşmaz; EmojiFitField ayrıca tümünü kapsayıcıya sığacak boyuta küçültür.
  if (q.type === 'add' && q.b !== undefined) {
    const merge = { delay: HINT_DELAY, duration: 0.6, ease: 'easeOut' as const }
    return (
      <EmojiFitField
        fitKey={`add-${q.a}-${q.b}`}
        maxFont={30}
        minFont={12}
        maxHeight={150}
        className="flex flex-row flex-wrap justify-center items-center gap-x-2 gap-y-1"
      >
        {/* 1. grup (a tane) — sağa doğru kayıp birleşir */}
        <motion.div
          className="flex flex-wrap justify-center gap-1 max-w-[44%]"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={merge}
        >
          {Array.from({ length: q.a }, (_, i) => (
            <span key={i} style={EMOJI}>{emoji}</span>
          ))}
        </motion.div>

        {/* "+" — birleşince kaybolur ve yer kaplamaz olur */}
        <motion.span
          className="font-bold text-savana-deep overflow-hidden inline-block"
          style={OP}
          initial={{ opacity: 1, width: 22 }}
          animate={{ opacity: 0, width: 0 }}
          transition={{ delay: HINT_DELAY, duration: 0.4, ease: 'easeIn' }}
        >
          +
        </motion.span>

        {/* 2. grup (b tane) — sola doğru kayıp birleşir */}
        <motion.div
          className="flex flex-wrap justify-center gap-1 max-w-[44%]"
          initial={{ x: 20 }}
          animate={{ x: 0 }}
          transition={merge}
        >
          {Array.from({ length: q.b }, (_, i) => (
            <span key={i} style={EMOJI}>{emoji2}</span>
          ))}
        </motion.div>
      </EmojiFitField>
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
      <EmojiFitField
        fitKey={`sub-${q.a}-${q.b}`}
        maxFont={30}
        minFont={12}
        maxHeight={150}
        className="flex flex-wrap justify-center items-center gap-2"
      >
        {Array.from({ length: total }, (_, i) => {
          const leaving = i >= removeFrom
          return (
            <motion.span
              key={`${seed}-${i}`}
              style={EMOJI}
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
      </EmojiFitField>
    )
  }

  // ─── ÇARPMA ───
  // Mantık: "çarpma = aynı grubu tekrar tekrar toplamak". b'li emoji grubu
  // SIRAYLA a kez belirir (her grup ~0.3s arayla pop-in, scale 0→1). Gruplar
  // ayrı dursun (boşluk + "+") ki "a kere b" hissi olsun. ~1s sonra başlar.
  if (q.type === 'mul' && q.b !== undefined) {
    return (
      <EmojiFitField
        fitKey={`mul-${q.a}-${q.b}`}
        maxFont={24}
        minFont={11}
        maxHeight={160}
        className="flex flex-wrap justify-center items-center gap-2"
      >
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
                <span key={j} style={EMOJI}>{emoji}</span>
              ))}
            </div>
            {i < q.a - 1 && (
              <span className="font-bold text-savana-deep mx-1" style={OP}>+</span>
            )}
          </motion.div>
        ))}
      </EmojiFitField>
    )
  }

  // ─── BÖLME ───
  // Mantık: "bölme = eşit paylaştırma". Başta a emoji tek küme halinde durur;
  // ~1s sonra küme solar ve aynı anda b grup (her grupta a÷b) sırayla belirir
  // (hayvanların önünde paylaştırılmış gibi). a = q.ans * q.b (toplam emoji).
  if (q.type === 'div' && q.b !== undefined) {
    return (
      <EmojiFitField
        fitKey={`div-${q.a}-${q.b}`}
        maxFont={24}
        minFont={11}
        maxHeight={170}
        className="relative flex justify-center items-center"
      >
        {/* 1) Başlangıç: a emoji tek küme — ~1s sonra solar */}
        <motion.div
          className="absolute flex flex-wrap justify-center gap-1 max-w-full"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: HINT_DELAY, duration: 0.4, ease: 'easeIn' }}
        >
          {Array.from({ length: q.a }, (_, i) => (
            <span key={i} style={EMOJI}>{emoji}</span>
          ))}
        </motion.div>

        {/* 2) Sonuç: b grup, her grupta a÷b — küme solarken sırayla belirir */}
        <motion.div
          className="flex flex-wrap justify-center items-end gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: HINT_DELAY + 0.3, duration: 0.3 }}
        >
          {Array.from({ length: q.b }, (_, i) => {
            const animal = pickWithSeed(ANIMALS, seed + i * 3)
            return (
              <motion.div
                key={`${seed}-${i}`}
                className="flex flex-col items-center gap-1"
                initial={{ opacity: 0, scale: 0.4, y: -16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: HINT_DELAY + 0.4 + i * 0.25,
                  type: 'spring',
                  stiffness: 320,
                  damping: 18,
                }}
              >
                <span style={EMOJI}>{animal}</span>
                <div className="flex flex-wrap justify-center gap-1 px-2 py-1 border-2 border-dashed border-savana-leaf rounded-xl bg-green-50">
                  {Array.from({ length: q.ans }, (_, j) => (
                    <span key={j} style={EMOJI}>{emoji}</span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </EmojiFitField>
    )
  }

  return null
}
