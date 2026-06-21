'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Star, CheckCircle, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BailleurDemandeDetailPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const qc      = useQueryClient()

  const { data: demande, isLoading } = useQuery({
    queryKey: ['bailleur-demande', id],
    queryFn:  () => api.get(`/v1/bailleur/demandes/${id}`).then(r => r.data),
  })

  const update = useMutation({
    mutationFn: (statut: string) => api.put(`/v1/bailleur/demandes/${id}`, { statut }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bailleur-demande', id] })
      qc.invalidateQueries({ queryKey: ['bailleur-demandes'] })
    },
  })

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  if (!demande) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <p className="text-gray-500">Demande introuvable.</p>
        <Link href="/bailleur/demandes" className="text-indigo-600 hover:underline mt-2 block">← Retour</Link>
      </div>
    </DashboardLayout>
  )

  const bien = demande.bien
  const demandeur = demande.demandeur

  const STATUT_COLORS: Record<string, string> = {
    soumise:  'bg-yellow-100 text-yellow-700',
    en_cours: 'bg-blue-100 text-blue-700',
    acceptee: 'bg-green-100 text-green-700',
    refusee:  'bg-red-100 text-red-700',
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Détail de la demande</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[demande.statut] || 'bg-gray-100 text-gray-600'}`}>
              {demande.statut}
            </span>
          </div>
          {demande.statut === 'soumise' && (
            <div className="flex gap-3">
              <Button onClick={() => update.mutate('refusee')} disabled={update.isPending}
                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-5">
                Supprimer
              </Button>
              <Button onClick={() => update.mutate('acceptee')} disabled={update.isPending}
                className="bg-green-500 hover:bg-green-600 text-white px-5">
                Accepter
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image du bien */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-64 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
                <span className="text-6xl">🏠</span>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bien?.nature === 'location' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {bien?.nature === 'location' ? 'Louer' : 'Vente'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{bien?.titre}</h2>
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <MapPin size={14} />
                  <span>{bien?.adresse}, {bien?.ville}</span>
                </div>

                {/* Caractéristiques */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                  {bien?.chambres > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Bed size={15} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{bien.chambres}</p>
                        <p className="text-xs text-gray-400">Chambres</p>
                      </div>
                    </div>
                  )}
                  {bien?.salles_bain > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Bath size={15} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{bien.salles_bain}</p>
                        <p className="text-xs text-gray-400">Salles de bain</p>
                      </div>
                    </div>
                  )}
                  {bien?.surface && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Maximize size={15} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{bien.surface} m²</p>
                        <p className="text-xs text-gray-400">Superficie</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {bien?.description && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Description du bien</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{bien.description}</p>
              </div>
            )}

            {/* Équipements */}
            {bien?.equipements?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Ce que ce bien propose</h3>
                <div className="grid grid-cols-2 gap-3">
                  {bien.equipements.map((eq: string) => (
                    <div key={eq} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                      {eq}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations de la demande */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Informations de la demande</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{demande.type}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Date de soumission</p>
                  <p className="font-medium text-gray-900">{new Date(demande.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                {demande.date_emmenagement && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Date d'emménagement souhaitée</p>
                    <p className="font-medium text-gray-900">{new Date(demande.date_emmenagement).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {demande.duree_souhaitee && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Durée souhaitée</p>
                    <p className="font-medium text-gray-900">{demande.duree_souhaitee}</p>
                  </div>
                )}
                {demande.description && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs mb-1">Message du demandeur</p>
                    <p className="text-gray-700">{demande.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-4">
            {/* Prix */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">
                {bien?.nature === 'location' ? 'LOYER MENSUEL' : 'PRIX DE VENTE'}
              </p>
              <p className="text-3xl font-bold text-orange-500">
                {bien?.prix?.toLocaleString('fr-FR')} FCFA{bien?.nature === 'location' ? '/mois' : ''}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-500">4.8</span>
              </div>
            </div>

            {/* Informations du demandeur */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Information du demandeur</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {demandeur?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{demandeur?.name}</p>
                  <p className="text-xs text-gray-400">{demande.prenom_nom}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  <span>{demandeur?.email}</span>
                </div>
                {demande.telephone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{demande.telephone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {demande.statut === 'soumise' && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <Button onClick={() => update.mutate('acceptee')} disabled={update.isPending}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3">
                  Accepter la demande
                </Button>
                <Button onClick={() => update.mutate('refusee')} disabled={update.isPending}
                  className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 py-3">
                  Refuser
                </Button>
              </div>
            )}

            {demande.statut === 'acceptee' && !demande.contrat && (
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3">
                Créer le contrat
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
