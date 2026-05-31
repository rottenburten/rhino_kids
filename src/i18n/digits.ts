import { useTranslation } from 'react-i18next'

// Arapça-Hint rakamları (٠..٩). Index = Batı rakamı (0..9).
const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'

/**
 * Bir metin/sayı içindeki Batı rakamlarını (0-9) AKTİF DİLE göre yerelleştirir.
 * Sadece GÖRÜNTÜ içindir — matematik mantığı her zaman Batı rakamlarıyla çalışır.
 *
 *   ar  → ٠١٢٣ (Arapça-Hint)
 *   tr/en/diğer → değişmeden döner (Batı rakamları)
 *
 * Metin içindeki rakamları tek tek çevirir; harf, virgül, '_', operatör vb.
 * (örn. "2, 4, _, 8") olduğu gibi kalır.
 */
export function localizeDigits(value: string | number, lng: string | undefined): string {
  const base = (lng || 'tr').split('-')[0]
  const s = String(value)
  if (base === 'ar') return s.replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)])
  return s
}

/**
 * React bileşenlerinde doğrudan JSX'e basılan sayılar (şıklar, istatistikler,
 * başlık sayaçları) için. Dil değişiminde otomatik güncellenir.
 *
 *   const n = useLocalizeNumber()
 *   <span>{n(data.totalCorrect)}</span>
 */
export function useLocalizeNumber(): (value: string | number) => string {
  const { i18n } = useTranslation()
  const lng = i18n.resolvedLanguage || i18n.language
  return (value: string | number) => localizeDigits(value, lng)
}
