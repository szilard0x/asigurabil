import Navbar from '../components/sections/Navbar'
import Hero from '../components/sections/Hero'
import Services from '../components/sections/Services'
import HowItWorks from '../components/sections/HowItWorks'
import QuoteWizard from '../features/quote-form/QuoteWizard'
import WhyMe from '../components/sections/WhyMe'
import FAQ from '../components/sections/FAQ'
import Footer from '../components/sections/Footer'
import FloatingWhatsApp from '../components/sections/FloatingWhatsApp'
import { QuoteFormProvider } from '../features/quote-form/QuoteFormContext'

export default function LandingPage() {
  return (
    <QuoteFormProvider>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <QuoteWizard />
        <WhyMe />
        <FAQ />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </QuoteFormProvider>
  )
}
