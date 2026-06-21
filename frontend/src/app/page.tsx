import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Search, Shield, Star, Users } from 'lucide-react'

const FEATURED = [
  { id: 1, titre: 'Villa Moderne avec Piscine', nature: 'location' as const, prix: 300000, adresse: 'Mermoz', ville: 'Dakar', is_new: true },
  { id: 2, titre: 'Appartement vue mer',        nature: 'location' as const, prix: 150000, adresse: 'Plateau', ville: 'Dakar' },
  { id: 3, titre: 'Duplex standing',            nature: 'vente' as const,    prix: 45000000, adresse: 'Almadies', ville: 'Dakar' },
]

const STATS = [
  { label: 'Biens disponibles', value: '1 234' },
  { label: 'Appartements',      value: '234' },
  { label: 'Villas',            value: '450' },
  { label: 'Clients satisfaits', value: '2 800+' },
]

const TYPES = [
  { label: 'Appartements', icon: '🏢', href: '/location?type=appartement' },
  { label: 'Villas',       icon: '🏡', href: '/location?type=villa' },
  { label: 'Chambres',     icon: '🛏️', href: '/location?type=chambre' },
  { label: 'Duplex',       icon: '🏘️', href: '/location?type=duplex' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Louez & achetez,<br />
            <span className="text-blue-300">en toute simplicité.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
            Une nouvelle façon de trouver le logement idéal. Des offres vérifiées, un parcours 100 % en ligne.
          </p>
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-left">
                <label className="block text-xs font-medium text-gray-500 mb-1">Adresse / Ville</label>
                <input type="text" placeholder="Ex: Dakar, Almadies..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="text-left">
                <label className="block text-xs font-medium text-gray-500 mb-1">Type de bien</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Tous les types</option>
                  <option>Appartement</option><option>Villa</option><option>Chambre</option><option>Duplex</option>
                </select>
              </div>
              <div className="text-left">
                <label className="block text-xs font-medium text-gray-500 mb-1">Budget max (FCFA)</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Sans limite</option>
                  <option>100 000</option><option>200 000</option><option>500 000</option><option>1 000 000+</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Link href="/location" className="flex-1">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 gap-2">
                  <Search size={16} /> Rechercher
                </Button>
              </Link>
              <Link href="/vente"><Button className="bg-gray-100 text-gray-700 hover:bg-gray-200 py-3 px-6">Acheter</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-blue-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Types */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trouvez le bien qui vous ressemble</h2>
          <p className="text-gray-500 mb-8">Appartements, villas, chambres ou duplex — explorez nos univers.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TYPES.map((t) => (
              <Link key={t.label} href={t.href} className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow border border-gray-100 group">
                <span className="text-4xl block mb-3">{t.icon}</span>
                <p className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">{t.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Biens en vedette */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nos biens disponibles</h2>
              <p className="text-gray-500 mt-1">Les meilleures opportunités du moment, choisies par nos experts.</p>
            </div>
            <Link href="/location" className="text-blue-900 font-medium hover:underline">Voir tout →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED.map((bien) => (
              <Link key={bien.id} href={`/biens/${bien.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                  <span className="text-5xl">🏠</span>
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${bien.nature === 'location' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                      {bien.nature === 'location' ? 'Location' : 'Vente'}
                    </span>
                    {bien.is_new && <span className="px-2 py-1 rounded-md text-xs font-semibold bg-orange-500 text-white">Nouveau</span>}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-900">{bien.titre}</h3>
                  <p className="text-gray-500 text-sm mb-3">{bien.adresse}, {bien.ville}</p>
                  <p className="text-blue-900 font-bold">
                    {bien.nature === 'location' ? `${bien.prix.toLocaleString('fr-FR')} FCFA/mois` : `${bien.prix.toLocaleString('fr-FR')} FCFA`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi KerConnect */}
      <section className="py-16 px-4 bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Pourquoi choisir KerConnect ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Biens vérifiés',  desc: 'Chaque annonce est contrôlée par notre équipe avant publication.' },
              { icon: Star,   title: 'Experts locaux',  desc: 'Des conseillers disponibles pour vous accompagner à chaque étape.' },
              { icon: Users,  title: '100% en ligne',   desc: 'De la recherche à la signature du contrat, tout se passe ici.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-14 h-14 bg-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-blue-200" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-blue-300 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
