import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_SECONDS,
  loadLimit,
  loadTimer,
  saveLimit,
  saveTimer,
  SECONDS_PER_MANGO,
} from '../services/timerStorage'

/**
 * Havuç/Mango timer — GLOBAL durum.
 * Sayfa değişse de (Home ↔ Module) geri sayım devam etsin diye context'te
 * tutulur. App.tsx'te <CarrotTimerProvider> ile sarılır.
 */
interface CarrotTimerValue {
  /** Kalan saniye (0..limitSeconds). */
  remainingSeconds: number
  /** Ebeveynin ayarladığı günlük süre tavanı (saniye). Mango sayısı buradan. */
  limitSeconds: number
  /** Geri sayım aktif mi? (başladı ve süre > 0) */
  isRunning: boolean
  /** İlk cevap verilip timer başlatıldı mı? */
  hasStarted: boolean
  /** Süre bitti mi? (remainingSeconds <= 0) — oyun yine de durmaz. */
  isFinished: boolean
  /** Bitiş ekranı bu oturumda gösterilip kapatıldı mı? */
  endScreenDismissed: boolean
  /** İlk cevapta çağrılır; geri sayımı başlatır (idempotent). */
  startTimer: () => void
  /** 10/10 ödülü: -30 saniye (1 mango bonus düşer). */
  reward: () => void
  /** Bitiş ekranı "Devam Et" ile kapatıldığında çağrılır. */
  dismissEndScreen: () => void
  /** Ebeveyn paneli: günlük süre tavanını değiştirir (anında bugüne uygulanır). */
  setLimit: (seconds: number) => void
}

const CarrotTimerContext = createContext<CarrotTimerValue | undefined>(undefined)

export function CarrotTimerProvider({ children }: { children: ReactNode }) {
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_SECONDS)
  const [limitSeconds, setLimitSeconds] = useState(DEFAULT_SECONDS)
  const [hasStarted, setHasStarted] = useState(false)
  const [endScreenDismissed, setEndScreenDismissed] = useState(false)
  // Storage'tan ilk yükleme bitene kadar kaydetme/tetikleme yapma.
  const [loaded, setLoaded] = useState(false)

  // ── İlk yükleme: ebeveyn limiti + bugünün süresi (yeni günse resetlenir) ──
  useEffect(() => {
    let alive = true
    Promise.all([loadLimit(), loadTimer()]).then(([limit, t]) => {
      if (!alive) return
      setLimitSeconds(limit)
      setRemainingSeconds(t.remainingSeconds)
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [])

  const isFinished = loaded && remainingSeconds <= 0
  const isRunning = hasStarted && remainingSeconds > 0

  // ── Tick: çalışırken her saniye 1 azalt (0'da durur) ──
  // Bağımlılık sadece isRunning → interval bir kez kurulur, bitince temizlenir.
  // Fonksiyonel update sayesinde stale closure olmaz.
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setRemainingSeconds((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning])

  // ── Her değişimde kaydet (yükleme bitince) ──
  useEffect(() => {
    if (!loaded) return
    saveTimer(remainingSeconds)
  }, [remainingSeconds, loaded])

  const startTimer = useCallback(() => {
    setHasStarted((prev) => (prev ? prev : true))
  }, [])

  const reward = useCallback(() => {
    setRemainingSeconds((s) => Math.max(0, s - SECONDS_PER_MANGO))
  }, [])

  const dismissEndScreen = useCallback(() => {
    setEndScreenDismissed(true)
  }, [])

  // Ebeveyn günlük süreyi değiştirince: yeni tavanı kaydet + bugünün
  // kalan süresini yeni tavana sıfırla (taze süre ver). Bitiş bayrağını
  // da temizle ki yeni süreyle "bitti" durumu kalkar.
  const setLimit = useCallback((seconds: number) => {
    setLimitSeconds(seconds)
    setRemainingSeconds(seconds)
    setEndScreenDismissed(false)
    saveLimit(seconds)
    saveTimer(seconds)
  }, [])

  const value = useMemo<CarrotTimerValue>(
    () => ({
      remainingSeconds,
      limitSeconds,
      isRunning,
      hasStarted,
      isFinished,
      endScreenDismissed,
      startTimer,
      reward,
      dismissEndScreen,
      setLimit,
    }),
    [
      remainingSeconds,
      limitSeconds,
      isRunning,
      hasStarted,
      isFinished,
      endScreenDismissed,
      startTimer,
      reward,
      dismissEndScreen,
      setLimit,
    ]
  )

  return <CarrotTimerContext.Provider value={value}>{children}</CarrotTimerContext.Provider>
}

/** Timer durumuna erişim. Provider dışında kullanılırsa hata fırlatır. */
export function useCarrotTimer(): CarrotTimerValue {
  const ctx = useContext(CarrotTimerContext)
  if (!ctx) {
    throw new Error('useCarrotTimer must be used within <CarrotTimerProvider>')
  }
  return ctx
}
