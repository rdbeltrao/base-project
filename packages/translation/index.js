import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions } from './settings';

// initI18next will now accept a locale loader function from the app
const initI18next = async (lng, ns, appLocaleLoader) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend(async (language, namespace) => {
      if (appLocaleLoader) {
        try {
          // Try loading from the app-specific loader first
          const appResource = await appLocaleLoader(language, namespace);
          if (appResource) return appResource;
        } catch (e) {
          // If app-specific loader fails (e.g., file not found for that namespace),
          // fall through to common loader. Log this for debugging if needed.
          // console.debug(`App locale for ns '${namespace}' in lang '${language}' not found, trying common.`);
        }
      }
      // Fallback to common locales within the package
      return import(`./locales/${language}/${namespace}.json`);
    }))
    .init(getOptions(lng, ns));
  return i18nInstance;
};

// useTranslation will accept an optional appLocaleLoader
export async function useTranslation(lng, ns, options = {}, appLocaleLoader) {
  const i18nextInstance = await initI18next(lng, ns, appLocaleLoader);
  return {
    t: i18nextInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
    i18n: i18nextInstance,
  };
}

// It can be helpful to also export getOptions if apps need to initialize i18next differently
// or for the client-side bundle.
export { getOptions };
