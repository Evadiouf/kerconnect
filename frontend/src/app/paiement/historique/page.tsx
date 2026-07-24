'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { Download, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Paiement {
  id: number
  reference: string
  montant: number
  mode: string
  statut: string
  libelle: string
  paye_at: string | null
  payeur: { name: string }
}

const STATUT_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  confirme:   { icon: CheckCircle, color: 'text-green-600', label: 'Confirmé' },
  en_attente: { icon: Clock,       color: 'text-yellow-600', label: 'En attente' },
  echoue:     { icon: XCircle,     color: 'text-red-600',    label: 'Échoué' },
}

const MODE_LABELS: Record<string, string> = {
  espece:       'Espèces',
  cheque:       'Chèque',
  wave:         'Wave',
  orange_money: 'Orange Money',
  carte:        'Carte bancaire',
}

function HistoriqueContent() {
  const params    = useSearchParams()
  const contratId = params.get('contrat_id')

  const { data: paiements = [], isLoading } = useQuery<Paiement[]>({
    queryKey: ['paiements', contratId],
    queryFn:  () => api.get(`/v1/contrats/${contratId}/paiements`).then(r => r.data),
    enabled:  !!contratId,
  })

  const downloadRecu = async (id: number, ref: string) => {
    const res = await api.get(`/v1/paiements/${id}/recu`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a   = document.createElement('a')
    a.href    = url
    a.download = `recu-${ref}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const total = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + Number(p.montant), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Historique des paiements</h1>
          {total > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Total payé</p>
              <p className="text-xl font-bold text-green-700">{total.toLocaleString('fr-FR')} FCFA</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">Chargement...</div>
        ) : paiements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">💳</p>
            <p className="font-medium text-gray-900">Aucun paiement enregistré</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Référence', 'Montant', 'Mode', 'Libellé', 'Date', 'Statut', 'Reçu'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paiements.map((p) => {
                  const cfg = STATUT_CONFIG[p.statut] || STATUT_CONFIG.en_attente
                  const Icon = cfg.icon
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-mono text-sm font-medium" style={{ color: '#4338CA' }}>{p.reference}</td>
                      <td className="px-4 py-4 font-bold text-gray-900">{Number(p.montant).toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{MODE_LABELS[p.mode] || p.mode}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{p.libelle}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {p.paye_at ? new Date(p.paye_at).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                          <Icon size={14} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {p.statut === 'confirme' && (
                          <button onClick={() => downloadRecu(p.id, p.reference)}
                            className="text-gray-400 transition-colors hover:text-[#4338CA]" title="Télécharger le reçu">
                            <Download size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function HistoriquePage() {
  return <Suspense><HistoriqueContent /></Suspense>
}
