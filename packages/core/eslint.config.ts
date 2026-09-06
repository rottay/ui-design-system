/**
 * The design system, linted by the plugin the design system publishes.
 *
 * WHY THIS FILE DID NOT EXIST. `packages/core` shipped `@rottay/no-raw-html`,
 * `@rottay/no-hardcoded-colors`, `@rottay/no-db-in-components`,
 * `@rottay/no-direct-lucide`, `@rottay/no-motion-literals` and
 * `@rottay/no-size-type-outside-classic` to every Rottay app, had no ESLint
 * config of its own, and its `lint` script was a chain of node checks that
 * never invoked ESLint (audit F-57). The rules the DS sells did not protect
 * the DS.
 *
 * WHY THE RULES ARE NOT ALL ON. `recommended` is written for CONSUMERS. Two of
 * its rules say something false about the package that implements them, and
 * both are turned off BY NAME with a reason rather than left at `warn`, which
 * is how a rule stops being read. Every other rule is an error, and the three
 * standing exemptions below are FILE sets with a stated reason, not rule-wide
 * escapes.
 *
 * The config is TypeScript so it can import the plugin from SOURCE. Importing
 * the built `@rottay/design-system/eslint` would make linting the package
 * require building it first, which is the pre-build/post-build defect this
 * programme is removing elsewhere.
 */
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import { plugin } from './src/entrypoints/eslint';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'artifacts/**',
      'governance/**',
      'test-artifacts/**',
      'storybook-static/**',
      '**/*.d.ts',
      // Generated sources are a projection of their manifest; the generator is
      // where a finding belongs, not the output.
      'src/graphics/icons/semantic/generated/**',
      'src/graphics/marks/**/generated/**',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    // A disable directive that suppresses nothing is a claim about the code
    // that stopped being true. Reported, not silenced: 26 of them exist today,
    // in files this work order does not own.
    linterOptions: { reportUnusedDisableDirectives: 'warn' },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    // The rule definitions the source's own inline disable directives name.
    // Without them every `// eslint-disable-next-line react-hooks/...` in the
    // tree is itself an ESLint error ("rule not found"), which would drown the
    // findings this config exists to surface.
    plugins: {
      '@rottay': plugin,
      'react-hooks': reactHooks,
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // OFF, by name, with the reason: this package is where raw HTML
      // legitimately lives. `<Button>` is implemented by a `<button>`; a DS
      // that obeyed this rule could not exist. It measured 4,635 findings, all
      // of them the package doing its job.
      '@rottay/no-raw-html': 'off',

      // OFF, by name, with the reason: this rule governs which `@rottay/*`
      // subpaths an APPLICATION may import. Inside the package every import is
      // relative, so the rule has no subject here.
      '@rottay/no-unsanctioned-ds-subpath': 'off',

      // ON. These four measured zero findings across `src/**` when this config
      // was written, so they are enforced rather than baselined.
      '@rottay/no-db-in-components': 'error',
      '@rottay/no-direct-lucide': 'error',
      '@rottay/no-motion-literals': 'error',
      '@rottay/no-size-type-outside-classic': 'error',

      // ON, with three file exemptions declared below. Across production
      // `src/**` it measures ZERO once they apply: the findings were seven in
      // frozen classic engines, four in the boot error screen, and 438 in
      // stories and suites.
      '@rottay/no-hardcoded-colors': 'error',
    },
  },
  {
    // EXEMPTION 1 — the frozen engines. Owner decision 2026-09-05: Modern is
    // the only productive engine; Classic and Rustic stay in the package for
    // compatibility with ZERO content work. Repainting seven antd-era inline
    // colours here would be exactly the content work that decision forbids.
    // The exemption is by path, so a modern file can never inherit it.
    files: ['src/components/**/engines/{classic,rustic}/**/*.{ts,tsx}'],
    rules: { '@rottay/no-hardcoded-colors': 'off' },
  },
  {
    // EXEMPTION 2 — stories and suites. A story exists to DEMONSTRATE a
    // primitive, and a suite to assert about one; both legitimately paint
    // arbitrary demo colours that never ship as chrome (402 and 36 findings,
    // zero of them in a rendered product path). The other four rules stay on
    // here: a story that reached the DB, imported lucide directly or used a
    // legacy size union would still be a real finding.
    files: ['src/**/*.stories.{ts,tsx}', 'src/**/tests/**/*.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    rules: { '@rottay/no-hardcoded-colors': 'off' },
  },
  {
    // EXEMPTION 3 — the last-resort boot boundary. `system-error` renders when
    // the theme could not be resolved at all; `var(--ds-color-*)` there
    // resolves to nothing and the screen paints invisible text on an invisible
    // background. Its colours are deliberately theme-independent.
    files: ['src/infrastructure/runtime/bootstrap/presentation/boundaries/system-error/**/*.{ts,tsx}'],
    rules: { '@rottay/no-hardcoded-colors': 'off' },
  },
  {
    // EXEMPTION 4 — the motion suites, and ONLY the motion suites. Extending
    // `no-motion-literals` to `graphics/motion/**` puts the cadence vocabulary
    // itself under the rule it publishes; it also puts the suites that DRIVE a
    // transition under it, where a concrete duration is the subject under test:
    // `transitionDuration: '30ms'` is the harness, and
    // `style.setProperty('--ds-motion-normal', '200ms')` is the canon being
    // SUPPLIED, not bypassed. Eight findings, all of that shape, in three files.
    // Scoped to motion suites so a modern-engine story or suite elsewhere still
    // reports; the other five rules stay on here too.
    files: ['src/graphics/motion/**/tests/**/*.{ts,tsx}', 'src/graphics/motion/**/*.{test,spec}.{ts,tsx}'],
    rules: { '@rottay/no-motion-literals': 'off' },
  },
];
