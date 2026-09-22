import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import Logo from '@shared/Logo'
import TurnstileWidget from '@shared/TurnstileWidget'
import { normalizeRoPhone, phoneToSyntheticEmail } from '@shared/phone'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

const TURNSTILE_SITE_KEY: string =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'

export default function LoginPage() {
  const { session, loading } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  if (!loading && session) return <Navigate to="/" replace />

  const signIn = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    const normalized = normalizeRoPhone(phone)
    if (!normalized) {
      setError('Verifică numărul de telefon — ar trebui să arate ca 07xx xxx xxx.')
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: phoneToSyntheticEmail(normalized),
      password,
    })
    if (error) setError('Telefon sau parolă greșite — sau contul a fost dezactivat.')
    setBusy(false)
  }

  const requestReset = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    const normalized = normalizeRoPhone(phone)
    if (!normalized) {
      setError('Verifică numărul de telefon — ar trebui să arate ca 07xx xxx xxx.')
      return
    }
    if (!turnstileToken) {
      setError('Mai așteaptă o secundă verificarea anti-spam și încearcă din nou.')
      return
    }
    setBusy(true)
    const { error } = await supabase.functions.invoke('reset-password', {
      body: { phone: normalized, turnstileToken },
    })
    setBusy(false)
    if (error) {
      setError('Nu am putut trimite cererea. Încearcă din nou.')
      return
    }
    setInfo(
      'Dacă numărul are cont, vei primi pe WhatsApp un link de resetare a parolei în câteva momente.',
    )
    setForgotMode(false)
  }

  const inputCls =
    'w-full bg-white border-[1.5px] border-line rounded-xl px-4 py-3 text-[14.5px] outline-none transition-all focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)]'

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#0F2A43_0%,#16395A_55%,#0C3155_100%)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo variant="light" height={36} />
        </div>
        <form onSubmit={forgotMode ? requestReset : signIn} className="bg-white rounded-3xl shadow-card p-8">
          <h1 className="font-display font-bold text-navy text-xl mb-1">
            {forgotMode ? 'Resetare parolă' : 'Panou de administrare'}
          </h1>
          <p className="text-muted text-sm mb-6">
            {forgotMode
              ? 'Îți trimitem pe WhatsApp un link cu care îți setezi o parolă nouă.'
              : 'Acces doar pe bază de invitație, pentru echipa asigurabil.ro.'}
          </p>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Telefon
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07xx xxx xxx"
            autoComplete="tel"
            required
            className={inputCls}
          />
          {!forgotMode && (
            <>
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
            </>
          )}
          {forgotMode && (
            <div className="mt-4 flex justify-center">
              <TurnstileWidget sitekey={TURNSTILE_SITE_KEY} onToken={setTurnstileToken} />
            </div>
          )}
          {error && <p className="text-red-500 text-[13px] mt-3">{error}</p>}
          {info && <p className="text-green-700 text-[13px] mt-3">{info}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-6 bg-amber text-navy font-display font-semibold rounded-xl py-3 cursor-pointer transition-all hover:-translate-y-0.5 shadow-amber disabled:opacity-50"
          >
            {busy ? 'Se trimite…' : forgotMode ? 'Trimite link pe WhatsApp' : 'Intră în cont'}
          </button>
          <button
            type="button"
            onClick={() => {
              setForgotMode((v) => !v)
              setError(null)
              setInfo(null)
            }}
            className="w-full mt-3 text-muted text-[13px] hover:text-navy cursor-pointer underline underline-offset-2"
          >
            {forgotMode ? '← Înapoi la autentificare' : 'Am uitat parola'}
          </button>
        </form>
      </div>
    </main>
  )
}
