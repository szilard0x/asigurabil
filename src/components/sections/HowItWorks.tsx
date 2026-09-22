import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

const steps = [
  {
    icon: '💬',
    title: 'Ne spui ce ai nevoie',
    text: 'Completezi formularul în sub un minut sau ne scrii direct pe WhatsApp. Ne spui ce vrei să protejezi și de ce.',
  },
  {
    icon: '⚖️',
    title: 'Comparăm ofertele pentru tine',
    text: 'Cerem oferte de la mai mulți asiguratori și ți le prezentăm clar, cu plusuri și minusuri — pe limba ta, nu în limbaj de poliță.',
  },
  {
    icon: '✍️',
    title: 'Alegi liniștit, te ajutăm oricând',
    text: 'Semnezi simplu, iar noi rămânem punctul tău de contact: reînnoiri, daune, întrebări — ne suni direct, nu un call-center.',
  },
]

export default function HowItWorks() {
  return (
    <section id="cum-functioneaza" className="bg-white border-y border-line">
      <div className="max-w-6xl mx-auto px-6 py-21">
        <SectionHeading
          label="Cum funcționează"
          title="Trei pași, zero bătăi de cap"
          lead="Consultanța este gratuită pentru tine — suntem plătiți de asiguratori, nu de clienți. Tu primești doar varianta câștigătoare."
        />
        <div className="grid md:grid-cols-3 gap-6 mt-11">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="relative bg-off rounded-2xl p-7 h-full">
                <div className="absolute top-6 right-6 font-display font-extrabold text-[42px] leading-none text-navy/8 select-none">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-soft flex items-center justify-center text-[22px] mb-4" aria-hidden>
                  {s.icon}
                </div>
                <h3 className="text-navy font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-muted text-[14.5px] leading-relaxed">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
