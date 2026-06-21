'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
        <p className="text-gray-500 mb-8">
          Entrez votre email pour recevoir un code de réinitialisation.
        </p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email')} type="email" placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3">
            {isSubmitting ? 'Envoi...' : 'Envoyer le code'}
          </Button>
        </form>

        <p className="mt-6 text-center">
          <Link href="/auth/login" className="text-blue-600 hover:underline text-sm">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
