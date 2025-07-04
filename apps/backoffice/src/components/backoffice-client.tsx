'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@test-pod/auth-shared'
import { LanguageSwitcher } from '@test-pod/translation/components/LanguageSwitcher'
import { initI18nextClient, useTranslation } from '@test-pod/translation/client' // Import client-side i18n
import { I18nextProvider } from 'react-i18next' // To provide i18n instance

export function BackofficeClient({
  children,
  lng,
  translations: initialSwitcherTranslations, // Renamed to avoid conflict if we use useTranslation here
  localeLoader,
}: {
  children: React.ReactNode
  lng: string
  translations: { // These are for the LanguageSwitcher, could be fetched with useTranslation too
    change_language: string
    en: string
    pt: string
  }
  localeLoader: (language: string, namespace: string) => Promise<any>
}) {
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const cookieNameEnv = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'

  // Initialize i18next client side
  // The useTranslation hook from @test-pod/translation/client will also call initI18nextClient
  // if not already initialized. So, we can rely on that or call it explicitly.
  // For components inside BackofficeClient to use useTranslation, i18next needs to be initialized.
  // The useTranslation hook itself handles initialization.
  // We need to ensure an I18nextProvider is used if we want to pass down the i18n instance explicitly
  // or if child components are expected to pick it up automatically.
  // The custom useTranslation hook from package handles its own initialization logic.

  // We call useTranslation here to ensure i18next is initialized for this component tree
  // and to potentially get translations for the LanguageSwitcher if needed.
  const { i18n, t } = useTranslation(lng, ['common', 'backoffice'], undefined, localeLoader);

  // Update LanguageSwitcher translations if they should be dynamic
  const switcherTranslations = {
    change_language: t('change_language', { ns: 'common', defaultValue: initialSwitcherTranslations.change_language }),
    en: t('en', { ns: 'common', defaultValue: initialSwitcherTranslations.en }),
    pt: t('pt', { ns: 'common', defaultValue: initialSwitcherTranslations.pt }),
  };

  return (
    // Wrap with I18nextProvider to make the i18n instance available to all children via context
    // This is good practice if child components use the standard useTranslation hook.
    // Our custom hook from @test-pod/translation/client should also work as it manages its own state/init.
    <I18nextProvider i18n={i18n}>
      <AuthProvider domain={domain} apiUrl={apiUrl} cookieName={cookieNameEnv}>
        <header className="p-4 bg-background border-b">
          <div className="container mx-auto flex justify-between items-center">
            <div>{/* Placeholder for potential logo or nav */}</div>
            <LanguageSwitcher lng={lng} translations={switcherTranslations} />
          </div>
        </header>
        <main className="p-4">{children}</main>
      </AuthProvider>
    </I18nextProvider>
  )
}