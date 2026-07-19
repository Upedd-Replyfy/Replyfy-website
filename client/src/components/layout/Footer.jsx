import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

const footerLinks = {
  Product: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Mentors', href: '/#experts' },
    { label: 'Find mentor', href: '/mentors' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-white/25 bg-[#272927]">
      <div className="gutter-left gutter-right w-full py-12 md:py-16 lg:py-20">
        <div className="flex w-full flex-col items-center gap-10 text-center lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:text-left">
          <div className="flex max-w-sm flex-col items-center lg:items-start">
            <Logo light />
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              Mentor answers to your hardest questions. Pay once, get a thoughtful response from a
              verified professional.
            </p>
          </div>

          <div className="grid w-full max-w-lg grid-cols-2 justify-items-center gap-8 sm:grid-cols-3 sm:justify-items-start lg:w-auto lg:max-w-none lg:gap-16 xl:gap-24">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group} className="w-full text-center sm:text-left">
                <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40">
                  {group}
                </h4>
                <ul className="space-y-1">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="inline-flex min-h-11 items-center text-sm text-white/50 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex w-full flex-col items-center gap-2 border-t border-white/20 pt-8 text-center sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-white/35">
            &copy; {new Date().getFullYear()} Replyfy. All rights reserved.
          </p>
          <p className="text-xs text-white/35">Built for people who need real answers.</p>
        </div>
      </div>
    </footer>
  )
}
