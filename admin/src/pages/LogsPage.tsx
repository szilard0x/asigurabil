import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Linkify from '../components/Linkify'

interface LogRow {
  id: string
  type: string
  message: string
  meta: Record<string, unknown>
  created_at: string
}

const TYPE_INFO: Record<string, { label: string; icon: string }> = {
  request_created: { label: 'Cerere nouă', icon: '📥' },
  user_invited: { label: 'Invitație', icon: '✉️' },
  user_deleted: { label: 'Cont șters', icon: '🗑️' },
  user_deactivated: { label: 'Cont dezactivat', icon: '⛔' },
  user_reactivated: { label: 'Cont reactivat', icon: '✅' },
  temp_password_set: { label: 'Parolă temporară', icon: '🔑' },
  password_reset: { label: 'Resetare parolă', icon: '🔒' },
  report_sent: { label: 'Raport zilnic', icon: '📋' },
}

const PAGE_SIZE = 25

export default function LogsPage() {
  const [rows, setRows] = useState<LogRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [typeFilter, setTypeFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    let query = supabase
      .from('activity_log')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
    if (typeFilter) query = query.eq('type', typeFilter)
    if (fromDate) query = query.gte('created_at', `${fromDate}T00:00:00`)
    if (toDate) query = query.lte('created_at', `${toDate}T23:59:59`)
    query.then(({ data, count }) => {
      if (cancelled) return
      setRows((data as LogRow[]) ?? [])
      setTotal(count ?? 0)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [page, typeFilter, fromDate, toDate])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const inputCls =
    'bg-white border-[1.5px] border-line rounded-xl px-3.5 py-2 text-sm outline-none transition-all focus:border-amber'

  return (
    <div>
      <h1 className="font-display font-bold text-navy text-2xl mb-2">Jurnal</h1>
      <p className="text-muted text-sm mb-6">
        Istoricul activității: cereri noi, utilizatori, rapoarte și mesaje WhatsApp trimise de
        sistem. Apasă pe o intrare ca să vezi și mesajul WhatsApp asociat, dacă există.
      </p>

      {/* filtre */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setPage(0)
          }}
          className={inputCls}
        >
          <option value="">Toate tipurile</option>
          {Object.entries(TYPE_INFO).map(([id, t]) => (
            <option key={id} value={id}>
              {t.label}
            </option>
          ))}
        </select>
        <label className="text-muted text-sm">
          De la{' '}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value)
              setPage(0)
            }}
            className={inputCls}
          />
        </label>
        <label className="text-muted text-sm">
          Până la{' '}
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value)
              setPage(0)
            }}
            className={inputCls}
          />
        </label>
        {(typeFilter || fromDate || toDate) && (
          <button
            onClick={() => {
              setTypeFilter('')
              setFromDate('')
              setToDate('')
              setPage(0)
            }}
            className="text-muted text-sm hover:text-navy cursor-pointer underline underline-offset-2"
          >
            Resetează filtrele
          </button>
        )}
      </div>

      {/* listă */}
      {loading ? (
        <p className="text-muted text-sm py-10 text-center">Se încarcă…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted text-sm py-10 text-center">Nicio intrare pentru filtrele alese.</p>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden">
          {rows.map((r) => {
            const info = TYPE_INFO[r.type] ?? { label: r.type, icon: '•' }
            const waBody = typeof r.meta?.wa_body === 'string' ? r.meta.wa_body : null
            const isOpen = expanded === r.id
            return (
              <div key={r.id}>
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  className={`w-full flex items-center gap-3.5 px-5 py-3 text-left ${waBody ? 'cursor-pointer hover:bg-off' : 'cursor-default'} transition-colors`}
                >
                  <span className="text-lg shrink-0" aria-hidden>
                    {info.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] text-ink">{r.message}</span>
                    <span className="text-muted text-[11.5px]">{info.label}</span>
                  </span>
                  <span className="text-muted text-xs shrink-0 w-32 text-right">
                    {new Date(r.created_at).toLocaleString('ro-RO', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </button>
                {isOpen && waBody && (
                  <div className="px-5 pb-4 pl-14">
                    <p className="bg-off border border-line rounded-xl px-4 py-3 text-[12.5px] text-muted whitespace-pre-wrap leading-relaxed">
                      <Linkify text={waBody} />
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* paginare */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span className="text-muted">
          {total} intrări · pagina {page + 1} din {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="bg-white border border-line rounded-lg px-3.5 py-1.5 cursor-pointer hover:border-amber disabled:opacity-40 disabled:cursor-default"
          >
            ← Înapoi
          </button>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="bg-white border border-line rounded-lg px-3.5 py-1.5 cursor-pointer hover:border-amber disabled:opacity-40 disabled:cursor-default"
          >
            Înainte →
          </button>
        </div>
      </div>
    </div>
  )
}
