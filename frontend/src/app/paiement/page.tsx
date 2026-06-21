'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
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
  const params    = useSearchParams()
  const router    = useRouter()
  const contratId = params.get('contrat_id')
  const montant   = params.get('montant') || '0'
  const libelle   = params.get('libelle') || 'Paiement KerConnect'

  const [mode,    setMode]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [reference, setRef]   = useState('')

  // Champs espèce/chèque
  const [nom,  setNom]  = useState('')
  const [info, setInfo] = useState('')

  const handlePayer = async () => {
    if (!mode) { setError('Sélectionnez un mode de paiement.'); return }
    if (inclus(['espece', 'cheque'], mode) && !nom) { setError('Veuillez renseigner votre nom.'); return }
    setError(''); setLoading(true)

    try {
      const res = await api.post('/v1/paiements', {
        contrat_id: contratId,
        montant:    Number(montant),
        mode,
        libelle,
      })

      if (res.data.payment_url) {
        // Mobile Money / Carte → rediriger vers PayDunya
        window.location.href = res.data.payment_url
      } else {
        // Espèce / Chèque → afficher confirmation
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
            <p className="text-xl font-bold font-mono text-blue-900">{reference}</p>
            <p className="text-xs text-gray-400 mt-1">Conservez cette référence</p>
          </div>
          <Button onClick={() => router.push('/client/demandes')} className="bg-blue-900 text-white w-full">
            Retour à mes demandes
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Effectuer un paiement</h1>

        {/* Récapitulatif */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-sm text-blue-600 font-medium mb-1">{libelle}</p>
          <p className="text-3xl font-bold text-blue-900">
            {Number(montant).toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-xs text-blue-500 mt-1">En acceptant, vous reconnaissez nos conditions d&apos;utilisation.</p>
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
                {mode === m.id && <span className="ml-auto text-blue-600 font-bold">✓</span>}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {mode === 'cheque' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de chèque</label>
                <input value={info} onChange={e => setInfo(e.target.value)} placeholder="Ex: CHQ-2026-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={() => router.back()} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
            Annuler
          </Button>
          <Button onClick={handlePayer} disabled={!mode || loading} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white">
            {loading ? 'Traitement...' : `Payer ${Number(montant).toLocaleString('fr-FR')} FCFA`}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function PaiementPage() {
  return <Suspense><PaiementForm /></Suspense>
}
