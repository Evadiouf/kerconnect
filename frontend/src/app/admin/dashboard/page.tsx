'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Users, Building2, FileText, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  utilisateurs: { total: number; clients: number; bailleurs: number; admins: number; actifs: number; inactifs: number; ce_mois: number }
  biens: { total: number; publies: number; en_attente: number; loues: number; vendus: number; locations: number; ventes: number }
  demandes: { total: number; soumises: number; acceptees: number; refusees: number }
  paiements: { total: number; confirmes: number; en_attente: number; montant_total: number; ce_mois: number }
}

interface InscriptionMois {
  mois: string; total: number; client: number; bailleur: number
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn:  () => api.get('/v1/admin/dashboard').then(r => r.data),
  })

  const stats: Stats | undefined = data?.stats
  const inscriptions: InscriptionMois[] = data?.inscriptions || []

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Chargement des statistiques...</div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue globale de la plateforme KerConnect</p>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Utilisateurs', value: stats?.utilisateurs.total || 0, sub: `+${stats?.utilisateurs.ce_mois || 0} ce mois`, icon: Users, color: 'bg-blue-50 text-blue-700', href: '/admin/users' },
            { label: 'Biens publiés', value: stats?.biens.publies || 0, sub: `${stats?.biens.en_attente || 0} en attente`, icon: Building2, color: 'bg-green-50 text-green-700', href: '/admin/annonces' },
            { label: 'Demandes', value: stats?.demandes.total || 0, sub: `${stats?.demandes.soumises || 0} en cours`, icon: FileText, color: 'bg-orange-50 text-orange-700', href: '/admin/annonces' },
            { label: 'CA du mois', value: `${(stats?.paiements.ce_mois || 0).toLocaleString('fr-FR')} F`, sub: `${stats?.paiements.confirmes || 0} paiements`, icon: CreditCard, color: 'bg-purple-50 text-purple-700', href: '/admin/transactions' },
          ].map(({ label, value, sub, icon: Icon, color, href }) => (
            <Link key={label} href={href}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-900 font-medium">{label}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Répartition utilisateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Répartition par profil
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Clients / Locataires', value: stats?.utilisateurs.clients || 0,   color: 'bg-blue-500' },
                { label: 'Bailleurs / Propriétaires', value: stats?.utilisateurs.bailleurs || 0, color: 'bg-emerald-500' },
                { label: 'Administrateurs',        value: stats?.utilisateurs.admins || 0,   color: 'bg-purple-500' },
              ].map(({ label, value, color }) => {
                const total = stats?.utilisateurs.total || 1
                const pct   = Math.round((value / total) * 100)
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-900">{value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-green-600">✓ {stats?.utilisateurs.actifs || 0} actifs</span>
              <span className="text-red-500">✗ {stats?.utilisateurs.inactifs || 0} inactifs</span>
            </div>
          </div>

          {/* Biens */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-green-600" /> État des biens
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Publiés',     value: stats?.biens.publies || 0,    color: 'text-green-700 bg-green-50' },
                { label: 'En attente',  value: stats?.biens.en_attente || 0, color: 'text-yellow-700 bg-yellow-50' },
                { label: 'Loués',       value: stats?.biens.loues || 0,      color: 'text-blue-700 bg-blue-50' },
                { label: 'Vendus',      value: stats?.biens.vendus || 0,     color: 'text-purple-700 bg-purple-50' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl p-4 ${color}`}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-500">
              <span>📍 {stats?.biens.locations || 0} locations</span>
              <span>🏷️ {stats?.biens.ventes || 0} ventes</span>
            </div>
          </div>
        </div>

        {/* Inscriptions par mois */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Inscriptions — 6 derniers mois</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Mois</th>
                  <th className="text-center py-2 text-gray-500 font-medium">Total</th>
                  <th className="text-center py-2 text-blue-600 font-medium">Clients</th>
                  <th className="text-center py-2 text-emerald-600 font-medium">Bailleurs</th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map((row) => (
                  <tr key={row.mois} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 text-gray-700 font-medium">{row.mois}</td>
                    <td className="text-center py-2.5 font-bold text-gray-900">{row.total}</td>
                    <td className="text-center py-2.5 text-blue-700">{row.client}</td>
                    <td className="text-center py-2.5 text-emerald-700">{row.bailleur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertes */}
        {(stats?.biens.en_attente || 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">
                {stats?.biens.en_attente} annonce(s) en attente de validation
              </p>
              <p className="text-sm text-yellow-700 mt-0.5">Vérifiez les annonces soumises par les bailleurs.</p>
            </div>
            <Link href="/admin/annonces?statut=en_attente"
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 flex-shrink-0">
              Modérer
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
