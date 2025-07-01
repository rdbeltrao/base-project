import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/vercel.ts',
    },
    outDir: './api',
    target: 'node20',
    format: ['cjs'],
    bundle: true,
    splitting: false,
    dts: false,
    sourcemap: false,
    clean: true,
    noExternal: ['@test-pod/database'],
  },
])
