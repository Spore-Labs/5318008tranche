import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { headers } from 'next/headers'
import ContextProvider from '../context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '5318008 Tranches',
  description: 'Buy BOOB Tranches'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookies = headers().get('cookie')

  return (
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider cookies={cookies}>
          {children}
          <Toaster />
        </ContextProvider>
      </body>
    </html>
  )
}