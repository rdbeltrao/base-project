import { AuthProvider } from '@test-pod/auth-shared'
import './globals.css'

export const metadata = {
  title: 'Auth App',
  description: 'Aplicação de autenticação',
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
