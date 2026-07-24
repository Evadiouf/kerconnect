'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

export default function AdminConfirmPage() {
  const { token } = useParams<{ token: string }>()
  const router    = useRouter()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) return

    api.get(`/v1/auth/admin/confirm/${token}`)
      .then(res => {
        setAuth(res.data.user, res.data.token)
        setStatus('success')
        setTimeout(() => router.push('/admin/dashboard'), 1500)
      })
      .catch(err => {
        setMessage(err.response?.data?.message || 'Lien invalide ou expiré.')
        setStatus('error')
      })
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">

        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-5"
              style={{ borderColor: '#4338CA', borderTopColor: 'transparent' }} />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Vérification en cours…</h2>
            <p className="text-gray-400 text-sm">Merci de patienter.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-5">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion confirmée</h2>
            <p className="text-gray-500 text-sm">Redirection vers le tableau de bord admin…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-5">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Lien invalide</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: '#4338CA' }}
            >
              Retour à la connexion
            </button>
          </>
        )}

      </div>
    </div>
  )
}
