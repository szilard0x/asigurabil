import { motion, useReducedMotion } from 'framer-motion'
import { Button, ButtonLink } from '../ui/Button'
import { BRAND, whatsAppUrl } from '../../lib/constants'
import { scrollToWizard } from '../../lib/scroll'

const stats = [
  { value: '9+', label: 'tipuri de asigurări' },
  { value: '0 lei', label: 'costă consultanța' },
  { value: '~30 min', label: 'timp de răspuns' },
]

const chatMessages = [
  { me: false, text: 'Bună! Am primit cererea ta pentru asigurarea de sănătate. Îți pregătesc 3 oferte de comparat. 👌' },
  { me: true, text: 'Super, mulțumesc! Cât durează?' },
  { me: false, text: 'Revin în maxim 30 de minute cu tot ce ai nevoie.' },
]

export default function Hero() {
  const reduced = useReducedMotion()
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-24 grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-center">
        <div>
          <motion.div
            {...fadeUp(0)}
            className="inline-flex items-center gap-2 bg-amber/15 border border-amber/40 text-[#FBCB6F] text-[13px] font-semibold px-3.5 py-1.5 rounded-full mb-6"
          >
            ✓ Consultanță gratuită · Răspuns rapid pe WhatsApp
          </motion.div>
          <motion.h1
            {...fadeUp(0.08)}
            className="font-extrabold text-[clamp(38px,5vw,58px)] leading-[1.08] tracking-[-1px]"
          >
            Totul este <span className="text-amber">asigurabil</span>.
          </motion.h1>
          <motion.p {...fadeUp(0.16)} className="mt-5 mb-8 text-[17px] leading-relaxed text-[#C7D3E0] max-w-lg">
            Găsesc pentru tine cea mai potrivită asigurare — RCA, sănătate, viață, călătorii și nu
            numai. Compar ofertele mai multor asigurători și tu alegi în cunoștință de cauză.
            Simplu, rapid, fără costuri ascunse.
          </motion.p>
          <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-3.5">
            <Button onClick={scrollToWizard}>Cere ofertă în 60 de secunde →</Button>
            <ButtonLink
              variant="ghost"
              href={whatsAppUrl('Bună, Sergiu! Am o întrebare despre asigurări.')}
              target="_blank"
              rel="noopener"
            >
              💬 Scrie-mi pe WhatsApp
            </ButtonLink>
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

        {/* cartonaș conversație WhatsApp */}
        <motion.div
          initial={reduced ? undefined : { opacity: 0, y: 36, rotate: 1.5 }}
          animate={reduced ? undefined : { opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="bg-white rounded-[22px] shadow-[0_30px_60px_rgba(4,16,30,.45)] p-6 text-ink hidden sm:block"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-[linear-gradient(135deg,#F59E0B,#FBBF24)] flex items-center justify-center text-navy font-display font-extrabold">
              S
            </div>
            <div>
              <b className="font-display text-[14.5px]">Sergiu · asigurabil.ro</b>
              <div className="text-muted text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> online acum
              </div>
            </div>
          </div>
          {chatMessages.map((m, i) => (
            <motion.div
              key={i}
              initial={reduced ? undefined : { opacity: 0, y: 10 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 + i * 0.7 }}
              className={`text-sm leading-relaxed px-4 py-3 mb-2.5 max-w-[92%] ${
                m.me
                  ? 'bg-[#E8F6EC] rounded-[14px_14px_4px_14px] ml-auto'
                  : 'bg-off rounded-[14px_14px_14px_4px]'
              }`}
            >
              {m.text}
            </motion.div>
          ))}
          <motion.div
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            transition={{ delay: 3.2 }}
            className="text-xs text-green-700 font-semibold mt-2"
          >
            ✓✓ Mesajul tău ajunge direct la {BRAND.ownerShort}, nu într-o căsuță anonimă
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
