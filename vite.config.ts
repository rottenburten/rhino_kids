import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // LAN/dış arayüzlerde dinle (telefon + tünel erişimi)
    // Cloudflare tüneli (*.trycloudflare.com) gibi dış host'ları kabul et.
    allowedHosts: true,
  },
})
