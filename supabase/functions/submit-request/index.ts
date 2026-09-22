// Primește cererea de ofertă din site-ul public: verifică tokenul Turnstile,
// validează datele, salvează cererea + fișierele atașate (service role).
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
const KNOWN_TYPE_IDS = [
  'rca',
  'casco',
  'sanatate',
  'viata',
  'calatorii',
  'locuinta',
  'pad',
  'malpraxis',
  'leasing',
]

function isValidRoPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.\-()]/g, '')
  return /^(\+4|004)?0(7\d{8}|[23]\d{8})$/.test(cleaned)
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not set')
    return false
  }
  const body = new FormData()
  body.set('secret', secret)
  body.set('response', token)
  if (ip) body.set('remoteip', ip)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  })
  const data = await res.json()
  return data.success === true
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return json({ error: 'invalid_form_data' }, 400)
  }

  // 1. Turnstile
  const token = form.get('turnstileToken')
  if (typeof token !== 'string' || token.length === 0) {
    return json({ error: 'turnstile_missing' }, 400)
  }
  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')
  if (!(await verifyTurnstile(token, ip))) {
    return json({ error: 'turnstile_failed' }, 403)
  }

  // 2. Payload
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(String(form.get('payload') ?? '{}'))
  } catch {
    return json({ error: 'invalid_payload' }, 400)
  }

  const typeId = String(payload.typeId ?? '')
  const name = String(payload.name ?? '').trim()
  const phone = String(payload.phone ?? '').trim()
  if (!KNOWN_TYPE_IDS.includes(typeId)) return json({ error: 'invalid_type' }, 400)
  if (name.length < 2 || name.length > 200) return json({ error: 'invalid_name' }, 400)
  if (!isValidRoPhone(phone)) return json({ error: 'invalid_phone' }, 400)
  if (payload.gdprConsent !== true) return json({ error: 'gdpr_consent_required' }, 400)

  // 3. Fișiere
  const files = form.getAll('files').filter((f): f is File => f instanceof File)
  if (files.length > MAX_FILES) return json({ error: 'too_many_files' }, 400)
  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) return json({ error: 'file_too_large', file: f.name }, 400)
    if (!ALLOWED_TYPES.includes(f.type)) return json({ error: 'file_type_not_allowed', file: f.name }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // 4. Inserează cererea (short_id generat pe client, dacă e valid — pentru
  // corelarea cu mesajul WhatsApp; altfel îl generează baza de date)
  const clientShortId = String(payload.shortId ?? '')
  const shortIdOverride = /^[A-Z2-9]{8}$/.test(clientShortId) ? { short_id: clientShortId } : {}
  const { data: request, error: insertError } = await supabase
    .from('requests')
    .insert({
      ...shortIdOverride,
      type_id: typeId,
      reasons: Array.isArray(payload.reasonIds) ? payload.reasonIds.map(String) : [],
      reason_text: String(payload.reasonText ?? '').slice(0, 2000),
      extra: typeof payload.extra === 'object' && payload.extra !== null ? payload.extra : {},
      referral_id: payload.referralId ? String(payload.referralId) : null,
      name,
      phone,
      city: payload.city ? String(payload.city).slice(0, 200) : null,
      gdpr_consent: true,
    })
    .select('id, short_id')
    .single()

  if (insertError || !request) {
    console.error('insert failed', insertError)
    return json({ error: 'insert_failed' }, 500)
  }

  // 5. Urcă fișierele și înregistrează-le
  let uploadedCount = 0
  for (const f of files) {
    const safeName = f.name.replace(/[^\w.\-ăâîșțĂÂÎȘȚ ]/g, '_').slice(0, 120)
    const path = `requests/${request.id}/${crypto.randomUUID()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('request-files')
      .upload(path, f, { contentType: f.type })
    if (uploadError) {
      console.error('upload failed', f.name, uploadError)
      continue // cererea rămâne validă chiar dacă un fișier eșuează
    }
    const { error: fileRowError } = await supabase.from('request_files').insert({
      request_id: request.id,
      storage_path: path,
      file_name: safeName,
      size: f.size,
      content_type: f.type,
    })
    if (fileRowError) console.error('file row insert failed', fileRowError)
    else uploadedCount++
  }

  return json({ shortId: request.short_id, uploadedFiles: uploadedCount })
})
