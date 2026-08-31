'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { MapPin, Bed, Bath, Maximize, Pencil, ShieldCheck, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface Bien {
  id: number
  titre: string
  type: string
  nature: 'location' | 'vente'
  prix: number
  caution_mois?: number | null
  adresse: string
  ville: string
  surface?: number
  chambres?: number
  salles_bain?: number
  is_new?: boolean
  description?: string
  equipements?: string[] | string
  statut?: string
  created_at: string
  images_urls?: string[]
  bailleur?: { id: number; name: string; phone?: string; verifie?: boolean; note_moyenne?: number; nb_avis?: number }
}

/* ──────────────────────────────────────────────
   Parse équipements (peut être string[] ou string JSON)
────────────────────────────────────────────── */
function parseEquipements(raw: string[] | string | undefined | null): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return [String(parsed)]
  } catch {
    return [raw]
  }
}

/* ──────────────────────────────────────────────
   Skeleton page
────────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Titre */}
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-6" />
      {/* Galerie */}
      <div className="grid grid-cols-3 gap-3 h-72 md:h-96 mb-8 rounded-2xl overflow-hidden">
        <div className="col-span-2 bg-gray-200" />
        <div className="flex flex-col gap-3">
          <div className="flex-1 bg-gray-200" />
          <div className="flex-1 bg-gray-200" />
        </div>
      </div>
      {/* Corps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl" />
          <div className="h-40 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────
   Gradients for gallery placeholder
────────────────────────────────────────────── */
const GRADIENTS = [
  'linear-gradient(135deg, #E05C52, #4338CA)',
  'linear-gradient(135deg, #7c3aed, #ec4899)',
  'linear-gradient(135deg, #3b82f6, #14b8a6)',
  'linear-gradient(135deg, #fb923c, #ef4444)',
  'linear-gradient(135deg, #4ade80, #3b82f6)',
  'linear-gradient(135deg, #6366f1, #9333ea)',
]

export default function DetailBienPage() {
  const params  = useParams()
  const router  = useRouter()
  const id      = String(params.id)
  const { isAuthenticated, user } = useAuthStore()

  const [nom,       setNom]       = useState('')
  const [telephone, setTelephone] = useState('')
  const [dispo,     setDispo]     = useState('')
  const [note,      setNote]      = useState('')
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [sendError, setSendError] = useState('')

  const { data: bien, isLoading, isError } = useQuery<Bien>({
    queryKey: ['bien', id],
    queryFn: () => api.get(`/v1/biens/${id}`).then((r) => {
      // L'API peut retourner { data: Bien } ou le bien directement
      return r.data?.data ?? r.data
    }),
    enabled: !!id,
    staleTime: 60_000,
  })

  const handleDemande = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/biens/${id}`)
      return
    }
    if (!nom.trim() || !telephone.trim()) {
      setSendError('Veuillez renseigner votre nom et téléphone.')
      return
    }
    setSending(true)
    setSendError('')
    try {
      await api.post('/v1/client/demandes', {
        bien_id: Number(id),
        type: bien?.nature === 'location' ? 'location' : 'achat',
        prenom_nom: nom,
        telephone,
        description: [dispo ? `Disponibilité : ${dispo}` : '', note].filter(Boolean).join('\n'),
      })
      setSent(true)
    } catch {
      setSendError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSending(false)
    }
  }

  const handleDemandeVisite = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/biens/${id}`)
      return
    }
    router.push(`/client/demandes/new?bien_id=${id}&type=visite`)
  }

  const prixFormate = bien
    ? bien.nature === 'location'
      ? `${Number(bien.prix).toLocaleString('fr-FR')} FCFA/mois`
      : `${Number(bien.prix).toLocaleString('fr-FR')} FCFA`
    : ''

  const equipements = parseEquipements(bien?.equipements)
  const gradientBg = GRADIENTS[(Number(id) || 0) % GRADIENTS.length]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-6 w-full flex-1">

        {/* ── Fil d'ariane ── */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-600">Accueil</Link>
          <span>/</span>
          <Link
            href={bien?.nature === 'vente' ? '/vente' : '/location'}
            className="hover:text-gray-600"
            style={{ color: '#E05C52' }}
          >
            {bien?.nature === 'vente' ? 'Vente' : 'Location'}
          </Link>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-xs">{bien?.titre ?? `Bien #${id}`}</span>
        </div>

        {/* ── État chargement ── */}
        {isLoading && <PageSkeleton />}

        {/* ── Erreur / introuvable ── */}
        {(isError || (!isLoading && !bien)) && (
          <div className="text-center py-32">
            <p className="text-5xl mb-4">🏚️</p>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Bien introuvable</h2>
            <p className="text-gray-400 mb-6">Ce bien n&apos;existe pas ou a été retiré.</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#E05C52' }}
            >
              ← Retour
            </button>
          </div>
        )}

        {/* ── Contenu principal ── */}
        {!isLoading && bien && (
          <>
            {/* ── Titre + badge ── */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                {bien.is_new && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2" style={{ backgroundColor: '#E05C52' }}>
                    Nouveau
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  {bien.titre}
                </h1>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <MapPin size={14} />
                  <span>{bien.adresse}, {bien.ville}</span>
                </div>
                {bien.type && (
                  <span className="inline-block mt-2 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {bien.type}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                  {bien.nature === 'location' ? 'Loyer mensuel' : 'Prix de vente'}
                </p>
                <p className="text-3xl font-extrabold" style={{ color: '#E05C52' }}>
                  {prixFormate}
                </p>
                {bien.nature === 'location' && bien.caution_mois && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    + Caution {bien.caution_mois} mois ({(bien.caution_mois * Number(bien.prix)).toLocaleString('fr-FR')} FCFA)
                  </p>
                )}
              </div>
            </div>

            {/* ── Galerie ── */}
            <div className="grid grid-cols-3 gap-3 h-72 md:h-96 mb-8 rounded-2xl overflow-hidden">
              <div className="col-span-2 flex items-center justify-center text-8xl overflow-hidden" style={{ background: gradientBg }}>
                {bien.images_urls?.[0]
                  ? <img src={bien.images_urls[0]} alt={bien.titre} className="w-full h-full object-cover" />
                  : '🏠'}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex-1 flex items-center justify-center text-5xl overflow-hidden" style={{ background: GRADIENTS[(Number(id) + 1) % GRADIENTS.length] }}>
                  {bien.images_urls?.[1]
                    ? <img src={bien.images_urls[1]} alt="" className="w-full h-full object-cover" />
                    : '🪟'}
                </div>
                <div className="flex-1 flex items-center justify-center text-5xl overflow-hidden" style={{ background: GRADIENTS[(Number(id) + 2) % GRADIENTS.length] }}>
                  {bien.images_urls?.[2]
                    ? <img src={bien.images_urls[2]} alt="" className="w-full h-full object-cover" />
                    : '🛋️'}
                </div>
              </div>
            </div>

            {/* ── Corps principal ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ════ Colonne principale (2/3) ════ */}
              <div className="lg:col-span-2 space-y-6">

                {/* Caractéristiques */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {(bien.chambres ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Chambres</p>
                        <div className="flex items-center justify-center gap-1">
                          <Bed size={18} className="text-gray-500" />
                          <span className="text-xl font-bold text-gray-900">{bien.chambres}</span>
                        </div>
                      </div>
                    )}
                    {(bien.salles_bain ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Salles de bain</p>
                        <div className="flex items-center justify-center gap-1">
                          <Bath size={18} className="text-gray-500" />
                          <span className="text-xl font-bold text-gray-900">{bien.salles_bain}</span>
                        </div>
                      </div>
                    )}
                    {(bien.surface ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Surface</p>
                        <div className="flex items-center justify-center gap-1">
                          <Maximize size={18} className="text-gray-500" />
                          <span className="text-xl font-bold text-gray-900">{bien.surface} m²</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Nature</p>
                      <p className="text-sm font-semibold text-gray-700 capitalize">{bien.nature}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {bien.description && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Description du bien</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">{bien.description}</p>
                    <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">
                      <span>✅ {bien.adresse}, {bien.ville}</span>
                      {bien.type && <span>✅ {bien.type}</span>}
                    </div>
                  </div>
                )}

                {/* Équipements */}
                {equipements.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Ce que ce bien propose</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {equipements.map((eq, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
                          <span>✓</span>
                          {eq}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Carte */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Découvrir le quartier</h2>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(bien.adresse + ', ' + bien.ville)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-20 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium hover:bg-gray-100 transition-colors"
                    style={{ color: '#4338CA' }}
                  >
                    <MapPin size={16} />
                    Voir {bien.adresse}, {bien.ville} sur Google Maps →
                  </a>
                </div>
              </div>

              {/* ════ Panneau latéral (1/3) ════ */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">

                  {/* Prix */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                      {bien.nature === 'location' ? 'Loyer mensuel' : 'Prix de vente'}
                    </p>
                    <p className="text-3xl font-extrabold" style={{ color: '#E05C52' }}>
                      {prixFormate}
                    </p>
                  </div>
                  {bien.nature === 'location' && bien.caution_mois && (
                    <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-500 flex-shrink-0">
                          <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9-3a1 1 0 11-2 0 1 1 0 012 0zM7 7a1 1 0 012 0v3.5a.5.5 0 001 0V7a2 2 0 00-4 0v3.5a.5.5 0 001 0V7z" fill="currentColor"/>
                        </svg>
                        <span className="text-xs font-semibold text-amber-700">Caution {bien.caution_mois} mois</span>
                      </div>
                      <span className="text-sm font-bold text-amber-800">
                        {(bien.caution_mois * Number(bien.prix)).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  )}

                  {/* Bailleur */}
                  {bien.bailleur && (
                    <div className="flex items-center gap-3 py-4 border-y border-gray-100 mb-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: '#4338CA' }}>
                        {bien.bailleur.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{bien.bailleur.name}</p>
                          {bien.bailleur.verifie && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✅ Vérifié</span>
                          )}
                        </div>
                        {(bien.bailleur.note_moyenne ?? 0) > 0 && (
                          <p className="text-xs text-amber-500 mt-0.5">
                            {'⭐'.repeat(Math.round(bien.bailleur.note_moyenne ?? 0))} {(bien.bailleur.note_moyenne ?? 0).toFixed(1)}
                            {(bien.bailleur.nb_avis ?? 0) > 0 && <span className="text-gray-400"> ({bien.bailleur.nb_avis} avis)</span>}
                          </p>
                        )}
                        {bien.bailleur.phone && (
                          <a href={`tel:${bien.bailleur.phone}`} className="text-xs text-gray-400 hover:underline">{bien.bailleur.phone}</a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Panneau selon le rôle */}
                  {(() => {
                    const isOwner = user && bien.bailleur && user.id === bien.bailleur.id
                    const isAdmin = user?.role === 'admin'
                    const isBailleur = user && ['bailleur', 'proprietaire'].includes(user.role)

                    // Propriétaire de l'annonce
                    if (isOwner) return (
                      <div className="text-center py-4 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
                          <Pencil size={22} style={{ color: '#4338CA' }} />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">C&apos;est votre annonce</p>
                        <Link href={`/bailleur/annonces/${bien.id}/modifier`}
                          className="block w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity text-center"
                          style={{ backgroundColor: '#4338CA' }}>
                          Modifier l&apos;annonce
                        </Link>
                        <Link href="/bailleur/demandes"
                          className="block w-full py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors text-center">
                          Voir les demandes reçues
                        </Link>
                      </div>
                    )

                    // Admin
                    if (isAdmin) return (
                      <div className="text-center py-4 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                          <ShieldCheck size={22} className="text-amber-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Vue administrateur</p>
                        <p className="text-xs text-gray-400">Statut : <span className="font-semibold capitalize">{bien.statut ?? 'publie'}</span></p>
                        <Link href="/admin/annonces"
                          className="block w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity text-center"
                          style={{ backgroundColor: '#F59E0B' }}>
                          Gérer les annonces
                        </Link>
                      </div>
                    )

                    // Bailleur/propriétaire qui ne possède pas le bien
                    if (isBailleur) return (
                      <div className="text-center py-6 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto">
                          <Lock size={22} className="text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">Espace réservé aux locataires</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          En tant que bailleur, vous ne pouvez pas soumettre une demande pour ce bien.
                        </p>
                      </div>
                    )

                    // Client ou non connecté → formulaire de demande
                    return sent ? (
                      <div className="text-center py-6">
                        <p className="text-3xl mb-2">✅</p>
                        <p className="text-sm font-semibold text-gray-800 mb-1">Demande envoyée !</p>
                        <p className="text-xs text-gray-400">Le bailleur vous contactera rapidement.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Votre nom complet *</label>
                          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Prénom Nom"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Téléphone *</label>
                          <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="77 000 00 00"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Disponibilité souhaitée</label>
                          <input value={dispo} onChange={(e) => setDispo(e.target.value)} placeholder="Ex : dans 1 mois"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Message (optionnel)</label>
                          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Précisez votre demande..." rows={3}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors resize-none" />
                        </div>
                        {sendError && <p className="text-xs text-red-500">{sendError}</p>}
                        <button onClick={handleDemande} disabled={sending}
                          className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                          style={{ backgroundColor: '#E05C52' }}>
                          {sending ? 'Envoi...' : isAuthenticated ? 'Soumettre ma demande' : 'Se connecter pour postuler'}
                        </button>
                        <button onClick={handleDemandeVisite}
                          className="w-full py-3 rounded-xl font-semibold text-sm border-2 hover:bg-gray-50 transition-colors"
                          style={{ borderColor: '#E05C52', color: '#E05C52' }}>
                          📅 Demander une visite
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
