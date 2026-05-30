import { useEffect } from 'react'
import { useLottie } from 'lottie-react'

/**
 * Tek seferlik Lottie kutlama oynatıcısı.
 * - `data` (Lottie JSON) verilmezse hiçbir şey render etmez (zarif fallback) —
 *   böylece JSON dosyaları henüz eklenmemişken uygulama bozulmaz.
 * - Oynatma bitince `onComplete` çağrılır (loop yok).
 * Tam ekran, tıklamayı engellemez (pointer-events: none).
 *
 * Not: lottie-react'in forwardRef <Lottie> bileşeni yerine `useLottie` hook'u
 * kullanılıyor — Vite + React 18 prebundle'ında default export bir obje olarak
 * çözülüp "Element type is invalid" hatası veriyordu; hook bunu atlıyor.
 */
export default function LottieOverlay({
  data,
  onComplete,
  size = 260,
}: {
  data?: unknown
  onComplete?: () => void
  size?: number
}) {
  // Hook koşulsuz çağrılmalı; data yoksa boş obje + autoplay kapalı.
  const hasData = !!data
  const { View } = useLottie({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animationData: (data ?? {}) as any,
    loop: false,
    autoplay: hasData,
    onComplete,
    style: { width: size, height: size },
  })

  // data yoksa onComplete'i bir sonraki tick'te tetikle (akış tıkanmasın).
  useEffect(() => {
    if (!hasData && onComplete) {
      const id = setTimeout(onComplete, 0)
      return () => clearTimeout(id)
    }
  }, [hasData, onComplete])

  if (!hasData) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center">
      {View}
    </div>
  )
}
