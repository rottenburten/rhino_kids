import { useState, useRef, useCallback, useEffect } from 'react'
import type { Mood } from './types'

/**
 * Karakter mood'unu yöneten hook.
 *
 * İki kullanım:
 *  - `setMood('thinking')` → kalıcı mood değişimi.
 *  - `flash('celebrate', 1500)` → geçici mood: belirtilen süre oynar,
 *    sonra otomatik olarak `base` mood'a (varsayılan 'idle') döner.
 *
 * setTimeout useRef ile tutuluyor — art arda doğru cevaplarda eski timer
 * iptal edilip yenisi kuruluyor, böylece çift-tetikleme / erken geri dönüş
 * yaşanmıyor (projedeki bilinen setTimeout bug'ına karşı).
 *
 * Örnek (ModuleScreen):
 *   const { mood, flash } = useCharacterMood()
 *   // doğru cevap:   flash('celebrate', 1500)
 *   // yanlış cevap:  flash('sad', 2800)
 *   <Char mood={mood} />
 */
export function useCharacterMood(base: Mood = 'idle') {
  const [mood, setMood] = useState<Mood>(base)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /** Geçici mood oynat, süre sonunda base'e dön. */
  const flash = useCallback(
    (m: Mood, duration = 1500) => {
      clearTimer()
      setMood(m)
      timerRef.current = setTimeout(() => {
        setMood(base)
        timerRef.current = null
      }, duration)
    },
    [base, clearTimer],
  )

  /** Kalıcı mood ayarla (varsa bekleyen geri-dönüş timer'ını iptal eder). */
  const set = useCallback(
    (m: Mood) => {
      clearTimer()
      setMood(m)
    },
    [clearTimer],
  )

  // Unmount'ta sızıntı olmasın
  useEffect(() => clearTimer, [clearTimer])

  return { mood, set, flash }
}
