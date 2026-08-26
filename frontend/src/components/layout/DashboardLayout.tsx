// HAD — KerConnect · Naratechvision
'use client'

import Link from 'next/link'
import { KerConnectLogo } from '@/components/ui/Logo'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { useEffect, useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import {
  LayoutDashboard, Building2, FileText, Users,
  CreditCard, Settings, LogOut, Menu, X,
  Search, Bell, ChevronDown, HelpCircle, TrendingUp
} from 'lucide-react'

const STATUT_COLORS: Record<string, string> = {
  soumise:   'bg-yellow-100 text-yellow-700',
  en_cours:  'bg-blue-100 text-blue-700',
  acceptee:  'bg-green-100 text-green-700',
  refusee:   'bg-red-100 text-red-700',
  paiement:  'bg-orange-100 text-orange-700',
  signature: 'bg-purple-100 text-purple-700',
}

interface Notif { id: number; texte: string; statut: string; date: string; lien: string }

interface NavItem { label: string; href: string; icon: React.ElementType }

const CLIENT_NAV: NavItem[] = [
  { label: 'Tableau de bord', href: '/client/dashboard',  icon: LayoutDashboard },
  { label: 'Mes biens',       href: '/client/biens',      icon: Building2 },
  { label: 'Mes demandes',    href: '/client/demandes',   icon: FileText },
  { label: 'Mes paiements',   href: '/client/paiements',  icon: CreditCard },
  { label: 'Mes alertes',     href: '/client/alertes',    icon: Bell },
  { label: 'Mon compte',      href: '/client/compte',     icon: Settings },
]

const BAILLEUR_NAV: NavItem[] = [
  { label: 'Tableau de bord',      href: '/bailleur/dashboard', icon: LayoutDashboard },
  { label: 'Gestion des annonces', href: '/bailleur/annonces',  icon: Building2 },
  { label: 'Gestion de demandes',  href: '/bailleur/demandes',  icon: FileText },
  { label: 'Gestion des biens',    href: '/bailleur/biens',     icon: Building2 },
  { label: 'Transactions',         href: '/bailleur/paiements', icon: CreditCard },
  { label: 'Rapport mensuel',      href: '/bailleur/rapport',   icon: TrendingUp },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Tableau de bord', href: '/admin/dashboard',    icon: LayoutDashboard },
  { label: 'Annonces',        href: '/admin/annonces',     icon: Building2 },
  { label: 'Utilisateurs',    href: '/admin/users',        icon: Users },
  { label: 'Abonnements',     href: '/admin/abonnements',  icon: CreditCard },
  { label: 'Transactions',    href: '/admin/transactions', icon: TrendingUp },
  { label: 'Paramètres',      href: '/admin/settings',     icon: Settings },
]

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  client:       CLIENT_NAV,
  bailleur:     BAILLEUR_NAV,
  proprietaire: BAILLEUR_NAV,
  admin:        ADMIN_NAV,
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [mounted, setMounted]           = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)
  const [profileOpen, setProfileOpen]   = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn:  () => api.get('/v1/notifications').then(r => r.data),
    refetchInterval: 30_000,
    enabled: mounted && isAuthenticated,
  })
  const notifs: Notif[] = notifData?.data ?? []

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/auth/login')
  }, [mounted, isAuthenticated, router])

  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#4338CA', borderTopColor: 'transparent' }} />
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
      <div className="px-5 py-4 border-b border-white/10">
        <Link href="/" onClick={() => setSidebarOpen(false)}>
          <KerConnectLogo width={120} />
        </Link>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
              style={isActive ? { backgroundColor: '#E05C52' } : {}}
              >
                <Icon size={18} />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-3 pb-4 border-t border-white/10">
        <p className="text-indigo-300/70 text-xs px-4 py-3 font-medium">Preferences</p>
        {user.role !== 'client' && (
          <Link
            href={`/${user.role === 'admin' ? 'admin' : 'bailleur'}/compte`}
            className="flex items-center gap-3 px-4 py-2.5 text-indigo-200 hover:text-white text-sm rounded-xl hover:bg-white/10 transition-colors"
          >
            <Settings size={16} />
            Paramètres
          </Link>
        )}
        <Link
          href="/contact"
          className="flex items-center gap-3 px-4 py-2.5 text-indigo-200 hover:text-white text-sm rounded-xl hover:bg-white/10 transition-colors"
        >
          <HelpCircle size={16} />
          Centre d&apos;aide
        </Link>
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
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 left-64 z-50 text-white ml-2">
            <X size={24} />
          </button>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-6 h-16 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            {/* Burger mobile */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={22} />
            </button>
            {/* Bouton menu desktop (toggle) */}
            <button className="hidden lg:flex text-gray-400 hover:text-gray-600">
              <Menu size={20} />
            </button>
            {/* Barre de recherche */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1 max-w-sm">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher"
                className="bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 flex-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Bell size={17} />
                {notifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#E05C52' }} />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm">Notifications</p>
                    <span className="text-xs text-gray-400">{notifs.length} activité(s)</span>
                  </div>
                  {notifs.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-400 text-sm">
                      Aucune activité récente
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {notifs.map((n) => (
                        <li key={n.id}>
                          <Link href={n.lien} onClick={() => setNotifOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#E05C52' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 leading-tight">{n.texte}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUT_COLORS[n.statut] ?? 'bg-gray-100 text-gray-500'}`}>
                                  {n.statut}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(n.date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {/* Profil */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-xl transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: '#4338CA' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{user.name}</p>
                  <p className="text-xs text-gray-400 capitalize leading-tight">{user.role}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400 hidden md:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
