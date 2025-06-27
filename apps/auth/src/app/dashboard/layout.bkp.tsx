'use client'

import { Button, LoadingPage } from '@test-pod/ui'
import { useAuth } from '@test-pod/auth-shared'
import Link from 'next/link'
import { ReactNode } from 'react'
import { Briefcase, LogOut } from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className='flex h-screen w-full flex-col bg-background overflow-hidden'>
      <header className='flex h-16 items-center border-b border-border px-6'>
        <Link href='/dashboard' className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary'>
            <Briefcase className='h-5 w-5 text-white' />
          </div>
          <span className='font-bold'>Auth App</span>
        </Link>
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
              <LogOut className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </header>

      <main className='flex-1 overflow-y-auto p-6'>{children}</main>

      <footer className='border-t border-border p-4 text-center text-sm text-muted-foreground'>
        &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
