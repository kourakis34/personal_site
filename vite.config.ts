import { defineConfig } from 'vite'

export default defineConfig({
  // Served from https://kourakis34.github.io/personal_site/
  base: '/personal_site/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    target: 'ES2020'
  }
})
