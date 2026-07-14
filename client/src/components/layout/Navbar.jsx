import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'

const navLinks = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Mentors', href: '/#experts' },
  { label: 'Find mentor', href: '/mentors' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

function isHashLink(href) {
  return href.startsWith('/#')
}

export default function Navbar({ onAuthOpen }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleHashClick = (href) => {
    if (isHome) {
      document.getElementById(href.replace('/#', ''))?.scrollIntoView()
    }
    setMobileOpen(false)
  }

  const openAuth = (mode) => {
    setMobileOpen(false)
    onAuthOpen?.(mode)
  }

  const renderLink = (link, mobile = false) => {
    const className = mobile
      ? 'py-3 text-left text-sm text-white/70 hover:text-white'
      : 'text-sm font-medium text-white/60 transition-colors hover:text-white'
    const activeClass =
      link.href === '/mentors' && location.pathname === '/mentors'
        ? mobile
          ? ' text-white'
          : ' text-white'
        : ''

    if (isHashLink(link.href)) {
      if (isHome) {
        return (
          <button
            key={link.href}
            type="button"
            onClick={() => handleHashClick(link.href)}
            className={`${className}${activeClass}`}
          >
            {link.label}
          </button>
        )
      }
      return (
        <Link key={link.href} to={link.href} className={`${className}${activeClass}`}>
          {link.label}
        </Link>
      )
    }

    return (
      <Link
        key={link.href}
        to={link.href}
        onClick={() => setMobileOpen(false)}
        className={`${className}${activeClass}`}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-[#171818]/90 backdrop-blur-2xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="site-gutter flex items-center justify-between gap-6 py-3.5 md:py-4">
        <Logo light size="nav" />

        <ul className="hidden lg:flex flex-1 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>{renderLink(link)}</li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => openAuth('signup')}
            className="group inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90"
          >
            Get started
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <button
          type="button"
          className="lg:hidden p-1.5 -mr-1 text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/[0.06] bg-[#171818]/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="site-gutter flex flex-col gap-1 py-4">
              {navLinks.map((link) => renderLink(link, true))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => openAuth('login')}
                  className="rounded-2xl border border-white/15 py-2.5 text-center text-sm text-white"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => openAuth('signup')}
                  className="rounded-2xl bg-white py-2.5 text-center text-sm font-semibold text-black"
                >
                  Get started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
