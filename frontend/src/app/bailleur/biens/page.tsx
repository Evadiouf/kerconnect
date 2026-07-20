'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { Building2, MapPin, Eye, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

const TABS = ['Tous', 'Publiés', 'Loués', 'Vendus']

const STATUT_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  publie:     { label: 'Publié',      bg: '#ECFDF5', color: '#059669' },
  loue:       { label: 'Loué',        bg: '#EEF2FF', color: '#4338CA' },
  vendu:      { label: 'Vendu',       bg: '#F5F3FF', color: '#7C3AED' },
  en_attente: { label: 'En attente',  bg: '#FFF7ED', color: '#EA580C' },
}

interface Bien {
  id: number
  titre: string
  ville: string
  adresse: string
  prix: number
  type: string
  nature: string
  statut: string
}

export default function BailleurBiensPage() {
  const [tab, setTab] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['bailleur-biens-all'],
    queryFn: () => api.get('/v1/bailleur/biens?per_page=100').then(r => r.data),
  })

  const allBiens: Bien[] = data?.data || []

  const filtered =
    tab === 0 ? allBiens
    : tab === 1 ? allBiens.filter(b => b.statut === 'publie')
    : tab === 2 ? allBiens.filter(b => b.statut === 'loue')
    : allBiens.filter(b => b.statut === 'vendu')

  const tabCounts = [
    allBiens.length,
    allBiens.filter(b => b.statut === 'publie').length,
    allBiens.filter(b => b.statut === 'loue').length,
    allBiens.filter(b => b.statut === 'vendu').length,
  ]

  const emptyMsg = [
    { title: 'Aucun bien pour le moment',   sub: 'Publiez votre première annonce pour commencer.' },
    { title: 'Aucun bien publié',           sub: 'Vos annonces publiées et actives apparaîtront ici.' },
    { title: 'Aucun bien loué',             sub: 'Les biens en location active apparaîtront ici après signature du contrat.' },
    { title: 'Aucun bien vendu',            sub: 'Les biens vendus apparaîtront ici après confirmation du paiement.' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mes biens</h1>
          <Link
            href="/bailleur/annonces/ajouter"
            className="text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E05C52' }}
          >
            + Ajouter un bien
          </Link>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              style={tab === i ? { color: '#4338CA' } : {}}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === i ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
              {!isLoading && (
                <span className="ml-1.5 text-xs opacity-70">({tabCounts[i]})</span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto"
              style={{ borderColor: '#4338CA', borderTopColor: 'transparent' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Building2 size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-medium text-gray-900 mb-2">{emptyMsg[tab].title}</p>
            <p className="text-gray-500 text-sm mb-6">{emptyMsg[tab].sub}</p>
            <Link href="/bailleur/annonces/ajouter"
              className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity inline-block"
              style={{ backgroundColor: '#E05C52' }}>
              Publier une annonce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((b) => {
              const s = STATUT_LABEL[b.statut] ?? { label: b.statut, bg: '#F3F4F6', color: '#6B7280' }
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: s.bg }}>
                      <Building2 size={22} style={{ color: s.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{b.titre}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {b.adresse}, {b.ville}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{b.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-gray-900 text-sm">
                        {b.prix.toLocaleString('fr-FR')} FCFA{b.nature === 'location' ? '/mois' : ''}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/biens/${b.id}`}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        title="Voir l'annonce">
                        <Eye size={16} className="text-gray-500" />
                      </Link>
                      <Link href={`/bailleur/annonces/${b.id}`}
                        className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: '#4338CA15' }}
                        title="Modifier">
                        <Pencil size={16} style={{ color: '#4338CA' }} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="rounded-2xl p-5 border" style={{ backgroundColor: '#4338CA10', borderColor: '#4338CA30' }}>
          <div className="flex items-start gap-3">
            <Building2 size={18} style={{ color: '#4338CA' }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm" style={{ color: '#4338CA' }}>Cycle de vie d&apos;un bien</p>
              <p className="text-gray-600 text-sm mt-1">
                Publiez une annonce → Acceptez une demande → Signez le contrat → Confirmez le paiement → Le bien passe en Loué ou Vendu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
