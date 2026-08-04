import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Reno from '../characters/Reno'
import { getCharacter } from '../characters'
import SavannaBackground from '../components/SavannaBackground'
import FitText from '../components/FitText'
import { MODULES } from '../modules/moduleList'
import { usePlayerData } from '../hooks/usePlayerData'
import { isCompleted, getPendingBubble, markBubbleShown } from '../services/dailyLock'
import { useDailyLock } from '../hooks/useDailyLock'
import { useLevel } from '../contexts/LevelContext'
import { BADGES } from '../services/badges'
import { useLocalizeNumber } from '../i18n/digits'
import type { Level, ModuleId } from '../types'

// Seviye seçici seçenekleri (etiket i18n'den, emoji sabit).
const LEVEL_OPTIONS: { id: Level; emoji: string }[] = [
  { id: 'easy', emoji: '🐣' },
  { id: 'mid', emoji: '🦔' },
  { id: 'hard', emoji: '🦁' },
]

export default function HomeScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const n = useLocalizeNumber()
  const { data, loading } = usePlayerData()
  const { level, loaded: levelLoaded, setLevel } = useLevel()
  const { loaded: lockLoaded } = useDailyLock()

  // ── Kutlama balonu: bir bölüm BUGÜN ilk kez kilitlenince, o bölümün kartı
  // üzerinde tek seferlik kutlama gösterilir. 4 sn sonra otomatik kapanır
  // (dokununca da kapanır). getPendingBubble tek-sefer mantığını yürütür.
  const [bubbleModuleId, setBubbleModuleId] = useState<ModuleId | null>(null)
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!lockLoaded) return
    const pending = getPendingBubble(level)
    if (!pending) return
    markBubbleShown(pending, level) // tek-sefer: hemen işaretle (tekrar açılmasın)
    setBubbleModuleId(pending)
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = setTimeout(() => {
      bubbleTimerRef.current = null
      setBubbleModuleId(null)
    }, 4000)
  }, [lockLoaded, level])

  useEffect(
    () => () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    },
    []
  )

  const dismissBubble = () => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = null
    setBubbleModuleId(null)
  }

  if (loading || !data || !levelLoaded || !lockLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-savana-sky">
        <div className="text-4xl animate-bob">🦏</div>
      </div>
    )
  }

  // Seçili seviyede oynanabilir (yakında olmayan) tüm modüller bugün
  // tamamlandı mı? → "seviyeyi bitirdin" banner'ı için.
  const playable = MODULES.filter((m) => !m.comingSoon)
  const allCompleted =
    playable.length > 0 && playable.every((m) => isCompleted(m.id, level))

  // Kazanılan rozet id'leri — vitrin için hızlı arama.
  const earnedBadgeIds = new Set(data.earnedBadges)

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-savana-sky via-savana-sun to-savana-earth">
      <SavannaBackground />

      {/* Ebeveyn paneli — köşede küçük ve soluk, çocuğun dikkatini çekmesin.
          Girişte matematik PIN kapısı var. */}
      <button
        onClick={() => navigate('/parent')}
        aria-label={t('home.parentPanelAria')}
        className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] end-[calc(0.75rem+env(safe-area-inset-right))] z-20 w-9 h-9 rounded-full bg-white/40 text-savana-deep/50 text-base flex items-center justify-center"
      >
        ⚙️
      </button>

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-2">
          <h1 className="font-display text-3xl font-bold text-savana-deep">
            🦏 Rhi<span className="text-savana-accent">no</span>
          </h1>
          <div className="flex gap-2">
            <div className="bg-white border-2 border-mango rounded-full px-3 py-1 font-bold text-mango-dark text-sm">
              🥭 {n(data.mangos)}
            </div>
            <div className="bg-white border-2 border-red-400 rounded-full px-3 py-1 font-bold text-red-700 text-sm">
              🔥 {n(data.dailyStreak)}
            </div>
          </div>
        </header>

        {/* RENO */}
        <div className="text-center py-4">
          <div className="inline-block bg-white border-[3px] border-savana-deep rounded-2xl px-4 py-2 mb-3 font-display font-semibold text-savana-deep shadow-kid">
            {t('home.greeting', { name: data.playerName })}
          </div>
          <div className="relative inline-block">
            <Reno />
          </div>
        </div>

        {/* SEVİYE SEÇİCİ */}
        <div className="flex justify-center gap-2 mb-2">
          {LEVEL_OPTIONS.map((opt) => {
            const active = opt.id === level
            return (
              <button
                key={opt.id}
                onClick={() => setLevel(opt.id)}
                aria-pressed={active}
                className={`flex items-center gap-1 rounded-full px-4 py-1.5 font-display font-bold text-sm border-2 transition-all ${
                  active
                    ? 'bg-savana-deep text-white border-savana-deep shadow-kid scale-105'
                    : 'bg-white text-savana-deep border-savana-deep/40 opacity-80'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{t(`levels.${opt.id}`)}</span>
              </button>
            )
          })}
        </div>

        {/* MODÜLLER */}
        <div className="mt-4">
          <h2 className="text-center font-display font-bold text-savana-deep text-sm tracking-wider mb-3">
            {t('home.whatToLearn')}
          </h2>

          {/* Bugün oynanabilir tüm modüller tamamlandıysa kutla. */}
          {allCompleted && (
            <div className="mb-3 bg-savana-grass border-[3px] border-savana-deep rounded-2xl px-4 py-3 text-center font-display font-bold text-savana-deep shadow-kid">
              {t('home.levelDone')}
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 items-stretch">
            {MODULES.map((mod) => {
              // Modülün kendi çizdiğimiz karakteri (count/add/sub/mul/div).
              // Henüz karakteri olmayan modüller (seq/shape/clock) emoji'de kalır.
              const Character = getCharacter(mod.id)
              // Bugün oynandıysa kilitli görünür (sadece oynanabilir modüller).
              const completed = !mod.comingSoon && isCompleted(mod.id, level)
              return (
                <div key={mod.id} className="relative h-full">
                  {/* Kutlama balonu — kartın ÜSTÜNDE, kartı kapatmadan. Pop-in. */}
                  <AnimatePresence>
                    {bubbleModuleId === mod.id && (
                      <motion.button
                        type="button"
                        onClick={dismissBubble}
                        initial={{ scale: 0.6, opacity: 0, y: 6 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.7, opacity: 0, y: 4 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 w-44 max-w-[44vw] bg-white border-[3px] border-savana-deep rounded-2xl px-3 py-2 shadow-kid text-center"
                      >
                        <p className="font-display font-bold text-[11px] leading-snug text-savana-deep">
                          {t('home.sectionCompletedBubble')}
                        </p>
                        {/* Aşağıyı işaret eden küçük üçgen (konuşma balonu kuyruğu) */}
                        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-savana-deep" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => {
                      if (mod.comingSoon) {
                        alert(t('home.comingSoonAlert', { name: t(`modules.${mod.id}.character`) }))
                      } else if (completed) {
                        alert(t('home.completedAlert'))
                      } else {
                        navigate(`/module/${mod.id}`)
                      }
                    }}
                    className={`kid-card p-3 text-center relative w-full h-full flex flex-col items-center justify-start ${
                      mod.comingSoon || completed ? 'opacity-50' : ''
                    }`}
                  >
                    {mod.comingSoon && (
                      <div className="absolute top-1 end-1 text-xs">🔒</div>
                    )}
                    {completed && (
                      <div className="absolute top-1 end-1 w-5 h-5 rounded-full bg-savana-grass border-2 border-savana-deep flex items-center justify-center text-[10px] font-bold text-savana-deep">
                        ✓
                      </div>
                    )}
                    {Character ? (
                      // viewBox 0 0 200 200 olduğu için karakter 56px kutuda
                      // ortalı ve taşmasız oturur (Zara'nın uzun boynu dahil).
                      <div className="flex items-center justify-center h-14 mb-1 overflow-visible">
                        <Character size={56} mood="idle" />
                      </div>
                    ) : (
                      <div className="text-3xl mb-1 flex items-center justify-center h-14">
                        {mod.icon}
                      </div>
                    )}
                    {/* İsim: SABİT yükseklikli kapsayıcı (h-8 = ~2 satır). Kutu
                        BÜYÜMEZ → ikon alanı (h-14) + bu sabit alan = TÜM kartlar
                        eşit boy. FitText, adı bu kutuya sığacak şekilde otomatik
                        küçültür: kısa adlar 11px'te kalır, uzun EN adları
                        (MULTIPLICATION, SUBTRACTION) gerekince küçülür → hiçbir
                        dilde/fontta (Android Roboto fallback dahil) taşmaz. */}
                    <div className="w-full h-8 flex items-center justify-center overflow-hidden font-display font-bold text-savana-deep">
                      <FitText
                        text={t(`modules.${mod.id}.name`)}
                        max={11}
                        min={8}
                        className="block w-full text-center leading-tight break-words"
                      />
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Tüm bölümler kilitliyken cesaretlendirici alt mesaj —
              "takılmış" değil "başardın" hissi versin. */}
          {allCompleted && (
            <p className="mt-3 text-center font-display font-semibold text-savana-deep/80 text-sm">
              {t('home.allDone')}
            </p>
          )}
        </div>

        {/* İSTATİSTİK ÖZET */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 text-center border-2 border-savana-deep">
            <div className="text-xl font-display font-bold text-savana-deep">
              {n(data.totalCorrect)}
            </div>
            <div className="text-[10px] font-bold text-savana-grass">
              {t('stats.totalCorrect')}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 text-center border-2 border-savana-deep">
            <div className="text-xl font-display font-bold text-savana-deep">
              {n(data.bestScore)}
            </div>
            <div className="text-[10px] font-bold text-savana-grass">
              {t('stats.bestScore')}
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-2 text-center border-2 border-savana-deep">
            <div className="text-xl font-display font-bold text-savana-deep">
              {n(data.maxStreak)}
            </div>
            <div className="text-[10px] font-bold text-savana-grass">
              {t('stats.maxStreak')}
            </div>
          </div>
        </div>

        {/* ROZET VİTRİNİ — kazanılanlar renkli, kazanılmayanlar gri/kilitli */}
        <div className="mt-6">
          <h2 className="text-center font-display font-bold text-savana-deep text-sm tracking-wider mb-3">
            {t('badgesShowcase.title')} ({n(earnedBadgeIds.size)}/{n(BADGES.length)})
          </h2>
          <div className="grid grid-cols-6 gap-2">
            {BADGES.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id)
              return (
                <div
                  key={badge.id}
                  title={`${t(`badges.${badge.id}.name`)} — ${t(`badges.${badge.id}.description`)}`}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 ${
                    earned
                      ? 'bg-white border-savana-deep shadow-kid'
                      : 'bg-savana-deep/5 border-savana-deep/20'
                  }`}
                >
                  <div className={`text-2xl ${earned ? '' : 'opacity-30 grayscale'}`}>
                    {earned ? badge.emoji : '🔒'}
                  </div>
                  <div
                    className={`text-[8px] font-bold leading-tight text-center mt-0.5 ${
                      earned ? 'text-savana-deep' : 'text-savana-deep/40'
                    }`}
                  >
                    {t(`badges.${badge.id}.name`)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
