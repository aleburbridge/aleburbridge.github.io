import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Base path the app is served under: stuffbyalex.net/calisthenics-slop/
const BASE = '/calisthenics-slop/'

// Virtual module: 'virtual:corner-images'
// Reads public/images/corner/ at build time and exports an array of public URLs.
// Drop any image into that folder and it's automatically included on next build.
function cornerImagesPlugin() {
  const virtualId = 'virtual:corner-images'
  const resolvedId = '\0' + virtualId

  return {
    name: 'corner-images',
    resolveId(id: string) {
      if (id === virtualId) return resolvedId
    },
    load(id: string) {
      if (id !== resolvedId) return
      const dir = path.resolve(__dirname, 'public/images/corner/random')
      const urls = fs
        .readdirSync(dir)
        .filter(f => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f))
        .map(f => `${BASE}images/corner/random/${f}`)
      return `export default ${JSON.stringify(urls)};`
    },
  }
}

export default defineConfig({
  base: BASE,
  plugins: [react(), cornerImagesPlugin()],
  build: {
    // Build straight into the sibling folder that GitHub Pages serves at
    // stuffbyalex.net/calisthenics-slop/. Committed alongside this source.
    outDir: '../calisthenics-slop',
    emptyOutDir: true,
  },
})
