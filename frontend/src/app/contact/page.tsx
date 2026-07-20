'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Phone, Mail, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

const schema = z.object({
  nom:     z.string().min(2, 'Nom requis'),
  email:   z.string().email('Email invalide'),
  sujet:   z.string().min(3, 'Sujet requis'),
  message: z.string().min(20, 'Message trop court (20 caractères min)'),
})
type FormData = z.infer<typeof schema>

const CONTACTS = [
  { icon: Phone,  label: 'Téléphone', value: '33 000 00 00',               href: 'tel:+221330000000'              },
  { icon: Mail,   label: 'Email',     value: 'contact@naratechvision.com',  href: 'mailto:contact@naratechvision.com' },
  { icon: MapPin, label: 'Adresse',   value: 'Dakar, Sénégal',             href: '#'                              },
  { icon: Clock,  label: 'Horaires',  value: 'Lun–Ven 8h–18h · Sam 9h–13h', href: '#'                            },
]

export default function ContactPage() {
  const [sent, setSent]       = useState(false)
  const [sendError, setSendError] = useState('')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setSendError('')
    try {
      await api.post('/v1/contact', { nom: data.nom, email: data.email, sujet: data.sujet, message: data.message })
      setSent(true)
      reset()
      setTimeout(() => setSent(false), 5000)
    } catch {
      setSendError('Une erreur est survenue. Veuillez réessayer ou nous écrire directement.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* ═══ EN-TÊTE ═══ */}
      <section className="bg-white border-b border-gray-100 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#E05C52' }}>
            CONTACT
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Une équipe à{' '}
            <span style={{ color: '#E05C52' }}>votre écoute</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Que vous cherchiez à louer, acheter ou simplement vous renseigner, nos conseillers sont là.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ════ Coordonnées ════ */}
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nos coordonnées</h2>
            {CONTACTS.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E05C5215' }}>
                  <Icon size={18} style={{ color: '#E05C52' }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                  <p className="text-gray-900 font-semibold text-sm">{value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* ════ Formulaire ════ */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyer un message</h2>

            {sent && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
                <CheckCircle size={16} />
                Message envoyé ! Nous vous répondrons dans les 24h.
              </div>
            )}
            {sendError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
                <AlertCircle size={16} />
                {sendError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                  <input
                    {...register('nom')}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors"
                  />
                  {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet</label>
                <input
                  {...register('sujet')}
                  placeholder="Objet de votre message"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors"
                />
                {errors.sujet && <p className="text-red-500 text-xs mt-1">{errors.sujet.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="Décrivez votre besoin..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#E05C52] transition-colors resize-none"
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#E05C52' }}
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ═══ SECTION AIDE ═══ */}
      <section className="py-14 px-6 mx-6 mb-8 rounded-3xl" style={{ backgroundColor: '#1A1A2E' }}>
        <div className="max-w-6xl mx-auto text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Rejoignez notre communauté</h2>
          <p className="text-gray-400 text-sm mb-6">
            Plus de 5 000 familles ont trouvé leur logement grâce à KerConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@naratechvision.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
            >
              <Mail size={16} /> contact@naratechvision.com
            </a>
            <a
              href="tel:+221330000000"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#E05C52' }}
            >
              <Phone size={16} /> Appeler maintenant
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
