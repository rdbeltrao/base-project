'use client';

import i18next from 'i18next';
import { useEffect, useState } from 'react';
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getCookie, setCookie } from 'cookies-next';
import { getOptions, languages, cookieName, fallbackLng } from './settings';

const runsOnServerSide = typeof window === 'undefined';

const initI18nextClient = (lng, ns, appLocaleLoader) => {
  if (i18next.isInitialized) return;

  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend(async (language, namespace) => {
      if (appLocaleLoader) {
        try {
          const appResource = await appLocaleLoader(language, namespace);
          if (appResource) return appResource;
        } catch (e) {
          // Fallback to common locales
        }
      }
      return import(`./locales/${language}/${namespace}.json`);
    }))
    .init({
      ...getOptions(lng, ns),
      lng,
      detection: {
        order: ['path', 'cookie', 'htmlTag', 'localStorage', 'navigator'],
        caches: ['cookie'],
        lookupCookie: cookieName,
      },
      preload: runsOnServerSide ? languages : [],
    });
};

export function useTranslation(lngFromParam, ns, options, appLocaleLoader) {
  const lng = lngFromParam || fallbackLng;

  if (!i18next.isInitialized && !runsOnServerSide) {
    initI18nextClient(lng, ns, appLocaleLoader);
  }

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

export { getOptions };
