# Deploy — backend Supabase + panou admin.asigurabil.ro

Codul e gata și testat local; pașii de mai jos sunt configurarea cloud (o singură dată).

## 0. Rulare locală (pentru testare oricând)

```bash
npx supabase start          # tot stack-ul în Docker (porturi 553xx, coexistă cu alte proiecte)
npx supabase functions serve # edge functions cu hot-reload (Turnstile pe chei de test)
npm run dev                  # site public :5173  (.env.local e deja configurat)
cd admin && npm run dev      # panou :5174        (admin/.env.local la fel)
```

Cont de admin local: `npx tsx scripts/create-admin.ts --url http://127.0.0.1:55321 --service-key <SERVICE_ROLE_KEY din 'npx supabase status'> --email sergiu@asigurabil.local --password AdminLocal123`.
Emailurile de invitație locale apar în Mailpit: http://127.0.0.1:55324. `npx supabase db reset` re-aplică migrațiile + seed.

## 1. Proiect Supabase (cloud)

1. [database.new](https://database.new) → proiect nou, **region: EU (Frankfurt)** (GDPR), plan Free.
2. În repo: `npx supabase link --project-ref <ref-ul proiectului>` (cere login CLI).
3. `npx supabase db push` — aplică `supabase/migrations/0001_init.sql` (schema, RLS, bucket).
4. `npx supabase functions deploy submit-request invite-user`.
5. Dashboard → **Authentication → URL Configuration**: Site URL = `https://admin.asigurabil.ro`,
   Redirect URLs: adaugă același domeniu. (Signup-ul public e oprit din config; conturile se fac
   doar prin invitație.)
6. Creează contul lui Sergiu:
   `npx tsx scripts/create-admin.ts --url https://<ref>.supabase.co --service-key <service_role din Dashboard → API> --email <emailul lui> --password <parolă temporară>`

## 2. Cloudflare Turnstile

1. Dashboard Cloudflare → **Turnstile → Add widget**: domeniul `asigurabil.ro`, mod „Managed".
2. **Site key** → variabilă `VITE_TURNSTILE_SITE_KEY` pe proiectul Pages al site-ului public.
3. **Secret key** → `npx supabase secrets set TURNSTILE_SECRET_KEY=<secret>` (pentru funcția
   submit-request din cloud).

## 3. Cloudflare Pages

**Site public (proiectul existent)** — adaugă în Settings → Environment variables:
- `VITE_SUPABASE_URL` = `https://<ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = anon key din Dashboard → API
- `VITE_TURNSTILE_SITE_KEY` = site key de la pasul 2
apoi „Retry deployment" ca să reconstruiască cu ele.

**Panoul de admin (proiect Pages nou)**:
- Connect to Git → același repo → **Root directory: `admin`**, build `npm ci && npm run build`,
  output `dist`.
- Environment variables: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (aceleași valori).
- Custom domain: `admin.asigurabil.ro`.

## 4. Verificare după deploy

- asigurabil.ro → completează o cerere cu un fișier → mesajul WhatsApp conține `Cerere #XXXX`.
- admin.asigurabil.ro → login cu contul lui Sergiu → cererea apare în inbox cu documentul
  descărcabil; schimbă statusul.
- Utilizatori → invită un email de test → linkul din email duce la setarea parolei.
- Sergiu își schimbă parola temporară („Am uitat parola" pe login trimite email de resetare).

## Notă GDPR

Politica de confidențialitate de pe site a fost actualizată (stocare Supabase UE, fișiere,
Turnstile). Dacă schimbi regiunea sau adaugi alte servicii, actualizeaz-o.
