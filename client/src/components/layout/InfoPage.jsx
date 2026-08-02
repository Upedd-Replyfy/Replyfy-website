export default function InfoPage({ eyebrow, title, lead, children, wide = false, theme = 'dark' }) {
  const light = theme === 'light'

  return (
    <div className={light ? 'bg-[#F8FAFC]' : undefined}>
      <div
        className={`mx-auto px-4 py-14 sm:px-6 sm:py-16 lg:px-8 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}
      >
        {eyebrow ? (
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${
              light ? 'text-sky-600' : 'text-sky-300/90'
            }`}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${
            light ? 'text-slate-900' : 'text-white'
          }`}
        >
          {title}
        </h1>
        {lead ? (
          <p
            className={`mt-4 text-base leading-relaxed sm:text-lg ${
              light ? 'text-slate-600' : 'text-zinc-400'
            }`}
          >
            {lead}
          </p>
        ) : null}
        <div
          className={`mt-8 space-y-6 text-sm leading-relaxed sm:text-[15px] ${
            light ? 'text-slate-600' : 'text-zinc-300'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
