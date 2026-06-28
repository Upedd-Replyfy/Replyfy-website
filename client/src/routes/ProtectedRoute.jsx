import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" />
    </div>
  )
}

export function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (roles && !roles.includes(user.role)) {
    const redirect = user.role === 'admin' ? '/admin' : user.role === 'expert' ? '/expert' : '/dashboard'
    return <Navigate to={redirect} replace />
  }

  return <Outlet />
}

export function GuestRoute({ children }) {
  const { user, loading, getDashboardPath } = useAuth()

  if (loading) return <LoadingScreen />
  if (user) return <Navigate to={getDashboardPath()} replace />
  return children
}
