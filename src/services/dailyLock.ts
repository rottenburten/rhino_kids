import { Preferences } from '@capacitor/preferences'
import type { Level, ModuleId } from '../types'

// ── Günlük kilit ──────────────────────────────────────────────────────────
// Bir mod+seviye kombinasyonu BUGÜN tamamlanınca BUGÜN kilitli kalır; gece
// yarısı (tarih değişince) sıfırlanır → yarın tekrar oynanabilir. Amaç çocuğu
// her gün farklı/yeni sorulara yönlendirmek.
//
// NEDEN Preferences (sessionStorage DEĞİL): kalıcı olmalı. Eski sessionStorage
// kilidi sayfa yenileyince/uygulama kapanıp açılınca sıfırlanıyordu — çocuk
// böyle atlayabiliyordu. Günlük sıfırlama deseni timerStorage ile birebir aynı
// (today() = toISOString().slice(0,10)).
//
// Bellek içi cache: HomeScreen kilidi render sırasında SENKRON okur. Preferences
// async olduğu için, cache bir kez yüklendikten sonra senkron erişim sağlar.
// markCompleted cache'i anında günceller + Preferences'a fire-and-forget yazar.

const KEY = 'rhino_daily_lock'

interface LockCache {
  /** YYYY-MM-DD */
  date: string
  /** Bugün tamamlanan "moduleId_level" anahtarları. */
  completed: Set<string>
  /** Kutlama balonu bugün GÖSTERİLMİŞ "moduleId_level" anahtarları (tek-sefer). */
  bubbled: Set<string>
}

// Modül seviyesinde tek paylaşılan cache (tüm ekranlar aynı örneği görür).
let cache: LockCache | null = null

/** Bugünün tarihi: YYYY-MM-DD (timerStorage/history ile tutarlı). */
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Bir mod+seviye kombinasyonu için stabil anahtar. */
export function lockKey(moduleId: ModuleId, level: Level): string {
  return `${moduleId}_${level}`
}

/** Cache'i Preferences'a yazar (fire-and-forget; çağıran beklemez). */
function persist(): void {
  if (!cache) return
  const payload = JSON.stringify({
    date: cache.date,
    completed: [...cache.completed],
    bubbled: [...cache.bubbled],
  })
  // Hata olsa bile kilit "olmazsa olmaz" değil — sessizce geç.
  Preferences.set({ key: KEY, value: payload }).catch(() => {})
}

/** Cache bugüne ait ve yüklü mü? (HomeScreen ilk-render gating için senkron.) */
export function isLockLoaded(): boolean {
  return cache !== null && cache.date === today()
}

/**
 * Kilidi Preferences'tan yükler (gece yarısı sıfırlamasıyla). Aynı gün için
 * zaten yüklüyse Preferences'a dokunmaz (cache otoritedir → yarış önlenir).
 */
export async function loadDailyLock(): Promise<void> {
  const d = today()
  if (cache && cache.date === d) return // bugün için zaten yüklü

  const fresh: LockCache = { date: d, completed: new Set(), bubbled: new Set() }
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value) {
      const parsed = JSON.parse(value) as {
        date?: string
        completed?: string[]
        bubbled?: string[]
      }
      // Tarih bugünse kayıtlı durumu kullan; eskiyse (yeni gün) fresh kalır.
      if (parsed.date === d) {
        cache = {
          date: d,
          completed: new Set(parsed.completed ?? []),
          bubbled: new Set(parsed.bubbled ?? []),
        }
        return
      }
    }
  } catch {
    // Bozuk/erişilemez kayıt → fresh.
  }
  cache = fresh
  // Eski günden geçildiyse temizlenmiş durumu kalıcılaştır.
  persist()
}

/** Cache yoksa bugün için boş cache oluştur (defansif; normalde load yapılmıştır). */
function ensureCache(): LockCache {
  if (!cache || cache.date !== today()) {
    cache = { date: today(), completed: new Set(), bubbled: new Set() }
  }
  return cache
}

/** Bu mod+seviyeyi BUGÜN "tamamlandı" olarak işaretle. */
export function markCompleted(moduleId: ModuleId, level: Level): void {
  const c = ensureCache()
  c.completed.add(lockKey(moduleId, level))
  persist()
}

/** Bu mod+seviye BUGÜN tamamlandı mı? (senkron — cache'ten okur) */
export function isCompleted(moduleId: ModuleId, level: Level): boolean {
  if (!cache || cache.date !== today()) return false
  return cache.completed.has(lockKey(moduleId, level))
}

/** Bu seviyede bugün kaç modül tamamlandı. */
export function getCompletedCount(level: Level): number {
  if (!cache || cache.date !== today()) return 0
  const suffix = `_${level}`
  let count = 0
  for (const key of cache.completed) {
    if (key.endsWith(suffix)) count++
  }
  return count
}

/**
 * Bu seviyede bugün TAMAMLANMIŞ ama kutlama balonu HENÜZ GÖSTERİLMEMİŞ ilk
 * modülün id'sini döndürür (yoksa null). Balon tek-sefer mantığı için.
 */
export function getPendingBubble(level: Level): ModuleId | null {
  if (!cache || cache.date !== today()) return null
  const suffix = `_${level}`
  for (const key of cache.completed) {
    if (key.endsWith(suffix) && !cache.bubbled.has(key)) {
      return key.slice(0, -suffix.length) as ModuleId
    }
  }
  return null
}

/** Bu mod+seviye için kutlama balonunun bugün gösterildiğini işaretle. */
export function markBubbleShown(moduleId: ModuleId, level: Level): void {
  const c = ensureCache()
  c.bubbled.add(lockKey(moduleId, level))
  persist()
}

/** Günlük kilidi tamamen siler (ebeveyn "verileri sıfırla"). */
export async function clearDailyLock(): Promise<void> {
  cache = null
  await Preferences.remove({ key: KEY })
}
