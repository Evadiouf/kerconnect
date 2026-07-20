import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DASHBOARD: Record<string, string> = {
  client:       '/client/dashboard',
  bailleur:     '/bailleur/dashboard',
  proprietaire: '/bailleur/dashboard',
  admin:        '/admin/dashboard',
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has('kc_auth')

  const isProtectedRoute =
    pathname.startsWith('/client') ||
    pathname.startsWith('/bailleur') ||
    pathname.startsWith('/admin')

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Ne rediriger vers dashboard que si l'URL ne contient pas ?logout ou ?expired
  const isAuthRoute =
    pathname === '/auth/login' || pathname === '/auth/register'
  const isForced = request.nextUrl.searchParams.has('logout') ||
                   request.nextUrl.searchParams.has('expired')

  if (isAuthRoute && isAuthenticated && !isForced) {
    const role = request.cookies.get('kc_role')?.value ?? ''
    const dest = DASHBOARD[role] ?? '/client/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/client/:path*',
    '/bailleur/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
}
