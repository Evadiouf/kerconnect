'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Building2, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/* ── Occupation donut chart SVG ── */
function DonutChart({ total, loues, publie }: { total: number; loues: number; publie: number }) {
  const vacant = Math.max(total - loues - publie, 0)
  const C = 376.99
  const safeTotal = total || 1
  const loueLen   = (loues   / safeTotal) * C
  const travLen   = (publie  / safeTotal) * C
  const vacLen    = (vacant  / safeTotal) * C

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 140 140" className="w-40 h-40 -rotate-90">
          {/* Fond */}
          <circle cx="70" cy="70" r="60" fill="none" stroke="#f3f4f6" strokeWidth="18"/>
          {/* Vacant (gris) */}
          <circle cx="70" cy="70" r="60" fill="none" stroke="#9CA3AF" strokeWidth="18"
            strokeDasharray={`${vacLen} ${C - vacLen}`}
            strokeDashoffset={0}
          />
          {/* Publié (orange) */}
          <circle cx="70" cy="70" r="60" fill="none" stroke="#F59E0B" strokeWidth="18"
            strokeDasharray={`${travLen} ${C - travLen}`}
            strokeDashoffset={-vacLen}
          />
          {/* Loué (vert) */}
          <circle cx="70" cy="70" r="60" fill="none" stroke="#10B981" strokeWidth="18"
            strokeDasharray={`${loueLen} ${C - loueLen}`}
            strokeDashoffset={-(vacLen + travLen)}
          />
        </svg>
        {/* Centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-gray-900">{total}</span>
          <span className="text-xs text-gray-400">Biens</span>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 space-y-2 w-full">
        {[
          { label: `Loué`,    count: loues,  color: '#10B981' },
          { label: `Publié`,  count: publie, color: '#F59E0B' },
          { label: `Vacant`,  count: vacant, color: '#9CA3AF' },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{label}</span>
            </div>
            <span className="font-semibold text-gray-900">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Bar chart demandes ── */
function BarChart({ demandes }: { demandes: { statut: string }[] }) {
  const statuts = ['soumise', 'en_cours', 'acceptee', 'refusee', 'annulee']
  const labels:  Record<string, string> = {
    soumise:  'Soumise',
    en_cours: 'En cours',
    acceptee: 'Acceptée',
    refusee:  'Refusée',
    annulee:  'Annulée',
  }
  const counts = statuts.map(s => ({ day: labels[s], val: demandes.filter(d => d.statut === s).length }))
  const maxVal = Math.max(...counts.map(c => c.val), 1)

  return (
    <div className="flex items-end gap-2 h-32 mt-4">
      {counts.map(({ day, val }) => (
        <div key={day} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${(val / maxVal) * 100}%`,
              backgroundColor: '#4338CA',
            }}
          />
          <span className="text-xs text-gray-400">{day}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Bar chart performance financière (données réelles) ── */
function FinanceChart({ data }: { data: { mois: string; total: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.total), 1)
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map(({ mois, total }) => (
        <div key={mois} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-md transition-all"
            style={{ height: `${Math.max((total / maxVal) * 100, total > 0 ? 8 : 4)}%`, backgroundColor: total > 0 ? '#4338CA' : '#E5E7EB' }}
          />
          <span className="text-xs text-gray-400">{mois}</span>
          <span className="text-xs text-gray-500 font-medium">
            {total > 0 ? (total >= 1000 ? `${(total / 1000).toFixed(0)}k` : String(total)) : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function BailleurDashboardPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  const { data: biensData } = useQuery({
    queryKey: ['bailleur-biens-stats'],
    queryFn: () => api.get('/v1/bailleur/biens?per_page=100').then(r => r.data),
  })

  const { data: demandesData } = useQuery({
    queryKey: ['bailleur-demandes-stats'],
    queryFn: () => api.get('/v1/bailleur/demandes?per_page=100').then(r => r.data),
  })

  const { data: paiementsData } = useQuery({
    queryKey: ['bailleur-paiements-chart'],
    queryFn: () => api.get('/v1/bailleur/paiements?per_page=100').then(r => r.data).catch(() => ({ data: [] })),
  })

  const biens    = biensData?.data    || []
  const demandes = demandesData?.data || []
  const paiements: { statut: string; montant: number; created_at: string }[] = paiementsData?.data || []

  // Revenus mensuels des 6 derniers mois (paiements confirmés)
  const revenusParMois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    const mois  = d.toLocaleDateString('fr-FR', { month: 'short' })
    const total = paiements
      .filter(p => {
        if (p.statut !== 'confirme') return false
        const pd = new Date(p.created_at)
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()
      })
      .reduce((s, p) => s + Number(p.montant), 0)
    return { mois, total }
  })
  const totalRevenu = paiements.filter(p => p.statut === 'confirme').reduce((s, p) => s + Number(p.montant), 0)

  const totalBiens      = biens.length
  const biensLoues      = biens.filter((b: { statut: string }) => b.statut === 'loue').length
  const biensPubies     = biens.filter((b: { statut: string }) => b.statut === 'publie').length
  const totalDemandes   = demandes.length
  const demandesEnCours = demandes.filter((d: { statut: string }) => d.statut === 'en_cours').length

  const STATS = [
    { label: 'Propriétés Actives',   value: String(totalBiens),      icon: '🏠', iconBg: 'bg-blue-50'   },
    { label: 'Nouvelles Demandes',   value: String(totalDemandes),   icon: '📋', iconBg: 'bg-purple-50' },
    { label: 'Biens loués',          value: String(biensLoues),      icon: '🔑', iconBg: 'bg-orange-50' },
    { label: 'Demandes en cours',    value: String(demandesEnCours), icon: '⏳', iconBg: 'bg-green-50'  },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── En-tête ── */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* ── 4 cards stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon, iconBg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl ${iconBg}`}>
                {icon}
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Rang 2 : Occupation + Demandes + Croissance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Occupation actuelle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Occupation actuelle</h2>
            </div>
            <DonutChart total={totalBiens} loues={biensLoues} publie={biensPubies} />
          </div>

          {/* Demandes reçues */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-900">Demandes reçues</h2>
            </div>
            <p className="text-xs text-gray-400 mb-2">Par statut</p>
            <BarChart demandes={demandes} />
          </div>

          {/* Croissance */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <TrendingUp size={28} style={{ color: '#4338CA' }} />
            </div>
            <p className="text-xl font-extrabold text-gray-900 mb-2">
              {biensLoues} bien{biensLoues !== 1 ? 's' : ''} loué{biensLoues !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-400">
              {totalBiens > 0
                ? `${Math.round((biensLoues / totalBiens) * 100)}% de votre portefeuille est loué.`
                : 'Ajoutez vos premiers biens pour commencer.'}
            </p>
          </div>
        </div>

        {/* ── Performance Financière ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-bold text-gray-900">Performance Financière</h2>
              <p className="text-xs text-gray-400 mt-0.5">Revenus perçus ces 6 derniers mois</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-gray-900">{totalRevenu.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs text-gray-400">Total confirmé</p>
            </div>
          </div>
          <div className="mt-4">
            <FinanceChart data={revenusParMois} />
          </div>
        </div>

        {/* ── Actions rapides ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Gestion des annonces', href: '/bailleur/annonces', icon: Building2, color: '#4338CA' },
            { label: 'Voir les demandes',    href: '/bailleur/demandes', icon: FileText,  color: '#E05C52' },
            { label: 'Gestion des biens',    href: '/bailleur/biens',    icon: Building2, color: '#10B981' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="font-semibold text-gray-700 text-sm">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
