'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

/* ── Helpers ── */
const MOIS_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aout',
  '09': 'Sept', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

function shortMois(mois: string): string {
  // backend renvoie "Jan 2026", on prend juste le premier mot
  return mois.split(' ')[0]
}

/* ── Bar chart inscriptions (données réelles) ── */
function StackedBarChart({ data }: { data: { mois: string; total: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.total), 1)

  return (
    <div className="mt-4">
      <div className="flex items-end gap-2 h-48">
        {data.map(({ mois, total }) => {
          const height = `${(total / maxVal) * 100}%`
          return (
            <div key={mois} className="flex flex-col items-center gap-0.5 flex-1" style={{ height: '100%', justifyContent: 'flex-end' }}>
              <div className="w-full flex flex-col" style={{ height }}>
                <div
                  className="w-full rounded-t-sm"
                  style={{ height: '100%', backgroundColor: '#34D399' }}
                />
              </div>
              <span className="text-xs text-gray-400 mt-1">{shortMois(mois)}</span>
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#34D399' }} />
          <span className="text-xs text-gray-500">Inscriptions</span>
        </div>
      </div>
    </div>
  )
}

/* ── Donut "Répartition par profil" ── */
function DonutRepartition({ users, biens, demandes }: { users: number; biens: number; demandes: number }) {
  const total = users + biens + demandes || 1
  const C = 376.99
  const usersLen    = (users    / total) * C
  const biensLen    = (biens    / total) * C
  const demandesLen = (demandes / total) * C

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 140 140" className="w-44 h-44 -rotate-90">
          <circle cx="70" cy="70" r="60" fill="none" stroke="#f3f4f6" strokeWidth="22"/>
          {/* Demandes (gris) */}
          <circle cx="70" cy="70" r="60" fill="none" stroke="#E5E7EB" strokeWidth="22"
            strokeDasharray={`${demandesLen} ${C - demandesLen}`}
            strokeDashoffset={0}
          />
          {/* Biens (orange) */}
          <circle cx="70" cy="70" r="60" fill="none" stroke="#F87171" strokeWidth="22"
            strokeDasharray={`${biensLen} ${C - biensLen}`}
            strokeDashoffset={-demandesLen}
          />
          {/* Utilisateurs (vert) */}
          <circle cx="70" cy="70" r="60" fill="none" stroke="#34D399" strokeWidth="22"
            strokeDasharray={`${usersLen} ${C - usersLen}`}
            strokeDashoffset={-(demandesLen + biensLen)}
          />
        </svg>
        {/* Centre vide — cercle blanc */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full" />
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#34D399' }} />
          <span className="text-gray-600">Utilisateurs: {users}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F87171' }} />
          <span className="text-gray-600">Biens: {biens}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E5E7EB' }} />
          <span className="text-gray-600">Demandes: {demandes}</span>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/v1/admin/dashboard').then(r => r.data),
  })

  const stats = data?.stats || {}
  const users          = stats.utilisateurs?.total   ?? 0
  const biens          = stats.biens?.total          ?? 0
  const demandes       = stats.demandes?.total       ?? 0
  const paiementsTotal = stats.paiements?.montant_total ?? 0
  const inscriptionsMois: { mois: string; total: number }[] = data?.inscriptions ?? []

  const CARDS = [
    { label: 'Utilisateurs inscrits', value: isLoading ? '…' : String(users),                                      icon: '📋', iconBg: 'bg-purple-50' },
    { label: 'Annonces en ligne',     value: isLoading ? '…' : String(stats.biens?.publies ?? 0),                  icon: '📣', iconBg: 'bg-orange-50' },
    { label: 'Volume Total',          value: isLoading ? '…' : `${paiementsTotal.toLocaleString('fr-FR')} FCFA`,   icon: '💰', iconBg: 'bg-green-50'  },
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

        {/* ── 3 cards stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map(({ label, value, icon, iconBg }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl ${iconBg}`}>
                {icon}
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Bar chart inscriptions (2/3) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1">Inscriptions par mois</h2>
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Chargement…</div>
            ) : inscriptionsMois.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Aucune donnée</div>
            ) : (
              <StackedBarChart data={inscriptionsMois} />
            )}
          </div>

          {/* Donut répartition (1/3) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col items-center">
            <h2 className="font-bold text-gray-900 mb-4 self-start">Répartition</h2>
            {isLoading ? (
              <div className="h-44 flex items-center justify-center text-gray-400 text-sm">Chargement…</div>
            ) : (
              <DonutRepartition users={users} biens={biens} demandes={demandes} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
