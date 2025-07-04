'use client';

import { AuthProvider } from '@test-pod/auth-shared'
import '@/styles/globals.css'
// import { useTranslation } from '@test-pod/translation' // Will be used in a client component
// import { languages, fallbackLng } from '@test-pod/translation/settings' // Settings might be needed client-side
import { BackofficeClient } from '../../components/backoffice-client'
import { useParams } from 'next/navigation'; // To get lng client-side
import { useEffect, useState } from 'react';
import { dir } from 'i18next'; // For setting text direction

// Settings needed for language validation and fallback
import { languages, fallbackLng, cookieName as i18nCookieName } from '@test-pod/translation/settings';
import Cookies from 'js-cookie';


// The backofficeLocaleLoader will be used by the client-side i18n setup
const backofficeLocaleLoader = (language: string, namespace: string) => {
  return import(`../../locales/${language}/${namespace}.json`)
}

export default function LngLayout({
  children,
}: {
  children: React.ReactNode
  // params: { lng: string } // lng will be obtained from useParams()
}) {
  const params = useParams();
  const [currentLng, setCurrentLng] = useState(fallbackLng);
  const [isInitializing, setIsInitializing] = useState(true);

  const router = useRouter(); // Add useRouter

  // This effect handles initial language detection and setting
  useEffect(() => {
    const currentPath = window.location.pathname;
    let detectedLng = params.lng as string || Cookies.get(i18nCookieName) || fallbackLng;
    if (!languages.includes(detectedLng)) {
      detectedLng = fallbackLng;
    }
    setCurrentLng(detectedLng);

    // Update html attributes
    document.documentElement.lang = detectedLng;
    document.documentElement.dir = dir(detectedLng);

    // Update cookie if params.lng is present and different from cookie
    if (params.lng && params.lng !== Cookies.get(i18nCookieName)) {
      Cookies.set(i18nCookieName, params.lng as string, { path: '/' });
    }

    // Redirect if lng is not in path or is incorrect
    const pathLng = params.lng as string;
    if (!pathLng || !languages.includes(pathLng) || pathLng !== detectedLng) {
      // Ensure we don't redirect for /_next/ or other static assets if any were missed by middleware patterns
      // However, with client-side routing, this check primarily ensures the URL reflects the correct language.
      // We need to be careful not to cause redirect loops if params.lng is undefined.
      // The currentPath will be like /dashboard if lng is missing, or /fr/dashboard if lng is wrong.

      const basePath = currentPath.startsWith(`/${pathLng}`) ? currentPath.substring(`/${pathLng}`.length) : currentPath;
      const newPath = `/${detectedLng}${basePath}${window.location.search}`;

      if (newPath !== currentPath) {
         // Only redirect if the new path is different to avoid potential loops with some router configurations.
        router.replace(newPath);
        // No need to setIsInitializing(false) yet, let the redirect happen and re-evaluate.
        return;
      }
    }

    setIsInitializing(false);
  }, [params.lng, router]); // Added router to dependency array

  // Translations for LanguageSwitcher - these could also be loaded async if they grow large
  // For simplicity, keeping them static for now or they could be passed to BackofficeClient
  // which then initializes useTranslation.
  // For now, BackofficeClient will need to be enhanced to take currentLng and setup i18n.
  const lsTranslations = { // These are placeholders, actual translations will be handled by i18n init
    change_language: 'Change Language',
    en: 'English',
    pt: 'Português',
  };

  if (isInitializing) {
    // You might want a proper loading skeleton here
    return (
      <html lang={currentLng} dir={dir(currentLng)}>
        <body>
          <div>Loading language...</div>
        </body>
      </html>
    );
  }

  return (
    // AuthProvider is now inside BackofficeClient in this example,
    // but it could also wrap BackofficeClient here.
    // For now, assuming BackofficeClient handles AuthProvider and i18n setup.
    <html lang={currentLng} dir={dir(currentLng)}>
      <body>
        <AuthProvider
          domain={process.env.NEXT_PUBLIC_DOMAIN || 'localhost'}
          apiUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}
          cookieName={process.env.NEXT_PUBLIC_COOKIE_NAME || 'authToken'}
        >
          <BackofficeClient lng={currentLng} translations={lsTranslations} localeLoader={backofficeLocaleLoader}>
            {children}
          </BackofficeClient>
        </AuthProvider>
      </body>
    </html>
  )
}