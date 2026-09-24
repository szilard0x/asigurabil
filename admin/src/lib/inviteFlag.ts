/**
 * Rulează ÎNAINTE de inițializarea clientului Supabase (importat primul în main.tsx):
 * reține dacă URL-ul curent e un link de invitație sau de resetare a parolei,
 * pentru că supabase-js consumă hash-ul imediat ce pornește.
 */
const hash = window.location.hash
if (hash.includes('type=invite') || hash.includes('type=recovery')) {
  sessionStorage.setItem('needs-password-setup', '1')
}
// link de activare/resetare expirat sau deja folosit — afișăm explicația pe login
if (hash.includes('error_code=otp_expired') || hash.includes('error=access_denied')) {
  sessionStorage.setItem('auth-link-error', '1')
}

export function consumeAuthLinkError(): boolean {
  const has = sessionStorage.getItem('auth-link-error') === '1'
  if (has) sessionStorage.removeItem('auth-link-error')
  return has
}

export function needsPasswordSetup(): boolean {
  return sessionStorage.getItem('needs-password-setup') === '1'
}

export function clearPasswordSetup(): void {
  sessionStorage.removeItem('needs-password-setup')
}
