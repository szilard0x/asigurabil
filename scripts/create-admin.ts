/**
 * Creează (sau promovează) contul de ADMIN al lui Sergiu — autentificarea e pe
 * TELEFON + parolă. Fără dependențe, doar fetch. O singură dată per mediu:
 *
 *   Local:  npx tsx scripts/create-admin.ts \
 *             --url http://127.0.0.1:55321 \
 *             --service-key <SERVICE_ROLE_KEY din `npx supabase status`> \
 *             --phone "0751 461 173" --password <parola> --name "Moldovan Sergiu-Ioan"
 *
 *   Cloud:  la fel, cu --url https://<proiect>.supabase.co și service_role key din dashboard.
 */

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const url = arg('url')?.replace(/\/$/, '')
const serviceKey = arg('service-key')
const rawPhone = arg('phone')
const password = arg('password')
const fullName = arg('name') ?? 'Moldovan Sergiu-Ioan'

if (!url || !serviceKey || !rawPhone || !password) {
  console.error(
    'Utilizare: tsx scripts/create-admin.ts --url <URL> --service-key <KEY> --phone <TELEFON> --password <PAROLA> [--name "Nume"]',
  )
  process.exit(1)
}

// aceeași normalizare ca în shared/phone.ts
const m = rawPhone.replace(/[\s.\-()]/g, '').match(/^(?:\+4|004)?(0(?:7\d{8}|[23]\d{8}))$/)
if (!m) {
  console.error(`Număr de telefon invalid: ${rawPhone}`)
  process.exit(1)
}
const phone = `4${m[1]}`
const email = `${phone}@wa.asigurabil.ro`

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
}

const createRes = await fetch(`${url}/auth/v1/admin/users`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin', full_name: fullName, phone },
  }),
})

if (createRes.ok) {
  const user = await createRes.json()
  console.log(`✔ Cont de admin creat pentru ${rawPhone} (id: ${user.id})`)
  console.log(`  Autentificare în panou: telefon ${rawPhone} + parola aleasă.`)
  process.exit(0)
}

const err = await createRes.json().catch(() => ({}))
const msg = String(err.msg ?? err.message ?? createRes.statusText)
if (!/already|exista|registered/i.test(msg)) {
  console.error('Eroare la creare:', msg)
  process.exit(1)
}

// Contul există deja — îl promovăm la admin prin tabela profiles.
const patchRes = await fetch(`${url}/rest/v1/profiles?phone=eq.${phone}`, {
  method: 'PATCH',
  headers: { ...headers, Prefer: 'return=representation' },
  body: JSON.stringify({ role: 'admin', full_name: fullName }),
})
const rows = await patchRes.json().catch(() => [])
if (!patchRes.ok || !Array.isArray(rows) || rows.length === 0) {
  console.error('Contul există dar promovarea a eșuat:', JSON.stringify(rows))
  process.exit(1)
}
console.log(`✔ Contul pentru ${rawPhone} exista deja — promovat la admin.`)
