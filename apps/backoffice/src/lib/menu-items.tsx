export interface NavItem {
  title: string
  href: string
  permissions?: string[]
  icon: string
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Events',
    href: '/dashboard/events',
    permissions: ['event.manage'],
    icon: 'Calendar',
  },
  {
    title: 'Users',
    href: '/dashboard/users',
    permissions: ['user.manage'],
    icon: 'Users',
  },
  {
    title: 'Roles',
    href: '/dashboard/roles',
    permissions: ['role.manage'],
    icon: 'Shield',
  },
]
