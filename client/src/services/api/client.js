import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed'
    if (error.response?.status === 401 && !error.config?._retry) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken && !error.config.url?.includes('/auth/refresh')) {
        try {
          error.config._retry = true
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
          localStorage.setItem('token', data.token)
          localStorage.setItem('refreshToken', data.refreshToken)
          error.config.headers.Authorization = `Bearer ${data.token}`
          return api(error.config)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(new Error(message))
  }
)

export default api
