import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This will make the server listen on all addresses
    port: 3800 // You can change this to any port you prefer
  }
})
