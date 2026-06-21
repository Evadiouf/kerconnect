'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

const NAV = [
  { label: 'Accueil',  href: '/' },
  { label: 'Location', href: '/location' },
  { label: 'Vente',    href: '/vente' },
  { label: 'Contact',  href: '/contact' },
]

const DASHBOARD: Record<string, string> = {
  client:       '/client/dashboard',
  bailleur:     '/bailleur/dashboard',
  proprietaire: '/bailleur/dashboard',
  admin:        '/admin/dashboard',
}

export default function Header() {
  const pathname        = usePathname()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Bandeau top */}
      <div className="bg-blue-900 text-white text-center text-xs py-1.5">
        Plus de 5 000 biens vérifiés • Sans frais cachés
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-900">KerConnect</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-blue-900 border-b-2 border-blue-900 pb-0.5'
                    : 'text-gray-600 hover:text-blue-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href={DASHBOARD[user.role]} className="text-sm font-medium text-blue-900 hover:underline">
                  Mon espace
                </Link>
                <Button onClick={clearAuth} className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm px-4 py-2">
                  Déconnexion
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button className="bg-transparent text-blue-900 border border-blue-900 hover:bg-blue-50 text-sm px-4 py-2">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-blue-900 text-white hover:bg-blue-800 text-sm px-4 py-2">
                    Créer un compte
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-700 hover:text-blue-900 py-2">
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button onClick={clearAuth} className="bg-gray-100 text-gray-700 w-full">Déconnexion</Button>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  <Button className="w-full border border-blue-900 text-blue-900 bg-transparent">Se connecter</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-blue-900 text-white">Créer un compte</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
