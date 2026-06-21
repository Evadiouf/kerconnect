'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { FileText, Heart, Building2, CreditCard } from 'lucide-react'

export default function ClientDashboardPage() {
  const { user } = useAuthStore()

  const { data: demandes } = useQuery({
    queryKey: ['client-demandes'],
    queryFn:  () => api.get('/v1/client/demandes').then(r => r.data),
  })

  const { data: favoris } = useQuery({
    queryKey: ['favoris'],
    queryFn:  () => api.get('/v1/favoris').then(r => r.data),
  })

  const totalDemandes  = demandes?.total || 0
  const totalFavoris   = favoris?.length || 0

  const STATS = [
    { label: 'Mes demandes',   value: String(totalDemandes), icon: FileText,   color: 'bg-blue-50 text-blue-700',   href: '/client/demandes' },
    { label: 'Mes favoris',    value: String(totalFavoris),  icon: Heart,      color: 'bg-red-50 text-red-700',     href: '/client/favoris' },
    { label: 'Biens loués',    value: '0',                   icon: Building2,  color: 'bg-green-50 text-green-700', href: '/client/biens' },
    { label: 'Paiements',      value: '0',                   icon: CreditCard, color: 'bg-purple-50 text-purple-700', href: '/client/biens' },
  ]

  const recentDemandes = demandes?.data?.slice(0, 3) || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Bonjour, {user?.name} 👋</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color, href }) => (
            <Link key={label} href={href}>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Activités récentes</h2>
            <Link href="/client/demandes" className="text-blue-600 text-sm hover:underline">Voir tout</Link>
          </div>

          {recentDemandes.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FileText size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune activité récente.</p>
              <Link href="/location" className="text-blue-600 text-sm hover:underline mt-2 block">
                Explorer les biens →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDemandes.map((d: {id: number; type: string; statut: string; bien?: {titre: string}; created_at: string}) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.bien?.titre}</p>
                    <p className="text-xs text-gray-500 capitalize">{d.type} · {new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                    d.statut === 'acceptee' ? 'bg-green-100 text-green-700' :
                    d.statut === 'refusee'  ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {d.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explorer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/location" className="bg-blue-900 text-white rounded-2xl p-6 hover:bg-blue-800 transition-colors">
            <h3 className="font-bold text-lg mb-1">Trouver un logement</h3>
            <p className="text-blue-200 text-sm">Explorer plus de 1 200 biens à louer</p>
          </Link>
          <Link href="/vente" className="bg-emerald-700 text-white rounded-2xl p-6 hover:bg-emerald-600 transition-colors">
            <h3 className="font-bold text-lg mb-1">Acheter un bien</h3>
            <p className="text-emerald-200 text-sm">Notre sélection de biens à acquérir</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
