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
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        signin: resolve(__dirname, 'signin.html')
      },
      output: {
        manualChunks(id) {
          // Map engines — only loaded when user navigates to map views
          if (id.includes('googleMapsEngine') || id.includes('leafletEngine')) {
            return 'map-engines';
          }
          // Bulk upload — only loaded on admin bulk upload action
          if (id.includes('bulkUpload')) {
            return 'bulk-upload';
          }
        },
        // Content-hashed filenames for long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
