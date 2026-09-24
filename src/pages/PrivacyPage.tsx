import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { BRAND } from '../lib/constants'

/**
 * Politica de confidențialitate (GDPR). Text-șablon — de revizuit de Sergiu
 * (eventual aliniat cu politica brokerului Campion) înainte de lansare oficială.
 */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-bold text-navy text-xl mb-3">{title}</h2>
      <div className="text-ink text-[15px] leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen bg-off">
      <header className="bg-navy py-4">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" aria-label="Înapoi la pagina principală">
            <Logo variant="light" height={30} />
          </Link>
          <Link to="/" className="text-[#C7D3E0] text-sm hover:text-white transition-colors">
            ← Înapoi la site
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display font-extrabold text-navy text-3xl mb-2">
          Politica de confidențialitate
        </h1>
        <p className="text-muted text-sm mb-10">Ultima actualizare: septembrie 2026</p>

        <Section title="Cine suntem">
          <p>
            Site-ul <b>asigurabil.ro</b> este operat de {BRAND.owner}, {BRAND.role.toLowerCase()},
            partener {BRAND.partner} (denumit în continuare „noi"). Pentru orice întrebare legată
            de datele tale, ne poți scrie la{' '}
            <a href={`mailto:${BRAND.email}`} className="text-navy font-semibold underline underline-offset-2">
              {BRAND.email}
            </a>{' '}
            sau la telefon {BRAND.phoneDisplay}.
          </p>
        </Section>

        <Section title="Ce date colectăm">
          <p>Prin formularul de cerere de ofertă colectăm doar datele pe care ni le furnizezi tu:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>nume și număr de telefon;</li>
            <li>localitatea (opțional);</li>
            <li>
              detaliile cererii tale: tipul de asigurare dorit, motivul, și — acolo unde le
              completezi — informații precum numărul de înmatriculare, data expirării poliței,
              destinația și perioada călătoriei;
            </li>
            <li>canalul prin care ai aflat de noi (opțional, în scop statistic).</li>
          </ul>
          <p>Nu folosim cookie-uri de urmărire și nu colectăm date în mod ascuns.</p>
        </Section>

        <Section title="De ce le colectăm și în ce temei">
          <p>
            Folosim aceste date exclusiv pentru a pregăti și a-ți prezenta oferte de asigurare
            potrivite cererii tale și pentru a te contacta în acest scop. Temeiul prelucrării este
            consimțământul tău (art. 6 alin. (1) lit. a din GDPR) și demersurile la cererea ta
            înainte de încheierea unui contract (art. 6 alin. (1) lit. b din GDPR).
          </p>
        </Section>

        <Section title="Unde ajung datele tale">
          <p>
            Cererea ta — inclusiv documentele pe care alegi să le atașezi — este trimisă direct
            din site în evidența noastră internă de cereri, găzduită securizat pe platforma
            Supabase, pe servere din Uniunea Europeană. La această evidență au acces doar
            consultanții echipei asigurabil.ro, pe bază de cont individual, iar consultantul te
            contactează pe WhatsApp sau telefon la numărul lăsat de tine.
          </p>
          <p>
            Datele nu sunt transmise terților în scop de marketing. Pentru pregătirea ofertelor,
            datele relevante pot fi transmise asiguratorilor prin intermediul brokerului{' '}
            {BRAND.partner}, strict în scopul cotației.
          </p>
          <p>
            Comunicarea prin WhatsApp este supusă și politicii de confidențialitate WhatsApp/Meta,
            aplicabilă oricărei conversații purtate prin această aplicație. Formularul este
            protejat anti-spam cu Cloudflare Turnstile, care poate prelucra date tehnice (ex.
            adresa IP) conform politicii Cloudflare.
          </p>
        </Section>

        <Section title="Cât timp le păstrăm">
          <p>
            Păstrăm conversația, datele din cerere și documentele atașate atât timp cât este
            necesar pentru pregătirea ofertei și relația ulterioară cu tine (de exemplu,
            reamintirea scadențelor, dacă ți-o dorești). Poți cere oricând ștergerea lor, iar noi
            le eliminăm din evidența internă.
          </p>
        </Section>

        <Section title="Drepturile tale">
          <p>Conform GDPR, ai dreptul:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>de acces la datele tale și la o copie a lor;</li>
            <li>de rectificare a datelor inexacte;</li>
            <li>de ștergere („dreptul de a fi uitat");</li>
            <li>de restricționare a prelucrării și de opoziție;</li>
            <li>de portabilitate a datelor;</li>
            <li>de a-ți retrage oricând consimțământul, fără a afecta prelucrările anterioare.</li>
          </ul>
          <p>
            Pentru exercitarea acestor drepturi, scrie-ne la{' '}
            <a href={`mailto:${BRAND.email}`} className="text-navy font-semibold underline underline-offset-2">
              {BRAND.email}
            </a>
            . Dacă consideri că drepturile tale au fost încălcate, poți depune o plângere la
            Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal
            (ANSPDCP) —{' '}
            <a
              href="https://www.dataprotection.ro"
              target="_blank"
              rel="noopener"
              className="text-navy font-semibold underline underline-offset-2"
            >
              dataprotection.ro
            </a>
            .
          </p>
        </Section>

        <p className="text-muted text-xs border-t border-line pt-6">
          Această politică poate fi actualizată; versiunea curentă este întotdeauna disponibilă la
          asigurabil.ro/confidentialitate.
        </p>
      </div>
    </main>
  )
}
