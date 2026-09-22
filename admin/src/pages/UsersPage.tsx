import { useEffect, useState, type FormEvent } from 'react'
import { displayRoPhone, normalizeRoPhone } from '@shared/phone'
import { supabase, type Profile, type OutboxRow } from '../lib/supabase'
import { useAuth } from '../lib/auth'

const PURPOSE_LABELS: Record<string, string> = {
  invite: 'Invitație',
  reset: 'Resetare parolă',
  temp_password: 'Parolă temporară',
  digest: 'Digest zilnic',
}

/** Transformă linkurile din corpul mesajului în ancore clickabile (utile local, cu driverul mock). */
function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/\S+)/g)
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noopener"
            className="text-amber underline underline-offset-2 break-all"
          >
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

export default function UsersPage() {
  const { session } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [outbox, setOutbox] = useState<OutboxRow[]>([])
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'broker' | 'admin'>('broker')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const fetchAll = async () => {
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('whatsapp_outbox').select('*').order('created_at', { ascending: false }).limit(15),
    ])
    setProfiles(p ?? [])
    setOutbox(o ?? [])
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const callFn = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('invite-user', { body })
    if (error) throw new Error(error.message)
    if (data?.error) throw new Error(data.message ?? data.error)
    return data
  }

  const invite = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!normalizeRoPhone(phone)) {
      setMessage({ ok: false, text: 'Număr de telefon invalid — formatul: 07xx xxx xxx.' })
      return
    }
    setBusy(true)
    try {
      const res = await callFn({ action: 'invite', phone, fullName, role })
      setMessage({
        ok: true,
        text: res.whatsappSent
          ? `Invitație trimisă pe WhatsApp către ${phone}.`
          : `Cont creat, dar mesajul WhatsApp a eșuat — vezi jurnalul de mai jos sau setează o parolă temporară.`,
      })
      setPhone('')
      setFullName('')
      setRole('broker')
      await fetchAll()
    } catch (err) {
      setMessage({ ok: false, text: `Invitația a eșuat: ${(err as Error).message}` })
    }
    setBusy(false)
  }

  const toggleDisabled = async (p: Profile) => {
    const action = p.disabled ? 'reactivate' : 'deactivate'
    if (
      action === 'deactivate' &&
      !confirm(`Dezactivezi contul „${p.full_name ?? p.phone}"? Nu se va mai putea autentifica.`)
    )
      return
    setMessage(null)
    try {
      await callFn({ action, userId: p.id })
      await fetchAll()
    } catch (err) {
      setMessage({ ok: false, text: `Operațiunea a eșuat: ${(err as Error).message}` })
    }
  }

  const setTempPassword = async (p: Profile) => {
    const password = prompt(
      `Parolă temporară pentru „${p.full_name ?? p.phone}" (minim 8 caractere).\nComunic-o direct — utilizatorul o poate schimba apoi din „Am uitat parola".`,
    )
    if (!password) return
    setMessage(null)
    try {
      await callFn({ action: 'temp-password', userId: p.id, password })
      setMessage({ ok: true, text: 'Parola temporară a fost setată.' })
    } catch (err) {
      setMessage({ ok: false, text: `Setarea parolei a eșuat: ${(err as Error).message}` })
    }
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
        <div className="flex-1 min-w-40">
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Nume
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Nume Prenume"
            className={`${inputCls} w-full`}
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Telefon (WhatsApp)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="07xx xxx xxx"
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
          {busy ? 'Se trimite…' : 'Invită pe WhatsApp'}
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
                {p.full_name || (p.phone ? displayRoPhone(p.phone) : p.email)}
                {p.id === session?.user.id && <span className="text-muted font-normal"> (tu)</span>}
              </b>
              <span className="text-muted text-[12.5px]">
                {p.phone ? `📱 ${displayRoPhone(p.phone)}` : p.email}
              </span>
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
                <>
                  <button
                    onClick={() => setTempPassword(p)}
                    className="text-muted text-xs hover:text-navy cursor-pointer underline underline-offset-2"
                  >
                    Parolă temp.
                  </button>
                  <button
                    onClick={() => toggleDisabled(p)}
                    className="text-muted text-xs hover:text-navy cursor-pointer underline underline-offset-2"
                  >
                    {p.disabled ? 'Reactivează' : 'Dezactivează'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <p className="text-muted text-sm px-5 py-6">Niciun utilizator încă.</p>
        )}
      </div>
      <p className="text-muted text-xs mt-3">
        Invitatul primește pe WhatsApp un link cu care își setează parola, apoi se autentifică cu
        telefonul. Dacă mesajul nu ajunge, folosește „Parolă temp." și comunică-i-o direct.
      </p>

      <h2 className="font-display font-bold text-navy text-lg mt-10 mb-3">
        Jurnal mesaje WhatsApp
      </h2>
      <p className="text-muted text-xs mb-3">
        Ultimele mesaje trimise de sistem. În mediul local (driver „mock") mesajele NU pleacă pe
        WhatsApp — linkurile se deschid direct de aici.
      </p>
      <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden">
        {outbox.map((m) => (
          <div key={m.id} className="px-5 py-3.5">
            <div className="flex items-center justify-between gap-3 mb-1">
              <b className="font-display text-navy text-[13px]">
                {PURPOSE_LABELS[m.purpose] ?? m.purpose} → {displayRoPhone(m.to_phone)}
              </b>
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                  m.status === 'sent'
                    ? 'bg-green-100 text-green-700'
                    : m.status === 'failed'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-off text-muted border border-line'
                }`}
              >
                {m.status === 'mock' ? 'LOCAL' : m.status.toUpperCase()}
              </span>
            </div>
            <p className="text-[12.5px] text-muted whitespace-pre-wrap leading-relaxed">
              <Linkify text={m.body} />
            </p>
          </div>
        ))}
        {outbox.length === 0 && (
          <p className="text-muted text-sm px-5 py-6">Niciun mesaj trimis încă.</p>
        )}
      </div>
    </div>
  )
}
