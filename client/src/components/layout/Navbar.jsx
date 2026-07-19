import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

  useEffect(() => {
    if (!mobileOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleHashClick = (href) => {
    if (isHome) {
      document.getElementById(href.replace('/#', ''))?.scrollIntoView({ behavior: 'smooth' })
    }
    setMobileOpen(false)
  }

  const openAuth = (mode) => {
    setMobileOpen(false)
    onAuthOpen?.(mode)
  }

  const renderLink = (link, mobile = false) => {
    const className = mobile
      ? 'flex min-h-12 w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium text-white/80 transition hover:bg-white/5 hover:text-white'
      : 'text-sm font-medium text-white/60 transition-colors hover:text-white'
    const activeClass =
      link.href === '/mentors' && location.pathname === '/mentors' ? ' text-white' : ''

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

  const mobileMenu =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <div className="lg:hidden" key="mobile-menu">
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
                  aria-label="Close menu overlay"
                  onClick={() => setMobileOpen(false)}
                />
                <motion.aside
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                  className="fixed inset-y-0 right-0 z-[70] flex h-[100dvh] w-[min(100vw,320px)] flex-col bg-[#141515] shadow-[-24px_0_60px_rgba(0,0,0,0.55)]"
                  style={{ paddingTop: 'env(safe-area-inset-top)' }}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Mobile navigation"
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-3.5">
                    <p className="text-sm font-medium text-white/50">Menu</p>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-white hover:bg-white/10"
                      aria-label="Close menu"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                    {navLinks.map((link) => renderLink(link, true))}
                  </nav>

                  <div
                    className="shrink-0 space-y-2 border-t border-white/10 px-4 py-4"
                    style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                  >
                    <button
                      type="button"
                      onClick={() => openAuth('login')}
                      className="flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 text-sm font-medium text-white"
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuth('signup')}
                      className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-white text-sm font-semibold text-black"
                    >
                      Get started
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? 'border-b border-white/[0.06] bg-[#171818]/95 backdrop-blur-2xl'
            : 'bg-transparent'
        }`}
      >
        <nav className="site-gutter flex items-center justify-between gap-3 py-3 md:gap-6 md:py-4">
          <Logo light size="nav" />

          <ul className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>{renderLink(link)}</li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
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
              className="group inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90"
            >
              Get started
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {!mobileOpen && (
              <button
                type="button"
                onClick={() => openAuth('signup')}
                className="inline-flex min-h-11 items-center rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-black"
              >
                Get started
              </button>
            )}
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-white hover:bg-white/10"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {mobileMenu}
    </>
  )
}
