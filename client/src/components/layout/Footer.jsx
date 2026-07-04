import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

const footerLinks = {
  Product: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Experts', href: '/#experts' },
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
    <footer className="relative w-full border-t border-white/25 bg-black">
      <div className="gutter-left gutter-right w-full py-16 md:py-20">
        <div className="flex w-full flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="shrink-0">
            <Logo light />
            <p
              className="mt-5 text-sm text-white/50 leading-relaxed"
              style={{ maxWidth: '36ch' }}
            >
              Expert answers to your hardest questions. Pay once, get a thoughtful response from a
              verified professional.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-10 sm:grid-cols-3 lg:w-auto lg:gap-16 xl:gap-24">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 mb-4">
                  {group}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-white/50 transition-colors hover:text-white"
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

        <div className="mt-14 flex w-full flex-col gap-3 border-t border-white/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/35">
            &copy; {new Date().getFullYear()} Replyfy. All rights reserved.
          </p>
          <p className="text-xs text-white/35">Built for people who need real answers.</p>
        </div>
      </div>
    </footer>
  )
}
