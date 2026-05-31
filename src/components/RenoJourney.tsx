import { useTranslation } from 'react-i18next'
import { useCarrotTimer } from '../contexts/CarrotTimerContext'
import Reno from '../characters/Reno'

/**
 * Reno'nun Eve Yolculuğu — havuç/zaman timer'ının SOMUT görsel temsili.
 * Soyut "süre" yerine yolculuk metaforu: Reno soldaki 🚩'tan sağdaki 🏠'a yürür.
 *
 * progress = (limitSeconds - remainingSeconds) / limitSeconds * 100
 *   süre dolu → progress 0 → Reno başta (sol)
 *   süre bitti → progress 100 → Reno evde (sağ)
 * Konum CSS `left %` + transition ile yumuşak kayar. Sayı/dakika GÖSTERİLMEZ.
 */
export default function RenoJourney() {
  const { t } = useTranslation()
  const { remainingSeconds, limitSeconds } = useCarrotTimer()

  const safeLimit = limitSeconds > 0 ? limitSeconds : 1
  const progress = Math.min(
    100,
    Math.max(0, ((safeLimit - remainingSeconds) / safeLimit) * 100)
  )

  return (
    <div className="rounded-2xl bg-white border-2 border-savana-deep shadow-kid px-3 py-2">
      <div className="text-[10px] font-display font-bold tracking-wider text-savana-deep mb-2">
        {t('journey.label')}
      </div>

      <div className="relative h-12">
        {/* Patika — kesikli savana toprak çizgisi */}
        <div
          className="absolute left-7 right-7 top-1/2 -translate-y-1/2 h-0 border-t-4 border-dashed"
          style={{ borderColor: '#d4a574' }}
        />

        {/* Başlangıç bayrağı (sol) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-xl">🚩</div>
        {/* Ev (sağ) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-xl">🏠</div>

        {/* Reno — patikada yürüyor. left% progress'e göre, yumuşak kayar. */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          style={{
            // 12%..88% arası: uçlardaki 🚩/🏠 ile çakışmasın.
            left: `${12 + (progress / 100) * 76}%`,
            transition: 'left 1s ease',
          }}
        >
          <Reno mood="idle" size={40} />
        </div>
      </div>
    </div>
  )
}
