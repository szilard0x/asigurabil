import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PrivacyPage from './pages/PrivacyPage'
import { BrokerProvider, ReferralRedirect } from './lib/broker'

export default function App() {
  return (
    <BrowserRouter>
      <BrokerProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/confidentialitate" element={<PrivacyPage />} />
          {/* link de recomandare per broker: memorează codul și intră pe pagina principală */}
          <Route path="/b/:code" element={<ReferralRedirect />} />
          {/* Generatorul de carduri s-a mutat în panoul de admin (admin.asigurabil.ro/carduri) */}
        </Routes>
      </BrokerProvider>
    </BrowserRouter>
  )
}
