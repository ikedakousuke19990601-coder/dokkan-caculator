import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      // 受け入れ基準(a) を担保する計算ロジックだけを対象にする
      include: ['src/logic/**/*.ts'],
      exclude: ['src/logic/**/*.test.ts'],
      // テストのない分岐を追加したら CI で気づけるようにする
      thresholds: { 100: true },
    },
  },
})
