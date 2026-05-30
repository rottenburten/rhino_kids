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
  if (q.type === 'add' && q.b !== undefined) {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2 min-h-[60px]">
        <div className="flex gap-1 px-3 py-2 border-2 border-dashed border-savana-leaf rounded-xl bg-green-50">
          {Array.from({ length: q.a }, (_, i) => (
            <span key={i} className="text-3xl">{emoji}</span>
          ))}
        </div>
        <span className="text-2xl font-bold text-savana-deep mx-1">+</span>
        <div className="flex gap-1 px-3 py-2 border-2 border-dashed border-savana-leaf rounded-xl bg-green-50">
          {Array.from({ length: q.b }, (_, i) => (
            <span key={i} className="text-3xl">{emoji2}</span>
          ))}
        </div>
      </div>
    )
  }

  // ─── ÇIKARMA (yeşil kalanlar + kırmızı çıkanlar) ───
  if (q.type === 'sub' && q.b !== undefined) {
    const kept = q.a - q.b
    return (
      <div className="flex flex-wrap justify-center items-center gap-2 min-h-[60px]">
        <div className="flex gap-1 px-3 py-2 border-2 border-savana-leaf rounded-xl bg-green-50">
          {Array.from({ length: kept }, (_, i) => (
            <span key={i} className="text-3xl">{emoji}</span>
          ))}
        </div>
        <span className="text-2xl font-bold text-red-500 mx-1">−</span>
        <div className="flex gap-1 px-3 py-2 border-2 border-dashed border-red-400 rounded-xl bg-red-50">
          {Array.from({ length: q.b }, (_, i) => (
            <span
              key={i}
              className="text-3xl opacity-30 line-through"
              style={{ filter: 'grayscale(1)' }}
            >
              {emoji2}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // ─── ÇARPMA (gruplar) ───
  if (q.type === 'mul' && q.b !== undefined) {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2 min-h-[60px]">
        {Array.from({ length: q.a }, (_, i) => (
          <div key={i} className="flex items-center">
            <div className="flex gap-1 px-2 py-1 border-2 border-dashed border-savana-leaf rounded-xl bg-green-50">
              {Array.from({ length: q.b! }, (_, j) => (
                <span key={j} className="text-2xl">{emoji}</span>
              ))}
            </div>
            {i < q.a - 1 && (
              <span className="text-lg font-bold text-savana-deep mx-1">+</span>
            )}
          </div>
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