import { useState, useEffect } from 'react'
import { loadDailyLock, isLockLoaded } from '../services/dailyLock'

/**
 * Günlük kilidi Preferences'tan belleğe yükler. `loaded` true olunca kilit
 * okuma fonksiyonları (isCompleted vb.) senkron ve doğru sonuç verir.
 *
 * Oturum içinde cache bir kez yüklendiği için (isLockLoaded), HomeScreen ↔
 * ModuleScreen geçişlerinde anında hazır gelir (yeniden yükleme yok). Gece
 * yarısı tarih değişirse loadDailyLock cache'i tazeler.
 */
export function useDailyLock() {
  const [loaded, setLoaded] = useState(isLockLoaded())

  useEffect(() => {
    let cancelled = false
    loadDailyLock().then(() => {
      if (!cancelled) setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { loaded }
}
