import type { QuoteFormData } from './config'
import { SUPABASE_URL, SUPABASE_ANON_KEY, backendEnabled } from '../../lib/backend'

export const MAX_FILES = 5
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]

/** Id scurt generat pe client, inclus și în mesajul WhatsApp pentru corelare. */
export function generateShortId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => chars[b % chars.length])
    .join('')
}

/**
 * Trimite cererea către backend (arhiva din panoul de admin). Best-effort:
 * eșecul NU blochează fluxul WhatsApp — lead-ul ajunge oricum la echipă.
 */
export async function submitRequest(
  data: QuoteFormData,
  files: File[],
  turnstileToken: string | null,
  shortId: string,
): Promise<boolean> {
  if (!backendEnabled || !turnstileToken) return false

  const form = new FormData()
  form.set('turnstileToken', turnstileToken)
  form.set(
    'payload',
    JSON.stringify({
      typeId: data.typeId,
      reasonIds: data.reasonIds,
      reasonText: data.reasonText,
      extra: data.extra,
      referralId: data.referralId,
      name: data.name,
      phone: data.phone,
      city: data.city,
      gdprConsent: data.gdprConsent,
      shortId,
    }),
  )
  for (const f of files.slice(0, MAX_FILES)) form.append('files', f, f.name)

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-request`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY! },
      body: form,
    })
    if (!res.ok) {
      console.warn('submitRequest failed', res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.warn('submitRequest error', err)
    return false
  }
}
