import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/organizer/', // Setze hier die Basis-URL, die dein Server nutzt
  server: {
    port: 5173,
    open: true,
  },
  build: {
    maxChunkSize: 200000, // Setze die maximale Chunk-Größe auf 200 KB
    chunkSizeWarningLimit: 2000, // Setze die Warnung für Chunk-Größe auf 2 MB
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
