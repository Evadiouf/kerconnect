'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { KerConnectLogo } from '@/components/ui/Logo'
import { useAuthStore } from '@/store/auth.store'
import api from '@/lib/api'

const ROLE_REDIRECT: Record<string, string> = {
  bailleur:     '/bailleur/dashboard',
  proprietaire: '/bailleur/dashboard',
}

const PAYMENT_MODES = [
  { id: 'wave',         label: 'Wave',        icon: '🌊', desc: 'Instantané' },
  { id: 'orange_money', label: 'Orange Money', icon: '🟠', desc: 'Orange Money' },
  { id: 'espece',       label: 'Espèces',      icon: '💵', desc: 'En agence' },
  { id: 'cheque',       label: 'Chèque',       icon: '📄', desc: 'Certifié' },
  { id: 'carte',        label: 'Carte',        icon: '💳', desc: 'Bancaire' },
]

const FORFAIT_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', agence: 'Propriété' }

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Testez la plateforme',
    monthlyPrice: 0,
    annualPrice: 0,
    commission: 5,
    mode: 'starter',
    cta: 'Commencer gratuitement',
    variant: 'light' as const,
    features: [
      { text: '2 annonces actives maximum', ok: true },
      { text: 'Réception des demandes', ok: true },
      { text: 'Tableau de bord essentiel', ok: true },
      { text: 'Gestion d\'un contrat numérique', ok: true },
      { text: 'Rappels de paiement auto.', ok: true },
      { text: 'Mise en avant dans les résultats', ok: false },
      { text: 'Statistiques de vues', ok: false },
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
    mode: 'wave',
    cta: 'Choisir Pro',
    variant: 'accent' as const,
    badge: 'Recommandé',
    features: [
      { text: '15 annonces actives', ok: true },
      { text: 'Réception des demandes', ok: true },
      { text: 'Tableau de bord complet', ok: true },
      { text: 'Contrats numériques illimités', ok: true },
      { text: 'Rappels de paiement auto.', ok: true },
      { text: 'Mise en avant dans les résultats', ok: true },
      { text: 'Statistiques de vues', ok: true },
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
    mode: 'wave',
    cta: 'Choisir Propriété',
    variant: 'dark' as const,
    features: [
      { text: 'Annonces illimitées', ok: true },
      { text: 'Réception des demandes', ok: true },
      { text: 'Tableau de bord multi-propriétés', ok: true },
      { text: 'Contrats numériques illimités', ok: true },
      { text: 'Rappels de paiement auto.', ok: true },
      { text: 'Badge "Propriétaire Vérifié"', ok: true },
      { text: 'Export rapports PDF', ok: true },
      { text: 'Manager de compte dédié', ok: true },
    ],
  },
]

