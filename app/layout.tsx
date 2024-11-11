import type { Metadata } from 'next'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { headers } from 'next/headers'
import ContextProvider from '../context'
import Footer from './components/Footer'
import Header from './components/Header'
import { Providers } from './providers'

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
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-content-light dark:bg-content-dark text-text-light dark:text-text-dark">
        <Providers>
          <ContextProvider cookies={cookies}>
            <Header />
            <main className="flex-grow bg-content-light dark:bg-content-dark p-2 xs:p-4 overflow-y-auto mt-[48px] xs:mt-[72px] md:mt-0 mb-[48px] xs:mb-[72px]">
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
