import { INSURANCE_TYPES, REFERRAL_SOURCES, type QuoteFormData } from './config'
import { whatsAppUrl, mailtoUrl } from '../../lib/constants'

export interface MessageMeta {
  /** Id-ul scurt al cererii salvate în panou — pentru corelare. */
  shortId?: string
  /** Numărul de documente atașate (vizibile doar în panou). */
  fileCount?: number
}

/** Human-readable summary of the collected data, used for WhatsApp and email. */
export function buildMessage(data: QuoteFormData, meta: MessageMeta = {}): string {
  const type = INSURANCE_TYPES.find((t) => t.id === data.typeId)
  const referral = REFERRAL_SOURCES.find((r) => r.id === data.referralId)
  const reasons = type
    ? data.reasonIds
        .map((id) => type.reasons.find((r) => r.id === id)?.label)
        .filter(Boolean)
    : []

  const lines: string[] = [
    `Bună ziua! Am completat formularul pe asigurabil.ro 👋`,
    ``,
    `🔖 Asigurare: ${type?.label ?? '—'}`,
  ]

  if (reasons.length) lines.push(`📌 Motiv: ${reasons.join('; ')}`)
  if (data.reasonText.trim()) lines.push(`📝 Detalii: ${data.reasonText.trim()}`)

  if (type?.extraFields) {
    for (const field of type.extraFields) {
      const value = data.extra[field.id]?.trim()
      if (value) lines.push(`▪️ ${field.label}: ${value}`)
    }
  }

  lines.push(``, `👤 Nume: ${data.name.trim()}`)
  if (data.city.trim()) lines.push(`📍 Localitate: ${data.city.trim()}`)
  if (data.phone.trim()) lines.push(`📞 Telefon: ${data.phone.trim()}`)
  if (referral) lines.push(`💡 Am aflat de voi prin: ${referral.label}`)

  if (meta.shortId) lines.push(``, `🧾 Cerere #${meta.shortId}`)
  if (meta.fileCount) {
    lines.push(`📎 Am atașat ${meta.fileCount === 1 ? 'un document' : `${meta.fileCount} documente`} în cerere`)
  }

  lines.push(``, `Aștept ofertele voastre. Mulțumesc!`)
  return lines.join('\n')
}

export function buildWhatsAppLink(
  data: QuoteFormData,
  meta: MessageMeta = {},
  phone?: string,
): string {
  return whatsAppUrl(buildMessage(data, meta), phone)
}

export function buildEmailLink(data: QuoteFormData): string {
  const type = INSURANCE_TYPES.find((t) => t.id === data.typeId)
  return mailtoUrl(`Cerere ofertă ${type?.label ?? 'asigurare'} — ${data.name}`, buildMessage(data))
}

/** Romanian mobile/landline: 07xx xxx xxx or +407..., spaces/dots/dashes tolerated. */
export function isValidRoPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  return /^(\+4|004)?0(7\d{8}|[23]\d{8})$/.test(cleaned)
}
