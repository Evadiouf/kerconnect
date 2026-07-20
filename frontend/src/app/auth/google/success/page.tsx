'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { Suspense } from 'react'
import { KerConnectLogo } from '@/components/ui/Logo'

function GoogleSuccessContent() {
  const params   = useSearchParams()
  const router   = useRouter()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState('')

  useEffect(() => {
    const token    = params.get('token')
    const userJson = params.get('user')

    if (!token || !userJson) {
      setError('Authentification Google échouée.')
      setTimeout(() => router.push('/auth/login'), 2000)
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userJson))
      setAuth(user, decodeURIComponent(token))

      const REDIRECT: Record<string, string> = {
        client:       '/client/dashboard',
        bailleur:     '/bailleur/dashboard',
        proprietaire: '/bailleur/dashboard',
        admin:        '/admin/dashboard',
      }
      router.push(REDIRECT[user.role] || '/')
    } catch {
      setError('Erreur lors de la connexion Google.')
      setTimeout(() => router.push('/auth/login'), 2000)
    }
  }, [params, router, setAuth])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-6">
      <KerConnectLogo width={130} />
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#E05C52' }} />
          <p className="text-sm text-gray-500">Connexion en cours...</p>
        </div>
      )}
    </div>
  )
}

export default function GoogleSuccessPage() {
  return <Suspense><GoogleSuccessContent /></Suspense>
}
