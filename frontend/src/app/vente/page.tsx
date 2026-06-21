'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BienCard, { Bien } from '@/components/biens/BienCard'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BIENS_MOCK: Bien[] = [
  { id: 10, titre: 'Villa Moderne avec Piscine', type: 'Villa', nature: 'vente', prix: 120000000, adresse: 'Almadies', ville: 'Dakar', surface: 400, chambres: 6, salles_bain: 4, is_new: true },
  { id: 11, titre: 'Appartement standing Plateau', type: 'Appartement', nature: 'vente', prix: 45000000, adresse: 'Plateau', ville: 'Dakar', surface: 110, chambres: 3, salles_bain: 2 },
  { id: 12, titre: 'Duplex Sacré-Cœur', type: 'Duplex', nature: 'vente', prix: 65000000, adresse: 'Sacré-Cœur', ville: 'Dakar', surface: 180, chambres: 4, salles_bain: 3 },
  { id: 13, titre: 'Villa familiale Mermoz', type: 'Villa', nature: 'vente', prix: 85000000, adresse: 'Mermoz', ville: 'Dakar', surface: 280, chambres: 5, salles_bain: 3 },
  { id: 14, titre: 'Terrain viabilisé Diamniadio', type: 'Terrain', nature: 'vente', prix: 12000000, adresse: 'Zone résidentielle', ville: 'Diamniadio', surface: 500, chambres: 0, salles_bain: 0 },
  { id: 15, titre: 'Appartement Thiès', type: 'Appartement', nature: 'vente', prix: 18000000, adresse: 'Centre', ville: 'Thiès', surface: 70, chambres: 2, salles_bain: 1 },
  { id: 16, titre: 'Villa bord de mer Saly', type: 'Villa', nature: 'vente', prix: 200000000, adresse: 'Front de mer', ville: 'Saly', surface: 600, chambres: 7, salles_bain: 5 },
  { id: 17, titre: 'Studio investissement locatif', type: 'Studio', nature: 'vente', prix: 15000000, adresse: 'Université', ville: 'Dakar', surface: 35, chambres: 1, salles_bain: 1 },
  { id: 18, titre: 'Immeuble R+2 Pikine', type: 'Immeuble', nature: 'vente', prix: 95000000, adresse: 'Centre', ville: 'Pikine', surface: 450, chambres: 8, salles_bain: 6 },
]

const TYPES   = ['Tous', 'Appartement', 'Villa', 'Duplex', 'Studio', 'Terrain', 'Immeuble']
const BUDGETS = [
  { label: 'Sans limite', max: Infinity },
  { label: 'Moins de 20M', max: 20000000 },
  { label: '20M – 50M',   max: 50000000 },
  { label: '50M – 100M',  max: 100000000 },
  { label: '100M+',       max: Infinity },
]

export default function VentePage() {
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

      <section className="bg-blue-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-blue-300 text-sm font-medium uppercase tracking-wider">VENTE</span>
          <h1 className="text-3xl font-bold mt-2 mb-1">Investissez dans l&apos;exception</h1>
          <p className="text-blue-200">Notre sélection de biens à acquérir, accompagnée par des experts juridiques et financiers.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
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

        <p className="text-gray-600 font-medium mb-4"><strong>{filtered.length}</strong> biens trouvés</p>

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
