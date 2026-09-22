/**
 * Autentificarea e pe TELEFON: identitatea Supabase din spate e un email sintetic
 * derivat din număr (nu primește mail niciodată, nu apare în UI).
 * ATENȚIE: aceeași logică există și în supabase/functions/_shared/phone.ts —
 * ține-le sincronizate.
 */

export const SYNTH_EMAIL_DOMAIN = 'wa.asigurabil.ro'

/** „0751 461 173" / „+40751461173" → „40751461173"; null dacă nu e număr RO valid. */
export function normalizeRoPhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  const m = cleaned.match(/^(?:\+4|004)?(0(?:7\d{8}|[23]\d{8}))$/)
  if (!m) return null
  return `4${m[1]}`
}

export function phoneToSyntheticEmail(normalizedPhone: string): string {
  return `${normalizedPhone}@${SYNTH_EMAIL_DOMAIN}`
}

/** „40751461173" → „0751 461 173" pentru afișare. */
export function displayRoPhone(normalizedPhone: string): string {
  const local = normalizedPhone.replace(/^4/, '')
  return local.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3')
}
