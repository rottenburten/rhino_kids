import { useTranslation } from 'react-i18next'
import Reno from '../characters/Reno'
import { usePlayerData } from '../hooks/usePlayerData'

/**
 * Süre (günlük mango) bitince gösterilen kutlama ekranı.
 * Oyunu DURDURMAZ — sadece bir tebrik mesajıdır. "Devam Et" ile kapanır
 * ve bir daha açılmaz (çağıran taraf endScreenDismissed flag'i ile yönetir).
 */
export default function TimerEndScreen({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation()
  const { data } = usePlayerData()
  const name = data?.playerName ?? ''
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-savana-deep/60 backdrop-blur-sm p-6">
      <div className="bg-white border-[3px] border-savana-deep rounded-3xl p-8 max-w-md w-full text-center shadow-kid">
        <div className="flex justify-center mb-2">
          <Reno mood="celebrate" size={140} />
        </div>
        <h2 className="font-display text-2xl font-bold text-savana-deep mb-2">
          {t('timerEnd.title', { name })}
        </h2>
        <p className="font-display font-semibold text-savana-deep/80 mb-6">
          {t('timerEnd.subtitle')}
        </p>
        <button
          onClick={onContinue}
          className="kid-btn w-full bg-savana-grass border-savana-deep"
        >
          {t('timerEnd.continue')}
        </button>
      </div>
    </div>
  )
}
