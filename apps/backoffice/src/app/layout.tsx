// This is a minimal root layout.
// The actual layout content is in app/[lng]/layout.tsx.
// This file is needed to satisfy Next.js's requirement for a root layout.

import { cookies } from 'next/headers';
import { dir } from 'i18next';
import { fallbackLng, languages, cookieName } from '@test-pod/translation/settings';

export const metadata = {
  title: 'Backoffice', // Generic title, will be overridden by [lng] layout
  description: 'Painel administrativo', // Generic description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  let lng = cookieStore.get(cookieName)?.value || fallbackLng;

  // Validate lng or use fallback
  if (!languages.includes(lng)) {
    lng = fallbackLng;
  }

  return (
    <html lang={lng} dir={dir(lng)}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
