'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

/* ─────────────────────────────────────────────
   Données des forfaits
───────────────────────────────────────────── */
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Testez la plateforme',
    monthlyPrice: 0,
    annualPrice: 0,
    commission: 5,
    annonces: '2 annonces actives',
    cta: 'Commencer gratuitement',
    href: '/auth/register',
    variant: 'light' as const,
    features: [
      { text: '2 annonces actives maximum', ok: true },
      { text: 'Réception des demandes de location', ok: true },
      { text: 'Tableau de bord essentiel', ok: true },
      { text: 'Gestion d\'un contrat numérique', ok: true },
      { text: 'Rappels de paiement automatiques', ok: true },
      { text: 'Mise en avant dans les résultats', ok: false },
      { text: 'Statistiques de vues par annonce', ok: false },
      { text: 'Support prioritaire (24h)', ok: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Pour les bailleurs actifs',
    monthlyPrice: 2000,
    annualPrice: 19900,
    commission: 4,
    annonces: '15 annonces actives',
    cta: 'Passer en Pro',
    href: '/auth/register?forfait=pro',
    variant: 'accent' as const,
    badge: 'Recommandé',
    features: [
      { text: '15 annonces actives', ok: true },
      { text: 'Réception des demandes de location', ok: true },
      { text: 'Tableau de bord complet', ok: true },
      { text: 'Contrats numériques illimités', ok: true },
      { text: 'Rappels de paiement automatiques', ok: true },
      { text: 'Mise en avant dans les résultats', ok: true },
      { text: 'Statistiques de vues par annonce', ok: true },
      { text: 'Support prioritaire (24h)', ok: true },
    ],
  },
  {
    id: 'agence',
    name: 'Propriété',
    tagline: 'Pour les propriétaires & agences',
    monthlyPrice: 3000,
    annualPrice: 29900,
    commission: 3,
    annonces: 'Annonces illimitées',
    cta: 'Contacter l\'équipe',
    href: '/contact',
    variant: 'dark' as const,
    features: [
      { text: 'Annonces illimitées', ok: true },
      { text: 'Réception des demandes de location', ok: true },
      { text: 'Tableau de bord multi-propriétés', ok: true },
      { text: 'Contrats numériques illimités', ok: true },
      { text: 'Rappels de paiement automatiques', ok: true },
      { text: 'Badge "Propriétaire Vérifié" sur vos annonces', ok: true },
      { text: 'Export rapports PDF (revenus, occupation)', ok: true },
      { text: 'Manager de compte dédié', ok: true },
    ],
  },
]

