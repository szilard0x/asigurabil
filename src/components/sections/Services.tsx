import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { INSURANCE_TYPES } from '../../features/quote-form/config'
import { useQuoteForm } from '../../features/quote-form/QuoteFormContext'
import { scrollToWizard } from '../../lib/scroll'

export default function Services() {
  const { selectType } = useQuoteForm()

  return (
    <section id="servicii" className="max-w-6xl mx-auto px-6 py-21">
      <SectionHeading
        label="Servicii"
        title="Orice ai vrea să protejezi, am o soluție"
        lead="Alege tipul de asigurare și pornești direct formularul de ofertă — durează sub un minut."
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 mt-11">
        {INSURANCE_TYPES.map((t, i) => (
          <Reveal key={t.id} delay={Math.min(i * 0.05, 0.3)}>
            <button
              onClick={() => {
                selectType(t.id)
                scrollToWizard()
              }}
              className="w-full h-full text-center bg-white border-[1.5px] border-line rounded-2xl px-4 py-6 cursor-pointer transition-all duration-200 hover:border-amber hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(245,158,11,.16)]"
            >
              <div className="text-[27px] mb-2" aria-hidden>
                {t.icon}
              </div>
              <b className="block font-display text-navy text-sm">{t.label}</b>
              <small className="text-muted text-xs">{t.short}</small>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
