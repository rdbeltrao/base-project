import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/app.ts'],
  outDir: 'dist',
  target: 'node20',
  format: ['cjs'],  // Usar apenas CommonJS para simplicidade
  bundle: true,
  splitting: false,
  dts: true,
  sourcemap: false,
  clean: true,
  noExternal: ['@test-pod/database'],  // Incluir o pacote database no bundle
  esbuildOptions(options) {
    options.resolveExtensions = ['.ts', '.js', '.json']
  },
})
