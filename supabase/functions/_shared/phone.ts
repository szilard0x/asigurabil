// Copie server-side a shared/phone.ts — ține-le sincronizate.
export const SYNTH_EMAIL_DOMAIN = 'wa.asigurabil.ro'

export function normalizeRoPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  const m = cleaned.match(/^(?:\+4|004)?(0(?:7\d{8}|[23]\d{8}))$/)
  if (!m) return null
  return `4${m[1]}`
}

export function phoneToSyntheticEmail(normalizedPhone: string): string {
  return `${normalizedPhone}@${SYNTH_EMAIL_DOMAIN}`
}
