import { INSURANCE_TYPES } from '../config'
import { useQuoteForm } from '../QuoteFormContext'

export default function TypeStep() {
  const { data, selectType } = useQuoteForm()

  return (
    <div>
      <h3 className="font-display font-bold text-navy text-2xl mb-1.5">Ce vrei să asiguri?</h3>
      <p className="text-muted text-sm mb-7">Alege tipul — te duc automat la pasul următor.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INSURANCE_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => selectType(t.id)}
            aria-pressed={data.typeId === t.id}
            className={`text-center bg-white rounded-xl px-3 py-4.5 cursor-pointer border-[1.5px] transition-all duration-150 hover:border-amber hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(245,158,11,.16)] ${
              data.typeId === t.id
                ? 'border-amber bg-[#FFFBF2] shadow-[0_0_0_3px_rgba(245,158,11,.18)]'
                : 'border-line'
            }`}
          >
            <div className="text-2xl mb-1.5" aria-hidden>
              {t.icon}
            </div>
            <b className="block font-display text-navy text-[13.5px]">{t.label}</b>
            <small className="text-muted text-[11.5px] leading-tight">{t.short}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
