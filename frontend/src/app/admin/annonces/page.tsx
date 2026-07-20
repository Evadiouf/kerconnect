'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Bien {
  id: number; titre: string; type: string; nature: string; prix: number
  ville: string; statut: string; created_at: string
  bailleur: { name: string; email: string }
}

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  publie:     'bg-green-100 text-green-700',
  loue:       'bg-blue-100 text-blue-700',
  vendu:      'bg-purple-100 text-purple-700',
  retire:     'bg-gray-100 text-gray-500',
}

function AnnoncesContent() {
  const params     = useSearchParams()
  const qc         = useQueryClient()
  const [statut, setStatut] = useState(params.get('statut') || '')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-annonces', statut],
    queryFn:  () => api.get('/v1/admin/annonces', { params: { statut } }).then(r => r.data),
  })

  const updateStatut = useMutation({
    mutationFn: ({ id, statut: s }: { id: number; statut: string }) =>
      api.put(`/v1/admin/annonces/${id}/statut`, { statut: s }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-annonces'] }),
  })

  const biens: Bien[] = data?.data || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Annonces</h1>
          <span className="text-sm text-gray-500">{data?.total || 0} annonces</span>
        </div>

        {/* Filtres statut */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: '',           label: 'Toutes' },
            { value: 'en_attente', label: 'En attente' },
            { value: 'publie',     label: 'Publiées' },
            { value: 'loue',       label: 'Louées' },
            { value: 'vendu',      label: 'Vendues' },
            { value: 'retire',     label: 'Retirées' },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setStatut(value)}
              style={statut === value ? { backgroundColor: '#4338CA' } : {}}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statut === value ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : biens.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">🏠</p>
              <p className="font-medium text-gray-900">Aucune annonce</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Titre', 'Bailleur', 'Type', 'Prix', 'Statut', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {biens.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{b.titre}</p>
                      <p className="text-xs text-gray-400">{b.ville}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{b.bailleur?.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{b.type}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{b.prix.toLocaleString('fr-FR')} F</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUT_COLORS[b.statut] || 'bg-gray-100 text-gray-500'}`}>
                        {b.statut}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400">
                      {new Date(b.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/biens/${b.id}`} className="text-gray-400 hover:text-[#4338CA]">
                          <Eye size={15} />
                        </Link>
                        {b.statut === 'en_attente' && (
                          <>
                            <button onClick={() => updateStatut.mutate({ id: b.id, statut: 'publie' })}
                              className="text-gray-400 hover:text-green-600" title="Publier">
                              <CheckCircle size={15} />
                            </button>
                            <button onClick={() => updateStatut.mutate({ id: b.id, statut: 'retire' })}
                              className="text-gray-400 hover:text-red-600" title="Retirer">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {b.statut === 'publie' && (
                          <button onClick={() => updateStatut.mutate({ id: b.id, statut: 'en_attente' })}
                            className="text-gray-400 hover:text-yellow-600" title="Mettre en attente">
                            <Clock size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminAnnoncesPage() {
  return <Suspense><AnnoncesContent /></Suspense>
}
