'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  type:               z.enum(['location', 'achat', 'visite']),
  prenom_nom:         z.string().min(2, 'Nom requis'),
  telephone:          z.string().optional(),
  description:        z.string().optional(),
  date_emmenagement:  z.string().optional(),
  duree_souhaitee:    z.string().optional(),
  date_visite:        z.string().optional(),
  heure_visite:       z.string().optional(),
})

type FormData = z.infer<typeof schema>

const TYPE_LABELS: Record<string, string> = {
  location: 'Demande de location',
  achat:    "Demande d'achat",
  visite:   'Demande de visite',
}

function NouvelleDemandeForm() {
  const params  = useSearchParams()
  const router  = useRouter()
  const { user } = useAuthStore()
  const bienId  = params.get('bien_id')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      type:       (params.get('type') as FormData['type']) || 'location',
      prenom_nom: user?.name || '',
    },
  })

  const type = watch('type')

  const onSubmit = async (data: FormData) => {
    setError('')
    if (!bienId) {
      setError('Aucun bien sélectionné. Veuillez choisir un bien depuis le catalogue.')
      return
    }
    try {
      await api.post('/v1/client/demandes', { ...data, bien_id: bienId })
      setSuccess(true)
      setTimeout(() => router.push('/client/demandes'), 2000)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Erreur lors de la soumission.')
    }
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
          <p className="text-gray-500">Votre demande a été soumise. Le bailleur vous répondra sous 24-48h.</p>
          <p className="text-sm text-gray-400 mt-4">Redirection en cours...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{TYPE_LABELS[type]}</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">

          {/* Type de demande */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de demande</label>
            <div className="flex gap-3">
              {(['location', 'achat', 'visite'] as const).map((t) => (
                <label key={t}
                  className={`flex-1 text-center py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${type === t ? '' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  style={type === t ? {
                    borderColor: '#E05C52',
                    backgroundColor: 'rgba(224,92,82,0.05)',
                    color: '#E05C52',
                  } : {}}>
                  <input {...register('type')} type="radio" value={t} className="hidden" />
                  {TYPE_LABELS[t].split(' ')[1]}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom et nom *</label>
              <input {...register('prenom_nom')} placeholder="Votre nom complet"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
              {errors.prenom_nom && <p className="text-red-500 text-sm mt-1">{errors.prenom_nom.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input {...register('telephone')} placeholder="+221 77 000 00 00"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
            </div>
          </div>

          {type === 'location' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;emménagement souhaitée</label>
                <input {...register('date_emmenagement')} type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée souhaitée</label>
                <select {...register('duree_souhaitee')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors">
                  <option value="">Sélectionner</option>
                  <option value="6 mois">6 mois</option>
                  <option value="1 an">1 an</option>
                  <option value="2 ans">2 ans</option>
                  <option value="Indéterminée">Indéterminée</option>
                </select>
              </div>
            </div>
          )}

          {type === 'visite' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de visite</label>
                <input {...register('date_visite')} type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                <input {...register('heure_visite')} type="time"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Message</label>
            <textarea {...register('description')} rows={4} placeholder="Présentez-vous et expliquez votre besoin..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()}
              className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#E05C52' }}>
              {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function NouvelledemandePage() {
  return <Suspense><NouvelleDemandeForm /></Suspense>
}
