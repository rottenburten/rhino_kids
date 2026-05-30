import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayerData } from '../hooks/usePlayerData'
import { useCarrotTimer } from '../contexts/CarrotTimerContext'
import { LIMIT_OPTIONS } from '../services/timerStorage'
import { clearTimer } from '../services/timerStorage'
import { resetPlayerData } from '../services/storage'
import { clearHistory, loadWeek, type WeekDay } from '../services/history'
import { BADGES } from '../services/badges'
import { MODULES } from '../modules/moduleList'

// ── PIN kapısı: basit toplama (iki haneli) — çocuk çözemesin, ebeveyn çözsün.
// Sayılar 5-9 arası seçilir, böylece sonuç 10-18 olur (5 yaş için zor).
function makeChallenge() {
  const a = 5 + Math.floor(Math.random() * 5) // 5..9
  const b = 5 + Math.floor(Math.random() * 5) // 5..9
  return { a, b, ans: a + b }
}

function PinGate({ onUnlock, onCancel }: { onUnlock: () => void; onCancel: () => void }) {
  const [challenge, setChallenge] = useState(makeChallenge)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  const submit = () => {
    if (parseInt(input, 10) === challenge.ans) {
      onUnlock()
    } else {
      setError(true)
      setInput('')
      setChallenge(makeChallenge())
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-savana-sky to-savana-earth p-6">
      <div className="bg-white border-[3px] border-savana-deep rounded-3xl p-8 max-w-sm w-full text-center shadow-kid">
        <div className="text-5xl mb-3">🔒</div>
        <h1 className="font-display text-xl font-bold text-savana-deep mb-1">Ebeveyn Girişi</h1>
        <p className="font-display text-sm text-savana-deep/70 mb-5">
          Devam etmek için soruyu çözün
        </p>
        <div className="font-display text-3xl font-bold text-savana-deep mb-4">
          {challenge.a} + {challenge.b} = ?
        </div>
        <input
          type="number"
          inputMode="numeric"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoFocus
          className="w-full text-center text-2xl font-display font-bold text-savana-deep border-2 border-savana-deep rounded-xl py-2 mb-2 outline-none focus:border-savana-accent"
        />
        {error && (
          <p className="text-sm font-bold text-red-600 mb-2">Yanlış, tekrar deneyin.</p>
        )}
        <div className="flex gap-3 mt-3">
          <button onClick={onCancel} className="kid-btn flex-1 bg-white border-savana-deep text-savana-deep">
            Geri
          </button>
          <button onClick={submit} className="kid-btn flex-1 bg-savana-grass border-savana-deep">
            Gir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Haftalık doğru/yanlış bar grafiği ──
function WeekChart({ week }: { week: WeekDay[] }) {
  const max = Math.max(1, ...week.map((d) => d.correct + d.wrong))
  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {week.map((d) => {
        const cH = (d.correct / max) * 100
        const wH = (d.wrong / max) * 100
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex-1 w-full flex flex-col justify-end gap-0.5">
              <div
                className="w-full bg-savana-grass rounded-t"
                style={{ height: `${cH}%` }}
                title={`${d.correct} doğru`}
              />
              <div
                className="w-full bg-red-400 rounded-b"
                style={{ height: `${wH}%` }}
                title={`${d.wrong} yanlış`}
              />
            </div>
            <div className="text-[10px] font-bold text-savana-deep">{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function ParentScreen() {
  const navigate = useNavigate()
  const { data, loading, update } = usePlayerData()
  const { limitSeconds, setLimit } = useCarrotTimer()
  const [unlocked, setUnlocked] = useState(false)
  const [week, setWeek] = useState<WeekDay[]>([])
  const [nameInput, setNameInput] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    loadWeek().then(setWeek)
  }, [])

  useEffect(() => {
    if (data) setNameInput(data.playerName)
  }, [data])

  const earnedCount = useMemo(() => data?.earnedBadges.length ?? 0, [data])

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} onCancel={() => navigate('/')} />
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-savana-sky">
        <div className="text-4xl animate-bob">🦏</div>
      </div>
    )
  }

  const saveName = () => {
    const name = nameInput.trim()
    if (name) update((d) => ({ ...d, playerName: name }))
  }

  const doReset = async () => {
    await resetPlayerData()
    await clearHistory()
    await clearTimer()
    // Tam temiz başlangıç için sayfayı yeniden yükle (tüm context'ler resetlenir).
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-savana-sky to-savana-earth p-4">
      <div className="max-w-2xl mx-auto pb-10">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="bg-white border-2 border-savana-deep rounded-full w-10 h-10 flex items-center justify-center font-bold text-savana-deep"
          >
            ←
          </button>
          <h1 className="font-display text-xl font-bold text-savana-deep">👨‍👩‍👧 Ebeveyn Paneli</h1>
          <div className="w-10" />
        </header>

        {/* HAVUÇ SÜRESİ */}
        <section className="bg-white border-2 border-savana-deep rounded-2xl p-4 mb-4">
          <h2 className="font-display font-bold text-savana-deep mb-1">🥭 Günlük Oyun Süresi</h2>
          <p className="text-xs text-savana-deep/60 mb-3">
            Çocuğun günlük mango (havuç) süresi. Değiştirince bugünden geçerli olur.
          </p>
          <div className="flex flex-wrap gap-2">
            {LIMIT_OPTIONS.map((opt) => {
              const active = opt === limitSeconds
              return (
                <button
                  key={opt}
                  onClick={() => setLimit(opt)}
                  className={`rounded-full px-4 py-1.5 font-display font-bold text-sm border-2 ${
                    active
                      ? 'bg-savana-deep text-white border-savana-deep'
                      : 'bg-white text-savana-deep border-savana-deep/40'
                  }`}
                >
                  {opt / 60} dk
                </button>
              )
            })}
          </div>
        </section>

        {/* HAFTALIK GRAFİK */}
        <section className="bg-white border-2 border-savana-deep rounded-2xl p-4 mb-4">
          <h2 className="font-display font-bold text-savana-deep mb-1">📊 Son 7 Gün</h2>
          <div className="flex gap-3 text-xs font-bold mb-3">
            <span className="text-savana-grass">■ Doğru</span>
            <span className="text-red-400">■ Yanlış</span>
          </div>
          <WeekChart week={week} />
        </section>

        {/* İSTATİSTİKLER */}
        <section className="bg-white border-2 border-savana-deep rounded-2xl p-4 mb-4">
          <h2 className="font-display font-bold text-savana-deep mb-3">📈 İstatistikler</h2>
          <div className="grid grid-cols-2 gap-3 mb-4 text-center">
            <Stat label="TOPLAM DOĞRU" value={data.totalCorrect} />
            <Stat label="EN YÜKSEK PUAN" value={data.bestScore} />
            <Stat label="EN UZUN SERİ" value={data.maxStreak} />
            <Stat label="ROZETLER" value={`${earnedCount}/${BADGES.length}`} />
          </div>
          <h3 className="font-display font-bold text-sm text-savana-deep mb-2">Modül Başına Doğru</h3>
          <div className="space-y-1">
            {MODULES.filter((m) => !m.comingSoon).map((m) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span className="font-semibold text-savana-deep">
                  {m.icon} {m.name}
                </span>
                <span className="font-bold text-savana-deep">{data.byModule[m.id] || 0}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ÇOCUĞUN ADI */}
        <section className="bg-white border-2 border-savana-deep rounded-2xl p-4 mb-4">
          <h2 className="font-display font-bold text-savana-deep mb-2">✏️ Çocuğun Adı</h2>
          <div className="flex gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={20}
              className="flex-1 text-savana-deep font-display font-bold border-2 border-savana-deep rounded-xl px-3 py-2 outline-none focus:border-savana-accent"
            />
            <button onClick={saveName} className="kid-btn bg-savana-grass border-savana-deep px-5">
              Kaydet
            </button>
          </div>
        </section>

        {/* VERİLERİ SIFIRLA */}
        <section className="bg-white border-2 border-red-400 rounded-2xl p-4">
          <h2 className="font-display font-bold text-red-700 mb-2">⚠️ Tüm Verileri Sıfırla</h2>
          <p className="text-xs text-savana-deep/60 mb-3">
            İstatistikler, rozetler, geçmiş ve süre ayarı silinir. Geri alınamaz.
          </p>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="kid-btn w-full bg-white border-red-400 text-red-700"
            >
              Sıfırla
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="kid-btn flex-1 bg-white border-savana-deep text-savana-deep"
              >
                Vazgeç
              </button>
              <button
                onClick={doReset}
                className="kid-btn flex-1 bg-red-500 border-red-700 text-white"
              >
                Evet, Sil
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-savana-sky/40 rounded-xl p-2 border-2 border-savana-deep/20">
      <div className="text-2xl font-display font-bold text-savana-deep">{value}</div>
      <div className="text-[10px] font-bold text-savana-grass">{label}</div>
    </div>
  )
}
