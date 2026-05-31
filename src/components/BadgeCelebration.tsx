import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Reno from '../characters/Reno'
import type { BadgeDef } from '../services/badges'

/**
 * Yeni kazanılan rozet(ler) için kutlama overlay'i.
 * Birden fazla rozet sırayla gösterilir ("Devam" ile ilerlenir);
 * sonuncudan sonra onDone() çağrılır. Reno celebrate + basit konfeti.
 */
const CONFETTI = ['🎉', '⭐', '🥭', '✨', '🎊', '🌟']

export default function BadgeCelebration({
  badges,
  onDone,
}: {
  badges: BadgeDef[]
  onDone: () => void
}) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const badge = badges[index]
  if (!badge) return null

  const isLast = index >= badges.length - 1
  const next = () => (isLast ? onDone() : setIndex((i) => i + 1))

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-savana-deep/60 backdrop-blur-sm p-6">
      {/* Konfeti — yukarıdan düşen emoji'ler */}
      {CONFETTI.map((c, i) => (
        <motion.div
          key={`${index}-${i}`}
          className="absolute text-3xl pointer-events-none"
          style={{ left: `${10 + i * 15}%`, top: '-10%' }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: 2.2, delay: i * 0.15, ease: 'easeIn' }}
        >
          {c}
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        <motion.div
          key={badge.id}
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          className="relative bg-white border-[3px] border-savana-deep rounded-3xl p-8 max-w-sm w-full text-center shadow-kid"
        >
          <div className="flex justify-center mb-1">
            <Reno mood="celebrate" size={110} />
          </div>
          <div className="font-display text-sm font-bold tracking-wider text-savana-accent mb-2">
            {t('badgeCelebration.title')}
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 14 }}
            className="text-6xl mb-2"
          >
            {badge.emoji}
          </motion.div>
          <h2 className="font-display text-2xl font-bold text-savana-deep">
            {t(`badges.${badge.id}.name`)}
          </h2>
          <p className="font-display font-semibold text-savana-deep/70 mb-5">
            {t(`badges.${badge.id}.description`)}
          </p>
          <button onClick={next} className="kid-btn w-full bg-savana-grass border-savana-deep">
            {isLast
              ? t('badgeCelebration.continue')
              : t('badgeCelebration.next', { current: index + 1, total: badges.length })}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
