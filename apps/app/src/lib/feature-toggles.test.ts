// No top-level import of 'fs' here, as we'll mock it per test using jest.doMock
import path from 'path';   // For EXPECTED_CONFIG_PATH calculation

const EXPECTED_CONFIG_PATH = path.resolve('/app/apps/app', '../../config/feature-toggles.json');

describe('Feature Toggles', () => {
  let originalProcessCwd: () => string;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  // These will hold the mock functions created by jest.doMock for each test
  let currentMockedExistsSync: jest.Mock;
  let currentMockedReadFileSync: jest.Mock;

  beforeAll(() => {
    originalProcessCwd = process.cwd;
    process.cwd = jest.fn(() => '/app/apps/app');
  });

  afterAll(() => {
    process.cwd = originalProcessCwd;
  });

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset modules before each test to ensure jest.doMock is effective for the fresh require
    jest.resetModules();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    // jest.resetModules(); // Already in beforeEach, which is better for doMock
  });

  describe('isFeatureEnabled', () => {
    it('should return true if the feature is enabled in the JSON file', () => {
      currentMockedExistsSync = jest.fn(p => p === EXPECTED_CONFIG_PATH);
      currentMockedReadFileSync = jest.fn(p => {
        if (p === EXPECTED_CONFIG_PATH) return JSON.stringify({ testFeature: true });
        throw new Error(`fs.readFileSync mock called with unexpected path: ${p}`);
      });
      jest.doMock('fs', () => ({ existsSync: currentMockedExistsSync, readFileSync: currentMockedReadFileSync }));

      const { isFeatureEnabled } = require('./feature-toggles');
      expect(isFeatureEnabled('testFeature')).toBe(true);
      expect(currentMockedExistsSync).toHaveBeenCalledWith(EXPECTED_CONFIG_PATH);
      expect(currentMockedReadFileSync).toHaveBeenCalledWith(EXPECTED_CONFIG_PATH, 'utf-8');
    });

    it('should return false if the feature is disabled in the JSON file', () => {
      currentMockedExistsSync = jest.fn(p => p === EXPECTED_CONFIG_PATH);
      currentMockedReadFileSync = jest.fn(p => {
        if (p === EXPECTED_CONFIG_PATH) return JSON.stringify({ testFeature: false });
        throw new Error(`fs.readFileSync mock called with unexpected path: ${p}`);
      });
      jest.doMock('fs', () => ({ existsSync: currentMockedExistsSync, readFileSync: currentMockedReadFileSync }));

      const { isFeatureEnabled } = require('./feature-toggles');
      expect(isFeatureEnabled('testFeature')).toBe(false);
    });

    it('should return false if the feature is not in the JSON file', () => {
      currentMockedExistsSync = jest.fn(p => p === EXPECTED_CONFIG_PATH);
      currentMockedReadFileSync = jest.fn(p => {
        if (p === EXPECTED_CONFIG_PATH) return JSON.stringify({ anotherFeature: true });
        throw new Error(`fs.readFileSync mock called with unexpected path: ${p}`);
      });
      jest.doMock('fs', () => ({ existsSync: currentMockedExistsSync, readFileSync: currentMockedReadFileSync }));

      const { isFeatureEnabled } = require('./feature-toggles');
      expect(isFeatureEnabled('testFeature')).toBe(false);
    });

    it('should return false if the JSON file does not exist', () => {
      currentMockedExistsSync = jest.fn(p => {
        if (p === EXPECTED_CONFIG_PATH) return false;
        throw new Error(`fs.existsSync mock called with unexpected path: ${p}`);
      });
      currentMockedReadFileSync = jest.fn(); // Should not be called
      jest.doMock('fs', () => ({ existsSync: currentMockedExistsSync, readFileSync: currentMockedReadFileSync }));

      const { isFeatureEnabled } = require('./feature-toggles');
      expect(isFeatureEnabled('testFeature')).toBe(false);
      expect(currentMockedExistsSync).toHaveBeenCalledWith(EXPECTED_CONFIG_PATH);
      expect(currentMockedReadFileSync).not.toHaveBeenCalled();
    });

    it('should return false if the JSON file is invalid', () => {
      currentMockedExistsSync = jest.fn(p => p === EXPECTED_CONFIG_PATH);
      currentMockedReadFileSync = jest.fn(p => {
        if (p === EXPECTED_CONFIG_PATH) return 'invalid json';
        throw new Error(`fs.readFileSync mock called with unexpected path: ${p}`);
      });
      jest.doMock('fs', () => ({ existsSync: currentMockedExistsSync, readFileSync: currentMockedReadFileSync }));

      const { isFeatureEnabled } = require('./feature-toggles');
      expect(isFeatureEnabled('testFeature')).toBe(false);
    });
  });

  describe('getFeatureToggles', () => {
    it('should return all feature toggles from the JSON file', () => {
      const mockToggles = { featureA: true, featureB: false };
      currentMockedExistsSync = jest.fn(p => p === EXPECTED_CONFIG_PATH);
      currentMockedReadFileSync = jest.fn(p => {
        if (p === EXPECTED_CONFIG_PATH) return JSON.stringify(mockToggles);
        throw new Error(`fs.readFileSync mock called with unexpected path: ${p}`);
      });
      jest.doMock('fs', () => ({ existsSync: currentMockedExistsSync, readFileSync: currentMockedReadFileSync }));

      const { getFeatureToggles } = require('./feature-toggles');
      expect(getFeatureToggles()).toEqual(mockToggles);
      expect(currentMockedExistsSync).toHaveBeenCalledWith(EXPECTED_CONFIG_PATH);
      expect(currentMockedReadFileSync).toHaveBeenCalledWith(EXPECTED_CONFIG_PATH, 'utf-8');
    });

    it('should return an empty object if the JSON file does not exist', () => {
      currentMockedExistsSync = jest.fn(p => {
        if (p === EXPECTED_CONFIG_PATH) return false;
        throw new Error(`fs.existsSync mock called with unexpected path: ${p}`);
      });
      currentMockedReadFileSync = jest.fn();
      jest.doMock('fs', () => ({ existsSync: currentMockedExistsSync, readFileSync: currentMockedReadFileSync }));

      const { getFeatureToggles } = require('./feature-toggles');
      expect(getFeatureToggles()).toEqual({});
    });

    it('should return an empty object if the JSON file is invalid', () => {
      currentMockedExistsSync = jest.fn(p => p === EXPECTED_CONFIG_PATH);
      currentMockedReadFileSync = jest.fn(p => {
        if (p === EXPECTED_CONFIG_PATH) return 'invalid json';
        throw new Error(`fs.readFileSync mock called with unexpected path: ${p}`);
      });
      jest.doMock('fs', () => ({ existsSync: currentMockedExistsSync, readFileSync: currentMockedReadFileSync }));

      const { getFeatureToggles } = require('./feature-toggles');
      expect(getFeatureToggles()).toEqual({});
    });
  });
});
