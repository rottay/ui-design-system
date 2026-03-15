import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/test-setup.ts',
    css: true,
    // The DS suite mixes lazy engines, Ant Design portals, and heavy jsdom usage.
    // Running in a single worker is slower, but it avoids the flaky timeouts we see
    // under coverage when several heavy integration files compete for resources.
    maxWorkers: 1,
    minWorkers: 1,
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: [
        'node_modules/',
        'src/testing/test-setup.ts',
        '**/*.stories.tsx',
        '**/*.d.ts',
        '**/*.md',
        '**/README.*',
        '**/EXAMPLES.*',
        '**/examples.tsx',
        '**/__test_imports.ts',
        'dist/',
        'storybook-static/',
        '.storybook/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
