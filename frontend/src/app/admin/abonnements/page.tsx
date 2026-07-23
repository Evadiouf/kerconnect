'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState } from 'react'
import { CheckCircle, Clock, RefreshCw } from 'lucide-react'

interface PendingUser {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  forfait: 'starter' | 'pro' | 'agence'
  inscription_at: string
}

const FORFAIT_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', agence: 'Pro Max' }
const FORFAIT_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-700',
  pro:     'bg-red-50 text-red-700',
  agence:  'bg-indigo-50 text-indigo-700',
}

export default function AdminAbonnementsPage() {
  const queryClient              = useQueryClient()
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set())
  const [error, setError]        = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-inscriptions-en-attente'],
    queryFn:  () => api.get('/v1/admin/inscriptions/en-attente').then(r => r.data),
    staleTime: 30_000,
  })

  const mutation = useMutation({
    mutationFn: (userId: number) => api.post(`/v1/admin/inscriptions/${userId}/confirmer`),
    onSuccess: (_, userId) => {
      setConfirmedIds(prev => new Set([...prev, userId]))
      queryClient.invalidateQueries({ queryKey: ['admin-inscriptions-en-attente'] })
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message ?? 'Une erreur est survenue.')
    },
  })

  const pending: PendingUser[] = data?.data ?? []

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Abonnements en attente</h1>
            <p className="text-gray-500 mt-1">
              Confirmez les demandes d&apos;abonnement Pro et Pro Max reçues des bailleurs.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-xl transition-colors"
          >
            <RefreshCw size={14} /> Actualiser
          </button>
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Contenu */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-64" />
                  </div>
                  <div className="h-9 bg-gray-200 rounded-xl w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">Tout est à jour !</p>
              <p className="text-sm text-gray-400">Aucune demande d&apos;abonnement en attente.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Compteur */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-full">
                <Clock size={14} />
                {pending.length} demande{pending.length > 1 ? 's' : ''} en attente
              </div>
            </div>

            {/* Liste */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Bailleur</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Contact</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Forfait</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Soumis le</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pending.map(u => {
                    const isConfirmed = confirmedIds.has(u.id)
                    const isLoading   = mutation.isPending && mutation.variables === u.id

                    return (
                      <tr key={u.id} className={`transition-colors ${isConfirmed ? 'bg-green-50/50' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: '#E05C52' }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                              <p className="text-xs text-gray-400 capitalize">{u.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{u.email}</p>
                          {u.phone && <p className="text-xs text-gray-400">{u.phone}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${FORFAIT_COLORS[u.forfait] ?? 'bg-gray-100 text-gray-700'}`}>
                            {FORFAIT_LABELS[u.forfait] ?? u.forfait}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{formatDate(u.inscription_at)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isConfirmed ? (
                            <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                              <CheckCircle size={14} /> Confirmé
                            </span>
                          ) : (
                            <button
                              onClick={() => { setError(''); mutation.mutate(u.id) }}
                              disabled={isLoading || mutation.isPending}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                              style={{ backgroundColor: '#E05C52' }}
                            >
                              {isLoading ? (
                                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                                  <circle cx="7" cy="7" r="5" stroke="white" strokeOpacity=".3" strokeWidth="2"/>
                                  <path d="M12 7a5 5 0 00-5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              ) : (
                                <CheckCircle size={14} />
                              )}
                              {isLoading ? 'Envoi…' : 'Confirmer'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 text-center">
              En confirmant, le bailleur reçoit immédiatement un email d&apos;activation avec un lien pour accéder à la plateforme.
            </p>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
