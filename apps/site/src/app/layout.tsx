import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eventos - Plataforma de Eventos',
  description: 'Plataforma para reserva e gerenciamento de eventos',
  keywords: 'eventos, reservas, gerenciamento, plataforma',
  robots: 'index, follow',
  openGraph: {
    title: 'Eventos - Plataforma de Eventos',
    description: 'Plataforma para reserva e gerenciamento de eventos',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Eventos',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='pt-BR'>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
