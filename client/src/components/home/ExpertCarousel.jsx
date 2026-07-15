import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { catalogApi } from '../../services/api'
import ExpertCard from './ExpertCard'

const SNAP_SPRING = { type: 'spring', stiffness: 260, damping: 28, mass: 0.85 }
const ROTATE_MS = 5200
const VISIBLE_RANGE = 2

function mapExpert(expert) {
  return {
    id: expert._id,
    name: expert.name,
    role: expert.expertType?.name || '',
    image: expert.profilePhoto || expert.avatar,
    tags: expert.skills || [],
    rating: expert.averageRating,
    answers: expert.completedAnswers,
    bio: expert.bio,
    topExpert: expert.isVerified,
  }
}

function getOffset(index, activeIndex, total) {
  let offset = index - activeIndex
  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total
  return offset
}

function getLayout(offset, isMobile) {
  const step = isMobile ? 195 : 300
  const centerWidth = isMobile ? 300 : 420
  const sideWidth = isMobile ? 240 : 320
  const farWidth = isMobile ? 200 : 280
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

function CarouselCard({ expert, layout, isCenter, onSelect, reduceMotion, dark }) {
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
            ? dark
              ? '0 28px 70px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)'
              : '0 28px 70px rgba(15,23,42,0.16), 0 0 0 1px rgba(15,23,42,0.04)'
            : dark
              ? '0 12px 36px rgba(0,0,0,0.4)'
              : '0 14px 40px rgba(15,23,42,0.08)',
        }}
      >
        <ExpertCard expert={expert} isCenter={isCenter} dark={dark} />
      </div>
    </motion.div>
  )
}

export default function ExpertCarousel({ dark = false }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [dragHint, setDragHint] = useState(0)
  const containerRef = useRef(null)
  const dragStartX = useRef(null)
  const isInView = useInView(containerRef, { amount: 0.2 })

  const { data } = useQuery({
    queryKey: ['home-experts'],
    queryFn: () => catalogApi.getExperts({ availability: 'available', limit: 8, sort: 'rating' }),
    staleTime: 60000,
  })

  const experts = (data?.experts || []).map(mapExpert)
  const total = experts.length

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

  if (!total) return null

  const navBtn = dark
    ? 'border border-white/15 bg-white/10 backdrop-blur-xl text-white hover:bg-white/15'
    : 'border border-black/8 bg-white/90 text-black shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl hover:bg-white'

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[1400px]">
      <button
        type="button"
        onClick={prev}
        disabled={isAnimating}
        className={`absolute left-2 top-[42%] z-50 flex h-11 w-11 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 md:left-4 md:h-12 md:w-12 ${navBtn}`}
        aria-label="Previous mentor"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={next}
        disabled={isAnimating}
        className={`absolute right-2 top-[42%] z-50 flex h-11 w-11 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 md:right-4 md:h-12 md:w-12 ${navBtn}`}
        aria-label="Next mentor"
      >
        <ChevronRight size={20} />
      </button>

      <div
        className="relative mx-auto select-none overflow-hidden"
        style={{ width: '100%', maxWidth: '1400px', height: isMobile ? '420px' : '480px' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          dragStartX.current = null
          setDragHint(0)
        }}
      >
        {/* Soft edge fades — premium depth hint */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 z-40 w-16 md:w-28 ${
            dark
              ? 'bg-gradient-to-r from-[#0a0a0a] to-transparent'
              : 'bg-gradient-to-r from-white via-white/80 to-transparent'
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 z-40 w-16 md:w-28 ${
            dark
              ? 'bg-gradient-to-l from-[#0a0a0a] to-transparent'
              : 'bg-gradient-to-l from-white via-white/80 to-transparent'
          }`}
        />

        <motion.div
          className="absolute inset-0"
          animate={{ x: dragHint }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          style={{ perspective: 1400 }}
        >
          <AnimatePresence initial={false}>
            {experts.map((expert, index) => {
              const offset = getOffset(index, activeIndex, total)
              if (Math.abs(offset) > VISIBLE_RANGE) return null
              const layout = getLayout(offset, isMobile)
              const isCenter = offset === 0
              return (
                <CarouselCard
                  key={expert.id}
                  expert={expert}
                  layout={layout}
                  isCenter={isCenter}
                  reduceMotion={!isInView}
                  onSelect={() => !isCenter && !isAnimating && goTo(index)}
                  dark={dark}
                />
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {experts.map((expert, index) => {
          const active = index === activeIndex
          return (
            <button
              key={expert.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`View ${expert.name}`}
              className="p-1"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  active
                    ? `h-2 w-8 ${dark ? 'bg-white' : 'bg-gradient-to-r from-sky-500 to-violet-600'}`
                    : `h-2 w-2 ${dark ? 'bg-white/25 hover:bg-white/40' : 'bg-black/15 hover:bg-black/30'}`
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
