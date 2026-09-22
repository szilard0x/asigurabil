import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import Logo from '@shared/Logo'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function LoginPage() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  const signIn = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setInfo(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email sau parolă greșite — sau contul a fost dezactivat.')
    setBusy(false)
  }

  const resetPassword = async () => {
    if (!email) {
      setError('Scrie mai întâi adresa de email.')
      return
    }
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) setError('Nu am putut trimite emailul de resetare.')
    else setInfo('Ți-am trimis un email cu linkul de resetare a parolei.')
  }

  const inputCls =
    'w-full bg-white border-[1.5px] border-line rounded-xl px-4 py-3 text-[14.5px] outline-none transition-all focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)]'

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#0F2A43_0%,#16395A_55%,#0C3155_100%)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo variant="light" height={36} />
        </div>
        <form onSubmit={signIn} className="bg-white rounded-3xl shadow-card p-8">
          <h1 className="font-display font-bold text-navy text-xl mb-1">Panou de administrare</h1>
          <p className="text-muted text-sm mb-6">
            Acces doar pe bază de invitație, pentru echipa asigurabil.ro.
          </p>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className={inputCls}
          />
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5 mt-4">
            Parolă
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className={inputCls}
          />
          {error && <p className="text-red-500 text-[13px] mt-3">{error}</p>}
          {info && <p className="text-green-700 text-[13px] mt-3">{info}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-6 bg-amber text-navy font-display font-semibold rounded-xl py-3 cursor-pointer transition-all hover:-translate-y-0.5 shadow-amber disabled:opacity-50"
          >
            {busy ? 'Se conectează…' : 'Intră în cont'}
          </button>
          <button
            type="button"
            onClick={resetPassword}
            className="w-full mt-3 text-muted text-[13px] hover:text-navy cursor-pointer underline underline-offset-2"
          >
            Am uitat parola
          </button>
        </form>
      </div>
    </main>
  )
}
