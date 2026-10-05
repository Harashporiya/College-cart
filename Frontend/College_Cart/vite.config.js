import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  esbuild: {
    pure: ['console.log', 'console.debug', 'console.info'],
  },

  build: {
    target: 'es2020',

    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-saga'],
        },
      },
    },

    chunkSizeWarningLimit: 700,

    sourcemap: true,

    assetsInlineLimit: 4096,

    cssTarget: 'chrome90',
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
