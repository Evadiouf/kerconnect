'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { Search, Eye, ToggleLeft, ToggleRight, UserCheck, UserX, Trash2, Check, X } from 'lucide-react'

interface User {
  id: number; name: string; email: string; role: string;
  is_active: boolean; phone?: string; created_at: string
}

const ROLE_COLORS: Record<string, string> = {
  client:       'bg-blue-50 text-blue-700',
  bailleur:     'bg-emerald-50 text-emerald-700',
  proprietaire: 'bg-teal-50 text-teal-700',
  admin:        'bg-purple-50 text-purple-700',
}

const ROLES = ['', 'client', 'bailleur', 'proprietaire', 'admin']

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [search,    setSearch]    = useState('')
  const [role,      setRole]      = useState('')
  const [page,      setPage]      = useState(1)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, role, page],
    queryFn:  () => api.get('/v1/admin/users', { params: { search, role, page } }).then(r => r.data),
  })

  const toggle = useMutation({
    mutationFn: (id: number) => api.put(`/v1/admin/users/${id}/toggle`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const deleteUser = useMutation({
    mutationFn: (id: number) => api.delete(`/v1/admin/users/${id}`),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmId(null) },
  })

  const users: User[] = data?.data || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <span className="text-sm text-gray-500">{data?.total || 0} utilisateurs</span>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher nom ou email..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors" />
          </div>
          <select value={role} onChange={e => setRole(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors bg-white">
            <option value="">Tous les rôles</option>
            {ROLES.slice(1).map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">👥</p>
              <p className="font-medium text-gray-900">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Utilisateur', 'Rôle', 'Téléphone', 'Inscription', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: '#4338CA' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-500'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{u.phone || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>
                        {u.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
                        {u.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/users/${u.id}`} className="text-gray-400 hover:text-[#4338CA]">
                          <Eye size={16} />
                        </Link>
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => toggle.mutate(u.id)}
                              className={`${u.is_active ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-green-600'}`}
                              title={u.is_active ? 'Désactiver' : 'Activer'}>
                              {u.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            {confirmId === u.id ? (
                              <span className="flex items-center gap-1">
                                <button onClick={() => deleteUser.mutate(u.id)}
                                  className="text-red-600 hover:text-red-700" title="Confirmer suppression">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => setConfirmId(null)}
                                  className="text-gray-400 hover:text-gray-600" title="Annuler">
                                  <X size={14} />
                                </button>
                              </span>
                            ) : (
                              <button onClick={() => setConfirmId(u.id)}
                                className="text-gray-400 hover:text-red-600" title="Supprimer définitivement">
                                <Trash2 size={15} />
                              </button>
                            )}
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

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: data.last_page }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setPage(page)}
                style={data.current_page === page ? { backgroundColor: '#4338CA' } : {}}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${data.current_page === page ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
