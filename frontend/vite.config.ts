import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      // /api/* kéréseket a Vite szerver oldalon proxyzza a backendhez.
      // BACKEND_URL: Docker-ben a service neve "backend", lokálisan localhost.
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
