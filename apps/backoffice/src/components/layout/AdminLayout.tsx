import { Button, LoadingPage } from '@test-pod/ui'
import { useAuth } from '@test-pod/auth-shared'
import Link from 'next/link'
import { ReactNode, useState } from 'react'

interface AdminLayoutProps {
  children: ReactNode
  title: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: (
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
          <rect width='7' height='9' x='3' y='3' rx='1' />
          <rect width='7' height='5' x='14' y='3' rx='1' />
          <rect width='7' height='9' x='14' y='12' rx='1' />
          <rect width='7' height='5' x='3' y='16' rx='1' />
        </svg>
      ),
    },
  ]

  return (
    <div className='flex h-screen w-full bg-background overflow-hidden'>
      {/* Sidebar */}
      <aside
        className={`bg-card border-r border-border transition-all duration-300 ${isSidebarCollapsed ? 'w-[70px]' : 'w-64'}`}
      >
        <div className='flex h-16 items-center border-b border-border px-4'>
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
            {!isSidebarCollapsed && <span className='font-bold'>Admin</span>}
          </Link>
          <Button
            variant='ghost'
            size='icon'
            className='ml-auto'
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
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
              {isSidebarCollapsed ? (
                <>
                  <path d='m9 18 6-6-6-6' />
                </>
              ) : (
                <>
                  <path d='m15 18-6-6 6-6' />
                </>
              )}
            </svg>
          </Button>
        </div>
        <nav className='p-2'>
          <div className='space-y-1'>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {item.icon}
                {!isSidebarCollapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <header className='flex h-16 items-center border-b border-border px-6'>
          <h1 className='text-xl font-semibold'>{title}</h1>
          <div className='ml-auto flex items-center gap-4'>
            <Button variant='ghost' size='icon' className='text-muted-foreground'>
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
                <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                <circle cx='12' cy='7' r='4' />
              </svg>
            </Button>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium'>
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className='hidden md:block'>
                <p className='text-sm font-medium'>{user.name || user.email}</p>
                <p className='text-xs text-muted-foreground'>Administrador</p>
              </div>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => logout(`${process.env.NEXT_PUBLIC_AUTH_URL}/login`)}
              >
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
          &copy; {new Date().getFullYear()} Painel Administrativo. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
