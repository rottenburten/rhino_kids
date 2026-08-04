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
// API anahtarı PLATFORMA göre .env'den okunur (Vite build-time'da gömülür):
//   iOS     → VITE_REVENUECAT_IOS_KEY     (appl_…)
//   Android → VITE_REVENUECAT_ANDROID_KEY (goog_…)
// .env git'e girmez (.gitignore); şablon .env.example'da. Anahtarlar farklıdır.

/** Premium erişimi temsil eden entitlement kimliği (RevenueCat panelindeki ile BİREBİR). */
export const PREMIUM_ENTITLEMENT = 'Rhino Kids Premium'

/** Yıllık paket tanımlayıcısı (default offering içindeki). */
export const ANNUAL_PACKAGE_ID = '$rc_annual'

const IOS_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY as string | undefined
const ANDROID_KEY = import.meta.env.VITE_REVENUECAT_ANDROID_KEY as string | undefined

/** Native platformda mıyız? (RevenueCat yalnızca burada çalışır.) */
export function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

/** Aktif platforma uygun RevenueCat API anahtarı (iOS appl_, Android goog_). */
function platformKey(): string | undefined {
  return Capacitor.getPlatform() === 'android' ? ANDROID_KEY : IOS_KEY
}

// ── Tanı defteri ────────────────────────────────────────────────────────────
// App Review reddi (2.1 + 3.1.2) sırasında cihazda NE olduğunu göremedik:
// "configure mi patladı, offering mi boş?" ayırt edilemiyordu. Bu defter
// ebeveyn panelindeki gizli tanı satırında okunur (TestFlight'ta cihazda).
// ANAHTAR DEĞERİ ASLA TUTULMAZ — yalnızca "var mı" + 5 karakterlik önek.

/** Başlatma/yükleme zincirinin en son ulaştığı adım. */
export type PurchasesStep =
  | 'idle'
  | 'skipped-web'
  | 'skipped-nokey'
  | 'configuring'
  | 'configured'
  | 'offerings-loading'
  | 'ready'
  | 'configure-failed'
  | 'offerings-failed'
  | 'offerings-empty'

export interface PurchasesDiag {
  platform: string
  native: boolean
  /** Anahtar build'e gömülmüş mü (değeri DEĞİL, yalnızca varlığı). */
  keyPresent: boolean
  /** Anahtarın ilk 5 karakteri: 'appl_' / 'goog_' — gizli kısım değil. */
  keyPrefix: string
  configured: boolean
  /** Toplam offering sayısı (getOfferings().all). */
  offeringCount: number
  /** current offering'in paket sayısı — 0 ise IAP ürünü mağazadan gelmiyor. */
  packageCount: number
  packageId: string | null
  priceString: string | null
  lastError: string | null
  step: PurchasesStep
}

const diag: PurchasesDiag = {
  platform: Capacitor.getPlatform(),
  native: Capacitor.isNativePlatform(),
  keyPresent: false,
  keyPrefix: '—',
  configured: false,
  offeringCount: -1,
  packageCount: -1,
  packageId: null,
  priceString: null,
  lastError: null,
  step: 'idle',
}

function noteError(e: unknown): string {
  const msg =
    e instanceof Error ? e.message : typeof e === 'string' ? e : JSON.stringify(e)
  diag.lastError = String(msg).slice(0, 160)
  return diag.lastError
}

/** Tanı anlık görüntüsü (kopyası) — gizli ebeveyn tanı satırı okur. */
export function getPurchasesDiag(): PurchasesDiag {
  return { ...diag }
}

let configured = false
let initPromise: Promise<void> | null = null

async function doInit(): Promise<void> {
  if (!isNative()) {
    diag.step = 'skipped-web'
    return
  }
  const apiKey = platformKey()
  diag.keyPresent = !!apiKey
  diag.keyPrefix = apiKey ? apiKey.slice(0, 5) : '—'
  if (!apiKey) {
    diag.step = 'skipped-nokey'
    noteError('RevenueCat anahtarı build\'e gömülmemiş (' + Capacitor.getPlatform() + ')')
    console.warn('[purchases] Bu platform için RevenueCat anahtarı yok '
      + '(' + Capacitor.getPlatform() + ') — RevenueCat başlatılmadı')
    return
  }
  try {
    diag.step = 'configuring'
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN })
    await Purchases.configure({ apiKey })
    configured = true
    diag.configured = true
    diag.step = 'configured'
  } catch (e) {
    diag.step = 'configure-failed'
    console.error('[purchases] configure hatası', noteError(e))
  }
}

