import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PrivacyPage from './pages/PrivacyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/confidentialitate" element={<PrivacyPage />} />
        {/* Generatorul de carduri s-a mutat în panoul de admin (admin.asigurabil.ro/carduri) */}
      </Routes>
    </BrowserRouter>
  )
}
