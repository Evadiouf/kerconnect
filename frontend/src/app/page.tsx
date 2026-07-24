'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

/* ──────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
interface Bien {
  id: number
  titre: string
  nature: 'location' | 'vente'
  prix: number
  adresse: string
  ville: string
  is_new?: boolean
  type?: string
  surface?: number
  chambres?: number
  salles_bain?: number
}

/* ──────────────────────────────────────────────
   Mock fallback (démo si API vide)
────────────────────────────────────────────── */
const MOCK_VEDETTE: Bien[] = [
  { id: 1, titre: 'Villa Moderne avec Piscine', nature: 'location', prix: 300000, adresse: 'Mermoz', ville: 'Dakar', is_new: true },
  { id: 2, titre: 'Appartement vue mer', nature: 'location', prix: 150000, adresse: 'Plateau', ville: 'Dakar' },
  { id: 3, titre: 'Duplex standing', nature: 'vente', prix: 45000000, adresse: 'Almadies', ville: 'Dakar' },
]

const MOCK_DISPONIBLES: Bien[] = [
  { id: 4, titre: 'Appartement familial Mermoz', nature: 'location', prix: 200000, adresse: 'Mermoz', ville: 'Dakar', is_new: true },
  { id: 5, titre: 'Villa avec jardin', nature: 'location', prix: 450000, adresse: 'Ngor', ville: 'Dakar' },
  { id: 6, titre: 'Appartement vue mer', nature: 'vente', prix: 35000000, adresse: 'Corniche', ville: 'Dakar' },
  { id: 7, titre: 'Studio meublé Almadies', nature: 'location', prix: 80000, adresse: 'Almadies', ville: 'Dakar', is_new: true },
  { id: 8, titre: 'Duplex Sacré-Cœur', nature: 'location', prix: 350000, adresse: 'Sacré-Cœur', ville: 'Dakar' },
  { id: 9, titre: 'Villa Saly bord de mer', nature: 'vente', prix: 120000000, adresse: 'Bord de mer', ville: 'Saly', is_new: true },
]

