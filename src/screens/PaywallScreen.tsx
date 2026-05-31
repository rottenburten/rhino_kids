import { useTranslation } from 'react-i18next'
import Reno from '../characters/Reno'

/**
 * Abonelik davet ekranı (paywall) — ŞİMDİLİK SADECE GÖRSEL/UI.
 * Gerçek ödeme (RevenueCat) sonra bağlanacak; butonlar şu an placeholder.
 * NE ZAMAN gösterileceği (deneme bitti mi?) de RevenueCat entegrasyonunda gelir.
 * Çocuğun adı KULLANILMAZ — bu ekran deneme bitince/ilk açılışta çıkabilir.
 */
export default function PaywallScreen() {
  const { t } = useTranslation()

  // Placeholder handler'lar — RevenueCat entegrasyonunda gerçekleşecek.
  const onSubscribe = () => console.log('[paywall] subscribe (placeholder)')
  const onRestore = () => console.log('[paywall] restore (placeholder)')
  const onPrivacy = () => console.log('[paywall] open privacy (placeholder)')
  const onTerms = () => console.log('[paywall] open terms (placeholder)')

  const featureKeys = ['modules', 'animations', 'parent', 'safe'] as const

  return (
    <div className="min-h-screen bg-gradient-to-b from-savana-sky via-savana-sun to-savana-earth p-4">
      <div className="max-w-md mx-auto pb-8">
        {/* Ebeveyn etiketi */}
        <div className="flex justify-center pt-2 mb-2">
          <span className="bg-white/70 border-2 border-savana-deep/30 rounded-full px-3 py-1 text-xs font-display font-bold text-savana-deep">
            {t('paywall.parentBadge')}
          </span>
        </div>

        {/* Reno */}
        <div className="flex justify-center">
          <Reno mood="idle" size={120} />
        </div>

        {/* Başlık + alt başlık */}
        <h1 className="text-center font-display text-2xl font-bold text-savana-deep mt-1 mb-2 leading-tight">
          {t('paywall.title')}
        </h1>
        <p className="text-center font-display font-semibold text-savana-deep/75 text-sm mb-5">
          {t('paywall.subtitle')}
        </p>

        {/* Özellik listesi */}
        <div className="bg-white border-[3px] border-savana-deep rounded-3xl p-5 shadow-kid mb-4 space-y-3">
          {featureKeys.map((key) => (
            <div key={key} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-savana-grass border-2 border-savana-deep flex items-center justify-center text-white text-xs font-bold">
                ✓
              </span>
              <span className="font-display font-semibold text-savana-deep text-sm leading-snug">
                {t(`paywall.features.${key}`)}
              </span>
            </div>
          ))}
        </div>

        {/* Plan kartı */}
        <div className="bg-white border-[3px] border-mango rounded-3xl p-4 shadow-kid mb-4 text-center">
          <span className="inline-block bg-mango text-white font-display font-bold text-sm rounded-full px-4 py-1 mb-2">
            {t('paywall.trialBadge')}
          </span>
          <p className="font-display font-semibold text-savana-deep">
            {t('paywall.priceLine', { price: t('paywall.pricePlaceholder') })}
          </p>
        </div>

        {/* Ana CTA */}
        <button
          onClick={onSubscribe}
          className="kid-btn w-full bg-savana-grass border-savana-deep text-lg mb-3"
        >
          {t('paywall.cta')}
        </button>

        {/* İptal bilgisi (Apple zorunlu) */}
        <p className="text-center text-[11px] text-savana-deep/60 leading-snug mb-3 px-2">
          {t('paywall.cancelInfo')}
        </p>

        {/* Restore + yasal linkler (Apple zorunlu) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onRestore}
            className="font-display font-bold text-savana-deep underline text-sm"
          >
            {t('paywall.restore')}
          </button>
          <div className="flex gap-4 text-[11px] text-savana-deep/60">
            <button onClick={onPrivacy} className="underline">
              {t('paywall.privacy')}
            </button>
            <button onClick={onTerms} className="underline">
              {t('paywall.terms')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
