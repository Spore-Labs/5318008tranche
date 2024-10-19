import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { headers } from 'next/headers'
import ContextProvider from '../context'
import Footer from './components/Footer'
import Header from './components/Header'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '5318008 Tranches',
  description: 'Buy $BOOB Tranches'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const cookies = headers().get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen bg-content-light dark:bg-content-dark text-text-light dark:text-text-dark`}>
        <Providers>
          <ContextProvider cookies={cookies}>
            <Header />
            <main className="flex-grow bg-content-light dark:bg-content-dark p-8">
              <div className="container mx-auto">
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
