'use client'

import React from 'react'
import Image from 'next/image'
import RebaseButton from './RebaseButton'
import { SwitchTheme } from './SwitchTheme'
import Link from 'next/link'

const Header: React.FC = () => {

  return (
    <header className="
      bg-background-light dark:bg-background-dark 
      text-text-light dark:text-text-dark 
      shadow-soft border-b border-primary-light dark:border-primary-dark 
      p-4 md:p-4
      fixed xs:relative top-0 w-full z-50
    ">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="https://5318008.io" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="Project Logo" 
              width={30} 
              height={30} 
              className="w-[30px] h-[30px] xs:w-[50px] xs:h-[50px] md:w-[50px] md:h-[50px]" 
            />
            <span className="ml-2 text-text-light dark:text-text-dark text-2xl xs:text-4xl hidden font-technology md:block">
              $BOOB Dashboard
            </span>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <RebaseButton />
        </div>
        <div className="flex items-center space-x-0 xs:space-x-4">
          <SwitchTheme />
          <div className="w3m-button-wrapper">
            <w3m-button />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
