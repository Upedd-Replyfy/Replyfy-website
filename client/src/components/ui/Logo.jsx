import { Link } from 'react-router-dom'

export default function Logo({ className = '', to = '/', light = true }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 group ${className}`}>
      <span
        className={`relative flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-transform group-hover:scale-105 ${
          light ? 'bg-white text-black' : 'bg-primary text-primary-fg'
        }`}
      >
        R
      </span>
      <span className={`text-lg font-semibold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>
        Replyfy
      </span>
    </Link>
  )
}
