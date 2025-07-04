// This is a minimal root layout.
// The actual layout content is in app/[lng]/layout.tsx.
// This file is needed to satisfy Next.js's requirement for a root layout.
'use client';

import { dir } from 'i18next';
import { fallbackLng, languages, cookieName } from '@test-pod/translation/settings';
import { useEffect, useState } from 'react'; // Import useEffect and useState

// Removed metadata export as this is a 'use client' component.
// Metadata for the backoffice app is primarily handled by the `generateMetadata`
// function in `apps/backoffice/src/app/[lng]/layout.tsx`.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [lng, setLng] = useState(fallbackLng); // Use state for language

  useEffect(() => {
    // Client-side effect to get language from cookies
    const getCookie = (name: string): string | undefined => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    let language = getCookie(cookieName) || fallbackLng;
    if (!languages.includes(language)) {
      language = fallbackLng;
    }
    setLng(language);
  }, []);


  return (
    <html lang={lng} dir={dir(lng)}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
