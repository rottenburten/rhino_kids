import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor'
import Reno from '../characters/Reno'
import {
  getAnnualPackage,
  buyPackage,
  restorePurchases,
  isNative,
} from '../services/purchases'
import { usePremium } from '../contexts/PremiumContext'

/**
 * Abonelik davet ekranı (paywall) — RevenueCat'e bağlı.
 * Fiyat default offering'in $rc_annual paketinden DİNAMİK gelir (kullanıcının
 * ülkesi/para birimi). Web/dev'de native SDK no-op → placeholder fiyat gösterilir.
 * Çocuğun adı KULLANILMAZ.
 *
 * NOT: Bu ekrana otomatik yönlendirme YOK (gate akışı sonra). Şu an yalnızca
 * /paywall ile elle açılır; satın alma altyapısını test etmek için.
 */
export default function PaywallScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { refresh } = usePremium()

  const [pkg, setPkg] = useState<PurchasesPackage | null>(null)
  const [loadingPkg, setLoadingPkg] = useState(true)
  // İşlem durumu: satın alma/restore sırasında butonları kilitler + mesaj.
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // default offering'in yıllık paketini çek (dinamik fiyat için).
  useEffect(() => {
    let cancelled = false
    getAnnualPackage().then((p) => {
      if (!cancelled) {
        setPkg(p)
        setLoadingPkg(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Gösterilecek fiyat: native'de gerçek localizedPriceString, yoksa placeholder.
  const priceText =
    pkg?.product?.priceString ?? t('paywall.pricePlaceholder')

  const onSubscribe = async () => {
    if (busy) return
    setNotice(null)
    // Native değilse / paket yoksa: satın alma yapılamaz (cihazda test edilir).
    if (!isNative() || !pkg) {
      setNotice(t('paywall.unavailable'))
      return
    }
    setBusy(true)
    const res = await buyPackage(pkg)
    setBusy(false)
    if (res.success && res.premium) {
      await refresh()
      setNotice(t('paywall.purchaseSuccess'))
      // Kısa bir teşekkürden sonra ana ekrana dön.
      setTimeout(() => navigate('/'), 1200)
    } else if (res.cancelled) {
      // Kullanıcı iptal etti — sessiz, mesaj yok.
    } else {
      setNotice(t('paywall.purchaseError'))
    }
  }

  const onRestore = async () => {
    if (busy) return
    setNotice(null)
    if (!isNative()) {
      setNotice(t('paywall.unavailable'))
      return
    }
    setBusy(true)
    const res = await restorePurchases()
    setBusy(false)
    if (res.success && res.premium) {
      await refresh()
      setNotice(t('paywall.restoreSuccess'))
      setTimeout(() => navigate('/'), 1200)
    } else {
      setNotice(t('paywall.restoreNone'))
    }
  }

  // Yasal linkler — placeholder (gizlilik gist URL'i sonra bağlanacak).
  const onPrivacy = () => console.log('[paywall] open privacy (placeholder)')
  const onTerms = () => console.log('[paywall] open terms (placeholder)')

  const featureKeys = ['modules', 'animations', 'parent', 'safe'] as const

  return (
    <div className="min-h-screen bg-gradient-to-b from-savana-sky via-savana-sun to-savana-earth px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))]">
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

        {/* Plan kartı — fiyat DİNAMİK (RevenueCat) */}
        <div className="bg-white border-[3px] border-mango rounded-3xl p-4 shadow-kid mb-4 text-center">
          <span className="inline-block bg-mango text-white font-display font-bold text-sm rounded-full px-4 py-1 mb-2">
            {t('paywall.trialBadge')}
          </span>
          <p className="font-display font-semibold text-savana-deep">
            {loadingPkg
              ? t('paywall.loadingPrice')
              : t('paywall.priceLine', { price: priceText })}
          </p>
        </div>

        {/* Ana CTA */}
        <button
          onClick={onSubscribe}
          disabled={busy || loadingPkg}
          className="kid-btn w-full bg-savana-grass border-savana-deep text-lg mb-3 disabled:opacity-60"
        >
          {busy ? t('paywall.processing') : t('paywall.cta')}
        </button>

        {/* İşlem bildirimi (başarı/hata) */}
        {notice && (
          <p className="text-center text-sm font-display font-bold text-savana-deep mb-3 px-2">
            {notice}
          </p>
        )}

        {/* İptal bilgisi (Apple zorunlu) */}
        <p className="text-center text-[11px] text-savana-deep/60 leading-snug mb-3 px-2">
          {t('paywall.cancelInfo')}
        </p>

        {/* Restore + yasal linkler (Apple zorunlu) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onRestore}
            disabled={busy}
            className="font-display font-bold text-savana-deep underline text-sm disabled:opacity-60"
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
