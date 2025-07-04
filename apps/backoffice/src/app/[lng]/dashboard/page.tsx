'use client';

// Ensure this imports the client-side useTranslation
import { useTranslation } from '@test-pod/translation/client';
import DashboardClient from '../../../components/dashboard-client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingPage } from '@test-pod/ui'; // Assuming a generic loading component

// The backofficeLocaleLoader might not be explicitly needed here if i18next is configured
// globally to load locales from this path. If useTranslation needs it, it's an issue
// as client components can't directly use fs/dynamic imports like this for locale files
// that aren't part of the JS bundle through i18next's setup.
// For now, assuming useTranslation handles its own loading based on prior setup.

// Define or import the appLocaleLoader, similar to LngLayout
const appLocaleLoader = (language: string, namespace: string) => {
  return import(`../../../locales/${language}/${namespace}.json`);
};

interface Translations {
  title: string;
  welcome: string;
  greeting: string;
  language: string;
}

export default function DashboardPage() {
  const params = useParams();
  const lng = params.lng as string;

  // useTranslation typically returns 't' function, 'i18n' instance, and 'ready' state.
  // The exact signature depends on the '@test-pod/translation' wrapper.
  // Assuming it behaves like react-i18next's useTranslation.
  const { t, ready } = useTranslation(lng, ['backoffice', 'common'], {}, appLocaleLoader);
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    if (ready && t) {
      setTranslations({
        title: t('dashboard.title', { ns: 'backoffice' }) || "Dashboard Title",
        welcome: t('dashboard.welcome', { ns: 'backoffice' }) || "Welcome to the dashboard.",
        greeting: t('greeting', { ns: 'common' }) || "Hello",
        language: t('language', { ns: 'common' }) || "Language"
      });
    }
  }, [ready, t, lng]); // Added lng to dependencies

  if (!ready || !translations) {
    // Render a loading state or null while translations are loading
    return <LoadingPage />;
  }

  return (
    <DashboardClient translations={translations} lng={lng} />
  );
}
