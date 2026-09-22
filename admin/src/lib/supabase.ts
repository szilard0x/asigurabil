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
  full_name: string | null
  role: 'admin' | 'broker'
  disabled: boolean
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
  status: 'nou' | 'contactat' | 'ofertat' | 'inchis'
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
