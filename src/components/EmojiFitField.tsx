import { useLayoutEffect, useRef, useState } from 'react'

interface Props {
  /** Değişince yeniden ölçülür (örn. emoji sayısı / soru imzası). */
  fitKey: string | number
  /** Başlangıç (en büyük) emoji boyutu, px. Az emojide bu boyutta kalır. */
  maxFont?: number
  /** En küçük emoji boyutu, px. Çok emojide bu tabana kadar küçülür. */
  minFont?: number
  /** Görsel alanın izin verilen en büyük yüksekliği, px. */
  maxHeight?: number
  /** İç flex kapsayıcıya uygulanan sınıflar (sarma/hizalama/gap). */
  className?: string
  children: React.ReactNode
}

/**
 * Emoji görsellerini, sabit genişlikli kapsayıcıya (genişlik + `maxHeight`)
 * SIĞACAK şekilde otomatik küçülten alan. Az emojide `maxFont`'ta kalır; çok
 * emojide (örn. toplama 9+9, hard seviyede 20+20) gerekirse `minFont`'a kadar
 * küçülür ve `flex-wrap` ile alt satırlara sarar → hiçbir platformda taşmaz.
 *
 * Neden gerekli: Android'in Noto Color Emoji glifleri iOS'un Apple Color
 * Emoji'sinden daha GENİŞ. Sabit `text-3xl` ile iOS'ta sığan dizi Android'de
 * taşıyordu. Ölçüm-temelli küçültme her iki platformda da garanti sığma verir.
 *
 * Emoji boyutu, kapsayıcının inline `font-size`'ından miras alınır: içerideki
 * emoji span'leri sınıfsız bırakılır (font-size: inherit) veya `em` çarpanı
 * kullanılır → tüm emojiler tek bir ölçekle birlikte küçülür.
 */
export default function EmojiFitField({
  fitKey,
  maxFont = 32,
  minFont = 12,
  maxHeight = 150,
  className = '',
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(maxFont)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      let s = maxFont
      el.style.fontSize = `${s}px`
      const fits = () =>
        el.scrollHeight <= maxHeight + 0.5 && el.scrollWidth <= el.clientWidth + 0.5
      while (s > minFont && !fits()) {
        s -= 1
        el.style.fontSize = `${s}px`
      }
      setSize(s)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [fitKey, maxFont, minFont, maxHeight])

  return (
    <div
      ref={ref}
      style={{ fontSize: `${size}px`, lineHeight: 1, maxHeight }}
      className={`w-full ${className}`}
    >
      {children}
    </div>
  )
}
