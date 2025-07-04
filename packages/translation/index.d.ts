import { i18n as I18nInstanceType, TFunction } from 'i18next';

// Define option types if they are complex, or use existing types from i18next
interface I18nOptions {
  keyPrefix?: string;
}

interface UseTranslationResponse {
  t: TFunction;
  i18n: I18nInstanceType; // Or a more specific type if you customize the instance
}

// For settings.js
export interface I18nSettings {
  fallbackLng: string;
  languages: string[];
  defaultNS: string;
  cookieName: string;
}

export interface I18nextOptions {
  debug?: boolean;
  supportedLngs: string[];
  fallbackLng: string;
  lng: string;
  fallbackNS: string;
  defaultNS: string;
  ns: string | string[];
}

export function getOptions(lng?: string, ns?: string | string[]): I18nextOptions;

// Type for the appLocaleLoader function
export type AppLocaleLoader = (language: string, namespace: string) => Promise<any>;

// For index.js (server-side)
export function useTranslation(
  lng: string,
  ns?: string | string[],
  options?: I18nOptions,
  appLocaleLoader?: AppLocaleLoader
): Promise<UseTranslationResponse>;

// For client.js (client-side)
// Note: The client-side useTranslation hook from react-i18next might have a slightly different signature
// or return type if not customized heavily. This is a simplified representation.
export function useTranslation(
  lng: string, // lng is technically optional here as LanguageDetector can find it
  ns?: string | string[],
  options?: I18nOptions,
  appLocaleLoader?: AppLocaleLoader
): UseTranslationResponse; // This is not async on the client after init

// Re-export settings types
export const fallbackLng: string;
export const languages: string[];
export const defaultNS: string;
export const cookieName: string;
