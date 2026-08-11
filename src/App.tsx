import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import CardsPage from './pages/CardsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Pagină internă (nelistată) pentru generat carduri de social media */}
        <Route path="/cards" element={<CardsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
