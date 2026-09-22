import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { INSURANCE_TYPES, REFERRAL_SOURCES, REQUEST_STATUSES } from '@shared/insurance'
import { useAuth } from '../lib/auth'
import {
  supabase,
  type Profile,
  type RequestRow,
  type RequestFileRow,
} from '../lib/supabase'

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** Link wa.me către CLIENT (nu către numărul echipei), cu mesaj pre-completat. */
function clientWhatsAppUrl(phone: string, text: string): string {
  const e164 = phone.replace(/[\s.\-()]/g, '').replace(/^(\+4|004)?0/, '40')
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [request, setRequest] = useState<RequestRow | null>(null)
  const [files, setFiles] = useState<RequestFileRow[]>([])
  const [team, setTeam] = useState<Profile[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('requests').select('*').eq('id', id).single(),
      supabase.from('request_files').select('*').eq('request_id', id).order('created_at'),
      supabase.from('profiles').select('*').order('full_name'),
    ]).then(([reqRes, filesRes, teamRes]) => {
      setRequest(reqRes.data)
      setNotes(reqRes.data?.notes ?? '')
      setFiles(filesRes.data ?? [])
      // brokerii își văd doar propriul profil (RLS) — lista completă apare doar adminului
      setTeam(teamRes.data ?? [])
      setLoading(false)
    })
  }, [id])

  const patch = async (changes: Partial<Pick<RequestRow, 'status' | 'assigned_to' | 'notes'>>) => {
    if (!request) return
    const { data } = await supabase
      .from('requests')
      .update(changes)
      .eq('id', request.id)
      .select()
      .single()
    if (data) {
      setRequest(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  const download = async (f: RequestFileRow) => {
    const { data, error } = await supabase.storage
      .from('request-files')
      .createSignedUrl(f.storage_path, 300)
    if (error || !data) {
      alert('Nu am putut genera linkul de descărcare.')
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  if (loading) return <p className="text-muted text-sm py-10 text-center">Se încarcă…</p>
  if (!request) {
    return (
      <div className="text-center py-10">
        <p className="text-muted mb-4">Cererea nu a fost găsită.</p>
        <Link to="/" className="text-amber font-semibold underline underline-offset-2">
          ← Înapoi la cereri
        </Link>
      </div>
    )
  }

  const type = INSURANCE_TYPES.find((t) => t.id === request.type_id)
  const referral = REFERRAL_SOURCES.find((r) => r.id === request.referral_id)
  const reasonLabels = request.reasons
    .map((rid) => type?.reasons.find((r) => r.id === rid)?.label ?? rid)
    .filter(Boolean)

  const infoRows: Array<[string, string]> = [
    ['Asigurare', `${type?.icon ?? ''} ${type?.label ?? request.type_id}`],
    ...(reasonLabels.length ? [['Motiv', reasonLabels.join('; ')] as [string, string]] : []),
    ...(request.reason_text ? [['Detalii', request.reason_text] as [string, string]] : []),
    ...(type?.extraFields ?? [])
      .filter((f) => request.extra[f.id])
      .map((f) => [f.label, request.extra[f.id]] as [string, string]),
    ['Nume', request.name],
    ['Telefon', request.phone],
    ...(request.city ? [['Localitate', request.city] as [string, string]] : []),
    ...(referral ? [['A aflat prin', referral.label] as [string, string]] : []),
    [
      'Primită',
      new Date(request.created_at).toLocaleString('ro-RO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    ],
  ]

  const inputCls =
    'bg-white border-[1.5px] border-line rounded-xl px-3.5 py-2 text-sm outline-none transition-all focus:border-amber'

  return (
    <div className="max-w-3xl">
      <Link to="/" className="text-muted text-sm hover:text-navy">
        ← Toate cererile
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-6">
        <h1 className="font-display font-bold text-navy text-2xl">
          {request.name} <span className="text-muted font-normal text-lg">· #{request.short_id}</span>
        </h1>
        <div className="flex gap-2.5">
          <a
            href={clientWhatsAppUrl(
              request.phone,
              `Bună ziua, ${request.name}! Sunt de la asigurabil.ro, în legătură cu cererea ta #${request.short_id}.`,
            )}
            target="_blank"
            rel="noopener"
            className="bg-[#25D366] text-white font-display font-semibold text-sm rounded-xl px-4 py-2 hover:-translate-y-0.5 transition-transform"
          >
            💬 WhatsApp
          </a>
          <a
            href={`tel:${request.phone.replace(/[\s.\-()]/g, '')}`}
            className="bg-navy text-white font-display font-semibold text-sm rounded-xl px-4 py-2 hover:-translate-y-0.5 transition-transform"
          >
            📞 Sună
          </a>
        </div>
      </div>

      {/* stare + responsabil */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div>
          <label className="block font-display font-semibold text-navy text-[12px] mb-1">
            Stare
          </label>
          <select
            value={request.status}
            onChange={(e) => patch({ status: e.target.value as RequestRow['status'] })}
            className={inputCls}
          >
            {REQUEST_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <div>
            <label className="block font-display font-semibold text-navy text-[12px] mb-1">
              Responsabil
            </label>
            <select
              value={request.assigned_to ?? ''}
              onChange={(e) => patch({ assigned_to: e.target.value || null })}
              className={inputCls}
            >
              <option value="">Nerepartizată — o vede doar adminul</option>
              {team.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email}
                </option>
              ))}
            </select>
          </div>
        )}
        {saved && <span className="text-green-700 text-sm pb-2.5">✓ Salvat</span>}
      </div>

      {/* datele cererii */}
      <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden mb-6">
        {infoRows.map(([label, value]) => (
          <div key={label} className="px-5 py-3">
            <small className="block text-muted text-[11px] uppercase tracking-wide">{label}</small>
            <span className="text-[14.5px] text-ink break-words">{value}</span>
          </div>
        ))}
      </div>

      {/* fișiere */}
      <h2 className="font-display font-bold text-navy text-lg mb-3">
        Documente atașate {files.length > 0 && `(${files.length})`}
      </h2>
      {files.length === 0 ? (
        <p className="text-muted text-sm mb-6">Clientul nu a atașat documente.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {files.map((f) => (
            <li key={f.id}>
              <button
                onClick={() => download(f)}
                className="w-full flex items-center justify-between gap-3 bg-white border border-line rounded-xl px-4 py-3 text-left cursor-pointer hover:border-amber transition-colors"
              >
                <span className="text-[14px] text-ink truncate">
                  {f.content_type === 'application/pdf' ? '📄' : '🖼️'} {f.file_name}
                </span>
                <span className="text-muted text-xs shrink-0">{formatSize(f.size)} · descarcă ↓</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* notițe */}
      <h2 className="font-display font-bold text-navy text-lg mb-3">Notițe interne</h2>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => notes !== (request.notes ?? '') && patch({ notes })}
        rows={4}
        placeholder="Ex: am sunat, revin joi cu oferta de la 3 asiguratori…"
        className="w-full bg-white border-[1.5px] border-line rounded-xl px-4 py-3 text-[14px] outline-none transition-all focus:border-amber resize-y"
      />
      <p className="text-muted text-xs mt-1.5">Se salvează automat când ieși din câmp.</p>
    </div>
  )
}
