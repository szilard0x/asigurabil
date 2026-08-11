import { INSURANCE_TYPES } from '../config'
import { useQuoteForm } from '../QuoteFormContext'
import StepNav from './StepNav'

export default function ReasonStep() {
  const { data, update, next, back } = useQuoteForm()
  const type = INSURANCE_TYPES.find((t) => t.id === data.typeId)

  if (!type) {
    back()
    return null
  }

  const toggleReason = (id: string) =>
    update({
      reasonIds: data.reasonIds.includes(id)
        ? data.reasonIds.filter((r) => r !== id)
        : [...data.reasonIds, id],
    })

  const canContinue =
    data.reasonIds.length > 0 ||
    data.reasonText.trim().length > 0 ||
    Object.values(data.extra).some((v) => v.trim().length > 0)

  return (
    <div>
      <h3 className="font-display font-bold text-navy text-2xl mb-1.5">
        {type.icon} {type.reasonQuestion}
      </h3>
      <p className="text-muted text-sm mb-7">
        Alege ce ți se potrivește sau scrie cu cuvintele tale — mă ajută să pregătesc oferte
        relevante pentru situația ta.
      </p>

      <div className="flex flex-col gap-2.5">
        {type.reasons.map((r) => {
          const selected = data.reasonIds.includes(r.id)
          return (
            <button
              key={r.id}
              onClick={() => toggleReason(r.id)}
              aria-pressed={selected}
              className={`flex items-center gap-3 text-left bg-white rounded-xl px-4 py-3.5 cursor-pointer border-[1.5px] transition-all duration-150 hover:border-amber ${
                selected
                  ? 'border-amber bg-[#FFFBF2] shadow-[0_0_0_3px_rgba(245,158,11,.15)]'
                  : 'border-line'
              }`}
            >
              <span
                className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center text-[11px] font-bold transition-colors ${
                  selected ? 'bg-amber border-amber text-navy' : 'border-line text-transparent'
                }`}
                aria-hidden
              >
                ✓
              </span>
              <span className="text-[14.5px] text-ink">{r.label}</span>
            </button>
          )
        })}
      </div>

      <textarea
        value={data.reasonText}
        onChange={(e) => update({ reasonText: e.target.value })}
        placeholder="Altceva ce ar trebui să știu? (opțional)"
        rows={2}
        className="w-full mt-4 bg-white border-[1.5px] border-line rounded-xl px-4 py-3 text-[14.5px] outline-none transition-all focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)] resize-none"
      />

      {type.extraFields?.map((f) => (
        <div key={f.id} className="mt-4">
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            {f.label} <span className="text-muted font-normal">(opțional)</span>
          </label>
          <input
            type={f.type}
            value={data.extra[f.id] ?? ''}
            onChange={(e) => update({ extra: { ...data.extra, [f.id]: e.target.value } })}
            placeholder={f.placeholder}
            className="w-full bg-white border-[1.5px] border-line rounded-xl px-4 py-3 text-[14.5px] outline-none transition-all focus:border-amber focus:shadow-[0_0_0_3px_rgba(245,158,11,.12)]"
          />
          {f.hint && <p className="text-muted text-xs mt-1.5">💡 {f.hint}</p>}
        </div>
      ))}

      <StepNav onBack={back} onNext={next} nextDisabled={!canContinue} />
    </div>
  )
}
