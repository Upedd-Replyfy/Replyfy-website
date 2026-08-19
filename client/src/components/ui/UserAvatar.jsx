import { useEffect, useState } from 'react'

function initialsFrom(name = '?') {
  return (
    String(name)
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  )
}

const SIZE = {
  xs: 'h-8 w-8 text-[10px]',
  sm: 'h-9 w-9 text-[11px]',
  md: 'h-11 w-11 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-lg',
}

/**
 * Loads a profile photo when present. Falls back to initials if the URL is
 * missing or the image fails (common with Google avatars blocked by referrer).
 */
export default function UserAvatar({ src, name = 'User', size = 'md', className = '', rounded = 'full' }) {
  const [failed, setFailed] = useState(false)
  const photo = String(src || '').trim()
  const showPhoto = Boolean(photo) && !failed
  const sizeClass = SIZE[size] || SIZE.md
  const roundClass = rounded === 'xl' ? 'rounded-xl' : 'rounded-full'

  useEffect(() => {
    setFailed(false)
  }, [photo])

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden bg-surface ring-2 ring-white/80 shadow-sm ${sizeClass} ${roundClass} ${className}`}
      aria-hidden={!name}
    >
      {showPhoto ? (
        <img
          src={photo}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${roundClass}`}
        />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500 to-violet-600 font-bold tracking-tight text-white ${roundClass}`}
        >
          {initialsFrom(name)}
        </span>
      )}
    </span>
  )
}
