import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowUp, Paperclip, Moon, Sun, X } from 'lucide-react'
import { getQuestionPlaceholder } from '../../utils/questionPrompts'
import { clearQuestionDraft, loadQuestionDraft, saveQuestionDraft } from '../../utils/questionDraft'
import Auth from '../../pages/Auth'
import { LAPTOP_FRAME_W, LAPTOP_FRAME_H, LaptopPreview, PhonePreview } from './DevicePreview'

const PREVIEW_THEME_KEY = 'replyfy-preview-theme'

const categories = [
  'Startup',
  'Finance',
  'Legal',
  'Marketing',
  'Engineering',
  'Career',
  'Product',
  'Other',
]

const expertTypesByCategory = {
  Startup: ['Founder', 'Co-Founder', 'Angel Investor', 'VC Mentor'],
  Finance: ['CA', 'CFO', 'Tax Consultant', 'Investment Banker'],
  Legal: ['Lawyer', 'Compliance Mentor', 'IP Attorney', 'Contract Specialist'],
  Marketing: ['Growth Marketer', 'Brand Strategist', 'Performance Marketer', 'Content Lead'],
  Engineering: ['Tech Lead', 'CTO Mentor', 'DevOps Mentor', 'Security Architect'],
  Career: ['Career Coach', 'HR Leader', 'Interview Mentor', 'Leadership Coach'],
  Product: ['Product Manager', 'UX Lead', 'Product Strategist', 'Growth PM'],
  Other: ['Industry Mentor', 'Consultant', 'Mentor', 'Advisor'],
}

function useFrameScale(containerRef, enabled = true) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!enabled) return undefined
    const el = containerRef.current
    if (!el) return undefined

    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      setScale(Math.min(width / LAPTOP_FRAME_W, height / LAPTOP_FRAME_H))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [containerRef, enabled])

  return scale
}

function useViewportFrameScale(enabled) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!enabled) return undefined

    const update = () => {
      const padding = 48
      const maxW = window.innerWidth - padding * 2
      const maxH = window.innerHeight - padding * 2 - 56
      setScale(Math.min(maxW / LAPTOP_FRAME_W, maxH / LAPTOP_FRAME_H, 1.25))
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [enabled])

  return scale
}

