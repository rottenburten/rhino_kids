import { Preferences } from '@capacitor/preferences'
import type { PlayerData, ModuleId } from '../types'

const PLAYER_KEY = 'rhino_player_data'

// ─── Varsayılan oyuncu verileri ───
const defaultPlayerData: PlayerData = {
  totalCorrect: 0,
  bestScore: 0,
  maxStreak: 0,
  totalScore: 0,
  mangos: 0,
  byModule: {
    count: 0, add: 0, sub: 0, mul: 0, div: 0,
    seq: 0, shape: 0, clock: 0,
  },
  earnedBadges: [],
  dailyStreak: 0,
  lastPlayedDate: '',
  playerName: 'Renan',
}

// ─── Veri yükle ───
export async function loadPlayerData(): Promise<PlayerData> {
  try {
    const { value } = await Preferences.get({ key: PLAYER_KEY })
    if (value) {
      const data = JSON.parse(value)
      // Eksik alanlar için varsayılanlarla birleştir
      return { ...defaultPlayerData, ...data }
    }
  } catch (e) {
    console.error('Failed to load player data', e)
  }
  return { ...defaultPlayerData }
}

// ─── Veri kaydet ───
export async function savePlayerData(data: PlayerData): Promise<void> {
  try {
    await Preferences.set({
      key: PLAYER_KEY,
      value: JSON.stringify(data),
    })
  } catch (e) {
    console.error('Failed to save player data', e)
  }
}

// ─── Hızlı güncelleme yardımcısı ───
export async function updatePlayerData(
  updater: (data: PlayerData) => PlayerData
): Promise<PlayerData> {
  const current = await loadPlayerData()
  const updated = updater(current)
  await savePlayerData(updated)
  return updated
}

// ─── Doğru cevap işle ───
export async function recordCorrectAnswer(
  module: ModuleId,
  points: number,
  newStreak: number
): Promise<PlayerData> {
  return updatePlayerData((data) => ({
    ...data,
    totalCorrect: data.totalCorrect + 1,
    totalScore: data.totalScore + points,
    mangos: data.mangos + 1,
    maxStreak: Math.max(data.maxStreak, newStreak),
    byModule: {
      ...data.byModule,
      [module]: (data.byModule[module] || 0) + 1,
    },
  }))
}

// ─── Tur bitince en yüksek puanı güncelle ───
export async function recordRoundEnd(roundPoints: number): Promise<PlayerData> {
  return updatePlayerData((data) => ({
    ...data,
    bestScore: Math.max(data.bestScore, roundPoints),
  }))
}

// ─── Tüm veriyi sıfırla (ebeveyn paneli için) ───
export async function resetPlayerData(): Promise<void> {
  await Preferences.remove({ key: PLAYER_KEY })
}