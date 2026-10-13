import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Durante desarrollo, el proxy de abajo reenvía cualquier llamada a /api
// hacia el backend de Spring Boot en localhost:8080, así evitamos
// problemas de CORS mientras no esté configurado en el backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
