'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import GoogleLoginButton from './GoogleLoginButton'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className='bg-white shadow-sm sticky top-0 z-50'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <Link href='/' className='text-2xl font-bold text-primary'>
              Eventos
            </Link>
          </div>

          <div className='hidden md:block space-x-2'>
            <Link
              href={process.env.NEXT_PUBLIC_AUTH_URL || '#'}
              className='bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors'
            >
              Entrar
            </Link>
            <GoogleLoginButton className="inline-block" />
          </div>

          <div className='md:hidden'>
            <button
              onClick={toggleMenu}
              className='text-gray-700 hover:text-primary focus:outline-none'
              aria-label='Toggle menu'
            >
              {isMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className='md:hidden mt-4 pb-4 flex flex-col space-y-2 items-center'>
            <Link
              href={process.env.NEXT_PUBLIC_AUTH_URL || '#'}
              className='bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors w-full text-center'
              onClick={() => setIsMenuOpen(false)}
            >
              Entrar
            </Link>
            <GoogleLoginButton className="w-full" />
          </div>
        )}
      </div>
    </header>
  )
}
