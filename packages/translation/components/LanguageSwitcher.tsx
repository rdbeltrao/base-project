'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { languages, fallbackLng } from '../settings';

interface LanguageSwitcherTranslations {
  change_language: string;
  [key: string]: string;
}

export function LanguageSwitcher({ lng, translations }: { lng: string, translations: LanguageSwitcherTranslations }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLng: string) => {
    // Remove current language prefix from pathname if it exists
    const currentLngPrefix = `/${lng}`;
    let newPath = pathname;

    if (pathname.startsWith(currentLngPrefix)) {
      newPath = pathname.substring(currentLngPrefix.length) || '/';
    } else if (lng === fallbackLng && !pathname.startsWith(currentLngPrefix) && languages.every(l => !pathname.startsWith(`/${l}`))) {
      // Handles case where current lng is fallback and path has no prefix (e.g. /about if /en/about)
      // This might be redundant if middleware always enforces prefix, but good for robustness
      newPath = pathname;
    }


    // Ensure leading slash for the base path
    if (!newPath.startsWith('/')) {
      newPath = '/' + newPath;
    }

    router.push(`/${newLng}${newPath}`);
  };

  return (
    <div className="language-switcher">
      <span className="mr-2">{translations.change_language}</span>
      {languages.map((langCode) => (
        <button
          key={langCode}
          onClick={() => handleLanguageChange(langCode)}
          disabled={lng === langCode}
          className={`px-2 py-1 rounded-md text-sm font-medium transition-colors
            ${lng === langCode
              ? 'bg-primary text-primary-foreground cursor-not-allowed'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }
            ${languages.indexOf(langCode) < languages.length - 1 ? 'mr-1' : ''}
          `}
        >
          {translations[langCode] || langCode.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Helper to add language codes to common.json if they don't exist for display
// e.g. "en": "EN", "pt": "PT"
// This is just a comment; actual JSON update is separate.
// packages/translation/locales/en/common.json: "en": "EN", "pt": "PT"
// packages/translation/locales/pt/common.json: "en": "EN", "pt": "PT"
