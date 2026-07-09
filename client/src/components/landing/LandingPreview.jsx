import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUp, Paperclip, Sparkles } from 'lucide-react'
import { ease, scaleIn } from './motion'

const categories = ['Startup', 'Finance', 'Legal', 'Marketing', 'Engineering', 'Career']
const experts = ['Founder', 'Mentor', 'Investor', 'Operator']

export default function LandingPreview() {
  const [category, setCategory] = useState('Startup')
  const [expert, setExpert] = useState('Founder')
  const [hovered, setHovered] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const scale = zoomed ? 1.06 : hovered ? 1.025 : 1

  return (
    <motion.div
      variants={scaleIn}
      custom={0.2}
      initial="hidden"
      animate="visible"
      className="relative col-span-12 lg:col-span-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-6 rounded-full bg-white/[0.04] blur-3xl"
      />

      <motion.div
        role="button"
        tabIndex={0}
        aria-label={zoomed ? 'Zoom out preview' : 'Zoom in preview'}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => setZoomed((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setZoomed((v) => !v)
          }
        }}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className={`relative overflow-hidden rounded-[22px] border border-[#242424] bg-[#202323] shadow-[0_24px_80px_rgba(0,0,0,0.55)] ${
          zoomed ? 'z-20 cursor-zoom-out' : 'cursor-zoom-in'
        }`}
      >
        <div className="flex h-10 items-center gap-2 border-b border-[#242424] bg-[#202222] px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3A3A3A]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3A3A3A]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#3A3A3A]" />
          <span className="ml-3 text-[11px] text-[#9A9A9A]">replyfy.app / ask</span>
        </div>

        <div
          className="grid gap-4 p-5 sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Matched expert', value: 'Founder' },
              { label: 'Response', value: '12 hrs' },
              { label: 'Plan', value: 'Mentor' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-[#242424] bg-[#1A1C1C] px-4 py-3"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#9A9A9A]">
                  {item.label}
                </p>
                <p className="mt-1 text-[15px] font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[18px] border border-[#242424] bg-[#1A1C1C] p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-black">
                <Sparkles size={15} />
              </span>
              <div>
                <p className="text-[16px] font-semibold tracking-tight text-white">
                  What would you like help with?
                </p>
                <p className="mt-1 text-[13px] text-[#9A9A9A]">
                  A verified human expert will respond — not AI.
                </p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                    category === cat
                      ? 'border-white bg-white text-black'
                      : 'border-[#242424] text-[#9A9A9A] hover:border-[#3A3A3A] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mb-3 flex flex-wrap gap-1 border-b border-[#242424] pb-3">
              <span className="mr-2 self-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9A9A9A]">
                Expert
              </span>
              {experts.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setExpert(item)}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                    expert === item
                      ? 'text-white underline decoration-white decoration-2 underline-offset-4'
                      : 'text-[#9A9A9A] hover:text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <textarea
              readOnly
              rows={4}
              value={`Ask a ${expert.toLowerCase()} about ${category.toLowerCase()} strategy, decisions, and next steps...`}
              className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-[#9A9A9A] outline-none"
            />

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#242424] pt-4">
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#9A9A9A]">
                <Paperclip size={14} />
                <span>PDF</span>
                <span>Files</span>
                <span>Links</span>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black transition hover:bg-[#F5F5F5]"
                style={{ transitionTimingFunction: `cubic-bezier(${ease.join(',')})` }}
              >
                Ask expert
                <ArrowUp size={14} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
