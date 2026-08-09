'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { ArrowLeft, MapPin, Bed, Bath, Maximize, CheckCircle, Phone, Mail, Send, Upload, FileText } from 'lucide-react'
import Link from 'next/link'

export default function BailleurDemandeDetailPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const qc2     = useQueryClient()
  const [msg,           setMsg]           = useState('')
  const [sending,       setSending]       = useState(false)
  const [msgSent,       setMsgSent]       = useState(false)
  const [msgError,      setMsgError]      = useState('')
  const [uploadingDoc,  setUploadingDoc]  = useState(false)
  const [uploadDocErr,  setUploadDocErr]  = useState('')
  const [docEnvoye,     setDocEnvoye]     = useState(false)
  const [caution,       setCaution]       = useState('')

  const sendMessage = async () => {
    if (!msg.trim()) return
    setSending(true); setMsgError('')
    try {
      await api.post(`/v1/bailleur/demandes/${id}/message`, { message: msg })
      setMsgSent(true); setMsg('')
      setTimeout(() => setMsgSent(false), 5000)
    } catch {
      setMsgError('Erreur lors de l\'envoi. Réessayez.')
    } finally { setSending(false) }
  }

  const uploadContrat = async (contratId: number, file: File) => {
    setUploadingDoc(true); setUploadDocErr('')
    try {
      const fd = new globalThis.FormData()
      fd.append('fichier', file)
      await api.post(`/v1/contrats/${contratId}/upload-modele`, fd)
      setDocEnvoye(true)
      qc2.invalidateQueries({ queryKey: ['bailleur-demande', id] })
    } catch {
      setUploadDocErr('Erreur lors de l\'envoi du contrat.')
    } finally { setUploadingDoc(false) }
  }

  const qc = useQueryClient()

  const { data: demande, isLoading } = useQuery({
    queryKey: ['bailleur-demande', id],
    queryFn:  () => api.get(`/v1/bailleur/demandes/${id}`).then(r => r.data),
    // Recharge toutes les 15s pour voir quand le client signe
    refetchInterval: 15_000,
  })

  const update = useMutation({
    mutationFn: (statut: string) => api.put(`/v1/bailleur/demandes/${id}`, { statut }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bailleur-demande', id] })
      qc.invalidateQueries({ queryKey: ['bailleur-demandes'] })
    },
  })

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4338CA', borderTopColor: 'transparent' }} />
      </div>
    </DashboardLayout>
  )

  if (!demande) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <p className="text-gray-500">Demande introuvable.</p>
        <Link href="/bailleur/demandes" className="mt-2 block text-sm hover:underline" style={{ color: '#4338CA' }}>← Retour aux demandes</Link>
      </div>
    </DashboardLayout>
  )

  const bien = demande.bien
  const demandeur = demande.demandeur ?? {}
  const storageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '') + '/storage'

  const STATUT_COLORS: Record<string, string> = {
    soumise:  'bg-yellow-100 text-yellow-700',
    en_cours: 'bg-blue-100 text-blue-700',
    acceptee: 'bg-green-100 text-green-700',
    refusee:  'bg-red-100 text-red-700',
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Détail de la demande</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[demande.statut] || 'bg-gray-100 text-gray-600'}`}>
              {demande.statut}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ════ Colonne principale ════ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Galerie / carte du bien */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {/* Image simulée */}
              <div
                className="relative h-56 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80')" }}
              >
                <div className="absolute inset-0 bg-black/20" />
                {/* Titre par-dessus */}
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-2" style={{ backgroundColor: '#E05C52' }}>
                    Villa Moderne avec <span style={{ textDecoration: 'underline' }}>Piscine</span>
                  </span>
                  <p className="text-white text-xs flex items-center gap-1">
                    <MapPin size={11} /> {bien.adresse}, {bien.ville}
                  </p>
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="p-5">
                <div className="flex items-center gap-6 text-sm">
                  {bien.chambres > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Bed size={15} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{bien.chambres}</p>
                        <p className="text-xs text-gray-400">Chambres</p>
                      </div>
                    </div>
                  )}
                  {bien.salles_bain > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Bath size={15} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{bien.salles_bain}</p>
                        <p className="text-xs text-gray-400">Salles de bain</p>
                      </div>
                    </div>
                  )}
                  {bien.surface > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Maximize size={15} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{bien.surface} m²</p>
                        <p className="text-xs text-gray-400">Surface</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Description du bien</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{bien.description}</p>
            </div>

            {/* Équipements */}
            {bien.equipements?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Ce que ce bien propose</h3>
                <div className="grid grid-cols-2 gap-3">
                  {bien.equipements.map((eq: string) => (
                    <div key={eq} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                      {eq}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ════ Panneau latéral ════ */}
          <div className="space-y-4">

            {/* Prix */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-2">
                {bien?.nature === 'location' ? 'Loyer mensuel' : 'Prix de vente'}
              </p>
              <p className="text-2xl font-extrabold" style={{ color: '#E05C52' }}>
                {bien?.prix?.toLocaleString('fr-FR')}{' '}
                <span className="text-lg">FCFA{bien?.nature === 'location' ? '/mois' : ''}</span>
              </p>
            </div>

            {/* Informations du demandeur */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                INFORMATION DU DEMANDEUR
              </h3>

              {/* Profil */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Prénom</span>
                  <span className="font-medium text-gray-900">{demandeur.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span className="font-medium text-gray-900">{demandeur.email ?? '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Téléphone</span>
                  <span className="font-medium text-gray-900">{demandeur.phone ?? '-'}</span>
                </div>
              </div>

              {/* Adresse */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">Adresse actuelle</p>
                <p className="text-sm text-gray-700 font-medium">{demandeur.ville ?? '-'}</p>
              </div>

              {/* Description demandeur */}
              <div>
                <p className="text-xs text-gray-400 mb-1.5">DESCRIPTION</p>
                <p className="text-sm text-gray-600 leading-relaxed">{demandeur.description ?? '-'}</p>
              </div>

              {/* Contacts directs */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {demandeur.email && (
                  <a href={`mailto:${demandeur.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <Mail size={14} className="text-gray-400" />
                    {demandeur.email}
                  </a>
                )}
                {demandeur.phone && (
                  <a href={`tel:${demandeur.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <Phone size={14} className="text-gray-400" />
                    {demandeur.phone}
                  </a>
                )}
              </div>

              {/* Formulaire de réponse via la plateforme */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Répondre via la plateforme</p>
                {msgSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 text-center">
                    ✅ Message envoyé au client !
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      rows={4}
                      placeholder="Bonjour, suite à votre demande..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4338CA] transition-colors resize-none"
                    />
                    {msgError && <p className="text-red-500 text-xs">{msgError}</p>}
                    <button
                      onClick={sendMessage}
                      disabled={sending || !msg.trim()}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ backgroundColor: '#4338CA' }}
                    >
                      <Send size={14} />
                      {sending ? 'Envoi...' : 'Envoyer au client'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons action — Demande soumise */}
            {demande.statut === 'soumise' && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <button
                  onClick={() => update.mutate('acceptee')}
                  disabled={update.isPending}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: '#10B981' }}
                >
                  {update.isPending ? 'Traitement…' : '✅ Accepter la demande'}
                </button>
                <button
                  onClick={() => update.mutate('refusee')}
                  disabled={update.isPending}
                  className="w-full py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-60"
                >
                  Refuser
                </button>
              </div>
            )}

            {/* Envoi du contrat — Demande acceptée */}
            {demande.statut === 'acceptee' && demande.contrat && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={16} style={{ color: '#4338CA' }} />
                  <p className="font-bold text-gray-900 text-sm">Contrat de {demande.contrat.type === 'vente' ? 'vente' : 'bail'}</p>
                </div>
                <p className="text-xs text-gray-500">N° {demande.contrat.numero} · {Number(demande.contrat.montant).toLocaleString('fr-FR')} FCFA</p>

                {docEnvoye || demande.contrat.fichier_contrat ? (
                  <div className="space-y-2">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                      ✅ Contrat envoyé au client, en attente de sa signature.
                    </div>
                    {demande.contrat.fichier_signe_client && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                        ✍️ Le client a signé et renvoyé le contrat.
                        <a href={`${storageBase}/${demande.contrat.fichier_signe_client}`}
                          target="_blank"
                          className="block mt-1 underline font-medium">
                          Voir le document signé →
                        </a>
                      </div>
                    )}
                    {demande.contrat.fichier_signe_client && demande.contrat.statut !== 'valide' && (
                      <button
                        onClick={() => api.post(`/v1/contrats/${demande.contrat.id}/valider`).then(() => qc2.invalidateQueries({ queryKey: ['bailleur-demande', id] }))}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
                        style={{ backgroundColor: '#10B981' }}
                      >
                        ✅ Valider la signature pour autoriser le paiement
                      </button>
                    )}
                    {demande.contrat.statut === 'valide' && (
                      <div className="bg-green-100 border border-green-300 rounded-xl p-3 text-xs text-green-800 font-semibold text-center">
                        🎉 Contrat validé, le client peut maintenant payer
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600">
                      Envoyez le document de contrat au client pour qu'il le signe et vous le retourne.
                    </p>

                    {/* Dépôt de garantie */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <label className="block text-xs font-semibold text-amber-800 mb-1">
                        🤝 Dépôt de garantie / Caution (optionnel)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number" min="0" placeholder="0"
                          value={caution} onChange={e => setCaution(e.target.value)}
                          className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm outline-none focus:border-amber-400 bg-white"
                        />
                        <span className="text-xs text-amber-700 font-medium">FCFA</span>
                      </div>
                      {caution && Number(caution) > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Caution : <strong>{Number(caution).toLocaleString('fr-FR')} FCFA</strong>, remboursable à la fin du contrat sous conditions.
                        </p>
                      )}
                    </div>

                    {uploadDocErr && <p className="text-red-500 text-xs">{uploadDocErr}</p>}
                    <label className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold cursor-pointer hover:opacity-90 ${uploadingDoc ? 'opacity-60' : ''}`}
                      style={{ backgroundColor: '#4338CA' }}>
                      <Upload size={15} />
                      {uploadingDoc ? 'Envoi en cours…' : '📄 Envoyer le contrat (PDF)'}
                      <input type="file" accept=".pdf,.doc,.docx,.odt" className="hidden"
                        disabled={uploadingDoc}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadContrat(demande.contrat.id, f) }} />
                    </label>
                    <p className="text-xs text-gray-400 text-center">PDF, Word, ODT acceptés · max 20 Mo</p>
                  </div>
                )}
              </div>
            )}

            <Link href="/bailleur/demandes">
              <div className="text-center text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                ← Retour aux demandes
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
