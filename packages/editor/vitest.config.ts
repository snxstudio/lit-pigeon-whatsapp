import { defineConfig } from 'vitest/config';

// Components render against a DOM, so run tests in happy-dom.
export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
});
