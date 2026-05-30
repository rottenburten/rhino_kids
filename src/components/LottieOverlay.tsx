import { useEffect, useRef } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'

/**
 * Tek seferlik Lottie kutlama oynatıcısı.
 * - `data` (Lottie JSON) verilmezse hiçbir şey render etmez (zarif fallback) —
 *   böylece JSON dosyaları henüz eklenmemişken uygulama bozulmaz.
 * - Oynatma bitince `onComplete` çağrılır (loop yok).
 * Tam ekran, tıklamayı engellemez (pointer-events: none).
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
  const ref = useRef<LottieRefCurrentProps>(null)

  // data yoksa onComplete'i bir sonraki tick'te tetikle (akış tıkanmasın).
  useEffect(() => {
    if (!data && onComplete) {
      const id = setTimeout(onComplete, 0)
      return () => clearTimeout(id)
    }
  }, [data, onComplete])

  if (!data) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center">
      <Lottie
        lottieRef={ref}
        animationData={data}
        loop={false}
        autoplay
        onComplete={onComplete}
        style={{ width: size, height: size }}
      />
    </div>
  )
}
