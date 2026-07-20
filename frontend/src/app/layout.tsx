// HAD — KerConnect · Naratechvision
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KerConnect — Plateforme immobilière',
  description: 'Louez et achetez des biens immobiliers au Sénégal — 100% en ligne.',
  authors: [{ name: 'Naratechvision' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
