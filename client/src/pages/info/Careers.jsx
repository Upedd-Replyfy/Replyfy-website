import { Link } from 'react-router-dom'
import InfoPage from '../../components/layout/InfoPage'

const roles = [
  {
    title: 'Mentor success',
    blurb: 'Help verified mentors thrive on the platform — onboarding, quality, and community.',
  },
  {
    title: 'Product & engineering',
    blurb: 'Ship the next generation of Q&A matching, payments, and mentor workflows.',
  },
  {
    title: 'Growth & partnerships',
    blurb: 'Tell the Replyfy story and bring new mentors and seekers into the network.',
  },
]

export default function Careers() {
  return (
    <InfoPage
      theme="light"
      eyebrow="Company"
      title="Careers"
      lead="We are building a quieter, more thoughtful way to get expert answers. If that resonates, we would love to hear from you."
    >
      <p>
        Replyfy is early and moving fast. We hire for curiosity, craft, and kindness — people who care about
        the quality of every answer that leaves the platform.
      </p>
      <div className="space-y-3">
        {roles.map((role) => (
          <div
            key={role.title}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">{role.title}</h2>
            <p className="mt-1.5 text-slate-500">{role.blurb}</p>
          </div>
        ))}
      </div>
      <p>
        No open roles listed yet? Still reach out — we keep strong candidates in mind. Email{' '}
        <a href="mailto:careers@replyfy.com" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          careers@replyfy.com
        </a>{' '}
        or use our{' '}
        <Link to="/contact" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          contact form
        </Link>
        .
      </p>
    </InfoPage>
  )
}
