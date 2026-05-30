import { motion } from 'framer-motion'

// Basit, bağımlılıksız konfeti — framer-motion ile yukarıdan düşen emoji'ler.
// Süresi animasyona değil çağıran tarafın setTimeout'una bağlıdır; bu component
// sadece görseli çizer (mount olduğu sürece oynar, unmount olunca kaybolur).
// Böylece "animasyon bitmedi → ekran takıldı" durumu imkânsızdır.

const PIECES = ['🎉', '⭐', '🥭', '✨', '🎊', '🌟', '🍃', '🌻']

export default function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      {Array.from({ length: 18 }, (_, i) => {
        const piece = PIECES[i % PIECES.length]
        const left = (i * 53) % 100 // 0..99 dağılım
        const delay = (i % 6) * 0.12
        const drift = i % 2 ? 30 : -30
        const dur = 1.6 + (i % 4) * 0.25
        return (
          <motion.div
            key={i}
            className="absolute text-3xl"
            style={{ left: `${left}%`, top: '-8%' }}
            initial={{ y: '-10vh', x: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: '110vh',
              x: drift,
              opacity: [0, 1, 1, 0],
              rotate: i % 2 ? 360 : -360,
            }}
            transition={{ duration: dur, delay, ease: 'easeIn' }}
          >
            {piece}
          </motion.div>
        )
      })}
    </div>
  )
}
