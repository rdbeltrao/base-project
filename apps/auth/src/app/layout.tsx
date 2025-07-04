'use client';

import { AuthProvider } from '@test-pod/auth-shared'
import './globals.css'

export const metadata = {
  title: 'Auth App',
  description: 'Aplicação de autenticação',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

  return (
    <html lang='pt-BR'>
      <body suppressHydrationWarning>
        <AuthProvider domain={domain} apiUrl={apiUrl} cookieName={cookieName}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
