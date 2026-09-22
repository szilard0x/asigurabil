// Digestul zilnic pe WhatsApp cu cererile nelucrate. Apelat:
//  - orar, de jobul pg_cron (header x-digest-secret, din app_config)
//  - manual, din pagina Setări de către admin (JWT + {force:true})
// Pentru fiecare utilizator cu digestul pornit și ora potrivită: cererile
// „uitate" = ne-finale și neschimbate de stale_days zile, plus toate cele „nou".
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'
import { sendWhatsApp } from '../_shared/whatsapp.ts'
import { logActivity } from '../_shared/activity.ts'

const STATUS_LABELS: Record<string, string> = {
  nou: 'Nou',
  contactat: 'Contactat',
  ofertat: 'Ofertat',
}

function bucharestHour(): number {
  return Number(
    new Intl.DateTimeFormat('ro-RO', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: 'Europe/Bucharest',
    }).format(new Date()),
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Autorizare: secretul cron SAU un admin autentificat (buton „Trimite acum")
  let force = false
  let callerId: string | null = null
  const cronSecret = Deno.env.get('DIGEST_SECRET')
  const givenSecret = req.headers.get('x-digest-secret')
  if (cronSecret && givenSecret === cronSecret) {
    // apel din cron
  } else {
    const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: userData } = jwt
      ? await supabaseAdmin.auth.getUser(jwt)
      : { data: { user: null } }
    if (!userData.user) return json({ error: 'unauthorized' }, 401)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()
    if (profile?.role !== 'admin') return json({ error: 'forbidden' }, 403)
    const body = await req.json().catch(() => ({}))
    force = body?.force === true
    callerId = userData.user.id
  }

  const hour = bucharestHour()
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bucharest' }).format(
    new Date(),
  )

  // Testul manual („Trimite acum") merge doar la adminul care l-a apăsat,
  // indiferent dacă are raportul zilnic activat; cron-ul respectă setarea.
  let recipientsQuery = supabaseAdmin
    .from('notification_settings')
    .select('profile_id, digest_hour, stale_days, last_digest_at, profiles!inner(phone, full_name, role, disabled)')
  recipientsQuery =
    force && callerId
      ? recipientsQuery.eq('profile_id', callerId)
      : recipientsQuery.eq('daily_digest', true)
  const { data: recipients } = await recipientsQuery

  let sentCount = 0
  for (const r of recipients ?? []) {
    const p = r.profiles as unknown as {
      phone: string | null
      full_name: string | null
      role: string
      disabled: boolean
    }
    if (!p.phone || p.disabled) continue
    if (!force) {
      if (r.digest_hour !== hour) continue
      // maxim un digest pe zi
      const lastDay = r.last_digest_at
        ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bucharest' }).format(
            new Date(r.last_digest_at),
          )
        : null
      if (lastDay === today) continue
    }

    const staleBefore = new Date(Date.now() - r.stale_days * 24 * 3600 * 1000).toISOString()
    // cererile relevante pentru utilizator: ale lui + (admin: și cele neasignate)
    let query = supabaseAdmin
      .from('requests')
      .select('short_id, name, type_id, status, updated_at, assigned_to')
      .in('status', ['nou', 'contactat', 'ofertat'])
      .or(`status.eq.nou,updated_at.lt.${staleBefore}`)
      .order('updated_at', { ascending: true })
      .limit(20)
    query =
      p.role === 'admin'
        ? query.or(`assigned_to.eq.${r.profile_id},assigned_to.is.null`)
        : query.eq('assigned_to', r.profile_id)
    const { data: stale } = await query

    if (!stale || stale.length === 0) {
      if (force) sentCount++ // la test manual confirmăm și lipsa cererilor
      continue
    }

    const lines = stale.map(
      (s) =>
        `• #${s.short_id} — ${s.name} (${STATUS_LABELS[s.status] ?? s.status}, din ${new Date(
          s.updated_at,
        ).toLocaleDateString('ro-RO')})`,
    )
    const waBody =
      `📋 asigurabil.ro — ${stale.length} cereri care așteaptă:\n${lines.join('\n')}\n\n` +
      `Deschide panoul: ${Deno.env.get('ADMIN_URL') ?? 'http://localhost:5174'}`
    const ok = await sendWhatsApp(supabaseAdmin, p.phone, 'digest', waBody)
    await logActivity(
      supabaseAdmin,
      'report_sent',
      `Raport zilnic trimis către ${p.full_name ?? `0${p.phone.slice(2)}`} — ${stale.length} cereri${force ? ' (test manual)' : ''}`,
      { user_id: r.profile_id, count: stale.length, forced: force, wa_body: waBody, wa_sent: ok },
    )
    if (ok) {
      sentCount++
      await supabaseAdmin
        .from('notification_settings')
        .update({ last_digest_at: new Date().toISOString() })
        .eq('profile_id', r.profile_id)
    }
  }

  return json({ ok: true, sent: sentCount })
})
