'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Star, CheckCircle, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ClientDemandeDetailPage() {
  const { id }  = useParams()
  const router  = useRouter()

  const { data: demande, isLoading } = useQuery({
    queryKey: ['client-demande', id],
    queryFn:  () => api.get(`/v1/client/demandes/${id}`).then(r => r.data),
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
        <Link href="/client/demandes" className="text-indigo-600 hover:underline mt-2 block">← Retour</Link>
      </div>
    </DashboardLayout>
  )

  const bien = demande.bien
  const contrat = demande.contrat

  const STATUT_COLORS: Record<string, string> = {
    soumise:  'bg-yellow-100 text-yellow-700',
    en_cours: 'bg-blue-100 text-blue-700',
    acceptee: 'bg-green-100 text-green-700',
    refusee:  'bg-red-100 text-red-700',
  }

  const STATUT_LABELS: Record<string, string> = {
    soumise:  'Soumise — En attente de réponse',
    en_cours: 'En cours de traitement',
    acceptee: 'Acceptée — À signer',
    refusee:  'Refusée',
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Détail de la demande</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[demande.statut] || 'bg-gray-100 text-gray-600'}`}>
            {demande.statut}
          </span>
        </div>

        {/* Statut Banner */}
        <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 ${
          demande.statut === 'acceptee' ? 'bg-green-50 border border-green-200' :
          demande.statut === 'refusee'  ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            demande.statut === 'acceptee' ? 'bg-green-500' :
            demande.statut === 'refusee'  ? 'bg-red-500' : 'bg-blue-500'
          }`} />
          <p className={`text-sm font-medium ${
            demande.statut === 'acceptee' ? 'text-green-800' :
            demande.statut === 'refusee'  ? 'text-red-800' : 'text-blue-800'
          }`}>
            {STATUT_LABELS[demande.statut] || demande.statut}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bien concerné */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-56 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center relative">
                <span className="text-6xl">🏠</span>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bien?.nature === 'location' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {bien?.nature === 'location' ? 'Location' : 'Vente'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{bien?.titre}</h2>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                  <MapPin size={14} />
                  <span>{bien?.adresse}, {bien?.ville}</span>
                </div>
                <div className="flex gap-5 pt-4 border-t border-gray-100">
                  {bien?.chambres > 0 && (
                    <div className="flex items-center gap-2">
                      <Bed size={16} className="text-indigo-500" />
                      <span className="text-sm text-gray-600">{bien.chambres} ch.</span>
                    </div>
                  )}
                  {bien?.salles_bain > 0 && (
                    <div className="flex items-center gap-2">
                      <Bath size={16} className="text-orange-500" />
                      <span className="text-sm text-gray-600">{bien.salles_bain} sdb.</span>
                    </div>
                  )}
                  {bien?.surface && (
                    <div className="flex items-center gap-2">
                      <Maximize size={16} className="text-green-500" />
                      <span className="text-sm text-gray-600">{bien.surface} m²</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Équipements */}
            {bien?.equipements?.length > 0 && (
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

            {/* Détails de ma demande */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Mes informations de demande</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Nom</p>
                  <p className="font-medium text-gray-900">{demande.prenom_nom}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{demande.type}</p>
                </div>
                {demande.telephone && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Téléphone</p>
                    <p className="font-medium text-gray-900">{demande.telephone}</p>
                  </div>
                )}
                {demande.date_emmenagement && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Date d'emménagement</p>
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
                    <p className="text-gray-400 text-xs mb-1">Mon message</p>
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
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Date de soumission</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Actions selon statut */}
            {demande.statut === 'acceptee' && !contrat && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="font-bold text-green-800 mb-2">🎉 Demande acceptée !</h3>
                <p className="text-sm text-green-700 mb-4">
                  Le bailleur a accepté votre demande. La prochaine étape est la signature du contrat.
                </p>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Continuer la demande
                </Button>
                <Button className="w-full mt-2 bg-white text-green-700 border border-green-200 hover:bg-green-50">
                  Demander une visite
                </Button>
              </div>
            )}

            {contrat && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">Contrat</h3>
                <p className="text-sm text-gray-500 mb-3">N° {contrat.numero}</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Voir le contrat
                </Button>
              </div>
            )}

            {/* Contact bailleur */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Contacter le bailleur</h3>
              <div className="space-y-2 text-sm">
                {bien?.bailleur?.phone && (
                  <a href={`tel:${bien.bailleur.phone}`} className="flex items-center gap-2 text-indigo-600 hover:underline">
                    <Phone size={14} />
                    {bien.bailleur.phone}
                  </a>
                )}
                {bien?.bailleur?.email && (
                  <a href={`mailto:${bien.bailleur.email}`} className="flex items-center gap-2 text-indigo-600 hover:underline">
                    <Mail size={14} />
                    {bien.bailleur.email}
                  </a>
                )}
              </div>
            </div>

            <Link href={`/biens/${bien?.id}`}>
              <Button className="w-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">
                Voir l&apos;annonce →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
