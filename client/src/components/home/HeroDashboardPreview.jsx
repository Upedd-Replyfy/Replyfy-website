import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowUp, Paperclip } from 'lucide-react'

const FRAME_W = 1080
const FRAME_H = 680

const categories = ['Startup', 'Finance', 'Legal', 'Marketing', 'Engineering', 'Career', 'Product', 'Other']
const expertTypes = ['Founder', 'Co-Founder', 'Angel Investor', 'VC Mentor']

const placeholders = {
  Startup: 'Ask a founder about validation, co-founders, incorporation, or early-stage strategy...',
  Finance: 'Ask about taxes, bookkeeping, fundraising terms, or financial planning...',
  Legal: 'Ask about contracts, incorporation, compliance, or IP protection...',
  Marketing: 'Ask about growth strategy, positioning, channels, or brand building...',
  Engineering: 'Ask about architecture, hiring, tech stack, or scaling your team...',
  Career: 'Ask about career moves, interviews, leadership, or skill development...',
  Product: 'Ask about roadmap, user research, prioritization, or product-market fit...',
  Other: 'Describe your question in detail — a verified expert will respond personally...',
}

function useFrameScale(containerRef) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

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
  }, [])

  return scale
}

function stopZoomToggle(e) {
  e.stopPropagation()
}

export default function HeroDashboardPreview() {
  const containerRef = useRef(null)
  const scale = useFrameScale(containerRef)
  const [category, setCategory] = useState('Startup')
  const [expertType, setExpertType] = useState('Founder')
  const [query, setQuery] = useState('')
  const [hovered, setHovered] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const zoomScale = zoomed ? 1.14 : hovered ? 1.05 : 1

  useEffect(() => {
    if (!zoomed) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setZoomed(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [zoomed])

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex h-full w-full items-center justify-center ${zoomed ? 'z-30' : 'z-10'}`}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-pressed={zoomed}
        aria-label={zoomed ? 'Zoom out dashboard preview' : 'Zoom in dashboard preview'}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => setZoomed((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setZoomed((prev) => !prev)
          }
        }}
        animate={{
          scale: zoomScale,
          boxShadow: zoomed
            ? '0 32px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)'
            : hovered
              ? '0 28px 72px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1)'
              : '0 20px 60px rgba(0,0,0,0.55)',
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="cursor-zoom-in overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a0a] outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        style={{
          width: FRAME_W * scale,
          height: FRAME_H * scale,
          cursor: zoomed ? 'zoom-out' : 'zoom-in',
        }}
      >
        <div
          className="flex origin-top-left flex-col bg-black"
          style={{
            width: FRAME_W,
            height: FRAME_H,
            transform: `scale(${scale})`,
          }}
        >
          <div className="flex h-[34px] shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#111] px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[10px] text-white/35">replyfy.app/dashboard</span>
            <span className="ml-auto text-[10px] text-white/30">
              {zoomed ? 'Click to zoom out' : 'Hover or click to zoom'}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas px-12 py-7">
            <div className="text-center">
              <h3 className="text-xl font-semibold leading-[1.2] tracking-tight text-ink sm:text-[1.35rem]">
                Your question,
                <br />
                <span className="font-light text-muted">answered by a human.</span>
              </h3>
              <p className="mx-auto mt-3 max-w-[640px] text-[13px] leading-relaxed text-muted">
                Real experts — founders, CAs, mentors — read your question and reply personally.
                Within 24–48 hours.
              </p>
            </div>

            <div className="mt-8 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-fg">
                <Sparkles size={16} strokeWidth={2} />
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight text-ink">
                  What would you like help with today?
                </p>
                <p className="mt-1 text-sm text-muted">
                  Describe your question. A verified human expert — not AI — will respond.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2" onClick={stopZoomToggle}>
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
              className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card"
              onClick={stopZoomToggle}
            >
              <div className="flex min-h-0 flex-1 flex-col p-4">
                <div className="mb-3 flex flex-wrap items-center gap-1 border-b border-border pb-2">
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
                          : 'text-muted'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholders[category]}
                  className="min-h-[100px] w-full flex-1 resize-none bg-transparent text-sm leading-relaxed text-ink placeholder:text-muted-light focus:outline-none"
                />

                <div className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Paperclip size={15} className="shrink-0 text-muted" />
                    {['PDF', 'Resume', 'Pitch Deck', 'Financial Docs', 'Link'].map((label) => (
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
              Suggested for {category}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
