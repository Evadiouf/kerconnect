'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'

interface Favori {
  id: number
  bien: { id: number; titre: string; type: string; nature: string; prix: number; adresse: string; ville: string; surface?: number }
}

export default function MesFavorisPage() {
  const qc = useQueryClient()

  const { data: favoris = [], isLoading } = useQuery<Favori[]>({
    queryKey: ['favoris'],
    queryFn:  () => api.get('/v1/favoris').then(r => r.data),
  })

  const remove = useMutation({
    mutationFn: (bienId: number) => api.post('/v1/favoris/toggle', { bien_id: bienId }),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['favoris'] }),
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes favoris</h1>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">Chargement...</div>
        ) : favoris.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Heart size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-medium text-gray-900 mb-2">Aucun favori</p>
            <p className="text-gray-500 text-sm mb-6">Enregistrez des biens qui vous intéressent en cliquant sur le cœur.</p>
            <Link href="/location"
              className="text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-block"
              style={{ backgroundColor: '#E05C52' }}>
              Explorer les biens
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoris.map((f) => (
              <div key={f.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-36 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <span className="text-4xl">🏠</span>
                  <button
                    onClick={() => remove.mutate(f.bien.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-red-500 hover:bg-red-50"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: f.bien.nature === 'location' ? '#4338CA' : '#E05C52' }}>
                    {f.bien.nature === 'location' ? 'Location' : 'Vente'}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{f.bien.titre}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin size={12} />
                    <span className="line-clamp-1">{f.bien.adresse}, {f.bien.ville}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm" style={{ color: '#E05C52' }}>
                      {Number(f.bien.prix).toLocaleString('fr-FR')} FCFA{f.bien.nature === 'location' ? '/mois' : ''}
                    </p>
                    <Link href={`/biens/${f.bien.id}`} className="text-xs hover:underline" style={{ color: '#E05C52' }}>
                      Voir →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
