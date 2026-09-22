import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'
import { LogoMark } from '../Logo'
import { BRAND } from '../../lib/constants'
import { useBroker } from '../../lib/broker'

const bullets = [
  {
    icon: '🎯',
    title: 'Oferte comparate, nu „ce se vinde azi"',
    text: 'Lucrăm cu mai mulți asiguratori, deci recomandarea noastră e în interesul tău, nu al unei singure companii.',
  },
  {
    icon: '⚡',
    title: 'Răspuns în ~30 de minute',
    text: `În timpul programului (${BRAND.schedule}) răspundem rapid. Urgențele nu așteaptă — nici noi.`,
  },
  {
    icon: '🤝',
    title: 'Aceiași oameni, pe termen lung',
    text: 'Îți știm istoricul și nevoile. La reînnoire sau la daună vorbești cu noi, nu reiei totul de la zero.',
  },
  {
    icon: '🔔',
    title: 'Îți amintim noi de scadențe',
    text: 'Ne notăm când îți expiră polițele și te anunțăm din timp — nu mai rămâi niciodată descoperit.',
  },
]

export default function WhyMe() {
  const contact = useBroker()
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
            <div className="mb-5">
              <LogoMark size={72} />
            </div>
            <h3 className="font-bold text-2xl leading-snug">Echipa asigurabil.ro</h3>
            <p className="text-[#C7D3E0] text-sm mt-1 mb-6">Consultanți în asigurări</p>
            <p className="text-[15px] leading-relaxed text-[#DCE6F0]">
              „Rolul nostru e simplu: tu ne spui ce vrei să protejezi, noi îți aducem variantele
              bune și ți le explicăm fără jargon. Decizia e mereu a ta — noi doar ne asigurăm că o
              iei în cunoștință de cauză."
            </p>
            <div className="mt-7 pt-6 border-t border-white/15 text-sm text-[#C7D3E0]">
              📞 {contact.phoneDisplay} · {BRAND.schedule}
            </div>
          </div>
        </Reveal>
        <div>
          <SectionHeading
            label="De ce cu noi"
            title="O echipă de partea ta, nu a asiguratorului"
          />
          <div className="grid sm:grid-cols-2 gap-5 mt-8">
            {bullets.map((b) => (
              <Reveal key={b.title} delay={bullets.indexOf(b) * 0.08}>
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
