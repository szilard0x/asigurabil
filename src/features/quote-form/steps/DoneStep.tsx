import { motion, useReducedMotion } from 'framer-motion'
import { useQuoteForm } from '../QuoteFormContext'
import { buildWhatsAppLink } from '../buildMessage'
import { BRAND } from '../../../lib/constants'

export default function DoneStep() {
  const { data, reset } = useQuoteForm()
  const reduced = useReducedMotion()

  return (
    <div className="text-center py-4">
      <motion.div
        initial={reduced ? false : { scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
        className="w-20 h-20 mx-auto rounded-full bg-[#E8F6EC] flex items-center justify-center text-4xl mb-6"
        aria-hidden
      >
        ✅
      </motion.div>
      <h3 className="font-display font-bold text-navy text-2xl mb-3">
        Mesajul tău e la {BRAND.ownerShort}!
      </h3>
      <p className="text-muted text-[15px] leading-relaxed max-w-md mx-auto">
        Dacă ai trimis mesajul pe WhatsApp, conversația e deja deschisă — {BRAND.ownerShort}{' '}
        răspunde de obicei în <b className="text-navy">{BRAND.responseTime}</b> în timpul
        programului ({BRAND.schedule}).
      </p>
      <div className="bg-amber-soft/60 border border-amber/30 rounded-2xl px-5 py-4 max-w-md mx-auto mt-6 text-[14px] text-ink">
        ⚡ <b>E urgent?</b> Sună direct la{' '}
        <a href={`tel:${BRAND.phoneTel}`} className="font-bold text-navy underline underline-offset-2">
          {BRAND.phoneDisplay}
        </a>
      </div>
      <div className="flex items-center justify-center gap-5 mt-7 text-[13px] text-muted">
        <a
          href={buildWhatsAppLink(data)}
          target="_blank"
          rel="noopener"
          className="hover:text-navy underline underline-offset-2"
        >
          Redeschide mesajul WhatsApp
        </a>
        <span aria-hidden>·</span>
        <button onClick={reset} className="cursor-pointer hover:text-navy underline underline-offset-2">
          Cere încă o ofertă
        </button>
      </div>
      <p className="text-muted text-xs max-w-sm mx-auto mt-8">
        💛 Cunoști pe cineva care are nevoie de o asigurare? Trimite-i linkul{' '}
        <b className="text-navy">asigurabil.ro</b> — o recomandare bună face mai mult decât orice
        reclamă.
      </p>
    </div>
  )
}
