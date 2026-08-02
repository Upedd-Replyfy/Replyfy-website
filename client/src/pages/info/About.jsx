import { Link } from 'react-router-dom'
import InfoPage from '../../components/layout/InfoPage'

export default function About() {
  return (
    <InfoPage
      theme="light"
      eyebrow="Company"
      title="About Replyfy"
      lead="Experience Matters. We live in a world where AI can answer almost any question. But when the decision is important, information alone isn't enough—you need someone who's been there."
    >
      <p>
        Replyfy connects people with verified professionals who share practical, experience-based guidance
        across business, startups, finance, legal, marketing, engineering, careers, and more.
      </p>
      <p>
        Whether you&apos;re launching a startup, making a career move, solving a business challenge, or seeking
        expert advice, Replyfy helps you learn from people who&apos;ve faced similar situations and understand
        the real-world trade-offs.
      </p>
      <p>Our mission is simple: make expert knowledge accessible, affordable, and human.</p>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">What We Believe</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>Experience creates better decisions.</li>
          <li>Human judgment goes beyond AI-generated information.</li>
          <li>Quality advice should be accessible to everyone.</li>
          <li>Every meaningful answer comes from someone who has lived it.</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Why Replyfy?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>Verified professionals across multiple domains</li>
          <li>Personalized, human-written responses</li>
          <li>Affordable guidance starting at ₹99</li>
          <li>Practical advice tailored to your situation</li>
          <li>A trusted platform built around real experience</li>
        </ul>
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900">Our Vision</h2>
        <p className="mt-3 text-slate-600">
          To become the world&apos;s most trusted platform for experience-based knowledge—where anyone can
          connect with the right expert, ask meaningful questions, and make better decisions with confidence.
        </p>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-violet-50 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900">Our Promise</h2>
        <p className="mt-3 text-lg font-medium tracking-tight text-slate-900">
          AI Gives Answers.{' '}
          <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
            Humans Give Experience
          </span>
        </p>
      </div>

      <p className="text-slate-600">
        Looking to work with us? See{' '}
        <Link to="/careers" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Careers
        </Link>{' '}
        or{' '}
        <Link to="/contact" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Contact
        </Link>
        .
      </p>
    </InfoPage>
  )
}
