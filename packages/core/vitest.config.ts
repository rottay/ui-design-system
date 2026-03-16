import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isCoverage = !!process.env.COVERAGE;

/**
 * Integration/engine test patterns:
 *   *.integration.test.*
 *   *.real-engines.test.*
 *   *.engine-advanced.test.*
 *   *-engine.test.*
 *   *-engine-advanced.test.*
 */
const integrationPatterns = [
  'src/**/*.integration.test.{ts,tsx}',
  'src/**/*.real-engines.test.{ts,tsx}',
  'src/**/*.engine-advanced.test.{ts,tsx}',
  'src/**/*-engine.test.{ts,tsx}',
  'src/**/*-engine-advanced.test.{ts,tsx}',
];

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/testing/test-setup.ts',
    css: true,
    pool: 'forks',
    // Each fork loads React + Ant Design + engine tree (~1-2 GB per worker).
    // With 220+ unit test files, a single long-lived fork accumulates heap
    // and OOMs on Node 25.x. Using singleFork: false creates a fresh fork
    // per file, preventing heap accumulation at the cost of slower startup.
    // Coverage stays single-fork (V8 instrumentation needs persistence).
    ...(isCoverage
      ? { maxWorkers: 1, minWorkers: 1 }
      : { maxWorkers: 3, minWorkers: 1 }),
    poolOptions: {
      forks: {
        singleFork: isCoverage,
      },
    },
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
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [
            ...integrationPatterns,
            'node_modules/**',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: integrationPatterns,
          testTimeout: 30000,
          hookTimeout: 30000,
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
