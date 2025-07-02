import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'dist',
    target: 'node20',
    format: ['esm'],
    dts: false,
    bundle: false,
    splitting: false,
    sourcemap: false,
    clean: true,
  },
])
