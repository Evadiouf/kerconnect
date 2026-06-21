'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useEffect } from 'react'
import {
  LayoutDashboard, Building2, FileText, Users,
  CreditCard, Heart, Settings, LogOut, Menu
} from 'lucide-react'
import { useState } from 'react'

interface NavItem { label: string; href: string; icon: React.ElementType }

const CLIENT_NAV: NavItem[] = [
  { label: 'Tableau de bord', href: '/client/dashboard',  icon: LayoutDashboard },
  { label: 'Mes biens',       href: '/client/biens',      icon: Building2 },
  { label: 'Mes demandes',    href: '/client/demandes',   icon: FileText },
  { label: 'Mes favoris',     href: '/client/favoris',    icon: Heart },
  { label: 'Mon compte',      href: '/client/compte',     icon: Settings },
]

const BAILLEUR_NAV: NavItem[] = [
  { label: 'Tableau de bord', href: '/bailleur/dashboard', icon: LayoutDashboard },
  { label: 'Mes annonces',    href: '/bailleur/annonces',  icon: Building2 },
  { label: 'Mes biens',       href: '/bailleur/biens',     icon: Building2 },
  { label: 'Demandes',        href: '/bailleur/demandes',  icon: FileText },
  { label: 'Paiements',       href: '/bailleur/paiements', icon: CreditCard },
  { label: 'Mon compte',      href: '/bailleur/compte',    icon: Settings },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Tableau de bord', href: '/admin/dashboard',    icon: LayoutDashboard },
  { label: 'Annonces',        href: '/admin/annonces',     icon: Building2 },
  { label: 'Utilisateurs',    href: '/admin/users',        icon: Users },
  { label: 'Transactions',    href: '/admin/transactions', icon: CreditCard },
]

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  client:       CLIENT_NAV,
  bailleur:     BAILLEUR_NAV,
  proprietaire: BAILLEUR_NAV,
  admin:        ADMIN_NAV,
}

const TITLES: Record<string, string> = {
  client: 'Espace client', bailleur: 'Espace bailleur',
  proprietaire: 'Espace bailleur', admin: 'Administration',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Attendre que Zustand charge depuis localStorage avant de rediriger
    if (mounted && !isAuthenticated) router.push('/auth/login')
  }, [mounted, isAuthenticated, router])

  // Afficher un loader pendant l'hydratation Zustand
  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  )

  if (!user) return null

  const nav   = NAV_BY_ROLE[user.role] || CLIENT_NAV
  const title = TITLES[user.role] || 'Mon espace'

  const handleLogout = () => { clearAuth(); router.push('/') }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-blue-950 text-white w-64">
      <div className="p-6 border-b border-blue-900">
        <Link href="/" className="text-xl font-bold text-white">KerConnect</Link>
        <p className="text-blue-400 text-xs mt-1">{title}</p>
      </div>
      <div className="p-4 border-b border-blue-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-blue-400 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname.startsWith(href)
                ? 'bg-blue-800 text-white font-medium'
                : 'text-blue-300 hover:bg-blue-900 hover:text-white'
            }`}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-900">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm text-blue-300 hover:text-white hover:bg-blue-900 rounded-lg transition-colors">
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-30">
        <Sidebar />
      </aside>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header mobile */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-gray-700" />
          </button>
          <span className="font-bold text-blue-900">KerConnect</span>
          <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
