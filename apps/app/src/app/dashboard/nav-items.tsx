export interface NavItem {
  title: string
  href: string
  permissions?: string[]
  icon: string
}

export const navItems: NavItem[] = [
  {
    title: 'Eventos',
    href: '/dashboard/events',
    icon: 'Calendar',
  },
  {
    title: 'Minhas Reservas',
    href: '/dashboard/spots',
    icon: 'Ticket',
  },
  {
    title: 'Meu Perfil',
    href: `${process.env.NEXT_PUBLIC_AUTH_URL}/dashboard`,
    icon: 'User',
  },
]
