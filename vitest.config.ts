import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/renderer/src/__tests__/setup.ts',

    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],

      // Include all source code for coverage analysis
      include: [
        'src/renderer/src/components/**/*.{ts,tsx}',
        'src/renderer/src/extensions/**/*.{ts,tsx}',
        'src/renderer/src/lib/**/*.{ts,tsx}',
        'src/renderer/src/store/**/*.{ts,tsx}',
        'src/renderer/src/hooks/**/*.{ts,tsx}',
        'src/renderer/src/utils/**/*.{ts,tsx}',
      ],

      // Exclude test files, setup files, and type definitions
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/setup.ts',
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/types/**',
        'node_modules/**',
        'dist/**',
      ],

      // Coverage thresholds - Phase 5: Quality baseline
      // Actual coverage (full suite): Lines 57.78%, Functions 54.9%, Branches 58.31%, Statements 57.14%
      // Set conservative baseline at 55% to establish quality floor with room for fluctuation
      thresholds: {
        lines: 55,
        functions: 50,
        branches: 55,
        statements: 55,
      },

      // Report uncovered lines
      all: true,
      clean: true,
      cleanOnRerun: true,
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
