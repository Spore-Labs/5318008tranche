import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SocialLinks from './SocialLinks'

const intelligenceMockingWords = [
  "idiot", "dumb-dumb", "bonehead", "knucklehead", "doofus",
  "meathead", "dimwit", "simpleton", "airhead", "peabrain",
  "Einstein", "brainiac", "genius", "smartypants", "mastermind",
  "Sherlock", "wise guy", "whiz kid", "big brain", "professor", "egghead"
];

const Footer: React.FC = () => {
  const randomWord = useMemo(() => {
    return intelligenceMockingWords[Math.floor(Math.random() * intelligenceMockingWords.length)];
  }, []);

  return (
    <footer className="border-t border-primary-light dark:border-primary-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark p-4 shadow-soft">
      <div className="container mx-auto flex flex-col xs:items-center sm:items-center md:flex-row md:justify-between md:items-center">
        <div className="flex items-center hidden md:block">
          <Link href="https://5318008.io" target="_blank" rel="noopener noreferrer" className="flex items-center">
            <Image src="/logo.svg" alt="Project Logo" width={40} height={40} />
            <span className="ml-2 font-technology text-3xl text-text-light dark:text-text-dark">5318008</span>
          </Link>
        </div>
        <div className="text-center text-text-light dark:text-text-dark hidden md:block">
          Flip your screen upside down, {randomWord}.
        </div>
        <div className="w-full xs:w-auto sm:w-auto md:w-auto">
          <SocialLinks />
        </div>
      </div>
    </footer>
  )
}

export default Footer
