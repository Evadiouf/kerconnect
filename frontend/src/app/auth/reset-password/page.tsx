'use client'

import { Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

const schema = z.object({
  password:              z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
})

type FormData = z.infer<typeof schema>

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const email  = params.get('email') || ''
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await api.post('/v1/auth/reset-password', { ...data, email })
      router.push('/auth/login?reset=1')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Erreur de réinitialisation.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h2>
        <p className="text-gray-500 mb-8">Choisissez un mot de passe sécurisé pour protéger votre compte.</p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input {...register('password')} type="password" placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input {...register('password_confirmation')} type="password" placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3">
            {isSubmitting ? 'Réinitialisation...' : 'Confirmer'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>
}
