import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages project site: https://buca.github.io/YHSIM/
  // All generated asset URLs must be relative to /YHSIM/, not the domain root.
  base: '/YHSIM/',
  plugins: [react()],
})
