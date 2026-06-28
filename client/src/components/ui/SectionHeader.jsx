import { motion } from 'framer-motion'
import { fadeUp } from '../../utils/animations'

export default function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  align = 'center',
  className = '',
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
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-light">
          {eyebrow}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-ink text-balance leading-[1.08] tracking-tight">
        {title}
        {highlight && (
          <>
            {' '}
            <span className="text-gradient">{highlight}</span>
          </>
        )}
      </h2>
      {description && (
        <p className="text-base md:text-lg text-muted leading-relaxed max-w-2xl mt-1">
          {description}
        </p>
      )}
    </motion.div>
  )
}
