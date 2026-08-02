import { Link } from 'react-router-dom'
import InfoPage from '../../components/layout/InfoPage'

export default function Terms() {
  return (
    <InfoPage
      theme="light"
      eyebrow="Legal"
      title="Terms of Service"
      lead="Effective Date: August 2, 2026. Welcome to Replyfy, operated by Upedd Private Limited. By accessing or using Replyfy, you agree to these Terms."
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Our Service</h2>
        <p>
          Replyfy connects users with experienced professionals who provide practical, experience-based
          guidance.
        </p>
        <p>
          Experts share their opinions, knowledge, and experience. Their responses should not be treated as
          guaranteed professional advice or guarantees of any outcome.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">User Responsibilities</h2>
        <p>You agree to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide accurate information</li>
          <li>Submit lawful content only</li>
          <li>Respect experts and platform members</li>
          <li>Not misuse or abuse the platform</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Expert Responses</h2>
        <p>
          Replyfy focuses on delivering thoughtful, high-quality responses rather than instant replies.
          Response times may vary depending on the complexity of your question and expert availability.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Payments</h2>
        <p>Payments are securely processed through Razorpay.</p>
        <p>Pricing is displayed before purchase.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Intellectual Property</h2>
        <p>All website content, branding, graphics, and software belong to Replyfy or its licensors.</p>
        <p>
          Expert responses remain for your personal use and may not be copied, sold, or redistributed without
          permission.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Prohibited Uses</h2>
        <p>Users may not:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Upload illegal or harmful content</li>
          <li>Attempt to disrupt the platform</li>
          <li>Impersonate others</li>
          <li>Use Replyfy for spam or fraudulent activities</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Disclaimer</h2>
        <p>Replyfy provides educational, informational, and experience-based guidance.</p>
        <p>
          We do not guarantee business, financial, legal, investment, employment, academic, or other
          outcomes resulting from the use of our platform.
        </p>
        <p>Users remain responsible for their own decisions.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Replyfy and Upedd Private Limited shall not be liable for
          any indirect, incidental, consequential, or special damages arising from the use of the platform.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Changes</h2>
        <p>
          We may update these Terms from time to time. Continued use of Replyfy constitutes acceptance of
          the revised Terms.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Contact</h2>
        <p>
          Email:{' '}
          <a href="mailto:connect@upedd.org" className="font-medium text-sky-600 underline-offset-2 hover:underline">
            connect@upedd.org
          </a>
        </p>
      </section>

      <p className="text-slate-500">
        Related:{' '}
        <Link to="/privacy" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Privacy Policy
        </Link>{' '}
        ·{' '}
        <Link to="/refund" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Refund &amp; Cancellation Policy
        </Link>{' '}
        ·{' '}
        <Link to="/legal" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Legal
        </Link>
      </p>
    </InfoPage>
  )
}
