'use client'

import { Button, LoadingPage } from '@test-pod/ui'
import { useAuth } from '@test-pod/auth-shared'
import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className='flex h-screen w-full flex-col bg-background overflow-hidden'>
      {/* Header */}
      <header className='flex h-16 items-center border-b border-border px-6'>
        <Link href='/dashboard' className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-5 w-5 text-white'
            >
              <path d='M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z' />
              <path d='m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9' />
              <path d='M12 3v6' />
            </svg>
          </div>
          <span className='font-bold'>Auth App</span>
        </Link>
        <h1 className='ml-6 text-xl font-semibold'>{title}</h1>
        <div className='ml-auto flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium'>
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className='hidden md:block'>
              <p className='text-sm font-medium'>{user.name || user.email}</p>
              <p className='text-xs text-muted-foreground'>Conta</p>
            </div>
            <Button variant='ghost' size='icon' onClick={() => logout()}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5'
              >
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                <polyline points='16 17 21 12 16 7' />
                <line x1='21' y1='12' x2='9' y2='12' />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className='flex-1 overflow-y-auto p-6'>{children}</main>

      {/* Footer */}
      <footer className='border-t border-border p-4 text-center text-sm text-muted-foreground'>
        &copy; {new Date().getFullYear()} Auth App. Todos os direitos reservados.
      </footer>
    </div>
  )
}
