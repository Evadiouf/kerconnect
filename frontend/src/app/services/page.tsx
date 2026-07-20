'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const SERVICES = [
  {
    emoji: '🔍',
    titre: 'Recherche de bien',
    description: 'Trouvez le bien idéal parmi notre catalogue',
  },
  {
    emoji: '📋',
    titre: 'Gestion locative',
    description: 'Gérez vos locations avec nos outils bailleur',
  },
  {
    emoji: '📝',
    titre: 'Rédaction de contrats',
    description: 'Contrats de bail et de vente sécurisés',
  },
  {
    emoji: '💳',
    titre: 'Paiement sécurisé',
    description: 'Wave, Orange Money, carte bancaire',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#E05C52' }}>
            CE QUE NOUS OFFRONS
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Nos{' '}
            <span style={{ color: '#E05C52' }}>Services</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Tout ce dont vous avez besoin pour louer, acheter ou gérer un bien immobilier au Sénégal
          </p>
        </div>
      </section>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {SERVICES.map((service) => (
            <div
              key={service.titre}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
            >
              <span className="text-4xl">{service.emoji}</span>
              <h2 className="text-lg font-bold text-gray-900">{service.titre}</h2>
              <p className="text-gray-500 text-sm flex-1">{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Prêt à commencer ?</h2>
          <p className="text-gray-500 text-sm mb-6">
            Rejoignez des milliers de Sénégalais qui font confiance à KerConnect.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E05C52' }}
          >
            Créer un compte
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
