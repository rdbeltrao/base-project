export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
        }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    coverageDirectory: './coverage',
    collectCoverageFrom: ['src/**/*.{ts,tsx}'],
    // Remova esta linha se o arquivo não existir
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
