import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/app.ts'],
    outDir: 'dist',
    target: 'node20',
    format: ['cjs'],
    bundle: true,
    splitting: false,
    dts: true,
    sourcemap: false,
    clean: true,
    external: ['pg', 'pg-hstore'],
    noExternal: ['@test-pod/database'],
  },
])
