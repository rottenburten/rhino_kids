import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { initPurchases } from './services/purchases'
import './i18n'
import './index.css'

// RevenueCat'i App mount'tan önce başlat (native'de; web/dev'de no-op).
// await etmiyoruz — UI başlatmayı bloklamasın; PremiumContext durumu ayrıca çeker.
initPurchases()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)