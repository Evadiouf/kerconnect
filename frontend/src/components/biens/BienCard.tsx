import Link from 'next/link'
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
    <Link href={`/biens/${bien.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {bien.image ? (
          <img src={bien.image} alt={bien.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
            <span className="text-blue-300 text-4xl">🏠</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded-md text-xs font-semibold ${bien.nature === 'location' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
            {bien.nature === 'location' ? 'Location' : 'Vente'}
          </span>
          {bien.is_new && (
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-orange-500 text-white">Nouveau</span>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-900 transition-colors">
          {bien.titre}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <MapPin size={14} />
          <span className="line-clamp-1">{bien.adresse}, {bien.ville}</span>
        </div>

        {/* Caractéristiques */}
        <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
          {bien.surface && (
            <span className="flex items-center gap-1"><Maximize size={13} />{bien.surface} m²</span>
          )}
          {bien.chambres && (
            <span className="flex items-center gap-1"><Bed size={13} />{bien.chambres} ch.</span>
          )}
          {bien.salles_bain && (
            <span className="flex items-center gap-1"><Bath size={13} />{bien.salles_bain} sdb.</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-blue-900 font-bold text-lg">{prix}</span>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{bien.type}</span>
        </div>
      </div>
    </Link>
  )
}
