import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Caminhos relativos: o mesmo build funciona na raiz (Vercel, domínio próprio)
  // e em subpasta (GitHub Pages: usuario.github.io/nome-do-repositorio/).
  base: './',
  plugins: [vue(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/gsap') ? 'gsap' : undefined),
      },
    },
  },
})
