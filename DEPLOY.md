# Deploy — backend Supabase + panou admin.asigurabil.ro

Codul e gata și testat local; pașii de mai jos sunt configurarea cloud (o singură dată).

## 0. Rulare locală (pentru testare oricând)

```bash
npx supabase start          # tot stack-ul în Docker (porturi 553xx, coexistă cu alte proiecte)
npx supabase functions serve # edge functions cu hot-reload (Turnstile pe chei de test)
npm run dev                  # site public :5173  (.env.local e deja configurat)
cd admin && npm run dev      # panou :5174        (admin/.env.local la fel)
```

Cont de admin local: `npx tsx scripts/create-admin.ts --url http://127.0.0.1:55321 --service-key <SERVICE_ROLE_KEY din 'npx supabase status'> --phone "0751 461 173" --password AdminLocal123`.
Autentificarea e pe TELEFON + parolă. Local, mesajele WhatsApp (invitații, resetări, digest) NU
pleacă nicăieri — apar în „Jurnal mesaje WhatsApp" din pagina Utilizatori, cu linkuri clickabile.
`npx supabase db reset` re-aplică migrațiile + seed.

## 1. Proiect Supabase (cloud)

1. [database.new](https://database.new) → proiect nou, **region: EU (Frankfurt)** (GDPR), plan Free.
2. În repo: `npx supabase link --project-ref <ref-ul proiectului>` (cere login CLI).
3. `npx supabase db push` — aplică `supabase/migrations/0001_init.sql` (schema, RLS, bucket, cron).
4. `npx supabase functions deploy submit-request invite-user reset-password send-digest`.
5. Setările de auth din `config.toml` NU se aplică automat în cloud — rulează
   `npx supabase config push` (sincronizează signup oprit, URL-uri etc.) SAU setează manual în
   Dashboard: **Authentication → URL Configuration** (Site URL = `https://admin.asigurabil.ro`
   + Redirect URLs) și **Authentication → Sign In/Up → dezactivează „Allow new users to sign
   up"** (conturile se fac doar prin invitație, autentificarea e pe telefon + parolă).
6. Secrete pentru funcții (pe lângă Turnstile, vezi mai jos):
   ```
   npx supabase secrets set ADMIN_URL=https://admin.asigurabil.ro \
     DIGEST_SECRET=<un-șir-aleator-lung> \
     WHATSAPP_PROVIDER=twilio \
     TWILIO_ACCOUNT_SID=<sid> TWILIO_AUTH_TOKEN=<token> TWILIO_WHATSAPP_FROM=whatsapp:+<numărul Twilio>
   ```
   (Până configurezi Twilio poți lăsa `WHATSAPP_PROVIDER=mock` — mesajele se văd doar în
   jurnalul din Utilizatori.)
7. Configurarea cron-ului pentru digest — în Dashboard → SQL Editor:
   ```sql
   insert into public.app_config (key, value) values
     ('functions_url', 'https://<ref>.supabase.co/functions/v1'),
     ('digest_secret', '<același DIGEST_SECRET de la pasul 6>')
   on conflict (key) do update set value = excluded.value;
   ```
8. Creează contul lui Sergiu (autentificare cu telefonul + parola):
   `npx tsx scripts/create-admin.ts --url https://<ref>.supabase.co --service-key <service_role din Dashboard → API> --phone "0751 461 173" --password <parolă temporară>`

## 1b. Twilio (mesaje WhatsApp: invitații, resetări de parolă, digest)

1. Cont pe [twilio.com](https://www.twilio.com) (trial merge pentru început).
2. **Varianta rapidă — Sandbox** (suficientă cât timp Sergiu e singurul utilizator): în consolă
   → Messaging → Try WhatsApp. Sergiu trimite o singură dată codul „join …" de pe telefonul lui
   către numărul de sandbox, apoi poate primi mesaje. `TWILIO_WHATSAPP_FROM` = numărul de sandbox.
   Limitare: fiecare destinatar nou trebuie să facă „join", iar sesiunea expiră după 72h fără
   mesaje — pentru un singur om e OK, pentru mai mulți brokeri devine incomod.
3. **Varianta serioasă** (când apar mai mulți brokeri): cumperi un număr Twilio (~1 $/lună) și îl
   înregistrezi ca WhatsApp Sender (Messaging → Senders) — procesul trece prin Meta (profil de
   business; PFA/II e acceptat) și poate dura câteva zile. Mesajele inițiate de sistem folosesc
   șabloane aprobate (~0,04 € bucata; la volumul actual, câțiva lei pe lună).
4. Migrarea ulterioară la Meta Cloud API = un driver nou în
   `supabase/functions/_shared/whatsapp.ts`, restul rămâne neschimbat.

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
- Connect to Git → același repo → **Root directory: `admin`**, build
  `npm ci --prefix .. && npm ci && npm run build` (instalează și dependențele din rădăcină —
  folderul `shared/` își rezolvă React-ul de acolo),
  output `dist`.
- Environment variables: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (aceleași valori) +
  `VITE_SITE_URL=https://asigurabil.ro` (pentru linkurile de recomandare din Setări).
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
