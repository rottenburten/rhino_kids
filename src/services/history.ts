import { Preferences } from '@capacitor/preferences'

// Günlük doğru/yanlış geçmişi — ebeveyn panelindeki haftalık grafik için.
// Toplam istatistikler PlayerData'da; bu ise GÜN bazında kırılım tutar.

const KEY = 'rhino_daily_history'

export interface DayStat {
  correct: number
  wrong: number
}

/** YYYY-MM-DD → o günün doğru/yanlış sayısı */
export type History = Record<string, DayStat>

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function loadAll(): Promise<History> {
  try {
    const { value } = await Preferences.get({ key: KEY })
    if (value) return JSON.parse(value) as History
  } catch (e) {
    console.error('Failed to load history', e)
  }
  return {}
}

/** Bir cevabı bugünün kovasına işle (her cevapta çağrılır). */
export async function recordAnswer(isCorrect: boolean): Promise<void> {
  try {
    const hist = await loadAll()
    const d = today()
    const cur = hist[d] || { correct: 0, wrong: 0 }
    if (isCorrect) cur.correct += 1
    else cur.wrong += 1
    hist[d] = cur
    await Preferences.set({ key: KEY, value: JSON.stringify(hist) })
  } catch (e) {
    console.error('Failed to record history', e)
  }
}

export interface WeekDay {
  date: string
  /** Haftanın günü indeksi (Pazar=0 ... Cumartesi=6); etiket i18n'den gelir. */
  dayIndex: number
  correct: number
  wrong: number
}

/** Son 7 gün (bugün dahil), eskiden yeniye sıralı. */
export async function loadWeek(): Promise<WeekDay[]> {
  const hist = await loadAll()
  const now = new Date()
  const days: WeekDay[] = []
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(now)
    dt.setDate(now.getDate() - i)
    const key = dt.toISOString().slice(0, 10)
    const stat = hist[key] || { correct: 0, wrong: 0 }
    days.push({
      date: key,
      dayIndex: dt.getDay(),
      correct: stat.correct,
      wrong: stat.wrong,
    })
  }
  return days
}

/** Tüm geçmişi sil (ebeveyn paneli "verileri sıfırla"). */
export async function clearHistory(): Promise<void> {
  await Preferences.remove({ key: KEY })
}
