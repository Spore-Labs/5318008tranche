'use client'

import { wagmiAdapter, projectId } from '../config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, sepolia } from '@reown/appkit/networks'
import React, { type ReactNode, useEffect } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { ThemeProvider } from 'next-themes'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: '5318008 Dashboard',
  description: 'Dashboard for $BOOB Tranches',
  url: 'https://dashboard.5318008.io', 
  icons: ['/favicon.svg']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, sepolia],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true
  },
  themeMode: 'light', // You can change this to 'dark' if you prefer
  themeVariables: {
    '--w3m-accent': '#a7488f',
  }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  useEffect(() => {
    const unsubscribe = wagmiAdapter.wagmiConfig.subscribe(
      (state) => state.status,
      (status) => {
        if (status === 'connected') {
          queryClient.invalidateQueries()
        } else if (status === 'disconnected') {
          queryClient.clear()
        }
      }
    )

    return () => {
      unsubscribe?.()
    }
  }, [])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
