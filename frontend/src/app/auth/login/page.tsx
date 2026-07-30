'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { KerConnectLogo } from '@/components/ui/Logo'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { Eye, EyeOff } from 'lucide-react'

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


function LoginForm() {
  const router   = useRouter()
  const params   = useSearchParams()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const [error, setError]         = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [adminPending, setAdminPending] = useState(false)

  const verified = params.get('verified') === '1'
  const expired  = params.get('expired')  === '1'
  const reset    = params.get('reset')    === '1'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.post('/v1/auth/login', data)

      // Login admin : confirmation par email requise
      if (res.data.pending_admin_confirmation) {
        setAdminPending(true)
        return
      }

      setAuth(res.data.user, res.data.token)
      const role = res.data.role
      const user = res.data.user
      // Bailleur/propriétaire sans frais d'inscription payés → page dédiée
      if (['bailleur', 'proprietaire'].includes(role) && !user.inscription_payee) {
        router.push('/auth/paiement-inscription')
        return
      }
      router.push(ROLE_REDIRECT[role] || '/')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      if (!e.response) {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.')
        return
      }
      setError(e.response?.data?.message || 'Identifiants incorrects.')
    }
  }

  if (adminPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-5">📧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Vérifiez votre email</h2>
          <p className="text-gray-500 text-sm mb-4 leading-relaxed">
            Un lien de confirmation a été envoyé à<br />
            <strong className="text-gray-900">contact@naratechvision.com</strong>
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Cliquez sur le lien dans l&apos;email pour accéder au tableau de bord admin.
            Le lien expire dans <strong>15 minutes</strong>.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            Si vous n&apos;avez pas reçu l&apos;email, vérifiez vos spams ou réessayez de vous connecter.
          </div>
          <button
            onClick={() => setAdminPending(false)}
            className="mt-6 text-sm font-medium hover:underline"
            style={{ color: '#4338CA' }}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════
          PANNEAU GAUCHE — Formulaire
      ══════════════════════════ */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <KerConnectLogo width={130} />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h2>
          <p className="text-gray-400 text-sm mb-8">
            Accédez à votre espace pour suivre vos démarches en ligne
          </p>

          {verified && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">✅ Email vérifié, vous pouvez vous connecter.</div>}
          {reset    && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm">✅ Mot de passe réinitialisé avec succès.</div>}
          {expired  && <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl mb-5 text-sm">⚠️ Session expirée, veuillez vous reconnecter.</div>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Identifiant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Identifiant
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="votre@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors placeholder-gray-300"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Lien mot de passe oublié */}
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm hover:underline" style={{ color: '#E05C52' }}>
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#E05C52' }}
            >
              {isSubmitting && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* Google OAuth — activé au déploiement par Hawoly */}

          <p className="mt-6 text-center text-sm text-gray-500">
            Vous n&apos;avez pas de compte ?{' '}
            <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: '#E05C52' }}>
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>

      {/* ══════════════════════════
          PANNEAU DROIT — Image + texte
      ══════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=85"
          alt="Maison KerConnect"
          fill
          priority
          className="object-cover"
          sizes="55vw"
        />
        {/* Overlay dégradé pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Texte en bas de l'image */}
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-extrabold leading-tight mb-2">
            Louez et achetez des
            <br />
            appartements,
            <br />
            <span style={{ color: '#E05C52' }}>simplement et en ligne</span>
          </h2>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#E05C52] border-t-transparent rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
