import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: './src/vercel.ts',
  },
  outDir: './dist',
  target: 'node20',
  format: ['cjs'],
  bundle: true,
  splitting: false,
  noExternal: ['@test-pod/database'],
  external: ['pg', 'redis', 'bcryptjs', 'pg-hstore', 'sequelize'],
  dts: false,
  sourcemap: false,
  clean: false,
})
