import { defineConfig } from 'vite';

// Plain single-page app: Vite uses index.html as the entry and bundles the
// workspace packages (@lit-pigeon/whatsapp-editor + core) into the output.
// Relative base so built assets resolve under the GitHub Pages project path
// (https://snxstudio.github.io/lit-pigeon-whatsapp/).
export default defineConfig({
  base: './',
});
