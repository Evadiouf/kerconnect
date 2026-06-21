'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { ArrowLeft, UserCheck, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UserDetailPage() {
  const { id }    = useParams()
  const router    = useRouter()
  const qc        = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn:  () => api.get(`/v1/admin/users/${id}`).then(r => r.data),
  })

  const toggle = useMutation({
    mutationFn: () => api.put(`/v1/admin/users/${id}/toggle`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-user', id] }),
  })

  const ROLE_LABELS: Record<string, string> = {
    client: 'Client / Locataire', bailleur: 'Bailleur',
    proprietaire: 'Propriétaire', admin: 'Administrateur',
  }

  if (isLoading) return <DashboardLayout><div className="p-8 text-center text-gray-400">Chargement...</div></DashboardLayout>
  if (!user)     return <DashboardLayout><div className="p-8 text-center text-gray-400">Utilisateur introuvable.</div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded capitalize">
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${user.is_active ? 'text-green-600' : 'text-red-500'}`}>
                    {user.is_active ? <UserCheck size={12} /> : <UserX size={12} />}
                    {user.is_active ? 'Compte actif' : 'Compte inactif'}
                  </span>
                </div>
              </div>
            </div>
            {user.role !== 'admin' && (
              <Button
                onClick={() => toggle.mutate()}
                disabled={toggle.isPending}
                className={user.is_active
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }>
                {toggle.isPending ? '...' : user.is_active ? 'Désactiver' : 'Activer'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Téléphone',   value: user.phone || '—' },
              { label: 'Inscrit le',  value: new Date(user.created_at).toLocaleDateString('fr-FR') },
              { label: 'Email vérifié', value: user.email_verified_at ? 'Oui' : 'Non' },
              { label: 'Annonces',    value: user.biens_count ?? 0 },
              { label: 'Demandes',    value: user.demandes_count ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                <p className="font-semibold text-gray-900">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
