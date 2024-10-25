'use client'
import React from 'react'
import Image from 'next/image'
import RebaseButton from './RebaseButton'
import { SwitchTheme } from './SwitchTheme'
import { useChainId, useAccount, useBlockNumber } from 'wagmi'
import { getContractAddress } from '../utils/contractUtils'
import Link from 'next/link'

const Header: React.FC = () => {
  const chainId = useChainId()
  const { isConnected } = useAccount()
  const { data: blockNumber } = useBlockNumber()
  const contractAddress = getContractAddress(chainId)

  return (
    <header className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark  p-4 shadow-soft border-b border-primary-light dark:border-primary-dark">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="https://5318008.io" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <Image src="/logo.svg" alt="Project Logo" width={50} height={50} />
            <span className="ml-2 text-text-light dark:text-text-dark text-xl font-bold">$BOOB Progressive Liquidity System</span>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <RebaseButton />
        </div>
        <div className="flex items-center space-x-4">
          <SwitchTheme />
          <div className="w3m-button-wrapper">
            <w3m-button />
          </div >
        </div>
      </div>
    </header>
  )
}

export default Header
