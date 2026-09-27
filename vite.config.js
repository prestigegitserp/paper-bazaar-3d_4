import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/paper-bazaar-3d_4/',
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: true,
  },
})
