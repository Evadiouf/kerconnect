'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'

const MODES = [
  {
    id: 'wave',
    label: 'Wave',
    icon: '🌊',
    desc: 'Paiement instantané via Wave',
    color: 'border-blue-400 bg-blue-50',
  },
  {
    id: 'orange_money',
    label: 'Orange Money',
    icon: '🟠',
    desc: 'Paiement via Orange Money',
    color: 'border-orange-400 bg-orange-50',
  },
  {
    id: 'carte',
    label: 'Carte bancaire',
    icon: '💳',
    desc: 'Visa, Mastercard via PayDunya',
    color: 'border-purple-400 bg-purple-50',
  },
  {
    id: 'espece',
    label: 'Espèces',
    icon: '💵',
    desc: 'Remise en main propre au bailleur',
    color: 'border-green-400 bg-green-50',
  },
  {
    id: 'cheque',
    label: 'Chèque',
    icon: '📄',
    desc: 'Chèque bancaire certifié',
    color: 'border-gray-400 bg-gray-50',
  },
]

function PaiementForm() {
  const params       = useSearchParams()
  const router       = useRouter()
  const contratId    = params.get('contrat_id')
  const montantBase  = Number(params.get('montant') || '0')
  const libelle      = params.get('libelle') || 'Paiement KerConnect'

  const [mode,    setMode]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [reference, setRef]   = useState('')

  // Récupérer le taux de commission (on simule sur le loyer seul pour avoir le taux)
  const { data: simulation } = useQuery({
    queryKey: ['simuler-paiement', contratId, montantBase],
    queryFn:  () => api.get('/v1/paiements/simuler', { params: { contrat_id: contratId, montant_base: montantBase } }).then(r => r.data),
    enabled:  !!contratId && montantBase > 0,
    retry:    false,
  })
  const commissionTaux = simulation?.commission_taux ?? 5

  // Récupérer le contrat (inclut bien.caution_mois + paiements existants)
  const { data: contratData, isLoading: contratLoading } = useQuery({
    queryKey: ['contrat-check', contratId],
    queryFn:  () => api.get(`/v1/contrats/${contratId}`).then(r => r.data),
    enabled:  !!contratId,
  })
  const contratStatut = contratData?.statut
  const contratSigné  = contratStatut === 'signe' || contratStatut === 'valide'

  // Déterminer si c'est le premier paiement et calculer la caution
  const paiementsConfirmes = (contratData?.paiements ?? []).filter(
    (p: { statut: string }) => p.statut === 'confirme'
  )
  const isPremierPaiement = paiementsConfirmes.length === 0
  const cautionMois       = contratData?.bien?.caution_mois ?? 0
  const isLocation        = contratData?.bien?.nature === 'location'
  // 1er paiement : cautionMois × loyer = montant global (loyer du 1er mois + caution inclus)
  // Mois suivants : loyer seul
  const cautionMontant    = isPremierPaiement && isLocation && cautionMois > 0
    ? cautionMois * montantBase
    : 0

  // Commission toujours sur le loyer de base uniquement
  const commissionMontant = Math.round(montantBase * commissionTaux / 100)
  // Si caution : montant effectif = cautionMontant (loyer du 1er mois déjà inclus dedans)
  const montantEffectif   = cautionMontant > 0 ? cautionMontant : montantBase
  const montantTotal      = montantEffectif + commissionMontant

  // Champs espèce/chèque
  const [nom,  setNom]  = useState('')
  const [info, setInfo] = useState('')

  const handlePayer = async () => {
    if (!mode) { setError('Sélectionnez un mode de paiement.'); return }
    if (inclus(['espece', 'cheque'], mode) && !nom) { setError('Veuillez renseigner votre nom.'); return }
    setError(''); setLoading(true)

    try {
      const res = await api.post('/v1/paiements', {
        contrat_id:      contratId,
        montant_base:    montantBase,
        caution_montant: cautionMontant || undefined,
        mode,
        libelle,
      })

      if (res.data.payment_url) {
        window.location.href = res.data.payment_url
      } else {
        setRef(res.data.paiement.reference)
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Erreur lors du paiement.')
    } finally {
      setLoading(false)
    }
  }

  const inclus = (arr: string[], val: string) => arr.includes(val)

  if (reference) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto text-center py-16">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement enregistré</h2>
          <p className="text-gray-500 mb-4">
            Votre paiement en {mode === 'espece' ? 'espèces' : 'chèque'} a été enregistré.
            Le bailleur doit confirmer la réception.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Référence</p>
            <p className="text-xl font-bold font-mono" style={{ color: '#4338CA' }}>{reference}</p>
            <p className="text-xs text-gray-400 mt-1">Conservez cette référence</p>
          </div>
          <button
            onClick={() => router.push('/client/demandes')}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E05C52' }}
          >
            Retour à mes demandes
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (contratLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4338CA', borderTopColor: 'transparent' }} />
      </div>
    </DashboardLayout>
  )

  if (contratId && !contratSigné) return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl mb-6">✍️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Contrat non signé</h2>
        <p className="text-gray-500 mb-6">
          Le contrat doit être signé par les deux parties avant d&apos;effectuer un paiement.
          <br />Statut actuel : <span className="font-semibold text-yellow-600">{contratStatut ?? '-'}</span>
        </p>
        <button onClick={() => router.back()}
          className="px-6 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90"
          style={{ backgroundColor: '#4338CA' }}>
          ← Retour
        </button>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Effectuer un paiement</h1>

        {/* Récapitulatif */}
        <div className="rounded-2xl p-5 border" style={{ backgroundColor: '#4338CA08', borderColor: '#4338CA20' }}>
          <p className="text-sm font-medium mb-3" style={{ color: '#4338CA' }}>{libelle}</p>
          <div className="space-y-2 text-sm mb-3">
            {cautionMontant > 0 ? (
              <div className="flex justify-between text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <span className="font-medium">
                  1er paiement (loyer + caution {cautionMois} mois)
                </span>
                <span className="font-bold">{cautionMontant.toLocaleString('fr-FR')} FCFA</span>
              </div>
            ) : (
              <div className="flex justify-between text-gray-600">
                <span>Loyer mensuel</span>
                <span className="font-medium">{montantBase.toLocaleString('fr-FR')} FCFA</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Commission plateforme ({commissionTaux}%)</span>
              <span className="font-medium text-orange-500">+ {commissionMontant.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-900">Total à payer</span>
              <span className="text-2xl font-bold" style={{ color: '#4338CA' }}>
                {montantTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
          {cautionMontant > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-100">
              La caution est remboursable à la fin du bail selon les conditions du contrat.
            </p>
          )}
          {!cautionMontant && (
            <p className="text-xs text-gray-400">En acceptant, vous reconnaissez nos conditions d&apos;utilisation.</p>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        {/* Sélection mode */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Choisissez votre mode de paiement</p>
          <div className="space-y-2">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all ${mode === m.id ? m.color + ' border-2' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{m.label}</p>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                </div>
                {mode === m.id && <span className="ml-auto font-bold" style={{ color: '#E05C52' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Champs espèce/chèque */}
        {inclus(['espece', 'cheque'], mode) && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom sur le {mode === 'cheque' ? 'chèque' : 'reçu'}</label>
              <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Votre nom complet"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
            </div>
            {mode === 'cheque' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de chèque</label>
                <input value={info} onChange={e => setInfo(e.target.value)} placeholder="Ex: CHQ-2026-001"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#E05C52] transition-colors" />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => router.back()}
            className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm transition-colors">
            Annuler
          </button>
          <button onClick={handlePayer} disabled={!mode || loading}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#E05C52' }}>
            {loading ? 'Traitement...' : `Payer ${montantTotal.toLocaleString('fr-FR')} FCFA`}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function PaiementPage() {
  return <Suspense><PaiementForm /></Suspense>
}
