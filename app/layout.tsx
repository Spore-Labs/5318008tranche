import type { Metadata } from 'next'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { headers } from 'next/headers'
import ContextProvider from '../context'
import Footer from './components/Footer'
import Header from './components/Header'
import { Providers } from './providers'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '5318008 Dashboard',
  description: 'Dashboard for $BOOB Tranches',
  icons: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicon.svg',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
  ],
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const cookies = headersList.get('cookie')

  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} h-full flex flex-col`} suppressHydrationWarning>
        <Providers>
          <ContextProvider cookies={cookies}>
            <Header />
            <main className="flex-1 overflow-y-auto py-4 px-2">
              <div className="container mx-auto h-full">
                {children}
              </div>
            </main>
            <Footer />
            <Toaster />
          </ContextProvider>
        </Providers>
      </body>
    </html>
  )
}
