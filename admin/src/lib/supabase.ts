import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Lipsesc VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — vezi admin/.env.example.',
  )
}

export const supabase = createClient(url, anonKey)

export interface Profile {
  id: string
  email: string
  phone: string | null
  full_name: string | null
  role: 'admin' | 'broker'
  referral_code: string
  disabled: boolean
  created_at: string
}

export interface NotificationSettings {
  profile_id: string
  instant_new_request: boolean
  daily_digest: boolean
  digest_hour: number
  stale_hours: number
  last_digest_at: string | null
  updated_at: string
}

export interface OutboxRow {
  id: string
  to_phone: string
  purpose: string
  body: string
  status: 'mock' | 'sent' | 'failed'
  error: string | null
  created_at: string
}

export interface RequestRow {
  id: string
  short_id: string
  type_id: string
  reasons: string[]
  reason_text: string
  extra: Record<string, string>
  referral_id: string | null
  name: string
  phone: string
  city: string | null
  status: 'nou' | 'contactat' | 'ofertat' | 'castigat' | 'pierdut'
  assigned_to: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RequestFileRow {
  id: string
  request_id: string
  storage_path: string
  file_name: string
  size: number
  content_type: string
  created_at: string
}
