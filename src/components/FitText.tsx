import { useLayoutEffect, useRef, useState } from 'react'

interface FitTextProps {
  /** Gösterilecek metin. Değişince (dil değişimi dahil) yeniden ölçülür. */
  text: string
  /** Başlangıç (en büyük) font boyutu, px. */
  max?: number
  /** İzin verilen en küçük font boyutu, px. Okunabilirlik tabanı. */
  min?: number
  /** Span'e uygulanan ek sınıflar (wrap/leading/hizalama). */
  className?: string
}

/**
 * Metni, ana kapsayıcıya (genişlik + yükseklik) SIĞACAK şekilde otomatik
 * küçülten etiket. Kısa adlar `max`'ta kalır; uzun adlar (MULTIPLICATION,
 * SUBTRACTION) gerekirse `min`'e kadar küçülür. Böylece modül kartlarında
 * isim hiçbir dilde/fontta/ekranda taşmaz — Android (Roboto fallback) dahil.
 *
 * Ana kapsayıcı SABİT boyutlu olmalı (örn. `w-full h-8`); bu bileşen sadece
 * font boyutunu ayarlar, kutu boyutunu DEĞİŞTİRMEZ → kartlar eşit boyda kalır.
 */
export default function FitText({ text, max = 11, min = 8, className = '' }: FitTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState(max)

  useLayoutEffect(() => {
    const el = ref.current
    const parent = el?.parentElement
    if (!el || !parent) return

    const fit = () => {
      let s = max
      el.style.fontSize = `${s}px`
      const fits = () =>
        el.scrollWidth <= parent.clientWidth + 0.5 &&
        el.scrollHeight <= parent.clientHeight + 0.5
      while (s > min && !fits()) {
        s -= 0.5
        el.style.fontSize = `${s}px`
      }
      setSize(s)
    }

    fit()
    // Ekran döndürme / yeniden boyutlandırmada tekrar ölç.
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [text, max, min])

  return (
    <span ref={ref} style={{ fontSize: `${size}px` }} className={className}>
      {text}
    </span>
  )
}
