import { INSURANCE_TYPES, REFERRAL_SOURCES } from '../config'
import { useQuoteForm } from '../QuoteFormContext'
import { buildWhatsAppLink, buildEmailLink } from '../buildMessage'
import { Button } from '../../../components/ui/Button'
import { BRAND } from '../../../lib/constants'

export default function SummaryStep() {
  const { data, next, back, goTo } = useQuoteForm()
  const type = INSURANCE_TYPES.find((t) => t.id === data.typeId)
  const referral = REFERRAL_SOURCES.find((r) => r.id === data.referralId)
  const reasons = type
    ? data.reasonIds.map((id) => type.reasons.find((r) => r.id === id)?.label).filter(Boolean)
    : []

  const rows: Array<{ label: string; value: string; edit: 'type' | 'reason' | 'contact' }> = [
    { label: 'Asigurare', value: `${type?.icon ?? ''} ${type?.label ?? '—'}`, edit: 'type' },
    ...(reasons.length ? [{ label: 'Motiv', value: reasons.join('; '), edit: 'reason' as const }] : []),
    ...(data.reasonText.trim()
      ? [{ label: 'Detalii', value: data.reasonText.trim(), edit: 'reason' as const }]
      : []),
    ...(type?.extraFields ?? [])
      .filter((f) => data.extra[f.id]?.trim())
      .map((f) => ({ label: f.label, value: data.extra[f.id].trim(), edit: 'reason' as const })),
    { label: 'Nume', value: data.name, edit: 'contact' },
    { label: 'Telefon', value: data.phone, edit: 'contact' },
    ...(data.city.trim() ? [{ label: 'Localitate', value: data.city.trim(), edit: 'contact' as const }] : []),
    ...(referral ? [{ label: 'Ai aflat prin', value: referral.label, edit: 'contact' as const }] : []),
  ]

  const openWhatsApp = () => {
    window.open(buildWhatsAppLink(data), '_blank', 'noopener')
    next() // → ecranul de confirmare
  }

  return (
    <div>
      <h3 className="font-display font-bold text-navy text-2xl mb-1.5">Verifică și trimite</h3>
      <p className="text-muted text-sm mb-7">
        Așa arată cererea ta. Butonul de mai jos deschide WhatsApp cu mesajul pregătit — îl vezi și
        îl trimiți chiar tu.
      </p>

      <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden">
        {rows.map((r) => (
          <div key={r.label + r.value} className="flex items-start justify-between gap-4 px-5 py-3.5">
            <div className="min-w-0">
              <small className="block text-muted text-[11.5px] uppercase tracking-wide">{r.label}</small>
              <span className="text-[14.5px] text-ink break-words">{r.value}</span>
            </div>
            <button
              onClick={() => goTo(r.edit)}
              className="text-amber text-xs font-semibold cursor-pointer hover:underline shrink-0 mt-1"
            >
              Modifică
            </button>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col items-stretch gap-3">
        <Button onClick={openWhatsApp} className="w-full">
          Asigură-te — trimite pe WhatsApp 💬
        </Button>
        <div className="flex items-center justify-center gap-5 text-[13px] text-muted">
          <a href={buildEmailLink(data)} className="hover:text-navy underline underline-offset-2">
            Nu ai WhatsApp? Trimite prin email
          </a>
          <span aria-hidden>·</span>
          <a href={`tel:${BRAND.phoneTel}`} className="hover:text-navy underline underline-offset-2">
            Sună direct: {BRAND.phoneDisplay}
          </a>
        </div>
      </div>

      <p className="text-muted text-xs text-center mt-5">
        🔒 Datele tale ajung doar la echipa asigurabil.ro și sunt folosite exclusiv pentru
        pregătirea ofertei.
      </p>

      <button
        onClick={back}
        className="text-muted text-sm cursor-pointer hover:text-navy transition-colors mt-6"
      >
        ← Înapoi
      </button>
    </div>
  )
}
