import { Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ModuleScreen from './screens/ModuleScreen'
import ParentScreen from './screens/ParentScreen'
import PaywallScreen from './screens/PaywallScreen'
import { CarrotTimerProvider } from './contexts/CarrotTimerContext'
import { LevelProvider } from './contexts/LevelContext'
import { PremiumProvider } from './contexts/PremiumContext'

function App() {
  return (
    <PremiumProvider>
      <LevelProvider>
        <CarrotTimerProvider>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/module/:id" element={<ModuleScreen />} />
          <Route path="/parent" element={<ParentScreen />} />
          {/* GEÇİCİ — paywall UI önizlemesi. Tetikleme (deneme bitti mi?)
              RevenueCat entegrasyonunda gelecek. */}
          <Route path="/paywall" element={<PaywallScreen />} />
        </Routes>
        </CarrotTimerProvider>
      </LevelProvider>
    </PremiumProvider>
  )
}

export default App