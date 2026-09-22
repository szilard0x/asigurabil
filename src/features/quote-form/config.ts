/**
 * Config-driven wizard: adding an insurance type, a reason suggestion or a
 * referral source is a data edit here — no component changes needed.
 */

export interface ReasonSuggestion {
  id: string
  label: string
  hint?: string
}

/** Extra per-type fields shown on the details step (all optional for the client). */
export interface ExtraField {
  id: string
  label: string
  placeholder?: string
  type: 'text' | 'date'
  /** Why Sergiu wants it — shown as helper text. */
  hint?: string
}

export interface InsuranceType {
  id: string
  label: string
  short: string
  icon: string
  /** Question shown on the reason step, phrased per type. */
  reasonQuestion: string
  reasons: ReasonSuggestion[]
  extraFields?: ExtraField[]
}

export const INSURANCE_TYPES: InsuranceType[] = [
  {
    id: 'rca',
    label: 'RCA',
    short: 'mașina ta, obligatoriu',
    icon: '🚗',
    reasonQuestion: 'Câteva detalii despre mașină',
    reasons: [
      { id: 'expira', label: 'Îmi expiră polița curentă' },
      { id: 'masina-noua', label: 'Am cumpărat o mașină' },
      { id: 'pret', label: 'Caut un preț mai bun decât am acum' },
    ],
    extraFields: [
      { id: 'plate', label: 'Număr de înmatriculare', placeholder: 'ex: CJ 01 ABC', type: 'text' },
      {
        id: 'expiry',
        label: 'Când expiră polița actuală?',
        type: 'date',
        hint: 'Îți trimitem un reminder înainte să expire, ca să nu rămâi descoperit.',
      },
    ],
  },
  {
    id: 'casco',
    label: 'CASCO',
    short: 'protecție completă auto',
    icon: '🛞',
    reasonQuestion: 'De ce îți dorești CASCO?',
    reasons: [
      { id: 'noua', label: 'Mașină nouă / în leasing' },
      { id: 'grindina', label: 'Protecție la grindină, furt, vandalism' },
      { id: 'accident', label: 'Vreau liniște în caz de accident, indiferent de vină' },
    ],
    extraFields: [
      { id: 'plate', label: 'Număr de înmatriculare', placeholder: 'ex: CJ 01 ABC', type: 'text' },
    ],
  },
  {
    id: 'sanatate',
    label: 'Sănătate',
    short: 'tu și familia ta',
    icon: '🏥',
    reasonQuestion: 'De ce îți dorești o asigurare de sănătate?',
    reasons: [
      { id: 'medicamente', label: 'Medicamentele sau tratamentele costă prea mult' },
      { id: 'facturi', label: 'Vreau să evit facturi medicale neprevăzute' },
      { id: 'familie', label: 'Protecție pentru toată familia' },
      { id: 'acces', label: 'Acces rapid la medici și clinici private' },
    ],
  },
  {
    id: 'viata',
    label: 'Viață',
    short: 'siguranță pentru cei dragi',
    icon: '🛡️',
    reasonQuestion: 'Ce te-a făcut să te gândești la o asigurare de viață?',
    reasons: [
      { id: 'familie', label: 'Vreau ca familia mea să fie protejată financiar' },
      { id: 'credit', label: 'Am un credit / o ipotecă' },
      { id: 'economisire', label: 'Mă interesează și componenta de economisire' },
    ],
  },
  {
    id: 'calatorii',
    label: 'Călătorii',
    short: 'vacanțe fără griji',
    icon: '✈️',
    reasonQuestion: 'Unde și când călătorești?',
    reasons: [
      { id: 'vacanta', label: 'Plec în vacanță' },
      { id: 'munca', label: 'Călătoresc în interes de serviciu' },
      { id: 'schi', label: 'Sporturi de iarnă / activități cu risc' },
    ],
    extraFields: [
      { id: 'destination', label: 'Destinația', placeholder: 'ex: Grecia', type: 'text' },
      { id: 'period', label: 'Perioada', placeholder: 'ex: 10–20 septembrie', type: 'text' },
    ],
  },
  {
    id: 'locuinta',
    label: 'Locuință / Bunuri',
    short: 'casa și ce e în ea',
    icon: '🏠',
    reasonQuestion: 'Ce vrei să protejezi?',
    reasons: [
      { id: 'obligatorie', label: 'Am nevoie de polița obligatorie (PAD)' },
      { id: 'facultativa', label: 'Vreau acoperire extinsă (incendiu, inundație, furt)' },
      { id: 'credit', label: 'Banca mi-o cere pentru credit ipotecar' },
    ],
  },
  {
    id: 'pad',
    label: 'PAD',
    short: 'polița obligatorie a locuinței',
    icon: '📜',
    reasonQuestion: 'Câteva detalii despre locuință',
    reasons: [
      { id: 'noua', label: 'Locuință nouă / abia cumpărată' },
      { id: 'expira', label: 'Îmi expiră polița actuală' },
    ],
  },
  {
    id: 'malpraxis',
    label: 'Malpraxis',
    short: 'pentru profesioniști',
    icon: '🩺',
    reasonQuestion: 'Pentru ce profesie ai nevoie de malpraxis?',
    reasons: [
      { id: 'medic', label: 'Medic / asistent medical' },
      { id: 'farmacist', label: 'Farmacist' },
      { id: 'alta', label: 'Altă profesie' },
    ],
  },
  {
    id: 'leasing',
    label: 'Leasing',
    short: 'asigurări pentru leasing',
    icon: '📋',
    reasonQuestion: 'Câteva detalii despre contract',
    reasons: [
      { id: 'nou', label: 'Închei un leasing nou' },
      { id: 'reinnoire', label: 'Reînnoiesc asigurarea din leasing' },
    ],
  },
]

export interface ReferralSource {
  id: string
  label: string
  icon?: string
}

export const REFERRAL_SOURCES: ReferralSource[] = [
  { id: 'recomandare', label: 'Recomandare de la cineva', icon: '🤝' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'facebook', label: 'Facebook', icon: '👍' },
  { id: 'google', label: 'Google', icon: '🔎' },
  { id: 'altele', label: 'Altele', icon: '💬' },
]

export interface QuoteFormData {
  typeId: string | null
  /** Selected reason suggestion ids. */
  reasonIds: string[]
  /** Free-text detail from the client. */
  reasonText: string
  /** Values for the type's extraFields, keyed by field id. */
  extra: Record<string, string>
  referralId: string | null
  name: string
  phone: string
  city: string
  /** Acord GDPR pentru prelucrarea datelor — obligatoriu înainte de trimitere. */
  gdprConsent: boolean
}

export const EMPTY_FORM: QuoteFormData = {
  typeId: null,
  reasonIds: [],
  reasonText: '',
  extra: {},
  referralId: null,
  name: '',
  phone: '',
  city: '',
  gdprConsent: false,
}
