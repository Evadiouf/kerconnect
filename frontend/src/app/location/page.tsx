'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { MapPin, Bed, Bath, Maximize, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

function ContactForm() {
  const [nom, setNom]         = useState('')
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [sending, setSending] = useState(false)
  const [err, setErr]         = useState('')

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim() || !email.trim()) return
    setSending(true); setErr('')
    try {
      await api.post('/v1/contact', { nom, email, sujet: 'Conseil location', message: `${nom} (${email}) souhaite parler à un conseiller depuis la page Location.` })
      setSent(true)
    } catch {
      setErr('Erreur lors de l\'envoi. Réessayez.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white/10 rounded-2xl p-6 w-full md:w-72 flex-shrink-0">
      <p className="text-white font-bold mb-4">Parler à un conseiller</p>
      {sent ? (
        <div className="text-center py-4">
          <p className="text-white text-sm font-medium">✅ Message envoyé !</p>
          <p className="text-white/60 text-xs mt-1">On vous rappelle très vite.</p>
        </div>
      ) : (
        <form onSubmit={handleContact}>
          <input
            type="text" placeholder="Votre nom" value={nom} onChange={e => setNom(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm mb-3 outline-none"
            required
          />
          <input
            type="email" placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm mb-4 outline-none"
            required
          />
          {err && <p className="text-red-300 text-xs mb-2">{err}</p>}
          <button
            type="submit" disabled={sending}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#E05C52' }}
          >
            {sending ? 'Envoi…' : 'Nous contacter'}
          </button>
        </form>
      )}
    </div>
  )
}

interface Bien {
  id: number
  titre: string
  type: string
  nature: 'location' | 'vente'
  prix: number
  adresse: string
  ville: string
  surface?: number
  chambres?: number
  salles_bain?: number
  is_new?: boolean
  statut?: string
  images_urls?: string[]
}

const TYPES = ['Tous', 'Appartement', 'Villa', 'Studio', 'Maison', 'Bureau', 'Terrain']
const VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Touba', 'Kaolack']
const BUDGETS_LOCATION = [
  { label: 'Sans limite', max: 0 },
  { label: 'Moins de 150 000', max: 150000 },
  { label: 'Moins de 300 000', max: 300000 },
  { label: 'Moins de 500 000', max: 500000 },
  { label: 'Moins de 1 000 000', max: 1000000 },
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
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-5 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Carte bien (gradient + emoji)
────────────────────────────────────────────── */
const GRADIENTS = [
  'linear-gradient(135deg, #E05C52, #4338CA)',
  'linear-gradient(135deg, #7c3aed, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #14b8a6)',
  'linear-gradient(135deg, #fb923c, #ef4444)',
  'linear-gradient(135deg, #4ade80, #3b82f6)',
  'linear-gradient(135deg, #6366f1, #9333ea)',
]

function BienCard({ bien }: { bien: Bien }) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
      <Link href={`/biens/${bien.id}`} className="block">
        <div className="relative h-52 overflow-hidden">
          {bien.images_urls?.[0] ? (
            <img
              src={bien.images_urls[0]}
              alt={bien.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500"
              style={{ background: GRADIENTS[bien.id % GRADIENTS.length] }}
            >
              🏠
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: bien.nature === 'location' ? '#10B981' : '#E05C52' }}>
              {bien.nature === 'location' ? 'Location' : 'Vente'}
            </span>
          </div>
          {bien.is_new && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#4338CA' }}>
                Nouveau
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#E05C52] transition-colors">
            {bien.titre}
          </h3>
          <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
            <MapPin size={13} />
            <span>{bien.adresse}, {bien.ville}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
            {(bien.chambres ?? 0) > 0 && <span className="flex items-center gap-1"><Bed size={12} /> {bien.chambres}</span>}
            {(bien.salles_bain ?? 0) > 0 && <span className="flex items-center gap-1"><Bath size={12} /> {bien.salles_bain}</span>}
            {(bien.surface ?? 0) > 0 && <span className="flex items-center gap-1"><Maximize size={12} /> {bien.surface} m²</span>}
          </div>
          <p className="font-extrabold text-base" style={{ color: '#E05C52' }}>
            {Number(bien.prix).toLocaleString('fr-FR')} FCFA/mois
          </p>
        </div>
      </Link>
    </div>
  )
}

export default function LocationPage() {
  const [type,    setType]    = useState('')
  const [ville,   setVille]   = useState('')
  const [budgetI, setBudgetI] = useState(0)

  const params: Record<string, string | number> = { nature: 'location', per_page: 50 }
  if (type && type !== 'Tous') params.type = type
  if (ville) params.ville = ville
  if (budgetI > 0) params.prix_max = BUDGETS_LOCATION[budgetI].max

  const { data: page, isLoading } = useQuery({
    queryKey: ['biens-location', type, ville, budgetI],
    queryFn: () => api.get('/v1/biens', { params }).then((r) => r.data),
    staleTime: 30_000,
  })

  const biens: Bien[] = page?.data ?? []

  const reset = () => { setType(''); setVille(''); setBudgetI(0) }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* ═══ EN-TÊTE PAGE ═══ */}
      <section className="bg-white border-b border-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Fil d'ariane */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-600">Accueil</Link>
            <span>/</span>
            <span style={{ color: '#E05C52' }}>Location</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Trouvez votre{' '}
            <span style={{ color: '#E05C52' }}>futur logement</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Biens à louer vérifiés par nos experts. Filtrez par type, ville ou budget.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1">
        {/* ═══ FILTRES ═══ */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Ville</label>
              <select
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors bg-white"
              >
                <option value="">Toutes les villes</option>
                {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors bg-white"
              >
                {TYPES.map((t) => <option key={t} value={t === 'Tous' ? '' : t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Budget mensuel max</label>
              <select
                value={budgetI}
                onChange={(e) => setBudgetI(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors bg-white"
              >
                {BUDGETS_LOCATION.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              <X size={14} /> Réinitialiser
            </button>
          </div>
        </div>

        {/* ═══ RÉSULTATS ═══ */}
        {isLoading ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-400">Chargement...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                <strong className="text-gray-900 font-bold">{biens.length}</strong> bien{biens.length !== 1 ? 's' : ''} trouvé{biens.length !== 1 ? 's' : ''}
              </p>
            </div>

            {biens.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {biens.map((bien) => <BienCard key={bien.id} bien={bien} />)}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-medium text-gray-600">Aucun bien trouvé avec ces critères.</p>
                <button onClick={reset} className="mt-4 text-sm font-medium hover:underline" style={{ color: '#E05C52' }}>
                  Effacer les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ SECTION AIDE ═══ */}
      <section className="py-14 px-6 mx-6 mb-8 rounded-3xl" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-10 justify-between">
          <div className="text-white max-w-md">
            <h2 className="text-2xl font-bold mb-3">Des questions ou besoin d&apos;aide ?</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Notre équipe est là pour vous aider à chaque étape. Contactez le Kerconnect,
              pour trouver une maison rapide, claire et en toute transparence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="tel:+221330000000" className="flex items-center gap-2 text-white text-sm border border-white/20 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                📞 33 000 00 00
              </a>
              <a href="mailto:contact@naratechvision.com" className="flex items-center gap-2 text-white text-sm border border-white/20 px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors">
                ✉️ contact@naratechvision.com
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </div>
  )
}
