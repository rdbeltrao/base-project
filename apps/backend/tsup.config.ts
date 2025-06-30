import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/app.ts'],
    outDir: 'dist',
    target: 'node20',
    format: ['cjs'],
    bundle: true,
    splitting: false,
    dts: true,
    sourcemap: false,
    clean: true,
    external: ['pg', 'pg-hstore', '@test-pod/database'],
    esbuildOptions(options) {
      options.resolveExtensions = ['.ts', '.js', '.json']
    },
  },
  {
    entry: ['api/index.ts'],
    outDir: 'api',
    outExtension() {
      return {
        js: '.js',
      }
    },
    target: 'node20',
    format: ['cjs'],
    bundle: true,
    splitting: false,
    dts: false,
    sourcemap: false,
    clean: false,
    external: ['pg', 'pg-hstore', '@test-pod/database'],
    esbuildOptions(options) {
      options.resolveExtensions = ['.ts', '.js', '.json']
      options.platform = 'node'
      options.mainFields = ['module', 'main']
    },
    shims: false,
  },
])
