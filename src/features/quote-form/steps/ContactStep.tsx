import { useRef, useState } from 'react'
import { REFERRAL_SOURCES } from '../config'
import { useQuoteForm } from '../QuoteFormContext'
import { isValidRoPhone } from '../buildMessage'
import { MAX_FILES, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../submitRequest'
import StepNav from './StepNav'

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function ContactStep() {
  const { data, update, next, back, files, setFiles } = useQuoteForm()
  const [touched, setTouched] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setFileError(null)
    const selected = [...files]
    for (const f of Array.from(list)) {
      if (selected.length >= MAX_FILES) {
        setFileError(`Poți atașa cel mult ${MAX_FILES} fișiere.`)
        break
      }
      if (f.size > MAX_FILE_SIZE) {
        setFileError(`„${f.name}" depășește limita de 10 MB.`)
        continue
      }
      if (!ALLOWED_FILE_TYPES.includes(f.type)) {
        setFileError(`„${f.name}" nu este imagine sau PDF.`)
        continue
      }
      selected.push(f)
    }
    setFiles(selected)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const nameOk = data.name.trim().length >= 2
  const phoneOk = isValidRoPhone(data.phone)
  const canContinue = nameOk && phoneOk

  return (
    <div>
      <h3 className="font-display font-bold text-navy text-2xl mb-1.5">Cum te putem contacta?</h3>
      <p className="text-muted text-sm mb-7">
        Datele tale ajung doar la echipa asigurabil.ro, pe WhatsApp — nu într-o bază de date de
        marketing.
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
            Documente utile <span className="text-muted font-normal">(opțional)</span>
          </label>
          <p className="text-muted text-xs mb-2">
            De exemplu poza talonului pentru RCA/CASCO — grăbește pregătirea ofertei. Max{' '}
            {MAX_FILES} fișiere (imagini sau PDF, 10 MB fiecare); le vede doar echipa noastră.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            onChange={(e) => addFiles(e.target.files)}
            className="hidden"
            id="quote-files"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-[1.5px] border-dashed border-line bg-white rounded-xl px-4 py-3 text-[13.5px] text-muted cursor-pointer transition-colors hover:border-amber hover:text-navy"
          >
            📎 Alege fișiere…
          </button>
          {fileError && <p className="text-red-500 text-xs mt-1.5">{fileError}</p>}
          {files.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-3 bg-white border border-line rounded-lg px-3 py-2 text-[13px]"
                >
                  <span className="truncate text-ink">
                    {f.name} <span className="text-muted">· {formatSize(f.size)}</span>
                  </span>
                  <button
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    aria-label={`Elimină ${f.name}`}
                    className="text-muted hover:text-red-500 cursor-pointer shrink-0"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block font-display font-semibold text-navy text-[13px] mb-1.5">
            De unde ai auzit de noi? <span className="text-muted font-normal">(opțional)</span>
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
