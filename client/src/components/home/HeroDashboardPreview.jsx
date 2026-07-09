import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowUp, Paperclip, Maximize2, X } from 'lucide-react'
import { getQuestionPlaceholder } from '../../utils/questionPrompts'

const FRAME_W = 1080
const FRAME_H = 680

const categories = ['Startup', 'Finance', 'Legal', 'Marketing', 'Engineering', 'Career', 'Product', 'Other']

const expertTypesByCategory = {
  Startup: ['Founder', 'Co-Founder', 'Angel Investor', 'VC Mentor'],
  Finance: ['CA', 'CFO', 'Tax Consultant', 'Investment Banker'],
  Legal: ['Lawyer', 'Compliance Expert', 'IP Attorney', 'Contract Specialist'],
  Marketing: ['Growth Marketer', 'Brand Strategist', 'Performance Marketer', 'Content Lead'],
  Engineering: ['Tech Lead', 'CTO Mentor', 'DevOps Expert', 'Security Architect'],
  Career: ['Career Coach', 'HR Leader', 'Interview Mentor', 'Leadership Coach'],
  Product: ['Product Manager', 'UX Lead', 'Product Strategist', 'Growth PM'],
  Other: ['Industry Expert', 'Consultant', 'Mentor', 'Advisor'],
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
      setScale(Math.min(width / FRAME_W, height / FRAME_H))
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
      setScale(Math.min(maxW / FRAME_W, maxH / FRAME_H, 1.25))
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [enabled])

  return scale
}

function stopPropagation(e) {
  e.stopPropagation()
}

function PreviewChrome({ hint, onFullscreen, fullscreenActive }) {
  return (
    <div className="flex h-[34px] shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#111] px-4">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-2 text-[10px] text-white/35">replyfy.app/dashboard</span>
      <span className="ml-auto hidden text-[10px] text-white/30 sm:inline">{hint}</span>
      <button
        type="button"
        onClick={(e) => {
          stopPropagation(e)
          onFullscreen()
        }}
        className="ml-1 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-white/45 transition hover:bg-white/10 hover:text-white/80"
        aria-label={fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen'}
        title={fullscreenActive ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {fullscreenActive ? <X size={12} /> : <Maximize2 size={12} />}
        <span className="hidden md:inline">{fullscreenActive ? 'Exit' : 'Fullscreen'}</span>
      </button>
    </div>
  )
}

function DashboardPreviewBody({
  category,
  setCategory,
  expertTypes,
  expertType,
  setExpertType,
  query,
  setQuery,
  placeholder,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas px-12 pb-7 pt-16">
      <div className="text-center">
        <h3 className="text-4xl font-semibold leading-[1.12] tracking-tight text-ink">
          Your question,
          <br />
          <span className="font-light text-muted">answered by a human.</span>
        </h3>
        <p className="mx-auto mt-3 max-w-[640px] text-sm leading-relaxed text-muted">
          Real experts — founders, CAs, mentors — read your question and reply personally.
          Within 12 hrs.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" onClick={stopPropagation}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === cat
                ? 'bg-primary text-primary-fg'
                : 'border border-border bg-card text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        className="mt-6 shrink-0 overflow-hidden rounded-xl border border-border bg-card"
        onClick={stopPropagation}
      >
        <div className="flex flex-col p-3">
          <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-border pb-2">
            <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
              Expert
            </span>
            {expertTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setExpertType(type)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  expertType === type
                    ? 'bg-surface text-ink underline decoration-white/80 decoration-2 underline-offset-4'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <textarea
            key={`${category}-${expertType}`}
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
            <Link
              to="/signup"
              onClick={stopPropagation}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg transition hover:bg-white/90"
            >
              <Sparkles size={14} />
              Ask expert
              <ArrowUp size={14} />
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-3 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-light">
        Suggested for {category} · {expertType}
      </p>
    </div>
  )
}

function PreviewFrame({
  scale,
  hint,
  fullscreenActive,
  onOpenFullscreen,
  onFrameClick,
  frameClassName = '',
  children,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFrameClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFrameClick()
        }
      }}
      className={`overflow-hidden rounded-2xl border border-white/15 bg-[#202222] outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${frameClassName}`}
      style={{
        width: FRAME_W * scale,
        height: FRAME_H * scale,
      }}
    >
      <div
        className="flex origin-top-left flex-col bg-[#1A1C1C]"
        style={{
          width: FRAME_W,
          height: FRAME_H,
          transform: `scale(${scale})`,
        }}
      >
        <PreviewChrome hint={hint} onFullscreen={onOpenFullscreen} fullscreenActive={fullscreenActive} />
        {children}
      </div>
    </div>
  )
}

export default function HeroDashboardPreview() {
  const containerRef = useRef(null)
  const scale = useFrameScale(containerRef)
  const fullscreenScale = useViewportFrameScale(true)
  const [category, setCategory] = useState('Startup')
  const [expertType, setExpertType] = useState('Founder')
  const [query, setQuery] = useState('')
  const [hovered, setHovered] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const expertTypes = expertTypesByCategory[category] || expertTypesByCategory.Other
  const placeholder = getQuestionPlaceholder(
    { name: category, slug: category.toLowerCase() },
    { name: expertType, slug: expertType.toLowerCase().replace(/\s+/g, '-') }
  )

  const hoverScale = hovered && !fullscreen ? 1.05 : 1

  const openFullscreen = () => setFullscreen(true)
  const closeFullscreen = () => setFullscreen(false)
  const toggleFullscreen = () => setFullscreen((prev) => !prev)

  useEffect(() => {
    if (!expertTypes.includes(expertType)) {
      setExpertType(expertTypes[0])
    }
  }, [category, expertType, expertTypes])

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
  }

  return (
    <>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full w-full items-center justify-center"
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
          <PreviewFrame
            scale={scale}
            hint="Hover to zoom · Click for fullscreen"
            fullscreenActive={false}
            onOpenFullscreen={openFullscreen}
            onFrameClick={openFullscreen}
            frameClassName="cursor-zoom-in"
          >
            <DashboardPreviewBody {...previewProps} />
          </PreviewFrame>
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
                <p className="text-sm text-white/55">Interactive dashboard preview</p>
                <button
                  type="button"
                  onClick={(e) => {
                    stopPropagation(e)
                    closeFullscreen()
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  <X size={16} />
                  Exit fullscreen
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                onClick={stopPropagation}
                className="shadow-[0_40px_120px_rgba(0,0,0,0.75)]"
              >
                <PreviewFrame
                  scale={fullscreenScale}
                  hint="Press Esc to exit"
                  fullscreenActive
                  onOpenFullscreen={toggleFullscreen}
                  onFrameClick={() => {}}
                >
                  <DashboardPreviewBody {...previewProps} />
                </PreviewFrame>
              </motion.div>

              <p className="mt-4 text-xs text-white/40">Esc · click outside · or Exit to return</p>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
