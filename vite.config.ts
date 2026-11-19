/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/services/**/*.ts', 'src/controllers/**/*.ts', 'src/repositories/**/*.ts', 'src/utils/**/*.ts'],
      exclude: ['**/*.test.ts'],
      reporter: ['text-summary', 'text', 'html'],
    },
  },
})
