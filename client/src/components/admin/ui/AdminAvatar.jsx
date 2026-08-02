export default function AdminAvatar({
  src,
  name = '?',
  size = 'md',
  className = '',
  verified = false,
}) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-14 w-14 text-lg',
  }
  const initials = String(name)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt=""
          className={`${sizes[size]} rounded-2xl object-cover ring-2 ring-white shadow-sm`}
        />
      ) : (
        <span
          className={`flex ${sizes[size]} items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] font-semibold text-white shadow-sm ring-2 ring-white`}
        >
          {initials}
        </span>
      )}
      {verified ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4F46E5] text-white ring-2 ring-white"
          title="Verified"
          aria-label="Verified"
        >
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden>
            <path d="M2.5 6.2 4.8 8.5 9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}
    </span>
  )
}
