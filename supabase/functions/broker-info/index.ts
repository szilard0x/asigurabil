// Rezolvă un cod de recomandare (asigurabil.ro/b/<cod>) în datele publice ale
// brokerului: nume + telefonul de WhatsApp către care merg cererile clienților.
// Telefonul e oricum public pe materialele de marketing ale brokerului.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)

  const code = new URL(req.url).searchParams.get('code')?.toUpperCase() ?? ''
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return json({ error: 'invalid_code' }, 400)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, phone, disabled')
    .eq('referral_code', code)
    .maybeSingle()

  if (!profile || profile.disabled || !profile.phone) return json({ error: 'not_found' }, 404)

  return json({ name: profile.full_name, phone: profile.phone })
})
