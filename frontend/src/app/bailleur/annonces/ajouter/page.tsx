'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'

const schema = z.object({
  titre:       z.string().min(5, 'Titre requis (5 caractères min)'),
  type:        z.string().min(1, 'Type requis'),
  nature:      z.enum(['location', 'vente']),
  prix:        z.coerce.number().min(1, 'Prix requis'),
  caution_mois: z.preprocess(v => (v === '' || v === undefined || v === null ? undefined : Number(v)), z.number().int().min(1).max(6).optional()),
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
  const [photos, setPhotos]       = useState<File[]>([])
  const [video, setVideo]         = useState<File | null>(null)
  const [contratFile, setContrat] = useState<File | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { nature: 'location', chambres: 0, salles_bain: 0 },
  })

  const toggleEq = (eq: string) =>
    setEq((prev) => prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq])

  const submitAnnonce = async (data: FormData) => {
    setError('')
    try {
      const fd = new globalThis.FormData()
      fd.append('titre', data.titre)
      fd.append('type', data.type)
      fd.append('nature', data.nature)
      fd.append('prix', String(data.prix))
      if (data.caution_mois) fd.append('caution_mois', String(data.caution_mois))
      fd.append('adresse', data.adresse)
      fd.append('ville', data.ville)
      if (data.description) fd.append('description', data.description)
      if (data.surface)     fd.append('surface', String(data.surface))
      if (data.chambres    !== undefined && data.chambres    !== null) fd.append('chambres', String(data.chambres))
      if (data.salles_bain !== undefined && data.salles_bain !== null) fd.append('salles_bain', String(data.salles_bain))
      equipements.forEach(eq => fd.append('equipements[]', eq))
      photos.forEach(photo => fd.append('photos[]', photo))
      if (video)       fd.append('video', video)
      if (contratFile) fd.append('contrat_modele', contratFile)

      await api.post('/v1/bailleur/biens', fd)
      router.push('/bailleur/annonces?success=1')
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message || 'Erreur lors de la publication.')
    }
  }

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle annonce</h1>

        {/* Étapes */}
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 text-center">
              <div className={`h-1.5 rounded-full mb-2 ${i <= step ? '' : 'bg-gray-200'}`}
                style={i <= step ? { backgroundColor: '#4338CA' } : {}} />
              <p className={`text-xs ${i === step ? 'font-medium' : 'text-gray-400'}`}
                style={i === step ? { color: '#4338CA' } : {}}>{s}</p>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {/* Bloque Enter pour éviter une soumission accidentelle */}
        <form onSubmit={e => e.preventDefault()} onKeyDown={e => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault() }}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">

            {/* Étape 1 */}
            {step === 0 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l&apos;annonce *</label>
                    <input {...register('titre')} placeholder="Ex: Villa moderne avec piscine" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
                    {errors.titre && <p className="text-red-500 text-sm mt-1">{errors.titre.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien *</label>
                    <select {...register('type')} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors">
                      <option value="">Sélectionner</option>
                      {TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nature *</label>
                    <select {...register('nature')} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors">
                      <option value="location">Location</option>
                      <option value="vente">Vente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (FCFA) {watch('nature') === 'location' ? '/mois' : ''} *
                    </label>
                    <input {...register('prix')} type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
                    {errors.prix && <p className="text-red-500 text-sm mt-1">{errors.prix.message}</p>}
                  </div>
                  {watch('nature') === 'location' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caution (mois)</label>
                      <select {...register('caution_mois')} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors">
                        <option value="">Sans caution</option>
                        <option value="1">1 mois</option>
                        <option value="2">2 mois (standard)</option>
                        <option value="3">3 mois</option>
                      </select>
                      {watch('caution_mois') && watch('prix') ? (
                        <p className="text-xs text-gray-400 mt-1">
                          Soit {(Number(watch('caution_mois')) * Number(watch('prix'))).toLocaleString('fr-FR')} FCFA à verser
                        </p>
                      ) : null}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                    <input {...register('surface')} type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                    <input {...register('chambres')} type="number" min="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                    <input {...register('salles_bain')} type="number" min="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <input {...register('adresse')} placeholder="Ex: Cité Mermoz, Bloc B" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
                    {errors.adresse && <p className="text-red-500 text-sm mt-1">{errors.adresse.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                    <input {...register('ville')} placeholder="Ex: Dakar" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
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
                          ? 'font-medium'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                      style={equipements.includes(eq) ? {
                        borderColor: '#E05C52',
                        backgroundColor: 'rgba(224,92,82,0.03)',
                        color: '#E05C52',
                      } : {}}>
                      {equipements.includes(eq) ? '✓ ' : ''}{eq}
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea {...register('description')} rows={4} placeholder="Décrivez votre bien en détail..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors resize-none" />
                </div>
              </div>
            )}

            {/* Étape 3 */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">Pièces à joindre <span className="text-gray-400 font-normal">(optionnel)</span></p>

                {/* Photos */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-[#4338CA] transition-colors">
                  <p className="text-sm font-medium text-gray-700 mb-1">Photos du bien</p>
                  <p className="text-xs text-gray-400 mb-3">JPG, PNG, WEBP — max 5 Mo par photo</p>
                  <input type="file" accept="image/*" multiple className="hidden" id="file-photos"
                    onChange={(e) => setPhotos(Array.from(e.target.files ?? []))} />
                  <label htmlFor="file-photos" className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: 'rgba(67,56,202,0.06)', color: '#4338CA' }}>
                    Choisir des photos
                  </label>
                  {photos.length > 0 && (
                    <p className="text-xs text-green-600 mt-2">✓ {photos.length} photo(s) sélectionnée(s)</p>
                  )}
                </div>

                {/* Vidéo */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-[#4338CA] transition-colors">
                  <p className="text-sm font-medium text-gray-700 mb-1">Vidéo de présentation</p>
                  <p className="text-xs text-gray-400 mb-3">MP4 — max 50 Mo</p>
                  <input type="file" accept="video/mp4,video/*" className="hidden" id="file-video"
                    onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
                  <label htmlFor="file-video" className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: 'rgba(67,56,202,0.06)', color: '#4338CA' }}>
                    Choisir une vidéo
                  </label>
                  {video && <p className="text-xs text-green-600 mt-2">✓ {video.name}</p>}
                </div>

                {/* Contrat */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-[#4338CA] transition-colors">
                  <p className="text-sm font-medium text-gray-700 mb-1">Contrat de location/vente</p>
                  <p className="text-xs text-gray-400 mb-3">PDF — max 10 Mo</p>
                  <input type="file" accept=".pdf" className="hidden" id="file-contrat"
                    onChange={(e) => setContrat(e.target.files?.[0] ?? null)} />
                  <label htmlFor="file-contrat" className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ backgroundColor: 'rgba(67,56,202,0.06)', color: '#4338CA' }}>
                    Choisir un PDF
                  </label>
                  {contratFile && <p className="text-xs text-green-600 mt-2">✓ {contratFile.name}</p>}
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Les fichiers seront envoyés avec votre annonce lors de la publication.
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-4">
            {step > 0 && (
              <button type="button" onClick={handleBack}
                className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm transition-colors">
                Retour
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => {
                if (step === 0) {
                  // Valider étape 1 avant d'avancer
                  void handleSubmit(() => handleNext())()
                } else {
                  handleNext()
                }
              }}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#E05C52' }}>
                Continuer
              </button>
            ) : (
              <button type="button" disabled={isSubmitting}
                onClick={() => void handleSubmit(submitAnnonce)()}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#E05C52' }}>
                {isSubmitting ? 'Publication...' : 'Publier l\'annonce'}
              </button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
