import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Level } from '../types'
import { DEFAULT_LEVEL, loadLevel, saveLevel } from '../services/levelStorage'

/**
 * Seçili zorluk seviyesi — GLOBAL.
 * HomeScreen (seçici + kilit görünümü) ve ModuleScreen (oyun aralığı + kilit)
 * aynı seviyeyi paylaşsın diye context'te tutulur ve Preferences'a kaydedilir.
 */
interface LevelValue {
  level: Level
  /** Storage'tan ilk yükleme bitti mi? (yanıp sönmeyi önlemek için) */
  loaded: boolean
  setLevel: (level: Level) => void
}

const LevelContext = createContext<LevelValue | undefined>(undefined)

export function LevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<Level>(DEFAULT_LEVEL)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    loadLevel().then((l) => {
      if (!alive) return
      setLevelState(l)
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [])

  const setLevel = useCallback((next: Level) => {
    setLevelState(next)
    saveLevel(next)
  }, [])

  const value = useMemo<LevelValue>(
    () => ({ level, loaded, setLevel }),
    [level, loaded, setLevel]
  )

  return <LevelContext.Provider value={value}>{children}</LevelContext.Provider>
}

/** Seçili seviyeye erişim. Provider dışında kullanılırsa hata fırlatır. */
export function useLevel(): LevelValue {
  const ctx = useContext(LevelContext)
  if (!ctx) {
    throw new Error('useLevel must be used within <LevelProvider>')
  }
  return ctx
}
