'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useState, useEffect } from 'react'
import { Settings, TrendingUp, Percent } from 'lucide-react'

export default function AdminSettingsPage() {
  const qc = useQueryClient()
  const [tauxVente,    setTauxVente]    = useState('2')
  const [tauxLocation, setTauxLocation] = useState('5')
  const [active, setActive] = useState('1')
  const [saved,  setSaved]  = useState(false)

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn:  () => api.get('/v1/admin/settings').then(r => r.data),
  })

  const { data: commissionsData } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn:  () => api.get('/v1/admin/commissions').then(r => r.data),
  })

  useEffect(() => {
    if (settings) {
      setTauxVente(settings.commission_taux_vente ?? '2')
      setTauxLocation(settings.commission_taux_location ?? '5')
      setActive(settings.commission_active ?? '1')
    }
  }, [settings])

  const save = useMutation({
    mutationFn: () => api.put('/v1/admin/settings', {
      commission_taux_vente:    tauxVente,
      commission_taux_location: tauxLocation,
      commission_active:        active,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const paiements = commissionsData?.paiements?.data ?? []
  const totalCommissions  = Number(commissionsData?.total_commissions  ?? 0)
  const totalTransactions = Number(commissionsData?.total_transactions ?? 0)

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings size={22} /> Paramètres de la plateforme
        </h1>

        {/* Commission */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Percent size={18} style={{ color: '#4338CA' }} /> Commission automatique
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vente (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0" max="50" step="0.5"
                  value={tauxVente} onChange={e => setTauxVente(e.target.value)}
                  className="w-32 px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:border-[#4338CA] transition-colors text-center"
                />
                <span className="text-2xl font-bold text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Sur une vente de 200 000 FCFA → commission de <strong>{Math.round(200000 * Number(tauxVente) / 100).toLocaleString('fr-FR')} FCFA</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min="0" max="50" step="0.5"
                  value={tauxLocation} onChange={e => setTauxLocation(e.target.value)}
                  className="w-32 px-4 py-3 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:border-[#4338CA] transition-colors text-center"
                />
                <span className="text-2xl font-bold text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Sur un loyer confirmé de 200 000 FCFA → commission de <strong>{Math.round(200000 * Number(tauxLocation) / 100).toLocaleString('fr-FR')} FCFA</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de la commission
              </label>
              <div className="flex gap-3">
                <button onClick={() => setActive('1')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${active === '1' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                  ✅ Activée
                </button>
                <button onClick={() => setActive('0')}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${active === '0' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-500'}`}>
                  ❌ Désactivée
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#4338CA' }}
            >
              {save.isPending ? 'Enregistrement…' : '💾 Enregistrer'}
            </button>
            {saved && <span className="text-green-600 text-sm font-medium">✅ Paramètres mis à jour !</span>}
          </div>
        </div>

        {/* Revenus plateforme */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={18} style={{ color: '#10B981' }} /> Revenus de la plateforme
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium mb-1">Commissions totales</p>
              <p className="text-2xl font-bold text-green-700">{totalCommissions.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs text-indigo-600 font-medium mb-1">Volume total traité</p>
              <p className="text-2xl font-bold text-indigo-700">{totalTransactions.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-orange-600 font-medium mb-1">Taux actuels</p>
              <p className="text-2xl font-bold text-orange-700">
                {settings?.commission_taux_vente ?? tauxVente}% vente · {settings?.commission_taux_location ?? tauxLocation}% loc.
              </p>
            </div>
          </div>

          {/* Historique commissions */}
          {paiements.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Client', 'Bien', 'Montant brut', 'Commission', 'Net bailleur', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paiements.map((p: {id: number; payeur?: {name: string}; contrat?: {bien?: {titre: string}}; montant: number; commission_montant: number; montant_net: number; created_at: string}) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{p.payeur?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.contrat?.bien?.titre ?? '-'}</td>
                      <td className="px-4 py-3 font-bold">{Number(p.montant).toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3 text-green-600 font-bold">{Number(p.commission_montant).toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3 text-gray-700">{Number(p.montant_net).toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {paiements.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">Aucune commission perçue pour le moment.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
