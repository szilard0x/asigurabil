import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CardsPage from './pages/CardsPage'
import PrivacyPage from './pages/PrivacyPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/confidentialitate" element={<PrivacyPage />} />
        {/* Pagină internă (nelistată) pentru generat carduri de social media */}
        <Route path="/cards" element={<CardsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
