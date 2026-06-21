'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

const schema = z.object({
  titre:       z.string().min(5, 'Titre requis (5 caractères min)'),
  type:        z.string().min(1, 'Type requis'),
  nature:      z.enum(['location', 'vente']),
  prix:        z.coerce.number().min(1, 'Prix requis'),
  adresse:     z.string().min(3, 'Adresse requise'),
  ville:       z.string().min(2, 'Ville requise'),
  surface:     z.coerce.number().optional(),
  chambres:    z.coerce.number().min(0).optional(),
  salles_bain: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const TYPES = ['Appartement', 'Villa', 'Chambre', 'Studio', 'Duplex', 'Terrain', 'Immeuble']
const EQUIPEMENTS_LIST = ['Piscine', 'Jardin', 'Parking', 'Climatisation', 'Groupe électrogène', 'Sécurité', 'Ascenseur', 'Cuisine équipée', 'Terrasse', 'Wifi', 'Meublé']

const STEPS = ['Informations générales', 'Équipements', 'Pièces à joindre']

export default function AjouterAnnoncePage() {
  const router = useRouter()
  const [step, setStep]           = useState(0)
  const [equipements, setEq]      = useState<string[]>([])
  const [error, setError]         = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { nature: 'location', chambres: 0, salles_bain: 0 },
  })

  const toggleEq = (eq: string) =>
    setEq((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq])

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await api.post('/v1/bailleur/biens', { ...data, equipements })
      router.push('/bailleur/annonces?success=1')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Erreur lors de la publication.')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle annonce</h1>

        {/* Étapes */}
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-1.5 rounded-full mb-2 ${i <= step ? 'bg-blue-900' : 'bg-gray-200'}`} />
              <p className={`text-xs ${i === step ? 'text-blue-900 font-medium' : 'text-gray-400'}`}>{s}</p>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">

            {/* Étape 1 */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l&apos;annonce *</label>
                    <input {...register('titre')} placeholder="Ex: Villa moderne avec piscine" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien *</label>
                    <select {...register('type')} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Sélectionner</option>
                      {TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nature *</label>
                    <select {...register('nature')} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="location">Location</option>
                      <option value="vente">Vente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (FCFA) {watch('nature') === 'location' ? '/mois' : ''} *
                    </label>
                    <input {...register('prix')} type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.prix && <p className="text-red-500 text-sm mt-1">{errors.prix.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                    <input {...register('surface')} type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                    <input {...register('chambres')} type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                    <input {...register('salles_bain')} type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <input {...register('adresse')} placeholder="Ex: Cité Mermoz, Bloc B" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                    <input {...register('ville')} placeholder="Ex: Dakar" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors.ville && <p className="text-red-500 text-sm mt-1">{errors.ville.message}</p>}
                  </div>
                </div>
              </>
            )}

            {/* Étape 2 */}
            {step === 1 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-4">Sélectionnez les équipements disponibles</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EQUIPEMENTS_LIST.map((eq) => (
                    <button key={eq} type="button" onClick={() => toggleEq(eq)}
                      className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                        equipements.includes(eq)
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {equipements.includes(eq) ? '✓ ' : ''}{eq}
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea {...register('description')} rows={4} placeholder="Décrivez votre bien en détail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Pièces à joindre</p>
                {[
                  { label: 'Photos du bien', accept: 'image/*', multiple: true },
                  { label: 'Vidéo de présentation', accept: 'video/mp4,video/*' },
                  { label: 'Contrat de location/vente', accept: '.pdf' },
                ].map(({ label, accept, multiple }) => (
                  <div key={label} className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      {accept.includes('image') ? 'JPG, PNG, WEBP — max 5 Mo' :
                       accept.includes('video') ? 'MP4 — max 50 Mo' : 'PDF — max 10 Mo'}
                    </p>
                    <input type="file" accept={accept} multiple={multiple}
                      className="hidden" id={`file-${label}`} />
                    <label htmlFor={`file-${label}`} className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                      Choisir {multiple ? 'des fichiers' : 'un fichier'}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-4">
            {step > 0 && (
              <Button type="button" onClick={() => setStep(step - 1)} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                Retour
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStep(step + 1)} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white">
                Continuer
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white">
                {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
