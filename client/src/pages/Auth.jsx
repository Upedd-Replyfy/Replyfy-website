import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Users, MessageSquare, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '../components/ui/Logo'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'

const TRUST_STATS = [
  { icon: Users, value: '120+', label: 'Experts' },
  { icon: MessageSquare, value: '2400+', label: 'Answers' },
  { icon: Star, value: '4.9', label: 'Rating' },
]

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] }

const inputClass =
  'rounded-2xl px-5 py-4 text-base bg-card border-border text-ink shadow-[var(--shadow-luxury-sm)] placeholder:text-muted-light focus:border-charcoal focus:ring-charcoal/10'

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
        className="pointer-events-none absolute -right-px top-0 z-20 h-full w-28 text-black xl:w-36"
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
        <Logo className="[&_span:last-child]:text-white [&_span:first-child]:bg-white [&_span:first-child]:text-ink" />

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
  const { login, register, getDashboardPath } = useAuth()
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
        toast.success('Account created successfully')
      } else {
        await login(loginForm)
        toast.success('Welcome back')
      }
      const from = location.state?.from?.pathname
      navigate(from || getDashboardPath(), { replace: true })
    } catch (err) {
      setFormError(
        err.message ||
          (isSignup ? 'Registration failed. Please try again.' : 'Login failed. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-black">
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
            <Logo className="[&_span:last-child]:text-white [&_span:first-child]:bg-white [&_span:first-child]:text-ink" />
            <p className="mt-3 text-lg font-semibold text-white leading-snug">
              Ask better questions. Get real answers.
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex w-full flex-col justify-center bg-black px-5 py-12 sm:px-10 lg:w-[55%] lg:px-14 xl:px-20 [&_label]:text-white/80 [&_input]:border-border [&_input]:bg-card [&_input]:text-ink [&_p.text-xs]:text-red-400">
        <Link
          to="/"
          className="relative mb-8 inline-flex w-fit items-center gap-2 text-sm text-white/50 transition-colors hover:text-white lg:absolute lg:left-14 lg:top-8"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <motion.div
          layout
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="relative mx-auto w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="mt-3 text-base text-white/50">
                {isSignup
                  ? 'Start asking questions in under a minute.'
                  : 'Sign in to view your questions and expert responses.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {formError && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {formError}
            </motion.p>
          )}

          <motion.form
            layout
            onSubmit={handleSubmit}
            className="mt-8 space-y-4"
            noValidate
            transition={transition}
          >
            <AnimatePresence mode="popLayout">
              {isSignup && (
                <motion.div
                  key="name-field"
                  layout
                  initial={{ opacity: 0, height: 0, y: 12 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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

            <motion.div layout transition={transition}>
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
            </motion.div>

            <motion.div layout transition={transition}>
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
            </motion.div>

            <AnimatePresence mode="popLayout">
              {isSignup && (
                <motion.div
                  key="confirm-field"
                  layout
                  initial={{ opacity: 0, height: 0, y: 12 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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

            <AnimatePresence>
              {!isSignup && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-end"
                >
                  <Link
                    to="/forgot-password"
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    Forgot Password
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              layout
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full rounded-2xl px-6 py-4 text-sm font-semibold disabled:opacity-50"
              transition={transition}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={loading ? 'loading' : mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="block"
                >
                  {loading
                    ? isSignup
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isSignup
                      ? 'Create Account'
                      : 'Sign In'}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.form>

          <motion.p layout className="mt-8 text-center text-sm text-white/50" transition={transition}>
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-white underline-offset-2 hover:underline"
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
                  className="font-semibold text-white underline-offset-2 hover:underline"
                >
                  Sign Up
                </button>
              </>
            )}
          </motion.p>

          <AnimatePresence>
            {isSignup && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4 overflow-hidden text-center text-xs leading-relaxed text-white/40"
              >
                By creating an account, you agree to our{' '}
                <a href="#" className="underline hover:text-white">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-white">
                  Privacy Policy
                </a>
                .
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