function useCanHover() {
  const [canHover, setCanHover] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setCanHover(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return canHover
}

function stopPropagation(e) {
  e.stopPropagation()
}

function DesktopDashboardBody(props) {
  const {
    category,
    setCategory,
    expertTypes,
    expertType,
    setExpertType,
    query,
    setQuery,
    placeholder,
    onAuthOpen,
    theme,
    onToggleTheme,
  } = props
  const isLight = theme === 'light'

  return (
    <div
      className="dashboard-shell flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas px-12 pb-7 pt-12"
      data-theme={theme}
    >
      <div className="mb-4 flex justify-end" onClick={stopPropagation}>
        <button
          type="button"
          onClick={(e) => {
            stopPropagation(e)
            onToggleTheme()
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted shadow-[var(--shadow-luxury-sm)] transition hover:bg-surface hover:text-ink"
          aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
          <span>{isLight ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      <div className="text-center">
        <h3 className="text-4xl font-semibold leading-[1.12] tracking-tight text-ink">
          Your question,
          <br />
          <span className="font-light text-muted">answered </span>
          <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text font-semibold text-transparent">
            by a human.
          </span>
        </h3>
        <p className="mx-auto mt-3 max-w-[640px] text-sm leading-relaxed text-muted">
          Real mentors — founders, CAs, advisors — read your question and reply personally. Within
          12 hrs.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" onClick={stopPropagation}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat)
              setExpertType(expertTypesByCategory[cat]?.[0] || expertTypesByCategory.Other[0])
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === cat
                ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-sm'
                : 'border border-border bg-card text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        className="mt-6 shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-luxury-sm)]"
        onClick={stopPropagation}
      >
        <div className="flex flex-col p-3">
          <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-border pb-2">
            <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
              Mentor
            </span>
            {expertTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setExpertType(type)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  expertType === type
                    ? 'bg-gradient-to-r from-sky-500/15 to-violet-500/15 text-ink underline decoration-2 underline-offset-4 decoration-violet-500'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <textarea
            key={`${category}-${expertType}-desktop`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="h-[72px] w-full resize-none bg-transparent text-sm leading-relaxed text-ink placeholder:text-muted-light focus:outline-none"
          />

          <div className="mt-2 flex shrink-0 items-center justify-between gap-3 border-t border-border pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <Paperclip size={15} className="shrink-0 text-muted" />
              {['PDF', 'Files', 'Links'].map((label) => (
                <button
                  key={label}
                  type="button"
                  className="text-xs font-medium text-muted transition hover:text-ink"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => {
                stopPropagation(e)
                onAuthOpen('login')
              }}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition ${
                isLight ? 'hover:bg-black/85' : 'hover:bg-white/90'
              }`}
            >
              <Sparkles size={14} />
              Ask mentor
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
        Suggested for {category} · {expertType}
      </p>
    </div>
  )
}

/** Mirrors real QuestionComposer / user dashboard at mobile density */
function MobileAppScreen({
  category,
  setCategory,
  expertTypes,
  expertType,
  setExpertType,
  query,
  setQuery,
  placeholder,
  onAuthOpen,
  theme,
  onToggleTheme,
}) {
  const isLight = theme === 'light'

  return (
    <div
      className="dashboard-shell flex h-full min-h-0 w-full flex-col overflow-hidden bg-canvas touch-pan-y"
      data-theme={theme}
      onClick={stopPropagation}
    >
      <div className="flex shrink-0 justify-end px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={(e) => {
            stopPropagation(e)
            onToggleTheme()
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted"
          aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {isLight ? <Moon size={12} /> : <Sun size={12} />}
        </button>
      </div>

      <div className="shrink-0 px-3.5 pb-3 text-center">
        <h3 className="text-balance text-[1.05rem] font-semibold leading-snug tracking-tight text-ink">
          Your question,
          <br />
          <span className="font-light text-muted">answered </span>
          <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text font-semibold text-transparent">
            by a human.
          </span>
        </h3>
        <p className="mx-auto mt-1.5 max-w-[30ch] text-[10px] leading-snug text-muted">
          Real mentors reply personally — within 12 hrs.
        </p>
      </div>

      <div className="shrink-0 px-3.5 pb-2">
        <p className="text-sm font-semibold tracking-tight text-ink">
          Hey!{' '}
          <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
            there
          </span>
        </p>
        <p className="mt-0.5 text-[10px] text-muted">AI Gives Information. Humans Give Judgment.</p>
      </div>

      <div className="flex shrink-0 gap-1.5 overflow-x-auto touch-pan-x px-3.5 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat)
              setExpertType(expertTypesByCategory[cat]?.[0] || expertTypesByCategory.Other[0])
            }}
            className={`inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] font-medium transition ${
              category === cat
                ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-sm'
                : 'border border-border bg-card text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mx-3 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-luxury-sm)]">
        <div className="flex shrink-0 items-center gap-0.5 overflow-x-auto touch-pan-x border-b border-border px-2 py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="mr-1 shrink-0 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-light">
            Mentor
          </span>
          {expertTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setExpertType(type)}
              className={`inline-flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-medium transition ${
                expertType === type
                  ? 'bg-gradient-to-r from-sky-500/15 to-violet-500/15 text-ink underline decoration-violet-500 decoration-2 underline-offset-2'
                  : 'text-muted'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <textarea
          key={`${category}-${expertType}-mobile`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="min-h-[56px] w-full flex-1 resize-none touch-pan-y bg-transparent px-2.5 py-2 text-xs leading-relaxed text-ink placeholder:text-muted-light focus:outline-none"
        />

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-2 py-2">
          <div className="flex items-center gap-2">
            <Paperclip size={13} className="text-muted" />
            {['PDF', 'Files', 'Links'].map((label) => (
              <button key={label} type="button" className="text-[10px] font-medium text-muted">
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => {
              stopPropagation(e)
              onAuthOpen('login')
            }}
            className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-2.5 text-[11px] font-semibold text-primary-fg"
          >
            <Sparkles size={12} />
            Ask mentor
            <ArrowUp size={12} />
          </button>
        </div>
      </div>

      <p className="shrink-0 px-3 pb-1 pt-0.5 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-light">
        Suggested for {category} · {expertType}
      </p>
    </div>
  )
}

export default function HeroDashboardPreview() {
  const containerRef = useRef(null)
  const scale = useFrameScale(containerRef)
  const fullscreenScale = useViewportFrameScale(true)
  const canHover = useCanHover()
  const [category, setCategory] = useState(() => {
    const name = loadQuestionDraft()?.categoryName
    return categories.includes(name) ? name : 'Startup'
  })
  const [expertType, setExpertType] = useState(() => {
    const draft = loadQuestionDraft()
    const cat = categories.includes(draft?.categoryName) ? draft.categoryName : 'Startup'
    const types = expertTypesByCategory[cat] || expertTypesByCategory.Other
    if (draft?.expertTypeName && types.includes(draft.expertTypeName)) return draft.expertTypeName
    return types[0]
  })
  const [query, setQuery] = useState(() => {
    const draft = loadQuestionDraft()
    return draft?.query?.trim() ? draft.query : ''
  })
  const [hovered, setHovered] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [authMode, setAuthMode] = useState(null)
  const [isNarrow, setIsNarrow] = useState(false)
  const [previewTheme, setPreviewTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem(PREVIEW_THEME_KEY) === 'dark' ? 'dark' : 'light'
  })

  const expertTypes = expertTypesByCategory[category] || expertTypesByCategory.Other
  const placeholder = getQuestionPlaceholder(
    { name: category, slug: category.toLowerCase() },
    { name: expertType, slug: expertType.toLowerCase().replace(/\s+/g, '-') }
  )

  const hoverScale = canHover && hovered && !fullscreen ? 1.05 : 1

  const openFullscreen = () => setFullscreen(true)
  const openAuth = (mode) => {
    if (query.trim()) {
      saveQuestionDraft({ query, categoryName: category, expertTypeName: expertType })
    }
    setAuthMode(mode)
    setFullscreen(true)
  }
  const closeFullscreen = () => {
    setFullscreen(false)
    setAuthMode(null)
  }
  const toggleFullscreen = () => setFullscreen((prev) => !prev)
  const togglePreviewTheme = () => {
    setPreviewTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      localStorage.setItem(PREVIEW_THEME_KEY, next)
      return next
    })
  }

  useEffect(() => {
    const update = () => setIsNarrow(window.innerWidth < 1024)
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (query.trim()) {
      saveQuestionDraft({ query, categoryName: category, expertTypeName: expertType })
    } else {
      clearQuestionDraft()
    }
  }, [query, category, expertType])

  useEffect(() => {
    if (!fullscreen) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeFullscreen()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [fullscreen])

  const previewProps = {
    category,
    setCategory,
    expertTypes,
    expertType,
    setExpertType,
    query,
    setQuery,
    placeholder,
    onAuthOpen: openAuth,
    theme: previewTheme,
    onToggleTheme: togglePreviewTheme,
  }

  const fullscreenContent = authMode ? (
    <Auth key={authMode} initialMode={authMode} embedded onClose={() => setAuthMode(null)} />
  ) : isNarrow ? (
    <MobileAppScreen {...previewProps} />
  ) : (
    <DesktopDashboardBody {...previewProps} />
  )

  return (
    <>
      <div className="relative z-10 h-full w-full lg:hidden">
        <PhonePreview
          theme={previewTheme}
          onOpenFullscreen={openFullscreen}
        >
          <MobileAppScreen {...previewProps} />
        </PhonePreview>
      </div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 hidden h-full w-full items-center justify-center lg:flex"
      >
        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          animate={{
            scale: hoverScale,
            boxShadow: hovered
              ? '0 28px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1)'
              : '0 20px 60px rgba(0,0,0,0.55)',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="cursor-pointer"
        >
          <LaptopPreview
            scale={scale}
            hint="Hover to zoom · Click for fullscreen"
            fullscreenActive={false}
            onOpenFullscreen={openFullscreen}
            onFrameClick={openFullscreen}
            frameClassName="cursor-zoom-in"
          >
            <DesktopDashboardBody {...previewProps} />
          </LaptopPreview>
        </motion.div>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {fullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/92 px-4 py-6 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard preview fullscreen"
              onClick={closeFullscreen}
            >
              <div className="mb-4 flex w-full max-w-6xl items-center justify-between gap-4">
                <p className="text-sm text-white/55">
                  {authMode ? 'Replyfy account' : 'Interactive dashboard preview'}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    stopPropagation(e)
                    closeFullscreen()
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white"
                >
                  <X size={16} />
                  Exit
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                onClick={stopPropagation}
              >
                {isNarrow && !authMode ? (
                  <div className="h-[min(84svh,740px)] w-[min(94vw,420px)]">
                    <PhonePreview
                      theme={previewTheme}
                      allowInnerScroll
                      onOpenFullscreen={toggleFullscreen}
                    >
                      {fullscreenContent}
                    </PhonePreview>
                  </div>
                ) : authMode && isNarrow ? (
                  <div className="max-h-[min(88dvh,720px)] w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-white/10 bg-[#EEF0F3]">
                    <div className="max-h-[min(88dvh,720px)] overflow-y-auto">{fullscreenContent}</div>
                  </div>
                ) : (
                  <LaptopPreview
                    scale={fullscreenScale}
                    hint={authMode ? `replyfy.app/${authMode}` : 'Press Esc to exit'}
                    path={authMode || 'dashboard'}
                    fullscreenActive
                    onOpenFullscreen={toggleFullscreen}
                    onFrameClick={() => {}}
                  >
                    {fullscreenContent}
                  </LaptopPreview>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
