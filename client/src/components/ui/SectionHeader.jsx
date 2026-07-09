import { motion } from 'framer-motion'
import { fadeUp } from '../../utils/animations'

export default function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  align = 'center',
  className = '',
  dark = false,
}) {
  const alignClass =
    align === 'left' ? 'text-left items-start' : 'text-center items-center'

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      className={`flex flex-col gap-3 max-w-3xl ${alignClass} ${className}`}
    >
      {eyebrow && (
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
            dark ? 'text-white/45' : 'text-black/50'
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-2xl md:text-3xl lg:text-[2.125rem] font-semibold text-balance leading-[1.12] tracking-tight ${
          dark ? 'text-white' : 'text-black'
        }`}
      >
        {title}
        {highlight && (
          <>
            {' '}
            <span
              className={
                dark
                  ? 'bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent'
              }
            >
              {highlight}
            </span>
          </>
        )}
      </h2>
      {description && (
        <p
          className={`text-sm md:text-base leading-relaxed max-w-2xl mt-1 ${
            dark ? 'text-white/55' : 'text-black/65'
          }`}
        >
          {description}
        </p>
      )}
    </motion.div>
  )
}
