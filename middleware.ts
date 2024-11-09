import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CSP headers
  response.headers.set(
    'Content-Security-Policy',
    `
      frame-ancestors 
        'self' 
        http://localhost:* 
        https://*.pages.dev 
        https://*.vercel.app 
        https://*.ngrok-free.app 
        https://secure-mobile.walletconnect.com 
        https://secure-mobile.walletconnect.org 
        https://secure.walletconnect.org;
    `.replace(/\s+/g, ' ').trim()
  )

  // Add other security headers
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}

// Specify which paths should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}