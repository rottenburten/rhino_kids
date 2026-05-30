// Kutlama Lottie animasyonları — merkezi kayıt.
//
// JSON dosyaları (LottieFiles'tan indirilecek) bu klasöre konunca aşağıdaki
// import'ları aç. Dosya yokken kayıt `undefined` döner; LottieOverlay bunu
// algılayıp hiçbir şey render etmez ve akışı bozmadan onComplete'i tetikler.
// Böylece JSON'lar gelmeden de uygulama tam çalışır.
//
// Beklenen dosyalar (öneri — LottieFiles'ta "confetti", "stars", "trophy"):
//   src/animations/confetti.json   → 10/10 kusursuz tur
//   src/animations/badge.json      → yeni rozet
//   src/animations/correct.json    → (opsiyonel) doğru cevap parıltısı

export type CelebrationKind = 'perfect' | 'badge'

// JSON eklenince şu satırları aç (ve aşağıdaki REGISTRY'yi güncelle):
// import confetti from './confetti.json'
// import badge from './badge.json'

const REGISTRY: Record<CelebrationKind, unknown> = {
  perfect: undefined, // confetti
  badge: undefined, // badge
}

/** İlgili kutlama için Lottie JSON'u (yoksa undefined). */
export function getCelebration(kind: CelebrationKind): unknown {
  return REGISTRY[kind]
}
