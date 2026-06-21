'use client'

import Link from 'next/link'
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

  const CORAL = '#E05C52'

  const handleLogout = () => { clearAuth(); router.push('/') }

  return (
    <header className={`sticky top-0 z-50 ${transparent ? 'absolute w-full bg-transparent' : 'bg-white border-b border-gray-100 shadow-sm'}`}>
      {/* Bandeau top — seulement sur fond blanc */}
      {!transparent && (
        <div className="text-white text-center text-xs py-1.5" style={{ backgroundColor: CORAL }}>
          Plus de 5 000 biens vérifiés • Sans frais cachés
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: CORAL }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
              </svg>
            </div>
            <span className={`text-xl font-extrabold tracking-wide ${transparent ? 'text-white' : 'text-gray-900'}`}>
              KÊRCONNECT
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? (transparent ? 'text-white' : 'text-gray-900')
                    : (transparent ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                }`}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href={DASHBOARD[user.role]}
                  className={`text-sm font-medium ${transparent ? 'text-white hover:text-white/80' : 'text-gray-700 hover:text-gray-900'}`}>
                  Mon espace
                </Link>
                <button onClick={handleLogout}
                  className="text-sm font-medium px-5 py-2.5 rounded-full border transition-all"
                  style={transparent
                    ? { borderColor: 'rgba(255,255,255,0.4)', color: 'white' }
                    : { borderColor: '#E05C52', color: '#E05C52' }
                  }>
                  Déconnexion
                </button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <button className={`text-sm font-medium px-5 py-2.5 rounded-full border transition-all ${
                    transparent
                      ? 'border-white/40 text-white hover:bg-white/10'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}>
                    Se connecter
                  </button>
                </Link>
                <Link href="/auth/register">
                  <button className="text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: CORAL }}>
                    Nous contacter
                  </button>
                </Link>
              </>
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
        <div className={`md:hidden px-6 py-4 space-y-3 ${transparent ? 'bg-black/70 backdrop-blur' : 'bg-white border-t border-gray-100'}`}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`block text-sm font-medium py-2 ${transparent ? 'text-white' : 'text-gray-700'}`}>
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="text-sm text-white border border-white/30 py-2 rounded-full">
                Déconnexion
              </button>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  <button className={`w-full text-sm py-2.5 rounded-full border ${transparent ? 'border-white/40 text-white' : 'border-gray-300 text-gray-700'}`}>
                    Se connecter
                  </button>
                </Link>
                <Link href="/auth/register" onClick={() => setOpen(false)}>
                  <button className="w-full text-sm py-2.5 rounded-full text-white font-semibold" style={{ backgroundColor: CORAL }}>
                    Nous contacter
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
