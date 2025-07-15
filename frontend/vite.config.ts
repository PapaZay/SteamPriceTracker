import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/search_games': 'http://localhost:8000',
      '/track-price': 'http://localhost:8000',
      '/tracked': 'http://localhost:8000',
      '/price': 'http://localhost:8000'
    }
  }
})
