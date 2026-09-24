# Plan pentru întâlnirea cu Sergiu — finalizarea integrării WhatsApp (Twilio)

Scop: contul Twilio trece pe banii lui Sergiu, șabloanele de mesaje se aprobă, iar
notificările WhatsApp devin funcționale cap-coadă. Durată estimată: ~45 min + timpul
de aprobare Meta (de obicei minute–ore, vine pe email).

## A. Twilio — pașii principali (în ordine)

### 1. Upgrade cont (5 min, cardul lui Sergiu)
- Console Twilio → **Billing → Upgrade** → adaugă cardul → încarcă balanța minimă (~20 $).
- Nu e abonament: banii stau ca și credit și se consumă la utilizare.
- **Cost estimat la volumul actual: 1–2 €/lună** (mesaje utility ~0,04 €/buc + taxa Twilio).
  Primii 20 $ ajung realist ~un an.

### 2. Alertă de balanță (2 min — să nu rămână contul pe zero în tăcere)
- **Billing → Manage → Trigger notifications** → alertă la 5 $.
- Dacă balanța ajunge la zero, notificările de lead-uri pur și simplu nu mai pleacă —
  alerta previne exact asta.

### 3. Creează cele 4 șabloane de mesaje (10 min)
Console → **Messaging → Content Template Builder → Create new**. Pentru fiecare:
tip **Text**, limbă **Romanian (ro)**, categorie **Utility**, corpul EXACT de mai jos,
apoi **Submit for WhatsApp approval**.

**`cerere_noua`**
```
🔔 Cerere nouă #{{1}}: {{2}} — {{3}}
📞 Client: {{4}}
Deschide: {{5}}
```

**`invitatie`**
```
Bună, {{1}}! Ai fost invitat(ă) în echipa asigurabil.ro. Deschide linkul ca să îți setezi parola: {{2}}
```

**`resetare_parola`**
```
Bună, {{1}}! Ai cerut resetarea parolei pentru panoul asigurabil.ro. Deschide linkul ca să setezi o parolă nouă: {{2}} Dacă nu ai fost tu, ignoră acest mesaj.
```

**`raport_zilnic`**
```
📋 asigurabil.ro — {{1}} cereri care așteaptă: {{2}} — Deschide panoul: {{3}}
```

Fiecare șablon primește un **Content SID** (începe cu `HX…`) — notează-le pe toate 4.
Dacă Meta respinge vreun șablon, notează motivul — se reformulează ușor.

### 4. După aprobarea șabloanelor: activează-le în sistem (2 min)
Din folderul proiectului, în terminal (sau trimite-i lui Claude cele 4 HX-uri):
```bash
npx supabase secrets set TWILIO_TPL_NEW_REQUEST=HX... TWILIO_TPL_INVITE=HX... TWILIO_TPL_RESET=HX... TWILIO_TPL_DIGEST=HX...
```

### 5. Test cap-coadă (5 min)
- Trimite o cerere de test de pe asigurabil.ro → mesajul „🔔 Cerere nouă" trebuie să
  ajungă pe telefoanele amândurora; în panou → **Jurnal**, intrarea apare cu **SENT**.
- Panou → **Setări → „Trimite raportul acum (test)"** → raportul vine pe WhatsApp.
- Opțional: invită un cont de test → mesajul de invitație vine pe WhatsApp, linkul
  de activare funcționează.

### 6. De discutat: sender propriu (opțional, mai târziu)
Acum mesajele vin de pe numărul german al Twilio-ului (quickstart). Funcționează, dar
dacă Sergiu vrea un număr dedicat „al firmei": se cumpără un număr Twilio (~1 $/lună)
și se înregistrează ca WhatsApp Sender prin Meta (cu II-ul lui; durează câteva zile).
Atenție: șabloanele se re-asociază noului sender (posibil re-aprobare). Codul nu se
schimbă — doar un secret.

### 7. Predarea contului Twilio (2 min)
Contul a fost făcut de tine — la întâlnire: schimbați emailul contului pe al lui
Sergiu (Console → Admin → Account settings) sau măcar salvați împreună parola în
password manager-ul lui. Cardul e deja al lui după pasul 1.

## B. Cât sunteți împreună — de bifat și astea

1. **Parola lui Sergiu în panou** — dacă încă are parola temporară, să și-o schimbe
   din **Setări → Schimbă parola**.
2. **Turnstile hostnames** (posibila cauză a cererii pierdute a prietenei lui):
   Cloudflare → Turnstile → widgetul asigurabil.ro → hostnames să includă și
   `www.asigurabil.ro`. Aruncați un ochi și pe analytics-ul widgetului (challenge-uri eșuate).
3. **Curățenie în panou**: ștergeți conturile de test din Utilizatori („Test User" etc.)
   și marcați cererile de test ca „Pierdut" (momentan nu există buton de ștergere a
   cererilor — dacă vreți unul, spuneți-i lui Claude).
4. **Proiectul Supabase vechi din Irlanda** — dacă nu l-ați șters încă: dashboard →
   proiectul vechi „asigurabil.ro" → Settings → General → Delete project.
5. **Întrebările deschise din PLAN.md** — răspunsurile lui Sergiu decid v2:
   - Cât timp păstrăm cererile + documentele înainte de ștergere automată? (nr. de luni)
   - Cererile „organice" când vor fi mai mulți brokeri: manual (ca acum) sau pe rând?
   - Ofertele la care clientul nu răspunde de X zile — vreți atenționare separată?
   - Cine poate invita utilizatori: doar adminul (ca acum) — OK pe termen lung?
   - Sender propriu (punctul A6): acum, mai târziu, sau deloc?

## C. După întâlnire — de trimis lui Claude

- Cele **4 Content SID-uri** (dacă nu le-ați setat voi cu comanda de la A4)
- Rezultatul testelor de la A5 (mai ales dacă ceva a picat — Jurnal → eroarea exactă)
- Răspunsurile de la B5
- Decizia despre sender-ul propriu
