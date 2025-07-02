# @test-pod/translation

This package provides internationalization (i18n) utilities for Next.js applications using `i18next` and `react-i18next`. It supports server components, client components, and app-specific translation files.

## Features

- Centralized i18n configuration (`settings.js`).
- `useTranslation` hook for both server (`./index.js`) and client (`./client.js`) components.
- Dynamic loading of translation files using `i18next-resources-to-backend`.
- Support for common translation files within this package (`./locales`).
- Support for app-specific translation files by passing an `appLocaleLoader` function to `useTranslation`.
- Includes a shared `LanguageSwitcher` component.

## Structure

- `settings.js`: Core settings (supported languages, fallback, default namespace, i18next options).
- `index.js`: Server-side `useTranslation` hook and initialization logic.
- `client.js`: Client-side `useTranslation` hook and initialization logic.
- `locales/`: Contains common translation files (e.g., `en/common.json`, `pt/common.json`).
- `components/`: Contains shared i18n-related components like `LanguageSwitcher.tsx`.
- `index.d.ts`: TypeScript definitions for the package.

## Usage

### Setup in an App

1.  **Middleware**: Each app (`apps/your-app`) needs a `src/middleware.js` to handle language detection and routing. See examples in `apps/backoffice` or `apps/site`.
2.  **Layout**: Each app needs a dynamic segment layout `src/app/[lng]/layout.tsx` that uses `generateStaticParams` from this package's settings and sets `lang` and `dir` on the `<html>` tag.
3.  **Root Layout**: A minimal `src/app/layout.tsx` is also required by Next.js.

### Adding Common Translations

1.  Edit or add files in `packages/translation/locales/[lang]/common.json`.
2.  Add new languages to `packages/translation/settings.js` in the `languages` array.

### Adding App-Specific Translations

1.  Create a `locales` directory in your app, e.g., `apps/your-app/src/locales/`.
2.  Add your translation files, e.g., `apps/your-app/src/locales/en/your-app-ns.json`.
3.  When using `useTranslation`, provide an `appLocaleLoader` function that knows how to load these files.

    **Example (Server Component in `apps/your-app/src/app/[lng]/page.tsx`):**
    ```tsx
    import { useTranslation } from '@test-pod/translation';

    const appLocaleLoader = async (language, namespace) => {
      // Path relative to this file, pointing to this app's locales
      return import(`../../locales/${language}/${namespace}.json`);
    };

    export default async function MyPage({ params: { lng } }) {
      const { t } = await useTranslation(lng, ['your-app-ns', 'common'], {}, appLocaleLoader);
      // ... use t('some_key', { ns: 'your-app-ns' })
      // ... use t('common_key', { ns: 'common' })
      return <div>{t('your-app-ns:some_key')}</div>;
    }
    ```

    **Example (Client Component in `apps/your-app/src/app/components/MyClientComponent.tsx`):**
    ```tsx
    'use client';
    import { useTranslation } from '@test-pod/translation/client';
    import { useParams } from 'next/navigation'; // If lng comes from path

    const appLocaleLoader = (language, namespace) => {
      // Path relative to this file
      return import(`../../locales/${language}/${namespace}.json`);
    };

    export function MyClientComponent() {
      const params = useParams();
      const lng = params.lng as string; // Or get lng from props
      const { t } = useTranslation(lng, ['your-app-ns', 'common'], undefined, appLocaleLoader);

      return <div>{t('your-app-ns:some_key')}</div>;
    }
    ```

### Using the Language Switcher

Import and use the `LanguageSwitcher` component, passing the current language (`lng`):

```tsx
import { LanguageSwitcher } from '@test-pod/translation/components/LanguageSwitcher';

// In your layout or a header component
<LanguageSwitcher lng={currentLng} />
```

## Refinement Considerations (from initial setup)

*   **`appLocaleLoader` Paths**: The relative paths in `appLocaleLoader` (e.g., `import(\`../../locales/...\`)`) must correctly point from the component/page file to the app's specific `locales` directory. This can be sensitive to file location.
*   **Client-Side `i18next` Initialization**: The client-side `i18next` is initialized by the first call to `useTranslation` (from `@test-pod/translation/client`). If different top-level client components on the same page were to call this with different `appLocaleLoader` functions, only the first one would take effect for the global `i18next` instance's resource loading strategy. For consistent behavior, ensure that if multiple client components load different app-specific namespaces, they either:
    1.  Are children of a component that has already initialized `useTranslation` with a comprehensive loader.
    2.  Or, consider an app-level I18nProvider component that initializes `i18next` once with the app's specific loader. (This was deemed not strictly necessary for the initial setup but is a good practice for more complex scenarios).
```
