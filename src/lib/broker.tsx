/* eslint-disable react-refresh/only-export-components */
/**
 * Atribuirea pe broker: cine deschide site-ul printr-un link de recomandare
 * (asigurabil.ro/b/<cod>) vede numerele de telefon ale acelui broker, mesajul
 * WhatsApp merge la el, iar cererea salvată i se repartizează automat.
 * Fără cod (sau dacă backend-ul e oprit) rămân datele implicite din BRAND.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { BRAND } from '@shared/constants'
import { displayRoPhone } from '@shared/phone'
import { SUPABASE_URL, SUPABASE_ANON_KEY, backendEnabled } from './backend'

const STORAGE_KEY = 'asigurabil-broker'
const REFRESH_MS = 24 * 3600 * 1000

interface StoredBroker {
  code: string
  name: string | null
  phone: string // E.164 fără plus
  fetchedAt: number
}

interface BrokerContact {
  /** codul de recomandare activ (trimis la backend pentru repartizare) */
  code: string | null
  phoneWhatsApp: string
  phoneDisplay: string
  phoneTel: string
  setCode: (code: string) => void
}

const defaultContact: Omit<BrokerContact, 'setCode' | 'code'> = {
  phoneWhatsApp: BRAND.phoneWhatsApp,
  phoneDisplay: BRAND.phoneDisplay,
  phoneTel: BRAND.phoneTel,
}

const Ctx = createContext<BrokerContact>({ ...defaultContact, code: null, setCode: () => {} })

function readStored(): StoredBroker | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredBroker) : null
  } catch {
    return null
  }
}

async function fetchBroker(code: string): Promise<StoredBroker | null> {
  if (!backendEnabled) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/broker-info?code=${encodeURIComponent(code)}`, {
      headers: { apikey: SUPABASE_ANON_KEY! },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.phone) return null
    return { code, name: data.name ?? null, phone: String(data.phone), fetchedAt: Date.now() }
  } catch {
    return null
  }
}

export function BrokerProvider({ children }: { children: ReactNode }) {
  const [broker, setBroker] = useState<StoredBroker | null>(readStored)

  const setCode = (rawCode: string) => {
    const code = rawCode.toUpperCase()
    if (!/^[A-Z0-9]{4,12}$/.test(code)) return
    fetchBroker(code).then((b) => {
      if (!b) return // cod invalid/dezactivat — rămânem pe implicit
      setBroker(b)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
      } catch {
        /* best-effort */
      }
    })
  }

  // reîmprospătăm periodic datele (brokerul poate fi dezactivat între timp)
  useEffect(() => {
    const stored = readStored()
    if (!stored || Date.now() - stored.fetchedAt < REFRESH_MS) return
    fetchBroker(stored.code).then((b) => {
      if (b) {
        setBroker(b)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
        } catch {
          /* best-effort */
        }
      } else {
        setBroker(null)
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* best-effort */
        }
      }
    })
  }, [])

  const value: BrokerContact = broker
    ? {
        code: broker.code,
        phoneWhatsApp: broker.phone,
        phoneDisplay: displayRoPhone(broker.phone),
        phoneTel: `+${broker.phone}`,
        setCode,
      }
    : { ...defaultContact, code: null, setCode }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useBroker() {
  return useContext(Ctx)
}

/** Ruta /b/:code — memorează brokerul și duce vizitatorul pe pagina principală. */
export function ReferralRedirect() {
  const { code } = useParams<{ code: string }>()
  const { setCode } = useBroker()
  useEffect(() => {
    if (code) setCode(code)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])
  return <Navigate to="/" replace />
}
