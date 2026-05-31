import { useTranslation } from 'react-i18next'
import { RTL_LANGUAGES } from './index'

/**
 * Aktif dil sağdan-sola mı? (Arapça vb.) Yön-bağımlı görseller (RenoJourney,
 * geri ok, ilerleme çubuğu, kayma animasyonları) bununla aynalanır.
 * Dil değişiminde otomatik güncellenir (useTranslation re-render eder).
 */
export function useIsRTL(): boolean {
  const { i18n } = useTranslation()
  const base = (i18n.resolvedLanguage || i18n.language || 'tr').split('-')[0]
  return RTL_LANGUAGES.includes(base)
}
