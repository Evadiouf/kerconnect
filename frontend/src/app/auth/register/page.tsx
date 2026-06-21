'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name:              z.string().min(2, 'Nom requis'),
  email:             z.string().email('Email invalide'),
  phone:             z.string().optional(),
  role:              z.enum(['client', 'bailleur', 'proprietaire'], { message: 'Choisissez un profil' }),
  password:          z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
})

type FormData = z.infer<typeof schema>

const ROLES = [
  { value: 'client',       label: 'Client / Locataire', desc: 'Je cherche un bien à louer ou acheter' },
  { value: 'bailleur',     label: 'Bailleur',           desc: 'Je mets des biens en location' },
  { value: 'proprietaire', label: 'Propriétaire',       desc: 'Je vends mes biens immobiliers' },
]

export default function RegisterPage() {
  const router  = useRouter()
  const [step, setStep]   = useState(1)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.post('/v1/auth/register', data)
      // En mode dev, l'OTP est retourné directement dans la réponse
      const otpParam = res.data.otp_dev ? `&otp_dev=${res.data.otp_dev}` : ''
      router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}&type=verification${otpParam}`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string, errors?: Record<string, string[]> } } }
      const msg = e.response?.data?.message || Object.values(e.response?.data?.errors || {}).flat()[0] || 'Erreur inscription.'
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 text-white flex-col justify-center px-16">
        <h1 className="text-4xl font-bold mb-4">KerConnect</h1>
        <p className="text-xl text-blue-200">Louez et achetez des appartements, simplement et en ligne</p>
        <div className="mt-8 space-y-3">
          {['Choisissez votre profil', 'Renseignez vos informations', 'Vérifiez votre email'].map((s, i) => (
            <div key={i} className={`flex items-center gap-3 ${step > i ? 'text-white' : 'text-blue-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-white text-blue-900' : 'border border-blue-400'}`}>{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h2>
          <p className="text-gray-500 mb-8">Étape {step} / 2</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-4">
                <p className="font-medium text-gray-700 mb-3">Quel est votre profil ?</p>
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setValue('role', r.value as FormData['role'])}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${selectedRole === r.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <p className="font-medium text-gray-900">{r.label}</p>
                    <p className="text-sm text-gray-500">{r.desc}</p>
                  </button>
                ))}
                {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                <Button type="button" onClick={() => selectedRole && setStep(2)} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 mt-4">
                  Continuer
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input {...register('name')} placeholder="Prénom Nom" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input {...register('email')} type="email" placeholder="votre@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
                  <input {...register('phone')} placeholder="+221 77 000 00 00" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                  <input {...register('password')} type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                  <input {...register('password_confirmation')} type="password" placeholder="••••••••" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>}
                </div>
                <div className="flex gap-3 mt-4">
                  <Button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-100 text-gray-700 hover:bg-gray-200 py-3">
                    Retour
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="w-2/3 bg-blue-900 hover:bg-blue-800 text-white py-3">
                    {isSubmitting ? 'Création...' : "Créer mon compte"}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
