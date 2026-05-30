import type { Level, ModuleId } from '../types'

// Oturum kilidi — bir oturumda her mod+seviye kombinasyonu BİR KEZ oynanır.
// Tur bitince o kombinasyon kilitlenir.
//
// NEDEN sessionStorage: Oturum = uygulama açık olduğu süre. Uygulama
// kapanınca (web'de sekme/yenileme, native'de Capacitor webview yeniden
// açılışı) otomatik sıfırlanır — böylece çocuk ertesi oturum tekrar oynar.
// Capacitor Preferences KULLANILMAZ; o kalıcı olur (gün/oturum aşar).

const PREFIX = 'rhino_session_lock_'

/** Bir mod+seviye kombinasyonu için stabil anahtar. */
export function lockKey(moduleId: ModuleId, level: Level): string {
  return `${moduleId}_${level}`
}

/** Bu mod+seviyeyi bu oturumda "tamamlandı" olarak işaretle. */
export function markCompleted(moduleId: ModuleId, level: Level): void {
  try {
    sessionStorage.setItem(PREFIX + lockKey(moduleId, level), '1')
  } catch {
    // sessionStorage erişilemezse (ör. gizli mod kısıtı) sessizce geç —
    // kilit "olmazsa olmaz" değil, sadece tekrar oynamayı caydırır.
  }
}

/** Bu mod+seviye bu oturumda tamamlandı mı? */
export function isCompleted(moduleId: ModuleId, level: Level): boolean {
  try {
    return sessionStorage.getItem(PREFIX + lockKey(moduleId, level)) === '1'
  } catch {
    return false
  }
}

/** Bu seviyede bu oturumda kaç modül tamamlandı (ilerisi için). */
export function getCompletedCount(level: Level): number {
  try {
    const suffix = `_${level}`
    let count = 0
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(PREFIX) && key.endsWith(suffix)) count++
    }
    return count
  } catch {
    return 0
  }
}
