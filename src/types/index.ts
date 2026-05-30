// ─── Modül türleri ───
export type ModuleId =
  | 'count'    // Sayma
  | 'add'      // Toplama
  | 'sub'      // Çıkarma
  | 'mul'      // Çarpma
  | 'div'      // Bölme
  | 'seq'      // Sayı sırası
  | 'shape'    // Şekiller
  | 'clock'    // Saat

export type Level = 'easy' | 'mid' | 'hard'

// ─── Soru türü ───
export interface Question {
  type: ModuleId
  a: number
  b?: number
  ans: number
}

// ─── Oyuncu verileri (kalıcı) ───
export interface PlayerData {
  // Genel istatistikler
  totalCorrect: number
  bestScore: number
  maxStreak: number
  totalScore: number
  mangos: number

  // Modül başına doğru sayısı
  byModule: Record<ModuleId, number>

  // Kazanılan rozetler
  earnedBadges: string[]

  // Günlük seri (kaç gündür üst üste)
  dailyStreak: number
  lastPlayedDate: string

  // Oyuncu adı
  playerName: string
}

// ─── Tur verisi (geçici, oturum) ───
export interface RoundData {
  correct: number
  points: number
  maxStreak: number
  startedAt: number
}

// ─── Modül tanımı ───
export interface ModuleDef {
  id: ModuleId
  name: string
  icon: string
  character: string
  characterName: string
  description: string
  comingSoon?: boolean
}