import { AnimatePresence, motion } from 'framer-motion'
import { useCarrotTimer } from '../contexts/CarrotTimerContext'
import { secondsToMangos } from '../services/timerStorage'

/**
 * Mango Ağacı — havuç/mango timer'ının GÖRSEL temsili.
 * Sayı/dakika gösterilmez; sadece mango sayısı azalır.
 * Toplam mango = ceil(günlükLimit / 30); dolu = ceil(kalan / 30).
 * Bir mango "düşerken" Framer Motion ile düşme animasyonu oynar.
 */
export default function MangoTree() {
  const { remainingSeconds, limitSeconds } = useCarrotTimer()

  // Toplam ve dolu mango sayısı — günlük limite (ebeveyn ayarı) göre dinamik.
  const total = secondsToMangos(limitSeconds)
  const filled = Math.min(total, Math.max(0, secondsToMangos(remainingSeconds)))

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-savana-deep/30 px-3 py-2">
      {/* Ağaç (dekoratif, sabit) */}
      <svg width="48" height="56" viewBox="0 0 48 56" className="shrink-0" aria-hidden="true">
        {/* gövde */}
        <path d="M24 56 L24 30" stroke="#6b4a2b" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 40 L15 32 M24 40 L33 32" stroke="#6b4a2b" strokeWidth="4" strokeLinecap="round" />
        {/* yeşil tepe */}
        <ellipse cx="24" cy="22" rx="22" ry="14" fill="#6f9e57" />
        <ellipse cx="24" cy="16" rx="16" ry="10" fill="#86b86a" />
        <ellipse cx="16" cy="20" rx="9" ry="7" fill="#7cab63" />
        <ellipse cx="33" cy="20" rx="9" ry="7" fill="#7cab63" />
      </svg>

      {/* mango grid (günlük limite göre dinamik adet) */}
      <div className="grid grid-cols-10 gap-1 flex-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex items-center justify-center h-4">
            <AnimatePresence>
              {i < filled && (
                <motion.div
                  key="mango"
                  initial={{ opacity: 1, y: 0, rotate: 0 }}
                  exit={{ opacity: 0, y: 40, rotate: 180 }}
                  transition={{ duration: 0.6, ease: 'easeIn' }}
                  className="w-3.5 h-3.5 rounded-full shadow-sm"
                  style={{
                    background:
                      'radial-gradient(circle at 32% 28%, #fde68a 0%, #fb923c 55%, #ea580c 100%)',
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
