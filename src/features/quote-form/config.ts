/**
 * Configul de asigurări e partajat cu panoul de admin — vezi shared/insurance.ts.
 * Aici rămâne doar starea formularului public.
 */
export {
  INSURANCE_TYPES,
  REFERRAL_SOURCES,
  type InsuranceType,
  type ReasonSuggestion,
  type ExtraField,
  type ReferralSource,
} from '@shared/insurance'

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
