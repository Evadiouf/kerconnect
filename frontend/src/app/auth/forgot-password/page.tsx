'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KerConnectLogo } from '@/components/ui/Logo'
import api from '@/lib/api'

const schema = z.object({ email: z.string().email('Email invalide') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const router  = useRouter()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await api.post('/v1/auth/forgot-password', data)
      router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}&type=reset_password`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Erreur. Vérifiez votre email.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <KerConnectLogo width={130} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
        <p className="text-gray-500 text-sm mb-8">
          Entrez votre email pour recevoir un code de réinitialisation.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#E05C52' }}
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer le code'}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm font-medium hover:underline" style={{ color: '#E05C52' }}>
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
