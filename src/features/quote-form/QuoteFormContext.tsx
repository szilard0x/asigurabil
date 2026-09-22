/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { EMPTY_FORM, type QuoteFormData } from './config'

export type WizardStep = 'type' | 'reason' | 'contact' | 'summary' | 'done'

export const STEP_ORDER: WizardStep[] = ['type', 'reason', 'contact', 'summary']

interface QuoteFormCtx {
  data: QuoteFormData
  step: WizardStep
  /** direcția ultimei navigări, pentru animația de slide */
  direction: 1 | -1
  /** Documente atașate (doar în memorie — nu supraviețuiesc unui refresh). */
  files: File[]
  setFiles: (files: File[]) => void
  /** Id-ul scurt al ultimei cereri trimise (pentru linkul „redeschide mesajul"). */
  sentShortId: string | null
  setSentShortId: (id: string | null) => void
  update: (patch: Partial<QuoteFormData>) => void
  goTo: (step: WizardStep) => void
  next: () => void
  back: () => void
  /** Selectează tipul (din secțiunea Servicii) și sare la pasul următor. */
  selectType: (typeId: string) => void
  reset: () => void
}

const Ctx = createContext<QuoteFormCtx | null>(null)

const STORAGE_KEY = 'asigurabil-quote-form'

function load(): { data: QuoteFormData; step: WizardStep } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // starea „done" nu se restaurează — formularul repornește curat
      const step: WizardStep = parsed.step === 'done' ? 'type' : parsed.step
      return { data: { ...EMPTY_FORM, ...parsed.data }, step: step ?? 'type' }
    }
  } catch {
    /* sessionStorage indisponibil sau corupt — pornim curat */
  }
  return { data: EMPTY_FORM, step: 'type' }
}

export function QuoteFormProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load)
  const [data, setData] = useState<QuoteFormData>(initial.data)
  const [step, setStep] = useState<WizardStep>(initial.step)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [files, setFiles] = useState<File[]>([])
  const [sentShortId, setSentShortId] = useState<string | null>(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }))
    } catch {
      /* ignorăm — persistența e best-effort */
    }
  }, [data, step])

  const goTo = (target: WizardStep) => {
    const from = STEP_ORDER.indexOf(step)
    const to = STEP_ORDER.indexOf(target)
    setDirection(to >= from ? 1 : -1)
    setStep(target)
  }

  const next = () => {
    const i = STEP_ORDER.indexOf(step)
    if (step === 'summary') {
      setDirection(1)
      setStep('done')
    } else if (i >= 0 && i < STEP_ORDER.length - 1) {
      setDirection(1)
      setStep(STEP_ORDER[i + 1])
    }
  }

  const back = () => {
    if (step === 'done') return
    const i = STEP_ORDER.indexOf(step)
    if (i > 0) {
      setDirection(-1)
      setStep(STEP_ORDER[i - 1])
    }
  }

  const update = (patch: Partial<QuoteFormData>) => setData((d) => ({ ...d, ...patch }))

  const selectType = (typeId: string) => {
    setData((d) =>
      d.typeId === typeId ? d : { ...d, typeId, reasonIds: [], reasonText: '', extra: {} },
    )
    setDirection(1)
    setStep('reason')
  }

  const reset = () => {
    setData(EMPTY_FORM)
    setFiles([])
    setDirection(-1)
    setStep('type')
  }

  return (
    <Ctx.Provider
      value={{
        data,
        step,
        direction,
        files,
        setFiles,
        sentShortId,
        setSentShortId,
        update,
        goTo,
        next,
        back,
        selectType,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useQuoteForm() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useQuoteForm must be used within QuoteFormProvider')
  return ctx
}
