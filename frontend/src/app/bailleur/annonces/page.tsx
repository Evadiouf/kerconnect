'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'

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
  const { data, isLoading } = useQuery({
    queryKey: ['bailleur-biens'],
    queryFn:  () => api.get('/v1/bailleur/biens').then(r => r.data),
  })

  const biens: Bien[] = data?.data || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
          <Link href="/bailleur/annonces/ajouter">
            <Button className="bg-blue-900 hover:bg-blue-800 text-white gap-2">
              <Plus size={16} /> Nouvelle annonce
            </Button>
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
              <Link href="/bailleur/annonces/ajouter">
                <Button className="bg-blue-900 text-white">Publier une annonce</Button>
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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${b.nature === 'location' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
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
                        <Link href={`/biens/${b.id}`} className="text-gray-400 hover:text-blue-600"><Eye size={16} /></Link>
                        <Link href={`/bailleur/annonces/${b.id}/modifier`} className="text-gray-400 hover:text-orange-600"><Edit size={16} /></Link>
                        <button className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
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
