'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { TrendingUp, Download } from 'lucide-react'
import { useState } from 'react'

const MOIS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
]

interface Paiement {
  id: number
  montant: number
  montant_net: number
  statut: string
  mode: string
  created_at: string
  contrat?: { bien?: { titre: string }; locataire?: { name: string } }
}

const MODE_LABEL: Record<string, string> = {
  wave: 'Wave', orange_money: 'Orange Money',
  carte: 'Carte', espece: 'Espèces', cheque: 'Chèque',
}

export default function BailleurRapportPage() {
  const now  = new Date()
  const [mois, setMois]   = useState(now.getMonth())
  const [annee, setAnnee] = useState(now.getFullYear())

  const { data, isLoading } = useQuery({
    queryKey: ['bailleur-paiements-rapport', mois + 1, annee],
    queryFn:  () => api.get('/v1/bailleur/paiements', {
      params: { month: mois + 1, year: annee },
    }).then(r => r.data),
  })

  const filtres: Paiement[] = data?.data ?? []

  const totalPaye = filtres.reduce((s, p) => s + Number(p.montant_net ?? p.montant), 0)

  const annees = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">

        {/* En-tête */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={22} style={{ color: '#4338CA' }} />
            Rapport mensuel
          </h1>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 print:hidden"
            style={{ backgroundColor: '#4338CA' }}
          >
            <Download size={15} /> Télécharger PDF
          </button>
        </div>

        {/* Sélecteur période — masqué à l'impression */}
        <div className="flex gap-3 print:hidden">
          <select value={mois} onChange={e => setMois(Number(e.target.value))}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4338CA] bg-white">
            {MOIS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4338CA] bg-white">
            {annees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Zone imprimable */}
        <div className="print:block">

          {/* En-tête impression */}
          <div className="hidden print:block mb-6 border-b pb-4">
            <h2 className="text-xl font-bold">KerConnect : Rapport de revenus</h2>
            <p className="text-sm text-gray-500">{MOIS[mois]} {annee}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="rounded-2xl p-5 shadow-sm print:border" style={{ backgroundColor: '#4338CA10', border: '1px solid #4338CA20' }}>
              <p className="text-xs mb-1" style={{ color: '#4338CA' }}>Montant payé</p>
              <p className="text-2xl font-bold" style={{ color: '#4338CA' }}>{totalPaye.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs text-gray-400 mt-1">{filtres.length} paiement(s)</p>
            </div>
          </div>

          {/* Tableau */}
          {isLoading ? (
            <div className="text-center py-10 text-gray-400">Chargement…</div>
          ) : filtres.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <p className="text-gray-400 text-sm">Aucun paiement confirmé pour {MOIS[mois]} {annee}.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Bien', 'Locataire', 'Mode', 'Montant payé (FCFA)', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtres.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{p.contrat?.bien?.titre ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{p.contrat?.locataire?.name ?? '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{MODE_LABEL[p.mode] ?? p.mode}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: '#4338CA' }}>{Number(p.montant_net ?? p.montant).toLocaleString('fr-FR')}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold text-gray-700 text-sm">TOTAL</td>
                    <td className="px-4 py-3 font-bold" style={{ color: '#4338CA' }}>{totalPaye.toLocaleString('fr-FR')}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Footer impression */}
          <div className="hidden print:block mt-6 text-xs text-gray-400 text-center border-t pt-4">
            Rapport généré par KerConnect · Naratechvision · contact@naratechvision.com
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
