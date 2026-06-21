'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function BailleurPaiementsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Paiements reçus</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total reçu', value: '0 FCFA', color: 'text-green-700' },
            { label: 'Ce mois',    value: '0 FCFA', color: 'text-blue-700' },
            { label: 'En attente', value: '0',      color: 'text-yellow-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <CreditCard size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="font-medium text-gray-900 mb-2">Aucun paiement reçu</p>
          <p className="text-gray-500 text-sm mb-6">
            Les paiements de vos locataires apparaîtront ici après signature des contrats.
          </p>
          <Link href="/bailleur/demandes" className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 inline-block">
            Voir les demandes
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
