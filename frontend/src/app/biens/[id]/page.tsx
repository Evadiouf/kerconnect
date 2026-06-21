'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { MapPin, Bed, Bath, Maximize, ArrowLeft, Heart, Share2, Phone } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const BIENS_DB: Record<number, {
  id: number; titre: string; type: string; nature: 'location' | 'vente';
  prix: number; adresse: string; ville: string; surface: number;
  chambres: number; salles_bain: number; is_new?: boolean;
  description: string; equipements: string[];
}> = {
  1: {
    id: 1, titre: 'Villa Moderne avec Piscine', type: 'Villa', nature: 'location',
    prix: 300000, adresse: 'Cité Mermoz, Bloc B', ville: 'Dakar',
    surface: 250, chambres: 5, salles_bain: 3, is_new: true,
    description: 'Magnifique villa moderne située dans la résidentielle cité Mermoz. Cette propriété exceptionnelle offre tout le confort moderne dans un cadre verdoyant. Piscine privée, jardin arboré et vue dégagée. Idéale pour une famille qui recherche calme et prestige.',
    equipements: ['Piscine privée', 'Jardin', 'Gardiennage 24h', 'Parking 3 voitures', 'Climatisation', 'Groupe électrogène', 'Cuisine équipée', 'Terrasse'],
  },
  2: {
    id: 2, titre: 'Appartement vue mer', type: 'Appartement', nature: 'location',
    prix: 150000, adresse: 'Corniche Ouest', ville: 'Dakar',
    surface: 80, chambres: 2, salles_bain: 1,
    description: 'Bel appartement avec vue imprenable sur l\'océan Atlantique. Situé à la Corniche Ouest, à deux pas de la plage. Lumineux et bien aménagé, il dispose d\'un balcon avec vue mer.',
    equipements: ['Vue mer', 'Balcon', 'Parking', 'Climatisation', 'Ascenseur', 'Sécurité'],
  },
}

export default function DetailBienPage() {
  const params = useParams()
  const router = useRouter()
  const id     = Number(params.id)
  const bien   = BIENS_DB[id]
  const { isAuthenticated } = useAuthStore()
  const [liked, setLiked] = useState(false)

  if (!bien) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-5xl">🏠</p>
          <p className="text-xl font-medium text-gray-900">Bien introuvable</p>
          <Link href="/location" className="text-blue-600 hover:underline">← Retour aux annonces</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const prix = bien.nature === 'location'
    ? `${bien.prix.toLocaleString('fr-FR')} FCFA/mois`
    : `${bien.prix.toLocaleString('fr-FR')} FCFA`

  const handleDemande = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/biens/${id}`)
      return
    }
    router.push(`/client/demandes/new?bien_id=${id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {/* Breadcrumb */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image principale */}
            <div className="relative h-80 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl overflow-hidden flex items-center justify-center">
              <span className="text-8xl">🏠</span>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${bien.nature === 'location' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                  {bien.nature === 'location' ? 'Location' : 'Vente'}
                </span>
                {bien.is_new && <span className="px-3 py-1 rounded-lg text-sm font-semibold bg-orange-500 text-white">Nouveau</span>}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setLiked(!liked)} className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow ${liked ? 'text-red-500' : 'text-gray-400'}`}>
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-gray-400">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Infos principales */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{bien.titre}</h1>
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <MapPin size={16} />
                <span>{bien.adresse}, {bien.ville}</span>
                <span className="text-blue-600 hover:underline cursor-pointer ml-2 text-sm">Découvrir le quartier →</span>
              </div>
              <div className="flex flex-wrap gap-6 text-gray-600">
                <span className="flex items-center gap-2"><Maximize size={16} /><strong>{bien.surface} m²</strong></span>
                {bien.chambres > 0 && <span className="flex items-center gap-2"><Bed size={16} /><strong>{bien.chambres} chambres</strong></span>}
                {bien.salles_bain > 0 && <span className="flex items-center gap-2"><Bath size={16} /><strong>{bien.salles_bain} salle(s) de bain</strong></span>}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{bien.description}</p>
            </div>

            {/* Équipements */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {bien.equipements.map((eq) => (
                  <div key={eq} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span> {eq}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <div className="mb-2">
                <p className="text-xs text-gray-500 uppercase font-medium">
                  {bien.nature === 'location' ? 'LOYER MENSUEL' : 'PRIX DE VENTE'}
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{prix}</p>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                <Button onClick={handleDemande} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3">
                  {bien.nature === 'location' ? 'Demander une location' : 'Demander un achat'}
                </Button>
                <Button className="w-full bg-gray-50 text-gray-700 hover:bg-gray-100 py-3 border border-gray-200">
                  Demander une visite
                </Button>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-900 mb-3">Contacter un conseiller</p>
                <a href="tel:+221330000000" className="flex items-center gap-3 text-blue-900 hover:underline">
                  <Phone size={16} /> 33 000 00 00
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
