import fs from 'fs';
import path from 'path';

const FEATURE_TOGGLES_PATH = path.resolve(process.cwd(), '../../config/feature-toggles.json');

interface FeatureToggles {
  [key: string]: boolean;
}

let toggles: FeatureToggles = {};

try {
  if (fs.existsSync(FEATURE_TOGGLES_PATH)) {
    const fileContent = fs.readFileSync(FEATURE_TOGGLES_PATH, 'utf-8');
    toggles = JSON.parse(fileContent);
  } else {
    console.warn(`Feature toggles file not found at ${FEATURE_TOGGLES_PATH}. All features will be considered disabled.`);
  }
} catch (error) {
  console.error('Error loading feature toggles:', error);
  // In case of an error (e.g., invalid JSON), treat all toggles as disabled
  toggles = {};
}

export const isFeatureEnabled = (featureName: string): boolean => {
  return !!toggles[featureName];
};

export const getFeatureToggles = (): FeatureToggles => {
  return { ...toggles };
};
