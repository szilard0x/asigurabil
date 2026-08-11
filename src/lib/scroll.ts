export const WIZARD_SECTION_ID = 'oferta'

export function scrollToWizard() {
  document.getElementById(WIZARD_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
