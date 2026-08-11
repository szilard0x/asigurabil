import { useEffect, useState } from 'react'
import Logo from '../Logo'
import { Button } from '../ui/Button'
import { scrollToWizard } from '../../lib/scroll'

const links = [
  { href: '#servicii', label: 'Servicii' },
  { href: '#cum-functioneaza', label: 'Cum funcționează' },
  { href: '#intrebari', label: 'Întrebări' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-navy/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a href="#" aria-label="asigurabil.ro — începutul paginii">
          <Logo variant="light" height={32} />
        </a>
        <nav className="hidden md:flex gap-7 text-sm text-[#C7D3E0]">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <Button size="md" onClick={scrollToWizard}>
          Cere ofertă
        </Button>
      </div>
    </header>
  )
}
