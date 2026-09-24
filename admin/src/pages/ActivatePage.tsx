import { useMemo } from 'react'
import Logo from '@shared/Logo'

/**
 * Pagina intermediară pentru linkurile de activare/resetare trimise pe WhatsApp.
 * Linkurile Supabase sunt de unică folosință, iar crawlerele de previzualizare
 * (WhatsApp/Meta) accesează URL-urile din mesaje și le-ar consuma. De aceea
 * mesajul conține un link către această pagină, cu linkul real în FRAGMENT
 * (după #) — fragmentul nu ajunge niciodată la server și nu e urmat de roboți;
 * doar apăsarea butonului de către om declanșează verificarea.
 */
export default function ActivatePage() {
  const target = useMemo(() => {
    const raw = decodeURIComponent(window.location.hash.slice(1) || '')
    const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL
    // strict: acceptăm doar linkuri de verificare ale propriului proiect Supabase
    if (supabaseUrl && raw.startsWith(`${supabaseUrl}/auth/v1/verify?`)) return raw
    return null
  }, [])

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#0F2A43_0%,#16395A_55%,#0C3155_100%)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo variant="light" height={36} />
        </div>
        <div className="bg-white rounded-3xl shadow-card p-8 text-center">
          {target ? (
            <>
              <h1 className="font-display font-bold text-navy text-xl mb-2">
                Un singur pas până la cont
              </h1>
              <p className="text-muted text-sm mb-6">
                Apasă butonul ca să îți activezi contul și să îți setezi parola. Linkul
                funcționează o singură dată.
              </p>
              <button
                onClick={() => window.location.replace(target)}
                className="w-full bg-amber text-navy font-display font-semibold rounded-xl py-3 cursor-pointer transition-all hover:-translate-y-0.5 shadow-amber"
              >
                Continuă →
              </button>
            </>
          ) : (
            <>
              <h1 className="font-display font-bold text-navy text-xl mb-2">Link invalid</h1>
              <p className="text-muted text-sm">
                Linkul de activare lipsește sau nu este valid. Cere o invitație nouă sau
                folosește „Am uitat parola" de pe pagina de autentificare.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
