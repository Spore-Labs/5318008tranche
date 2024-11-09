import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add CSP headers with updated frame-ancestors
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      font-src 'self';
      connect-src *;
      frame-src 'self' https://*.walletconnect.org https://*.walletconnect.com;
      frame-ancestors 
        'self' 
        http://localhost:* 
        https://*.pages.dev 
        https://*.vercel.app 
        https://*.ngrok-free.app 
        https://secure-mobile.walletconnect.com 
        https://secure-mobile.walletconnect.org 
        https://secure.walletconnect.org;
      media-src 'none';
    `.replace(/\s+/g, ' ').trim()
  )

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