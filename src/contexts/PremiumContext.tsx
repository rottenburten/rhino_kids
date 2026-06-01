import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { hasPremium } from '../services/purchases'

// ── Abonelik (premium) durumu — uygulama genelinde tek kaynak ───────────────
// premium: RevenueCat entitlement "Rhino Kids Premium" aktif mi (gerçek durum).
// loaded:  ilk kontrol tamamlandı mı (gate kararı bundan ÖNCE verilmemeli).
// refresh: satın alma/restore sonrası durumu RevenueCat'ten yeniden çek.
//
// NOT: Şimdilik SADECE ALTYAPI. Hiçbir yerde otomatik /paywall yönlendirmesi
// YOK; gate akışı sonra bu context okunarak eklenecek. Gate ölçütü her zaman
// RevenueCat'in gerçek durumu (hasPremium) — asla cihaz saati değil.

interface PremiumState {
  premium: boolean
  loaded: boolean
  refresh: () => Promise<void>
}

const PremiumContext = createContext<PremiumState>({
  premium: false,
  loaded: false,
  refresh: async () => {},
})

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [premium, setPremium] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const active = await hasPremium()
    setPremium(active)
    setLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <PremiumContext.Provider value={{ premium, loaded, refresh }}>
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium(): PremiumState {
  return useContext(PremiumContext)
}
