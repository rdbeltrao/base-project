import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/app.ts',
    },
    outDir: 'api',
    target: 'node20',
    format: ['cjs'],
    bundle: true,
    splitting: false,
    dts: true,
    sourcemap: false,
    clean: true,
    noExternal: ['@test-pod/database'],
  },
])
