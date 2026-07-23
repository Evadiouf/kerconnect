'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { CheckCircle, Clock, XCircle, Download, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'

interface Paiement {
  id: number
  reference: string
  montant: number
  montant_base?: number
  caution_montant?: number
  commission_montant?: number
  commission_taux?: number
  mode: string
  statut: string
  libelle: string
  paye_at: string | null
  created_at: string
  contrat?: {
    id: number
    numero: string
    bien?: { titre: string; adresse: string; ville: string }
  }
}

const STATUT = {
  confirme:   { icon: CheckCircle, color: 'text-green-600 bg-green-50',   label: 'Confirmé' },
  en_attente: { icon: Clock,       color: 'text-yellow-600 bg-yellow-50', label: 'En attente' },
  echoue:     { icon: XCircle,     color: 'text-red-600 bg-red-50',       label: 'Échoué' },
}

const MODE_LABELS: Record<string, string> = {
  espece: 'Espèces', cheque: 'Chèque',
  wave: 'Wave', orange_money: 'Orange Money', carte: 'Carte bancaire',
}

export default function ClientPaiementsPage() {
  const [openRecuId, setOpenRecuId] = useState<number | null>(null)

  const { data, isLoading } = useQuery<{ data: Paiement[] }>({
    queryKey: ['client-paiements'],
    queryFn:  () => api.get('/v1/client/paiements').then(r => r.data),
  })

  const paiements = data?.data ?? []

  const downloadRecu = async (id: number, ref: string) => {
    try {
      const res = await api.get(`/v1/paiements/${id}/recu`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a')
      a.href = url; a.download = `recu-${ref}.pdf`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); window.URL.revokeObjectURL(url)
    } catch { /* reçu pas encore généré */ }
  }

  const total     = paiements.reduce((s, p) => s + (p.statut === 'confirme' ? p.montant : 0), 0)
  const totalBase = paiements.reduce((s, p) => s + (p.statut === 'confirme' ? (p.montant_base ?? p.montant) : 0), 0)
  const totalComm = paiements.reduce((s, p) => s + (p.statut === 'confirme' ? (p.commission_montant ?? 0) : 0), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mes paiements</h1>
          <Link href="/paiement" className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90"
            style={{ backgroundColor: '#E05C52' }}>
            <CreditCard size={16} /> Nouveau paiement
          </Link>
        </div>

        {/* Résumé */}
        {paiements.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">Total payé</p>
              <p className="text-2xl font-bold" style={{ color: '#4338CA' }}>
                {total.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">Dont loyers</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalBase.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">Dont commissions</p>
              <p className="text-2xl font-bold text-orange-500">
                {totalComm.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        )}

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4338CA', borderTopColor: 'transparent' }} />
          </div>
        ) : paiements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-gray-500 font-medium">Aucun paiement effectué pour le moment.</p>
            <p className="text-sm text-gray-400 mt-1">Vos paiements de loyer apparaîtront ici.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paiements.map(p => {
              const cfg  = STATUT[p.statut as keyof typeof STATUT] ?? STATUT.en_attente
              const Icon = cfg.icon
              const isOpen = openRecuId === p.id

              const loyer    = Number(p.montant_base ?? p.montant)
              const caution  = Number(p.caution_montant ?? 0)
              const comm     = Number(p.commission_montant ?? 0)
              const hasDetail = loyer !== Number(p.montant) || caution > 0

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Ligne principale */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                            <Icon size={12} /> {cfg.label}
                          </span>
                          <span className="text-xs text-gray-400">{MODE_LABELS[p.mode] ?? p.mode}</span>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {p.contrat?.bien?.titre ?? p.libelle}
                        </p>
                        {p.contrat?.bien && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {p.contrat.bien.adresse}, {p.contrat.bien.ville} · Contrat {p.contrat.numero}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Réf. <span className="font-mono">{p.reference}</span>
                          {p.paye_at && ` · Payé le ${new Date(p.paye_at).toLocaleDateString('fr-FR')}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold" style={{ color: '#4338CA' }}>
                          {Number(p.montant).toLocaleString('fr-FR')} FCFA
                        </p>
                        {hasDetail && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Loyer {loyer.toLocaleString('fr-FR')}
                            {caution > 0 && <span className="text-amber-600"> + caution {caution.toLocaleString('fr-FR')}</span>}
                            {comm > 0 && <span className="text-orange-500"> + comm. {comm.toLocaleString('fr-FR')}</span>}
                          </p>
                        )}
                        {p.statut === 'confirme' && (
                          <button
                            onClick={() => setOpenRecuId(isOpen ? null : p.id)}
                            className="mt-2 flex items-center gap-1 text-xs font-medium ml-auto transition-colors"
                            style={{ color: '#4338CA' }}
                          >
                            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            Voir le reçu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reçu in-app (dépliable) */}
                  {isOpen && p.statut === 'confirme' && (
                    <div className="border-t border-gray-100 mx-5 mb-5">
                      <div className="bg-gray-50 rounded-xl p-4 mt-3">
                        {/* En-tête reçu */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Reçu de paiement</p>
                            <p className="font-mono text-sm font-bold text-gray-900 mt-0.5">{p.reference}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                              <CheckCircle size={11} /> Confirmé
                            </span>
                            {p.paye_at && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(p.paye_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bien */}
                        {p.contrat?.bien && (
                          <div className="text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
                            <span className="font-medium text-gray-700">{p.contrat.bien.titre}</span>
                            <span className="mx-1">·</span>
                            {p.contrat.bien.adresse}, {p.contrat.bien.ville}
                          </div>
                        )}

                        {/* Détail montants */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Loyer de base</span>
                            <span className="font-medium">{loyer.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                          {caution > 0 && (
                            <div className="flex justify-between text-amber-700">
                              <span>Caution ({Math.round(caution / loyer)} mois)</span>
                              <span className="font-medium">{caution.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          {comm > 0 && (
                            <div className="flex justify-between text-orange-500">
                              <span>Commission plateforme ({p.commission_taux ?? 5}%)</span>
                              <span className="font-medium">{comm.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Total payé</span>
                            <span style={{ color: '#4338CA' }}>{Number(p.montant).toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        </div>

                        {/* Mode de paiement */}
                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            Mode : <span className="font-medium text-gray-600">{MODE_LABELS[p.mode] ?? p.mode}</span>
                          </p>
                          <button
                            onClick={() => downloadRecu(p.id, p.reference)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-white"
                            style={{ color: '#4338CA', borderColor: '#4338CA30' }}
                          >
                            <Download size={12} /> Télécharger PDF
                          </button>
                        </div>

                        {caution > 0 && (
                          <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100">
                            La caution est remboursable à la fin du bail selon les conditions du contrat.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
