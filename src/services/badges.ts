import type { PlayerData } from '../types'

// Rozet sistemi — kalıcı başarımlar (PlayerData.earnedBadges içinde saklanır).
// Her rozetin saf bir `check(data)` koşulu var; kazanılma durumu her zaman
// PlayerData'dan türetilir (tek doğruluk kaynağı). Yeni kazanılanlar,
// `check` true olup henüz earnedBadges'te olmayanlardır.

export interface BadgeDef {
  id: string
  name: string
  emoji: string
  description: string
  /** Oyuncu verisine göre bu rozet hak edildi mi? */
  check: (d: PlayerData) => boolean
}

// Sıra = vitrinde gösterim sırası (kolaydan zora doğru gruplanmış).
export const BADGES: BadgeDef[] = [
  // ── Toplam doğru ──
  { id: 'first_correct', name: 'İlk Adım', emoji: '🌱', description: 'İlk doğru cevap', check: (d) => d.totalCorrect >= 1 },
  { id: 'correct_5', name: 'Filiz', emoji: '🌿', description: '5 doğru cevap', check: (d) => d.totalCorrect >= 5 },
  { id: 'correct_10', name: 'Tomurcuk', emoji: '🌷', description: '10 doğru cevap', check: (d) => d.totalCorrect >= 10 },
  { id: 'correct_20', name: 'Çiçek', emoji: '🌻', description: '20 doğru cevap', check: (d) => d.totalCorrect >= 20 },
  { id: 'correct_50', name: 'Ağaç', emoji: '🌳', description: '50 doğru cevap', check: (d) => d.totalCorrect >= 50 },
  { id: 'correct_100', name: 'Orman', emoji: '🏞️', description: '100 doğru cevap', check: (d) => d.totalCorrect >= 100 },

  // ── Seri (en uzun seri) ──
  { id: 'streak_3', name: 'Isındı', emoji: '🔥', description: '3 doğru üst üste', check: (d) => d.maxStreak >= 3 },
  { id: 'streak_5', name: 'Alev', emoji: '🔥🔥', description: '5 doğru üst üste', check: (d) => d.maxStreak >= 5 },
  { id: 'streak_10', name: 'Yangın', emoji: '🌋', description: '10 doğru üst üste', check: (d) => d.maxStreak >= 10 },

  // ── Modül uzmanları (her modülde 10+ doğru) ──
  { id: 'expert_count', name: 'Sayma Uzmanı', emoji: '🦒', description: 'Saymada 10 doğru', check: (d) => (d.byModule.count || 0) >= 10 },
  { id: 'expert_add', name: 'Toplama Uzmanı', emoji: '🐘', description: 'Toplamada 10 doğru', check: (d) => (d.byModule.add || 0) >= 10 },
  { id: 'expert_sub', name: 'Çıkarma Uzmanı', emoji: '🦓', description: 'Çıkarmada 10 doğru', check: (d) => (d.byModule.sub || 0) >= 10 },
  { id: 'expert_mul', name: 'Çarpma Uzmanı', emoji: '🦁', description: 'Çarpmada 10 doğru', check: (d) => (d.byModule.mul || 0) >= 10 },
  { id: 'expert_div', name: 'Bölme Uzmanı', emoji: '🐒', description: 'Bölmede 10 doğru', check: (d) => (d.byModule.div || 0) >= 10 },

  // ── Kusursuz tur (10/10) ──
  { id: 'perfect_1', name: 'Kusursuz!', emoji: '🏆', description: 'İlk kez 10/10', check: (d) => d.perfectRounds >= 1 },
  { id: 'perfect_5', name: 'Şampiyon', emoji: '👑', description: '5 kez 10/10', check: (d) => d.perfectRounds >= 5 },

  // ── Puan & mango ──
  { id: 'score_1000', name: 'Puan Canavarı', emoji: '💎', description: '1000 puan', check: (d) => d.totalScore >= 1000 },
  { id: 'first_mango_bonus', name: 'Mango Ustası', emoji: '🥭', description: 'İlk mango bonusu', check: (d) => d.perfectRounds >= 1 },
]

const BY_ID: Record<string, BadgeDef> = Object.fromEntries(BADGES.map((b) => [b.id, b]))

/** Id'den rozet tanımı (yoksa undefined). */
export function getBadge(id: string): BadgeDef | undefined {
  return BY_ID[id]
}

/** Şu an hak edilmiş (check=true) tüm rozet id'leri. */
export function computeEarnedBadgeIds(d: PlayerData): string[] {
  return BADGES.filter((b) => b.check(d)).map((b) => b.id)
}
