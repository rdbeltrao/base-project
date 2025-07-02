import { AuthProvider } from '@test-pod/auth-shared'
import '@/styles/globals.css'

export const metadata = {
  title: 'Backoffice',
  description: 'Painel administrativo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR'>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
