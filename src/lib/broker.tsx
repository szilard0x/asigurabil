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

type FetchResult =
  | { status: 'ok'; broker: StoredBroker }
  /** brokerul nu (mai) există sau e dezactivat — atribuirea trebuie ștearsă */
  | { status: 'gone' }
  /** eroare de rețea/temporară — păstrăm ce avem în cache */
  | { status: 'error' }

async function fetchBroker(code: string): Promise<FetchResult> {
  if (!backendEnabled) return { status: 'error' }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/broker-info?code=${encodeURIComponent(code)}`, {
      headers: { apikey: SUPABASE_ANON_KEY! },
    })
    if (res.status === 404 || res.status === 400) return { status: 'gone' }
    if (!res.ok) return { status: 'error' }
    const data = await res.json()
    if (!data.phone) return { status: 'gone' }
    return {
      status: 'ok',
      broker: { code, name: data.name ?? null, phone: String(data.phone), fetchedAt: Date.now() },
    }
  } catch {
    return { status: 'error' }
  }
}

export function BrokerProvider({ children }: { children: ReactNode }) {
  const [broker, setBroker] = useState<StoredBroker | null>(readStored)

  const save = (b: StoredBroker | null) => {
    setBroker(b)
    try {
      if (b) localStorage.setItem(STORAGE_KEY, JSON.stringify(b))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* best-effort */
    }
  }

  const setCode = (rawCode: string) => {
    const code = rawCode.toUpperCase()
    if (!/^[A-Z0-9]{4,12}$/.test(code)) return
    fetchBroker(code).then((result) => {
      if (result.status === 'ok') save(result.broker)
      // un cod dispărut șterge și atribuirea veche, dacă era pentru același broker
      else if (result.status === 'gone' && readStored()?.code === code) save(null)
    })
  }

  // La FIECARE încărcare validăm brokerul din cache (poate fi șters/dezactivat
  // între timp); cache-ul rămâne pentru afișare instantanee, dar un răspuns
  // „gone" îl elimină imediat. Erorile de rețea nu strică atribuirea.
  useEffect(() => {
    const stored = readStored()
    if (!stored) return
    fetchBroker(stored.code).then((result) => {
      if (result.status === 'ok') save(result.broker)
      else if (result.status === 'gone') save(null)
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
