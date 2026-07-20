'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const AIDES = [
  {
    emoji: '🏛️',
    nom: 'BHS - Banque de l\'Habitat',
    description: 'Crédits immobiliers à taux préférentiel pour les ménages sénégalais',
  },
  {
    emoji: '🤝',
    nom: 'SICAP',
    description: 'Société Immobilière du Cap-Vert, logements accessibles à Dakar et environs',
  },
  {
    emoji: '💼',
    nom: 'FONHAB',
    description: 'Fonds pour l\'Habitat, accompagnement des projets immobiliers',
  },
]

export default function SubventionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#E05C52' }}>
            AIDES AU LOGEMENT
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Subventions &amp;{' '}
            <span style={{ color: '#E05C52' }}>Aides au logement</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Découvrez les programmes d&apos;aide à l&apos;accession à la propriété au Sénégal
          </p>
        </div>
      </section>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {AIDES.map((aide) => (
            <div
              key={aide.nom}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
            >
              <span className="text-4xl">{aide.emoji}</span>
              <h2 className="text-lg font-bold text-gray-900">{aide.nom}</h2>
              <p className="text-gray-500 text-sm flex-1">{aide.description}</p>
            </div>
          ))}
        </div>

        {/* CTA bas de page */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-700 font-medium mb-4">
            Pour plus d&apos;informations, contactez-nous
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E05C52' }}
          >
            Nous contacter
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
