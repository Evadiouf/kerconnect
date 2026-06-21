'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useState } from 'react'
import { Building2, MapPin } from 'lucide-react'
import Link from 'next/link'

// En V1 : données statiques - remplacées par API en V2
const TABS = ['Biens loués', 'Biens achetés']

export default function MesBiensPage() {
  const [tab, setTab] = useState(0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes biens</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === i ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Building2 size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="font-medium text-gray-900 mb-2">
            {tab === 0 ? 'Aucun bien loué' : 'Aucun bien acheté'}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {tab === 0
              ? 'Vos biens loués apparaîtront ici une fois votre contrat signé.'
              : 'Vos acquisitions apparaîtront ici après finalisation.'}
          </p>
          <Link href="/location" className="bg-blue-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
            {tab === 0 ? 'Trouver un logement' : 'Acheter un bien'}
          </Link>
        </div>

        {/* Info contrat */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 text-sm">Comment ça marche ?</p>
              <p className="text-blue-700 text-sm mt-1">
                Faites une demande sur un bien → Le bailleur l&apos;accepte → Signez le contrat électroniquement → Le bien apparaît ici.
              </p>
              <Link href="/client/demandes" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                Voir mes demandes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
