import { useTranslation } from '@test-pod/translation';
import DashboardClient from '../../../components/dashboard-client';

const backofficeLocaleLoader = (language: string, namespace: string) => {
  return import(`../../../locales/${language}/${namespace}.json`);
};

export default async function DashboardPage({ params: { lng } }: { params: { lng: string } }) {
  const { t } = await useTranslation(lng, ['backoffice', 'common'], undefined, backofficeLocaleLoader);

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
