import { useGoogleOneTapLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { DASHBOARD_ROUTES } from '../../constants'

const DISMISS_KEY = 'replyfy-onetap-dismissed'

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function markDismissed() {
  try {
    sessionStorage.setItem(DISMISS_KEY, '1')
  } catch {
    /* ignore */
  }
}

/**
 * Native Google One Tap prompt (top-right) for guests on landing.
 * Requires VITE_GOOGLE_CLIENT_ID and GoogleOAuthProvider.
 */
export default function GoogleOneTapPrompt() {
  const { isAuthenticated, loading, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const disabled = loading || isAuthenticated || wasDismissed()

  useGoogleOneTapLogin({
    disabled,
    cancel_on_tap_outside: false,
    auto_select: false,
    use_fedcm_for_prompt: true,
    onSuccess: async (credentialResponse) => {
      if (!credentialResponse?.credential) return
      try {
        const res = await loginWithGoogle({ credential: credentialResponse.credential })
        toast.success('Welcome to Replyfy')
        const path = DASHBOARD_ROUTES[res?.user?.role] || '/dashboard'
        navigate(path)
      } catch (err) {
        toast.error(err?.message || 'Google sign-in failed. Please try again.')
      }
    },
    onError: () => {
      /* User closed or One Tap unavailable — stay on page */
    },
    promptMomentNotification: (notification) => {
      if (
        notification.isDismissedMoment?.() ||
        notification.isSkippedMoment?.() ||
        notification.isNotDisplayed?.()
      ) {
        markDismissed()
      }
    },
  })

  return null
}
