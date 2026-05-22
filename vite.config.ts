import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ============================================================
//  CareSync — Vite Config (Fase 7: PWA)
// ============================================================
export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    // Optimizar chunks para PWA
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    // Aumentar límite de advertencia de chunk
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Permitir acceso desde red local (para probar en celular)
    host: true,
    port: 5173,
  },
})
