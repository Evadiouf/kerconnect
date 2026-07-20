'use client'

import Link from 'next/link'

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6">
        <svg
          className="mx-auto"
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
        >
          <circle cx="28" cy="28" r="28" fill="#FEF2F2" />
          <path
            d="M28 18v14M28 36v2"
            stroke="#E05C52"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-gray-400 max-w-sm">
        {error?.message || 'Quelque chose s\'est mal passé. Veuillez réessayer.'}
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="px-8 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#E05C52' }}
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="px-8 py-3 rounded-xl text-gray-700 text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Accueil
        </Link>
      </div>
    </div>
  )
}
