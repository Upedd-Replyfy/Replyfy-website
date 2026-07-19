import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { fadeUp } from '../../utils/animations'

const faqs = [
  {
    question: 'How is this different from asking ChatGPT?',
    answer:
      'AI gives generic answers from public data. Replyfy connects you with a verified human mentor who reviews your specific situation and writes a tailored response.',
  },
  {
    question: "What if I'm not satisfied with the answer?",
    answer:
      "Priority and Consultation plans include revision rounds. If the response doesn't address your question, request a clarification within your plan limits.",
  },
  {
    question: 'How are payments handled?',
    answer:
      'We use Razorpay for secure payment processing. Your payment is confirmed only after signature verification. We never store card details.',
  },
  {
    question: 'Can I choose a specific mentor?',
    answer:
      'Mentors are matched based on category and availability. Consultation-tier questions are assigned to senior mentors in the relevant field.',
  },
  {
    question: 'What types of questions can I ask?',
    answer:
      "Business, finance, legal, product, engineering, and career questions are welcome. We don't handle medical diagnoses or emergency situations.",
  },
]

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className={`border-b border-black/[0.08] last:border-0 ${isOpen ? 'bg-black/[0.02]' : ''}`}>
      <button
        type="button"
        onClick={onToggle}
        className="group flex min-h-12 w-full items-center justify-between gap-4 py-5 text-left transition-colors"
      >
        <span
          className={`pr-4 text-[15px] font-semibold leading-snug transition-colors md:text-base ${
            isOpen ? 'text-black' : 'text-black/85 group-hover:text-black'
          }`}
        >
          {question}
        </span>
        <motion.span
          animate={{
            backgroundColor: isOpen ? '#272927' : 'rgba(0,0,0,0.05)',
            color: isOpen ? '#ffffff' : 'rgba(0,0,0,0.55)',
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.2 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.08]"
        >
          {isOpen ? <Minus size={15} strokeWidth={2} /> : <Plus size={15} strokeWidth={2} />}
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-12 text-sm leading-relaxed text-black/55 md:text-[15px]">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section
      id="faq"
      className="relative w-full border-t border-black/[0.06] bg-[#f5f5f5] py-14 md:py-16 lg:py-20"
    >
      <div className="page-container">
        <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            className="lg:sticky lg:top-24"
          >
            <span className="inline-flex rounded-full border border-black/10 bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/55">
              FAQ
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black leading-[1.12] md:text-3xl lg:text-[2.125rem]">
              Questions,{' '}
              <span className="text-black">answered</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-black/50 md:text-base">
              Everything you need to know before asking your first question.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[20px] border border-black/[0.08] bg-white px-4 py-2 shadow-[0_12px_48px_rgba(0,0,0,0.07)] sm:px-6 md:px-8"
          >
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
