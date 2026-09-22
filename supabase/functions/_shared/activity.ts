// Scrie o intrare în jurnalul de activitate (tab-ul „Jurnal" din panou).
// Best-effort: un eșec de jurnalizare nu blochează niciodată operațiunea.
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'

export type ActivityType =
  | 'request_created'
  | 'user_invited'
  | 'user_deleted'
  | 'user_deactivated'
  | 'user_reactivated'
  | 'temp_password_set'
  | 'password_reset'
  | 'report_sent'

export async function logActivity(
  supabaseAdmin: SupabaseClient,
  type: ActivityType,
  message: string,
  meta: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabaseAdmin.from('activity_log').insert({ type, message, meta })
  if (error) console.error('activity log failed', type, error)
}
