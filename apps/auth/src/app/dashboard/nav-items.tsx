export interface NavItem {
  title: string
  href: string
  permissions?: string[]
  icon: string
}

export const navItems: NavItem[] = [
  {
    title: 'Eventos',
    href: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events`,
    icon: 'Calendar',
  },
  {
    title: 'Minhas Reservas',
    href: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reservations`,
    icon: 'Ticket',
  },
  {
    title: 'Meu Perfil',
    href: '/dashboard',
    icon: 'User',
  },
]
