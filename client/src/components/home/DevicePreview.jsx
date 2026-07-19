import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'

export const LAPTOP_FRAME_W = 1080
export const LAPTOP_FRAME_H = 680

/** Slightly shorter than a real phone so a wide device still fits the hero */
const PHONE_ASPECT = 9 / 17.2

function stopPropagation(e) {
  e.stopPropagation()
}

function LaptopChrome({ hint, onFullscreen, fullscreenActive, path = 'dashboard' }) {
  return (
    <div className="flex h-[34px] shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#171818] px-4">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-2 text-[10px] text-white/35">replyfy.app/{path}</span>
      <span className="ml-auto hidden text-[10px] text-white/30 sm:inline">{hint}</span>
      <button
        type="button"
        onClick={(e) => {
          stopPropagation(e)
          onFullscreen()
        }}
        className="ml-1 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-white/45 transition hover:bg-white/10 hover:text-white/80"
        aria-label={fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {fullscreenActive ? <X size={12} /> : <Maximize2 size={12} />}
        <span className="hidden lg:inline">{fullscreenActive ? 'Exit' : 'Fullscreen'}</span>
      </button>
    </div>
  )
}

export function LaptopPreview({
  scale,
  hint,
  path,
  fullscreenActive = false,
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
        const tag = e.target?.tagName
        if (
          tag === 'TEXTAREA' ||
          tag === 'INPUT' ||
          tag === 'BUTTON' ||
          tag === 'SELECT' ||
          e.target?.isContentEditable
        ) {
          return
        }
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFrameClick?.()
        }
      }}
      className={`overflow-hidden rounded-2xl border border-white/15 bg-[#171818] outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${frameClassName}`}
      style={{
        width: LAPTOP_FRAME_W * scale,
        height: LAPTOP_FRAME_H * scale,
      }}
    >
      <div
        className="flex origin-top-left flex-col bg-[#171818]"
        style={{
          width: LAPTOP_FRAME_W,
          height: LAPTOP_FRAME_H,
          transform: `scale(${scale})`,
        }}
      >
        <LaptopChrome
          hint={hint}
          path={path}
          onFullscreen={onOpenFullscreen}
          fullscreenActive={fullscreenActive}
        />
        {children}
      </div>
    </div>
  )
}

export const LaptopDevicePreview = LaptopPreview

/**
 * Prefer ~94% viewport width. Only shrink if height truly cannot fit.
 */
function usePhoneFit(containerRef) {
  const [size, setSize] = useState({ width: 360, height: 688 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    const update = () => {
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight

      // Big, premium phone — ~94vw
      const targetW = Math.min(vw * 0.94, rect.width || vw * 0.94, 420)
      const availableH = Math.max(
        rect.height || 0,
        Math.min(vh * 0.7, 760)
      )

      let width = targetW
      let height = width / PHONE_ASPECT

      // Soft cap: allow phone to use most of the preview slot
      const maxH = Math.max(availableH * 0.98, vh * 0.58)
      if (height > maxH) {
        height = maxH
        width = height * PHONE_ASPECT
        // Still keep it wide — never go below ~82vw unless viewport is tiny
        const minW = Math.min(vw * 0.82, 300)
        if (width < minW && minW / PHONE_ASPECT <= maxH * 1.05) {
          width = minW
          height = width / PHONE_ASPECT
        }
      }

      setSize({
        width: Math.round(width),
        height: Math.round(height),
      })
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [containerRef])

  return size
}

/**
 * Premium smartphone frame — thin bezel, Dynamic Island notch.
 * Does not trap page scroll on touch devices (hero-safe).
 */
export function PhonePreview({
  onOpenFullscreen,
  children,
  className = '',
  theme = 'dark',
  allowInnerScroll = false,
}) {
  const containerRef = useRef(null)
  const { width, height } = usePhoneFit(containerRef)

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full touch-pan-y items-center justify-center ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[48%] h-[70%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.2)_0%,transparent_65%)] blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 touch-pan-y"
        style={{ width, height }}
      >
        <div className="relative h-full w-full touch-pan-y" aria-label="Mobile app preview">
          <div className="absolute inset-0 rounded-[2.6rem] bg-[#1a1a1b] p-[3px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85),0_0_40px_-8px_rgba(56,189,248,0.2)]">
            <div className="relative h-full w-full overflow-hidden rounded-[2.45rem] bg-black ring-1 ring-white/10">
              <div
                className="dashboard-shell absolute inset-0 flex flex-col overflow-hidden rounded-[2.45rem] bg-canvas"
                data-theme={theme}
              >
                <div className="relative z-30 flex h-14 shrink-0 items-center justify-between px-5 pt-2">
                  <span className="z-10 w-10 text-[11px] font-semibold tabular-nums text-ink">
                    9:41
                  </span>
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-3 z-20 h-[26px] w-[100px] -translate-x-1/2 rounded-full bg-black"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      stopPropagation(e)
                      onOpenFullscreen?.()
                    }}
                    className="z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted"
                    aria-label="Expand preview"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>

                {/* Extra top breathing room below notch */}
                <div
                  className={`min-h-0 flex-1 touch-pan-y pt-3 ${
                    allowInnerScroll ? 'overflow-y-auto overscroll-contain' : 'overflow-hidden'
                  }`}
                >
                  {children}
                </div>

                <div className="flex h-6 shrink-0 items-end justify-center pb-2" aria-hidden>
                  <span className="h-[4px] w-[108px] rounded-full bg-ink/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export const PhoneDevicePreview = PhonePreview

export default function DevicePreview({ variant = 'laptop', ...props }) {
  if (variant === 'phone') return <PhonePreview {...props} />
  return <LaptopPreview {...props} />
}
