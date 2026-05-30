import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { getModule } from '../modules/moduleList'
import { buildRound, makeOptions, getRange, formatClock } from '../modules/questionPool'
import ShapeGlyph, { SHAPE_NAMES, SHAPE_NAMES_ACC } from '../components/ShapeGlyph'
import { recordCorrectAnswer, finalizeRound } from '../services/storage'
import type { BadgeDef } from '../services/badges'
import type { Question } from '../types'
import { getCharacter, useCharacterMood } from '../characters'
import { useCarrotTimer } from '../contexts/CarrotTimerContext'
import { useLevel } from '../contexts/LevelContext'
import { markCompleted } from '../services/sessionLock'
import { recordAnswer } from '../services/history'
import MangoTree from '../components/MangoTree'
import BadgeCelebration from '../components/BadgeCelebration'
import Confetti from '../components/Confetti'
import TimerEndScreen from '../components/TimerEndScreen'

const CORRECT_WAIT = 1500
const WRONG_WAIT = 2800
// 10/10 olunca: bonus mango düşme animasyonu + kutlama izlensin diye
// tur-sonu özetine geçmeden önce kısa bekleme.
const BONUS_WAIT = 1200

const EMOJIS = ['🍄', '🌰', '🍃', '🌿', '🐛', '🦋', '🐝', '🌸', '🍀', '🌻', '🫐', '🍓', '🥕']

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// SAAT modülü için basit analog saat yüzü (akrep/yelkovan).
function ClockFace({ hour, minute }: { hour: number; minute: number }) {
  // Açılar: 12 = -90°. Saat akrebi dakikaya göre hafif ilerler.
  const minAngle = minute * 6 - 90
  const hourAngle = (hour % 12) * 30 + minute * 0.5 - 90
  const hx = 50 + 26 * Math.cos((hourAngle * Math.PI) / 180)
  const hy = 50 + 26 * Math.sin((hourAngle * Math.PI) / 180)
  const mx = 50 + 38 * Math.cos((minAngle * Math.PI) / 180)
  const my = 50 + 38 * Math.sin((minAngle * Math.PI) / 180)
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#5b4636" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180)
        return (
          <circle
            key={i}
            cx={50 + 39 * Math.cos(a)}
            cy={50 + 39 * Math.sin(a)}
            r="2"
            fill="#5b4636"
          />
        )
      })}
      <line x1="50" y1="50" x2={hx} y2={hy} stroke="#5b4636" strokeWidth="5" strokeLinecap="round" />
      <line x1="50" y1="50" x2={mx} y2={my} stroke="#ef6f6c" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="50" cy="50" r="4" fill="#5b4636" />
    </svg>
  )
}

