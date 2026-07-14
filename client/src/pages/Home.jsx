import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import ExpertShowcase from '../components/home/ExpertShowcase'
import HowItWorks from '../components/home/HowItWorks'
import Testimonials from '../components/home/Testimonials'
import Pricing from '../components/home/Pricing'
import FAQ from '../components/home/FAQ'
import AuthPreviewModal from '../components/auth/AuthPreviewModal'

export default function Home() {
  const [authMode, setAuthMode] = useState(null)

  return (
    <div>
      <Navbar onAuthOpen={setAuthMode} />
      <main className="bg-[#272927]">
        <Hero onAuthOpen={setAuthMode} />
        <HowItWorks />
        <ExpertShowcase />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
      <AuthPreviewModal mode={authMode} onClose={() => setAuthMode(null)} />
    </div>
  )
}
