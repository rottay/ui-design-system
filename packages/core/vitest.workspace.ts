import { defineWorkspace } from 'vitest/config';

/**
 * Vitest workspace: separates fast unit tests from heavy integration and
 * engine-advanced tests so that `test:unit` can give near-instant feedback
 * while `test:run` and CI still execute the full suite.
 *
 * Integration/engine test patterns:
 *   *.integration.test.*
 *   *.real-engines.test.*
 *   *.engine-advanced.test.*
 *   *-engine.test.*
 *   *-engine-advanced.test.*
 */
export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      include: ['src/**/*.test.{ts,tsx}'],
      exclude: [
        'src/**/*.integration.test.{ts,tsx}',
        'src/**/*.real-engines.test.{ts,tsx}',
        'src/**/*.engine-advanced.test.{ts,tsx}',
        'src/**/*-engine.test.{ts,tsx}',
        'src/**/*-engine-advanced.test.{ts,tsx}',
        'node_modules/**',
      ],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'integration',
      include: [
        'src/**/*.integration.test.{ts,tsx}',
        'src/**/*.real-engines.test.{ts,tsx}',
        'src/**/*.engine-advanced.test.{ts,tsx}',
        'src/**/*-engine.test.{ts,tsx}',
        'src/**/*-engine-advanced.test.{ts,tsx}',
      ],
      // Engine tests are heavier; give them more headroom.
      testTimeout: 30000,
      hookTimeout: 30000,
    },
  },
]);
