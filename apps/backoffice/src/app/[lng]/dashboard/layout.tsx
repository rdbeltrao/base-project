'use client'

import { Button, LoadingPage } from '@test-pod/ui'
import { useAuth } from '@test-pod/auth-shared'
import Link from 'next/link'
import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Briefcase, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { navItems, NavItem } from '../../../lib/menu-items'
import { IconRenderer } from '@test-pod/ui'

interface AdminLayoutProps {
  children: ReactNode;
  params: { lng: string };
}

export default function DashboardLayout({ children, params }: AdminLayoutProps) {
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, logout, hasPermissions } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className='flex h-screen w-full bg-background overflow-hidden'>
      <aside
        className={`bg-card border-r border-border transition-all duration-300 ${
          isSidebarCollapsed ? 'w-[70px]' : 'w-64'
        }`}
      >
        <div className='flex h-16 items-center border-b border-border px-4'>
          <Link href={`/${params.lng}/dashboard`} className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary'>
              <Briefcase className='h-5 w-5 text-white' />
            </div>
            {!isSidebarCollapsed && <span className='font-bold'>Admin</span>}
          </Link>
          <Button
            variant='ghost'
            size='icon'
            className='ml-auto'
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className='h-5 w-5' />
            ) : (
              <ChevronLeft className='h-5 w-5' />
            )}
          </Button>
        </div>
        <nav className='p-2'>
          <div className='space-y-1'>
            {navItems.map((item: NavItem) => {
              const hasPermission = hasPermissions(item.permissions || [])
              if (!hasPermission) {
                return null
              }
              return (
                <Link
                  key={item.href}
                  href={`/${params.lng}${item.href}`}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === `/${params.lng}${item.href}`
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <IconRenderer name={item.icon} />
                  {!isSidebarCollapsed && <span>{item.title}</span>}
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>

      <div className='flex flex-1 flex-col overflow-hidden'>
        <header className='flex h-16 items-center border-b border-border px-6'>
          <div className='ml-auto flex items-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              className='text-muted-foreground'
              onClick={() =>
                (window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL}/dashboard`)
              }
            >
              <User className='h-5 w-5' />
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
                <LogOut className='h-5 w-5' />
              </Button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className='flex-1 overflow-y-auto p-6'>{children}</main>

        {/* Footer */}
        <footer className='border-t border-border p-4 text-center text-sm text-muted-foreground'>
          &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}
