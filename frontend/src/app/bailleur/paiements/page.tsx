'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { CreditCard, Home, CheckCircle, Clock, ChevronDown, ChevronUp, PenLine } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'

interface Paiement {
  id: number; reference: string; montant: number; mode: string
  statut: string; created_at: string; libelle?: string
  payeur?: { name: string; email: string }
}

interface Contrat {
  id: number; numero: string; montant: number; statut: string
  type: string; date_debut?: string
  fichier_contrat?: string | null
  fichier_signe_client?: string | null
  signature_bailleur?: string | null
  signature_locataire?: string | null
  bien?: { id: number; titre: string; adresse: string; ville: string }
  locataire?: { id: number; name: string; email: string; phone?: string }
  paiements?: Paiement[]
}

const STATUT_PAI: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-700',
  confirme:   'bg-green-100 text-green-700',
  echoue:     'bg-red-100 text-red-700',
}

const MODE_LABEL: Record<string, string> = {
  wave: '🌊 Wave', orange_money: '🟠 Orange Money',
  carte: '💳 Carte', espece: '💵 Espèces', cheque: '📄 Chèque',
}

export default function BailleurPaiementsPage() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState<number | null>(null)

  const { data: contratsData, isLoading } = useQuery({
    queryKey: ['bailleur-contrats'],
    queryFn:  () => api.get('/v1/bailleur/contrats').then(r => r.data),
  })

  const { data: attenteData } = useQuery({
    queryKey: ['bailleur-paiements-attente'],
    queryFn:  () => api.get('/v1/bailleur/paiements/en-attente').then(r => r.data),
    refetchInterval: 30_000,
  })

  const confirmer = useMutation({
    mutationFn: (id: number) => api.post(`/v1/paiements/${id}/confirmer`),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['bailleur-paiements-attente'] })
      qc.invalidateQueries({ queryKey: ['bailleur-contrats'] })
    },
  })

  const valider = useMutation({
    mutationFn: (contratId: number) => api.post(`/v1/contrats/${contratId}/valider`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bailleur-contrats'] }),
  })

  const uploadModele = async (contratId: number, file: File) => {
    const fd = new globalThis.FormData()
    fd.append('fichier', file)
    const token = localStorage.getItem('token')
    const base  = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
    const res = await fetch(`${base}/v1/contrats/${contratId}/upload-modele`, {
      method: 'POST',
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: fd,
    })
    if (!res.ok) throw new Error('Erreur upload')
    qc.invalidateQueries({ queryKey: ['bailleur-contrats'] })
  }

  const { user } = useAuthStore()
  const contrats: Contrat[]  = contratsData?.data ?? []
  const enAttente: Paiement[] = attenteData?.data  ?? []
  const storageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '') + '/storage'

  const downloadRecu = async (paiementId: number) => {
    const token = localStorage.getItem('token')
    const base  = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
    try {
      const res = await fetch(`${base}/v1/paiements/${paiementId}/recu`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/pdf' },
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `recu-${paiementId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* silencieux */ }
  }

  const totalRecu = contrats
    .flatMap(c => c.paiements ?? [])
    .filter(p => p.statut === 'confirme')
    .reduce((s, p) => s + Number(p.montant), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Paiements reçus</h1>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Contrats actifs</p>
            <p className="text-2xl font-bold text-gray-900">{contrats.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Paiements confirmés</p>
            <p className="text-2xl font-bold text-green-700">
              {totalRecu.toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">En attente confirmation</p>
            <p className="text-2xl font-bold text-orange-600">{enAttente.length}</p>
          </div>
        </div>

        {/* ── Paiements à confirmer ── */}
        {enAttente.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
            <h2 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <Clock size={16} /> {enAttente.length} paiement(s) à confirmer
            </h2>
            <div className="space-y-3">
              {enAttente.map((p) => (
                <div key={p.id} className="bg-white rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {MODE_LABEL[p.mode] ?? p.mode} — {Number(p.montant).toLocaleString('fr-FR')} FCFA
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Réf. {p.reference}</p>
                    <p className="text-xs text-gray-400">
                      {p.payeur?.name} · {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => confirmer.mutate(p.id)}
                    disabled={confirmer.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                    style={{ backgroundColor: '#10B981' }}
                  >
                    <CheckCircle size={14} /> Confirmer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Liste des contrats + historique ── */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">Chargement…</div>
        ) : contrats.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-medium text-gray-900 mb-2">Aucun contrat pour le moment</p>
            <p className="text-gray-500 text-sm mb-6">
              Les paiements apparaîtront ici après qu'un client aura signé un contrat.
            </p>
            <Link href="/bailleur/demandes"
              className="text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 inline-block"
              style={{ backgroundColor: '#E05C52' }}>
              Voir les demandes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contrats.map((c) => {
              const paiementsConfirmes = (c.paiements ?? []).filter(p => p.statut === 'confirme')
              const totalContrat = paiementsConfirmes.reduce((s, p) => s + Number(p.montant), 0)
              const isOpen = expanded === c.id

              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* En-tête contrat */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : c.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Home size={18} style={{ color: '#4338CA' }} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{c.bien?.titre ?? '—'}</p>
                        <p className="text-xs text-gray-500">{c.bien?.adresse}, {c.bien?.ville}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">N° {c.numero}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            c.statut === 'signe' || c.statut === 'valide' ? 'bg-green-100 text-green-700' :
                            c.statut === 'en_attente_signature' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {c.statut === 'en_attente_signature' ? 'En attente signature' : c.statut}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-gray-900">{Number(c.montant).toLocaleString('fr-FR')} FCFA</p>
                        <p className="text-xs text-gray-400">par échéance</p>
                        <p className="text-xs text-green-600 font-medium">{totalContrat.toLocaleString('fr-FR')} FCFA reçus</p>
                      </div>
                      {/* Actions selon l'état du contrat */}
                      {!c.fichier_contrat && (
                        <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer hover:opacity-90 flex-shrink-0" style={{ backgroundColor: '#4338CA' }}>
                          <PenLine size={13} /> Envoyer contrat
                          <input type="file" accept=".pdf" className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0]
                              if (f) { e.stopPropagation(); await uploadModele(c.id, f) }
                            }} />
                        </label>
                      )}
                      {c.fichier_signe_client && c.statut !== 'valide' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); valider.mutate(c.id) }}
                          disabled={valider.isPending}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                          style={{ backgroundColor: '#10B981' }}
                        >
                          <CheckCircle size={13} />
                          {valider.isPending ? 'Validation…' : 'Valider signature'}
                        </button>
                      )}
                      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Détail locataire + paiements */}
                  {isOpen && (
                    <div className="border-t border-gray-100 p-5 space-y-4">
                      {/* Locataire */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {c.locataire?.name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{c.locataire?.name}</p>
                          <p className="text-xs text-gray-500">{c.locataire?.email}</p>
                        </div>
                        {c.locataire?.phone && (
                          <a href={`tel:${c.locataire.phone}`}
                            className="ml-auto text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-100"
                            style={{ color: '#4338CA', borderColor: '#4338CA30' }}>
                            📞 Appeler
                          </a>
                        )}
                      </div>

                      {/* Suivi du contrat */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Suivi du contrat</p>
                        <div className="flex flex-col gap-2">
                          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${c.fichier_contrat ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                            {c.fichier_contrat ? '✅' : '⏳'} Modèle envoyé au client
                            {c.fichier_contrat && <a href={`${storageBase}/${c.fichier_contrat}`} target="_blank" className="ml-auto underline text-green-600">Voir</a>}
                          </div>
                          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${c.fichier_signe_client ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                            {c.fichier_signe_client ? '✅' : '⏳'} Client a signé et renvoyé
                            {c.fichier_signe_client && <a href={`${storageBase}/${c.fichier_signe_client}`} target="_blank" className="ml-auto underline text-green-600">Voir doc signé</a>}
                          </div>
                          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${c.statut === 'valide' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                            {c.statut === 'valide' ? '✅' : '⏳'} Validé par vous → client peut payer
                          </div>
                        </div>
                      </div>

                      {/* Historique paiements */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Historique des paiements</p>
                        {(c.paiements ?? []).length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-3">Aucun paiement reçu pour ce contrat</p>
                        ) : (
                          <div className="space-y-2">
                            {(c.paiements ?? []).map((p) => (
                              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">{Number(p.montant).toLocaleString('fr-FR')} FCFA</p>
                                  <p className="text-xs text-gray-400">{MODE_LABEL[p.mode] ?? p.mode} · {p.reference}</p>
                                  <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUT_PAI[p.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                                    {p.statut === 'confirme' ? '✅ Confirmé' : p.statut === 'en_attente' ? '⏳ En attente' : '❌ Échoué'}
                                  </span>
                                  {p.statut === 'confirme' && (
                                    <button
                                      onClick={() => downloadRecu(p.id)}
                                      className="text-xs text-indigo-600 hover:underline">
                                      Reçu PDF
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
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
