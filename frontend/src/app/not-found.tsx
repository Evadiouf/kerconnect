import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-10">
        <Image src="/logo.png" alt="KerConnect" width={150} height={52} style={{ height: 'auto' }} />
      </div>

      <p className="text-8xl font-extrabold text-gray-100 select-none leading-none">
        404
      </p>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Page introuvable
      </h1>
      <p className="mt-2 text-sm text-gray-400 max-w-xs">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>

      <Link
        href="/"
        className="mt-8 inline-block px-8 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        style={{ backgroundColor: '#E05C52' }}
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
