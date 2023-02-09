import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    alias: {
      'firestore-vitest-mock': './index.ts'
    }
  },
})