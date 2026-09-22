import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { INSURANCE_TYPES, REFERRAL_SOURCES, REQUEST_STATUSES } from '@shared/insurance'
import { supabase, type RequestRow } from '../lib/supabase'

function StatusBadge({ status }: { status: RequestRow['status'] }) {
  const s = REQUEST_STATUSES.find((x) => x.id === status)
  return (
    <span
      className="inline-block text-[11px] font-bold text-white px-2 py-0.5 rounded-full"
      style={{ background: s?.color ?? '#6B7280' }}
    >
      {s?.label ?? status}
    </span>
  )
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'acum'
  if (mins < 60) return `acum ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `acum ${hours} h`
  return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
}

export default function InboxPage() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [search, setSearch] = useState('')

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    setRequests(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
    // cereri noi apar live, fără refresh
    const channel = supabase
      .channel('requests-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchRequests)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return requests.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false
      if (typeFilter && r.type_id !== typeFilter) return false
      if (
        q &&
        ![r.name, r.phone, r.short_id, r.city ?? '']
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
        return false
      return true
    })
  }, [requests, statusFilter, typeFilter, search])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of requests) counts[r.status] = (counts[r.status] ?? 0) + 1
    return counts
  }, [requests])

  const referralCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of requests) {
      const key = r.referral_id ?? 'necunoscut'
      counts[key] = (counts[key] ?? 0) + 1
    }
    // toate canalele de pe landing, inclusiv cele cu zero; „necunoscut" doar dacă există
    const rows = REFERRAL_SOURCES.map((s) => [s.id, counts[s.id] ?? 0] as [string, number])
    if (counts['necunoscut']) rows.push(['necunoscut', counts['necunoscut']])
    return rows
  }, [requests])

  const inputCls =
    'bg-white border-[1.5px] border-line rounded-xl px-3.5 py-2 text-sm outline-none transition-all focus:border-amber'

  return (
    <div>
      <h1 className="font-display font-bold text-navy text-2xl mb-6">Cereri de ofertă</h1>

      {/* statistici rapide */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-[repeat(5,1fr)_1.8fr] gap-3 mb-7">
        {REQUEST_STATUSES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(statusFilter === s.id ? '' : s.id)}
            className={`bg-white border-[1.5px] rounded-2xl px-4 py-3 text-left cursor-pointer transition-all ${
              statusFilter === s.id ? 'border-amber shadow-[0_0_0_3px_rgba(245,158,11,.15)]' : 'border-line hover:border-amber'
            }`}
          >
            <span className="block font-display font-bold text-navy text-xl">
              {statusCounts[s.id] ?? 0}
            </span>
            <span className="text-muted text-xs">{s.label}</span>
          </button>
        ))}
        <div className="bg-white border-[1.5px] border-line rounded-2xl px-4 py-3">
          <span className="text-muted text-xs block mb-1">De unde vin clienții</span>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {referralCounts.map(([id, count]) => (
              <span key={id} className={`text-[12.5px] ${count === 0 ? 'text-muted' : 'text-ink'}`}>
                {REFERRAL_SOURCES.find((r) => r.id === id)?.label ?? 'Necunoscut'}:{' '}
                <b className="font-display">{count}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* filtre */}
      <div className="flex flex-wrap gap-2.5 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută nume, telefon sau #id…"
          className={`${inputCls} flex-1 min-w-52`}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputCls}>
          <option value="">Toate tipurile</option>
          {INSURANCE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
          <option value="">Toate stările</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* listă */}
      {loading ? (
        <p className="text-muted text-sm py-10 text-center">Se încarcă…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm py-10 text-center">
          Nicio cerere{requests.length > 0 ? ' care să corespundă filtrelor' : ' încă'}.
        </p>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden">
          {filtered.map((r) => {
            const type = INSURANCE_TYPES.find((t) => t.id === r.type_id)
            return (
              <Link
                key={r.id}
                to={`/cereri/${r.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-off transition-colors"
              >
                <span className="text-xl shrink-0" aria-hidden>
                  {type?.icon ?? '📄'}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block font-display text-navy text-[14.5px] truncate">
                    {r.name} · {type?.label ?? r.type_id}
                    {r.assigned_to === null && (
                      <span className="ml-2 align-middle text-[10px] font-bold text-amber border border-amber/50 rounded-full px-1.5 py-0.5 uppercase">
                        de asignat
                      </span>
                    )}
                  </b>
                  <span className="text-muted text-[12.5px]">
                    {r.phone}
                    {r.city ? ` · ${r.city}` : ''} · #{r.short_id}
                  </span>
                </span>
                {/* lățimi fixe: ora și statusul stau mereu aliniate pe coloană */}
                <span className="text-muted text-xs shrink-0 hidden sm:inline w-24 text-right">
                  {timeAgo(r.created_at)}
                </span>
                <span className="shrink-0 w-24 text-center">
                  <StatusBadge status={r.status} />
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
