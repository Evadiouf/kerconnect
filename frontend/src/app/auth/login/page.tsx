'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

type FormData = z.infer<typeof schema>

const ROLE_REDIRECT: Record<string, string> = {
  client:       '/client/dashboard',
  bailleur:     '/bailleur/dashboard',
  proprietaire: '/bailleur/dashboard',
  admin:        '/admin/dashboard',
}

export default function LoginPage() {
  const router   = useRouter()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.post('/v1/auth/login', data)
      setAuth(res.data.user, res.data.token)
      router.push(ROLE_REDIRECT[res.data.role] || '/')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Erreur de connexion.')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 text-white flex-col justify-center px-16">
        <h1 className="text-4xl font-bold mb-4">KerConnect</h1>
        <p className="text-xl text-blue-200">Louez et achetez des appartements, simplement et en ligne</p>
        <p className="mt-6 text-blue-300">Plus de 5 000 biens vérifiés · Sans frais cachés</p>
      </div>

      {/* Panneau droit */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
          <p className="text-gray-500 mb-8">Accédez à votre espace personnel</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3">
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
