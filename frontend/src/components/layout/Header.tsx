// HAD — KerConnect · Naratechvision
'use client'

import Link from 'next/link'
import { KerConnectLogo } from '@/components/ui/Logo'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/store/auth.store'
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

interface HeaderProps { transparent?: boolean }


export default function Header({ transparent = false }: HeaderProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [open, setOpen] = useState(false)

  const CORAL  = '#E05C52'

  const handleLogout = () => { clearAuth(); router.push('/') }

  /* Sur fond transparent (hero), les textes sont blancs */
  const textColor    = transparent ? 'text-white' : 'text-gray-700'
  const activeColor  = transparent ? 'text-white font-semibold' : 'text-gray-900 font-semibold'
  const inactiveColor = transparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'

  return (
    <header className={`z-50 ${transparent ? 'absolute w-full bg-transparent' : 'sticky top-0 bg-white border-b border-gray-100 shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <KerConnectLogo width={130} priority />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href ? activeColor : inactiveColor
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
                <Link
                  href={DASHBOARD[user.role] ?? '/client/dashboard'}
                  className={`text-sm font-medium ${textColor}`}
                >
                  Mon espace
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold px-5 py-2 rounded-full text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: CORAL }}
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link href="/auth/login">
                <button
                  className="text-sm font-semibold px-5 py-2 rounded-full text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: CORAL }}
                >
                  Accéder à mon espace
                </button>
              </Link>
            )}
          </div>

          {/* Burger mobile */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open
              ? <X size={24} className={transparent ? 'text-white' : 'text-gray-700'} />
              : <Menu size={24} className={transparent ? 'text-white' : 'text-gray-700'} />
            }
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className={`md:hidden px-6 py-4 space-y-3 ${transparent ? 'bg-black/70 backdrop-blur-sm' : 'bg-white border-t border-gray-100'}`}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block text-sm font-medium py-2 ${transparent ? 'text-white' : 'text-gray-700'}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  href={DASHBOARD[user.role] ?? '/client/dashboard'}
                  onClick={() => setOpen(false)}
                  className="block text-center text-sm py-2.5 rounded-full font-semibold text-white"
                  style={{ backgroundColor: '#4338CA' }}
                >
                  Mon espace
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-sm py-2.5 rounded-full text-white font-semibold"
                  style={{ backgroundColor: CORAL }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setOpen(false)}>
                <button
                  className="w-full text-sm py-2.5 rounded-full text-white font-semibold"
                  style={{ backgroundColor: CORAL }}
                >
                  Accéder à mon espace
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
