import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    target: 'node20',
    format: ['cjs'],
    dts: true,
    bundle: true,
    splitting: false,
    sourcemap: false,
    clean: true,
  },
])
