/**
 * Configurarea backend-ului (Supabase Edge Functions). Dacă variabilele de mediu
 * lipsesc, site-ul funcționează normal — cererile pleacă doar pe WhatsApp.
 */
export const SUPABASE_URL: string | undefined = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Cheia publică Turnstile; implicit cheia oficială de test (trece mereu) pentru dev local. */
export const TURNSTILE_SITE_KEY: string =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'

export const backendEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
