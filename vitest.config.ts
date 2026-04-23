import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/playwright/**', '**/*.spec.tsx', 'tests/api/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
