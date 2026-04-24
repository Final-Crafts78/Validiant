import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        signin: resolve(__dirname, 'signin.html')
      },
      output: {
        manualChunks: {
          vendor: []
        }
      }
    }
  }
});
