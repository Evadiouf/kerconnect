'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'

const schema = z.object({
  titre:       z.string().min(5, 'Titre requis (5 caractères min)'),
  type:        z.string().min(1, 'Type requis'),
  nature:      z.enum(['location', 'vente']),
  prix:        z.coerce.number().min(1, 'Prix requis'),
  adresse:     z.string().min(3, 'Adresse requise'),
  ville:       z.string().min(2, 'Ville requise'),
  description: z.string().optional(),
  surface:     z.coerce.number().optional(),
  chambres:    z.coerce.number().min(0).optional(),
  salles_bain: z.coerce.number().min(0).optional(),
})

type FormData = z.infer<typeof schema>

const VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Touba', 'Kaolack', 'Mbour', 'Rufisque', 'Louga', 'Fatick']
const TYPES  = ['Appartement', 'Villa', 'Studio', 'Maison', 'Bureau', 'Commerce', 'Terrain']

const INPUT_CLASS = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors'

export default function ModifierAnnoncePage() {
  const { id }  = useParams()
  const router  = useRouter()

  const { data: bien, isLoading } = useQuery({
    queryKey: ['bien', id],
    queryFn:  () => api.get(`/v1/biens/${id}`).then(r => r.data),
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  })

  useEffect(() => {
    if (bien) {
      reset({
        titre:       bien.titre       ?? '',
        type:        bien.type        ?? '',
        nature:      bien.nature      ?? 'location',
        prix:        bien.prix        ?? 0,
        adresse:     bien.adresse     ?? '',
        ville:       bien.ville       ?? '',
        description: bien.description ?? '',
        surface:     bien.surface     ?? undefined,
        chambres:    bien.chambres    ?? 0,
        salles_bain: bien.salles_bain ?? 0,
      })
    }
  }, [bien, reset])

  const updateAnnonce = useMutation({
    mutationFn: (data: FormData) => api.put(`/v1/bailleur/biens/${id}`, data),
    onSuccess: () => router.push(`/bailleur/annonces/${id}`),
  })

  const [serverError, setServerError] = [
    (updateAnnonce.error as { response?: { data?: { message?: string } } } | null)
      ?.response?.data?.message ?? '',
    () => {},
  ]

  const onSubmit = async (data: FormData) => {
    await updateAnnonce.mutateAsync(data).catch(() => {})
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E05C52', borderTopColor: 'transparent' }} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;annonce</h1>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-2 gap-4">

              {/* Titre */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l&apos;annonce *</label>
                <input {...register('titre')} placeholder="Ex: Villa moderne avec piscine" className={INPUT_CLASS} />
                {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre.message}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien *</label>
                <select {...register('type')} className={INPUT_CLASS}>
                  <option value="">Sélectionner</option>
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
              </div>

              {/* Nature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nature *</label>
                <select {...register('nature')} className={INPUT_CLASS}>
                  <option value="location">Location</option>
                  <option value="vente">Vente</option>
                </select>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
                <input {...register('prix')} type="number" min="0" placeholder="0" className={INPUT_CLASS} />
                {errors.prix && <p className="text-red-500 text-sm mt-1">{errors.prix.message}</p>}
              </div>

              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                <select {...register('ville')} className={INPUT_CLASS}>
                  <option value="">Sélectionner</option>
                  {VILLES.map((v) => <option key={v}>{v}</option>)}
                </select>
                {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville.message}</p>}
              </div>

              {/* Adresse */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <input {...register('adresse')} placeholder="Ex: Cité Mermoz, Bloc B" className={INPUT_CLASS} />
                {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse.message}</p>}
              </div>

              {/* Surface */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                <input {...register('surface')} type="number" min="0" placeholder="0" className={INPUT_CLASS} />
              </div>

              {/* Chambres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                <input {...register('chambres')} type="number" min="0" className={INPUT_CLASS} />
              </div>

              {/* Salles de bain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                <input {...register('salles_bain')} type="number" min="0" className={INPUT_CLASS} />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows={4} placeholder="Décrivez votre bien en détail..."
                  className={`${INPUT_CLASS} resize-none`} />
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || updateAnnonce.isPending}
              className="flex-1 py-3 px-6 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#E05C52' }}
            >
              {updateAnnonce.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
