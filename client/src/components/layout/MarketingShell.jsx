import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import AuthPreviewModal from '../auth/AuthPreviewModal'

const LIGHT_PATHS = new Set([
  '/about',
  '/careers',
  '/contact',
  '/legal',
  '/privacy',
  '/terms',
  '/refund',
])

export default function MarketingShell() {
  const [authMode, setAuthMode] = useState(null)
  const { pathname } = useLocation()
  const light = LIGHT_PATHS.has(pathname)

  return (
    <div className={`min-h-screen ${light ? 'bg-[#F8FAFC]' : 'bg-[#272927]'}`}>
      <Navbar solid onAuthOpen={setAuthMode} />
      <main className={light ? 'bg-[#F8FAFC] pt-[72px] md:pt-[80px]' : 'bg-[#272927] pt-[72px] md:pt-[80px]'}>
        <Outlet />
      </main>
      <Footer theme={light ? 'light' : 'dark'} onAuthOpen={setAuthMode} />
      <AuthPreviewModal mode={authMode} onClose={() => setAuthMode(null)} />
    </div>
  )
}
