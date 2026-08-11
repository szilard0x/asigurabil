/** Formatele de export pentru rețelele sociale. */
export const FORMATS = {
  'ig-post': { label: 'Instagram — postare', width: 1080, height: 1080 },
  'ig-story': { label: 'Instagram — story', width: 1080, height: 1920 },
  'fb-post': { label: 'Facebook — postare', width: 1200, height: 630 },
} as const

export type FormatId = keyof typeof FORMATS

/** Stilul vizual al cardului. */
export type CardStyle = 'navy' | 'amber' | 'light'

export interface CardContent {
  headline: string
  /** Partea evidențiată cu amber din headline (afișată sub headline-ul principal). */
  accent: string
  sub: string
  /** Etichete scurte separate — bife de beneficii. */
  chips: string[]
  cta: string
}

export interface CardPreset extends CardContent {
  id: string
  name: string
  style: CardStyle
}

export const PRESETS: CardPreset[] = [
  {
    id: 'general',
    name: 'General — Cere ofertă',
    style: 'navy',
    headline: 'Totul este',
    accent: 'asigurabil.',
    sub: 'Consultanță gratuită · Oferte comparate de la mai mulți asigurători',
    chips: ['RCA · CASCO', 'Sănătate', 'Viață', 'Călătorii', 'Locuințe'],
    cta: 'Cere ofertă gratuită',
  },
  {
    id: 'rca',
    name: 'RCA — reminder expirare',
    style: 'amber',
    headline: 'RCA-ul expiră?',
    accent: 'Rezolvat în 60 de secunde.',
    sub: 'Compar ofertele asigurătorilor, tu alegi prețul care îți convine.',
    chips: ['✓ Rapid, pe WhatsApp', '✓ Fără drumuri', '✓ Preț corect'],
    cta: 'Cere ofertă acum',
  },
  {
    id: 'travel',
    name: 'Călătorii — sezon vacanțe',
    style: 'navy',
    headline: 'Pleci în vacanță?',
    accent: 'Asigură-ți călătoria.',
    sub: 'Storno, medical, bagaje — liniște totală în 60 de secunde.',
    chips: ['✓ Storno', '✓ Medical', '✓ Bagaje'],
    cta: 'Cere ofertă gratuită',
  },
  {
    id: 'sanatate',
    name: 'Sănătate — familie',
    style: 'light',
    headline: 'Sănătatea familiei,',
    accent: 'fără facturi-surpriză.',
    sub: 'Analize, consultații, spitalizare — acoperite de o poliță potrivită.',
    chips: ['✓ Consultanță gratuită', '✓ Oferte comparate'],
    cta: 'Hai să vorbim',
  },
  {
    id: 'viata',
    name: 'Viață — protecția celor dragi',
    style: 'navy',
    headline: 'Cei dragi, protejați',
    accent: 'orice ar fi.',
    sub: 'Asigurare de viață pe înțelesul tău, fără jargon și fără presiune.',
    chips: ['✓ Protecție financiară', '✓ Componente de economisire'],
    cta: 'Cere o discuție gratuită',
  },
  {
    id: 'iarna',
    name: 'Sezonier — sporturi de iarnă',
    style: 'light',
    headline: 'Mergi la schi?',
    accent: 'Pleacă asigurat.',
    sub: 'Accidentele pe pârtie costă mii de euro. Polița — câțiva lei pe zi.',
    chips: ['✓ Sporturi de iarnă', '✓ Recuperare medicală'],
    cta: 'Cere ofertă gratuită',
  },
]
