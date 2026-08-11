# asigurabil.ro

Landing page + generator de carduri social media pentru Moldovan Sergiu-Ioan (asistent în brokeraj, partener Campion Broker).

## Rulare locală

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producție în dist/
```

## Structură

- `src/pages/LandingPage.tsx` — pagina principală (hero, servicii, cum funcționează, formular, de ce cu mine, FAQ, footer)
- `src/features/quote-form/` — formularul de ofertă în pași
  - **`config.ts` — aici se editează totul**: tipuri de asigurări, sugestii de motive, câmpuri extra, surse de marketing. Adăugarea unui tip nou = o intrare nouă în listă, fără cod.
  - `buildMessage.ts` — construiește mesajul WhatsApp/email din datele formularului
- `src/features/cards/` — generatorul de carduri (`/cards`, pagină ascunsă, nu apare în meniu)
  - `config.ts` — șabloanele de carduri (texte, stiluri) și formatele de export
- `src/lib/constants.ts` — telefon, motto, email, program — **toate datele de contact într-un singur loc**

## Cum primește Sergiu cererile

Butonul „Asigură-te" deschide WhatsApp (wa.me/40751461173) cu un mesaj pre-completat conținând toate detaliile clientului. Clientul trimite mesajul din propriul telefon → conversația e deja deschisă, fără „vă contactăm noi". Fallback: email (mailto) și apel direct.

## Generatorul de carduri (`/cards`)

1. Deschide `asigurabil.ro/cards` (nelistat în meniu — de pus în bookmark)
2. Alege șablonul, formatul (IG post / IG story / FB) și stilul
3. Editează textele
4. „Descarcă PNG" → fișier la dimensiune reală (1080×1080 / 1080×1920 / 1200×630)

Un set de start (8 carduri) există deja în folderul `../marketing/`.

## Publicare (gratuit, recomandat Vercel)

1. Urcă folderul într-un repo GitHub
2. [vercel.com](https://vercel.com) → Import repo → framework „Vite" (detectat automat) → Deploy
3. În Settings → Domains, adaugă `asigurabil.ro` (domeniul se cumpără separat, ex. la ROTLD/Namecheap, ~50 lei/an)

Notă SPA: pentru ca `/cards` să funcționeze la accesare directă, Vercel gestionează automat fallback-ul. Pe alt hosting static, configurează rewrite `/* → /index.html`.

## De completat de către Sergiu

- `src/lib/constants.ts` → `email` (momentan `contact@asigurabil.ro`, de setat după cumpărarea domeniului)
- Poza lui reală în secțiunea „De ce cu mine" (momentan un avatar cu inițiala S)
