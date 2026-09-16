import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useQuoteForm, STEP_ORDER } from './QuoteFormContext'
import SectionHeading from '../../components/ui/SectionHeading'
import { WIZARD_SECTION_ID } from '../../lib/scroll'
import TypeStep from './steps/TypeStep'
import ReasonStep from './steps/ReasonStep'
import ContactStep from './steps/ContactStep'
import SummaryStep from './steps/SummaryStep'
import DoneStep from './steps/DoneStep'

const stepComponents = {
  type: TypeStep,
  reason: ReasonStep,
  contact: ContactStep,
  summary: SummaryStep,
  done: DoneStep,
} as const

export default function QuoteWizard() {
  const { step, direction } = useQuoteForm()
  const reduced = useReducedMotion()
  const prevStep = useRef<typeof step | null>(null)

  // la schimbarea pasului (nu la montare), readucem formularul în viewport
  useEffect(() => {
    if (prevStep.current !== null && prevStep.current !== step) {
      document
        .getElementById(WIZARD_SECTION_ID)
        ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
    prevStep.current = step
  }, [step, reduced])

  const StepComponent = stepComponents[step]
  const stepIndex = STEP_ORDER.indexOf(step)
  const progress = step === 'done' ? 100 : ((stepIndex + 1) / STEP_ORDER.length) * 100

  return (
    <section id={WIZARD_SECTION_ID} className="bg-white border-y border-line scroll-mt-16">
      <div className="max-w-6xl mx-auto px-6 py-21">
        <SectionHeading
          center
          label="Cere ofertă"
          title="Spune-ne ce ai nevoie — durează sub un minut"
          lead="La final, mesajul pleacă direct pe WhatsApp către echipa noastră. Vezi exact ce trimiți și primești răspuns rapid, de la un om, nu de la un robot."
        />
        <div className="max-w-2xl mx-auto mt-10 bg-off rounded-3xl shadow-card p-6 sm:p-10 overflow-hidden">
          {step !== 'done' && (
            <div className="flex items-center gap-4 mb-8">
              <span className="font-display font-semibold text-navy text-[13px] whitespace-nowrap">
                Pasul {stepIndex + 1} / {STEP_ORDER.length}
              </span>
              <div className="flex-1 h-1.5 bg-line rounded-full overflow-hidden">
                <div
                  className="h-full bg-[linear-gradient(90deg,#F59E0B,#FBBF24)] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              initial={reduced ? false : { opacity: 0, x: 36 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -36 * direction }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
