import path from 'path';
// Do NOT import from './index' here. We will require it dynamically after mocks.

const MONOREPO_ROOT_CONFIG_PATH = path.resolve(process.cwd(), '../../config/feature-toggles.json');

describe('Feature Flags Package', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  // These will hold the mock functions for fs-extra methods for each test
  let mockExistsSync: jest.Mock;
  let mockReadFileSync: jest.Mock;

  // To store the dynamically required module functions for each test
  let featureFlagsModule: any;

  beforeEach(() => {
    // Spy on console messages
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset modules before each test to ensure jest.doMock is effective for the fresh require
    jest.resetModules();

    // Define the mocks that fs-extra will use for this test run
    mockExistsSync = jest.fn();
    mockReadFileSync = jest.fn();
    jest.doMock('fs-extra', () => ({
      // Provide the functions that fs-extra is expected to export and our module uses
      existsSync: mockExistsSync,
      readFileSync: mockReadFileSync,
    }));

    // Dynamically require the module AFTER mocks are set up
    featureFlagsModule = require('./index');
    // Reset internal state of the module using its own reset function before each test's logic
    featureFlagsModule.resetFeatureFlagsForTesting();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('initFeatureFlags', () => {
    it('should load toggles from the specified config file', () => {
      const mockToggles = { testFeature: true };
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockToggles));

      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });

      expect(mockExistsSync).toHaveBeenCalledWith(MONOREPO_ROOT_CONFIG_PATH);
      expect(mockReadFileSync).toHaveBeenCalledWith(MONOREPO_ROOT_CONFIG_PATH, 'utf-8');
      expect(featureFlagsModule.isFeatureEnabled('testFeature')).toBe(true);
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Feature Flags]', `Feature flags loaded from ${MONOREPO_ROOT_CONFIG_PATH}`);
    });

    it('should use default config path if none specified and file exists', () => {
      const mockToggles = { defaultPathFeature: true };
      const packageLocalDefaultConfigPath = path.resolve(process.cwd(), 'config/feature-toggles.json');
      mockExistsSync.mockImplementation(p => p === packageLocalDefaultConfigPath).mockReturnValue(true);
      mockReadFileSync.mockImplementation(p => {
          if (p === packageLocalDefaultConfigPath) return JSON.stringify(mockToggles);
          throw new Error('Read wrong file for default path');
      });

      featureFlagsModule.initFeatureFlags(); // No options

      expect(mockExistsSync).toHaveBeenCalledWith(packageLocalDefaultConfigPath);
      expect(featureFlagsModule.isFeatureEnabled('defaultPathFeature')).toBe(true);
    });

    it('should handle missing config file gracefully', () => {
      mockExistsSync.mockReturnValue(false);
      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });
      expect(featureFlagsModule.isFeatureEnabled('anyFeature')).toBe(false);
      expect(featureFlagsModule.getFeatureToggles()).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Feature Flags]', `Feature toggles file not found at ${MONOREPO_ROOT_CONFIG_PATH}. All features will be considered disabled.`);
    });

    it('should handle invalid JSON gracefully', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('invalid json');
      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });
      expect(featureFlagsModule.isFeatureEnabled('anyFeature')).toBe(false);
      expect(featureFlagsModule.getFeatureToggles()).toEqual({});
      expect(consoleErrorSpy).toHaveBeenCalledWith('[Feature Flags]', `Error loading feature toggles from ${MONOREPO_ROOT_CONFIG_PATH}:`, expect.any(Error));
    });

    it('should not re-initialize if already initialized', () => {
        mockExistsSync.mockReturnValue(true);
        mockReadFileSync.mockReturnValue(JSON.stringify({ f1: true}));
        featureFlagsModule.initFeatureFlags({configPath: 'path1'});
        expect(featureFlagsModule.isFeatureEnabled('f1')).toBe(true);

        // mockReadFileSync is already set up with the new return value for the *next* call if it were to happen
        mockReadFileSync.mockReturnValue(JSON.stringify({ f2: true}));
        featureFlagsModule.initFeatureFlags({configPath: 'path2'}); // Attempt re-init

        expect(featureFlagsModule.isFeatureEnabled('f1')).toBe(true);
        expect(featureFlagsModule.isFeatureEnabled('f2')).toBe(false); // Should not have loaded f2
        expect(consoleWarnSpy).toHaveBeenCalledWith('[Feature Flags]', 'Feature flags already initialized. Skipping re-initialization.');
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true if feature is enabled after init', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({ myFeature: true }));
      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });
      expect(featureFlagsModule.isFeatureEnabled('myFeature')).toBe(true);
    });

    it('should return false if feature is disabled after init', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({ myFeature: false }));
      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });
      expect(featureFlagsModule.isFeatureEnabled('myFeature')).toBe(false);
    });

    it('should return false if feature is not in config after init', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({ anotherFeature: true }));
      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });
      expect(featureFlagsModule.isFeatureEnabled('myFeature')).toBe(false);
    });

    it('should attempt default initialization if accessed before explicit init', () => {
        const packageLocalDefaultConfigPath = path.resolve(process.cwd(), 'config/feature-toggles.json');
        mockExistsSync.mockImplementation(p => p === packageLocalDefaultConfigPath).mockReturnValue(true);
        mockReadFileSync.mockReturnValue(JSON.stringify({ autoInitFeature: true }));

        // Not calling initFeatureFlags() explicitly before this
        expect(featureFlagsModule.isFeatureEnabled('autoInitFeature')).toBe(true);
        expect(consoleWarnSpy).toHaveBeenCalledWith('[Feature Flags]', 'Feature flags accessed before explicit initialization. Attempting default initialization.');
        expect(mockExistsSync).toHaveBeenCalledWith(packageLocalDefaultConfigPath);
    });
  });

  describe('getFeatureToggles', () => {
    it('should return all toggles after init', () => {
      const mockTogglesData = { featureA: true, featureB: false };
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockTogglesData));
      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });
      expect(featureFlagsModule.getFeatureToggles()).toEqual(mockTogglesData);
    });

    it('should return empty object if config file is missing after init', () => {
      mockExistsSync.mockReturnValue(false);
      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });
      expect(featureFlagsModule.getFeatureToggles()).toEqual({});
    });

    it('should attempt default initialization if accessed before explicit init', () => {
        const packageLocalDefaultConfigPath = path.resolve(process.cwd(), 'config/feature-toggles.json');
        mockExistsSync.mockImplementation(p => p === packageLocalDefaultConfigPath).mockReturnValue(true);
        mockReadFileSync.mockReturnValue(JSON.stringify({ autoInitFeatureGet: true }));

        expect(featureFlagsModule.getFeatureToggles()).toEqual({ autoInitFeatureGet: true });
        expect(consoleWarnSpy).toHaveBeenCalledWith('[Feature Flags]', 'Feature flags accessed before explicit initialization. Attempting default initialization.');
    });
  });

  describe('resetFeatureFlagsForTesting', () => {
    it('should clear loaded toggles and reset initialization state', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({ featureToReset: true }));
      featureFlagsModule.initFeatureFlags({ configPath: MONOREPO_ROOT_CONFIG_PATH });
      expect(featureFlagsModule.isFeatureEnabled('featureToReset')).toBe(true);

      featureFlagsModule.resetFeatureFlagsForTesting(); // Call the reset function

      // After reset, accessing a feature should trigger default initialization again
      const packageLocalDefaultConfigPath = path.resolve(process.cwd(), 'config/feature-toggles.json');
      // Ensure mocks are set for this new default initialization attempt
      mockExistsSync.mockImplementation(p => p === packageLocalDefaultConfigPath).mockReturnValue(false); // Simulate no file for default path now

      expect(featureFlagsModule.isFeatureEnabled('featureToReset')).toBe(false);
      expect(featureFlagsModule.getFeatureToggles()).toEqual({});
      expect(consoleWarnSpy).toHaveBeenCalledWith('[Feature Flags]', 'Feature flags accessed before explicit initialization. Attempting default initialization.');
    });
  });
});
