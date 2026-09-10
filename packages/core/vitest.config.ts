import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isCoverage = !!process.env.COVERAGE;

/**
 * Files whose law has to hold on BOTH DOM runners, listed by name.
 *
 * `--environment jsdom` on the command line does NOT reach a project: a project
 * resolves its own environment, so the flag is accepted and ignored and every
 * "both runners" run is the default runner twice. These files are therefore
 * included by the `unit` project (happy-dom) AND by the `unit-jsdom` project
 * below, so a single `vitest run` executes each of them once per runner.
 */
const dualRunnerFiles = [
  'src/infrastructure/runtime/responsive/composition/react/provider/tests/ssr-viewport-hint.test.tsx',
];

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
  'tests/integration/**/*.test.{ts,tsx}',
  'tests/system/personality-primitives/index.test.tsx',
];

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './tests/setup/index.ts',
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
    // A retry turns a flaky suite into a green one. The whole point of this
    // programme is that a green run means a law holds, so a test that only
    // passes on the second attempt is a finding, not a nuisance.
    retry: 0,
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'artifacts/generated/reports/coverage',
      reporter: ['text', 'json', 'json-summary', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: [
        'node_modules/',
        'tests/setup/index.ts',
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
          // What this project CLAIMS to run on. A dual-runner file asserts the
          // runner it measures against this, so a project that silently
          // resolved a different environment is red rather than duplicated.
          env: { DS_DOM_RUNNER: 'happy-dom' },
          include: [
            'src/**/*.test.{ts,tsx}',
            'tests/architecture/**/*.test.{ts,tsx}',
            'tests/fixtures/**/*.test.{ts,tsx}',
            'tests/support/**/*.test.{ts,tsx}',
            'tests/system/**/*.test.{ts,tsx}',
          ],
          exclude: [
            ...integrationPatterns,
            'node_modules/**',
          ],
        },
      },
      {
        extends: true,
        test: {
          name: 'unit-jsdom',
          environment: 'jsdom',
          env: { DS_DOM_RUNNER: 'jsdom' },
          include: dualRunnerFiles,
          exclude: ['node_modules/**'],
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
      // The two PUBLIC specifiers, first so the '@' prefix below cannot claim
      // them. The consumer fixture (tests/integration/consumer) is written the
      // way an application writes it, against the package name; inside the
      // package that name resolves to the sources the published entrypoints
      // are built from, so a signature change is red without a build.
      '@rottay/design-system/icons': resolve(__dirname, './src/entrypoints/icons/index.ts'),
      '@rottay/design-system/server': resolve(__dirname, './src/entrypoints/server/index.ts'),
      '@rottay/design-system': resolve(__dirname, './src/index.ts'),
      '@': resolve(__dirname, './src'),
      '@ui': resolve(__dirname, './src/components'),
      '@checks': resolve(__dirname, './scripts/check'),
      '@tests': resolve(__dirname, './tests'),
    },
  },
});
