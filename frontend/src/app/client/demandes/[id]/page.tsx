'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import api from '@/lib/api'
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Star, CheckCircle, Phone, Mail, Send, PenLine, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ClientDemandeDetailPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const [msg,        setMsg]        = useState('')
  const [sending,    setSending]    = useState(false)
  const [msgSent,    setMsgSent]    = useState(false)
  const [msgError,   setMsgError]   = useState('')
  const [signing,    setSigning]    = useState(false)
  const [signError,  setSignError]  = useState('')
  const [noteVal,    setNoteVal]    = useState(0)
  const [noteComm,   setNoteComm]   = useState('')
  const [noteSent,   setNoteSent]   = useState(false)
  const [noteSending,setNoteSending]= useState(false)
  const [noteError,  setNoteError]  = useState('')

  const uploadSigne = async (contratId: number, file: File) => {
    setSigning(true); setSignError('')
    try {
      const fd = new globalThis.FormData()
      fd.append('fichier', file)
      const token = localStorage.getItem('token')
      const base  = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
      const res = await fetch(`${base}/v1/contrats/${contratId}/upload-signe`, {
        method: 'POST',
        headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      })
      if (!res.ok) throw new Error('Erreur upload')
      window.location.reload()
    } catch {
      setSignError('Erreur lors de l\'envoi. Réessayez.')
    } finally { setSigning(false) }
  }

  const sendMessage = async () => {
    if (!msg.trim()) return
    setSending(true); setMsgError('')
    try {
      await api.post(`/v1/client/demandes/${id}/message`, { message: msg })
      setMsgSent(true); setMsg('')
      setTimeout(() => setMsgSent(false), 5000)
    } catch {
      setMsgError('Erreur lors de l\'envoi. Réessayez.')
    } finally { setSending(false) }
  }

  const { data: demande, isLoading } = useQuery({
    queryKey: ['client-demande', id],
    queryFn:  () => api.get(`/v1/client/demandes/${id}`).then(r => r.data),
  })

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  if (!demande) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <p className="text-gray-500">Demande introuvable.</p>
        <Link href="/client/demandes" className="hover:underline mt-2 block" style={{ color: '#4338CA' }}>← Retour</Link>
      </div>
    </DashboardLayout>
  )

  const bien = demande.bien
  const contrat = demande.contrat
  const storageBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '') + '/storage'

  const STATUT_COLORS: Record<string, string> = {
    soumise:  'bg-yellow-100 text-yellow-700',
    en_cours: 'bg-blue-100 text-blue-700',
    acceptee: 'bg-green-100 text-green-700',
    refusee:  'bg-red-100 text-red-700',
  }

  const STATUT_LABELS: Record<string, string> = {
    soumise:  'Soumise — En attente de réponse',
    en_cours: 'En cours de traitement',
    acceptee: 'Acceptée — À signer',
    refusee:  'Refusée',
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Détail de la demande</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUT_COLORS[demande.statut] || 'bg-gray-100 text-gray-600'}`}>
            {demande.statut}
          </span>
        </div>

        {/* Statut Banner */}
        <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 ${
          demande.statut === 'acceptee' ? 'bg-green-50 border border-green-200' :
          demande.statut === 'refusee'  ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            demande.statut === 'acceptee' ? 'bg-green-500' :
            demande.statut === 'refusee'  ? 'bg-red-500' : ''
          }`}
          style={demande.statut !== 'acceptee' && demande.statut !== 'refusee' ? { backgroundColor: '#4338CA' } : {}} />
          <p className={`text-sm font-medium ${
            demande.statut === 'acceptee' ? 'text-green-800' :
            demande.statut === 'refusee'  ? 'text-red-800' : ''
          }`}
          style={demande.statut !== 'acceptee' && demande.statut !== 'refusee' ? { color: '#4338CA' } : {}}>
            {STATUT_LABELS[demande.statut] || demande.statut}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">
            {/* Bien concerné */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-56 bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center relative">
                <span className="text-6xl">🏠</span>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: bien?.nature === 'location' ? '#10B981' : '#E05C52' }}>
                    {bien?.nature === 'location' ? 'Location' : 'Vente'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{bien?.titre}</h2>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                  <MapPin size={14} />
                  <span>{bien?.adresse}, {bien?.ville}</span>
                </div>
                <div className="flex gap-5 pt-4 border-t border-gray-100">
                  {bien?.chambres > 0 && (
                    <div className="flex items-center gap-2">
                      <Bed size={16} className="text-indigo-500" />
                      <span className="text-sm text-gray-600">{bien.chambres} ch.</span>
                    </div>
                  )}
                  {bien?.salles_bain > 0 && (
                    <div className="flex items-center gap-2">
                      <Bath size={16} className="text-orange-500" />
                      <span className="text-sm text-gray-600">{bien.salles_bain} sdb.</span>
                    </div>
                  )}
                  {bien?.surface && (
                    <div className="flex items-center gap-2">
                      <Maximize size={16} className="text-green-500" />
                      <span className="text-sm text-gray-600">{bien.surface} m²</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Équipements */}
            {bien?.equipements?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Ce que ce bien propose</h3>
                <div className="grid grid-cols-2 gap-3">
                  {bien.equipements.map((eq: string) => (
                    <div key={eq} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500" />
                      {eq}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Détails de ma demande */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Mes informations de demande</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Nom</p>
                  <p className="font-medium text-gray-900">{demande.prenom_nom}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{demande.type}</p>
                </div>
                {demande.telephone && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Téléphone</p>
                    <p className="font-medium text-gray-900">{demande.telephone}</p>
                  </div>
                )}
                {demande.date_emmenagement && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Date d'emménagement</p>
                    <p className="font-medium text-gray-900">{new Date(demande.date_emmenagement).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                {demande.duree_souhaitee && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Durée souhaitée</p>
                    <p className="font-medium text-gray-900">{demande.duree_souhaitee}</p>
                  </div>
                )}
                {demande.description && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs mb-1">Mon message</p>
                    <p className="text-gray-700">{demande.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-4">
            {/* Prix */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-400 uppercase font-medium mb-1">
                {bien?.nature === 'location' ? 'LOYER MENSUEL' : 'PRIX DE VENTE'}
              </p>
              <p className="text-3xl font-bold text-orange-500">
                {bien?.prix?.toLocaleString('fr-FR')} FCFA{bien?.nature === 'location' ? '/mois' : ''}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm text-gray-500">4.8</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Date de soumission</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Actions selon statut */}
            {demande.statut === 'acceptee' && !contrat && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="font-bold text-green-800 mb-2">🎉 Demande acceptée !</h3>
                <p className="text-sm text-green-700 mb-4">
                  Le bailleur a accepté votre demande. Contactez-le pour finaliser le contrat.
                </p>
                {bien?.bailleur?.phone ? (
                  <a href={`tel:${bien.bailleur.phone}`}
                     className="flex justify-center items-center gap-2 w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold">
                    📞 {bien.bailleur.phone}
                  </a>
                ) : bien?.bailleur?.email ? (
                  <a href={`mailto:${bien.bailleur.email}`}
                     className="flex justify-center items-center gap-2 w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold">
                    ✉️ Écrire au bailleur
                  </a>
                ) : (
                  <p className="text-center text-sm text-gray-400">
                    Utilisez le formulaire ci-dessous pour contacter le bailleur.
                  </p>
                )}
              </div>
            )}

            {contrat && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Contrat</h3>
                    <p className="text-xs text-gray-400 mt-0.5">N° {contrat.numero}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    contrat.statut === 'signe' || contrat.statut === 'valide'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {contrat.statut === 'signe' || contrat.statut === 'valide' ? '✅ Signé' : '✍️ À signer'}
                  </span>
                </div>

                <p className="text-sm font-bold text-gray-900">
                  {Number(contrat.montant).toLocaleString('fr-FR')} FCFA
                  <span className="text-xs font-normal text-gray-400 ml-1">/ échéance</span>
                </p>

                {/* Étapes du contrat */}
                <div className="space-y-3">

                  {/* Étape 1 : Télécharger le modèle */}
                  <div className={`rounded-xl p-3 text-xs ${contrat.fichier_contrat ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className="font-semibold mb-1">{contrat.fichier_contrat ? '✅' : '⏳'} Étape 1 — Modèle de contrat</p>
                    {contrat.fichier_contrat ? (
                      <a href={`${storageBase}/${contrat.fichier_contrat}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90"
                        style={{ backgroundColor: '#4338CA' }}>
                        📄 Télécharger le contrat
                      </a>
                    ) : (
                      <p className="text-gray-400">En attente que le bailleur envoie le document.</p>
                    )}
                  </div>

                  {/* Étape 2 : Signer et renvoyer */}
                  {contrat.fichier_contrat && (
                    <div className={`rounded-xl p-3 text-xs ${contrat.fichier_signe_client ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <p className="font-semibold mb-1">{contrat.fichier_signe_client ? '✅' : '✍️'} Étape 2 — Signer et renvoyer</p>
                      {contrat.fichier_signe_client ? (
                        <p className="text-green-700">Document signé envoyé · En attente de validation du bailleur.</p>
                      ) : (
                        <>
                          <p className="text-yellow-700 mb-2">
                            Téléchargez le contrat ci-dessus, signez-le manuscritement, puis renvoyez-le en PDF ou image.
                          </p>
                          {signError && <p className="text-red-500 mb-2">{signError}</p>}
                          <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: signing ? '#9CA3AF' : '#E05C52' }}>
                            {signing ? '⏳ Envoi...' : '📤 Uploader le contrat signé'}
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                              disabled={signing}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadSigne(contrat.id, f) }} />
                          </label>
                        </>
                      )}
                    </div>
                  )}

                  {/* Étape 3 : Validation bailleur */}
                  {contrat.fichier_signe_client && (
                    <div className={`rounded-xl p-3 text-xs ${contrat.statut === 'valide' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                      <p className="font-semibold mb-1">{contrat.statut === 'valide' ? '✅' : '⏳'} Étape 3 — Validation du bailleur</p>
                      {contrat.statut === 'valide'
                        ? <p className="text-green-700">Contrat validé ! Vous pouvez payer.</p>
                        : <p className="text-blue-700">En attente que le bailleur valide votre signature.</p>
                      }
                    </div>
                  )}

                  {/* Étape 4 : Payer */}
                  {contrat.statut === 'valide' && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-green-800 mb-2">✅ Étape 4 — Payer</p>
                      <button
                        onClick={() => router.push(
                          `/paiement?contrat_id=${contrat.id}&montant=${contrat.montant}&libelle=${encodeURIComponent('Loyer — ' + bien?.titre)}`
                        )}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
                        style={{ backgroundColor: '#E05C52' }}
                      >
                        💳 Payer {Number(contrat.montant).toLocaleString('fr-FR')} FCFA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact bailleur */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Contacter le bailleur</h3>

              {/* Liens directs */}
              <div className="space-y-2 text-sm mb-5">
                {bien?.bailleur?.phone && (
                  <a href={`tel:${bien.bailleur.phone}`} className="flex items-center gap-2 hover:underline" style={{ color: '#4338CA' }}>
                    <Phone size={14} />
                    {bien.bailleur.phone}
                  </a>
                )}
                {bien?.bailleur?.email && (
                  <a href={`mailto:${bien.bailleur.email}`} className="flex items-center gap-2 hover:underline" style={{ color: '#4338CA' }}>
                    <Mail size={14} />
                    {bien.bailleur.email}
                  </a>
                )}
              </div>

              {/* Formulaire de message intégré */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Envoyer un message</p>
                {msgSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 text-center">
                    ✅ Message envoyé au bailleur !
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={msg}
                      onChange={e => setMsg(e.target.value)}
                      rows={4}
                      placeholder="Bonjour, je souhaite en savoir plus sur votre bien..."
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
                      {sending ? 'Envoi...' : 'Envoyer le message'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bloc notation — visible si contrat validé + paiement confirmé */}
            {contrat?.statut === 'valide' && (contrat?.paiements ?? []).some((p: {statut: string}) => p.statut === 'confirme') && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" /> Notez votre expérience
                </h3>
                {noteSent ? (
                  <div className="text-center py-3 text-green-600 font-medium text-sm">
                    ✅ Vous avez déjà laissé un avis
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Étoiles */}
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setNoteVal(n)} type="button">
                          <Star size={28}
                            className={n <= noteVal ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={noteComm} onChange={e => setNoteComm(e.target.value)}
                      rows={3} placeholder="Partagez votre expérience avec ce bailleur..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4338CA] resize-none"
                    />
                    {noteError && <p className="text-red-500 text-xs">{noteError}</p>}
                    <button
                      disabled={noteVal === 0 || noteSending}
                      onClick={async () => {
                        if (noteVal === 0) return
                        setNoteSending(true); setNoteError('')
                        try {
                          await api.post('/v1/avis', { contrat_id: contrat.id, note: noteVal, commentaire: noteComm })
                          setNoteSent(true)
                        } catch {
                          setNoteError('Erreur lors de l\'envoi. Réessayez.')
                        } finally { setNoteSending(false) }
                      }}
                      className="w-full py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#4338CA' }}
                    >
                      {noteSending ? 'Envoi...' : '⭐ Envoyer mon avis'}
                    </button>
                  </div>
                )}
              </div>
            )}

            <Link href={`/biens/${bien?.id}`}>
              <Button className="w-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50">
                Voir l&apos;annonce →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