function IconCheck({ color = '#10B981' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity="0.15" />
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

function Spinner() {
  return (
    <svg className="inline-block animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function PaiementInscriptionPage() {
  const router              = useRouter()
  const { user, clearAuth } = useAuthStore()

  // 'choose' → plan | 'pay' → paiement | 'waiting' → attente admin
  const [step, setStep]                 = useState<'choose' | 'pay' | 'waiting'>('choose')
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)
  const [payMode, setPayMode]           = useState('')
  const [loadingPlan, setLoadingPlan]   = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [annuel, setAnnuel]             = useState(false)
  const [waitingForfait, setWaitingForfait] = useState<string>('')

  // Détection: si le bailleur a déjà soumis une demande → afficher 'waiting' directement
  useEffect(() => {
    api.get('/v1/inscription/frais')
      .then(r => {
        if (r.data.inscription_payee) {
          router.push(ROLE_REDIRECT[user?.role ?? 'bailleur'] ?? '/bailleur/dashboard')
          return
        }
        if (r.data.inscription_at) {
          setWaitingForfait(r.data.forfait ?? 'pro')
          setStep('waiting')
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = async (plan: typeof PLANS[0]) => {
    setError('')
    if (plan.id === 'starter') {
      setLoadingPlan('starter')
      try {
        await api.post('/v1/inscription/payer', { mode: 'starter', forfait: 'starter' })
        router.push(ROLE_REDIRECT[user?.role ?? 'bailleur'] ?? '/bailleur/dashboard')
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } }
        setError(e.response?.data?.message ?? 'Une erreur est survenue.')
        setLoadingPlan(null)
      }
    } else {
      setSelectedPlan(plan)
      setPayMode('')
      setStep('pay')
    }
  }

  const handlePay = async () => {
    if (!payMode || !selectedPlan) return
    setLoading(true)
    setError('')
    try {
      await api.post('/v1/inscription/payer', { mode: payMode, forfait: selectedPlan.id })
      setWaitingForfait(selectedPlan.id)
      setStep('waiting')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message ?? 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => { clearAuth(); router.push('/auth/login') }

  return (
    <div style={{ background: 'var(--pi-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        :root {
          --pi-bg:      #F0F2F8;
          --pi-surface: #FFFFFF;
          --pi-text:    #0F1117;
          --pi-muted:   #6B6F8A;
          --pi-border:  #DDE0F0;
          --pi-accent:  #E05C52;
          --pi-indigo:  #4338CA;
          --pi-navy:    #1A1A2E;
          --pi-tog-bg:  #DDE0F0;
          --pi-tog-dot: #FFFFFF;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --pi-bg:      #090A12;
            --pi-surface: #111220;
            --pi-text:    #E8EAFF;
            --pi-muted:   #7A7D9A;
            --pi-border:  #1E203A;
            --pi-tog-bg:  #1E203A;
            --pi-tog-dot: #E8EAFF;
          }
        }
        :root[data-theme="light"] {
          --pi-bg:#F0F2F8; --pi-surface:#FFFFFF; --pi-text:#0F1117; --pi-muted:#6B6F8A;
          --pi-border:#DDE0F0; --pi-tog-bg:#DDE0F0; --pi-tog-dot:#FFFFFF;
        }
        :root[data-theme="dark"] {
          --pi-bg:#090A12; --pi-surface:#111220; --pi-text:#E8EAFF; --pi-muted:#7A7D9A;
          --pi-border:#1E203A; --pi-tog-bg:#1E203A; --pi-tog-dot:#E8EAFF;
        }

        /* ─── Topbar ─── */
        .pi-topbar {
          background: var(--pi-surface);
          border-bottom: 1px solid var(--pi-border);
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .pi-step-pill {
          font-size: 12px;
          font-weight: 600;
          color: var(--pi-muted);
          background: rgba(224,92,82,.07);
          border: 1px solid rgba(224,92,82,.18);
          padding: 6px 16px;
          border-radius: 100px;
          letter-spacing: 0.01em;
        }
        .pi-step-pill strong { color: var(--pi-accent); }
        .pi-logout-btn {
          font-size: 13px;
          font-weight: 500;
          color: var(--pi-muted);
          background: none;
          border: 1px solid var(--pi-border);
          cursor: pointer;
          padding: 7px 16px;
          border-radius: 8px;
          transition: all .15s;
        }
        .pi-logout-btn:hover { color: var(--pi-text); border-color: var(--pi-text); }

        /* ─── Conteneur principal ─── */
        .pi-wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 72px 32px 96px;
          flex: 1;
        }

        /* ─── ÉTAPE 1 : Hero ─── */
        .pi-hero {
          text-align: center;
          margin-bottom: 64px;
        }
        .pi-eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--pi-accent);
          margin-bottom: 18px;
        }
        .pi-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(28px, 4.5vw, 44px);
          font-weight: 400;
          line-height: 1.18;
          color: var(--pi-text);
          text-wrap: balance;
          margin: 0 0 16px;
          letter-spacing: -0.025em;
        }
        .pi-title em { font-style: italic; color: var(--pi-accent); }
        .pi-sub {
          font-size: 16px;
          color: var(--pi-muted);
          max-width: 460px;
          margin: 0 auto 36px;
          line-height: 1.65;
        }

        /* Toggle mensuel/annuel */
        .pi-toggle-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .pi-toggle-pill {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: var(--pi-surface);
          border: 1px solid var(--pi-border);
          border-radius: 100px;
          padding: 6px 22px;
          cursor: pointer;
          user-select: none;
        }
        .pi-tl {
          font-size: 14px;
          font-weight: 500;
          color: var(--pi-muted);
          transition: color .2s;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .pi-tl.on { color: var(--pi-text); font-weight: 700; }
        .pi-track {
          width: 42px; height: 24px;
          border-radius: 100px;
          background: var(--pi-tog-bg);
          position: relative;
          transition: background .25s;
          flex-shrink: 0;
        }
        .pi-track.on { background: var(--pi-accent); }
        .pi-dot {
          position: absolute;
          top: 3px; left: 3px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--pi-tog-dot);
          box-shadow: 0 1px 4px rgba(0,0,0,.2);
          transition: transform .25s cubic-bezier(.34,1.56,.64,1);
        }
        .pi-track.on .pi-dot { transform: translateX(18px); }
        .pi-save {
          font-size: 11px;
          font-weight: 700;
          color: var(--pi-indigo);
          background: rgba(67,56,202,.10);
          padding: 3px 10px;
          border-radius: 100px;
        }

        /* ─── Grille plans ─── */
        .pi-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .pi-cards { grid-template-columns: 1fr; gap: 16px; } }

        .pi-card {
          border-radius: 20px;
          padding: 44px 36px 48px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 2px 16px rgba(0,0,0,.06);
          transition: box-shadow .2s, transform .2s;
        }
        .pi-card:hover { box-shadow: 0 6px 32px rgba(0,0,0,.1); transform: translateY(-2px); }
        .pi-card.light  { background: var(--pi-surface); border: 1px solid var(--pi-border); }
        .pi-card.accent { background: #E05C52; }
        .pi-card.dark   { background: #1A1A2E; }

        .pi-badge {
          position: absolute;
          top: 22px; right: 22px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #E05C52;
          background: rgba(255,255,255,.96);
          padding: 4px 12px;
          border-radius: 100px;
        }

        .pi-plan-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 6px;
        }
        .pi-plan-label.light  { color: var(--pi-muted); }
        .pi-plan-label.accent { color: rgba(255,255,255,.7); }
        .pi-plan-label.dark   { color: rgba(255,255,255,.45); }

        .pi-tagline { font-size: 15px; font-weight: 500; margin-bottom: 32px; }
        .pi-tagline.light  { color: var(--pi-text); }
        .pi-tagline.accent { color: rgba(255,255,255,.9); }
        .pi-tagline.dark   { color: rgba(255,255,255,.7); }

        .pi-price {
          font-size: clamp(34px, 4vw, 48px);
          font-weight: 800;
          letter-spacing: -0.035em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .pi-price.light  { color: var(--pi-text); }
        .pi-price.accent { color: #fff; }
        .pi-price.dark   { color: #fff; }

        .pi-price sup {
          font-size: 16px; font-weight: 700;
          vertical-align: super; margin-right: 2px;
          opacity: .8;
        }
        .pi-price-unit { font-size: 15px; font-weight: 500; opacity: .65; margin-left: 4px; }

        .pi-period { font-size: 13px; opacity: .55; margin-top: 5px; }
        .pi-period.accent { color: #fff; }
        .pi-period.dark   { color: #fff; }
        .pi-period.light  { color: var(--pi-muted); }

        .pi-chip {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
          padding: 5px 12px; border-radius: 100px;
          margin: 20px 0 28px;
        }
        .pi-chip.light  { background: rgba(224,92,82,.08); color: var(--pi-accent); }
        .pi-chip.accent { background: rgba(255,255,255,.2); color: #fff; }
        .pi-chip.dark   { background: rgba(67,56,202,.3); color: #A5B4FC; }

        .pi-line { height: 1px; margin-bottom: 28px; }
        .pi-line.light  { background: var(--pi-border); }
        .pi-line.accent { background: rgba(255,255,255,.18); }
        .pi-line.dark   { background: rgba(255,255,255,.07); }

        .pi-feats {
          list-style: none; margin: 0 0 auto; padding: 0;
          display: flex; flex-direction: column; gap: 13px;
        }
        .pi-feat {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 14px; line-height: 1.45;
        }
        .pi-feat.light  { color: var(--pi-text); }
        .pi-feat.accent { color: rgba(255,255,255,.92); }
        .pi-feat.dark   { color: rgba(255,255,255,.78); }
        .pi-feat.off.light  { color: var(--pi-muted); }
        .pi-feat.off.accent { color: rgba(255,255,255,.38); }
        .pi-feat.off.dark   { color: rgba(255,255,255,.28); }

        .pi-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 36px;
          padding: 15px 20px;
          border-radius: 10px;
          font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
          border: none; cursor: pointer; width: 100%;
          transition: opacity .18s, transform .18s;
        }
        .pi-btn:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
        .pi-btn:active:not(:disabled) { transform: translateY(0); }
        .pi-btn:disabled { opacity: .55; cursor: not-allowed; }
        .pi-btn.light  { background: #0F1117; color: #fff; }
        .pi-btn.accent { background: #fff; color: #E05C52; }
        .pi-btn.dark   { background: #4338CA; color: #fff; }

        .pi-footnote {
          text-align: center; margin-top: 44px;
          font-size: 13.5px; color: var(--pi-muted); line-height: 1.7;
        }
        .pi-footnote a { color: var(--pi-indigo); font-weight: 500; text-decoration: none; }
        .pi-footnote a:hover { text-decoration: underline; }

        /* ─── Erreur ─── */
        .pi-err {
          max-width: 760px; margin: 0 auto 24px;
          background: rgba(224,92,82,.07);
          border: 1px solid rgba(224,92,82,.22);
          color: #B91C1C; font-size: 14px;
          padding: 12px 18px; border-radius: 10px; text-align: center;
        }

        /* ─── ÉTAPE 2 : Paiement ─── */
        .pi-pay-wrap { max-width: 560px; margin: 0 auto; }

        .pi-back {
          display: inline-flex; align-items: center; gap: 7px;
          background: none; border: none; cursor: pointer;
          color: var(--pi-muted); font-size: 13px; font-weight: 500;
          margin-bottom: 40px; padding: 0;
          transition: color .15s;
        }
        .pi-back:hover { color: var(--pi-text); }

        .pi-recap {
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 28px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }

        .pi-mode-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          margin-bottom: 24px;
        }
        @media (max-width: 480px) { .pi-mode-grid { grid-template-columns: repeat(2, 1fr); } }

        .pi-mode-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 18px 8px; border-radius: 14px; cursor: pointer;
          transition: border-color .15s, background .15s;
        }

        .pi-pay-cta {
          width: 100%; padding: 16px; border: none; border-radius: 12px;
          background: #E05C52; color: #fff;
          font-size: 15px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; transition: opacity .15s;
        }
        .pi-pay-cta:disabled { opacity: .5; cursor: not-allowed; }
        .pi-pay-cta:hover:not(:disabled) { opacity: .9; }

        /* ─── ÉTAPE 3 : En attente ─── */
        .pi-wait-wrap {
          max-width: 520px; margin: 0 auto; text-align: center;
        }
        .pi-wait-icon {
          width: 80px; height: 80px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 32px;
          background: rgba(67,56,202,.09);
        }
        .pi-wait-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(22px, 3.5vw, 30px);
          font-weight: 400; color: var(--pi-text);
          margin: 0 0 12px;
        }
        .pi-wait-sub {
          font-size: 15px; color: var(--pi-muted); line-height: 1.65;
          max-width: 420px; margin: 0 auto 36px;
        }
        .pi-steps-list {
          list-style: none; padding: 0; margin: 0 0 36px; text-align: left;
          display: flex; flex-direction: column; gap: 16px;
        }
        .pi-steps-item {
          display: flex; align-items: flex-start; gap: 14px;
          background: var(--pi-surface);
          border: 1px solid var(--pi-border);
          border-radius: 12px; padding: 16px 20px;
        }
        .pi-steps-num {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: var(--pi-indigo); color: #fff;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .pi-steps-text { font-size: 14px; color: var(--pi-text); line-height: 1.5; }
        .pi-steps-text span { display: block; font-size: 12px; color: var(--pi-muted); margin-top: 2px; }

        .pi-wait-plan {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--pi-surface); border: 1px solid var(--pi-border);
          border-radius: 12px; padding: 14px 24px; margin-bottom: 28px;
          font-size: 14px; color: var(--pi-text); font-weight: 500;
        }
        .pi-wait-plan strong { color: var(--pi-accent); }

        .pi-wait-contact {
          font-size: 13.5px; color: var(--pi-muted); margin-bottom: 28px;
        }
        .pi-wait-contact a { color: var(--pi-indigo); font-weight: 500; text-decoration: none; }
        .pi-wait-contact a:hover { text-decoration: underline; }
      `}</style>

      {/* ── Barre de navigation ── */}
      <div className="pi-topbar">
        <KerConnectLogo width={120} />
        <span className="pi-step-pill">
          {step === 'choose' && <>Étape <strong>2</strong> / 2 · Choisissez votre forfait</>}
          {step === 'pay'    && <>Étape <strong>2</strong> / 2 · Paiement {selectedPlan?.name}</>}
          {step === 'waiting' && <>Demande soumise · En attente de confirmation</>}
        </span>
        <button className="pi-logout-btn" onClick={handleLogout}>Se déconnecter</button>
      </div>

      <div className="pi-wrap">

        {/* ══════════════════════════════════════
            ÉTAPE 1 — Sélection du forfait
        ══════════════════════════════════════ */}
        {step === 'choose' && (<>
          <div className="pi-hero">
            <span className="pi-eyebrow">Activation du compte</span>
            <h1 className="pi-title">
              Choisissez le forfait qui<br />
              correspond à <em>votre activité</em>
            </h1>
            <p className="pi-sub">
              Commencez gratuitement ou choisissez un forfait payant pour une commission réduite et plus d&apos;annonces.
            </p>

            <div className="pi-toggle-row">
              <button className="pi-toggle-pill" onClick={() => setAnnuel(v => !v)} aria-pressed={annuel}>
                <span className={`pi-tl ${!annuel ? 'on' : ''}`}>Mensuel</span>
                <div className={`pi-track ${annuel ? 'on' : ''}`}><div className="pi-dot" /></div>
                <span className={`pi-tl ${annuel ? 'on' : ''}`}>Annuel</span>
              </button>
              {annuel && <span className="pi-save">Économisez 17 %</span>}
            </div>
          </div>

          {error && <p className="pi-err">{error}</p>}

          <div className="pi-cards">
            {PLANS.map(plan => {
              const v          = plan.variant
              const isLoading  = loadingPlan === plan.id
              const isDisabled = loadingPlan !== null
              const checkColor = v === 'light' ? '#10B981' : '#FFFFFF'
              const displayPrice = plan.monthlyPrice === 0
                ? null
                : annuel ? plan.annualPrice : plan.monthlyPrice

              return (
                <div key={plan.id} className={`pi-card ${v}`}>
                  {plan.badge && <span className="pi-badge">{plan.badge}</span>}

                  <p className={`pi-plan-label ${v}`}>{plan.name}</p>
                  <p className={`pi-tagline ${v}`}>{plan.tagline}</p>

                  {/* Prix */}
                  <div>
                    {displayPrice === null ? (
                      <p className={`pi-price ${v}`}>Gratuit</p>
                    ) : (
                      <p className={`pi-price ${v}`}>
                        {displayPrice.toLocaleString('fr-FR')}
                        <span className="pi-price-unit">FCFA</span>
                      </p>
                    )}
                    {displayPrice !== null && (
                      <p className={`pi-period ${v}`}>{annuel ? 'par an' : 'par mois'}</p>
                    )}
                  </div>

                  {/* Commission chip */}
                  <span className={`pi-chip ${v}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 10L10 2M3.5 3h-1.5v1.5M8.5 9H10V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Commission {plan.commission}%
                  </span>

                  <div className={`pi-line ${v}`} />

                  {/* Features */}
                  <ul className="pi-feats">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`pi-feat ${v} ${!f.ok ? 'off' : ''}`}>
                        <span style={{ marginTop: 2, flexShrink: 0 }}>
                          {f.ok ? <IconCheck color={checkColor} /> : <IconCross light={v !== 'light'} />}
                        </span>
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <button className={`pi-btn ${v}`} onClick={() => handleSelect(plan)} disabled={isDisabled}>
                    {isLoading ? <><Spinner /> Activation…</> : plan.cta}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="pi-footnote">
            Forfait modifiable à tout moment · Starter toujours gratuit<br />
            Des questions ? <a href="/contact">Contactez notre équipe</a>.
          </p>
        </>)}

        {/* ══════════════════════════════════════
            ÉTAPE 2 — Paiement
        ══════════════════════════════════════ */}
        {step === 'pay' && selectedPlan && (
          <div className="pi-pay-wrap">

            <button className="pi-back" onClick={() => { setStep('choose'); setError('') }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M11 14L7 9l4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Retour aux forfaits
            </button>

            {/* Récap plan */}
            <div className="pi-recap" style={{
              background: selectedPlan.variant === 'accent' ? '#E05C52' : selectedPlan.variant === 'dark' ? '#1A1A2E' : 'var(--pi-surface)',
              border: selectedPlan.variant === 'light' ? '1px solid var(--pi-border)' : 'none',
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
                  color: selectedPlan.variant === 'light' ? 'var(--pi-muted)' : 'rgba(255,255,255,.55)' }}>
                  Forfait sélectionné
                </p>
                <p style={{ fontSize: 24, fontWeight: 800, marginBottom: 4,
                  color: selectedPlan.variant === 'light' ? 'var(--pi-text)' : '#fff' }}>
                  {selectedPlan.name}
                </p>
                <p style={{ fontSize: 13, color: selectedPlan.variant === 'light' ? 'var(--pi-muted)' : 'rgba(255,255,255,.6)' }}>
                  Commission {selectedPlan.commission}% · {selectedPlan.tagline}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
                  color: selectedPlan.variant === 'light' ? 'var(--pi-accent)' : '#fff' }}>
                  {(annuel ? selectedPlan.annualPrice : selectedPlan.monthlyPrice).toLocaleString('fr-FR')}
                  <span style={{ fontSize: 15, fontWeight: 500, marginLeft: 5, opacity: .65 }}>FCFA</span>
                </p>
                <p style={{ fontSize: 12, opacity: .55,
                  color: selectedPlan.variant === 'light' ? 'var(--pi-muted)' : '#fff' }}>
                  {annuel ? 'par an' : 'par mois'}
                </p>
              </div>
            </div>

            {/* Modes de paiement */}
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--pi-text)', marginBottom: 14 }}>
              Choisissez votre mode de paiement
            </p>
            <div className="pi-mode-grid">
              {PAYMENT_MODES.map(m => (
                <button key={m.id} type="button" className="pi-mode-btn" onClick={() => setPayMode(m.id)}
                  style={{
                    border: `2px solid ${payMode === m.id ? '#E05C52' : 'var(--pi-border)'}`,
                    background: payMode === m.id ? 'rgba(224,92,82,.06)' : 'var(--pi-surface)',
                  }}>
                  <span style={{ fontSize: 26 }}>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pi-text)' }}>{m.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--pi-muted)' }}>{m.desc}</span>
                </button>
              ))}
            </div>

            {error && <p className="pi-err" style={{ marginBottom: 18 }}>{error}</p>}

            <button className="pi-pay-cta" onClick={handlePay} disabled={!payMode || loading}>
              {loading
                ? <><Spinner /> Envoi de la demande…</>
                : `Confirmer · ${(annuel ? selectedPlan.annualPrice : selectedPlan.monthlyPrice).toLocaleString('fr-FR')} FCFA`
              }
            </button>

            <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--pi-muted)', marginTop: 16, lineHeight: 1.6 }}>
              🔒 Votre paiement sera vérifié par notre équipe avant activation du compte.
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════
            ÉTAPE 3 — En attente de confirmation
        ══════════════════════════════════════ */}
        {step === 'waiting' && (
          <div className="pi-wait-wrap">
            {/* Icône */}
            <div className="pi-wait-icon">
              <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden>
                <circle cx="19" cy="19" r="18" stroke="#4338CA" strokeWidth="2" strokeOpacity=".3"/>
                <path d="M19 9v10l6 4" stroke="#4338CA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="19" cy="19" r="2.5" fill="#4338CA"/>
              </svg>
            </div>

            <h1 className="pi-wait-title">Demande transmise avec succès</h1>
            <p className="pi-wait-sub">
              Nous avons bien reçu votre demande d&apos;activation du forfait <strong style={{ color: 'var(--pi-accent)' }}>{FORFAIT_LABELS[waitingForfait] ?? waitingForfait}</strong>.
              Notre équipe va vérifier votre paiement et activer votre compte.
            </p>

            {/* Étapes suivantes */}
            <ul className="pi-steps-list">
              <li className="pi-steps-item">
                <div className="pi-steps-num">1</div>
                <div className="pi-steps-text">
                  Notre équipe vérifie votre paiement
                  <span>Sous 24 heures ouvrées</span>
                </div>
              </li>
              <li className="pi-steps-item">
                <div className="pi-steps-num">2</div>
                <div className="pi-steps-text">
                  Vous recevez un email de confirmation
                  <span>Avec le lien pour accéder à votre espace bailleur</span>
                </div>
              </li>
              <li className="pi-steps-item">
                <div className="pi-steps-num">3</div>
                <div className="pi-steps-text">
                  Vous accédez à la plateforme
                  <span>Publiez vos annonces et gérez vos contrats</span>
                </div>
              </li>
            </ul>

            {/* Forfait recap */}
            <div className="pi-wait-plan">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <rect x="1" y="3" width="16" height="12" rx="3" stroke="#10B981" strokeWidth="1.6"/>
                <path d="M5 9l3 3 5-5" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Forfait <strong>{FORFAIT_LABELS[waitingForfait] ?? waitingForfait}</strong> · Demande enregistrée
            </div>

            <p className="pi-wait-contact">
              Des questions ? Écrivez-nous à{' '}
              <a href="mailto:contact@naratechvision.com">contact@naratechvision.com</a>
            </p>

            <button className="pi-logout-btn" onClick={handleLogout} style={{ display: 'block', margin: '0 auto' }}>
              Se déconnecter
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
