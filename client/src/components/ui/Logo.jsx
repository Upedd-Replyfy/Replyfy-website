import { Link } from 'react-router-dom'

const imageSizes = {
  xs: 'h-8 w-auto max-w-[148px]',
  sm: 'h-10 w-auto max-w-[176px]',
  md: 'h-11 w-auto max-w-[196px]',
  nav: 'h-12 w-auto max-w-[220px] md:h-[3.25rem] md:max-w-[248px]',
  lg: 'h-14 w-auto max-w-[280px] sm:h-16 sm:max-w-[320px] md:h-[4.5rem] md:max-w-[360px]',
}

const iconSizes = {
  xs: 'h-7 w-7',
  sm: 'h-9 w-9',
  md: 'h-10 w-10',
  nav: 'h-11 w-11 md:h-12 md:w-12',
  lg: 'h-14 w-14 sm:h-16 sm:w-16',
}

const textSizes = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-xl',
  nav: 'text-xl md:text-2xl',
  lg: 'text-2xl sm:text-3xl md:text-4xl',
}

function LogoIcon({ className = '' }) {
  return (
    <img
      src="/logo-mark.png"
      alt=""
      className={className}
      aria-hidden
      draggable={false}
    />
  )
}

export default function Logo({
  className = '',
  to,
  light = true,
  alignArtwork = false,
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

  const resolvedSize = size || (dashboard || admin || expert ? 'sm' : 'nav')

  return (
    <Link
      to={destination}
      className={`inline-flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`}
      aria-label="Replyfy"
    >
      {light ? (
        <img
          src="/logo.png"
          alt="Replyfy"
          className={`object-contain object-left ${imageSizes[resolvedSize]}`}
          data-blend={light && !dashboard && !admin && !expert ? 'lighten' : undefined}
          style={alignArtwork ? { marginLeft: '-0.8rem' } : undefined}
          draggable={false}
        />
      ) : (
        <>
          <LogoIcon className={`shrink-0 ${iconSizes[resolvedSize]}`} />
          <span
            className={`font-display font-semibold tracking-tight text-ink ${textSizes[resolvedSize]}`}
          >
            Replyfy
          </span>
        </>
      )}
    </Link>
  )
}
