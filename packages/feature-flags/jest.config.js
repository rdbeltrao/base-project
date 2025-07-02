/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Handle module aliases (if you have them in tsconfig.json)
    // '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
};
