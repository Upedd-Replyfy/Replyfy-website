import { Link } from 'react-router-dom'

export default function Logo({ className = '', to = '/' }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 group ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-sm font-bold text-white transition-transform group-hover:scale-105">
        R
      </span>
      <span className="text-lg font-semibold tracking-tight text-ink">
        Replyfy
      </span>
    </Link>
  )
}
