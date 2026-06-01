import { Capacitor } from '@capacitor/core'
import {
  Purchases,
  LOG_LEVEL,
  type PurchasesPackage,
  type CustomerInfo,
} from '@revenuecat/purchases-capacitor'

// ── RevenueCat sarmalayıcı ──────────────────────────────────────────────────
// RevenueCat panel yapılandırması (kullanıcı kurdu):
//   Entitlement: "Rhino Kids Premium"
//   Offering: "default", paket: "$rc_annual"
//   Product: rhinokids_yearly_premium
//
// Native SDK YALNIZCA cihazda çalışır (iOS/Android). Web/dev'de tüm fonksiyonlar
// güvenli no-op döner → build/dev kırılmaz, paywall placeholder fiyat gösterir.
//
// API anahtarı .env'den (VITE_REVENUECAT_IOS_KEY), Vite build-time'da gömülür.
// .env git'e girmez (.gitignore); şablon .env.example'da.

/** Premium erişimi temsil eden entitlement kimliği (RevenueCat panelindeki ile BİREBİR). */
export const PREMIUM_ENTITLEMENT = 'Rhino Kids Premium'

/** Yıllık paket tanımlayıcısı (default offering içindeki). */
export const ANNUAL_PACKAGE_ID = '$rc_annual'

const IOS_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY as string | undefined

/** Native platformda mıyız? (RevenueCat yalnızca burada çalışır.) */
export function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

let configured = false

/**
 * RevenueCat SDK'yı başlatır. App mount'tan ÖNCE bir kez çağrılır (main.tsx).
 * Web/dev'de veya anahtar yoksa sessizce atlar (idempotent).
 */
export async function initPurchases(): Promise<void> {
  // TEŞHİS LOG'LARI (geçici): paywall fiyat sorununu çözmek için. Sorun
  // bulununca LOG_LEVEL.DEBUG → WARN'a düşür ve fazla log'ları temizle.
  console.log('[purchases] init başlıyor | native:', isNative(),
    '| anahtar var mı:', !!IOS_KEY,
    '| anahtar prefix:', IOS_KEY ? IOS_KEY.slice(0, 9) + '…' : '(yok)')
  if (!isNative() || configured) {
    console.log('[purchases] init atlandı (native değil veya zaten yapılandırılmış)')
    return
  }
  if (!IOS_KEY) {
    console.warn('[purchases] VITE_REVENUECAT_IOS_KEY yok — RevenueCat başlatılmadı')
    return
  }
  try {
    // DEBUG: RevenueCat'in kendi iç log'ları Xcode konsolunda görünsün
    // (offering neden boş — product eksik mi, StoreKit bağlantısı mı).
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG })
    await Purchases.configure({ apiKey: IOS_KEY })
    configured = true
    console.log('[purchases] configure BAŞARILI ✓')
  } catch (e) {
    console.error('[purchases] configure HATASI', JSON.stringify(e))
  }
}

/**
 * default offering'in yıllık ($rc_annual) paketini döndürür (yoksa null).
 * Paketin localizedPriceString'i kullanıcının ülkesine göre dinamik fiyattır.
 */
export async function getAnnualPackage(): Promise<PurchasesPackage | null> {
  if (!isNative() || !configured) {
    console.log('[purchases] getAnnualPackage atlandı | native:', isNative(), '| configured:', configured)
    return null
  }
  try {
    const offerings = await Purchases.getOfferings()
    const { current, all } = offerings
    // TEŞHİS: offering yapısını dök — current var mı, kaç paket, ID'ler ne.
    console.log('[purchases] getOfferings döndü |',
      'current:', current ? current.identifier : '(NULL — default offering yok!)',
      '| tüm offering sayısı:', Object.keys(all || {}).length,
      '| current paket sayısı:', current ? current.availablePackages.length : 0)
    if (current) {
      console.log('[purchases] current paketler:',
        JSON.stringify(current.availablePackages.map((p) => ({
          id: p.identifier,
          product: p.product?.identifier,
          price: p.product?.priceString,
        }))))
    }
    if (!current) {
      console.warn('[purchases] current offering NULL — RevenueCat panelinde '
        + '"default" offering "current" olarak işaretli değil VEYA App Store '
        + 'Connect product onaylı/bağlı değil.')
      return null
    }
    const byId = current.availablePackages.find((p) => p.identifier === ANNUAL_PACKAGE_ID)
    const pkg = byId ?? current.annual ?? current.availablePackages[0] ?? null
    console.log('[purchases] seçilen paket:', pkg ? pkg.identifier + ' / ' + pkg.product?.priceString : '(YOK)')
    return pkg
  } catch (e) {
    console.error('[purchases] getOfferings HATASI', JSON.stringify(e))
    return null
  }
}

/** CustomerInfo'da premium entitlement aktif mi? */
function hasPremiumIn(info: CustomerInfo): boolean {
  return info.entitlements.active[PREMIUM_ENTITLEMENT] !== undefined
}

/**
 * Verilen paketi satın alır. Başarılıysa premium aktif olur.
 * Dönüş: { success, premium } — premium satın alma SONRASI entitlement durumu.
 * Kullanıcı iptal ederse success=false (hata fırlatmaz).
 */
export async function buyPackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; premium: boolean; cancelled?: boolean }> {
  if (!isNative() || !configured) return { success: false, premium: false }
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
    return { success: true, premium: hasPremiumIn(customerInfo) }
  } catch (e: unknown) {
    // RevenueCat iptal hatası: userCancelled=true → sessiz geç (hata değil).
    const cancelled = !!(e as { userCancelled?: boolean })?.userCancelled
    if (!cancelled) console.error('[purchases] purchase hatası', e)
    return { success: false, premium: false, cancelled }
  }
}

/**
 * Önceki satın alımları geri yükler (Apple zorunlu). Dönüş: premium aktif mi.
 */
export async function restorePurchases(): Promise<{ success: boolean; premium: boolean }> {
  if (!isNative() || !configured) return { success: false, premium: false }
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    return { success: true, premium: hasPremiumIn(customerInfo) }
  } catch (e) {
    console.error('[purchases] restore hatası', e)
    return { success: false, premium: false }
  }
}

/**
 * Şu anki abonelik durumu: premium entitlement aktif mi?
 * GATE ÖLÇÜTÜ HER ZAMAN BUDUR — asla cihaz saati/ilk açılış tarihi DEĞİL.
 * Web/dev'de veya yapılandırılmamışsa false.
 */
export async function hasPremium(): Promise<boolean> {
  if (!isNative() || !configured) return false
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return hasPremiumIn(customerInfo)
  } catch (e) {
    console.error('[purchases] getCustomerInfo hatası', e)
    return false
  }
}
