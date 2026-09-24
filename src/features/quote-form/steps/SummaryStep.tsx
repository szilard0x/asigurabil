import { useState } from 'react'
import { INSURANCE_TYPES, REFERRAL_SOURCES } from '../config'
import { useQuoteForm } from '../QuoteFormContext'
import { buildWhatsAppLink } from '../buildMessage'
import { submitRequest, generateShortId } from '../submitRequest'
import { backendEnabled, TURNSTILE_SITE_KEY } from '../../../lib/backend'
import { Button } from '../../../components/ui/Button'
import TurnstileWidget from '@shared/TurnstileWidget'
import { useBroker } from '../../../lib/broker'

export default function SummaryStep() {
  const { data, update, next, back, goTo, files, setSentShortId } = useQuoteForm()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const contact = useBroker()
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
    ...(files.length
      ? [
          {
            label: 'Documente atașate',
            value: files.map((f) => f.name).join(', '),
            edit: 'contact' as const,
          },
        ]
      : []),
  ]

  // Cererea se trimite direct din site; echipa e notificată automat pe WhatsApp.
  const submit = async () => {
    if (sending) return
    setSendError(false)
    if (!backendEnabled || !turnstileToken) {
      // fără verificare anti-spam nu putem trimite — arătăm alternativele
      setSendError(true)
      return
    }
    setSending(true)
    const shortId = generateShortId()
    const ok = await submitRequest(data, files, turnstileToken, shortId, contact.code)
    setSending(false)
    if (!ok) {
      setSendError(true)
      return
    }
    setSentShortId(shortId)
    next() // → ecranul de confirmare
  }

  // Plan B dacă trimiterea eșuează: același conținut, pe WhatsApp, ca înainte.
  const fallbackWhatsApp = buildWhatsAppLink(data, { fileCount: files.length }, contact.phoneWhatsApp)

  return (
    <div>
      <h3 className="font-display font-bold text-navy text-2xl mb-1.5">Verifică și trimite</h3>
      <p className="text-muted text-sm mb-7">
        Așa arată cererea ta. O trimiți direct de aici, iar echipa noastră te contactează pe
        WhatsApp sau telefon.
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

      <label className="flex items-start gap-2.5 mt-6 text-[13px] text-muted leading-relaxed cursor-pointer select-none">
        <input
          type="checkbox"
          checked={data.gdprConsent}
          onChange={(e) => update({ gdprConsent: e.target.checked })}
          className="mt-0.5 w-4 h-4 shrink-0 accent-amber cursor-pointer"
        />
        <span>
          Sunt de acord cu prelucrarea datelor mele personale în scopul pregătirii ofertei,
          conform{' '}
          <a
            href="/confidentialitate"
            target="_blank"
            rel="noopener"
            className="text-navy font-semibold underline underline-offset-2"
          >
            Politicii de confidențialitate
          </a>
          .
        </span>
      </label>

      {backendEnabled && (
        <div className="mt-4 flex justify-center">
          <TurnstileWidget sitekey={TURNSTILE_SITE_KEY} onToken={setTurnstileToken} />
        </div>
      )}

      <div className="mt-5 flex flex-col items-stretch gap-3">
        <Button onClick={submit} disabled={!data.gdprConsent || sending} className="w-full">
          {sending ? 'Se trimite…' : 'Asigură-te — trimite cererea ✓'}
        </Button>
        {sendError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13.5px] text-red-700 text-center">
            Nu am putut trimite cererea. Mai încearcă o dată, sau trimite-ne-o direct:{' '}
            <a
              href={fallbackWhatsApp}
              target="_blank"
              rel="noopener"
              className="font-semibold underline underline-offset-2"
            >
              pe WhatsApp
            </a>{' '}
            ·{' '}
            <a
              href={`tel:${contact.phoneTel}`}
              className="font-semibold underline underline-offset-2"
            >
              {contact.phoneDisplay}
            </a>
          </div>
        )}
        <div className="flex items-center justify-center text-[13px] text-muted">
          <a href={`tel:${contact.phoneTel}`} className="hover:text-navy underline underline-offset-2">
            Preferi să vorbim direct? Sună: {contact.phoneDisplay}
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
