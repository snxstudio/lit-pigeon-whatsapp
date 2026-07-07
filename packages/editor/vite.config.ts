import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// Library build: emit ES modules and type declarations, leaving `lit` and the
// core package to be resolved by the consumer.
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [/^lit(\/.*)?$/, /^@lit-pigeon\/whatsapp-core(\/.*)?$/],
    },
    sourcemap: true,
  },
  plugins: [dts({ tsconfigPath: './tsconfig.json', rollupTypes: true })],
});
