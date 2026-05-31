import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import tr from './locales/tr.json'
import en from './locales/en.json'
import ar from './locales/ar.json'

// Çok dilli yapı — TR + EN + AR, 10+ dile genişlemeye hazır.
// Yeni dil eklemek için: locales/<kod>.json oluştur + resources'a ekle.
// Anahtarlar STABİL — ileride her anahtara Qwen TTS ses dosyası bağlanacak.
// NOT: ar (Arapça) çevirisi TASLAK — Arapça konuşan biri tarafından
// doğrulanmalı. RTL düzeni Aşama 2'de eklenecek (şimdilik sadece çeviri).

export const SUPPORTED_LANGUAGES = ['tr', 'en', 'ar'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Sağdan-sola yazılan diller. Yeni RTL dil eklenince buraya eklenir.
export const RTL_LANGUAGES = ['ar']

/** <html dir> ve lang'ı seçili dile göre ayarlar (RTL/LTR). */
function applyDocumentDir(lng: string | undefined) {
  if (typeof document === 'undefined') return
  const base = (lng || 'tr').split('-')[0]
  document.documentElement.dir = RTL_LANGUAGES.includes(base) ? 'rtl' : 'ltr'
  document.documentElement.lang = base
}

export const resources = {
  tr: { translation: tr },
  en: { translation: en },
  ar: { translation: ar },
} as const

i18n
  // Cihaz/tarayıcı dilini otomatik tespit eder (navigator + localStorage).
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Desteklenmeyen dil → tr. Tespit edilen dil tr/en değilse fallback devreye girer.
    fallbackLng: 'tr',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    // 'tr-TR' gibi bölgesel kodları ana dile indir (tr-TR → tr).
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // React zaten XSS'e karşı kaçışlıyor
    },
    detection: {
      // Sıra: ?lng= (test/manuel) → kayıtlı tercih → cihaz dili → html lang
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'rhino_lang',
    },
    returnObjects: false,
  })

// Dil değişiminde <html dir/lang> güncelle (Arapça → rtl, tr/en → ltr).
i18n.on('languageChanged', applyDocumentDir)
// İlk yüklemede de uygula (tespit edilen dile göre).
applyDocumentDir(i18n.resolvedLanguage)

export default i18n
