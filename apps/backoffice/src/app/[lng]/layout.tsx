'use client';

import { AuthProvider } from '@test-pod/auth-shared';
import '@/styles/globals.css';
import { useTranslation } from '@test-pod/translation/client';
import { languages, fallbackLng } from '@test-pod/translation/settings';
import { BackofficeClient } from '../../components/backoffice-client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingPage } from '@test-pod/ui';

// This loader can be used by the client-side useTranslation via i18next-resources-to-backend
const appLocaleLoader = (language: string, namespace: string) => {
  return import(`../../locales/${language}/${namespace}.json`);
};

// Removed generateStaticParams and generateMetadata as this is now a fully client-side layout
// and server-side static generation features are not needed for this path.

interface LngLayoutProps {
  children: React.ReactNode;
  // params prop is not directly passed from Next.js to client component layouts,
  // so we use useParams()
}

export default function LngLayout({ children }: LngLayoutProps) {
  const params = useParams();
  // Ensure params.lng is a string, or provide a fallback.
  // However, for a route like /[lng]/layout.tsx, lng should always be present.
  const lng = typeof params.lng === 'string' ? params.lng : fallbackLng;

  // Validate lng or use fallback
  const currentLng = languages.includes(lng) ? lng : fallbackLng;

  const { t, ready: i18nReady, i18n } = useTranslation(currentLng, ['common'], {}, appLocaleLoader);
  const [commonTranslations, setCommonTranslations] = useState<any>(null);

  useEffect(() => {
    if (i18nReady && t) {
      setCommonTranslations({
        change_language: t('change_language') || "Change Language",
        en: t('en') || "EN",
        pt: t('pt') || "PT",
      });
    }
  }, [i18nReady, t, currentLng]);

  useEffect(() => {
    if (i18n && currentLng && i18n.language !== currentLng) {
      i18n.changeLanguage(currentLng);
    }
  }, [i18n, currentLng]);

  if (!i18nReady || !commonTranslations) {
    return <LoadingPage />;
  }

  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const cookieNameFromEnv = process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken';

  return (
    <AuthProvider domain={domain} apiUrl={apiUrl} cookieName={cookieNameFromEnv}>
      <BackofficeClient lng={currentLng} translations={commonTranslations}>
        {children}
      </BackofficeClient>
    </AuthProvider>
  );
}