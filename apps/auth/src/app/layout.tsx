'use client';

import { AuthProvider } from '@test-pod/auth-shared'
import './globals.css'

// Removed metadata export as this is a 'use client' component.
// Document head (title, meta) for client components should be managed using
// a client-side solution if needed (e.g., react-helmet, next/head for older Next versions,
// or by manipulating document.title directly in useEffect).
// For Next.js 13+ App Router, if this layout needs to set metadata,
// it should ideally not be a 'use client' component at the root where metadata is exported,
// or metadata should be handled by a parent server component.

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
