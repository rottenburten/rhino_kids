import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Mood } from './types'

/**
 * Tüm karakterler için ortak animasyon sarmalı.
 * Her karakter kendi SVG'sini `children` olarak verir; mood'a göre
 * hareketi bu bileşen yönetir. Böylece animasyon mantığı TEK yerde.
 *
 * Kullanım:
 *   <CharacterShell mood={mood} size={size}>
 *     <svg>...</svg>
 *   </CharacterShell>
 */

const moodVariants: Variants = {
  // Durağan: yumuşak nefes/bob — sürekli döngü
  idle: {
    x: 0,
    y: [0, -6, 0],
    rotate: 0,
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  // Mutlu: zıplama + hafif sağa-sola sallanma
  happy: {
    y: [0, -18, 0],
    x: [0, -5, 5, 0],
    rotate: 0,
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.3, ease: 'easeOut' },
  },
  // "sad" ama üzgün DEĞİL: cesaretlendirici. Önce hafif yana eğilir,
  // sonra hemen toparlanıp neşeyle 2 kez zıplar — "ol-olmadı, devam!" enerjisi.
  sad: {
    x: 0,
    rotate: [0, -6, 0, 0, 0, 0],
    y: [0, 0, -8, 0, -6, 0],
    transition: {
      duration: 1.2,
      times: [0, 0.15, 0.4, 0.6, 0.8, 1],
      ease: 'easeOut',
    },
  },
  // Düşünme: hafif yana eğilip bekleme
  thinking: {
    x: 0,
    y: 0,
    rotate: -7,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  // Kutlama: büyük zıplama + tam dönüş
  celebrate: {
    x: 0,
    y: [0, -30, 0],
    rotate: [0, 360],
    transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.2, ease: 'easeInOut' },
  },
}

interface ShellProps {
  mood?: Mood
  size?: number
  children: ReactNode
}

export default function CharacterShell({ mood = 'idle', size = 160, children }: ShellProps) {
  return (
    <motion.div
      variants={moodVariants}
      animate={mood}
      style={{
        width: size,
        height: size,
        // dönme/zıplama alt-orta noktadan dönsün ki "ayakta zıplama" hissi olsun
        transformOrigin: 'center bottom',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
      }}
    >
      {children}
    </motion.div>
  )
}
