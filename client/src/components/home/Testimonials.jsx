import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SectionHeader from '../ui/SectionHeader'

const SNAP_SPRING = { type: 'spring', stiffness: 260, damping: 28, mass: 0.85 }
const ROTATE_MS = 5200
const VISIBLE_RANGE = 2

const testimonials = [
  {
    quote:
      'I spent weeks researching incorporation options. One answer from Replyfy gave me more clarity than 20 blog posts.',
    name: 'Ananya R.',
    role: 'Founder, pre-seed startup',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop&crop=faces',
  },
  {
    quote:
      'The mentor actually read my full question and addressed my specific situation. Felt like a $500 consultation for a fraction of the price.',
    name: 'Rahul M.',
    role: 'Product Manager',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&crop=faces',
  },
  {
    quote:
      'We used Replyfy before our Series A to sanity-check our cap table. The response was detailed, practical, and actionable.',
    name: 'Sarah K.',
    role: 'COO, Series A startup',
    image:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop&crop=faces',
  },
  {
    quote:
      'As a first-time founder, legal questions used to freeze me. Replyfy matched me with someone who had done this before — game changer.',
    name: 'Dev P.',
    role: 'Solo founder',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=1000&fit=crop&crop=faces',
  },
  {
    quote:
      'Clear, human answers without the agency fluff. We now use Replyfy for marketing and hiring decisions every quarter.',
    name: 'Meera S.',
    role: 'Head of Growth',
    image:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1000&fit=crop&crop=faces',
  },
  {
    quote:
      'The turnaround was under 12 hours and the advice paid for itself in one meeting. Highly recommend for operators.',
    name: 'James L.',
    role: 'Ops lead, B2B SaaS',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop&crop=faces',
  },
]

function getOffset(index, activeIndex, total) {
  let offset = index - activeIndex
  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total
  return offset
}

function getLayout(offset, isMobile) {
  const step = isMobile ? 195 : 300
  const centerWidth = isMobile ? 300 : 400
  const sideWidth = isMobile ? 240 : 300
  const farWidth = isMobile ? 200 : 260
  const abs = Math.abs(offset)

  if (offset === 0) {
    return {
      x: 0,
      width: centerWidth,
      scale: 1.04,
      opacity: 1,
      blur: 0,
      zIndex: 40,
      rotateY: 0,
    }
  }

  if (abs === 1) {
    return {
      x: Math.sign(offset) * step,
      width: sideWidth,
      scale: 0.88,
      opacity: 0.78,
      blur: 2.5,
      zIndex: 25,
      rotateY: Math.sign(offset) * -8,
    }
  }

  if (abs === 2) {
    return {
      x: Math.sign(offset) * step * 1.85,
      width: farWidth,
      scale: 0.76,
      opacity: 0.42,
      blur: 6,
      zIndex: 10,
      rotateY: Math.sign(offset) * -14,
    }
  }

  return {
    x: Math.sign(offset) * step * 2.5,
    width: farWidth,
    scale: 0.65,
    opacity: 0,
    blur: 10,
    zIndex: 0,
    rotateY: 0,
  }
}

