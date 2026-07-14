import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { catalogApi } from '../../services/api'
import ExpertCard from './ExpertCard'

const SNAP_SPRING = { type: 'spring', stiffness: 300, damping: 32, mass: 0.7 }
const ROTATE_MS = 5000

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

function getSideOffset(isMobile) {
  return isMobile ? 210 : 360
}

function getLayout(offset, isMobile) {
  const sideOffset = getSideOffset(isMobile)
  const centerWidth = isMobile ? 300 : 430
  const sideWidth = isMobile ? 240 : 330

  switch (offset) {
    case 0:
      return { x: 0, width: centerWidth, scale: 1.05, opacity: 1, zIndex: 30 }
    case -1:
      return { x: -sideOffset, width: sideWidth, scale: 0.9, opacity: 0.75, zIndex: 20 }
    case 1:
      return { x: sideOffset, width: sideWidth, scale: 0.9, opacity: 0.75, zIndex: 20 }
    default:
      return { x: offset * sideOffset, width: sideWidth, scale: 0.72, opacity: 0, zIndex: 0 }
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
        willChange: reduceMotion ? 'auto' : 'transform',
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
        className={`rounded-3xl ${!isCenter ? 'cursor-pointer' : ''}`}
        style={{
          boxShadow: isCenter
            ? dark
              ? '0 24px 60px rgba(0, 0, 0, 0.5)'
              : '0 24px 60px rgba(0, 0, 0, 0.14)'
            : dark
              ? '0 10px 30px rgba(0, 0, 0, 0.35)'
              : '0 10px 30px rgba(0, 0, 0, 0.06)',
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
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { amount: 0.25 })

  const { data } = useQuery({
    queryKey: ['home-experts'],
    queryFn: () => catalogApi.getExperts({ availability: 'available', limit: 6, sort: 'rating' }),
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
      window.setTimeout(() => setIsAnimating(false), 500)
    },
    [activeIndex, total, isAnimating]
  )

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (!isInView || !total) return
    const timer = window.setInterval(next, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [isInView, next, total])

  if (!total) return null

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[1400px]">
      <button type="button" onClick={prev} disabled={isAnimating} className={`absolute left-2 md:left-6 top-[42%] z-50 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full shadow-lg disabled:opacity-50 transition-transform hover:scale-105 active:scale-95 ${dark ? 'border border-white/15 bg-white/10 backdrop-blur-xl' : 'glass-strong'}`} aria-label="Previous mentor">
        <ChevronLeft size={20} className={dark ? 'text-white' : 'text-ink'} />
      </button>
      <button type="button" onClick={next} disabled={isAnimating} className={`absolute right-2 md:right-6 top-[42%] z-50 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full shadow-lg disabled:opacity-50 transition-transform hover:scale-105 active:scale-95 ${dark ? 'border border-white/15 bg-white/10 backdrop-blur-xl' : 'glass-strong'}`} aria-label="Next mentor">
        <ChevronRight size={20} className={dark ? 'text-white' : 'text-ink'} />
      </button>
      <div className="relative mx-auto overflow-hidden" style={{ width: '100%', maxWidth: '1400px', height: isMobile ? '400px' : '460px' }}>
        <div className="absolute inset-0">
          {experts.map((expert, index) => {
            const offset = getOffset(index, activeIndex, total)
            if (Math.abs(offset) > 1) return null
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
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {experts.map((expert, index) => (
          <button key={expert.id} type="button" onClick={() => goTo(index)} aria-label={`View ${expert.name}`} className="p-1">
            <span className={`block rounded-full transition-all duration-300 ${index === activeIndex ? `h-2 w-8 ${dark ? 'bg-primary' : 'bg-black'}` : `${dark ? 'bg-white/25 hover:bg-white/40' : 'bg-black/15 hover:bg-black/25'}`}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
