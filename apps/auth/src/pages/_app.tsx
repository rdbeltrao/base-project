import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '@test-pod/auth-shared'

export default function App({ Component, pageProps }: AppProps) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const cookieName = process.env.NEXT_PUBLIC_COOKIE_NAME || 'auth-token'

  return (
    <AuthProvider domain={domain} apiUrl={apiUrl} cookieName={cookieName}>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
