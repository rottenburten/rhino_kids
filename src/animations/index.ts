// Kutlama Lottie animasyonları — merkezi kayıt.
//
// JSON'lar elle üretildi (telifsiz, Rhino Kids savana paleti):
//   confetti.json → 10/10 kusursuz tur (renkli parçacık yağmuru)
//   badge.json    → yeni rozet (büyüyen yıldız + parıltı halkası)
// Üreteç: scripts/genLottie.mjs (yeniden üretmek için çalıştırılabilir).
//
// Bir kayıt undefined olursa LottieOverlay hiçbir şey çizmez ve akışı
// bozmadan onComplete'i tetikler (güvenli fallback korunur).

export type CelebrationKind = 'perfect' | 'badge'

import confetti from './confetti.json'
import badge from './badge.json'

const REGISTRY: Record<CelebrationKind, unknown> = {
  perfect: confetti,
  badge: badge,
}

/** İlgili kutlama için Lottie JSON'u (yoksa undefined). */
export function getCelebration(kind: CelebrationKind): unknown {
  return REGISTRY[kind]
}
