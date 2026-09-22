/**
 * Rulează ÎNAINTE de inițializarea clientului Supabase (importat primul în main.tsx):
 * reține dacă URL-ul curent e un link de invitație sau de resetare a parolei,
 * pentru că supabase-js consumă hash-ul imediat ce pornește.
 */
const hash = window.location.hash
if (hash.includes('type=invite') || hash.includes('type=recovery')) {
  sessionStorage.setItem('needs-password-setup', '1')
}

export function needsPasswordSetup(): boolean {
  return sessionStorage.getItem('needs-password-setup') === '1'
}

export function clearPasswordSetup(): void {
  sessionStorage.removeItem('needs-password-setup')
}
