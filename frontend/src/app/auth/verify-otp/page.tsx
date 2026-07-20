'use client'

import { useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { KerConnectLogo } from '@/components/ui/Logo'
import api from '@/lib/api'

function VerifyOtpForm() {
  const params  = useSearchParams()
  const router  = useRouter()
  const email   = params.get('email') || ''
  const type    = params.get('type') || 'verification'
  const [otp, setOtp]     = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading]       = useState(false)
  const [resent, setResent]         = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown]     = useState(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 3) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const verify = async () => {
    const code = otp.join('')
    if (code.length < 4) { setError('Saisissez les 4 chiffres.'); return }
    setLoading(true); setError('')
    try {
      await api.post('/v1/auth/verify-otp', { email, code, type })
      if (type === 'verification') router.push('/auth/login?verified=1')
      else router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Code invalide.')
    } finally { setLoading(false) }
  }

  const resend = async () => {
    if (cooldown > 0 || resendLoading) return
    setResendLoading(true)
    try {
      await api.post('/v1/auth/resend-otp', { email, type })
      setResent(true)
      setTimeout(() => setResent(false), 5000)
      setCooldown(60)
      const interval = setInterval(() => {
        setCooldown(c => { if (c <= 1) { clearInterval(interval); return 0 } return c - 1 })
      }, 1000)
    } catch { setError('Erreur lors du renvoi.') }
    finally { setResendLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <KerConnectLogo width={130} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Code de vérification</h2>
        <p className="text-gray-500 mb-8">
          Saisissez le code à 4 chiffres envoyé à <strong>{email}</strong>
        </p>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
        {resent && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">Nouveau code envoyé.</div>}

        <div className="flex gap-4 justify-center mb-8">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#E05C52] focus:ring-0 outline-none transition-colors"
            />
          ))}
        </div>

        <button
          onClick={verify}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mb-4"
          style={{ backgroundColor: '#E05C52' }}
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </button>

        <button
          onClick={resend}
          disabled={cooldown > 0 || resendLoading}
          className="w-full text-center text-sm hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: '#E05C52' }}
        >
          {resendLoading ? 'Envoi...' : cooldown > 0 ? `Renvoyer dans ${cooldown}s` : 'Vous n\'avez pas reçu de code ? Renvoyer'}
        </button>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#E05C52] border-t-transparent rounded-full" /></div>}>
      <VerifyOtpForm />
    </Suspense>
  )
}
