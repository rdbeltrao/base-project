export interface NavItem {
  title: string
  href: string
  permissions?: string[]
  icon: string
}

export const navItems: NavItem[] = [
  {
    title: 'Meu Perfil',
    href: '/dashboard',
    icon: 'User',
  },
]
