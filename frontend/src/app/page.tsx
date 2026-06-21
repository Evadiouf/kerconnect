import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Search } from 'lucide-react'

const FEATURED = [
  { id: 1, titre: 'Villa Moderne avec Piscine', nature: 'location' as const, prix: 300000, adresse: 'Mermoz', ville: 'Dakar', is_new: true, img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80' },
  { id: 2, titre: 'Appartement vue mer',        nature: 'location' as const, prix: 150000, adresse: 'Plateau', ville: 'Dakar', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80' },
  { id: 3, titre: 'Duplex standing',            nature: 'vente' as const,    prix: 45000000, adresse: 'Almadies', ville: 'Dakar', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80' },
]

const TYPES = [
  { label: 'Appartements', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=70', href: '/location?type=appartement' },
  { label: 'Villas',       img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=70', href: '/location?type=villa' },
  { label: 'Chambres',     img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=70', href: '/location?type=chambre' },
  { label: 'Duplex',       img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=70', href: '/location?type=duplex' },
]

const STATS = [
  { label: 'Biens disponibles', value: '1 234' },
  { label: 'Appartements',      value: '234' },
  { label: 'Villas',            value: '450' },
  { label: 'Clients satisfaits', value: '2 800+' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header transparent sur hero */}
      <Header transparent />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Image de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85')" }}
        />
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center w-full">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Louez & achetez, <br />
            <span style={{ color: '#E05C52' }}>en toute</span> simplicité.
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Une nouvelle façon de trouver le logement idéal — appartements, chambres, villas.
            Des offres vérifiées, un parcours 100 % en ligne, un accompagnement humain à chaque étape.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link href="/auth/login">
              <button className="px-8 py-3.5 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-all text-sm">
                Se connecter
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-3.5 rounded-full font-semibold text-white text-sm transition-all" style={{ backgroundColor: '#E05C52' }}>
                Nous contacter
              </button>
            </Link>
          </div>

          {/* Carte Réservation */}
          <div className="bg-white rounded-2xl p-6 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold text-gray-900 text-lg">Réservation</span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center ml-auto" style={{ backgroundColor: '#E05C52' }}>
                <span className="text-white text-xs font-bold">✕</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Adresse</label>
                <input type="text" placeholder="Ex : Quartier côte ouest"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 text-gray-700" style={{'--tw-ring-color': '#E05C52'} as React.CSSProperties} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Type</label>
                <input type="text" placeholder="Ex : Chambre simple"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 text-gray-700" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Budget</label>
                <input type="text" placeholder="Ex : 50 000 Fcfa"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 text-gray-700" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Link href="/location">
                <button className="px-8 py-3 rounded-xl text-white font-semibold text-sm gap-2 flex items-center" style={{ backgroundColor: '#E05C52' }}>
                  <Search size={16} />
                  Rechercher
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TYPES DE BIENS ═══ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Trouvez le bien <span style={{ color: '#E05C52' }}>qui vous ressemble</span>
          </h2>
          <p className="text-gray-500 mb-8">Appartements, villas, chambres ou duplex — explorez nos univers.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TYPES.map((t) => (
              <Link key={t.label} href={t.href}>
                <div className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer">
                  <img src={t.img} alt={t.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-lg">{t.label}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NOS BIENS DISPONIBLES ═══ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Nos biens disponibles</h2>
              <p className="text-gray-400 mt-1">Les meilleures opportunités du moment, choisies par nos experts.</p>
            </div>
            <Link href="/location" className="font-semibold text-sm hover:underline" style={{ color: '#E05C52' }}>
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED.map((bien) => (
              <Link key={bien.id} href={`/biens/${bien.id}`} className="group block">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    {'img' in bien && (
                      <img src={bien.img} alt={bien.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: bien.nature === 'location' ? '#10B981' : '#3B82F6' }}>
                        {bien.nature === 'location' ? 'Location' : 'Vente'}
                      </span>
                      {'is_new' in bien && bien.is_new && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#E05C52' }}>
                          Nouveau
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Infos */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{bien.titre}</h3>
                    <p className="text-gray-400 text-sm mb-3">{bien.adresse}, {bien.ville}</p>
                    <p className="font-extrabold text-lg" style={{ color: '#E05C52' }}>
                      {bien.nature === 'location'
                        ? `${bien.prix.toLocaleString('fr-FR')} FCFA/mois`
                        : `${bien.prix.toLocaleString('fr-FR')} FCFA`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AIDE ═══ */}
      <section className="py-16 px-6" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-2">Des questions ou besoin d&apos;aide ?</h2>
            <p className="text-gray-400 max-w-md">
              Notre équipe est là pour vous accompagner à chaque étape. Contactez-nous, nous vous répondrons rapidement.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="tel:+221330000000" className="flex items-center gap-2 text-white text-sm border border-white/20 px-4 py-2.5 rounded-xl hover:bg-white/10">
                📞 33 000 00 00
              </a>
              <a href="mailto:contact@naratechvision.com" className="flex items-center gap-2 text-white text-sm border border-white/20 px-4 py-2.5 rounded-xl hover:bg-white/10">
                ✉️ contact@naratechvision.com
              </a>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl p-6 min-w-72">
            <p className="text-white font-bold mb-4">Parler à un conseiller</p>
            <input type="text" placeholder="Votre nom" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm mb-3 outline-none" />
            <input type="email" placeholder="Votre email" className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm mb-3 outline-none" />
            <Link href="/contact">
              <button className="w-full py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: '#E05C52' }}>
                Nous contacter
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
