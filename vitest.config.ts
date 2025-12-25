import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/renderer/src/__tests__/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/renderer/src/components/**/*.{ts,tsx}',
        'src/renderer/src/extensions/**/*.{ts,tsx}'
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}'
      ]
    }
  },
  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, './src/renderer/src'),
      '@main': path.resolve(__dirname, './src/main'),
      '@': path.resolve(__dirname, './src')
    }
  }
})