export default function ModuleScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const module = getModule(id || '')

  // Seviye global context'ten (HomeScreen'deki seçici ile aynı, Preferences kalıcı).
  const { level } = useLevel()
  const [questions, setQuestions] = useState<Question[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [roundCorrect, setRoundCorrect] = useState(0)
  const [roundPoints, setRoundPoints] = useState(0)
  const [options, setOptions] = useState<number[]>([])
  const [answered, setAnswered] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showRoundEnd, setShowRoundEnd] = useState(false)
  // 10/10 bonus kutlaması görünürlüğü + gösterilecek mesaj (mango durumuna göre).
  const [bonusCelebrate, setBonusCelebrate] = useState(false)
  const [bonusMessage, setBonusMessage] = useState('')
  // Bu turda yeni kazanılan rozetler (sırayla kutlanır, sonra tur-sonu özeti).
  const [pendingBadges, setPendingBadges] = useState<BadgeDef[]>([])
  const { mood, flash } = useCharacterMood() // base: 'idle'
  // Havuç/Mango timer (global). Süre Home ↔ Module geçişinde devam eder.
  const { startTimer, reward, isFinished, endScreenDismissed, dismissEndScreen } =
    useCarrotTimer()
  const showTimerEnd = isFinished && !endScreenDismissed

  // Soru ilerletme / tur-sonu geçişi için tek timer. useRef ile yönetilir:
  // her yeni zamanlamada öncekini iptal eder, unmount'ta temizlenir
  // (projenin setTimeout deseni — çift-tetikleme/sızıntı önlenir).
  const nextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scheduleNext = useCallback((fn: () => void, delay: number) => {
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
    nextTimeoutRef.current = setTimeout(() => {
      nextTimeoutRef.current = null
      fn()
    }, delay)
  }, [])
  // 10/10 kutlamasını kapatan AYRI timer — soru-ilerletme timer'ıyla (nextTimeoutRef)
  // çakışmasın diye bağımsız. Kapanma her zaman bu timer'a bağlı, animasyona DEĞİL.
  const bonusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
      if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current)
    },
    []
  )

  // Tur sonu: puanı/perfect'i kaydet + rozet ödüllendir. Yeni rozet varsa
  // önce kutlamayı göster (sırayla), kapanınca tur-sonu özetine geç; yoksa
  // doğrudan özete geç.
  const finishRound = useCallback((totalPoints: number, perfect: boolean) => {
    finalizeRound(totalPoints, perfect).then((newBadges) => {
      if (newBadges.length > 0) {
        setPendingBadges(newBadges)
      } else {
        setShowRoundEnd(true)
      }
    })
  }, [])

  // Yeni tur başlat
  const startNewRound = useCallback(() => {
    if (!module) return
    const round = buildRound(module.id, level, 10)
    setQuestions(round)
    setQIndex(0)
    setStreak(0)
    setRoundCorrect(0)
    setRoundPoints(0)
    setAnswered(false)
    setFeedback(null)
    setShowRoundEnd(false)
    setBonusCelebrate(false)
    setBonusMessage('')
    setPendingBadges([])
    if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current)
    if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current)
  }, [module, level])

  useEffect(() => {
    startNewRound()
  }, [startNewRound])

  // Soru değişince seçenekleri üret
  useEffect(() => {
    if (qIndex >= questions.length || !questions[qIndex]) return
    const q = questions[qIndex]
    // ŞEKİL/SAAT kendi hazır seçeneklerini taşır (choices); diğerleri sayısal
    // mesafeyle üretilir (makeOptions).
    if (q.choices && q.choices.length > 0) {
      setOptions(q.choices)
    } else {
      const [, hi] = getRange(level)
      setOptions(makeOptions(q.ans, hi))
    }
    setAnswered(false)
    setFeedback(null)
  }, [qIndex, questions, level])

  if (!module) {
    return <div>Modül bulunamadı</div>
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-savana-sky">
        <div className="text-4xl animate-bob">🦏</div>
      </div>
    )
  }

  if (showRoundEnd) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-savana-sky to-savana-earth p-6">
        {showTimerEnd && <TimerEndScreen onContinue={dismissEndScreen} />}
        {pendingBadges.length > 0 && (
          <BadgeCelebration
            badges={pendingBadges}
            onDone={() => {
              setPendingBadges([])
              setShowRoundEnd(true)
            }}
          />
        )}
        <div className="bg-white border-[3px] border-savana-deep rounded-3xl p-8 max-w-md text-center shadow-kid">
          <div className="text-6xl mb-2">
            {roundCorrect === 10 ? '🏆' : roundCorrect >= 7 ? '🌟' : '💪'}
          </div>
          <h2 className="font-display text-2xl font-bold text-savana-deep mb-2">
            {roundCorrect === 10 ? 'Mükemmel!' : roundCorrect >= 7 ? 'Harika!' : 'İyi Deneme!'}
          </h2>
          <div className="grid grid-cols-3 gap-4 mt-4 mb-6">
            <div>
              <div className="text-3xl font-display font-bold text-savana-deep">
                {roundCorrect}/10
              </div>
              <div className="text-xs font-bold text-savana-grass">DOĞRU</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-savana-deep">
                {roundPoints}
              </div>
              <div className="text-xs font-bold text-savana-grass">PUAN</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-savana-deep">
                {streak}
              </div>
              <div className="text-xs font-bold text-savana-grass">EN UZUN SERİ</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="kid-btn flex-1 bg-savana-grass border-savana-deep"
            >
              🏠 Ana Ekran
            </button>
            <button onClick={startNewRound} className="kid-btn flex-1">
              🌿 Yeni Tur
            </button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[qIndex]
  const emoji = pick(EMOJIS)
  const Character = getCharacter(module.id)

  const onSelect = async (val: number) => {
    if (answered) return
    setAnswered(true)

    // İlk cevapta (doğru/yanlış fark etmez) geri sayımı başlat (idempotent).
    startTimer()

    const isCorrect = val === q.ans
    // Günlük geçmişe işle (ebeveyn panelindeki haftalık grafik için).
    recordAnswer(isCorrect)
    if (isCorrect) {
      const newStreak = streak + 1
      let pts = 10
      if (newStreak >= 5) pts = 25
      else if (newStreak >= 3) pts = 15

      setStreak(newStreak)
      setRoundCorrect((c) => c + 1)
      setRoundPoints((p) => p + pts)
      setFeedback('correct')
      flash('celebrate', CORRECT_WAIT)

      await recordCorrectAnswer(module.id, pts, newStreak)

      // 10/10 ödülü: SADECE tur sonunda, 10 sorunun 10'u da doğruysa.
      // roundCorrect bu cevap için henüz güncellenmedi → +1 ile sayılır.
      const isLast = qIndex + 1 >= questions.length
      const isPerfect = roundCorrect + 1 === 10

      scheduleNext(() => {
        if (!isLast) {
          setQIndex((i) => i + 1)
          return
        }
        // Tur bitti → bu mod+seviyeyi oturum için kilitle (10/10 şartı YOK).
        markCompleted(module.id, level)
        if (isPerfect) {
          // 10/10 kutlaması — mango durumundan BAĞIMSIZ tek akış:
          // Mango varsa düşür + mango mesajı; bittiyse sadece 10/10 mesajı.
          // Mango durumu SADECE mesajı değiştirir; akış ve kapanma aynı.
          const hadMango = remainingSeconds > 0
          if (hadMango) reward()
          setBonusMessage(hadMango ? '🥭 Bir mango daha topladın!' : '🎉 Mükemmel! 10/10!')
          setBonusCelebrate(true)
          // KOŞULSUZ kapanma garantisi (ayrı ref, animasyona bağlı değil):
          if (bonusTimeoutRef.current) clearTimeout(bonusTimeoutRef.current)
          bonusTimeoutRef.current = setTimeout(() => {
            bonusTimeoutRef.current = null
            setBonusCelebrate(false)
            finishRound(roundPoints + pts, true)
          }, BONUS_WAIT)
        } else {
          finishRound(roundPoints + pts, false)
        }
      }, CORRECT_WAIT)
    } else {
      setStreak(0)
      setFeedback('wrong')
      flash('sad', WRONG_WAIT)
      scheduleNext(() => {
        if (qIndex + 1 >= questions.length) {
          // Tur bitti → kilitle (yanlışla bitse bile "bu oturumda oynandı").
          markCompleted(module.id, level)
          finishRound(roundPoints, false)
        } else {
          setQIndex((i) => i + 1)
        }
      }, WRONG_WAIT)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-savana-sky to-savana-earth p-4">
      {showTimerEnd && <TimerEndScreen onContinue={dismissEndScreen} />}
      <div className="max-w-2xl mx-auto">
        {/* MANGO TIMER (görsel geri sayım — sayı/dakika gösterilmez) */}
        <div className="mb-3">
          <MangoTree />
        </div>

        {/* 10/10 konfeti — bonusCelebrate'e bağlı; BONUS_WAIT setTimeout'u
            bunu kesin kapatır (animasyon bitişine bağlı DEĞİL → takılma olmaz). */}
        {bonusCelebrate && <Confetti />}

        {/* 10/10 BONUS KUTLAMASI — bonus mango düşerken görünür */}
        {bonusCelebrate && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16 }}
            className="mb-3 flex justify-center"
          >
            <div className="bg-white border-2 border-mango rounded-full px-5 py-2 font-display font-bold text-mango-dark shadow-kid">
              {bonusMessage}
            </div>
          </motion.div>
        )}


        {/* HEADER */}
        <header className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate('/')}
            className="bg-white border-2 border-savana-deep rounded-full w-10 h-10 flex items-center justify-center font-bold text-savana-deep"
          >
            ←
          </button>
          <div className="text-center">
            {Character ? (
              <div className="flex justify-center">
                <Character mood={mood} size={70} />
              </div>
            ) : (
              // "Yakında" modüller için karakter yok → emoji fallback
              <div className="text-2xl">{module.character}</div>
            )}
            <div className="text-xs font-bold text-savana-deep">
              {module.characterName}
            </div>
          </div>
          <div className="text-xs font-bold text-savana-deep bg-white px-3 py-2 rounded-full border-2 border-savana-deep">
            🔥 {streak}
          </div>
        </header>

        {/* PROGRESS */}
        <div className="bg-white/70 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-full bg-savana-deep transition-all duration-500"
            style={{ width: `${((qIndex + 1) / 10) * 100}%` }}
          />
        </div>
        <div className="text-center text-xs font-bold text-savana-deep mb-4">
          Soru {qIndex + 1} / 10
        </div>

        {/* OYUN KARTI */}
        <div className="bg-white border-[3px] border-savana-deep rounded-3xl p-6 min-h-[280px] relative">
          {feedback === 'correct' && (
            <div className="absolute inset-0 bg-green-100/95 rounded-2xl flex flex-col items-center justify-center z-10">
              <div className="text-6xl mb-2">🎉</div>
              <div className="text-2xl font-display font-bold text-green-800">
                Doğru!
              </div>
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="absolute inset-0 bg-red-100/95 rounded-2xl flex flex-col items-center justify-center z-10">
              <div className="text-6xl mb-2">😅</div>
              <div className="text-2xl font-display font-bold text-red-800">
                Yanlış!
              </div>
              <div className="mt-2 bg-white px-6 py-2 rounded-xl border-2 border-savana-deep flex items-center gap-2">
                <span className="font-display font-bold text-savana-deep text-xl">Doğrusu:</span>
                {q.type === 'shape' ? (
                  <ShapeGlyph kind={q.ans} size={32} />
                ) : (
                  <span className="font-display font-bold text-savana-deep text-xl">
                    {q.type === 'clock' ? formatClock(q.ans) : q.ans}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* SORU */}
          <h2 className="text-center font-display text-2xl font-bold text-savana-deep mb-4">
            {q.type === 'count' && 'Kaç tane var? 👀'}
            {q.type === 'add' && `${q.a} + ${q.b} = ?`}
            {q.type === 'sub' && `${q.a} − ${q.b} = ?`}
            {q.type === 'mul' && `${q.a} × ${q.b} = ?`}
            {q.type === 'div' && `${q.a} ÷ ${q.b} = ?`}
            {q.type === 'seq' && 'Eksik sayıyı bul! 🔢'}
            {q.type === 'shape' &&
              `${SHAPE_NAMES_ACC[q.ans] ?? SHAPE_NAMES[q.ans]} bul! 👀`}
            {q.type === 'clock' && 'Saat kaç? ⏰'}
          </h2>

          {/* GÖRSEL */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[60px] items-center">
            {q.type === 'count' &&
              Array.from({ length: q.a }, (_, i) => (
                <span key={i} className="text-4xl">
                  {emoji}
                </span>
              ))}

            {/* SIRA: diziyi göster, eksik konumda '?' */}
            {q.type === 'seq' &&
              q.seq?.map((n, i) => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-display font-bold ${
                    i === q.missingIndex
                      ? 'border-dashed border-savana-accent text-savana-accent bg-amber-50'
                      : 'border-savana-deep text-savana-deep bg-white'
                  }`}
                >
                  {i === q.missingIndex ? '?' : n}
                </div>
              ))}

            {/* SAAT: basit analog saat */}
            {q.type === 'clock' && q.clockH !== undefined && (
              <ClockFace hour={q.clockH} minute={q.clockM ?? 0} />
            )}
          </div>

          {/* SEÇENEKLER */}
          <div className="grid grid-cols-3 gap-3">
            {options.map((val) => (
              <button
                key={val}
                onClick={() => onSelect(val)}
                disabled={answered}
                className="kid-card p-5 text-3xl font-display font-bold text-savana-deep disabled:opacity-50 flex items-center justify-center"
              >
                {q.type === 'shape' ? (
                  <ShapeGlyph kind={val} size={52} />
                ) : q.type === 'clock' ? (
                  <span>{formatClock(val)}</span>
                ) : (
                  val
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}