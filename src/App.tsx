import { Routes, Route } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import ModuleScreen from './screens/ModuleScreen'
import ParentScreen from './screens/ParentScreen'
import { CarrotTimerProvider } from './contexts/CarrotTimerContext'
import { LevelProvider } from './contexts/LevelContext'

function App() {
  return (
    <LevelProvider>
      <CarrotTimerProvider>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/module/:id" element={<ModuleScreen />} />
          <Route path="/parent" element={<ParentScreen />} />
        </Routes>
      </CarrotTimerProvider>
    </LevelProvider>
  )
}

export default App