function TestimonialCard({ item, isCenter }) {
  return (
    <blockquote className="group relative h-[360px] overflow-hidden rounded-[22px] border border-black/10 md:h-[400px]">
      <img
        src={item.image}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
          isCenter ? 'grayscale-0 scale-100' : 'grayscale scale-[1.02]'
        } group-hover:scale-105 group-hover:grayscale-0`}
        draggable={false}
      />

      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
      <div
        aria-hidden
        className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10"
      />

      <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-6">
        <p
          className={`leading-relaxed text-white ${
            isCenter ? 'text-sm md:text-[15px]' : 'line-clamp-4 text-xs md:text-[13px]'
          }`}
        >
          &ldquo;{item.quote}&rdquo;
        </p>

        <footer className="mt-4 border-t border-white/20 pt-3">
          <cite className="not-italic text-sm font-semibold text-white">{item.name}</cite>
          <p className="mt-0.5 text-[11px] text-white/65">{item.role}</p>
        </footer>
      </div>
    </blockquote>
  )
}

function CarouselCard({ item, layout, isCenter, onSelect, reduceMotion }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 gpu-layer"
      style={{
        zIndex: layout.zIndex,
        y: '-50%',
        translateX: '-50%',
        perspective: 1200,
        willChange: reduceMotion ? 'auto' : 'transform, filter, opacity',
      }}
      animate={{
        width: layout.width,
        x: layout.x,
        scale: layout.scale,
        opacity: layout.opacity,
        rotateY: layout.rotateY,
        filter: `blur(${layout.blur}px)`,
      }}
      transition={reduceMotion ? { duration: 0 } : SNAP_SPRING}
      onClick={onSelect}
    >
      <div
        className={`overflow-hidden rounded-[22px] transition-shadow duration-500 ${
          !isCenter ? 'cursor-pointer' : ''
        }`}
        style={{
          boxShadow: isCenter
            ? '0 28px 70px rgba(15,23,42,0.16), 0 0 0 1px rgba(15,23,42,0.04)'
            : '0 14px 40px rgba(15,23,42,0.08)',
        }}
      >
        <TestimonialCard item={item} isCenter={isCenter} />
      </div>
    </motion.div>
  )
}

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragHint, setDragHint] = useState(0)
  const containerRef = useRef(null)
  const dragStartX = useRef(null)
  const isInView = useInView(containerRef, { amount: 0.2 })
  const total = testimonials.length

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768)
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  const goTo = useCallback(
    (index) => {
      if (!total || isAnimating) return
      const nextIndex = ((index % total) + total) % total
      if (nextIndex === activeIndex) return
      setIsAnimating(true)
      setActiveIndex(nextIndex)
      window.setTimeout(() => setIsAnimating(false), 520)
    },
    [activeIndex, total, isAnimating]
  )

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (!isInView || !total || dragStartX.current != null) return undefined
    const timer = window.setInterval(next, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [isInView, next, total])

  useEffect(() => {
    if (!isInView) return undefined
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isInView, next, prev])

  const onPointerDown = (e) => {
    dragStartX.current = e.clientX
    setDragHint(0)
  }

  const onPointerMove = (e) => {
    if (dragStartX.current == null) return
    setDragHint((e.clientX - dragStartX.current) * 0.15)
  }

  const onPointerUp = (e) => {
    if (dragStartX.current == null) return
    const delta = e.clientX - dragStartX.current
    dragStartX.current = null
    setDragHint(0)
    if (Math.abs(delta) < 48) return
    if (delta < 0) next()
    else prev()
  }

  const navBtn =
    'border border-black/8 bg-white/90 text-black shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl hover:bg-white'

  return (
    <section
      id="testimonials"
      className="section-spacing relative w-full overflow-hidden border-t border-black/[0.06] bg-white"
    >
      <div className="page-container">
        <SectionHeader
          eyebrow="Testimonials"
          title="Founders trust"
          highlight="real answers"
          description="Thousands of professionals use Replyfy when they need clarity, not more noise."
          className="mx-auto mb-10 md:mb-14"
        />

        <div ref={containerRef} className="relative mx-auto w-full max-w-[1400px]">
          <button
            type="button"
            onClick={prev}
            disabled={isAnimating}
            className={`absolute left-2 top-[42%] z-50 flex h-11 w-11 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 md:left-4 md:h-12 md:w-12 ${navBtn}`}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={isAnimating}
            className={`absolute right-2 top-[42%] z-50 flex h-11 w-11 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 md:right-4 md:h-12 md:w-12 ${navBtn}`}
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </button>

          <div
            className="relative mx-auto select-none overflow-hidden"
            style={{ width: '100%', maxWidth: '1400px', height: isMobile ? '420px' : '460px' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={() => {
              dragStartX.current = null
              setDragHint(0)
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-40 w-16 bg-gradient-to-r from-white via-white/80 to-transparent md:w-28"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-40 w-16 bg-gradient-to-l from-white via-white/80 to-transparent md:w-28"
            />

            <motion.div
              className="absolute inset-0"
              animate={{ x: dragHint }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              style={{ perspective: 1400 }}
            >
              <AnimatePresence initial={false}>
                {testimonials.map((item, index) => {
                  const offset = getOffset(index, activeIndex, total)
                  if (Math.abs(offset) > VISIBLE_RANGE) return null
                  const layout = getLayout(offset, isMobile)
                  const isCenter = offset === 0
                  return (
                    <CarouselCard
                      key={item.name}
                      item={item}
                      layout={layout}
                      isCenter={isCenter}
                      reduceMotion={!isInView}
                      onSelect={() => !isCenter && !isAnimating && goTo(index)}
                    />
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {testimonials.map((item, index) => {
              const active = index === activeIndex
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`View testimonial from ${item.name}`}
                  className="p-1"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      active
                        ? 'h-2 w-8 bg-gradient-to-r from-sky-500 to-violet-600'
                        : 'h-2 w-2 bg-black/15 hover:bg-black/30'
                    }`}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
