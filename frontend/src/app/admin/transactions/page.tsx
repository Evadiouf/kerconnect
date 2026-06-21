'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface Paiement {
  id: number; reference: string; montant: number; mode: string
  statut: string; libelle: string; paye_at: string | null
  payeur: { name: string; email: string }
  contrat: { bien: { titre: string } }
}

const MODE_LABELS: Record<string, string> = {
  espece: 'Espèces', cheque: 'Chèque', wave: 'Wave',
  orange_money: 'Orange Money', carte: 'Carte',
}

const STATUT_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  confirme:   { icon: CheckCircle, color: 'text-green-600', label: 'Confirmé' },
  en_attente: { icon: Clock,       color: 'text-yellow-600', label: 'En attente' },
  echoue:     { icon: XCircle,     color: 'text-red-500',    label: 'Échoué' },
}

export default function AdminTransactionsPage() {
  const [statut, setStatut] = useState('')
  const [mode,   setMode]   = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', statut, mode],
    queryFn:  () => api.get('/v1/admin/transactions', { params: { statut, mode } }).then(r => r.data),
  })

  const paiements: Paiement[] = data?.data || []
  const montantTotal = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + p.montant, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total affiché</p>
            <p className="text-xl font-bold text-green-700">{montantTotal.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3">
          <select value={statut} onChange={e => setStatut(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les statuts</option>
            <option value="confirme">Confirmés</option>
            <option value="en_attente">En attente</option>
            <option value="echoue">Échoués</option>
          </select>
          <select value={mode} onChange={e => setMode(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les modes</option>
            {Object.entries(MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : paiements.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-4">💳</p>
              <p className="font-medium text-gray-900">Aucune transaction</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Référence', 'Payeur', 'Bien', 'Montant', 'Mode', 'Statut', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paiements.map((p) => {
                  const cfg  = STATUT_CONFIG[p.statut] || STATUT_CONFIG.en_attente
                  const Icon = cfg.icon
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-mono text-sm text-blue-900 font-medium">{p.reference}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-900">{p.payeur?.name}</p>
                        <p className="text-xs text-gray-400">{p.payeur?.email}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-32 truncate">{p.contrat?.bien?.titre}</td>
                      <td className="px-4 py-4 font-bold text-gray-900 text-sm">{p.montant.toLocaleString('fr-FR')} F</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{MODE_LABELS[p.mode] || p.mode}</td>
                      <td className="px-4 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                          <Icon size={13} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-400">
                        {p.paye_at ? new Date(p.paye_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
