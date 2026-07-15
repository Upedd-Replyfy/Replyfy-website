import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Users, MessageSquare, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '../components/ui/Logo'
import Input from '../components/ui/Input'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import { useAuth } from '../context/AuthContext'

const TRUST_STATS = [
  { icon: Users, value: '50', label: 'Mentors' },
  { icon: MessageSquare, value: '2400+', label: 'Answers' },
  { icon: Star, value: '4.9', label: 'Rating' },
]

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] }

const inputClass =
  '!rounded-xl !bg-[#fafafa] !border-black/20 !text-black !shadow-none placeholder:!text-black/45 focus:!border-black/40 focus:!bg-white focus:!ring-2 focus:!ring-black/10'

function AuthVisual({ compact = false }) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${
        compact ? '' : 'hidden min-h-screen lg:block'
      }`}
    >
      <img
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=1600&fit=crop"
        alt="Founders and mentors collaborating"
        className="absolute inset-0 h-full w-full object-cover grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/85 via-neutral-800/75 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      {!compact && (
        <svg
          className="pointer-events-none absolute -right-1 top-0 z-20 h-full w-28 text-[#EEF0F3] xl:w-36"
          viewBox="0 0 120 800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,0 C70,80 25,220 85,380 C120,520 35,660 120,800 L120,0 Z"
            fill="currentColor"
          />
        </svg>
      )}

      <div
        className={`relative z-10 flex h-full flex-col justify-between ${
          compact ? 'p-6 xl:p-8' : 'p-10 xl:p-14'
        }`}
      >
        <Logo size={compact ? 'sm' : 'md'} />

        <div className={compact ? 'max-w-sm' : 'max-w-md'}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.1 }}
            className={`font-semibold leading-[1.12] tracking-tight text-white ${
              compact ? 'text-2xl xl:text-[1.75rem]' : 'text-4xl xl:text-5xl'
            }`}
          >
            Ask better questions.
            <br />
            Get answers from people
            <br />
            who have actually done it.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.25 }}
            className={`flex flex-wrap gap-2.5 ${compact ? 'mt-6' : 'mt-10'}`}
          >
            {TRUST_STATS.map((stat) => (
              <div
                key={stat.label}
                className={`flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/15 ${
                  compact ? 'px-3 py-2' : 'gap-2.5 px-4 py-2.5'
                }`}
              >
                <stat.icon size={compact ? 14 : 16} className="text-white/90" />
                <div>
                  <p className={`font-semibold text-white ${compact ? 'text-xs' : 'text-sm'}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-white/70">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs text-white/60">Secure · Verified mentors · Pay per question</p>
      </div>
    </div>
  )
}

