import { useState } from 'react'
import { REFERRAL_SOURCES } from '../config'
import { useQuoteForm } from '../QuoteFormContext'
import { isValidRoPhone } from '../buildMessage'
import StepNav from './StepNav'

export default function ContactStep() {
  const { data, update, next, back } = useQuoteForm()
  const [touched, setTouched] = useState(false)

  const nameOk = data.name.trim().length >= 2
  const phoneOk = isValidRoPhone(data.phone)
  const canContinue = nameOk && phoneOk

  return (
    <div>
      <h3 className="font-display font-bold text-navy text-2xl mb-1.5">Cum te găsește Sergiu?</h3>
      <p className="text-muted text-sm mb-7">
        Datele tale ajung doar la Sergiu, pe WhatsApp — nu într-o bază de date de marketing.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Numele tău
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="ex: Andrei Pop"
            autoComplete="name"
            className="w-full bg-white border-[1.5px] border-line rounded-xl px-4 py-3 text-[14.5px] outline-none transition-all focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)]"
          />
        </div>
        <div>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Telefon
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
            onBlur={() => setTouched(true)}
            placeholder="07xx xxx xxx"
            autoComplete="tel"
            className={`w-full bg-white border-[1.5px] rounded-xl px-4 py-3 text-[14.5px] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)] ${
              touched && !phoneOk && data.phone ? 'border-red-400' : 'border-line focus:border-amber'
            }`}
          />
          {touched && !phoneOk && data.phone && (
            <p className="text-red-500 text-xs mt-1.5">
              Verifică numărul — ar trebui să arate ca 07xx xxx xxx.
            </p>
          )}
        </div>
        <div>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            Localitatea <span className="text-muted font-normal">(opțional)</span>
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="ex: Cluj-Napoca"
            autoComplete="address-level2"
            className="w-full bg-white border-[1.5px] border-line rounded-xl px-4 py-3 text-[14.5px] outline-none transition-all focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)]"
          />
        </div>
        <div>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            De unde ai auzit de mine? <span className="text-muted font-normal">(opțional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {REFERRAL_SOURCES.map((r) => {
              const selected = data.referralId === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => update({ referralId: selected ? null : r.id })}
                  aria-pressed={selected}
                  className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-[13px] cursor-pointer transition-all ${
                    selected
                      ? 'bg-amber border-amber text-navy font-semibold'
                      : 'bg-white border-line text-ink hover:border-amber hover:text-navy'
                  }`}
                >
                  {r.icon} {r.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <StepNav onBack={back} onNext={() => (canContinue ? next() : setTouched(true))} nextDisabled={!canContinue && touched} />
    </div>
  )
}
