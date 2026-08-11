import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { BRAND } from '../../lib/constants'

const faqs = [
  {
    q: 'Cât costă consultanța?',
    a: 'Nimic. Serviciile mele sunt gratuite pentru tine — sunt remunerat de asigurători prin comision, iar prețul poliței este același ca și cum ai merge direct la ei. Diferența e că eu compar mai multe oferte pentru tine.',
  },
  {
    q: 'Cât durează până primesc oferta?',
    a: `De obicei răspund în ${BRAND.responseTime} în timpul programului (${BRAND.schedule}). Pentru RCA, oferta poate fi gata aproape pe loc; pentru asigurări mai complexe (viață, sănătate) pot fi necesare câteva ore ca să compar serios variantele.`,
  },
  {
    q: 'Ce acte îmi trebuie pentru RCA?',
    a: 'Doar talonul mașinii (certificatul de înmatriculare) și datele proprietarului din buletin. Mi le trimiți pe WhatsApp ca poză și mă ocup eu de restul.',
  },
  {
    q: 'Sunt obligat să cumpăr dacă cer o ofertă?',
    a: 'Absolut deloc. Ceri oferta, o compari cu ce ai, și decizi liniștit. Mulți clienți revin după câteva zile sau la următoarea scadență — nu te presează nimeni.',
  },
  {
    q: 'Ce se întâmplă dacă am o daună?',
    a: 'Mă suni pe mine. Te ghidez pas cu pas prin procesul de daună — ce acte trebuie, unde le depui, ce termene ai. Nu rămâi singur cu dosarul.',
  },
]

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  const reduced = useReducedMotion()
  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 cursor-pointer"
      >
        <span className="font-display font-semibold text-navy text-[15px]">{q}</span>
        <span
          className={`shrink-0 w-7 h-7 rounded-full bg-amber-soft text-navy flex items-center justify-center text-sm transition-transform duration-300 ${
            open ? 'rotate-45' : ''
          }`}
          aria-hidden
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="px-6 pb-5 text-muted text-[14.5px] leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  return (
    <section id="intrebari" className="max-w-3xl mx-auto px-6 py-21">
      <SectionHeading
        label="Întrebări frecvente"
        title="Probabil te întrebi…"
        center
      />
      <div className="flex flex-col gap-3 mt-10">
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.05}>
            <Item {...f} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
