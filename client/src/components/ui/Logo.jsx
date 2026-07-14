import { Link } from 'react-router-dom'

const imageSizes = {
  xs: 'h-8 w-auto max-w-[148px]',
  sm: 'h-10 w-auto max-w-[176px]',
  md: 'h-11 w-auto max-w-[196px]',
  nav: 'h-12 w-auto max-w-[220px] md:h-[3.25rem] md:max-w-[248px]',
  lg: 'h-14 w-auto max-w-[280px] sm:h-16 sm:max-w-[320px] md:h-[4.5rem] md:max-w-[360px]',
}

export function LogoMark({ className = '' }) {
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
  surface,
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
  const resolvedSurface = surface || (light ? 'dark' : 'adaptive')
  const wordmarkSrc = resolvedSurface === 'light' ? '/logo-light.png' : '/logo.png'

  return (
    <Link
      to={destination}
      className={`inline-flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`}
      aria-label="Replyfy"
    >
      {resolvedSurface === 'adaptive' ? (
        <>
          <img
            src="/logo.png"
            alt="Replyfy"
            className={`replyfy-logo-adaptive replyfy-logo-dark object-contain object-left ${imageSizes[resolvedSize]}`}
            style={alignArtwork ? { marginLeft: '-0.8rem' } : undefined}
            draggable={false}
          />
          <img
            src="/logo-light.png"
            alt=""
            className={`replyfy-logo-adaptive replyfy-logo-light object-contain object-left ${imageSizes[resolvedSize]}`}
            style={alignArtwork ? { marginLeft: '-0.8rem' } : undefined}
            aria-hidden
            draggable={false}
          />
        </>
      ) : (
        <img
          src={wordmarkSrc}
          alt="Replyfy"
          className={`object-contain object-left ${imageSizes[resolvedSize]}`}
          style={alignArtwork ? { marginLeft: '-0.8rem' } : undefined}
          draggable={false}
        />
      )}
    </Link>
  )
}
