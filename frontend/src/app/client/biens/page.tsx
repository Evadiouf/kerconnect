'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { Building2, MapPin } from 'lucide-react'

interface Bien {
  id: number
  titre: string
  ville: string
  type: string
  prix: number
  nature: string
}

interface Demande {
  id: number
  statut: string
  created_at: string
  bien: Bien
}

const STATUT_BADGE: Record<string, { label: string; color: string }> = {
  en_cours: { label: 'En cours',  color: 'bg-blue-100 text-blue-700' },
  acceptee: { label: 'Acceptée',  color: 'bg-green-100 text-green-700' },
}

export default function MesBiensPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['client-biens-actifs'],
    queryFn: () => api.get('/v1/client/demandes?per_page=100').then(r => r.data),
  })

  const biens: Demande[] = (data?.data || []).filter((d: Demande) =>
    d.statut === 'acceptee' || d.statut === 'en_cours'
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes biens</h1>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            Chargement...
          </div>
        ) : biens.length === 0 ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <Building2 size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="font-medium text-gray-900 mb-2">Aucun bien actif</p>
              <p className="text-gray-500 text-sm mb-6">
                Vos biens loués ou en cours d&apos;acquisition apparaîtront ici une fois votre demande acceptée.
              </p>
              <Link
                href="/location"
                className="text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-block"
                style={{ backgroundColor: '#E05C52' }}
              >
                Chercher un bien
              </Link>
            </div>

            {/* Info contrat */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#4338CA' }} />
                <div>
                  <p className="font-medium text-sm" style={{ color: '#4338CA' }}>Comment ça marche ?</p>
                  <p className="text-sm mt-1" style={{ color: '#4338CA', opacity: 0.85 }}>
                    Faites une demande sur un bien → Le bailleur l&apos;accepte → Signez le contrat électroniquement → Le bien apparaît ici.
                  </p>
                  <Link href="/client/demandes" className="text-sm hover:underline mt-2 inline-block" style={{ color: '#E05C52' }}>
                    Voir mes demandes →
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {biens.map((demande) => {
              const badge = STATUT_BADGE[demande.statut] || { label: demande.statut, color: 'bg-gray-100 text-gray-500' }
              const bien = demande.bien
              return (
                <div
                  key={demande.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{bien?.titre}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />{bien?.ville}
                      </span>
                      <span className="capitalize">{bien?.type}</span>
                    </div>
                    <p className="font-semibold text-sm mt-2" style={{ color: '#E05C52' }}>
                      {bien?.prix?.toLocaleString('fr-FR')} FCFA
                      {bien?.nature === 'location' ? '/mois' : ''}
                    </p>
                  </div>

                  <Link
                    href={`/client/demandes/${demande.id}`}
                    className="text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex-shrink-0"
                    style={{ backgroundColor: '#4338CA' }}
                  >
                    Voir la demande
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
