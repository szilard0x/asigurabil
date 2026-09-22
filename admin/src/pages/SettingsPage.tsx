import { useEffect, useState } from 'react'
import { supabase, type NotificationSettings } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export default function SettingsPage() {
  const { session, profile } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
      setTestResult('Trimiterea a eșuat — verifică jurnalul din Utilizatori.')
      return
    }
    setTestResult(
      'Digestul a fost generat — vezi jurnalul de mesaje din pagina Utilizatori (local nu pleacă pe WhatsApp).',
    )
  }

  if (!settings) return <p className="text-muted text-sm py-10 text-center">Se încarcă…</p>

  const rowCls = 'flex items-center justify-between gap-4 px-5 py-4'
  const selectCls =
    'bg-white border-[1.5px] border-line rounded-xl px-3 py-1.5 text-sm outline-none transition-all focus:border-amber'

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display font-bold text-navy text-2xl">Setări notificări</h1>
        {saved && <span className="text-green-700 text-sm">✓ Salvat</span>}
      </div>
      <p className="text-muted text-sm mb-6">
        Notificările sosesc pe WhatsApp, pe numărul tău de cont.
      </p>

      <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden mb-6">
        <div className={rowCls}>
          <div>
            <b className="block font-display text-navy text-[14.5px]">
              Digest zilnic cu cererile nelucrate
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
          <span className="text-[14px] text-ink">Ora digestului</span>
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
            value={settings.stale_days}
            onChange={(e) => patch({ stale_days: Number(e.target.value) })}
            className={selectCls}
          >
            {[1, 2, 3, 5, 7, 14].map((d) => (
              <option key={d} value={d}>
                {d === 1 ? 'o zi' : `${d} zile`}
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
            {busy ? 'Se trimite…' : 'Trimite digestul acum (test)'}
          </button>
          {testResult && <p className="text-muted text-[13px] mt-2">{testResult}</p>}
        </div>
      )}

      <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden opacity-80">
        <div className="px-5 py-3 bg-amber-soft/60 border-b border-amber/30">
          <span className="text-[12px] font-bold text-navy uppercase tracking-wide">
            🔜 În curând — nefuncțional încă
          </span>
        </div>
        <div className={rowCls}>
          <div>
            <b className="block font-display text-navy text-[14.5px]">
              Mesaj instant la fiecare cerere nouă
            </b>
            <span className="text-muted text-[12.5px]">
              Util dacă clientul nu apucă să trimită mesajul WhatsApp — cererea rămâne doar în
              panou. Se activează în versiunea următoare.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.instant_new_request}
            onChange={(e) => patch({ instant_new_request: e.target.checked })}
            className="w-5 h-5 accent-amber cursor-pointer shrink-0"
          />
        </div>
      </div>
    </div>
  )
}
