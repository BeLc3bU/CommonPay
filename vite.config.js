import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: []
  }
});
