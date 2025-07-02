import fs from 'fs-extra'; // Using fs-extra as added in package.json
import path from 'path';

// Configuration for the feature toggles path
// Option 1: Assume a fixed structure relative to monorepo root
// This requires the package consuming this utility to be within a known depth or structure.
// Defaulting to monorepo root for 'config/feature-toggles.json'
// This path needs to be resolved from where the package is *used*, or made configurable.
// For now, let's make it configurable with a sensible default.

interface FeatureFlagOptions {
  configPath?: string;
  logger?: {
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
}

let toggles: { [key: string]: boolean } = {};
let initialized = false;
let effectiveConfigPath = '';

const defaultConfigPath = path.resolve(process.cwd(), 'config/feature-toggles.json');

const defaultLogger = {
  warn: (...args: any[]) => console.warn('[Feature Flags]', ...args),
  error: (...args: any[]) => console.error('[Feature Flags]', ...args),
};

let currentLogger = defaultLogger;

/**
 * Initializes the feature toggle system.
 * This function should be called once when the application starts.
 * @param options - Optional configuration for the feature toggle system.
 * @param options.configPath - Absolute path to the feature-toggles.json file.
 *                             Defaults to `path.resolve(process.cwd(), 'config/feature-toggles.json')`.
 *                             Note: `process.cwd()` will be the CWD of the consuming application.
 * @param options.logger - Optional logger object with `warn` and `error` methods. Defaults to console.
 */
export const initFeatureFlags = (options?: FeatureFlagOptions): void => {
  if (initialized) {
    currentLogger.warn('Feature flags already initialized. Skipping re-initialization.');
    return;
  }

  currentLogger = options?.logger || defaultLogger;
  effectiveConfigPath = options?.configPath || defaultConfigPath;

  // If default path is used, we need to adjust it if we are in `packages/feature-flags` context (e.g. during tests for the package itself)
  // This is a common challenge for shared packages needing root-level config.
  // A robust solution often involves the consuming app providing the explicit root path or config path.
  // The current default `path.resolve(process.cwd(), 'config/feature-toggles.json')` assumes `process.cwd()` is the monorepo root
  // or a location from which `config/feature-toggles.json` is directly accessible.
  // If an app (`apps/app`) calls this, `process.cwd()` for that app might be `monorepo_root/apps/app`.
  // So, `path.resolve(process.cwd(), '../../config/feature-toggles.json')` would be needed if called from app's main file.
  // For simplicity and forcing explicitness from consumer:
  // The provided `options.configPath` should be the *absolute* path.
  // If not provided, `defaultConfigPath` assumes CWD is monorepo root.
  // This might need refinement based on typical monorepo execution contexts.
  // For now, let's assume `effectiveConfigPath` is correctly set by the consumer or the default is fine for tests.


  try {
    if (fs.existsSync(effectiveConfigPath)) {
      const fileContent = fs.readFileSync(effectiveConfigPath, 'utf-8');
      toggles = JSON.parse(fileContent);
      currentLogger.warn(`Feature flags loaded from ${effectiveConfigPath}`);
    } else {
      currentLogger.warn(`Feature toggles file not found at ${effectiveConfigPath}. All features will be considered disabled.`);
      toggles = {};
    }
  } catch (error) {
    currentLogger.error(`Error loading feature toggles from ${effectiveConfigPath}:`, error);
    toggles = {}; // In case of an error, treat all toggles as disabled
  }
  initialized = true;
};

/**
 * Checks if a feature is enabled.
 * `initFeatureFlags` should be called before using this function.
 * @param featureName - The name of the feature.
 * @returns `true` if the feature is enabled, `false` otherwise.
 */
export const isFeatureEnabled = (featureName: string): boolean => {
  if (!initialized) {
    // Fallback to trying to initialize with defaults if not explicitly initialized.
    // This provides some resilience but explicit initialization is preferred.
    currentLogger.warn('Feature flags accessed before explicit initialization. Attempting default initialization.');
    initFeatureFlags();
  }
  return !!toggles[featureName];
};

/**
 * Gets all feature toggles.
 * `initFeatureFlags` should be called before using this function.
 * @returns An object containing all feature toggles and their states.
 */
export const getFeatureToggles = (): { [key: string]: boolean } => {
  if (!initialized) {
    currentLogger.warn('Feature flags accessed before explicit initialization. Attempting default initialization.');
    initFeatureFlags();
  }
  return { ...toggles };
};

/**
 * Resets the initialization state and clears loaded toggles.
 * Primarily for use in testing environments.
 */
export const resetFeatureFlagsForTesting = () => {
  toggles = {};
  initialized = false;
  currentLogger = defaultLogger;
  effectiveConfigPath = '';
};
