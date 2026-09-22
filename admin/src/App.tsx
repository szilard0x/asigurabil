import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider, RequireAuth, RequireAdmin } from './lib/auth'
import { needsPasswordSetup } from './lib/inviteFlag'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import SetPasswordPage from './pages/SetPasswordPage'
import InboxPage from './pages/InboxPage'
import RequestDetailPage from './pages/RequestDetailPage'
import CardsPage from './pages/CardsPage'
import UsersPage from './pages/UsersPage'
import SettingsPage from './pages/SettingsPage'

/** Utilizatorii veniți dintr-un link de invitație/resetare își setează întâi parola. */
function PasswordSetupGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (needsPasswordSetup() && location.pathname !== '/setare-parola') {
    return <Navigate to="/setare-parola" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/setare-parola"
            element={
              <RequireAuth>
                <SetPasswordPage />
              </RequireAuth>
            }
          />
          <Route
            element={
              <RequireAuth>
                <PasswordSetupGate>
                  <Layout />
                </PasswordSetupGate>
              </RequireAuth>
            }
          >
            <Route path="/" element={<InboxPage />} />
            <Route path="/cereri/:id" element={<RequestDetailPage />} />
            <Route path="/carduri" element={<CardsPage />} />
            <Route path="/setari" element={<SettingsPage />} />
            <Route
              path="/utilizatori"
              element={
                <RequireAdmin>
                  <UsersPage />
                </RequireAdmin>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
