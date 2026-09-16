import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '../ui/Button'
import { INSURANCE_TYPES } from '../../features/quote-form/config'
import { useQuoteForm } from '../../features/quote-form/QuoteFormContext'
import { scrollToWizard } from '../../lib/scroll'

const stats = [
  { value: '9+', label: 'tipuri de asigurări' },
  { value: '0 lei', label: 'costă consultanța' },
  { value: '~30 min', label: 'timp de răspuns' },
]

export default function Hero() {
  const reduced = useReducedMotion()
  const { selectType } = useQuoteForm()
  const fadeUp = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] as const },
        }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0F2A43_0%,#16395A_55%,#0C3155_100%)] text-white">
      {/* aure decorative animate */}
      <div
        aria-hidden
        className="absolute -top-64 -right-44 w-[720px] h-[720px] rounded-full animate-[float_9s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,.16), transparent 65%)' }}
      />
      <div
        aria-hidden
        className="absolute -bottom-52 -left-32 w-[480px] h-[480px] rounded-full animate-[float_11s_ease-in-out_infinite_reverse]"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,.05), transparent 60%)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-24 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
        <div>
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 bg-amber/15 border border-amber/40 text-[#FBCB6F] text-[13px] font-semibold px-3.5 py-1.5 rounded-full mb-6"
          >
            ✓ Consultanță gratuită · Răspuns rapid pe WhatsApp sau telefon
          </motion.div>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-extrabold text-[clamp(38px,5vw,58px)] leading-[1.08] tracking-[-1px]"
          >
            Totul este <span className="text-amber">asigurabil</span>.
          </motion.h1>
          <motion.p {...fadeUp(0.16)} className="mt-5 mb-8 text-[17px] leading-relaxed text-[#C7D3E0] max-w-lg">
            Găsim pentru tine cea mai potrivită asigurare — RCA, sănătate, viață, călătorii și nu
            numai. Comparăm ofertele mai multor asigurători și tu alegi în cunoștință de cauză.
            Simplu, rapid, fără costuri ascunse.
          </motion.p>
          <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-3.5">
            <Button onClick={scrollToWizard}>Cere ofertă în 60 de secunde →</Button>
          </motion.div>
          <motion.div {...fadeUp(0.32)} className="flex gap-8 mt-11 text-[13.5px] text-[#9FB2C6]">
            {stats.map((s) => (
              <div key={s.label}>
                <span className="block text-white font-display text-[21px] font-bold">{s.value}</span>
                {s.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* grila de servicii — alege tipul direct din hero */}
        <div id="servicii" className="scroll-mt-24">
          <motion.p
            {...fadeUp(0.3)}
            className="text-[#9FB2C6] text-[13px] font-semibold uppercase tracking-[2px] mb-3.5 font-display"
          >
            Ce vrei să asiguri?
          </motion.p>
          <div className="grid grid-cols-3 gap-2.5">
            {INSURANCE_TYPES.map((t, i) => (
              <motion.button
                key={t.id}
                initial={reduced ? undefined : { opacity: 0, y: 20 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
                whileHover={reduced ? undefined : { scale: 1.07, y: -3 }}
                whileTap={reduced ? undefined : { scale: 0.97 }}
                onClick={() => {
                  selectType(t.id)
                  scrollToWizard()
                }}
                className="group relative bg-white rounded-xl px-2 py-3.5 text-center cursor-pointer border-[1.5px] border-transparent transition-colors duration-150 hover:border-amber hover:shadow-[0_14px_30px_rgba(245,158,11,.25)]"
              >
                <span className="block text-[22px] leading-none mb-1.5" aria-hidden>
                  {t.icon}
                </span>
                <b className="block font-display text-navy text-[12.5px] leading-tight">{t.label}</b>
                <small className="hidden sm:block text-muted text-[10.5px] leading-tight mt-0.5">
                  {t.short}
                </small>
                <span className="block overflow-hidden max-h-0 opacity-0 group-hover:max-h-7 group-hover:opacity-100 transition-all duration-200">
                  <span className="inline-block mt-1.5 bg-amber text-navy font-display font-bold text-[10.5px] px-2.5 py-1 rounded-full">
                    Cere ofertă →
                  </span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
