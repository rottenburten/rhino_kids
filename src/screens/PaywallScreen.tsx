import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Browser } from '@capacitor/browser'
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor'
import Reno from '../characters/Reno'
import {
  loadAnnualPackage,
  buyPackage,
  restorePurchases,
  isNative,
} from '../services/purchases'
import { usePremium } from '../contexts/PremiumContext'

// Yasal link URL'leri (Apple 3.1.2(c) — paywall'da çalışır olmalı).
const PRIVACY_URL = 'https://gist.github.com/rottenburten/4d229b887bda5d1a39de294e601b004b'
const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'

/**
 * Abonelik davet ekranı (paywall) — RevenueCat'e bağlı.
 * Fiyat default offering'in $rc_annual paketinden DİNAMİK gelir (kullanıcının
 * ülkesi/para birimi). Çocuğun adı KULLANILMAZ.
 *
 * FİYAT PLACEHOLDER'I YOK. App Review (2.1 + 3.1.2) reddinin kökü buydu:
 * offering gelmeyince ekrana sahte bir placeholder fiyat basılıyor, CTA yine
 * de basılabiliyordu. Artık üç durum var:
 *   loading → iskelet (skeleton), CTA disabled
 *   ready   → gerçek priceString, CTA aktif
 *   failed  → "Fiyat alınamadı" + Tekrar Dene, CTA disabled
 *
 * NOT: Bu ekrana otomatik yönlendirme YOK (gate akışı sonra). Şu an yalnızca
 * /paywall ile elle açılır; satın alma altyapısını test etmek için.
 */
type LoadState = 'loading' | 'ready' | 'failed'

export default function PaywallScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { refresh } = usePremium()

  const [pkg, setPkg] = useState<PurchasesPackage | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  // İşlem durumu: satın alma/restore sırasında butonları kilitler + mesaj.
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // default offering'in yıllık paketini çek (dinamik fiyat için).
  // initPurchases artık tek promise'e sarılı; loadAnnualPackage configure'ı
  // BEKLER — erken çağrı sessizce null dönmez.
  const load = useCallback(async () => {
    setLoadState('loading')
    setNotice(null)
    const res = await loadAnnualPackage()
    if (res.ok) {
      setPkg(res.pkg)
      setLoadState('ready')
    } else {
      setPkg(null)
      setLoadState('failed')
    }
    return res
  }, [])

  useEffect(() => {
    let cancelled = false
    loadAnnualPackage().then((res) => {
      if (cancelled) return
      if (res.ok) {
        setPkg(res.pkg)
        setLoadState('ready')
      } else {
        setLoadState('failed')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const onSubscribe = async () => {
    if (busy) return
    setNotice(null)
    // Paket YOKSA satın alma yapılamaz. Ayrım önemli (Apple 3.1.2):
    //  - gerçekten cihazda değilsek (web/dev) → "yalnızca uygulamada"
    //  - cihazdayız ama mağazadan paket gelmediyse → "bağlanılamadı"
    // Eskiden ikisi de "inside the app" diyordu; reviewer iPad'de bu yanlış
    // mesajı gördü ve uygulamayı eksik saydı.
    if (!pkg) {
      setNotice(isNative() ? t('paywall.connectError') : t('paywall.unavailable'))
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

  // Yasal linkler — Apple 3.1.2(c) zorunlu, ÇALIŞAN (tıklanabilir) olmalı.
  // @capacitor/browser ile in-app Safari (SFSafariViewController) açar; web'de
  // yeni sekme. Açılamazsa window.open ile fallback.
  const openUrl = (url: string) => {
    Browser.open({ url }).catch(() => {
      window.open(url, '_blank')
    })
  }
  const onPrivacy = () => openUrl(PRIVACY_URL)
  const onTerms = () => openUrl(TERMS_URL)

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

        {/* Plan kartı — abonelik adı + süre + fiyat (Apple 3.1.2(c) zorunlu).
            Fiyat DİNAMİK (RevenueCat yıllık paket). */}
        <div className="bg-white border-[3px] border-mango rounded-3xl p-4 shadow-kid mb-4 text-center">
          {/* Abonelik başlığı */}
          <p className="font-display font-bold text-savana-deep text-base">
            {t('paywall.planName')}
          </p>
          {/* Süre — yıllık / otomatik yenilenen */}
          <p className="font-display font-semibold text-savana-deep/70 text-xs mb-2">
            {t('paywall.planDuration')}
          </p>
          <span className="inline-block bg-mango text-white font-display font-bold text-sm rounded-full px-4 py-1 mb-2">
            {t('paywall.trialBadge')}
          </span>
          {/* Fiyat + süre — SAHTE FİYAT YOK.
              loading → iskelet · ready → gerçek fiyat · failed → tekrar dene */}
          {loadState === 'loading' && (
            <div
              className="mx-auto h-5 w-40 rounded-full bg-savana-deep/15 animate-pulse"
              role="status"
              aria-label={t('paywall.loadingPrice')}
            />
          )}
          {loadState === 'ready' && pkg?.product?.priceString && (
            <p className="font-display font-semibold text-savana-deep">
              {t('paywall.priceLine', { price: pkg.product.priceString })}
            </p>
          )}
          {loadState === 'failed' && (
            <div>
              <p className="font-display font-semibold text-savana-deep/70 text-sm">
                {t('paywall.priceUnavailable')}
              </p>
              <button
                onClick={() => void load()}
                className="mt-1 font-display font-bold text-savana-deep underline text-sm"
              >
                {t('paywall.retry')}
              </button>
            </div>
          )}
        </div>

        {/* Ana CTA — fiyat gelmeden BASILAMAZ (Apple 3.1.2: fiyatsız satın
            alma daveti gösterilemez). */}
        <button
          onClick={onSubscribe}
          disabled={busy || loadState !== 'ready'}
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

        {/* Otomatik yenileme açıklaması (Apple 3.1.2 zorunlu tam metin) */}
        <p className="text-center text-[11px] text-savana-deep/60 leading-snug mb-3 px-2">
          {t('paywall.autoRenew')}
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
