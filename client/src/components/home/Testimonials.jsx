import { motion } from 'framer-motion'
import SectionHeader from '../ui/SectionHeader'
import { staggerContainer } from '../../utils/animations'

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
]

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Testimonials() {
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
          className="mx-auto mb-12 md:mb-16"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          className="mx-auto grid max-w-[920px] gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5"
        >
          {testimonials.map((item, index) => (
            <motion.blockquote
              key={item.name}
              variants={cardVariants}
              custom={index * 0.12}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="group relative min-h-[280px] overflow-hidden rounded-[18px] border border-black/10 shadow-[0_12px_32px_rgba(0,0,0,0.08)] md:min-h-[300px]"
            >
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                draggable={false}
              />

              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10"
              />

              <div className="relative z-10 flex h-full min-h-[280px] flex-col justify-end p-4 md:min-h-[300px] md:p-5">
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + index * 0.1, duration: 0.5 }}
                  className="text-xs leading-relaxed text-white md:text-[13px]"
                >
                  &ldquo;{item.quote}&rdquo;
                </motion.p>

                <motion.footer
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + index * 0.1, duration: 0.5 }}
                  className="mt-3 border-t border-white/20 pt-3"
                >
                  <cite className="not-italic text-xs font-semibold text-white md:text-sm">
                    {item.name}
                  </cite>
                  <p className="mt-0.5 text-[11px] text-white/65">{item.role}</p>
                </motion.footer>
              </div>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
