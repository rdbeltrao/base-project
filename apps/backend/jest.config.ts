import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test-pod/database$': '<rootDir>/../../packages/database/src/index.ts',
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testTimeout: 10000,
}

export default config
