// HAD — KerConnect · Naratechvision
import Link from 'next/link'
import { KerConnectLogo } from '@/components/ui/Logo'

/* Icônes réseaux sociaux SVG inline */
function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )
}
function IconLinkedin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}
function IconTiktok() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 14.86 2H12v13.9a2.5 2.5 0 1 1-2.06-2.46v-2.94a5.5 5.5 0 1 0 4.56 5.42V9.53a7.24 7.24 0 0 0 4.24 1.37V7.83a4.28 4.28 0 0 1-2.14-2.01z"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1A1A2E' }} className="text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Colonne 1 : Logo + description */}
          <div>
            {/* Logo */}
            <div className="mb-4">
              <KerConnectLogo width={130} />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              La première plateforme immobilière 100% en ligne au Sénégal.
              Trouvez, louez ou achetez votre bien en toute simplicité.
            </p>
          </div>

          {/* Colonne 2 : Liens rapides */}
          <div>
            <h4 className="font-semibold text-white mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              {[
                { label: 'Accueil',      href: '/' },
                { label: 'Subventions',  href: '/subventions' },
                { label: 'Nos services', href: '/services' },
                { label: 'Experts',      href: '/experts' },
                { label: 'Contact',      href: '/contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                {/* Icône localisation */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0 text-gray-500">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-gray-500">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
                </svg>
                <span>+221 71 030 70 54</span>
              </li>
              <li className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-gray-500">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>contact@naratechvision.com</span>
              </li>
            </ul>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: <IconFacebook />, href: 'https://www.facebook.com/share/19ZYpgqzXe/', label: 'Facebook' },
                { icon: <IconLinkedin />, href: 'https://www.linkedin.com/company/100293130', label: 'LinkedIn' },
                { icon: <IconTiktok />,   href: 'https://www.tiktok.com/@naratechvisionmedia?_r=1&_t=ZS-99Ii4l0568K', label: 'TikTok' },
              ].map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== '#' ? '_blank' : undefined}
                  rel={href !== '#' ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Séparateur + copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>Copyright © 2026 Naratechvision | Tous droits réservés</span>
        </div>
      </div>
    </footer>
  )
}
