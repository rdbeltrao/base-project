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

### Usage in Code (Next.js App - `apps/app`)

The `apps/app` Next.js application uses a utility module to access feature toggle states.

**Location:** `apps/app/src/lib/feature-toggles.ts`

**Functions:**

*   `isFeatureEnabled(featureName: string): boolean`:
    *   Accepts the name of the feature (string) as defined in `config/feature-toggles.json`.
    *   Returns `true` if the feature is enabled, `false` otherwise.
    *   If the feature name is not found in the configuration file, or if the file itself is missing or invalid, the feature is considered disabled (returns `false`). Console warnings/errors will indicate such issues.

*   `getFeatureToggles(): { [key: string]: boolean }`:
    *   Returns an object containing all feature toggles and their current states as read from the configuration file.
    *   Returns an empty object (`{}`) if the configuration file is missing or invalid.

**Example (React Component):**

```tsx
import { useEffect, useState } from 'react';
import { isFeatureEnabled } from '../../../lib/feature-toggles'; // Adjust path as needed

function MyComponent() {
  const [showNewUI, setShowNewUI] = useState(false);

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

The `feature-toggles.ts` module reads the `config/feature-toggles.json` file when the application initializes (or when the module is first loaded). It caches these values.
The path to the configuration file is resolved relative to the `apps/app` working directory, assuming the service runs from there, pointing to `../../config/feature-toggles.json`.

### Adding a New Feature Toggle

1.  **Define the toggle:** Add a new entry (e.g., `"myAwesomeFeature": true`) to the `config/feature-toggles.json` file.
2.  **Use in code:** In your application code (e.g., `apps/app`), use `isFeatureEnabled("myAwesomeFeature")` to check its state and conditionally render UI or execute logic.
3.  **Test:** Ensure your feature behaves correctly with the toggle on and off. Consider adding unit/integration tests for the toggled behavior if appropriate.

### Important Considerations

*   **Server-Side vs. Client-Side:** The current implementation of `feature-toggles.ts` reads the JSON file on the server-side (or at build time if used in getStaticProps/getServerSideProps without dynamic reading). If `isFeatureEnabled` is called only on the client-side (e.g., in a `useEffect` hook as shown), the toggles are effectively determined when the client-side code runs.
    *   If you need toggles that can change without a rebuild/redeploy and affect server-rendered content immediately, a more dynamic configuration loading mechanism (e.g., from a database or a feature flag service) would be required. The current system is file-based.
*   **Caching:** The toggles are read once when the `feature-toggles.ts` module is loaded. If the JSON file changes, the application server (if running) would typically need a restart for the changes to be reflected, unless the module is re-evaluated.
*   **Error Handling:** If `config/feature-toggles.json` is missing or malformed, all features will be treated as disabled, and a warning/error will be logged to the console.
*   **Scope:** This documentation primarily covers usage within the `apps/app` Next.js application. Other applications in the monorepo would need their own mechanism or a shared package to read these toggles if they also need to be feature-flagged by the same configuration.

### Testing Toggles

Unit tests for the `feature-toggles.ts` utility itself are located in `apps/app/src/lib/feature-toggles.test.ts`. These tests mock the `fs` module to simulate different states of the JSON configuration file (e.g., file missing, feature enabled/disabled, invalid JSON).
When testing components that *use* feature toggles, you can mock the `isFeatureEnabled` function:

```tsx
// Example in a component test:
// import * as FeatureToggles from '../path/to/feature-toggles';

// jest.spyOn(FeatureToggles, 'isFeatureEnabled').mockReturnValue(true); // or false
```
This allows you to test both branches of your component's logic.
