/**
 * Trimiterea mesajelor WhatsApp de sistem (invitații, resetări, digest), în
 * spatele unui driver:
 *   - WHATSAPP_PROVIDER=mock   (implicit): nu trimite nimic — mesajul se vede în
 *     tabela whatsapp_outbox (jurnalul din pagina Utilizatori). Pentru dev local.
 *   - WHATSAPP_PROVIDER=twilio: trimite prin Twilio (sandbox sau sender aprobat).
 * Migrarea ulterioară la Meta Cloud API = încă un driver aici, nimic altceva.
 * Orice trimitere se jurnalizează în whatsapp_outbox.
 */
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

export type MessagePurpose = 'invite' | 'reset' | 'temp_password' | 'digest' | 'new_request'

async function sendViaTwilio(toPhone: string, body: string): Promise<void> {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const token = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = Deno.env.get('TWILIO_WHATSAPP_FROM') // ex: whatsapp:+14155238886
  if (!sid || !token || !from) throw new Error('Twilio env vars missing')

  const params = new URLSearchParams({
    From: from,
    To: `whatsapp:+${toPhone}`,
    Body: body,
  })
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

/** Trimite (sau simulează) un mesaj și îl jurnalizează. Nu aruncă — întoarce succes/eșec. */
export async function sendWhatsApp(
  supabaseAdmin: SupabaseClient,
  toPhone: string,
  purpose: MessagePurpose,
  body: string,
): Promise<boolean> {
  const provider = Deno.env.get('WHATSAPP_PROVIDER') ?? 'mock'
  let status = 'mock'
  let error: string | null = null

  if (provider === 'twilio') {
    try {
      await sendViaTwilio(toPhone, body)
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
