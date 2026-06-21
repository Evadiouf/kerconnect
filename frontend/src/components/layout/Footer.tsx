import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo + desc */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-3">KerConnect</h3>
            <p className="text-blue-300 text-sm leading-relaxed">
              La plateforme immobilière digitale du Sénégal. Louez, achetez et gérez vos biens en toute simplicité.
            </p>
            <p className="text-blue-400 text-xs mt-4">33 000 00 00</p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-100">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-blue-300">
              {[
                { label: 'Accueil',     href: '/' },
                { label: 'Location',    href: '/location' },
                { label: 'Vente',       href: '/vente' },
                { label: 'Contact',     href: '/contact' },
                { label: 'Subventions', href: '/subventions' },
                { label: 'Nos experts', href: '/experts' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Espaces */}
          <div>
            <h4 className="font-semibold mb-4 text-blue-100">Votre espace</h4>
            <ul className="space-y-2 text-sm text-blue-300">
              {[
                { label: 'Espace client',   href: '/client/dashboard' },
                { label: 'Espace bailleur', href: '/bailleur/dashboard' },
                { label: 'Administration',  href: '/admin/dashboard' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-blue-900 text-center text-xs text-blue-400">
          Copyright © 2026 Naratechvision | Tous droits réservés
        </div>
      </div>
    </footer>
  )
}
