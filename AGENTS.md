## Feature Toggle System

This project includes a feature toggle system that allows for conditionally enabling or disabling features, especially experimental ones.

### Configuration

Feature toggles are defined in a JSON file located at `config/feature-toggles.json` relative to the monorepo root.
The file structure is a simple key-value pair, where the key is the feature name (string) and the value is a boolean indicating whether the feature is enabled (`true`) or disabled (`false`).

Example `config/feature-toggles.json`:
```json
{
  "eventFilters": true,
  "newExperimentalFeature": false
}
```

### Usage in Code

The feature toggle functionality is provided by the shared package `@test-pod/feature-flags`.
Any application within the monorepo (e.g., `apps/app`, `apps/backoffice`) can use this package.

**Package Name:** `@test-pod/feature-flags`

**Initialization (Server-Side):**

The package must be initialized once, typically when the application server starts. This is done by calling `initFeatureFlags`. This function reads the `config/feature-toggles.json` file.

*   `initFeatureFlags(options?: FeatureFlagOptions): void`:
    *   `options.configPath` (string, optional): Absolute path to the `feature-toggles.json` file. If not provided, it defaults to `path.resolve(process.cwd(), 'config/feature-toggles.json')`. For applications within the `apps` directory (like `apps/app`), you should construct the path relative to their CWD, e.g., `path.resolve(process.cwd(), '../../config/feature-toggles.json')`.
    *   `options.logger` (object, optional): An object with `warn` and `error` methods for logging. Defaults to `console`.

**Example (Next.js App - `apps/app/src/app/layout.tsx` - Server Component):**
```tsx
// apps/app/src/app/layout.tsx
import { initFeatureFlags } from '@test-pod/feature-flags';
import path from 'path';

// Assuming process.cwd() is [monorepo_root]/apps/app
const configFilePath = path.resolve(process.cwd(), '../../config/feature-toggles.json');
initFeatureFlags({ configPath: configFilePath });

export default function RootLayout({ children }) {
  // ...
}
```

**Accessing Toggles (Server or Client Side):**

Once initialized, the following functions can be used in both server-side and client-side code:

*   `isFeatureEnabled(featureName: string): boolean`:
    *   Accepts the feature name (string).
    *   Returns `true` if the feature is enabled, `false` otherwise.
    *   If called before `initFeatureFlags`, it will attempt a default initialization (see `configPath` default behavior above).

*   `getFeatureToggles(): { [key: string]: boolean }`:
    *   Returns an object containing all loaded feature toggles.
    *   If called before `initFeatureFlags`, it will attempt a default initialization.

**Example (React Component - Client or Server):**

```tsx
import { useEffect, useState } from 'react'; // useEffect only needed for client-side specific logic
import { isFeatureEnabled } from '@test-pod/feature-flags';

function MyComponent() {
  // For Client Components, it's common to check the feature flag in useEffect or directly if it influences initial render.
  // For Server Components, you can call it directly.
  const showNewUI = isFeatureEnabled('newUIV2');
  // const [showNewUI, setShowNewUI] = useState(false); // Only if you need to derive state client-side

  // useEffect(() => { // Only if needed for client-side updates based on flag
  //   setShowNewUI(isFeatureEnabled('newUIV2'));
  // }, []);

  useEffect(() => {
    if (isFeatureEnabled('newUIV2')) {
      setShowNewUI(true);
    }
  }, []);

  return (
    <div>
      {showNewUI ? <p>Showing new UI V2!</p> : <p>Showing old UI.</p>}
      {/* ... other component logic ... */}
    </div>
  );
}

export default MyComponent;
```

### How it Works

The `@test-pod/feature-flags` package, when `initFeatureFlags` is called (server-side), reads the specified JSON configuration file and caches the toggle states in memory.
Subsequent calls to `isFeatureEnabled` or `getFeatureToggles` (from server or client) access these cached values.

### Adding a New Feature Toggle

1.  **Define the toggle:** Add a new entry (e.g., `"myAwesomeFeature": true`) to the `config/feature-toggles.json` file.
2.  **Initialize (if new app):** Ensure the application consuming the toggle calls `initFeatureFlags` correctly at startup (see example above).
3.  **Use in code:** Import `isFeatureEnabled` from `@test-pod/feature-flags` and use it to check the toggle's state.
4.  **Test:** Ensure your feature behaves correctly with the toggle on and off.

### Important Considerations

*   **Initialization is Key:** `initFeatureFlags` **must** be called on the server-side before any feature flags are reliably checked. While there's a fallback to default initialization, relying on it is not recommended for production.
*   **Server-Side Operation:** Reading the JSON configuration file is a server-side operation. The values are then available to client-side code via the imported functions because the toggle states are stored in a module-level variable initialized on the server.
*   **Caching & Updates:** The toggles are read once when `initFeatureFlags` successfully executes. If the `config/feature-toggles.json` file changes on the server, the application process must be restarted for the changes to take effect. This system is not for dynamic, real-time feature flag updates without a restart/redeploy. For such scenarios, a dedicated feature flag service would be more appropriate.
*   **Error Handling:** If `config/feature-toggles.json` is missing or malformed during `initFeatureFlags`, all features will be treated as disabled, and an error/warning will be logged via the configured logger (console by default).
*   **Monorepo Scope:** The `@test-pod/feature-flags` package can be used by any application within the monorepo. Each application will need to call `initFeatureFlags` appropriately.

### Testing Toggles

**Testing the `@test-pod/feature-flags` package itself:**
Unit tests are located in `packages/feature-flags/src/index.test.ts`. These mock `fs-extra` to simulate different states of the JSON configuration.

**Testing components that *use* feature toggles:**
You can mock the `isFeatureEnabled` function from the `@test-pod/feature-flags` package.

```tsx
// Example in a component test (e.g., apps/app/src/components/MyComponent.test.tsx)
import { isFeatureEnabled } from '@test-pod/feature-flags';

jest.mock('@test-pod/feature-flags', () => ({
  ...jest.requireActual('@test-pod/feature-flags'), // Import and retain other exports
  isFeatureEnabled: jest.fn(),
}));

describe('MyComponent', () => {
  it('shows new UI when feature is enabled', () => {
    (isFeatureEnabled as jest.Mock).mockReturnValue(true);
    // ... render component and assert ...
  });

  it('shows old UI when feature is disabled', () => {
    (isFeatureEnabled as jest.Mock).mockReturnValue(false);
    // ... render component and assert ...
  });
});
```
This allows testing both branches of your component's logic based on the mocked toggle state.
Remember to also include `resetFeatureFlagsForTesting` from `@test-pod/feature-flags` in your Jest `setupFilesAfterEnv` or relevant test `beforeEach/afterEach` if your tests involve multiple `initFeatureFlags` calls or rely on a clean state.
Alternatively, for components, directly mocking `isFeatureEnabled` as shown above is often simpler.
