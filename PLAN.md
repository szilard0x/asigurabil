# Plan — feedback round 2 (2026-09-16)

Notes from Sergiu's second review, expanded into an actionable plan. Items 1–5 are quick
fixes, 6 is small but needs a content page, 7 is a separate project phase.

## 1. Remove the floating WhatsApp button

Remove `FloatingWhatsApp` from `LandingPage.tsx` (bottom-right corner button). Component file
can be deleted or kept for later reuse — decision at implementation time.

## 2. Fix the two service-card animation bugs (hero grid)

- **Bug A — closing doesn't shrink immediately:** clicking × on the expanded card lags before
  collapsing. Likely cause: the `AnimatePresence` exit runs an opacity fade while the
  `layoutId` morph-back competes with it; the 0.35s layout transition also applies on exit.
  Fix: make the exit collapse immediate/fast (short exit transition, or drop the shared-layout
  morph on exit and use a quick scale/fade).
- **Bug B — card sometimes stays slightly enlarged after hover:** known interaction between
  framer-motion `whileHover` and `layoutId` re-renders — the hover transform can get stuck.
  Fix: move the hover effect from `whileHover` to plain CSS (`transition-transform` +
  `hover:scale-…`), which cannot get stuck, or explicitly animate back to `scale: 1`.

## 3. Spelling: „asigurătorului" → „asiguratorului"

Client wants "asiguratorului" (industry spelling) in „O echipă de partea ta, nu a
asigurătorului". Note: „asigurător" is the DEX/legal-standard form, „asigurator" the common
industry spelling — client's preference wins. Apply **consistently sitewide**, not just the
one heading: `asigurător/asigurătorului/asigurători/asigurătorilor` →
`asigurator/asiguratorului/asiguratori/asiguratorilor` (occurrences in Hero sub-text,
HowItWorks lead + step 2, WhyMe heading + bullets, FAQ answers, QuoteWizard/steps copy,
marketing card presets in `features/cards/config.ts`).

## 4. Hero grid title copy

„Ce vrei să asiguri?" → „De ce asigurare ai nevoie?" (in `Hero.tsx`).

## 5. Logo color mismatch

The new logo mark uses a gradient (#FBBF24 → #F59E0B) while the site's buttons/accents use
flat amber `#F59E0B`. Change the shield fill to the flat brand amber in:
- `src/components/Logo.tsx` (LogoMark)
- `public/favicon.svg`
- verify `/cards` exports (CardCanvas uses LogoMark) still look right on all three styles.

## 6. GDPR consent checkbox on the form

- Add a required checkbox on the contact (or summary) step: „Sunt de acord cu prelucrarea
  datelor personale conform Politicii de confidențialitate" — the „Asigură-te" button stays
  disabled until ticked.
- Add a `/confidentialitate` page (new route): what data is collected (nume, telefon,
  localitate, detalii cerere), purpose (pregătirea ofertei de asigurare), where it goes
  (WhatsApp către consultant; later also the admin panel), retention, and the user's GDPR
  rights + contact for deletion requests; mention ANSPDCP as the supervisory authority.
  Link it from the checkbox and the footer.
- Romania = EU, so plain GDPR applies; a consent checkbox + accessible privacy policy is the
  standard pattern for lead forms. **Template text only — Sergiu should have it reviewed;
  this is not legal advice.** (Campion, as the actual broker, may already have a policy text
  he can reuse.)

## 7. Admin panel at admin.asigurabil.ro (separate phase)

Goal: move the card generator off the public site, give Sergiu an inbox of all requests, and
let clients attach files (e.g. talon photo for RCA) — files can't travel through a `wa.me`
link, so they live only in the admin panel.

Proposed architecture (stays on the existing free Cloudflare stack):

- **API + storage:** Cloudflare Workers (or Pages Functions) + **D1** (SQLite) for request
  records + **R2** for uploaded files. On „Asigură-te", the site POSTs the form data (and any
  uploaded files) to the API *in parallel* with opening WhatsApp — WhatsApp remains the
  fast-response channel, the panel becomes the archive/source of truth.
- **Admin app:** new route tree served at `admin.asigurabil.ro` (separate Pages project, or
  same app gated by hostname). Features, in order:
  1. Requests inbox: list new/old requests, each with all submitted fields, attached files,
     timestamp, and a status (nou / contactat / închis).
  2. Card generator moved here from `/cards` (public route removed).
  3. File download links (R2 signed URLs).
- **Auth:** Cloudflare Access in front of `admin.asigurabil.ro` (free tier, email one-time
  code for Sergiu's address) — no password code to write or maintain.
- **Client file upload:** optional upload field in the wizard (photos/PDF, size-capped),
  stored in R2, referenced in the request record; the WhatsApp message mentions „am atașat
  documente în cerere" so Sergiu knows to check the panel.
- **GDPR tie-in:** the privacy policy from item 6 must mention server-side storage once this
  ships (data no longer goes only to WhatsApp).
- Open questions to settle before building: does Sergiu need more than one login; retention
  period for requests/files; whether email notification on new request is wanted (Workers can
  send via a free tier of Resend/MailChannels).

## Suggested order

1–5 in one pass (small, all verifiable in the browser) → 6 (checkbox + policy page) →
7 as its own milestone once he confirms the open questions.
