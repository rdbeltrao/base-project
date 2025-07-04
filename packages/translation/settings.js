export const fallbackLng = 'en';
export const languages = [fallbackLng, 'pt'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: process.env.NODE_ENV === 'development', // Optional: enable debug in dev
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    // You can add backend options here for i18next-resources-to-backend
    // backend: {
    //   loadPath: `/locales/{{lng}}/{{ns}}.json`, // This will be relative to where it's used or needs adjustment
    // },
  };
}
