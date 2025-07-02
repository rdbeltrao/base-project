'use client';

import { useTranslation } from '@test-pod/translation/client';

// Define the app-specific locale loader for site
const siteLocaleLoader = (language, namespace) => {
  // This path needs to resolve correctly from the component's location to apps/site/src/locales
  return import(`../../locales/${language}/${namespace}.json`);
};

export default function Footer({ lng }: { lng: string }) {
  const { t } = useTranslation(lng, ['site', 'common'], undefined, siteLocaleLoader);

  return (
    <footer className='border-t border-border py-6 bg-card mt-auto'>
      <div className='container mx-auto px-4'>
        <div className='flex flex-col md:flex-row items-center justify-between text-center md:text-left'>
          <p className='text-sm text-muted-foreground'>
            {t('home.footer.copy_right', { ns: 'site', defaultValue: `© ${new Date().getFullYear()} Event Platform. All rights reserved.` })}
          </p>
          <div className='flex gap-4 mt-4 md:mt-0'>
            <a href={`/${lng}/privacy`} className='text-sm text-muted-foreground hover:text-primary'>
              {t('home.footer.privacy_policy', { ns: 'site', defaultValue: 'Privacy Policy' })}
            </a>
            <a href={`/${lng}/terms`} className='text-sm text-muted-foreground hover:text-primary'>
              {t('home.footer.terms_of_service', { ns: 'site', defaultValue: 'Terms of Service' })}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
