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
    setupFiles: './src/tooling/testing/setup/index.ts',
    css: true,
    pool: 'forks',
    // Each fork loads React + Ant Design + engine tree (~1-2 GB per worker).
    // With 390+ test files, multiple concurrent forks easily exceed 16GB.
    // Using singleFork: false creates a fresh fork per file, preventing heap
    // accumulation. Coverage stays single-fork (V8 instrumentation needs
    // persistence). Default to 1 worker to stay under 8GB heap on CI/local.
    maxWorkers: isCoverage ? 1 : 1,
    minWorkers: 1,
    poolOptions: {
      forks: {
        singleFork: isCoverage,
      },
    },
    testTimeout: 15000,
    hookTimeout: 15000,
    retry: 1,
    reporters: ['verbose'],
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
        'src/tooling/testing/setup/index.ts',
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
      '@ui': resolve(__dirname, './src/ui'),
    },
  },
});
