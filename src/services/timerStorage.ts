import { Preferences } from '@capacitor/preferences'

// Havuç/Mango timer'ının günlük kalan süresini saklar.
// Mantık: her gün gece yarısı sıfırlanır. Kayıttaki tarih bugünle
// eşleşmiyorsa süre başlangıç değerine (900 sn) döner.

const KEY = 'rhino_carrot_timer'
const LIMIT_KEY = 'rhino_carrot_limit'

/** Günlük başlangıç süresi: 15 dakika = 900 saniye (30 mango × 30 sn). */
export const DEFAULT_SECONDS = 900

/**
 * 10/10 ödülünde Reno'nun eve yolculuğunda atacağı adım (saniye).
 * (Tarihsel ad: bir "mango"luk süre = 30 sn. reward() bunu remainingSeconds'tan
 *  düşer → Reno eve doğru ilerler.)
 */
export const SECONDS_PER_MANGO = 30

/** Ebeveyn panelinden seçilebilecek günlük süre seçenekleri (saniye). */
export const LIMIT_OPTIONS = [300, 600, 900, 1200, 1800] // 5/10/15/20/30 dk

export interface TimerState {
  remainingSeconds: number
  /** YYYY-MM-DD */
  date: string
}

/** Bugünün tarihi: YYYY-MM-DD. */
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Ebeveynin ayarladığı günlük süre limitini yükler (saniye).
 * Ayarlanmamışsa DEFAULT_SECONDS. Geçersizse de DEFAULT'a düşer.
 */
export async function loadLimit(): Promise<number> {
  try {
    const { value } = await Preferences.get({ key: LIMIT_KEY })
    if (value) {
      const n = parseInt(value, 10)
      if (Number.isFinite(n) && n > 0) return n
    }
  } catch (e) {
    console.error('Failed to load limit', e)
  }
  return DEFAULT_SECONDS
}

/** Günlük süre limitini kaydeder (saniye). */
export async function saveLimit(seconds: number): Promise<void> {
  try {
    await Preferences.set({ key: LIMIT_KEY, value: String(seconds) })
  } catch (e) {
    console.error('Failed to save limit', e)
  }
}

/**
 * Kayıtlı süreyi yükler. Kayıt yoksa ya da tarih bugüne ait değilse
 * (yeni gün) süreyi 900'e sıfırlar ve bu sıfırlanmış durumu döndürür.
 */
export async function loadTimer(): Promise<TimerState> {
  // Günlük süre tavanı artık ebeveyn ayarına bağlı (varsayılan DEFAULT_SECONDS).
  const limit = await loadLimit()
  const { value } = await Preferences.get({ key: KEY })
  const fresh: TimerState = { remainingSeconds: limit, date: today() }

  if (!value) return fresh
  try {
    const parsed = JSON.parse(value) as Partial<TimerState>
    const raw = parsed.remainingSeconds
    // Şu durumlarda sıfırla (fresh):
    //  - tarih eski (yeni gün → gece yarısı sıfırlaması)
    //  - kayıt geçersiz (sayı değil)
    //  - kayıtlı süre limitten büyük → ebeveyn süreyi düşürmüş (veya eski
    //    test kaydı); takılı büyük değer yeni limite tazelenir.
    if (parsed.date !== today() || typeof raw !== 'number' || raw > limit) {
      return fresh
    }
    // Aynı gün, geçerli ve limit içi → kayıtlı süreyi kullan.
    return { remainingSeconds: Math.max(0, raw), date: today() }
  } catch {
    return fresh
  }
}

/** Kalan süreyi bugünün tarihiyle birlikte kaydeder. */
export async function saveTimer(seconds: number): Promise<void> {
  const state: TimerState = { remainingSeconds: seconds, date: today() }
  await Preferences.set({ key: KEY, value: JSON.stringify(state) })
}

/** Timer kalan-süre ve limit kayıtlarını siler (ebeveyn "verileri sıfırla"). */
export async function clearTimer(): Promise<void> {
  await Preferences.remove({ key: KEY })
  await Preferences.remove({ key: LIMIT_KEY })
}
