import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { aliases } from './vite.config.ts';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  resolve: { alias: aliases },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'src',
          include: ['src/**/*.test.ts'],
          // src/ is backend-shaped: it must run without a DOM.
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'tooling',
          include: ['scripts/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        extends: true,
        test: {
          name: 'app',
          include: ['app/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          testTimeout: 20000,
          setupFiles: ['app/test/setup.ts'],
        },
      },
    ],
  },
});
