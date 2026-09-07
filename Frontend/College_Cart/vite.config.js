import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // The app carried ~50 console.log calls, several of them dumping request and
  // response bodies (the chatbot logged every question and reply, the socket
  // logged every message). Marking them pure lets esbuild drop them from
  // production builds while they keep working in `vite dev`.
  // console.error and console.warn are deliberately not listed - real failures
  // should still surface in a deployed build.
  esbuild: {
    pure: ['console.log', 'console.debug', 'console.info'],
  },

  build: {
    // Modern baseline. The default ('modules') already excludes legacy
    // browsers; naming the targets explicitly stops esbuild emitting
    // transforms and helpers no supported browser needs.
    target: 'es2020',

    // The app shipped as one 761 kB chunk, so every visitor downloaded and
    // parsed the checkout, chat, profile and messaging code before the home
    // page could paint. Routes are lazily imported in App.jsx; these groups
    // split the vendor half so the long-lived libraries stay cached across
    // deploys instead of being invalidated by any application change.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-saga'],
          // framer-motion is deliberately NOT grouped here. It is only used by
          // lazily loaded routes (profile, product details, cart), and naming it
          // as a manual chunk promoted it into the entry's static import graph,
          // so index.html module-preloaded ~38 kB gzipped for every visitor.
          // Left alone, Rollup emits it as a shared chunk fetched on demand.
        },
      },
    },

    // Raised only because the vendor groups above are legitimately large and
    // cache well; application chunks stay far below it.
    chunkSizeWarningLimit: 700,

    // Source maps make a production stack trace readable. They are separate
    // files, so they cost users nothing unless devtools is open.
    sourcemap: true,

    // Inline anything under 4 kB (small icons, the odd svg) to save a request.
    assetsInlineLimit: 4096,

    cssTarget: 'chrome90',
  },

  // Pre-bundle the heavy dependencies once instead of on first navigation,
  // which is what made the very first route change feel sluggish in dev.
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
