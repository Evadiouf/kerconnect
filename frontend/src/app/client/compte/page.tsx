'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

const profileSchema = z.object({
  name:  z.string().min(2, 'Nom requis'),
  phone: z.string().optional(),
})

const pwdSchema = z.object({
  current_password:  z.string().min(1, 'Requis'),
  password:          z.string().min(8, 'Minimum 8 caractères'),
  password_confirmation: z.string(),
}).refine(d => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
})

type ProfileData = z.infer<typeof profileSchema>
type PwdData     = z.infer<typeof pwdSchema>

export default function MonComptePage() {
  const { user, setAuth, token } = useAuthStore()
  const [profileMsg, setProfileMsg] = useState('')
  const [pwdMsg,     setPwdMsg]     = useState('')

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '' },
  })

  const pwdForm = useForm<PwdData>({ resolver: zodResolver(pwdSchema) })

  const onProfileSubmit = async (data: ProfileData) => {
    setProfileMsg('')
    try {
      const res = await api.put('/v1/account', data)
      if (user && token) setAuth(res.data.user, token)
      setProfileMsg('Profil mis à jour avec succès.')
    } catch { setProfileMsg('Erreur lors de la mise à jour.') }
  }

  const onPwdSubmit = async (data: PwdData) => {
    setPwdMsg('')
    try {
      await api.put('/v1/account/password', data)
      pwdForm.reset()
      setPwdMsg('Mot de passe modifié avec succès.')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setPwdMsg(e.response?.data?.message || 'Erreur.')
    }
  }

  const ROLE_LABELS: Record<string, string> = {
    client: 'Client / Locataire', bailleur: 'Bailleur',
    proprietaire: 'Propriétaire', admin: 'Administrateur',
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon compte</h1>

        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5">Informations personnelles</h2>

          {profileMsg && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${profileMsg.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {profileMsg}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                {ROLE_LABELS[user?.role || 'client']}
              </span>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
              <input {...profileForm.register('name')} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              {profileForm.formState.errors.name && <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input {...profileForm.register('phone')} placeholder="+221 77 000 00 00" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={user?.email} disabled className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
            <Button type="submit" disabled={profileForm.formState.isSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white">
              {profileForm.formState.isSubmitting ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </form>
        </div>

        {/* Changer mot de passe */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5">Changer le mot de passe</h2>

          {pwdMsg && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${pwdMsg.includes('succès') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {pwdMsg}
            </div>
          )}

          <form onSubmit={pwdForm.handleSubmit(onPwdSubmit)} className="space-y-4">
            {[
              { name: 'current_password' as const, label: 'Mot de passe actuel' },
              { name: 'password' as const,          label: 'Nouveau mot de passe' },
              { name: 'password_confirmation' as const, label: 'Confirmer le nouveau mot de passe' },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input {...pwdForm.register(name)} type="password" placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                {pwdForm.formState.errors[name] && <p className="text-red-500 text-sm mt-1">{pwdForm.formState.errors[name]?.message}</p>}
              </div>
            ))}
            <Button type="submit" disabled={pwdForm.formState.isSubmitting} className="bg-blue-900 hover:bg-blue-800 text-white">
              {pwdForm.formState.isSubmitting ? 'Modification...' : 'Modifier le mot de passe'}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
