import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@shared/Logo'
import { supabase } from '../lib/supabase'
import { clearPasswordSetup } from '../lib/inviteFlag'

export default function SetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('Parola trebuie să aibă cel puțin 8 caractere.')
      return
    }
    if (password !== confirm) {
      setError('Parolele nu coincid.')
      return
    }
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('Nu am putut seta parola. Încearcă din nou sau cere o invitație nouă.')
      setBusy(false)
      return
    }
    clearPasswordSetup()
    navigate('/', { replace: true })
  }

  const inputCls =
    'w-full bg-white border-[1.5px] border-line rounded-xl px-4 py-3 text-[14.5px] outline-none transition-all focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)]'

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#0F2A43_0%,#16395A_55%,#0C3155_100%)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo variant="light" height={36} />
        </div>
        <form onSubmit={submit} className="bg-white rounded-3xl shadow-card p-8">
          <h1 className="font-display font-bold text-navy text-xl mb-1">Setează-ți parola</h1>
          <p className="text-muted text-sm mb-6">
            Bine ai venit în echipă! Alege o parolă pentru contul tău.
          </p>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Parolă nouă
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className={inputCls}
          />
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5 mt-4">
            Repetă parola
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className={inputCls}
          />
          {error && <p className="text-red-500 text-[13px] mt-3">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full mt-6 bg-amber text-navy font-display font-semibold rounded-xl py-3 cursor-pointer transition-all hover:-translate-y-0.5 shadow-amber disabled:opacity-50"
          >
            {busy ? 'Se salvează…' : 'Salvează parola'}
          </button>
        </form>
      </div>
    </main>
  )
}
