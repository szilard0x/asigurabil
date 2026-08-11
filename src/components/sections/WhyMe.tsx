import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { BRAND } from '../../lib/constants'

const bullets = [
  {
    icon: '🎯',
    title: 'Oferte comparate, nu „ce se vinde azi"',
    text: 'Lucrez cu mai mulți asigurători, deci recomandarea mea e în interesul tău, nu al unei singure companii.',
  },
  {
    icon: '⚡',
    title: 'Răspuns în ~30 de minute',
    text: `În timpul programului (${BRAND.schedule}) răspund rapid. Urgențele nu așteaptă — nici eu.`,
  },
  {
    icon: '🤝',
    title: 'Un singur om, pe termen lung',
    text: 'Îți știu istoricul și nevoile. La reînnoire sau la daună vorbești cu mine, nu reiei totul de la zero.',
  },
  {
    icon: '🔔',
    title: 'Îți amintesc eu de scadențe',
    text: 'Îmi notez când îți expiră polițele și te anunț din timp — nu mai rămâi niciodată descoperit.',
  },
]

export default function WhyMe() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-21">
      <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-center">
        <Reveal>
          <div className="relative bg-[linear-gradient(160deg,#0F2A43,#16395A)] rounded-3xl p-9 text-white overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-24 -right-20 w-[300px] h-[300px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(245,158,11,.22), transparent 65%)' }}
            />
            <div className="w-20 h-20 rounded-full bg-[linear-gradient(135deg,#F59E0B,#FBBF24)] flex items-center justify-center text-navy font-display font-extrabold text-3xl mb-5">
              S
            </div>
            <h3 className="font-bold text-2xl leading-snug">{BRAND.owner}</h3>
            <p className="text-[#C7D3E0] text-sm mt-1 mb-6">{BRAND.role}</p>
            <p className="text-[15px] leading-relaxed text-[#DCE6F0]">
              „Rolul meu e simplu: tu îmi spui ce vrei să protejezi, eu îți aduc variantele bune și
              ți le explic fără jargon. Decizia e mereu a ta — eu doar mă asigur că o iei în
              cunoștință de cauză."
            </p>
            <div className="mt-7 pt-6 border-t border-white/15 text-sm text-[#C7D3E0]">
              📞 {BRAND.phoneDisplay} · {BRAND.schedule}
            </div>
          </div>
        </Reveal>
        <div>
          <SectionHeading
            label="De ce cu mine"
            title="Un broker de partea ta, nu a asigurătorului"
          />
          <div className="grid sm:grid-cols-2 gap-5 mt-8">
            {bullets.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08}>
                <div className="flex gap-3.5">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-amber-soft flex items-center justify-center text-lg" aria-hidden>
                    {b.icon}
                  </div>
                  <div>
                    <b className="block font-display text-navy text-[15px] mb-1">{b.title}</b>
                    <p className="text-muted text-[13.5px] leading-relaxed">{b.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