/**
 * RevenueCat SDK'yı başlatır. App mount'tan ÖNCE çağrılır (main.tsx).
 * TEK bir promise'e sarılı: kaç kez çağrılırsa çağrılsın configure bir kez
 * çalışır ve sonraki tüm çağrılar aynı promise'i bekler. Web/dev'de veya
 * anahtar yoksa güvenli no-op.
 */
export function initPurchases(): Promise<void> {
  if (!initPromise) initPromise = doInit()
  return initPromise
}

/**
 * configure BİTENE KADAR bekler, sonuçta yapılandırıldı mı döner.
 * KRİTİK: eskiden `configured` bayrağı beklenmeden okunuyordu; init
 * fire-and-forget olduğu için paywall/premium sorgusu erken gelirse
 * sessizce null/false dönüyordu (App Review'daki placeholder fiyatın kökü).
 */
async function ensureConfigured(): Promise<boolean> {
  if (!isNative()) return false
  await initPurchases()
  return configured
}

/** Yıllık paket yükleme sonucu — başarısızlık SEBEBİ ayırt edilebilir. */
export type AnnualPackageResult =
  | { ok: true; pkg: PurchasesPackage }
  | { ok: false; reason: 'not-native' | 'not-configured' | 'no-package' | 'error' }

/**
 * default offering'in yıllık ($rc_annual) paketini yükler.
 * Paketin priceString'i kullanıcının ülkesine göre dinamik fiyattır.
 * Başarısızlıkta SEBEBİ döner — çağıran "cihazda değil" ile "mağazaya
 * bağlanılamadı"yı ayırt edebilsin (ikisi aynı mesajı göstermemeli).
 */
export async function loadAnnualPackage(): Promise<AnnualPackageResult> {
  if (!isNative()) return { ok: false, reason: 'not-native' }
  if (!(await ensureConfigured())) return { ok: false, reason: 'not-configured' }
  try {
    diag.step = 'offerings-loading'
    const offerings = await Purchases.getOfferings()
    const { current } = offerings
    diag.offeringCount = Object.keys(offerings.all ?? {}).length
    diag.packageCount = current?.availablePackages.length ?? 0
    if (!current) {
      diag.step = 'offerings-empty'
      noteError('current offering yok (RevenueCat panelinde default atanmamış?)')
      return { ok: false, reason: 'no-package' }
    }
    // Önce $rc_annual ID'sini, yoksa offering'in annual slotunu dene.
    const byId = current.availablePackages.find((p) => p.identifier === ANNUAL_PACKAGE_ID)
    const pkg = byId ?? current.annual ?? current.availablePackages[0] ?? null
    if (!pkg) {
      diag.step = 'offerings-empty'
      noteError('offering var, paket yok (IAP ürünü mağazadan gelmiyor)')
      return { ok: false, reason: 'no-package' }
    }
    diag.packageId = pkg.identifier
    diag.priceString = pkg.product?.priceString ?? null
    diag.step = 'ready'
    return { ok: true, pkg }
  } catch (e) {
    diag.step = 'offerings-failed'
    console.error('[purchases] getOfferings hatası', noteError(e))
    return { ok: false, reason: 'error' }
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
  if (!(await ensureConfigured())) return { success: false, premium: false }
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
    return { success: true, premium: hasPremiumIn(customerInfo) }
  } catch (e: unknown) {
    // RevenueCat iptal hatası: userCancelled=true → sessiz geç (hata değil).
    const cancelled = !!(e as { userCancelled?: boolean })?.userCancelled
    if (!cancelled) console.error('[purchases] purchase hatası', noteError(e))
    return { success: false, premium: false, cancelled }
  }
}

/**
 * Önceki satın alımları geri yükler (Apple zorunlu). Dönüş: premium aktif mi.
 */
export async function restorePurchases(): Promise<{ success: boolean; premium: boolean }> {
  if (!(await ensureConfigured())) return { success: false, premium: false }
  try {
    const { customerInfo } = await Purchases.restorePurchases()
    return { success: true, premium: hasPremiumIn(customerInfo) }
  } catch (e) {
    console.error('[purchases] restore hatası', noteError(e))
    return { success: false, premium: false }
  }
}

/**
 * Şu anki abonelik durumu: premium entitlement aktif mi?
 * GATE ÖLÇÜTÜ HER ZAMAN BUDUR — asla cihaz saati/ilk açılış tarihi DEĞİL.
 * Web/dev'de veya yapılandırılmamışsa false.
 */
export async function hasPremium(): Promise<boolean> {
  if (!(await ensureConfigured())) return false
  try {
    const { customerInfo } = await Purchases.getCustomerInfo()
    return hasPremiumIn(customerInfo)
  } catch (e) {
    console.error('[purchases] getCustomerInfo hatası', noteError(e))
    return false
  }
}
