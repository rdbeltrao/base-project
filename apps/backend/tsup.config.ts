import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { 'api/index': 'src/vercel.ts' },
  outDir: './',
  target: 'node20',
  format: ['cjs'],
  bundle: true,
  splitting: false,
  dts: false,
  sourcemap: false,
  clean: false,
  minify: false,
  noExternal: ['@test-pod/database'],
  platform: 'node',
})
