import { motion } from 'framer-motion'

export default function AdminCard({
  children,
  className = '',
  padding = true,
  hover = false,
  as: Tag = 'div',
}) {
  const Comp = hover ? motion.div : Tag
  const motionProps = hover
    ? {
        whileHover: { y: -2 },
        transition: { type: 'spring', stiffness: 400, damping: 28 },
      }
    : {}

  return (
    <Comp
      {...motionProps}
      className={`admin-panel overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ${
        padding ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </Comp>
  )
}
