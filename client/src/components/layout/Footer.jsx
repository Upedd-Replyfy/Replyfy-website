import { Link, useNavigate } from 'react-router-dom'
import Logo from '../ui/Logo'
import { useAuth } from '../../context/AuthContext'

const footerLinks = {
  Product: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Find Mentors', href: '/mentors' },
    { label: 'Ask a question', action: 'ask' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Legal', href: '/legal' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Refunds', href: '/refund' },
  ],
}

const socials = [
  {
    label: 'X (Twitter)',
    href: 'https://twitter.com/replyfy',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/replyfy',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/replyfy',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@replyfy',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

export default function Footer({ onAuthOpen, theme = 'dark' }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const light = theme === 'light'

  const handleAskClick = (e) => {
    e.preventDefault()
    if (isAuthenticated) {
      navigate('/dashboard/ask')
      return
    }
    onAuthOpen?.('signup')
  }

  return (
    <footer
      className={`relative w-full border-t ${
        light ? 'border-slate-200 bg-white' : 'border-white/20 bg-[#272927]'
      }`}
    >
      <div className="gutter-left gutter-right w-full py-8 md:py-10">
        <div className="flex w-full flex-col items-center gap-8 text-center lg:flex-row lg:items-start lg:justify-between lg:gap-12 lg:text-left">
          <div className="flex max-w-xs flex-col items-center lg:items-start">
            <Logo surface={light ? 'light' : 'dark'} size="sm" />
            <p
              className={`mt-3 text-xs leading-relaxed sm:text-sm ${
                light ? 'text-slate-500' : 'text-white/45'
              }`}
            >
              Mentor answers to your hardest questions. Pay once, get a thoughtful response from a
              verified professional.
            </p>
            <div className="mt-4 flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                    light
                      ? 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
                      : 'border-white/10 text-white/45 hover:border-white/25 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid w-full max-w-md grid-cols-3 justify-items-center gap-6 sm:justify-items-start lg:w-auto lg:max-w-none lg:gap-12 xl:gap-16">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="w-full text-center sm:text-left">
                <h4
                  className={`mb-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                    light ? 'text-slate-400' : 'text-white/40'
                  }`}
                >
                  {group}
                </h4>
                <ul className="space-y-0.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.action === 'ask' ? (
                        <button
                          type="button"
                          onClick={handleAskClick}
                          className={`inline-flex min-h-8 items-center text-[13px] transition-colors ${
                            light
                              ? 'text-slate-600 hover:text-slate-900'
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <Link
                          to={link.href}
                          className={`inline-flex min-h-8 items-center text-[13px] transition-colors ${
                            light
                              ? 'text-slate-600 hover:text-slate-900'
                              : 'text-white/50 hover:text-white'
                          }`}
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`mt-7 flex w-full flex-col items-center gap-1.5 border-t pt-5 text-center sm:flex-row sm:justify-between sm:text-left ${
            light ? 'border-slate-200' : 'border-white/15'
          }`}
        >
          <p className={`text-[11px] ${light ? 'text-slate-400' : 'text-white/35'}`}>
            &copy; {new Date().getFullYear()} Replyfy. All rights reserved.
          </p>
          <p className={`text-[11px] ${light ? 'text-slate-400' : 'text-white/35'}`}>
            Built for people who need real answers.
          </p>
        </div>
      </div>
    </footer>
  )
}
