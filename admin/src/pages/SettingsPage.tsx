import { useEffect, useState } from 'react'
import { supabase, type NotificationSettings } from '../lib/supabase'
import { useAuth } from '../lib/auth'

/** Adresa publică a site-ului — în producție se setează VITE_SITE_URL=https://asigurabil.ro */
const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173'

export default function SettingsPage() {
  const { session, profile } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const referralLink = profile ? `${SITE_URL}/b/${profile.referral_code}` : null

  const copyLink = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      prompt('Copiază linkul manual:', referralLink)
    }
  }

  useEffect(() => {
    if (!session) return
    supabase
      .from('notification_settings')
      .select('*')
      .eq('profile_id', session.user.id)
      .single()
      .then(({ data }) => setSettings(data))
  }, [session])

  const patch = async (changes: Partial<NotificationSettings>) => {
    if (!settings || !session) return
    const next = { ...settings, ...changes }
    setSettings(next)
    const { error } = await supabase
      .from('notification_settings')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('profile_id', session.user.id)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  const sendTestDigest = async () => {
    setBusy(true)
    setTestResult(null)
    const { data, error } = await supabase.functions.invoke('send-digest', {
      body: { force: true },
    })
    setBusy(false)
    if (error || data?.error) {
      setTestResult('Trimiterea a eșuat — verifică tab-ul „Jurnal".')
      return
    }
    setTestResult(
      'Raportul a fost generat — vezi tab-ul „Jurnal" (local, mesajul nu pleacă pe WhatsApp).',
    )
  }

  if (!settings) return <p className="text-muted text-sm py-10 text-center">Se încarcă…</p>

  const rowCls = 'flex items-center justify-between gap-4 px-5 py-4'
  const selectCls =
    'bg-white border-[1.5px] border-line rounded-xl px-3 py-1.5 text-sm outline-none transition-all focus:border-amber'

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-navy text-2xl mb-6">Setări</h1>

      {/* linkul personal de recomandare */}
      {referralLink && (
        <div className="bg-white border border-line rounded-2xl px-5 py-4 mb-8">
          <b className="block font-display text-navy text-[14.5px] mb-1">
            Linkul tău de recomandare
          </b>
          <p className="text-muted text-[12.5px] mb-3">
            Clienții care intră pe site prin acest link văd numărul tău de telefon, mesajul
            WhatsApp ajunge la tine, iar cererea îți este repartizată automat.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <code className="bg-off border border-line rounded-lg px-3 py-2 text-[13px] text-navy select-all">
              {referralLink}
            </code>
            <button
              onClick={copyLink}
              className="bg-amber text-navy font-display font-semibold text-[13px] rounded-lg px-3.5 py-2 cursor-pointer hover:-translate-y-0.5 transition-transform"
            >
              {copied ? '✓ Copiat' : 'Copiază'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-2">
        <h2 className="font-display font-bold text-navy text-lg">Notificări</h2>
        {saved && <span className="text-green-700 text-sm">✓ Salvat</span>}
      </div>
      <p className="text-muted text-sm mb-4">
        Notificările sosesc pe WhatsApp, pe numărul tău de cont.
      </p>

      <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden mb-6">
        <div className={rowCls}>
          <div>
            <b className="block font-display text-navy text-[14.5px]">
              Mesaj instant la fiecare cerere nouă
            </b>
            <span className="text-muted text-[12.5px]">
              Așa afli de cererile noi — clienții trimit formularul direct din site. Brokerii
              primesc doar cererile venite prin linkul lor. Recomandat: pornit.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.instant_new_request}
            onChange={(e) => patch({ instant_new_request: e.target.checked })}
            className="w-5 h-5 accent-amber cursor-pointer shrink-0"
          />
        </div>
        <div className={rowCls}>
          <div>
            <b className="block font-display text-navy text-[14.5px]">
              Raport zilnic cu cererile nelucrate
            </b>
            <span className="text-muted text-[12.5px]">
              Un mesaj pe zi cu cererile noi și cele neschimbate de prea mult timp.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.daily_digest}
            onChange={(e) => patch({ daily_digest: e.target.checked })}
            className="w-5 h-5 accent-amber cursor-pointer shrink-0"
          />
        </div>
        <div className={rowCls}>
          <span className="text-[14px] text-ink">Ora raportului</span>
          <select
            value={settings.digest_hour}
            onChange={(e) => patch({ digest_hour: Number(e.target.value) })}
            className={selectCls}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>
        <div className={rowCls}>
          <span className="text-[14px] text-ink">
            O cerere e „uitată" dacă nu s-a schimbat de…
          </span>
          <select
            value={settings.stale_hours}
            onChange={(e) => patch({ stale_hours: Number(e.target.value) })}
            className={selectCls}
          >
            {[1, 2, 4, 6, 12, 24, 48, 72].map((h) => (
              <option key={h} value={h}>
                {h === 1 ? 'o oră' : h < 20 ? `${h} ore` : `${h} de ore`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {profile?.role === 'admin' && (
        <div className="mb-8">
          <button
            onClick={sendTestDigest}
            disabled={busy}
            className="bg-navy text-white font-display font-semibold text-sm rounded-xl px-5 py-2.5 cursor-pointer hover:-translate-y-0.5 transition-transform disabled:opacity-50"
          >
            {busy ? 'Se trimite…' : 'Trimite raportul acum (test)'}
          </button>
          {testResult && <p className="text-muted text-[13px] mt-2">{testResult}</p>}
        </div>
      )}

      <h2 className="font-display font-bold text-navy text-lg mb-2">Schimbă parola</h2>
      <ChangePasswordForm />
    </div>
  )
}

function ChangePasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    if (password.length < 8) {
      setResult({ ok: false, text: 'Parola trebuie să aibă cel puțin 8 caractere.' })
      return
    }
    if (password !== confirmPw) {
      setResult({ ok: false, text: 'Parolele nu coincid.' })
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) {
      setResult({ ok: false, text: 'Schimbarea a eșuat — încearcă din nou.' })
      return
    }
    setPassword('')
    setConfirmPw('')
    setResult({ ok: true, text: 'Parola a fost schimbată.' })
  }

  const inputCls =
    'bg-white border-[1.5px] border-line rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:border-amber'

  return (
    <form
      onSubmit={submit}
      className="bg-white border border-line rounded-2xl p-5 flex flex-wrap items-end gap-3"
    >
      <div className="flex-1 min-w-44">
        <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
          Parolă nouă
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          className={`${inputCls} w-full`}
        />
      </div>
      <div className="flex-1 min-w-44">
        <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
          Repetă parola
        </label>
        <input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          autoComplete="new-password"
          required
          className={`${inputCls} w-full`}
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="bg-navy text-white font-display font-semibold text-sm rounded-xl px-5 py-2.5 cursor-pointer hover:-translate-y-0.5 transition-transform disabled:opacity-50"
      >
        {busy ? 'Se salvează…' : 'Schimbă parola'}
      </button>
      {result && (
        <p className={`w-full text-[13px] ${result.ok ? 'text-green-700' : 'text-red-500'}`}>
          {result.text}
        </p>
      )}
    </form>
  )
}
