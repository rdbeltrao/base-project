'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useTranslation } from '@test-pod/translation/client'

// Define the app-specific locale loader for site, can be moved to a shared util within the app
const siteLocaleLoader = (language, namespace) => {
  // Path is relative to where this component is eventually bundled/served from.
  // For components in apps/site/src/app/components, and locales in apps/site/src/locales
  // this relative path needs to correctly point to apps/site/src/locales
  // This might be tricky. A safer bet is to ensure loader is passed if resolution is complex.
  // Let's assume for now it's called from a context where `../locales` (from where client.js is) works,
  // or the bundler resolves this correctly.
  // A more robust way is to pass the loader from the page component.
  // For this example, we'll assume it resolves from where client.js is, which means it will try to load
  // `packages/translation/locales` and `apps/site/locales` if client.js is appropriately configured.
  // The loader passed to useTranslation in the page component is the one that truly matters for page-level data.
  // For components, if they call useTranslation themselves, they need their own loader or context.

  // Simplification: For components, we might only use 'common' ns or expect loader from props/context.
  // Let's assume the loader provided at page level covers namespaces used here.
  // If Header uses its own useTranslation, it needs its own loader prop.
  // The HomePage passes lng, so we can use it.
  return import(`../../locales/${language}/${namespace}.json`);
};


export default function Header({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, ['site', 'common'], undefined, siteLocaleLoader);
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className='bg-white shadow-sm sticky top-0 z-50'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <Link href={`/${lng}/`} className='text-2xl font-bold text-primary'>
              {t('home.header.home', { ns: 'site', defaultValue: 'Eventos' })}
            </Link>
          </div>

          <div className='hidden md:block space-x-2'>
            {/* Example: Login link - text could be from common or site namespace */}
            <a // Changed to <a> if it's an external URL, Link for internal
              href={process.env.NEXT_PUBLIC_AUTH_URL || '#'}
              className='bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md transition-colors'
            >
              {t('login', { ns: 'common', defaultValue: 'Login' })} {/* Assuming 'login' key in common.json */}
            </a>
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
          </div>
        )}
      </div>
    </header>
  )
}
