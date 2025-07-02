import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@test-pod/auth-shared'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'App',
  description: 'Aplicação para usuários finais',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

  return (
    <html lang='pt-BR'>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider domain={domain} apiUrl={apiUrl} cookieName={cookieName}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