/* ─────────────────────────────────────────────
   Icônes SVG inline (pas de CDN)
───────────────────────────────────────────── */
function IconCheck({ color = '#10B981' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.12" />
      <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCross({ light }: { light?: boolean }) {
  const c = light ? 'rgba(255,255,255,0.3)' : '#D1D5DB'
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={c} fillOpacity="0.5" />
      <path d="M5.5 10.5l5-5M10.5 10.5l-5-5" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Page principale
───────────────────────────────────────────── */
export default function TarifsPage() {
  const [annuel, setAnnuel] = useState(false)

  function prix(plan: typeof PLANS[0]) {
    if (plan.monthlyPrice === 0) return null
    return annuel ? plan.annualPrice : plan.monthlyPrice
  }

  function prixAffiche(plan: typeof PLANS[0]) {
    const p = prix(plan)
    if (p === null) return '0'
    return p.toLocaleString('fr-FR')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        :root {
          --bg:         #F4F5FA;
          --surface:    #FFFFFF;
          --text:       #0F1117;
          --muted:      #656880;
          --border:     #E0E2F0;
          --accent:     #E05C52;
          --indigo:     #4338CA;
          --navy:       #1A1A2E;
          --green:      #10B981;
          --toggle-bg:  #E0E2F0;
          --toggle-dot: #FFFFFF;
          --toggle-act: #E05C52;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg:         #0B0C14;
            --surface:    #13141F;
            --text:       #EEF0FF;
            --muted:      #8A8DA8;
            --border:     #21223A;
            --toggle-bg:  #21223A;
            --toggle-dot: #EEF0FF;
          }
        }
        :root[data-theme="light"] {
          --bg: #F4F5FA; --surface: #FFFFFF; --text: #0F1117; --muted: #656880;
          --border: #E0E2F0; --toggle-bg: #E0E2F0; --toggle-dot: #FFFFFF;
        }
        :root[data-theme="dark"] {
          --bg: #0B0C14; --surface: #13141F; --text: #EEF0FF; --muted: #8A8DA8;
          --border: #21223A; --toggle-bg: #21223A; --toggle-dot: #EEF0FF;
        }

        .tarifs-section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 72px 24px 96px;
          flex: 1;
        }

        .eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 16px;
        }

        .hero-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(28px, 5vw, 46px);
          font-weight: 400;
          line-height: 1.18;
          color: var(--text);
          text-wrap: balance;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }

        .hero-title em {
          font-style: italic;
          color: var(--accent);
        }

        .hero-sub {
          font-size: 16px;
          color: var(--muted);
          line-height: 1.6;
          max-width: 480px;
          margin: 0 auto 40px;
        }

        /* ── Toggle ── */
        .toggle-wrap {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 5px 18px;
          cursor: pointer;
          user-select: none;
        }

        .toggle-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted);
          transition: color .2s;
        }

        .toggle-label.active {
          color: var(--text);
          font-weight: 600;
        }

        .toggle-track {
          width: 40px;
          height: 22px;
          border-radius: 100px;
          background: var(--toggle-bg);
          position: relative;
          transition: background .25s;
          flex-shrink: 0;
        }

        .toggle-track.on {
          background: var(--accent);
        }

        .toggle-dot {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--toggle-dot);
          box-shadow: 0 1px 3px rgba(0,0,0,.2);
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
        }

        .toggle-track.on .toggle-dot {
          transform: translateX(18px);
        }

        .save-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--indigo);
          background: rgba(67,56,202,.10);
          padding: 2px 8px;
          border-radius: 100px;
          letter-spacing: 0.03em;
        }

        /* ── Grille plans ── */
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          margin-top: 56px;
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .plans-grid {
            grid-template-columns: 1fr;
          }
          .plan-card:not(:last-child) {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .plan-card.accent {
            border-right: none !important;
          }
        }

        .plan-card {
          padding: 36px 32px 40px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .plan-card.light {
          background: var(--surface);
          border-right: 1px solid var(--border);
        }

        .plan-card.accent {
          background: #E05C52;
          border-right: 1px solid rgba(255,255,255,.15);
        }

        .plan-card.dark {
          background: #1A1A2E;
        }

        .plan-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #E05C52;
          background: rgba(255,255,255,.95);
          padding: 3px 10px;
          border-radius: 100px;
        }

        .plan-name {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .plan-name.light  { color: var(--muted); }
        .plan-name.accent { color: rgba(255,255,255,.75); }
        .plan-name.dark   { color: rgba(255,255,255,.5); }

        .plan-tagline {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 28px;
        }

        .plan-tagline.light  { color: var(--text); }
        .plan-tagline.accent { color: rgba(255,255,255,.9); }
        .plan-tagline.dark   { color: rgba(255,255,255,.7); }

        .plan-price-area {
          margin-bottom: 8px;
        }

        .plan-price {
          font-size: clamp(28px, 3.5vw, 38px);
          font-weight: 800;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .plan-price.light  { color: var(--text); }
        .plan-price.accent { color: #FFFFFF; }
        .plan-price.dark   { color: #FFFFFF; }

        .plan-price-unit {
          font-size: 14px;
          font-weight: 500;
          margin-left: 4px;
          vertical-align: middle;
          opacity: .7;
        }

        .plan-period {
          font-size: 12px;
          margin-top: 4px;
          opacity: .6;
        }

        .plan-period.accent { color: #fff; }
        .plan-period.dark   { color: #fff; }
        .plan-period.light  { color: var(--muted); }

        .commission-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 100px;
          margin: 16px 0 28px;
        }

        .commission-chip.light {
          background: rgba(224,92,82,.08);
          color: var(--accent);
        }

        .commission-chip.accent {
          background: rgba(255,255,255,.2);
          color: #fff;
        }

        .commission-chip.dark {
          background: rgba(67,56,202,.25);
          color: #A5B4FC;
        }

        .plan-divider {
          height: 1px;
          margin-bottom: 24px;
        }

        .plan-divider.light  { background: var(--border); }
        .plan-divider.accent { background: rgba(255,255,255,.2); }
        .plan-divider.dark   { background: rgba(255,255,255,.08); }

        .features-list {
          list-style: none;
          margin: 0 0 auto;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          line-height: 1.45;
        }

        .feature-item.light  { color: var(--text); }
        .feature-item.accent { color: rgba(255,255,255,.92); }
        .feature-item.dark   { color: rgba(255,255,255,.75); }

        .feature-item.disabled.light  { color: var(--muted); }
        .feature-item.disabled.accent { color: rgba(255,255,255,.4); }
        .feature-item.disabled.dark   { color: rgba(255,255,255,.3); }

        .feature-icon { margin-top: 1px; flex-shrink: 0; }

        .plan-cta {
          display: block;
          text-align: center;
          margin-top: 32px;
          padding: 13px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: opacity .18s, transform .18s;
        }

        .plan-cta:hover { opacity: .88; transform: translateY(-1px); }
        .plan-cta:active { transform: translateY(0); }

        .plan-cta.light {
          background: var(--text);
          color: var(--surface);
        }

        .plan-cta.accent {
          background: #FFFFFF;
          color: #E05C52;
        }

        .plan-cta.dark {
          background: #4338CA;
          color: #FFFFFF;
        }

        /* ── Notes bas de page ── */
        .tarifs-note {
          margin-top: 40px;
          text-align: center;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.7;
        }

        .tarifs-note a {
          color: var(--indigo);
          text-decoration: none;
          font-weight: 500;
        }

        .tarifs-note a:hover { text-decoration: underline; }

        /* ── FAQ ── */
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 64px;
        }

        .faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px 28px;
        }

        .faq-q {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }

        .faq-a {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.6;
        }

        .faq-a strong { color: var(--text); font-weight: 600; }
      `}</style>

      <Header />

      <section className="tarifs-section">
        {/* ── En-tête ── */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <span className="eyebrow">Nos forfaits</span>
          <h1 className="hero-title">
            Des offres qui évoluent<br />
            avec <em>votre patrimoine</em>
          </h1>
          <p className="hero-sub">
            Publiez vos biens, gérez vos contrats et encaissez vos loyers.
            Choisissez le forfait adapté à votre situation.
          </p>

          {/* Toggle mensuel/annuel */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button
              className="toggle-wrap"
              onClick={() => setAnnuel(v => !v)}
              aria-pressed={annuel}
              style={{ border: 'none', font: 'inherit', cursor: 'pointer' }}
            >
              <span className={`toggle-label ${!annuel ? 'active' : ''}`}>Mensuel</span>
              <div className={`toggle-track ${annuel ? 'on' : ''}`}>
                <div className="toggle-dot" />
              </div>
              <span className={`toggle-label ${annuel ? 'active' : ''}`}>Annuel</span>
            </button>
            {annuel && <span className="save-badge">Économisez 17 %</span>}
          </div>
        </div>

        {/* ── Grille des plans ── */}
        <div className="plans-grid">
          {PLANS.map(plan => {
            const p = prix(plan)
            const v = plan.variant
            const checkColor = v === 'light' ? '#10B981' : '#FFFFFF'
            return (
              <div key={plan.id} className={`plan-card ${v}`}>

                {plan.badge && (
                  <span className="plan-badge">{plan.badge}</span>
                )}

                <p className={`plan-name ${v}`}>{plan.name}</p>
                <p className={`plan-tagline ${v}`}>{plan.tagline}</p>

                {/* Prix */}
                <div className="plan-price-area">
                  {p === null ? (
                    <p className={`plan-price ${v}`}>
                      Gratuit
                    </p>
                  ) : (
                    <p className={`plan-price ${v}`}>
                      {prixAffiche(plan)}
                      <span className="plan-price-unit">FCFA</span>
                    </p>
                  )}
                  {p !== null && (
                    <p className={`plan-period ${v}`}>
                      {annuel ? 'par an (facturé annuellement)' : 'par mois'}
                    </p>
                  )}
                </div>

                {/* Commission */}
                <div className={`commission-chip ${v}`}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2 10L10 2M3.5 3h-1.5v1.5M8.5 9H10V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Commission {plan.commission}% KerConnect
                </div>

                <div className={`plan-divider ${v}`} />

                {/* Features */}
                <ul className="features-list">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`feature-item ${v} ${!f.ok ? 'disabled' : ''}`}>
                      <span className="feature-icon">
                        {f.ok
                          ? <IconCheck color={checkColor} />
                          : <IconCross light={v !== 'light'} />
                        }
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.href} className={`plan-cta ${v}`}>
                  {plan.cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* ── Note commission ── */}
        <p className="tarifs-note">
          La commission est prélevée sur chaque paiement de loyer.
          Un bailleur Pro avec un loyer de <strong>200 000 FCFA</strong> économise
          <strong> 2 000 FCFA/mois de commission</strong> — l'abonnement à 2 000 FCFA/mois s'autofinance dès le premier bien loué.
          <br />
          Des questions ? <Link href="/contact">Contactez notre équipe</Link>.
        </p>

        {/* ── FAQ ── */}
        <div className="faq-grid">
          {[
            {
              q: 'Puis-je changer de forfait à tout moment ?',
              a: 'Oui. Vous pouvez passer à un forfait supérieur ou inférieur à tout moment depuis votre espace bailleur. Le changement est effectif immédiatement.'
            },
            {
              q: 'Comment la commission est-elle calculée ?',
              a: 'La commission est ajoutée au loyer payé par le locataire. Par exemple avec un loyer de 200 000 FCFA en Starter (5 %), le locataire paie 210 000 FCFA. En Pro (4 %), il paie 208 000 FCFA.'
            },
            {
              q: 'Quels modes de paiement sont acceptés ?',
              a: <>Wave, Orange Money, espèces, chèque ou carte bancaire via notre partenaire <strong>PayDunya</strong>. Votre abonnement peut être réglé par Mobile Money.</>
            },
            {
              q: 'Le forfait Agence est-il sur mesure ?',
              a: 'Oui. Nous adaptons l\'offre Agence à la taille de votre portefeuille. Contactez notre équipe commerciale pour un devis personnalisé et une démonstration.'
            },
          ].map(({ q, a }) => (
            <div key={q} className="faq-item">
              <p className="faq-q">{q}</p>
              <p className="faq-a">{typeof a === 'string' ? a : a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
