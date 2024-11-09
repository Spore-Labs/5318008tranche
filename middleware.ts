import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https: blob:;
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
    `.replace(/\s+/g, ' ').trim()
  )

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}