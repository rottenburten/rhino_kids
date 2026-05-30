import { Preferences } from '@capacitor/preferences'

// Havuç/Mango timer'ının günlük kalan süresini saklar.
// Mantık: her gün gece yarısı sıfırlanır. Kayıttaki tarih bugünle
// eşleşmiyorsa süre başlangıç değerine (900 sn) döner.

const KEY = 'rhino_carrot_timer'

/** Günlük başlangıç süresi: 15 dakika = 900 saniye (30 mango × 30 sn). */
export const DEFAULT_SECONDS = 900

/** Her mango = 30 saniye. */
export const SECONDS_PER_MANGO = 30

/** Toplam mango sayısı (900 / 30). */
export const TOTAL_MANGOS = DEFAULT_SECONDS / SECONDS_PER_MANGO

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
 * Kayıtlı süreyi yükler. Kayıt yoksa ya da tarih bugüne ait değilse
 * (yeni gün) süreyi 900'e sıfırlar ve bu sıfırlanmış durumu döndürür.
 */
export async function loadTimer(): Promise<TimerState> {
  const { value } = await Preferences.get({ key: KEY })
  const fresh: TimerState = { remainingSeconds: DEFAULT_SECONDS, date: today() }

  if (!value) return fresh
  try {
    const parsed = JSON.parse(value) as Partial<TimerState>
    const raw = parsed.remainingSeconds
    // Şu durumlarda sıfırla (fresh):
    //  - tarih eski (yeni gün → gece yarısı sıfırlaması)
    //  - kayıt geçersiz (sayı değil)
    //  - kayıtlı süre DEFAULT'tan büyük → eski test kaydı veya ebeveyn
    //    panelinden süre düşürülmüş; takılı büyük değer yeni limite tazelenir.
    if (parsed.date !== today() || typeof raw !== 'number' || raw > DEFAULT_SECONDS) {
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
