import { LayoutDashboard, Users } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  permissions?: string[]
  icon: React.ReactNode
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className='h-5 w-5' />,
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    permissions: ['user.manage'],
    icon: <Users className='h-5 w-5' />,
  },
]
