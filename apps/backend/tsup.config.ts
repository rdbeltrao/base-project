import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'api/index': './src/vercel.ts',
    'api/app': './src/app.ts',
  },
  outDir: './',
  target: 'node20',
  format: ['cjs'],
  bundle: true,
  splitting: false,
  noExternal: ['@test-pod/database'],
  external: ['pg', 'redis', 'bcryptjs', 'pg-hstore', 'sequelize'],
  dts: false,
  sourcemap: false,
  clean: false,
  minify: false,
  platform: 'node',
})
