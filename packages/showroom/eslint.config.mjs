import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import { rules as designSystemRules } from '@rottay/design-system/eslint';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Only the consumer-contract rule: the recommended preset's raw-HTML and
    // color rules would add new reds to the marketing tree.
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    plugins: { '@rottay': { rules: designSystemRules } },
    rules: {
      '@rottay/no-unsanctioned-ds-subpath': [
        'error',
        {
          // Measured baseline of unsanctioned subpaths the probes still import.
          // Decrease-only; pinned by the design system's own rule test.
          allowSubpaths: [
            './icons/foundation',
            './icons/identity',
            './icons/intelligence',
            './icons/operations',
            './pictograms',
            './runtime/root-attributes',
            './runtime/visual-authority',
            './spatial',
            './tenant-theme-canary-fixtures',
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
