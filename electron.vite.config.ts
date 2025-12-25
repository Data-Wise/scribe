import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron/main',
      rollupOptions: {
        external: ['electron']
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      outDir: 'dist-electron/preload',
      rollupOptions: {
        external: ['electron']
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'dist-electron/renderer',
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html')
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
