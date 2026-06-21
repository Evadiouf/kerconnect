'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

const schema = z.object({
  nom:     z.string().min(2, 'Nom requis'),
  email:   z.string().email('Email invalide'),
  sujet:   z.string().min(3, 'Sujet requis'),
  message: z.string().min(20, 'Message trop court (20 caractères min)'),
})
type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    setSent(true)
    reset()
    setTimeout(() => setSent(false), 5000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-blue-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-blue-300 text-sm font-medium uppercase tracking-wider">CONTACT</span>
          <h1 className="text-3xl font-bold mt-2 mb-1">Une équipe à votre écoute</h1>
          <p className="text-blue-200">Que vous cherchiez à louer, acheter ou simplement vous renseigner, nos conseillers sont là.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Infos contact */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nos coordonnées</h2>
            {[
              { icon: Phone,  label: 'Téléphone', value: '33 000 00 00' },
              { icon: Mail,   label: 'Email',     value: 'contact@naratechvision.com' },
              { icon: MapPin, label: 'Adresse',   value: 'Dakar, Sénégal' },
              { icon: Clock,  label: 'Horaires',  value: 'Lun–Ven 8h–18h · Sam 9h–13h' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-blue-900" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-gray-900 font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyer un message</h2>

            {sent && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                Message envoyé ! Nous vous répondrons dans les 24h.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <input {...register('nom')} placeholder="Votre nom" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input {...register('email')} type="email" placeholder="votre@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input {...register('sujet')} placeholder="Objet de votre message" className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                {errors.sujet && <p className="text-red-500 text-sm mt-1">{errors.sujet.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea {...register('message')} rows={5} placeholder="Décrivez votre besoin..." className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3">
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
