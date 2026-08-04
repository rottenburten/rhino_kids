import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// ── Mağaza build'i anahtar kapısı ──────────────────────────────────────────
// App Review reddi (2.1 + 3.1.2): paywall'da fiyat gelmedi, satın alma
// çalışmadı. Sebeplerden biri, anahtarsız bir bundle'ın sessizce archive
// edilebilmesiydi — `.env` git'e girmediği için temiz bir clone'da / başka
// makinede / CI'da RevenueCat anahtarı BOŞ olur ve uygulama yalnızca
// console.warn basıp devam eder. Artık bu durumda build DURUR.
//
// Kaçış kapısı (yalnızca anahtarsız web önizlemesi için):
//   ALLOW_MISSING_RC_KEYS=1 npm run build
const REQUIRED_KEYS: { name: string; prefix: string }[] = [
  { name: 'VITE_REVENUECAT_IOS_KEY', prefix: 'appl_' },
  { name: 'VITE_REVENUECAT_ANDROID_KEY', prefix: 'goog_' },
]

function assertStoreKeys(mode: string) {
  if (process.env.ALLOW_MISSING_RC_KEYS === '1') {
    console.warn(
      '[vite] ALLOW_MISSING_RC_KEYS=1 — RevenueCat anahtar kapısı ATLANDI. '
        + 'Bu bundle ile App Store/Play archive ALMA.',
    )
    return
  }
  // '' öneki: VITE_ dışındakiler de dahil tüm .env değişkenlerini yükler.
  const env = loadEnv(mode, process.cwd(), '')
  const problems: string[] = []
  for (const { name, prefix } of REQUIRED_KEYS) {
    const value = (env[name] ?? '').trim()
    if (!value) problems.push(`${name} yok/boş`)
    else if (!value.startsWith(prefix)) {
      problems.push(`${name} '${prefix}' ile başlamıyor (yanlış platform anahtarı?)`)
    }
  }
  if (problems.length > 0) {
    throw new Error(
      '\n\n  ✖ MAĞAZA BUILD DURDURULDU — RevenueCat anahtarı eksik/geçersiz:\n'
        + problems.map((p) => `      · ${p}\n`).join('')
        + '\n    Proje kökünde .env dosyası olmalı (.env.example şablonundan;\n'
        + "    .env git'e GİRMEZ). Anahtarlar: RevenueCat Dashboard → Project\n"
        + '    → API Keys. Anahtarsız archive = paywall\'da fiyat gelmez =\n'
        + '    App Review reddi (2.1 + 3.1.2).\n'
        + '\n    Yalnızca anahtarsız web önizlemesi için:\n'
        + '      ALLOW_MISSING_RC_KEYS=1 npm run build\n',
    )
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') assertStoreKeys(mode)

  return {
    plugins: [react()],
    server: {
      host: true, // LAN/dış arayüzlerde dinle (telefon + tünel erişimi)
      // Cloudflare tüneli (*.trycloudflare.com) gibi dış host'ları kabul et.
      allowedHosts: true,
    },
  }
})
