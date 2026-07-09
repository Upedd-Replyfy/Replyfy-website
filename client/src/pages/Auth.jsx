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
  { icon: Users, value: '50', label: 'Experts' },
  { icon: MessageSquare, value: '2400+', label: 'Answers' },
  { icon: Star, value: '4.9', label: 'Rating' },
]

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] }

const inputClass =
  '!rounded-xl !bg-[#fafafa] !border-black/20 !text-black !shadow-none placeholder:!text-black/45 focus:!border-black/40 focus:!bg-white focus:!ring-2 focus:!ring-black/10'

function AuthVisual() {
  return (
    <div className="relative hidden h-full min-h-screen w-full overflow-hidden lg:block">
      <img
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=1600&fit=crop"
        alt="Founders and experts collaborating"
        className="absolute inset-0 h-full w-full object-cover grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/85 via-neutral-800/75 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      <svg
        className="pointer-events-none absolute -right-1 top-0 z-20 h-full w-28 text-[#f5f5f5] xl:w-36"
        viewBox="0 0 120 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0,0 C70,80 25,220 85,380 C120,520 35,660 120,800 L120,0 Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
        <Logo />

        <div className="max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.1 }}
            className="text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-5xl"
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
            className="mt-10 flex flex-wrap gap-3"
          >
            {TRUST_STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md ring-1 ring-white/15"
              >
                <stat.icon size={16} className="text-white/90" />
                <div>
                  <p className="text-sm font-semibold text-white">{stat.value}</p>
                  <p className="text-[10px] text-white/70">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="text-xs text-white/60">Secure · Verified experts · Pay per question</p>
      </div>
    </div>
  )
}

export default function Auth({ initialMode }) {
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

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
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
            <Logo />
            <p className="mt-3 text-lg font-semibold text-white leading-snug">
              Ask better questions. Get real answers.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-shell relative flex w-full flex-col justify-center bg-[#f5f5f5] px-5 py-10 sm:px-8 lg:w-[55%] lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="relative mx-auto w-full max-w-[440px]"
        >
          <div className="overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_12px_48px_rgba(0,0,0,0.07)]">
            <div className="border-b border-black/10 px-8 pb-6 pt-8 md:px-10 md:pt-10">
              <Logo light={false} className="mb-6 lg:hidden" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/60">
                {isSignup ? 'Get started' : 'Sign in'}
              </p>
              <h1 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-black md:text-3xl">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-black/65">
                {isSignup
                  ? 'Start asking questions in under a minute.'
                  : 'Sign in to view your questions and expert responses.'}
              </p>
            </div>

            <div className="px-8 py-6 md:px-10 md:py-8">
              {formError && (
                <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <AnimatePresence initial={false}>
                  {isSignup && (
                    <motion.div
                      key="name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <Input
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
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <Input
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
                      className="text-sm font-medium text-black/70 transition-colors hover:text-black"
                    >
                      Forgot Password
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authBusy}
                  className="mt-1 w-full rounded-xl bg-[#1A1C1C] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] transition-all hover:bg-[#1A1C1C]/90 hover:shadow-[0_6px_20px_rgba(0,0,0,0.22)] disabled:opacity-50"
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

              <div className="mt-5">
                <div className="mb-5 flex items-center gap-3" aria-hidden="true">
                  <div className="h-px flex-1 bg-black/15" />
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-black/55">
                    or
                  </span>
                  <div className="h-px flex-1 bg-black/15" />
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
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-black/70 transition-colors hover:text-black"
                >
                  <ArrowLeft size={16} />
                  Back to home
                </Link>
              </div>
            </div>

            <div className="border-t border-black/10 bg-[#fafafa] px-8 py-5 md:px-10">
              <p className="text-center text-sm text-black/70">
                {isSignup ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-black underline-offset-2 hover:underline"
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
                      className="font-semibold text-black underline-offset-2 hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </p>

              {isSignup && (
                <p className="mt-3 text-center text-xs leading-relaxed text-black/55">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="font-medium text-black/75 underline hover:text-black">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-black/75 underline hover:text-black">
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
