import { Preferences } from '@capacitor/preferences'
import type { Level } from '../types'

// Çocuğun en son seçtiği seviye — kalıcı (Capacitor Preferences).
// Böylece uygulama yeniden açıldığında kaldığı seviyeden devam eder.
// (Oturum kilidi sessionStorage; seviye tercihi kalıcı — ayrı amaçlar.)

const KEY = 'rhino_level'

export const DEFAULT_LEVEL: Level = 'easy'

const VALID: Level[] = ['easy', 'mid', 'hard']

/** Kayıtlı seviyeyi yükler; yoksa/geçersizse 'easy'. */
export async function loadLevel(): Promise<Level> {
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value && (VALID as string[]).includes(value)) return value as Level
  } catch (e) {
    console.error('Failed to load level', e)
  }
  return DEFAULT_LEVEL
}

/** Seçilen seviyeyi kaydeder. */
export async function saveLevel(level: Level): Promise<void> {
  try {
    await Preferences.set({ key: KEY, value: level })
  } catch (e) {
    console.error('Failed to save level', e)
  }
}
