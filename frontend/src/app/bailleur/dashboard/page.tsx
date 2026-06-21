'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/auth.store'
import { Building2, FileText, CreditCard, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STATS = [
  { label: 'Mes annonces',    value: '0', icon: Building2,  color: 'bg-blue-50 text-blue-700' },
  { label: 'Demandes reçues', value: '0', icon: FileText,   color: 'bg-orange-50 text-orange-700' },
  { label: 'Paiements reçus', value: '0', icon: CreditCard, color: 'bg-green-50 text-green-700' },
  { label: 'Taux occupation', value: '0%', icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
]

export default function BailleurDashboardPage() {
  const { user } = useAuthStore()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-500 mt-1">Bonjour, {user?.name} 👋</p>
          </div>
          <Link href="/bailleur/annonces/ajouter">
            <Button className="bg-blue-900 hover:bg-blue-800 text-white gap-2">
              <Plus size={16} /> Nouvelle annonce
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Publier une annonce', href: '/bailleur/annonces/ajouter', color: 'bg-blue-900 text-white hover:bg-blue-800' },
              { label: 'Voir les demandes',   href: '/bailleur/demandes',         color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200' },
              { label: 'Mes biens loués',     href: '/bailleur/biens',            color: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' },
            ].map(({ label, href, color }) => (
              <Link key={href} href={href}>
                <button className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-colors ${color}`}>
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Dernières demandes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Dernières demandes</h2>
            <Link href="/bailleur/demandes" className="text-blue-600 text-sm hover:underline">Voir tout</Link>
          </div>
          <div className="text-center py-10 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune demande pour le moment.</p>
            <p className="text-xs mt-1">Publiez votre première annonce pour commencer.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
