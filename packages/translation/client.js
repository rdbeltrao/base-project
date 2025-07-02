'use client';

import i18next from 'i18next';
import { useEffect, useState } from 'react';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getCookie, setCookie } from 'cookies-next';
import { getOptions, languages, cookieName, fallbackLng } from './settings';

const runsOnServerSide = typeof window === 'undefined';

// initI18nextClient function to encapsulate initialization logic
// It will be called once.
const initI18nextClient = (appLocaleLoader) => {
  if (i18next.isInitialized) return;

  i18next
    .use(initReactI18next)
    .use(LanguageDetector) // Detects language from browser settings, path, cookie, etc.
    .use(resourcesToBackend(async (language, namespace) => {
      if (appLocaleLoader) {
        try {
          const appResource = await appLocaleLoader(language, namespace);
          if (appResource) return appResource;
        } catch (e) {
          // console.debug(`App locale for ns '${namespace}' in lang '${language}' not found on client, trying common.`);
        }
      }
      return import(`./locales/${language}/${namespace}.json`);
    }))
    .init({
      ...getOptions(),
      lng: undefined, // Let LanguageDetector detect language
      detection: {
        order: ['path', 'cookie', 'htmlTag', 'localStorage', 'navigator'],
        caches: ['cookie'], // Cache the language in a cookie
        lookupCookie: cookieName,
      },
      preload: runsOnServerSide ? languages : [], // Preload languages on server, not on client
      // debug: process.env.NODE_ENV === 'development', // Optional: enable debug in dev
    });
};


// Client-side hook
// It now needs to ensure initI18nextClient is called with the appLocaleLoader
// This is a bit tricky because useTranslation can be called multiple times.
// We'll ensure init is called once. A better pattern might be an I18nProvider component.
export function useTranslation(lngFromParam, ns, options, appLocaleLoader) {
  // Ensure client i18next is initialized with the app-specific loader
  // This should ideally be done once, perhaps in a provider or a top-level client component
  if (!i18next.isInitialized && !runsOnServerSide) {
    initI18nextClient(appLocaleLoader);
  }

  const lng = lngFromParam || fallbackLng;
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;
    lng: undefined, // Let LanguageDetector detect language
    detection: {
      order: ['path', 'cookie', 'htmlTag', 'localStorage', 'navigator'],
      caches: ['cookie'], // Cache the language in a cookie
      lookupCookie: cookieName,
    },
    preload: runsOnServerSide ? languages : [], // Preload languages on server, not on client
    // debug: process.env.NODE_ENV === 'development', // Optional: enable debug in dev
  });

// Client-side hook
export function useTranslation(lngFromParam, ns, options) {
  const lng = lngFromParam || fallbackLng;
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;

  const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);

  useEffect(() => {
    if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng, i18n, runsOnServerSide]);

  useEffect(() => {
    if (activeLng === i18n.resolvedLanguage) return;
    setActiveLng(i18n.resolvedLanguage);
  }, [activeLng, i18n.resolvedLanguage]);

  useEffect(() => {
    if (!lng || i18n.resolvedLanguage === lng) return;
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  useEffect(() => {
    const currentCookie = getCookie(cookieName);
    if (currentCookie === lng) return;
    setCookie(cookieName, lng, { path: '/' });
  }, [lng]);

  return ret;
}

// Re-export getOptions for potential direct use on client if ever needed
export { getOptions };
