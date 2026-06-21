'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Building2, FileText, Users,
  CreditCard, Heart, Settings, LogOut, Menu, X,
  Search, Bell, ChevronDown, HelpCircle
} from 'lucide-react'

interface NavItem { label: string; href: string; icon: React.ElementType }

const CLIENT_NAV: NavItem[] = [
  { label: 'Tableau de bord', href: '/client/dashboard',  icon: LayoutDashboard },
  { label: 'Mes biens',       href: '/client/biens',      icon: Building2 },
  { label: 'Mes demandes',    href: '/client/demandes',   icon: FileText },
  { label: 'Mes favoris',     href: '/client/favoris',    icon: Heart },
  { label: 'Mon compte',      href: '/client/compte',     icon: Settings },
]

const BAILLEUR_NAV: NavItem[] = [
  { label: 'Tableau de bord',     href: '/bailleur/dashboard', icon: LayoutDashboard },
  { label: 'Gestion des annonces', href: '/bailleur/annonces',  icon: Building2 },
  { label: 'Gestion de demandes', href: '/bailleur/demandes',  icon: FileText },
  { label: 'Gestion des biens',   href: '/bailleur/biens',     icon: Building2 },
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

// Logo SVG KerConnect (basé sur le Figma)
function KerConnectLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
          <path d="M18 4C10.268 4 4 10.268 4 18s6.268 14 14 14 14-6.268 14-14S25.732 4 18 4z" fill="#4338CA"/>
          <path d="M18 8c-2.5 0-4.5 2-4.5 4.5S15.5 17 18 17s4.5-2 4.5-4.5S20.5 8 18 8z" fill="white"/>
          <path d="M11 20c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H13c-1.1 0-2-.9-2-2v-4z" fill="white"/>
        </svg>
      </div>
      <span className="text-white font-bold text-lg tracking-wide">KÊRCONNECT</span>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/login')
  }, [mounted, isAuthenticated, router])

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  )

  if (!user) return null

  const nav = NAV_BY_ROLE[user.role] || CLIENT_NAV
  const handleLogout = () => { clearAuth(); router.push('/') }

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#4338CA' }}>
      {/* Logo */}
      <div className="p-5 pb-6">
        <Link href="/" onClick={() => setSidebarOpen(false)}>
          <KerConnectLogo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-700/50'
              }`}>
                <Icon size={18} />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="p-3 border-t border-indigo-700/50">
        <p className="text-indigo-400 text-xs px-4 mb-2 font-medium">Preferences</p>
        <Link href={`/${user.role === 'admin' ? 'admin' : user.role === 'client' ? 'client' : 'bailleur'}/compte`}
          className="flex items-center gap-3 px-4 py-2.5 text-indigo-200 hover:text-white text-sm rounded-xl hover:bg-indigo-700/50 transition-colors">
          <Settings size={16} />
          Paramètres
        </Link>
        <Link href="/contact"
          className="flex items-center gap-3 px-4 py-2.5 text-indigo-200 hover:text-white text-sm rounded-xl hover:bg-indigo-700/50 transition-colors">
          <HelpCircle size={16} />
          Centre d&apos;aide
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-indigo-200 hover:text-red-300 text-sm rounded-xl hover:bg-red-500/10 transition-colors w-full mt-1">
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-30 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 z-50 shadow-2xl">
            <SidebarContent />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-68 z-50 text-white">
            <X size={24} />
          </button>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top header bar */}
        <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={22} />
            </button>
            {/* Barre de recherche */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-md">
              <Search size={16} className="text-gray-400" />
              <input type="text" placeholder="Rechercher..." className="bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 flex-1" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="relative w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            {/* Utilisateur */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#4338CA' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize leading-tight">{user.role}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 hidden md:block" />
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
