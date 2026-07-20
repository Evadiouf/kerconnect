import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  name: string
  email: string
  role: 'client' | 'bailleur' | 'proprietaire' | 'admin'
  phone?: string
  is_active: boolean
  inscription_payee?: boolean
  inscription_at?: string | null
  forfait?: 'starter' | 'pro' | 'agence' | null
  verifie?: boolean
  note_moyenne?: number
  nb_avis?: number
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof document !== 'undefined') {
          const maxAge = 60 * 60 * 24 * 7
          document.cookie = `kc_auth=1; path=/; max-age=${maxAge}; SameSite=Lax`
          document.cookie = `kc_role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`
        }
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      clearAuth: () => {
        if (typeof document !== 'undefined') {
          document.cookie = `kc_auth=; path=/; max-age=0; SameSite=Lax`
          document.cookie = `kc_role=; path=/; max-age=0; SameSite=Lax`
        }
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'kerconnect-auth' }
  )
)
