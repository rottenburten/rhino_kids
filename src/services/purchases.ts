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
  if (!isNative() || configured) return
  if (!IOS_KEY) {
    console.warn('[purchases] VITE_REVENUECAT_IOS_KEY yok — RevenueCat başlatılmadı')
    return
  }
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN })
    await Purchases.configure({ apiKey: IOS_KEY })
    configured = true
  } catch (e) {
    console.error('[purchases] configure hatası', e)
  }
}

/**
 * default offering'in yıllık ($rc_annual) paketini döndürür (yoksa null).
 * Paketin localizedPriceString'i kullanıcının ülkesine göre dinamik fiyattır.
 */
export async function getAnnualPackage(): Promise<PurchasesPackage | null> {
  if (!isNative() || !configured) return null
  try {
    const { current } = await Purchases.getOfferings()
    if (!current) return null
    // Önce $rc_annual ID'sini, yoksa offering'in annual slotunu dene.
    const byId = current.availablePackages.find((p) => p.identifier === ANNUAL_PACKAGE_ID)
    return byId ?? current.annual ?? current.availablePackages[0] ?? null
  } catch (e) {
    console.error('[purchases] getOfferings hatası', e)
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
