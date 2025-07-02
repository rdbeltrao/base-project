import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  external: ['react'], // if you have react as a peerDependency
  outDir: 'dist',
})
