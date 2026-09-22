// Administrare utilizatori — doar pentru admin. Conturile sunt pe TELEFON:
//  - invite: creează contul după nume + telefon și trimite pe WhatsApp linkul
//    de setare a parolei
//  - temp-password: setează o parolă temporară (plasă de siguranță dacă
//    WhatsApp nu funcționează)
//  - deactivate / reactivate: blochează/deblochează contul
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'
import { normalizeRoPhone, phoneToSyntheticEmail } from '../_shared/phone.ts'
import { sendWhatsApp } from '../_shared/whatsapp.ts'
import { logActivity } from '../_shared/activity.ts'

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
  let body: {
    action?: string
    phone?: string
    fullName?: string
    role?: string
    userId?: string
    password?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid_body' }, 400)
  }

  const adminUrl = Deno.env.get('ADMIN_URL') ?? 'http://localhost:5174'

  if (body.action === 'invite') {
    const phone = normalizeRoPhone(String(body.phone ?? ''))
    if (!phone) return json({ error: 'invalid_phone' }, 400)
    const fullName = String(body.fullName ?? '').slice(0, 200).trim()
    if (fullName.length < 2) return json({ error: 'invalid_name' }, 400)
    const role = body.role === 'admin' ? 'admin' : 'broker'
    const email = phoneToSyntheticEmail(phone)

    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        data: { role, full_name: fullName, phone },
        redirectTo: adminUrl,
      },
    })
    if (error || !link.properties?.action_link) {
      console.error('invite failed', error)
      return json({ error: 'invite_failed', message: error?.message ?? 'no link' }, 400)
    }

    const waBody =
      `Bună, ${fullName}! Ai fost invitat(ă) în echipa asigurabil.ro. ` +
      `Deschide linkul ca să îți setezi parola:\n${link.properties.action_link}`
    const sent = await sendWhatsApp(supabaseAdmin, phone, 'invite', waBody)
    await logActivity(
      supabaseAdmin,
      'user_invited',
      `${fullName} (0${phone.slice(2)}) a fost invitat(ă) ca ${role}`,
      { user_id: link.user?.id, phone, role, wa_body: waBody, wa_sent: sent },
    )
    return json({ ok: true, userId: link.user?.id, whatsappSent: sent })
  }

  if (body.action === 'temp-password') {
    const userId = String(body.userId ?? '')
    const password = String(body.password ?? '')
    if (!userId) return json({ error: 'missing_user_id' }, 400)
    if (password.length < 8) return json({ error: 'password_too_short' }, 400)
    // email_confirm: contul devine utilizabil chiar dacă invitatul nu a apucat
    // să deschidă linkul de invitație (exact rolul parolei temporare)
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    })
    if (error) return json({ error: 'update_failed', message: error.message }, 400)
    const { data: target } = await supabaseAdmin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', userId)
      .maybeSingle()
    await logActivity(
      supabaseAdmin,
      'temp_password_set',
      `Parolă temporară setată pentru ${target?.full_name ?? target?.phone ?? userId}`,
      { user_id: userId },
    )
    return json({ ok: true })
  }

  if (body.action === 'delete') {
    const userId = String(body.userId ?? '')
    if (!userId) return json({ error: 'missing_user_id' }, 400)
    if (userId === userData.user.id) return json({ error: 'cannot_delete_self' }, 400)
    const { data: target } = await supabaseAdmin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', userId)
      .maybeSingle()
    // profilul dispare prin cascade; cererile lui rămân, dar nerepartizate (on delete set null)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) {
      console.error('delete failed', error)
      return json({ error: 'delete_failed', message: error.message }, 400)
    }
    await logActivity(
      supabaseAdmin,
      'user_deleted',
      `Contul „${target?.full_name ?? target?.phone ?? userId}" a fost șters definitiv`,
      { user_id: userId, phone: target?.phone ?? null },
    )
    return json({ ok: true })
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
    const { data: target } = await supabaseAdmin
      .from('profiles')
      .select('full_name, phone')
      .eq('id', userId)
      .maybeSingle()
    await logActivity(
      supabaseAdmin,
      disabled ? 'user_deactivated' : 'user_reactivated',
      `Contul „${target?.full_name ?? target?.phone ?? userId}" a fost ${disabled ? 'dezactivat' : 'reactivat'}`,
      { user_id: userId },
    )
    return json({ ok: true })
  }

  return json({ error: 'unknown_action' }, 400)
})
