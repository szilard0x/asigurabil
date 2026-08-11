import Logo from '../Logo'
import { BRAND, whatsAppUrl } from '../../lib/constants'

export default function Footer() {
  return (
    <footer className="bg-navy text-[#8FA5BB]">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <Logo variant="light" height={30} />
            <p className="text-sm leading-relaxed mt-4 max-w-xs">
              {BRAND.motto} Consultanță gratuită în asigurări, cu oferte comparate de la mai mulți
              asigurători.
            </p>
          </div>
          <div>
            <b className="block font-display text-white text-sm mb-4">Contact</b>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href={`tel:${BRAND.phoneTel}`} className="hover:text-white transition-colors">
                  📞 {BRAND.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={whatsAppUrl('Bună, Sergiu! Am o întrebare despre asigurări.')}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-white transition-colors"
                >
                  💬 WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${BRAND.email}`} className="hover:text-white transition-colors">
                  ✉️ {BRAND.email}
                </a>
              </li>
              <li className="text-[#5F7893]">Program: {BRAND.schedule}</li>
            </ul>
          </div>
          <div>
            <b className="block font-display text-white text-sm mb-4">Partener</b>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xs">
              <img src="/partner/campion-acvila.png" alt="Campion Broker" className="w-12 h-12 rounded-xl" />
              <div className="text-xs leading-relaxed">
                {BRAND.owner} — {BRAND.role}, partener{' '}
                <span className="text-[#F59E0B] font-semibold">{BRAND.partner}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-[#5F7893]">
          <span>© {new Date().getFullYear()} asigurabil.ro · Toate drepturile rezervate</span>
          <span className="flex gap-5">
            <a href="https://anpc.ro" target="_blank" rel="noopener" className="hover:text-white transition-colors">
              ANPC
            </a>
            <a href="https://asfromania.ro" target="_blank" rel="noopener" className="hover:text-white transition-colors">
              ASF
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
