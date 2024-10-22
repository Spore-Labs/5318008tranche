import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SocialLinks from './SocialLinks'

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-primary-light dark:border-primary-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark p-4 shadow-soft">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="https://5318008.io" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <Image src="/logo.svg" alt="Project Logo" width={40} height={40} />
            <span className="ml-2 font-technology text-3xl text-text-light dark:text-text-dark">5318008</span>
          </Link>
        </div>
        <div className="text-center text-text-light dark:text-text-dark">
          Flip your screen upside down, genius.
        </div>
        <SocialLinks />
      </div>
    </footer>
  )
}

export default Footer
