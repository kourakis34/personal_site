import { defineConfig } from 'vite'

export default defineConfig({
  // Served from https://nickkourakis.com/
  base: '/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'ES2020'
  }
})
