// „Am uitat parola" — public, protejat cu Turnstile. Primește un număr de
// telefon; dacă există un cont activ, trimite pe WhatsApp linkul de resetare.
// Răspunde MEREU cu ok, ca să nu se poată ghici ce numere au cont.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'
import { normalizeRoPhone } from '../_shared/phone.ts'
import { sendWhatsApp } from '../_shared/whatsapp.ts'

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
  if (!secret) return false
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

  let body: { phone?: string; turnstileToken?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_body' }, 400)
  }

  const token = String(body.turnstileToken ?? '')
  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')
  if (!token || !(await verifyTurnstile(token, ip))) {
    return json({ error: 'turnstile_failed' }, 403)
  }

  const phone = normalizeRoPhone(String(body.phone ?? ''))
  // răspuns generic indiferent de rezultat
  const generic = json({ ok: true })
  if (!phone) return generic

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, disabled')
    .eq('phone', phone)
    .maybeSingle()
  if (!profile || profile.disabled) return generic

  const adminUrl = Deno.env.get('ADMIN_URL') ?? 'http://localhost:5174'
  const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: profile.email,
    options: { redirectTo: adminUrl },
  })
  if (error || !link.properties?.action_link) {
    console.error('recovery link failed', error)
    return generic
  }

  await sendWhatsApp(
    supabaseAdmin,
    phone,
    'reset',
    `Bună${profile.full_name ? `, ${profile.full_name}` : ''}! Ai cerut resetarea parolei ` +
      `pentru panoul asigurabil.ro. Deschide linkul ca să setezi o parolă nouă:\n` +
      `${link.properties.action_link}\n\nDacă nu ai fost tu, ignoră acest mesaj.`,
  )
  return generic
})
