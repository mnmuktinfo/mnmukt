import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },

  build: {
    target: "esnext",
    sourcemap: true,
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
})