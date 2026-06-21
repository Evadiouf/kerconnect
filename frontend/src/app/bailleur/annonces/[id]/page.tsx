'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Star, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BailleurAnnonceDetailPage() {
  const { id }  = useParams()
  const router  = useRouter()

  const { data: bien, isLoading } = useQuery({
    queryKey: ['bien', id],
    queryFn:  () => api.get(`/v1/biens/${id}`).then(r => r.data),
  })

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  if (!bien) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <p className="text-gray-500">Annonce introuvable.</p>
        <Link href="/bailleur/annonces" className="text-indigo-600 hover:underline mt-2 block">← Retour</Link>
      </div>
    </DashboardLayout>
  )

  const STATUT_COLORS: Record<string, string> = {
    publie:     'bg-green-100 text-green-700',
    en_attente: 'bg-yellow-100 text-yellow-700',
    retire:     'bg-gray-100 text-gray-500',
    loue:       'bg-blue-100 text-blue-700',
    vendu:      'bg-purple-100 text-purple-700',
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
            <h1 className="text-2xl font-bold text-gray-900">Détail de l&apos;annonce</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[bien.statut] || 'bg-gray-100 text-gray-600'}`}>
              {bien.statut}
            </span>
          </div>
          <div className="flex gap-3">
            <Link href={`/bailleur/annonces/${id}/modifier`}>
              <Button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 gap-2">
                <Edit size={15} /> Modifier
              </Button>
            </Link>
            <Button className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 gap-2">
              <Trash2 size={15} /> Retirer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-72 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center">
                <span className="text-7xl">🏠</span>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bien.nature === 'location' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {bien.nature === 'location' ? 'Location' : 'Vente'}
                  </span>
                </div>
                {bien.is_new && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">Nouveau</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{bien.titre}</h2>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                  <MapPin size={14} />
                  <span>{bien.adresse}, {bien.ville}</span>
                </div>

                <div className="flex gap-6 pt-4 border-t border-gray-100">
                  {bien.chambres > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Bed size={15} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{bien.chambres}</p>
                        <p className="text-xs text-gray-400">Chambres</p>
                      </div>
                    </div>
                  )}
                  {bien.salles_bain > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Bath size={15} className="text-orange-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{bien.salles_bain}</p>
                        <p className="text-xs text-gray-400">Salles de bain</p>
                      </div>
                    </div>
                  )}
                  {bien.surface && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Maximize size={15} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{bien.surface} m²</p>
                        <p className="text-xs text-gray-400">Superficie</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {bien.description && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Description du bien</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{bien.description}</p>
              </div>
            )}

            {/* Équipements */}
            {bien.equipements?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Ce que ce bien propose</h3>
                <div className="grid grid-cols-2 gap-3">
                  {bien.equipements.map((eq: string) => (
                    <div key={eq} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500" />
                      {eq}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Découvrir le quartier */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Découvrir le quartier</h3>
              <div className="h-40 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">{bien.adresse}, {bien.ville}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">
                {bien.nature === 'location' ? 'LOYER MENSUEL' : 'PRIX DE VENTE'}
              </p>
              <p className="text-3xl font-bold text-orange-500">
                {bien.prix?.toLocaleString('fr-FR')} FCFA{bien.nature === 'location' ? '/mois' : ''}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-500">4.8</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-1">Type</p>
                <p className="text-gray-900">{bien.type}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Statistiques</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Demandes reçues</span>
                  <span className="font-bold text-gray-900">{bien.demandes?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vues</span>
                  <span className="font-bold text-gray-900">—</span>
                </div>
              </div>
              <Link href={`/bailleur/demandes?bien_id=${id}`}>
                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Voir les demandes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
