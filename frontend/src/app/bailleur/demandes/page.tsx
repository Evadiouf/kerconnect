'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { CheckCircle, XCircle, Eye } from 'lucide-react'

interface Demande {
  id: number; type: string; statut: string; prenom_nom: string;
  created_at: string;
  bien: { id: number; titre: string; nature: string };
  demandeur: { name: string; email: string };
}

const STATUT_COLORS: Record<string, string> = {
  soumise:   'bg-yellow-100 text-yellow-700',
  en_cours:  'bg-blue-100 text-blue-700',
  acceptee:  'bg-green-100 text-green-700',
  refusee:   'bg-red-100 text-red-700',
  annulee:   'bg-gray-100 text-gray-500',
}

export default function DemandesBailleurPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['bailleur-demandes'],
    queryFn:  () => api.get('/v1/bailleur/demandes').then(r => r.data),
  })

  const mutation = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) =>
      api.put(`/v1/bailleur/demandes/${id}`, { statut }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bailleur-demandes'] }),
  })

  const demandes: Demande[] = data?.data || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Demandes reçues</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : demandes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">📋</p>
              <p className="font-medium text-gray-900">Aucune demande reçue</p>
              <p className="text-gray-500 text-sm mt-1">Les demandes apparaîtront ici dès que des clients s&apos;intéresseront à vos biens.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Demandeur', 'Bien', 'Type', 'Date', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {demandes.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900 text-sm">{d.demandeur?.name}</p>
                      <p className="text-gray-400 text-xs">{d.demandeur?.email}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{d.bien?.titre}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 capitalize">{d.type}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(d.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUT_COLORS[d.statut]}`}>{d.statut}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/bailleur/demandes/${d.id}`} className="text-gray-400 hover:text-blue-600">
                          <Eye size={16} />
                        </Link>
                        {d.statut === 'soumise' && (
                          <>
                            <button onClick={() => mutation.mutate({ id: d.id, statut: 'acceptee' })}
                              className="text-gray-400 hover:text-green-600" title="Accepter">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => mutation.mutate({ id: d.id, statut: 'refusee' })}
                              className="text-gray-400 hover:text-red-600" title="Refuser">
                              <XCircle size={16} />
                            </button>
                          </>
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
