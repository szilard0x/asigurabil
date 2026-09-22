import { useEffect, useState, type FormEvent } from 'react'
import { supabase, type Profile } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function UsersPage() {
  const { session } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'broker' | 'admin'>('broker')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setProfiles(data ?? [])
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const callInviteFn = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('invite-user', { body })
    if (error) throw new Error(error.message)
    if (data?.error) throw new Error(data.message ?? data.error)
    return data
  }

  const toggleDisabled = async (p: Profile) => {
    const action = p.disabled ? 'reactivate' : 'deactivate'
    if (
      action === 'deactivate' &&
      !confirm(`Dezactivezi contul ${p.email}? Nu se va mai putea autentifica.`)
    )
      return
    setMessage(null)
    try {
      await callInviteFn({ action, userId: p.id })
      await fetchProfiles()
    } catch (err) {
      setMessage({ ok: false, text: `Operațiunea a eșuat: ${(err as Error).message}` })
    }
  }

  const invite = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      await callInviteFn({ action: 'invite', email, fullName, role })
      setMessage({ ok: true, text: `Invitație trimisă către ${email}.` })
      setEmail('')
      setFullName('')
      setRole('broker')
      await fetchProfiles()
    } catch (err) {
      setMessage({ ok: false, text: `Invitația a eșuat: ${(err as Error).message}` })
    }
    setBusy(false)
  }

  const inputCls =
    'bg-white border-[1.5px] border-line rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:border-amber'

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-bold text-navy text-2xl mb-6">Utilizatori</h1>

      <form
        onSubmit={invite}
        className="bg-white border border-line rounded-2xl p-6 mb-8 flex flex-wrap items-end gap-3"
      >
        <div className="flex-1 min-w-48">
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="broker@exemplu.ro"
            className={`${inputCls} w-full`}
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Nume
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nume Prenume"
            className={`${inputCls} w-full`}
          />
        </div>
        <div>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Rol
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'broker' | 'admin')}
            className={inputCls}
          >
            <option value="broker">Broker</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-amber text-navy font-display font-semibold text-sm rounded-xl px-5 py-2.5 cursor-pointer hover:-translate-y-0.5 transition-transform disabled:opacity-50"
        >
          {busy ? 'Se trimite…' : 'Trimite invitație'}
        </button>
        {message && (
          <p className={`w-full text-[13px] ${message.ok ? 'text-green-700' : 'text-red-500'}`}>
            {message.text}
          </p>
        )}
      </form>

      <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <div className="min-w-0">
              <b className="block font-display text-navy text-[14.5px] truncate">
                {p.full_name || p.email}
                {p.id === session?.user.id && <span className="text-muted font-normal"> (tu)</span>}
              </b>
              <span className="text-muted text-[12.5px]">{p.email}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  p.disabled
                    ? 'bg-red-100 text-red-600'
                    : p.role === 'admin'
                      ? 'bg-amber text-navy'
                      : 'bg-off text-muted border border-line'
                }`}
              >
                {p.disabled ? 'DEZACTIVAT' : p.role === 'admin' ? 'ADMIN' : 'BROKER'}
              </span>
              {p.id !== session?.user.id && (
                <button
                  onClick={() => toggleDisabled(p)}
                  className="text-muted text-xs hover:text-navy cursor-pointer underline underline-offset-2"
                >
                  {p.disabled ? 'Reactivează' : 'Dezactivează'}
                </button>
              )}
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <p className="text-muted text-sm px-5 py-6">Niciun utilizator încă.</p>
        )}
      </div>
      <p className="text-muted text-xs mt-3">
        Invitatul primește un email cu link de activare și își setează singur parola. Un cont
        dezactivat nu se mai poate autentifica până nu e reactivat.
      </p>
    </div>
  )
}
