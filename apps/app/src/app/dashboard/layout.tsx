'use client'

import { Button, LoadingPage } from '@test-pod/ui'
import { useAuth } from '@test-pod/auth-shared'
import Link from 'next/link'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Home, Calendar, Ticket, User } from 'lucide-react'
import { navItems } from './nav-items'

interface AppLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className='flex flex-col min-h-screen bg-background'>
      {/* Header - Desktop e Mobile */}
      <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur'>
        <div className='container flex h-16 items-center justify-between'>
          <Link href='/dashboard' className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary'>
              <Home className='h-5 w-5 text-white' />
            </div>
            <span className='font-bold'>Portal do Usuário</span>
          </Link>

          {/* Menu de navegação - apenas desktop */}
          <nav className='hidden md:flex items-center space-x-4'>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.icon === 'Calendar' && <Calendar className='h-4 w-4' />}
                {item.icon === 'Ticket' && <Ticket className='h-4 w-4' />}
                {item.icon === 'User' && <User className='h-4 w-4' />}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>

          {/* Perfil do usuário e botão de logout */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium'>
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className='hidden md:block'>
                <p className='text-sm font-medium'>{user?.name || user?.email}</p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => logout(`${process.env.NEXT_PUBLIC_AUTH_URL}/login`)}
              >
                <LogOut className='h-5 w-5' />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='flex flex-col flex-1'>
        <main className='container py-8 pb-24 md:pb-8'>{children}</main>

        <footer className='border-t border-border py-6 bg-card mt-auto'>
          <div className='container'>
            <div className='flex flex-col md:flex-row items-center justify-center gap-4'>
              <p className='text-sm text-muted-foreground'>&copy; {new Date().getFullYear()}</p>
            </div>
          </div>
        </footer>

        <nav className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border'>
          <div className='flex items-center justify-around h-16'>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full py-2 ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.icon === 'Calendar' && <Calendar className='h-5 w-5 mb-1' />}
                {item.icon === 'Ticket' && <Ticket className='h-5 w-5 mb-1' />}
                {item.icon === 'User' && <User className='h-5 w-5 mb-1' />}
                <span className='text-xs font-medium'>{item.title}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
