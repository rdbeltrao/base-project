import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@test-pod/auth-shared'
import { initFeatureFlags } from '@test-pod/feature-flags'
import path from 'path'

// Initialize feature flags on server start.
// `process.cwd()` in a Next.js app (e.g., within `layout.tsx` which is a Server Component)
// typically refers to the root of the Next.js project, e.g., `[monorepo_root]/apps/app`.
// From this location, the config file is at `../../config/feature-toggles.json`.
const configFilePath = path.resolve(process.cwd(), '../../config/feature-toggles.json');
initFeatureFlags({ configPath: configFilePath });

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
