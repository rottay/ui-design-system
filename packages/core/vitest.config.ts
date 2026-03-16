import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isCoverage = !!process.env.COVERAGE;

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/testing/test-setup.ts',
    css: true,
    pool: 'forks',
    // Under coverage, V8 instrumentation + heavy engine files cause resource
    // contention that produces flaky timeouts. Restrict to a single worker only
    // for coverage runs; normal test runs use half the available CPUs.
    ...(isCoverage
      ? { maxWorkers: 1, minWorkers: 1 }
      : { maxWorkers: '50%', minWorkers: 1 }),
    testTimeout: 15000,
    hookTimeout: 15000,
    retry: 1,
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json',
    },
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
