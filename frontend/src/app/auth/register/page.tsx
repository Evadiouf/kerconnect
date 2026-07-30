'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { KerConnectLogo } from '@/components/ui/Logo'
import api from '@/lib/api'
import { Eye, EyeOff, Building2, Home, Users, CloudUpload } from 'lucide-react'

const ROLES = [
  {
    value: 'bailleur',
    label: 'Agence',
    desc: 'Je propose un logement en location pour une période déterminée ou indéterminée.',
    icon: Building2,
  },
  {
    value: 'client',
    label: 'Locataire',
    desc: 'Je cherche un logement en location ou sous-location.',
    icon: Home,
  },
  {
    value: 'proprietaire',
    label: 'Propriétaire',
    desc: 'Je possède un bien et je souhaite le mettre en location.',
    icon: Users,
  },
]

export default function RegisterPage() {
  const router = useRouter()

  const [step,        setStep]        = useState(0)
  const [role,        setRole]        = useState('')
  const [name,        setName]        = useState('')
  const [phone,       setPhone]       = useState('')
  const [email,       setEmail]       = useState('')
  const [ninea,       setNinea]       = useState('')
  const [registre,    setRegistre]    = useState('')
  const [adresse,     setAdresse]     = useState('')
  const [typeBien,    setTypeBien]    = useState('')
  const [contratFile, setContratFile] = useState<File | null>(null)
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [cgu,         setCgu]         = useState(false)
  const [showPwd,     setShowPwd]     = useState(false)
  const [showCfm,     setShowCfm]     = useState(false)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  const isAgence = role === 'bailleur'

  const isLocataire = role === 'client'

  const stepLabels = [
    'Informations du profil',
    isAgence ? 'Informations du représentant' : 'Informations personnelles',
    isAgence ? 'Informations de la structure' : isLocataire ? 'Votre logement actuel' : 'Informations du bien',
    'Mot de passe',
  ]

  const canNext = (): boolean => {
    setError('')
    if (step === 0) return !!role
    if (step === 1) {
      if (!name.trim())  { setError('Le prénom et nom sont requis.'); return false }
      if (!phone.trim()) { setError('Le numéro de téléphone est requis.'); return false }
      if (!email.trim() || !email.includes('@')) { setError('Adresse email invalide.'); return false }
      return true
    }
    return true
  }

  const next = () => { if (canNext()) setStep(s => s + 1) }
  const prev = () => { setError(''); setStep(s => s - 1) }

  const submit = async () => {
    setError('')
    if (!password || password.length < 8) { setError('Minimum 8 caractères pour le mot de passe.'); return }
    if (password !== confirm)             { setError('Les mots de passe ne correspondent pas.'); return }
    if (!cgu)                             { setError('Vous devez accepter les conditions générales.'); return }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name',                  name)
      formData.append('email',                 email)
      formData.append('phone',                 phone)
      formData.append('role',                  role)
      formData.append('password',              password)
      formData.append('password_confirmation', confirm)
      if (isAgence) {
        if (ninea)    formData.append('ninea',             ninea)
        if (registre) formData.append('registre_commerce', registre)
        if (adresse)  formData.append('adresse_structure', adresse)
      } else {
        if (typeBien)    formData.append('type_bien',       typeBien)
        if (contratFile) formData.append('contrat_location', contratFile)
      }

      await api.post('/v1/auth/register', formData)
      router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&type=verification`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const msg = e.response?.data?.message
        || Object.values(e.response?.data?.errors || {}).flat()[0]
        || "Erreur lors de l'inscription."
      setError(String(msg))
    } finally { setLoading(false) }
  }

  const inp = 'w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#E05C52] transition-colors placeholder-gray-300 bg-white'
  const progress = Math.round((step / 3) * 100)

  return (
    <div className="min-h-screen flex">

      {/* ════ Formulaire ════ */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 sm:px-10 py-10 bg-white min-h-screen">
        <div className="w-full max-w-sm">

          <div className="flex justify-center mb-6">
            <KerConnectLogo width={100} />
          </div>

          <h1 className="text-2xl font-bold text-center mb-1" style={{ color: '#E05C52' }}>
            Creation de compte
          </h1>
          <p className="text-gray-400 text-sm text-center mb-5 leading-relaxed">
            Faites vos démarches en ligne, suivez l&apos;état d&apos;avancement de<br />
            vos demandes en temps réel et sauvegardez vos actes en<br />
            toute sécurité
          </p>

          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: '#E05C52' }}>
              {stepLabels[step]}
            </p>
            <p className="text-sm text-gray-400 font-medium">{step + 1}/4</p>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mb-6">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: '#E05C52' }}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* ── Étape 0 : Choix du profil ── */}
          {step === 0 && (
            <div className="space-y-3">
              {ROLES.map((r) => {
                const Icon = r.icon
                const selected = role === r.value
                return (
                  <button key={r.value} type="button" onClick={() => setRole(r.value)}
                    className="w-full p-4 rounded-2xl border-2 text-left flex items-start gap-4 transition-all"
                    style={selected
                      ? { borderColor: '#E05C52', backgroundColor: '#FEF2F2' }
                      : { borderColor: '#E5E7EB', backgroundColor: '#fff' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: selected ? '#E05C52' : '#FEE2E2' }}>
                      <Icon size={18} style={{ color: selected ? '#fff' : '#E05C52' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{r.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                      style={selected
                        ? { borderColor: '#E05C52', backgroundColor: '#E05C52' }
                        : { borderColor: '#D1D5DB' }}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                )
              })}
              <button type="button" onClick={next} disabled={!role}
                className="w-full py-4 rounded-2xl text-white font-semibold text-sm mt-2 hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#E05C52' }}>
                Suivant
              </button>
            </div>
          )}

          {/* ── Étape 1 : Informations personnelles ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Prénom et nom</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ex: Birima Diop" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Numéro de téléphone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Ex: 77 123 45 67" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Adresse email</label>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="Ex: bdiop@gmail.com" className={inp} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={prev}
                  className="flex-1 py-4 rounded-2xl text-sm font-semibold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="button" onClick={next}
                  className="flex-1 py-4 rounded-2xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#E05C52' }}>
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 2 : Structure (Agence) ou Bien (Locataire/Propriétaire) ── */}
          {step === 2 && (
            <div className="space-y-4">
              {isAgence ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Ninea</label>
                    <input value={ninea} onChange={e => setNinea(e.target.value)}
                      placeholder="Ex: 536729N" className={inp} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Registre de commerce</label>
                    <input value={registre} onChange={e => setRegistre(e.target.value)}
                      placeholder="Ex: N3572" className={inp} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Adresse</label>
                    <input value={adresse} onChange={e => setAdresse(e.target.value)}
                      placeholder="Ex: Ouakam" className={inp} />
                  </div>
                </>
              ) : (
                <>
                  {isLocataire && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
                      Ces informations sont <strong>optionnelles</strong>. Si vous avez déjà un logement, renseignez-les pour une gestion facilitée. Sinon, passez directement à l&apos;étape suivante.
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      {isLocataire ? 'Type de logement actuel' : 'Type de bien'}
                      {isLocataire && <span className="ml-2 text-xs font-normal text-gray-400">(Optionnel)</span>}
                    </label>
                    <input value={typeBien} onChange={e => setTypeBien(e.target.value)}
                      placeholder={isLocataire ? 'Ex: Appartement F3, Villa, Studio…' : 'Ex: Appartement F3'}
                      className={inp} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      {isLocataire ? 'Contrat de location actuel' : 'Contrat de location'}
                      {isLocataire && <span className="ml-2 text-xs font-normal text-gray-400">(Optionnel)</span>}
                    </label>
                    {isLocataire && (
                      <p className="text-xs text-gray-400 mb-2">
                        Si vous avez déjà un logement, joignez votre contrat actuel pour une gestion facilitée.
                      </p>
                    )}
                    <label className="block w-full border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-[#E05C52] transition-colors">
                      <input type="file" className="hidden"
                        accept=".jpeg,.jpg,.png,.pdf,.mp4"
                        onChange={e => setContratFile(e.target.files?.[0] ?? null)} />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                          <CloudUpload size={18} style={{ color: '#E05C52' }} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          {contratFile ? contratFile.name : 'Choisissez un fichier'}
                        </p>
                        {!contratFile && (
                          <>
                            <p className="text-xs text-gray-400">
                              Formats JPEG, PNG, PDF et MP4, jusqu&apos;à 10 Mo
                            </p>
                            <span className="mt-1 px-4 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600">
                              Parcourir le fichier
                            </span>
                          </>
                        )}
                        {contratFile && (
                          <p className="text-xs text-green-600">Fichier sélectionné ✓</p>
                        )}
                      </div>
                    </label>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={prev}
                  className="flex-1 py-4 rounded-2xl text-sm font-semibold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="button" onClick={next}
                  className="flex-1 py-4 rounded-2xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#E05C52' }}>
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 3 : Mot de passe ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input value={password} onChange={e => setPassword(e.target.value)}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••••" className={inp + ' pr-12'} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Confirmation de mot de passe</label>
                <div className="relative">
                  <input value={confirm} onChange={e => setConfirm(e.target.value)}
                    type={showCfm ? 'text' : 'password'}
                    placeholder="••••••••••" className={inp + ' pr-12'} />
                  <button type="button" onClick={() => setShowCfm(!showCfm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCfm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <div onClick={() => setCgu(!cgu)}
                  className="w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors cursor-pointer"
                  style={cgu
                    ? { borderColor: '#E05C52', backgroundColor: '#E05C52' }
                    : { borderColor: '#D1D5DB' }}>
                  {cgu && (
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1.5 6l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Je déclare avoir lu et accepté les{' '}
                  <span className="font-semibold" style={{ color: '#E05C52' }}>
                    conditions générales d&apos;utilisation
                  </span>
                  {' '}et j&apos;atteste sur l&apos;honneur que toutes les informations fournies sont exactes.
                </p>
              </label>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={prev}
                  className="flex-1 py-4 rounded-2xl text-sm font-semibold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="button" onClick={submit} disabled={loading}
                  className="flex-1 py-4 rounded-2xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#E05C52' }}>
                  {loading && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? 'Création en cours...' : 'Confirmer'}
                </button>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: '#E05C52' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* ════ Panneau droit — image desktop ════ */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=85"
          alt="Bien immobilier KerConnect"
          fill priority
          className="object-cover"
          sizes="55vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-extrabold leading-tight mb-2">
            Rejoignez des milliers<br />
            de familles qui ont<br />
            <span style={{ color: '#E05C52' }}>trouvé leur logement</span>
          </h2>
        </div>
      </div>
    </div>
  )
}
