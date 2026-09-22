export const BRAND = {
  name: 'asigurabil.ro',
  motto: 'Totul este asigurabil.',
  owner: 'Moldovan Sergiu-Ioan',
  ownerShort: 'Sergiu',
  role: 'Asistent în brokeraj',
  partner: 'Campion Broker de Asigurare și Reasigurare',
  phoneDisplay: '0751 461 173',
  /** E.164, no plus — format wa.me expects */
  phoneWhatsApp: '40751461173',
  phoneTel: '+40751461173',
  email: 'contact@asigurabil.ro',
  responseTime: '~30 de minute',
  schedule: 'L–V, 9:00–18:00',
} as const

export const whatsAppUrl = (text: string, phone: string = BRAND.phoneWhatsApp) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`

export const mailtoUrl = (subject: string, body: string) =>
  `mailto:${BRAND.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
