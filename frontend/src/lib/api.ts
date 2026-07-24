import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Pour les FormData, laisser le navigateur poser Content-Type avec la boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  return config
})

let redirecting = false

// Routes publiques auth : le 401 = mauvais identifiants, pas session expirée
const AUTH_PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/forgot-password', '/auth/reset-password', '/auth/admin/confirm']

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url ?? ''
    const isPublicAuth = AUTH_PUBLIC_PATHS.some((p) => url.includes(p))
    if (err.response?.status === 401 && typeof window !== 'undefined' && !redirecting && !isPublicAuth) {
      redirecting = true
      // Vider store + cookies + token, puis rediriger sans reboucler
      useAuthStore.getState().clearAuth()
      window.location.replace('/auth/login?expired=1')
      setTimeout(() => { redirecting = false }, 3000)
    }
    return Promise.reject(err)
  }
)

export default api
