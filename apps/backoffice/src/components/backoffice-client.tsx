'use client'

import { AuthProvider } from '@test-pod/auth-shared'
import { LanguageSwitcher } from '@test-pod/translation/components/LanguageSwitcher'

export function BackofficeClient({
  children,
  lng,
  translations,
}: {
  children: React.ReactNode
  lng: string
  translations: {
    change_language: string
    en: string
    pt: string
  }
}) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const cookieNameEnv = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

  return (
    <AuthProvider domain={domain} apiUrl={apiUrl} cookieName={cookieNameEnv}>
      <header className="p-4 bg-background border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div>{/* Placeholder for potential logo or nav */}</div>
          <LanguageSwitcher lng={lng} translations={translations} />
        </div>
      </header>
      <main className="p-4">{children}</main>
    </AuthProvider>
  )
} 