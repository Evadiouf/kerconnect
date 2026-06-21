'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { Eye, MapPin } from 'lucide-react'

interface Demande {
  id: number; type: string; statut: string; created_at: string;
  bien: { id: number; titre: string; nature: string; prix: number; adresse: string; ville: string };
}

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  soumise:  { label: 'Soumise',   color: 'bg-yellow-100 text-yellow-700' },
  en_cours: { label: 'En cours',  color: 'bg-blue-100 text-blue-700' },
  acceptee: { label: 'Acceptée',  color: 'bg-green-100 text-green-700' },
  refusee:  { label: 'Refusée',   color: 'bg-red-100 text-red-700' },
  annulee:  { label: 'Annulée',   color: 'bg-gray-100 text-gray-500' },
}

export default function MesDemandesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['client-demandes'],
    queryFn:  () => api.get('/v1/client/demandes').then(r => r.data),
  })

  const demandes: Demande[] = data?.data || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">Chargement...</div>
        ) : demandes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">📋</p>
            <p className="font-medium text-gray-900 mb-2">Aucune demande</p>
            <p className="text-gray-500 text-sm mb-6">Explorez nos biens et faites votre première demande.</p>
            <Link href="/location" className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
              Explorer les biens
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {demandes.map((d) => {
              const cfg = STATUT_CONFIG[d.statut] || { label: d.statut, color: 'bg-gray-100 text-gray-500' }
              return (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{d.bien?.titre}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin size={12} />{d.bien?.adresse}, {d.bien?.ville}</span>
                      <span className="capitalize">{d.type}</span>
                      <span>{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="text-blue-900 font-medium text-sm mt-1">
                      {d.bien?.prix?.toLocaleString('fr-FR')} FCFA{d.bien?.nature === 'location' ? '/mois' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/biens/${d.bien?.id}`} className="text-gray-400 hover:text-blue-600 p-2">
                      <Eye size={18} />
                    </Link>
                    {d.statut === 'acceptee' && (
                      <Link href={`/client/demandes/${d.id}`}
                        className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
                        Continuer
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
