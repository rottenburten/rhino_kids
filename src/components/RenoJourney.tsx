import { useTranslation } from 'react-i18next'
import { useCarrotTimer } from '../contexts/CarrotTimerContext'
import Reno from '../characters/Reno'

/**
 * Reno'nun Eve Yolculuğu — havuç/zaman timer'ının SOMUT görsel temsili.
 * Yolculuk metaforu: Reno başlangıç 🚩'tan ev 🏠'a yürür.
 *
 * progress = (limitSeconds - remainingSeconds) / limitSeconds * 100
 *   süre dolu → progress 0 → Reno başlangıçta
 *   süre bitti → progress 100 → Reno evde
 *
 * Yön diller arası aynalanır:
 *   LTR (tr/en): 🚩 solda, 🏠 sağda, Reno soldan sağa yürür.
 *   RTL (ar):    🏠 solda, 🚩 sağda, Reno sağdan sola yürür.
 * `start`/`end` (inset-inline) kullanıldığı için uç işaretler dir ile otomatik
 * yer değiştirir; Reno'nun ilerleyişini de RTL'de tersine çeviriyoruz.
 */
export default function RenoJourney() {
  const { t } = useTranslation()
  const { remainingSeconds, limitSeconds } = useCarrotTimer()

  const safeLimit = limitSeconds > 0 ? limitSeconds : 1
  const progress = Math.min(
    100,
    Math.max(0, ((safeLimit - remainingSeconds) / safeLimit) * 100)
  )

  // 12%..88% arası: uçlardaki 🚩/🏠 ile çakışmasın.
  // Reno'yu inline-start kenarından konumlandırıyoruz; RTL'de start = sağ
  // olduğu için aynı offset Reno'yu sağdan sola yürütür (yön doğru aynalanır).
  const startOffset = 12 + (progress / 100) * 76

  return (
    <div className="rounded-2xl bg-white border-2 border-savana-deep shadow-kid px-3 py-2">
      <div className="text-[10px] font-display font-bold tracking-wider text-savana-deep mb-2">
        {t('journey.label')}
      </div>

      <div className="relative h-12">
        {/* Patika — kesikli savana toprak çizgisi */}
        <div
          className="absolute start-7 end-7 top-1/2 -translate-y-1/2 h-0 border-t-4 border-dashed"
          style={{ borderColor: '#d4a574' }}
        />

        {/* Başlangıç bayrağı (inline-start: LTR sol, RTL sağ) */}
        <div className="absolute start-0 top-1/2 -translate-y-1/2 text-xl">🚩</div>
        {/* Ev (inline-end: LTR sağ, RTL sol) */}
        <div className="absolute end-0 top-1/2 -translate-y-1/2 text-xl">🏠</div>

        {/* Reno — patikada yürüyor. inset-inline-start% + transition. */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rtl:translate-x-1/2"
          style={{
            insetInlineStart: `${startOffset}%`,
            transition: 'inset-inline-start 1s ease',
          }}
        >
          <Reno mood="idle" size={40} />
        </div>
      </div>
    </div>
  )
}
