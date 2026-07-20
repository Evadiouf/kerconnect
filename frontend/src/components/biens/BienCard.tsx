import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Bath, Maximize } from 'lucide-react'

export interface Bien {
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
  image?: string
  is_new?: boolean
}

interface Props {
  bien: Bien
}

export default function BienCard({ bien }: Props) {
  const prix = bien.nature === 'location'
    ? `${bien.prix.toLocaleString('fr-FR')} FCFA/mois`
    : `${bien.prix.toLocaleString('fr-FR')} FCFA`

  return (
    <Link
      href={`/biens/${bien.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
    >
      {/* Image */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {bien.image ? (
          <Image
            src={bien.image}
            alt={bien.titre}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
            <span className="text-4xl">🏠</span>
          </div>
        )}

        {/* Badge nature */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#E05C52' }}
          >
            BAS-PRIX TOPRANO
          </span>
        </div>

        {/* Badge nouveau */}
        {bien.is_new && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#4338CA' }}>
              Nouveau
            </span>
          </div>
        )}

      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-[#E05C52] transition-colors">
          {bien.titre}
        </h3>

        <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
          <MapPin size={13} />
          <span className="line-clamp-1">{bien.adresse}, {bien.ville}</span>
        </div>

        {/* Caractéristiques */}
        <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
          {bien.chambres && (
            <span className="flex items-center gap-1"><Bed size={12} /> {bien.chambres}</span>
          )}
          {bien.salles_bain && (
            <span className="flex items-center gap-1"><Bath size={12} /> {bien.salles_bain}</span>
          )}
          {bien.surface && (
            <span className="flex items-center gap-1"><Maximize size={12} /> {bien.surface} m²</span>
          )}
        </div>

        <p className="font-extrabold text-base" style={{ color: '#E05C52' }}>
          {prix}
        </p>
      </div>
    </Link>
  )
}
