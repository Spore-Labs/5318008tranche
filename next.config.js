/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: `
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
              `.replace(/\s+/g, ' ').trim(),
            },
          ],
        },
      ]
    },
  }
  
  module.exports = nextConfig