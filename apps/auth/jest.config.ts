import base from '@test-pod/jest-config'

const config = {
  ...base,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

export default config
