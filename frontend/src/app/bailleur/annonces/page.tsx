'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'
import { Plus, Eye, Edit, Trash2, Check, X } from 'lucide-react'

interface Bien {
  id: number; titre: string; type: string; nature: string;
  prix: number; ville: string; statut: string; is_new: boolean;
}

const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  publie:     'bg-green-100 text-green-700',
  loue:       'bg-blue-100 text-blue-700',
  vendu:      'bg-purple-100 text-purple-700',
  retire:     'bg-gray-100 text-gray-500',
}

export default function AnnoncesPage() {
  const qc = useQueryClient()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['bailleur-biens'],
    queryFn:  () => api.get('/v1/bailleur/biens').then(r => r.data),
  })

  const deleteAnnonce = useMutation({
    mutationFn: (id: number) => api.delete(`/v1/bailleur/biens/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bailleur-biens'] }),
  })

  const biens: Bien[] = data?.data || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
          <Link
            href="/bailleur/annonces/ajouter"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E05C52' }}
          >
            <Plus size={16} /> Nouvelle annonce
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : biens.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">🏠</p>
              <p className="font-medium text-gray-900 mb-2">Aucune annonce publiée</p>
              <p className="text-gray-500 text-sm mb-6">Commencez par publier votre premier bien.</p>
              <Link
                href="/bailleur/annonces/ajouter"
                className="inline-flex px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#E05C52' }}
              >
                Publier une annonce
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Bien', 'Type', 'Nature', 'Prix', 'Ville', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {biens.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-gray-900 text-sm">{b.titre}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{b.type}</td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={b.nature === 'location'
                          ? { backgroundColor: '#4338CA15', color: '#4338CA' }
                          : { backgroundColor: '#d1fae5', color: '#065f46' }}>
                        {b.nature}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-900 text-sm font-medium">{b.prix.toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">{b.ville}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUT_COLORS[b.statut] || 'bg-gray-100 text-gray-500'}`}>
                        {b.statut}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/biens/${b.id}`} className="text-gray-400 hover:text-[#4338CA]"><Eye size={16} /></Link>
                        <Link href={`/bailleur/annonces/${b.id}/modifier`} className="text-gray-400 hover:text-orange-600"><Edit size={16} /></Link>
                        {confirmId === b.id ? (
                          <span className="flex items-center gap-1">
                            <button onClick={() => { deleteAnnonce.mutate(b.id); setConfirmId(null) }}
                              className="text-red-600 hover:text-red-700" title="Confirmer">
                              <Check size={15} />
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              className="text-gray-400 hover:text-gray-600" title="Annuler">
                              <X size={15} />
                            </button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmId(b.id)}
                            className="text-gray-400 hover:text-red-600" title="Supprimer">
                            <Trash2 size={16} />
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
