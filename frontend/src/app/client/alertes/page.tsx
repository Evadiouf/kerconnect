'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Bell, Plus, Trash2, BellOff } from 'lucide-react'

interface Alerte {
  id: number; ville?: string; nature?: string
  prix_max?: number; type_bien?: string; active: boolean; created_at: string
}

const VILLES    = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Touba', 'Kaolack']
const TYPES     = ['Appartement', 'Villa', 'Studio', 'Maison', 'Duplex', 'Terrain', 'Bureau']

export default function AlertesPage() {
  const qc = useQueryClient()
  const [ville,    setVille]    = useState('')
  const [nature,   setNature]   = useState('')
  const [prixMax,  setPrixMax]  = useState('')
  const [typeBien, setTypeBien] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['alertes'],
    queryFn:  () => api.get('/v1/alertes').then(r => r.data),
  })

  const creer = useMutation({
    mutationFn: () => api.post('/v1/alertes', {
      ville:     ville || undefined,
      nature:    nature || undefined,
      prix_max:  prixMax ? Number(prixMax) : undefined,
      type_bien: typeBien || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertes'] })
      setVille(''); setNature(''); setPrixMax(''); setTypeBien('')
    },
  })

  const supprimer = useMutation({
    mutationFn: (id: number) => api.delete(`/v1/alertes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alertes'] }),
  })

  const alertes: Alerte[] = data ?? []

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell size={22} style={{ color: '#4338CA' }} /> Mes alertes biens
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Soyez notifié dès qu'un bien correspond à vos critères.
          </p>
        </div>

        {/* Formulaire création */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={16} /> Créer une alerte
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Ville</label>
              <select value={ville} onChange={e => setVille(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4338CA] bg-white">
                <option value="">Toutes les villes</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nature</label>
              <select value={nature} onChange={e => setNature(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4338CA] bg-white">
                <option value="">Location ou Vente</option>
                <option value="location">Location</option>
                <option value="vente">Vente</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Budget max (FCFA)</label>
              <input type="number" value={prixMax} onChange={e => setPrixMax(e.target.value)}
                placeholder="Ex: 300000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4338CA]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type de bien</label>
              <select value={typeBien} onChange={e => setTypeBien(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4338CA] bg-white">
                <option value="">Tous les types</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={() => creer.mutate()}
            disabled={creer.isPending || (!ville && !nature && !prixMax && !typeBien)}
            className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#E05C52' }}
          >
            <Bell size={15} />
            {creer.isPending ? 'Création...' : 'Créer l\'alerte'}
          </button>
        </div>

        {/* Liste alertes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Mes alertes actives ({alertes.length})</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Chargement...</div>
          ) : alertes.length === 0 ? (
            <div className="p-12 text-center">
              <BellOff size={40} className="mx-auto mb-4 text-gray-200" />
              <p className="font-medium text-gray-900 mb-1">Aucune alerte créée</p>
              <p className="text-gray-400 text-sm">Créez une alerte pour être notifié automatiquement.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {alertes.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: '#4338CA15' }}>
                      🔔
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {[a.ville, a.nature, a.type_bien].filter(Boolean).join(' · ') || 'Tous biens'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {a.prix_max ? `Budget max : ${Number(a.prix_max).toLocaleString('fr-FR')} FCFA` : 'Tous budgets'}
                        {' · '}{new Date(a.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => supprimer.mutate(a.id)}
                    disabled={supprimer.isPending}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Supprimer l'alerte"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-sm text-indigo-700">
          <p className="font-semibold mb-1">💡 Comment ça marche ?</p>
          <p>Dès qu'un bailleur publie un bien correspondant à vos critères, vous recevrez une notification
          par email et dans la cloche en haut à droite.</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
