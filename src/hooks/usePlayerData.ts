import { useState, useEffect, useCallback } from 'react'
import { loadPlayerData, savePlayerData } from '../services/storage'
import type { PlayerData } from '../types'

export function usePlayerData() {
  const [data, setData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(true)

  // İlk yükleme
  useEffect(() => {
    loadPlayerData().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  // Güncelleme yardımcısı (state + storage senkron)
  const update = useCallback(
    async (updater: (d: PlayerData) => PlayerData) => {
      if (!data) return
      const next = updater(data)
      setData(next)
      await savePlayerData(next)
    },
    [data]
  )

  return { data, loading, update }
}