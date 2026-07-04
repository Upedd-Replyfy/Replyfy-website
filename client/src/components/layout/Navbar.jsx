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
      className={`fixed top-0 left-[1cm] right-[1cm] z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/[0.06] bg-[#050505]/85 backdrop-blur-2xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="flex w-full items-center justify-between gap-6 gutter-left gutter-right py-5">
        <div className="flex min-w-0 items-center gap-8 lg:gap-10">
          <Logo light />

          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                {isHome ? (
                  <button
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    to={link.href}
                    className="text-sm font-medium text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-1.5 rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90"
          >
            Get started
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 -mr-2 text-white"
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
            className="lg:hidden w-full border-t border-white/[0.06] bg-[#050505]/95 backdrop-blur-2xl"
          >
            <div className="gutter-left gutter-right flex flex-col gap-1 py-4">
              {navLinks.map((link) =>
                isHome ? (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className="py-3 text-left text-sm text-white/70 hover:text-white"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="py-3 text-left text-sm text-white/70 hover:text-white"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-white/10">
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/15 py-2.5 text-center text-sm text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-2xl bg-white py-2.5 text-center text-sm font-semibold text-black"
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
