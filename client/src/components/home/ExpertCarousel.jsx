import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { catalogApi } from '../../services/api'
import ExpertCard from './ExpertCard'

const SNAP_SPRING = { type: 'spring', stiffness: 280, damping: 30, mass: 0.85 }
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
    experience: expert.experience,
    topExpert: expert.isVerified,
  }
}

function getOffset(index, activeIndex, total) {
  let offset = index - activeIndex
  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total
  return offset
}

function getLayout(offset, isMobile, viewportWidth = 390) {
  const contentW = Math.max(280, viewportWidth - 32)
  const centerWidth = isMobile ? Math.min(240, contentW) : 280
  const sideWidth = isMobile ? Math.min(200, contentW * 0.72) : 240
  const farWidth = isMobile ? Math.min(170, contentW * 0.58) : 200
  const step = isMobile ? Math.min(168, contentW * 0.52) : 210
  const abs = Math.abs(offset)

  if (offset === 0) {
    return {
      x: 0,
      width: centerWidth,
      scale: 1,
      opacity: 1,
      zIndex: 40,
    }
  }

  if (abs === 1) {
    return {
      x: Math.sign(offset) * step,
      width: sideWidth,
      scale: 0.92,
      opacity: 0.92,
      zIndex: 25,
    }
  }

  if (abs === 2) {
    return {
      x: Math.sign(offset) * step * 1.85,
      width: farWidth,
      scale: 0.86,
      opacity: 0.7,
      zIndex: 10,
    }
  }

  return {
    x: Math.sign(offset) * step * 2.5,
    width: farWidth,
    scale: 0.8,
    opacity: 0,
    zIndex: 0,
  }
}

function CarouselCard({ expert, layout, isCenter, onSelect, reduceMotion }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        zIndex: layout.zIndex,
        y: '-50%',
        translateX: '-50%',
        willChange: reduceMotion ? 'auto' : 'transform, opacity',
      }}
      animate={{
        width: layout.width,
        x: layout.x,
        scale: layout.scale,
        opacity: layout.opacity,
      }}
      transition={reduceMotion ? { duration: 0 } : SNAP_SPRING}
      onClick={onSelect}
    >
      <div
        className={`h-[340px] overflow-hidden rounded-[18px] transition-shadow duration-400 sm:h-[360px] ${
          !isCenter ? 'cursor-pointer' : ''
        }`}
        style={{
          boxShadow: isCenter
            ? '0 22px 50px rgba(15,23,42,0.16), 0 0 0 1px rgba(15,23,42,0.04)'
            : '0 12px 32px rgba(15,23,42,0.1)',
        }}
      >
        <ExpertCard expert={expert} />
      </div>
    </motion.div>
  )
}

export default function ExpertCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(390)
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
    const update = () => {
      setIsMobile(window.innerWidth < 768)
      setViewportWidth(window.innerWidth)
    }
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
      window.setTimeout(() => setIsAnimating(false), 480)
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

  const navBtn =
    'border border-black/8 bg-white/90 text-black shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl hover:bg-white'

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[1100px]">
      <button
        type="button"
        onClick={prev}
        disabled={isAnimating}
        className={`absolute left-1 top-[42%] z-50 flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 md:left-2 md:h-11 md:w-11 ${navBtn}`}
        aria-label="Previous mentor"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={next}
        disabled={isAnimating}
        className={`absolute right-1 top-[42%] z-50 flex h-10 w-10 items-center justify-center rounded-full transition duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 md:right-2 md:h-11 md:w-11 ${navBtn}`}
        aria-label="Next mentor"
      >
        <ChevronRight size={18} />
      </button>

      <div
        className="relative mx-auto select-none overflow-hidden"
        style={{ width: '100%', height: isMobile ? '380px' : '400px' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          dragStartX.current = null
          setDragHint(0)
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ x: dragHint }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        >
          <AnimatePresence initial={false}>
            {experts.map((expert, index) => {
              const offset = getOffset(index, activeIndex, total)
              if (Math.abs(offset) > VISIBLE_RANGE) return null
              const layout = getLayout(offset, isMobile, viewportWidth)
              const isCenter = offset === 0
              return (
                <CarouselCard
                  key={expert.id}
                  expert={expert}
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

      <div className="mt-4 flex items-center justify-center gap-2">
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
                    ? 'h-2 w-8 bg-gradient-to-r from-sky-500 to-violet-600'
                    : 'h-2 w-2 bg-black/15 hover:bg-black/30'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
