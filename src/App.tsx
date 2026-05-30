import { Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ModuleScreen from './screens/ModuleScreen'
import { CarrotTimerProvider } from './contexts/CarrotTimerContext'
import { LevelProvider } from './contexts/LevelContext'

function App() {
  return (
    <LevelProvider>
      <CarrotTimerProvider>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/module/:id" element={<ModuleScreen />} />
        </Routes>
      </CarrotTimerProvider>
    </LevelProvider>
  )
}

export default App