const TYPES = [
  { label: 'Appartement', img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=70', href: '/location?type=appartement' },
  { label: 'Villa', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=70', href: '/location?type=villa' },
  { label: 'Chambre +', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=70', href: '/location?type=chambre' },
  { label: 'Duplex standing', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=70', href: '/location?type=duplex' },
]

/* ──────────────────────────────────────────────
   Skeleton card
────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Carte bien (gradient + emoji, pas d'image Unsplash pour les vraies données)
────────────────────────────────────────────── */
const GRADIENTS = [
  'from-coral-400 to-indigo-600',
  'from-purple-500 to-pink-400',
  'from-blue-500 to-teal-400',
  'from-orange-400 to-red-500',
  'from-green-400 to-blue-500',
  'from-indigo-500 to-purple-600',
]

function BienCardHome({ id, titre, nature, prix, adresse, ville, is_new, isMock, img }: Bien & { isMock?: boolean; img?: string }) {
  const prixFormate = nature === 'location'
    ? `${prix.toLocaleString('fr-FR')} FCFA/mois`
    : `${prix.toLocaleString('fr-FR')} FCFA`

  const gradientIndex = id % GRADIENTS.length

  return (
    <Link href={`/biens/${id}`} className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
      {/* Image / Gradient */}
      <div className="relative h-52 overflow-hidden">
        {isMock && img ? (
          <Image
            src={img}
            alt={titre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500"
            style={{
              background: [
                'linear-gradient(135deg, #E05C52, #4338CA)',
                'linear-gradient(135deg, #7c3aed, #ec4899)',
                'linear-gradient(135deg, #3b82f6, #14b8a6)',
                'linear-gradient(135deg, #fb923c, #ef4444)',
                'linear-gradient(135deg, #4ade80, #3b82f6)',
                'linear-gradient(135deg, #6366f1, #9333ea)',
              ][gradientIndex],
            }}
          >
            🏠
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#E05C52' }}
          >
            BAS-PRIX TOPRANO
          </span>
        </div>
        {is_new && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#E05C52' }}>
              Nouveau
            </span>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#E05C52] transition-colors">
          {titre}
        </h3>
        <p className="text-gray-400 text-sm mb-3 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {adresse}, {ville}
        </p>
        <p className="font-extrabold text-lg" style={{ color: '#E05C52' }}>
          {prixFormate}
        </p>
        <div className="flex items-center gap-4 mt-2 text-gray-400 text-xs">
          <span className="capitalize">{nature === 'location' ? 'Location' : 'Vente'}</span>
        </div>
      </div>
    </Link>
  )
}

/* ──────────────────────────────────────────────
   Page
────────────────────────────────────────────── */
export default function HomePage() {
  const router = useRouter()
  const [searchVille, setSearchVille]   = useState('')
  const [searchType,  setSearchType]    = useState('')
  const [ctaNom,   setCtaNom]   = useState('')
  const [ctaEmail, setCtaEmail] = useState('')
  const [ctaSent,  setCtaSent]  = useState(false)
  const [ctaErr,   setCtaErr]   = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchVille) params.set('ville', searchVille)
    if (searchType)  params.set('type',  searchType)
    router.push('/location' + (params.toString() ? '?' + params.toString() : ''))
  }

  const handleCta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ctaNom.trim() || !ctaEmail.trim()) return
    setCtaErr('')
    try {
      await api.post('/v1/contact', { nom: ctaNom, email: ctaEmail, sujet: 'Conseil depuis accueil', message: `${ctaNom} (${ctaEmail}) souhaite parler à un conseiller.` })
      setCtaSent(true)
    } catch {
      setCtaErr('Erreur lors de l\'envoi. Réessayez.')
    }
  }

  const { data: vedettePage, isLoading: loadingVedette } = useQuery({
    queryKey: ['biens-vedette'],
    queryFn: () => api.get('/v1/biens', { params: { per_page: 6 } }).then((r) => r.data),
    staleTime: 60_000,
  })

  const { data: locationPage, isLoading: loadingLocation } = useQuery({
    queryKey: ['biens-location-home'],
    queryFn: () => api.get('/v1/biens', { params: { nature: 'location', per_page: 6 } }).then((r) => r.data),
    staleTime: 60_000,
  })

  const bienVedette: Bien[] = vedettePage?.data?.length ? vedettePage.data : MOCK_VEDETTE
  const bienLocation: Bien[] = locationPage?.data?.length ? locationPage.data : MOCK_DISPONIBLES

  // Detect if data came from API or mock
  const vedetteIsMock = !vedettePage?.data?.length
  const locationIsMock = !locationPage?.data?.length

  // Mock images for fallback
  const mockVedetteImgs = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  ]
  const mockLocationImgs = [
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80',
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header transparent sur hero */}
      <Header transparent />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Image de fond */}
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85"
          alt="Villa KerConnect"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Overlay dégradé sombre */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center w-full">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Louez &amp; achetez,{' '}
            <span style={{ color: '#E05C52' }}>en</span>
            <br />
            <span style={{ color: '#E05C52' }}>toute</span>{' '}
            <span className="text-white">simplicité.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Une nouvelle façon de trouver le logement idéal : appartements, chambres, villas.
            Des offres vérifiées, un parcours 100 % en ligne.
          </p>

          {/* Formulaire de recherche (carte blanche) */}
          <div className="bg-white rounded-2xl p-5 max-w-3xl mx-auto shadow-2xl text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Ville</label>
                <input
                  type="text"
                  value={searchVille}
                  onChange={e => setSearchVille(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex : Dakar"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] text-gray-700 placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Type</label>
                <input
                  type="text"
                  value={searchType}
                  onChange={e => setSearchType(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex : Villa, Appartement"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] text-gray-700 placeholder-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Nature</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] text-gray-700 bg-white"
                  onChange={e => { if (e.target.value === 'vente') router.push('/vente') }}
                >
                  <option value="location">Location</option>
                  <option value="vente">Vente</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSearch}
                className="px-7 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#E05C52' }}
              >
                <Search size={15} />
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BIENS EN VEDETTE ═══ */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#E05C52' }}>
                Biens en vedette
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                Les meilleures offres sélectionnées pour vous. Découvrez des biens d&apos;exception.
              </h2>
            </div>
            <Link href="/location" className="text-sm font-semibold hover:underline whitespace-nowrap ml-4" style={{ color: '#E05C52' }}>
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadingVedette
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : bienVedette.slice(0, 3).map((bien, idx) => (
                  <BienCardHome
                    key={bien.id}
                    {...bien}
                    isMock={vedetteIsMock}
                    img={vedetteIsMock ? mockVedetteImgs[idx] : undefined}
                  />
                ))
            }
          </div>
        </div>
      </section>

      {/* ═══ TROUVEZ LE BIEN QUI VOUS RESSEMBLE ═══ */}
      <section className="py-14 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Trouvez le bien{' '}
              <span style={{ color: '#E05C52' }}>qui vous</span>
              <br />
              <span style={{ color: '#E05C52' }}>ressemble</span>
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Appartements, villas, chambres ou duplex. Explorez et trouvez votre espace.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TYPES.map((t) => (
              <Link key={t.label} href={t.href}>
                <div className="relative h-44 rounded-2xl overflow-hidden group cursor-pointer">
                  <Image
                    src={t.img}
                    alt={t.label}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-base">{t.label}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NOS BIENS DISPONIBLES ═══ */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#E05C52' }}>
                Nos biens disponible
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                Les meilleures opportunités du moment, choisies par nos experts.
              </h2>
            </div>
            <Link href="/location" className="text-sm font-semibold hover:underline whitespace-nowrap ml-4" style={{ color: '#E05C52' }}>
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {loadingLocation
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : bienLocation.slice(0, 6).map((bien, idx) => (
                  <BienCardHome
                    key={bien.id}
                    {...bien}
                    isMock={locationIsMock}
                    img={locationIsMock ? mockLocationImgs[idx] : undefined}
                  />
                ))
            }
          </div>
        </div>
      </section>

      {/* ═══ AIDE / CTA ═══ */}
      <section className="py-16 px-6" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
          {/* Texte gauche */}
          <div className="text-white max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Des questions ou besoin d&apos;aide ?
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Notre équipe est là pour vous accompagner à chaque étape. Contactez-nous,
              nous vous répondrons rapidement, clairement et en toute transparence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+221710307054"
                className="flex items-center gap-2 text-white text-sm border border-white/20 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
                </svg>
                +221 71 030 70 54
              </a>
              <a
                href="mailto:contact@naratechvision.com"
                className="flex items-center gap-2 text-white text-sm border border-white/20 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                contact@naratechvision.com
              </a>
            </div>
          </div>

          {/* Formulaire droite */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full md:w-80 flex-shrink-0">
            <p className="text-white font-bold mb-4">Parler à un conseiller</p>
            {ctaSent ? (
              <div className="text-center py-4">
                <p className="text-white text-sm font-medium">✅ Message envoyé !</p>
                <p className="text-white/60 text-xs mt-1">On vous rappelle très vite.</p>
              </div>
            ) : (
              <form onSubmit={handleCta}>
                <input
                  type="text"
                  value={ctaNom}
                  onChange={e => setCtaNom(e.target.value)}
                  placeholder="Votre nom"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm mb-3 outline-none focus:border-white/50"
                />
                <input
                  type="email"
                  value={ctaEmail}
                  onChange={e => setCtaEmail(e.target.value)}
                  placeholder="Votre email"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm mb-4 outline-none focus:border-white/50"
                />
                {ctaErr && <p className="text-red-300 text-xs mb-2">{ctaErr}</p>}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#E05C52' }}
                >
                  Nous contacter
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
