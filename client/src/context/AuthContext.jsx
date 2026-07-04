import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../services/api'
import { DASHBOARD_ROUTES } from '../constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [expertProfile, setExpertProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await authApi.getProfile()
      setUser(res.user)
      setExpertProfile(res.expertProfile || null)
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const login = async (credentials) => {
    const res = await authApi.login(credentials)
    localStorage.setItem('token', res.token)
    localStorage.setItem('refreshToken', res.refreshToken)
    setUser(res.user)
    setExpertProfile(res.expertProfile || null)
    return res
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    localStorage.setItem('token', res.token)
    localStorage.setItem('refreshToken', res.refreshToken)
    setUser(res.user)
    return res
  }

  const loginWithGoogle = async (payload) => {
    const res = await authApi.googleLogin(payload)
    localStorage.setItem('token', res.token)
    localStorage.setItem('refreshToken', res.refreshToken)
    setUser(res.user)
    setExpertProfile(res.expertProfile || null)
    return res
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      /* ignore */
    }
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setExpertProfile(null)
  }

  const getDashboardPath = () => DASHBOARD_ROUTES[user?.role] || '/dashboard'

  return (
    <AuthContext.Provider
      value={{
        user,
        expertProfile,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        loadProfile,
        getDashboardPath,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
