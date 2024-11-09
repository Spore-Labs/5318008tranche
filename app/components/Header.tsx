'use client'
import React, { useEffect } from 'react'
import Image from 'next/image'
import RebaseButton from './RebaseButton'
import { SwitchTheme } from './SwitchTheme'
import Link from 'next/link'
import { useAccount } from 'wagmi'

const Header: React.FC = () => {
  const { isConnected, isConnecting } = useAccount()

  useEffect(() => {
    // Reset any stuck states when connection status changes
    const element = document.querySelector('.w3m-connecting')
    if (element && !isConnecting) {
      element.classList.remove('w3m-connecting')
    }
  }, [isConnected, isConnecting])

  return (
    <header className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark p-4 shadow-soft border-b border-primary-light dark:border-primary-dark">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="https://5318008.io" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <Image src="/logo.svg" alt="Project Logo" width={50} height={50} />
            <span className="ml-2 text-text-light dark:text-text-dark text-xl font-bold hidden md:block">$BOOB Progressive Liquidity Dashboard</span>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <RebaseButton />
        </div>
        <div className="flex items-center space-x-0 xs:space-x-4">
          <SwitchTheme />
          <div className="w3m-button-wrapper" data-connected={isConnected}>
            <w3m-button />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
