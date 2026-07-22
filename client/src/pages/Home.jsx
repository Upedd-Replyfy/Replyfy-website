import { useEffect, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import ExpertShowcase from '../components/home/ExpertShowcase'
import HowItWorks from '../components/home/HowItWorks'
import Testimonials from '../components/home/Testimonials'
import Pricing from '../components/home/Pricing'
import FAQ from '../components/home/FAQ'
import AuthPreviewModal from '../components/auth/AuthPreviewModal'
import GoogleOneTapPrompt from '../components/auth/GoogleOneTapPrompt'
import { useAuth } from '../context/AuthContext'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Home() {
  const [authMode, setAuthMode] = useState(null)
  const { isAuthenticated, loading } = useAuth()

  // Fallback signup modal when Google One Tap is not configured
  useEffect(() => {
    if (googleClientId || loading || isAuthenticated) return undefined
    if (sessionStorage.getItem('replyfy-signup-prompted') === '1') return undefined

    const timer = window.setTimeout(() => {
      sessionStorage.setItem('replyfy-signup-prompted', '1')
      setAuthMode('signup')
    }, 900)

    return () => window.clearTimeout(timer)
  }, [loading, isAuthenticated])

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
      {googleClientId ? <GoogleOneTapPrompt /> : null}
    </div>
  )
}
