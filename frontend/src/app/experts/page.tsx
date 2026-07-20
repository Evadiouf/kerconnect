'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const EXPERTS = [
  {
    nom: 'Moussa Diallo',
    specialite: 'Expert évaluation',
    ville: 'Dakar',
    initiales: 'MD',
  },
  {
    nom: 'Fatou Sarr',
    specialite: 'Conseil juridique immobilier',
    ville: 'Thiès',
    initiales: 'FS',
  },
  {
    nom: 'Ibrahima Ndiaye',
    specialite: 'Gestion de patrimoine',
    ville: 'Saint-Louis',
    initiales: 'IN',
  },
]

export default function ExpertsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#E05C52' }}>
            NOTRE ÉQUIPE
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Nos{' '}
            <span style={{ color: '#E05C52' }}>Experts Immobiliers</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Une équipe de professionnels à votre service
          </p>
        </div>
      </section>

      {/* Cards experts */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {EXPERTS.map((expert) => (
            <div
              key={expert.nom}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-4"
            >
              {/* Avatar initiales */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ backgroundColor: '#4338CA' }}
              >
                {expert.initiales}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{expert.nom}</h2>
                <p className="text-sm font-medium mt-0.5" style={{ color: '#E05C52' }}>
                  {expert.specialite}
                </p>
                <p className="text-sm text-gray-500 mt-1">📍 {expert.ville}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Besoin d&apos;un expert ?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Nos conseillers sont disponibles pour vous accompagner dans votre projet immobilier.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E05C52' }}
          >
            Contacter un expert
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
