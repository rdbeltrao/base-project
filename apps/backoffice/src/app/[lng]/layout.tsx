'use client';

import { AuthProvider } from '@test-pod/auth-shared';
import '@/styles/globals.css';
// Use the client-side useTranslation
import { useTranslation } from '@test-pod/translation/client';
import { languages, fallbackLng } from '@test-pod/translation/settings';
import { BackofficeClient } from '../../components/backoffice-client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingPage } from '@test-pod/ui'; // Assuming a generic loading component

// This loader can be used by the client-side useTranslation via i18next-resources-to-backend
const appLocaleLoader = (language: string, namespace: string) => {
  // Note: For this to work client-side for arbitrary namespaces,
  // these files must be available under apps/backoffice/public/locales (or similar)
  // OR Next.js/webpack must be configured to bundle them correctly if not under public.
  // The original path `../../locales/` might be problematic if not handled by a build step.
  // A common pattern is to put them in `public/locales/[lng]/[ns].json`
  // and then fetch them.
  // If `@test-pod/translation/client`'s `resourcesToBackend` uses `import()`
  // directly on a path like this, it *might* work if webpack bundles them.
  return import(`../../locales/${language}/${namespace}.json`);
};

// generateStaticParams and generateMetadata are fine, they are server-side Next.js features
export async function generateStaticParams() {
  return languages.map((lngParam: string) => ({ lng: lngParam }));
}

export async function generateMetadata({ params }: { params: { lng: string } }) {
  // This is server-side, so using the async useTranslation is fine here if needed
  // For simplicity, keeping titles static as before.
  return {
    title: params.lng === 'pt' ? 'Backoffice PT (Client)' : 'Backoffice EN (Client)',
    description: params.lng === 'pt' ? 'Painel administrativo' : 'Admin panel',
  };
}

export default function LngLayout({
  children,
}: {
  children: React.ReactNode;
  // params prop is not directly available in client components like this, use useParams hook
}) {
  const params = useParams();
  const lng = params.lng as string;

  // Validate lng or use fallback
  const currentLng = languages.includes(lng) ? lng : fallbackLng;

  // Use the client-side useTranslation
  // It needs the appLocaleLoader if translations are not part of the main bundle
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

  // Ensure language is correctly set in i18n instance if it changed via URL
  useEffect(() => {
    if (i18n && currentLng && i18n.language !== currentLng) {
      i18n.changeLanguage(currentLng);
    }
  }, [i18n, currentLng]);


  if (!i18nReady || !commonTranslations) {
    return <LoadingPage />; // Or some other loading UI
  }

  // BackofficeClient likely contains AuthProvider and other global providers
  return (
    <BackofficeClient lng={currentLng} translations={commonTranslations}>
      {children}
    </BackofficeClient>
  );
}