export default function Auth({ initialMode, embedded = false, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { login, register, loginWithGoogle, getDashboardPath } = useAuth()
  const defaultMode =
    initialMode ||
    (location.pathname === '/signup' ? 'signup' : 'login')

  const [mode, setMode] = useState(defaultMode)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const isSignup = mode === 'signup'
  const form = isSignup ? signupForm : loginForm

  const switchMode = (next) => {
    setMode(next)
    setErrors({})
    setFormError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (isSignup) {
      setSignupForm((prev) => ({ ...prev, [name]: value }))
    } else {
      setLoginForm((prev) => ({ ...prev, [name]: value }))
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateLogin = () => {
    const next = {}
    if (!loginForm.email.trim()) next.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) next.email = 'Enter a valid email'
    if (!loginForm.password) next.password = 'Password is required'
    return next
  }

  const validateSignup = () => {
    const next = {}
    if (!signupForm.name.trim()) next.name = 'Name is required'
    if (!signupForm.email.trim()) next.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(signupForm.email)) next.email = 'Enter a valid email'
    if (!signupForm.password) next.password = 'Password is required'
    else if (signupForm.password.length < 6) next.password = 'At least 6 characters'
    if (!signupForm.confirmPassword) next.confirmPassword = 'Please confirm your password'
    else if (signupForm.password !== signupForm.confirmPassword)
      next.confirmPassword = 'Passwords do not match'
    return next
  }

  const finishAuth = (message) => {
    toast.success(message)
    const from = location.state?.from?.pathname
    navigate(from || getDashboardPath(), { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const next = isSignup ? validateSignup() : validateLogin()
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }

    setLoading(true)
    setFormError('')
    try {
      if (isSignup) {
        await register({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
        })
        finishAuth('Account created successfully')
      } else {
        await login(loginForm)
        finishAuth('Welcome back')
      }
    } catch (err) {
      setFormError(
        err.message ||
          (isSignup ? 'Registration failed. Please try again.' : 'Login failed. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (payload) => {
    setGoogleLoading(true)
    setFormError('')
    try {
      await loginWithGoogle(payload)
      finishAuth(isSignup ? 'Account created successfully' : 'Welcome back')
    } catch (err) {
      setFormError(err.message || 'Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = (message) => {
    setFormError(message || 'Google sign-in was cancelled or failed.')
  }

  const authBusy = loading || googleLoading

  if (embedded) {
    return (
      <div className="auth-shell flex h-full w-full overflow-hidden bg-[#EEF0F3]">
        <div className="relative hidden h-full w-[46%] shrink-0 sm:block">
          <AuthVisual compact />
        </div>

        <div className="flex h-full min-w-0 flex-1 items-center justify-center overflow-y-auto px-5 py-4 sm:px-7 sm:py-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="relative w-full max-w-[380px]"
          >
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
              <div className="px-6 pb-3 pt-5 sm:px-7 sm:pt-5">
                <Logo surface="light" size="md" className="mb-3 sm:hidden" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600/80">
                  {isSignup ? 'Get started' : 'Sign in'}
                </p>
                <h1 className="mt-1 text-[1.35rem] font-semibold tracking-tight text-[#111827] sm:text-[1.45rem]">
                  {isSignup ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="mt-1 text-[13px] leading-snug text-[#6B7280]">
                  {isSignup
                    ? 'Start asking questions in under a minute.'
                    : 'Sign in to view your questions and mentor responses.'}
                </p>
              </div>

              <div className="px-6 pb-4 sm:px-7">
                {formError && (
                  <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {formError}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
                  <AnimatePresence initial={false}>
                    {isSignup && (
                      <motion.div
                        key="name-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Input
                          dense
                          label="Full Name"
                          id="embedded-name"
                          name="name"
                          type="text"
                          placeholder="Your full name"
                          value={signupForm.name}
                          onChange={handleChange}
                          error={errors.name}
                          autoComplete="name"
                          className={inputClass}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Input
                    dense
                    label="Email"
                    id="embedded-email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoComplete="email"
                    className={inputClass}
                  />

                  <Input
                    dense
                    label="Password"
                    id="embedded-password"
                    name="password"
                    type="password"
                    placeholder={isSignup ? 'Min. 6 characters' : 'Password'}
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    className={inputClass}
                  />

                  <AnimatePresence initial={false}>
                    {isSignup && (
                      <motion.div
                        key="confirm-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Input
                          dense
                          label="Confirm Password"
                          id="embedded-confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Repeat your password"
                          value={signupForm.confirmPassword}
                          onChange={handleChange}
                          error={errors.confirmPassword}
                          autoComplete="new-password"
                          className={inputClass}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={authBusy}
                    className="mt-1 w-full rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
                  >
                    {authBusy
                      ? isSignup
                        ? 'Creating account...'
                        : 'Signing in...'
                      : isSignup
                        ? 'Create Account'
                        : 'Sign In'}
                  </button>
                </form>

                <div className="my-3 flex items-center gap-3" aria-hidden="true">
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                    or
                  </span>
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>

                <GoogleSignInButton
                  label={isSignup ? 'Sign up with Google' : 'Continue with Google'}
                  loading={googleLoading}
                  disabled={authBusy}
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>

              <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3 sm:px-7">
                <p className="text-center text-[13px] text-[#6B7280]">
                  {isSignup ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="font-semibold text-[#111827] underline-offset-2 hover:underline"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="font-semibold text-[#111827] underline-offset-2 hover:underline"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </p>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-1.5 inline-flex w-full items-center justify-center text-xs font-medium text-[#9CA3AF] transition hover:text-[#111827]"
                  >
                    Back to preview
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#EEF0F3]">
      <div className="relative w-full lg:w-[45%]">
        <AuthVisual />

        <div className="relative overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/90 to-black/85" />
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"
            alt=""
            className="h-44 w-full object-cover opacity-30 grayscale"
          />
          <div className="relative px-5 py-6">
            <Logo size="md" />
            <p className="mt-3 text-lg font-semibold text-white leading-snug">
              Ask better questions. Get real answers.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-shell relative flex w-full flex-col justify-center bg-[#EEF0F3] px-5 py-8 sm:px-8 lg:w-[55%] lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="relative mx-auto w-full max-w-[420px]"
        >
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
            <div className="px-6 pb-3 pt-6 sm:px-8 sm:pt-7">
              <Logo surface="light" size="md" className="mb-3" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-600/80">
                {isSignup ? 'Get started' : 'Sign in'}
              </p>
              <h1 className="mt-1 text-[1.5rem] font-semibold tracking-tight text-[#111827] sm:text-[1.65rem]">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-1 text-[13px] leading-snug text-[#6B7280]">
                {isSignup
                  ? 'Start asking questions in under a minute.'
                  : 'Sign in to view your questions and mentor responses.'}
              </p>
            </div>

            <div className="px-6 pb-5 sm:px-8">
              {formError && (
                <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {formError}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
                <AnimatePresence initial={false}>
                  {isSignup && (
                    <motion.div
                      key="name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Input
                        dense
                        label="Full Name"
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={signupForm.name}
                        onChange={handleChange}
                        error={errors.name}
                        autoComplete="name"
                        className={inputClass}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <Input
                  dense
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                  className={inputClass}
                />

                <Input
                  dense
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isSignup ? 'Min. 6 characters' : '••••••••'}
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  className={inputClass}
                />

                <AnimatePresence initial={false}>
                  {isSignup && (
                    <motion.div
                      key="confirm-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Input
                        dense
                        label="Confirm Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Repeat your password"
                        value={signupForm.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        autoComplete="new-password"
                        className={inputClass}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isSignup && (
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-[#6B7280] transition hover:text-[#111827]"
                    >
                      Forgot Password
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authBusy}
                  className="mt-1 w-full rounded-xl bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50"
                >
                  {authBusy
                    ? isSignup
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isSignup
                      ? 'Create Account'
                      : 'Sign In'}
                </button>
              </form>

              <div className="my-3.5 flex items-center gap-3" aria-hidden="true">
                <div className="h-px flex-1 bg-[#E5E7EB]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  or
                </span>
                <div className="h-px flex-1 bg-[#E5E7EB]" />
              </div>

              <GoogleSignInButton
                label={isSignup ? 'Sign up with Google' : 'Continue with Google'}
                loading={googleLoading}
                disabled={authBusy}
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />

              <Link
                to="/"
                className="mt-3.5 inline-flex w-full items-center justify-center gap-2 text-xs font-medium text-[#6B7280] transition hover:text-[#111827]"
              >
                <ArrowLeft size={14} />
                Back to home
              </Link>
            </div>

            <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3.5 sm:px-8">
              <p className="text-center text-[13px] text-[#6B7280]">
                {isSignup ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-[#111827] underline-offset-2 hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="font-semibold text-[#111827] underline-offset-2 hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </p>

              {isSignup && (
                <p className="mt-2 text-center text-[11px] leading-relaxed text-[#9CA3AF]">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="font-medium text-[#6B7280] underline hover:text-[#111827]">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-[#6B7280] underline hover:text-[#111827]">
                    Privacy Policy
                  </a>
                  .
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
