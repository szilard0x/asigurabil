import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { whatsAppUrl } from '../../lib/constants'

/** Buton WhatsApp plutitor, vizibil după ce treci de hero. */
export default function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ duration: 0.25 }}
          href={whatsAppUrl('Bună ziua! Am o întrebare despre asigurări.')}
          target="_blank"
          rel="noopener"
          aria-label="Scrie-mi pe WhatsApp"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-[0_12px_30px_rgba(37,211,102,.45)] flex items-center justify-center hover:scale-110 transition-transform"
        >
          <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden>
            <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.8 5 2.3 7L4 29l7.3-2.2c1.9 1 4 1.6 6.2 1.6h.5c6.6 0 12-5.3 12-11.9C30 8.3 24.6 3 16 3zm7 16.9c-.3.8-1.5 1.5-2.4 1.7-.6.1-1.5.2-4.3-.9-3.6-1.5-5.9-5.1-6.1-5.4-.2-.2-1.5-1.9-1.5-3.7s.9-2.6 1.3-3c.3-.3.7-.4 1-.4h.7c.2 0 .5-.1.8.6.3.8 1.1 2.6 1.2 2.8.1.2.2.4 0 .7-.1.2-.2.4-.4.6l-.6.7c-.2.2-.4.4-.2.8.2.4 1 1.7 2.2 2.7 1.5 1.3 2.8 1.7 3.2 1.9.4.2.6.2.9-.1.2-.3 1-1.2 1.3-1.6.3-.4.5-.3.9-.2.4.1 2.2 1 2.6 1.2.4.2.6.3.7.5.1.2.1.9-.3 1.8z" />
          </svg>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
