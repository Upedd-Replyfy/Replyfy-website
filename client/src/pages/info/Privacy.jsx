import { Link } from 'react-router-dom'
import InfoPage from '../../components/layout/InfoPage'

export default function Privacy() {
  return (
    <InfoPage
      theme="light"
      eyebrow="Legal"
      title="Privacy Policy"
      lead="Effective Date: August 2, 2026. Replyfy (“we,” “our,” or “us”), operated by Upedd Private Limited, respects your privacy and is committed to protecting your personal information."
    >
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Information We Collect</h2>
        <p>When you use Replyfy, we may collect:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number (if provided)</li>
          <li>Account information</li>
          <li>Questions and files you submit</li>
          <li>Expert responses</li>
          <li>Device and browser information</li>
          <li>Payment transaction details (excluding card information)</li>
        </ul>
        <p>
          Payments are securely processed through Razorpay. Replyfy does not store your card or banking
          details.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Create and manage your account</li>
          <li>Match your question with the appropriate expert</li>
          <li>Deliver our services</li>
          <li>Process payments</li>
          <li>Improve the platform</li>
          <li>Prevent fraud and misuse</li>
          <li>Communicate important updates</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Confidentiality</h2>
        <p>
          Questions and documents submitted on Replyfy are treated as confidential and are only accessed
          by our internal team and assigned experts when necessary to provide the service.
        </p>
        <p>We do not publicly publish your questions without your permission.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Data Security</h2>
        <p>
          We use reasonable technical and organizational measures to protect your information. However, no
          online platform can guarantee absolute security.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Third-Party Services</h2>
        <p>We may use trusted third-party providers including:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Razorpay (Payments)</li>
          <li>Analytics providers</li>
          <li>Email service providers</li>
          <li>Cloud hosting providers</li>
        </ul>
        <p>These providers only receive information necessary to perform their services.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Data Retention</h2>
        <p>
          We retain your information only for as long as necessary to provide our services, comply with legal
          obligations, and resolve disputes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Your Rights</h2>
        <p>You may request to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Access your information</li>
          <li>Update incorrect information</li>
          <li>Delete your account (subject to legal requirements)</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900">Contact</h2>
        <p>
          For privacy-related questions, contact:{' '}
          <a href="mailto:connect@upedd.org" className="font-medium text-sky-600 underline-offset-2 hover:underline">
            connect@upedd.org
          </a>
        </p>
      </section>

      <p className="text-slate-500">
        See also our{' '}
        <Link to="/terms" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Terms of Service
        </Link>
        ,{' '}
        <Link to="/refund" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Refund &amp; Cancellation Policy
        </Link>
        , and{' '}
        <Link to="/legal" className="font-medium text-sky-600 underline-offset-2 hover:underline">
          Legal
        </Link>{' '}
        overview.
      </p>
    </InfoPage>
  )
}
