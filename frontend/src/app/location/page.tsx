'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BienCard, { Bien } from '@/components/biens/BienCard'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BIENS_MOCK: Bien[] = [
  { id: 1, titre: 'Villa Moderne avec Piscine', type: 'Villa', nature: 'location', prix: 300000, adresse: 'Mermoz', ville: 'Dakar', surface: 250, chambres: 5, salles_bain: 3, is_new: true },
  { id: 2, titre: 'Appartement vue mer', type: 'Appartement', nature: 'location', prix: 150000, adresse: 'Plateau', ville: 'Dakar', surface: 80, chambres: 2, salles_bain: 1 },
  { id: 3, titre: 'Studio meublé Almadies', type: 'Studio', nature: 'location', prix: 80000, adresse: 'Almadies', ville: 'Dakar', surface: 35, chambres: 1, salles_bain: 1 },
  { id: 4, titre: 'Appartement familial Mermoz', type: 'Appartement', nature: 'location', prix: 200000, adresse: 'Mermoz', ville: 'Dakar', surface: 95, chambres: 3, salles_bain: 2 },
  { id: 5, titre: 'Villa avec jardin', type: 'Villa', nature: 'location', prix: 450000, adresse: 'Ngor', ville: 'Dakar', surface: 300, chambres: 6, salles_bain: 4 },
  { id: 6, titre: 'Chambre en colocation', type: 'Chambre', nature: 'location', prix: 45000, adresse: 'Université', ville: 'Dakar', surface: 20, chambres: 1, salles_bain: 1 },
  { id: 7, titre: 'Duplex moderne Sacré-Cœur', type: 'Duplex', nature: 'location', prix: 350000, adresse: 'Sacré-Cœur', ville: 'Dakar', surface: 160, chambres: 4, salles_bain: 3 },
  { id: 8, titre: 'Appartement Thiès centre', type: 'Appartement', nature: 'location', prix: 75000, adresse: 'Centre-ville', ville: 'Thiès', surface: 60, chambres: 2, salles_bain: 1 },
  { id: 9, titre: 'Villa Saly bord de mer', type: 'Villa', nature: 'location', prix: 500000, adresse: 'Bord de mer', ville: 'Saly', surface: 200, chambres: 4, salles_bain: 3, is_new: true },
]

const TYPES = ['Tous', 'Appartement', 'Villa', 'Studio', 'Chambre', 'Duplex']
const BUDGETS = [
  { label: 'Sans limite', max: Infinity },
  { label: 'Moins de 100 000', max: 100000 },
  { label: '100 000 – 200 000', max: 200000 },
  { label: '200 000 – 400 000', max: 400000 },
  { label: '400 000+', max: Infinity },
]

export default function LocationPage() {
  const [type,    setType]    = useState('Tous')
  const [budgetI, setBudgetI] = useState(0)
  const [ville,   setVille]   = useState('')

  const filtered = BIENS_MOCK.filter((b) => {
    const okType   = type === 'Tous' || b.type === type
    const okBudget = budgetI === 0 || b.prix <= BUDGETS[budgetI].max
    const okVille  = !ville || b.ville.toLowerCase().includes(ville.toLowerCase())
    return okType && okBudget && okVille
  })

  const reset = () => { setType('Tous'); setBudgetI(0); setVille('') }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero section */}
      <section className="bg-blue-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-blue-300 text-sm font-medium uppercase tracking-wider">LOCATION</span>
          <h1 className="text-3xl font-bold mt-2 mb-1">Trouvez votre futur logement</h1>
          <p className="text-blue-200">Plus de 1 200 biens à louer, vérifiés par nos experts. Filtrez par type, ville ou budget.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Filtres */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">Ville</label>
              <input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Dakar, Thiès, Saly..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">Budget max</label>
              <select value={budgetI} onChange={(e) => setBudgetI(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                {BUDGETS.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
              </select>
            </div>
            <Button onClick={reset} className="bg-gray-100 text-gray-600 hover:bg-gray-200 gap-2 py-2.5">
              <X size={14} /> Réinitialiser
            </Button>
          </div>
        </div>

        {/* Résultats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 font-medium flex items-center gap-2">
            <SlidersHorizontal size={16} />
            <span><strong>{filtered.length}</strong> biens trouvés</span>
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((bien) => <BienCard key={bien.id} bien={bien} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">Aucun bien ne correspond à vos critères.</p>
            <button onClick={reset} className="mt-4 text-blue-600 hover:underline text-sm">Effacer les filtres</button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
