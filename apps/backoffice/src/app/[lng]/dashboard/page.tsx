'use client';

import { useTranslation } from '@test-pod/translation/client'; // Use client-side hook
import DashboardClient from '../../../components/dashboard-client';
import { useParams } from 'next/navigation'; // To get lng if needed, though useTranslation handles it

// This loader is passed to useTranslation
const backofficeLocaleLoader = (language: string, namespace: string) => {
  return import(`../../../locales/${language}/${namespace}.json`);
};

export default function DashboardPage() {
  const params = useParams();
  const lng = params.lng as string;

  // useTranslation will initialize i18next for the client if not already done by layout
  const { t, i18n } = useTranslation(lng, ['backoffice', 'common'], undefined, backofficeLocaleLoader);

  // Check if i18n is initialized and translations are ready
  if (!i18n.isInitialized || !t) {
    // You might want a loading state here if translations are not immediately available
    // For now, returning null or a minimal loader
    return <div>Loading translations...</div>;
  }

  const translations = {
    title: t('dashboard.title', { ns: 'backoffice' }),
    welcome: t('dashboard.welcome', { ns: 'backoffice' }),
    greeting: t('greeting', { ns: 'common' }),
    language: t('language', { ns: 'common' })
  };

  return (
    <DashboardClient translations={translations} lng={lng} />
  );
}
