import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import Logo from '../ui/Logo'

const navLinks = [
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Experts', href: '/#experts' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
]

export default function Navbar() {
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
    setMobileOpen(false)
  }, [location.pathname])

  const handleNavClick = (href) => {
    if (href.startsWith('/#') && isHome) {
      document.getElementById(href.replace('/#', ''))?.scrollIntoView({ behavior: 'smooth' })
      setMobileOpen(false)
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'border-b border-border bg-card/90 shadow-[var(--shadow-luxury-sm)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="page-container relative flex items-center justify-between py-4">
        <Logo />

        <ul className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.href}>
              {isHome ? (
                <button
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </button>
              ) : (
                <Link to={link.href} className="text-sm font-medium text-muted transition-colors hover:text-ink">
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-muted transition-colors hover:text-ink">
            Log in
          </Link>
          <Link
            to="/signup"
            className="btn-primary group inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-semibold"
          >
            Get started
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 -mr-2 text-ink"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mx-5 mb-4 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-luxury-md)]"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) =>
                isHome ? (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className="py-3 text-left text-sm text-muted hover:text-ink"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link key={link.href} to={link.href} className="py-3 text-sm text-muted hover:text-ink">
                    {link.label}
                  </Link>
                )
              )}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                <Link to="/login" className="btn-secondary rounded-2xl py-2.5 text-center text-sm">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary rounded-2xl py-2.5 text-center text-sm font-semibold"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
