import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The client calls relative /api/... URLs; in dev they are forwarded to the service (no CORS needed).
    proxy: { '/api': 'http://localhost:3001' },
  },
})
