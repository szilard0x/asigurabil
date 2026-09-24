/**
 * Trimiterea mesajelor WhatsApp de sistem, în spatele unui driver:
 *   - WHATSAPP_PROVIDER=mock   (implicit): nu trimite nimic — mesajul apare în
 *     jurnal (tab-ul „Jurnal" din panou). Pentru dev local.
 *   - WHATSAPP_PROVIDER=twilio: trimite prin Twilio. Senderii WhatsApp moderni
 *     acceptă DOAR șabloane aprobate (Content API) pentru mesaje inițiate de
 *     business — de aceea fiecare tip de mesaj are un ContentSid configurat ca
 *     secret; dacă lipsește, se încearcă text liber (merge doar în fereastra de
 *     24h a unei conversații deschise de destinatar).
 *
 * Secrete pentru șabloane (ContentSid-uri din Content Template Builder):
 *   TWILIO_TPL_NEW_REQUEST, TWILIO_TPL_INVITE, TWILIO_TPL_RESET, TWILIO_TPL_DIGEST
 *
 * Orice trimitere se jurnalizează în whatsapp_outbox cu textul lizibil.
 */
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

export type MessagePurpose = 'invite' | 'reset' | 'temp_password' | 'digest' | 'new_request'

const TEMPLATE_ENV: Partial<Record<MessagePurpose, string>> = {
  new_request: 'TWILIO_TPL_NEW_REQUEST',
  invite: 'TWILIO_TPL_INVITE',
  reset: 'TWILIO_TPL_RESET',
  digest: 'TWILIO_TPL_DIGEST',
}

/** Variabilele de șablon nu pot conține newline/tab (regulă Meta). */
function sanitizeVar(value: string): string {
  return value.replace(/[\n\t]+/g, ' · ').trim()
}

async function sendViaTwilio(
  toPhone: string,
  body: string,
  purpose: MessagePurpose,
  variables?: Record<string, string>,
): Promise<void> {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const token = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = Deno.env.get('TWILIO_WHATSAPP_FROM') // ex: whatsapp:+4915888623971
  if (!sid || !token || !from) throw new Error('Twilio env vars missing')

  const params = new URLSearchParams({ From: from, To: `whatsapp:+${toPhone}` })

  const tplEnv = TEMPLATE_ENV[purpose]
  const contentSid = tplEnv ? Deno.env.get(tplEnv) : undefined
  if (contentSid && variables) {
    // șablon aprobat + variabile
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(variables)) clean[k] = sanitizeVar(v)
    params.set('ContentSid', contentSid)
    params.set('ContentVariables', JSON.stringify(clean))
  } else {
    // fără șablon configurat: text liber (doar în fereastra de 24h)
    params.set('Body', body)
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Twilio ${res.status}: ${detail.slice(0, 300)}`)
  }
}

/**
 * Trimite (sau simulează) un mesaj și îl jurnalizează. Nu aruncă — întoarce
 * succes/eșec. `body` e textul lizibil (jurnal + fallback); `variables` sunt
 * valorile pentru șablonul Twilio al scopului respectiv, dacă e configurat.
 */
export async function sendWhatsApp(
  supabaseAdmin: SupabaseClient,
  toPhone: string,
  purpose: MessagePurpose,
  body: string,
  variables?: Record<string, string>,
): Promise<boolean> {
  const provider = Deno.env.get('WHATSAPP_PROVIDER') ?? 'mock'
  let status = 'mock'
  let error: string | null = null

  if (provider === 'twilio') {
    try {
      await sendViaTwilio(toPhone, body, purpose, variables)
      status = 'sent'
    } catch (err) {
      status = 'failed'
      error = String(err)
      console.error('whatsapp send failed', toPhone, error)
    }
  }

  await supabaseAdmin
    .from('whatsapp_outbox')
    .insert({ to_phone: toPhone, purpose, body, status, error })

  return status !== 'failed'
}
