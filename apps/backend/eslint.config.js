import config from '@test-pod/eslint-config/base'

export default [
  ...config,
  {
    ignores: ['dist/**', 'node_modules/**', '.next/**', 'api/**'],
  },
]
