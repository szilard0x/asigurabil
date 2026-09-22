// Administrare utilizatori — doar pentru admin: invită un broker/admin nou prin
// email sau dezactivează/reactivează un cont existent.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // 1. Identifică apelantul din JWT și verifică rolul de admin
  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '')
  if (!jwt) return json({ error: 'unauthorized' }, 401)

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt)
  if (userError || !userData.user) return json({ error: 'unauthorized' }, 401)

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()
  if (profile?.role !== 'admin') return json({ error: 'forbidden' }, 403)

  // 2. Execută acțiunea
  let body: { action?: string; email?: string; fullName?: string; role?: string; userId?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_body' }, 400)
  }

  if (body.action === 'invite') {
    const email = String(body.email ?? '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'invalid_email' }, 400)
    const role = body.role === 'admin' ? 'admin' : 'broker'
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { role, full_name: String(body.fullName ?? '').slice(0, 200) },
    })
    if (error) {
      console.error('invite failed', error)
      return json({ error: 'invite_failed', message: error.message }, 400)
    }
    return json({ ok: true, userId: data.user?.id })
  }

  if (body.action === 'deactivate' || body.action === 'reactivate') {
    const userId = String(body.userId ?? '')
    if (!userId) return json({ error: 'missing_user_id' }, 400)
    if (userId === userData.user.id) return json({ error: 'cannot_deactivate_self' }, 400)
    const disabled = body.action === 'deactivate'
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      // "876000h" ≈ 100 de ani = dezactivat permanent; "none" ridică blocarea
      ban_duration: disabled ? '876000h' : 'none',
    })
    if (error) {
      console.error('ban update failed', error)
      return json({ error: 'update_failed', message: error.message }, 400)
    }
    await supabaseAdmin.from('profiles').update({ disabled }).eq('id', userId)
    return json({ ok: true })
  }

  return json({ error: 'unknown_action' }, 400)
})
