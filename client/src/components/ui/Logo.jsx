import { Link } from 'react-router-dom'

const sizeClasses = {
  sm: 'h-8 w-auto max-w-[140px]',
  md: 'h-10 w-auto max-w-[180px]',
  lg: 'h-12 w-auto sm:h-14 md:h-16 lg:h-[4.25rem]',
}

export default function Logo({
  className = '',
  to,
  light = true,
  dashboard = false,
  admin = false,
  expert = false,
  size,
}) {
  const destination = admin
    ? '/admin'
    : expert
      ? '/expert'
      : dashboard
        ? '/dashboard'
        : (to ?? '/')

  // Compact in app shells; large on marketing pages.
  const resolvedSize = size || (dashboard || admin || expert ? 'sm' : 'lg')
  // Wordmark in the asset is dark; flip it on dark surfaces so it stays legible.
  const onDark = light && !admin && !expert && !dashboard

  return (
    <Link
      to={destination}
      className={`inline-flex max-w-full items-center transition-opacity hover:opacity-90 ${className}`}
      aria-label="Replyfy"
    >
      <img
        src="/logo.png"
        alt="Replyfy"
        className={`object-contain object-left ${sizeClasses[resolvedSize]} ${
          onDark ? '[filter:invert(1)_hue-rotate(180deg)]' : ''
        }`}
        draggable={false}
      />
    </Link>
  )
}
