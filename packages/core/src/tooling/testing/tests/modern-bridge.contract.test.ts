/**
 * @fileoverview Modern engine bridge contract test.
 * Ensures theme.css does NOT define legacy DaisyUI 4 short-hand variables
 * (--p, --b1, etc.) and DOES define the DaisyUI 5 --color-* contract.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOKENS_ROOT = join(process.cwd(), 'src', 'foundation', 'tokens', 'css');
const MODERN_THEME = join(TOKENS_ROOT, 'runtime', 'engines', 'modern', 'theme.css');

/** Legacy DaisyUI 4 short-hand variable names that must NOT appear as definitions. */
const LEGACY_DAISY4_VARS = [
  '--p', '--pf', '--pc',
  '--s', '--sf', '--sc',
  '--a', '--af', '--ac',
  '--n', '--nf', '--nc',
  '--b1', '--b2', '--b3', '--bc',
  '--su', '--wa', '--er', '--in',
];

/** DaisyUI 5 color variables that MUST be defined in the modern theme. */
const REQUIRED_DAISY5_VARS = [
  '--color-primary',
  '--color-primary-content',
  '--color-secondary',
  '--color-secondary-content',
  '--color-accent',
  '--color-accent-content',
  '--color-neutral',
  '--color-neutral-content',
  '--color-base-100',
  '--color-base-200',
  '--color-base-300',
  '--color-base-content',
  '--color-success',
  '--color-warning',
  '--color-error',
  '--color-info',
];

function legacyDefinitionPattern(varName: string): RegExp {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*${escaped}\\s*:`, 'm');
}

describe('modern engine bridge contract', () => {
  const themeCSS = existsSync(MODERN_THEME)
    ? readFileSync(MODERN_THEME, 'utf8')
    : '';

  it('theme.css file should exist', () => {
    expect(existsSync(MODERN_THEME)).toBe(true);
  });

  describe('no legacy DaisyUI 4 variable definitions', () => {
    it.each(LEGACY_DAISY4_VARS)(
      'should not define %s in theme.css',
      (varName) => {
        const pattern = legacyDefinitionPattern(varName);
        expect(
          pattern.test(themeCSS),
          `Found legacy DaisyUI 4 variable definition "${varName}:" in theme.css`,
        ).toBe(false);
      },
    );
  });

  describe('required DaisyUI 5 color variables', () => {
    it.each(REQUIRED_DAISY5_VARS)(
      'should define %s in theme.css',
      (varName) => {
        const pattern = new RegExp(`^\\s*${varName}\\s*:`, 'm');
        expect(
          pattern.test(themeCSS),
          `Missing required DaisyUI 5 variable "${varName}:" in theme.css`,
        ).toBe(true);
      },
    );
  });

  describe('no legacy variable definitions in tenant CSS', () => {
    const tenants = ['rottay', 'bithire', 'evnto'];

    for (const tenant of tenants) {
      const tenantFile = join(TOKENS_ROOT, 'facade', 'artifacts', tenant, 'index.css');

      it(`${tenant}/index.css should not define legacy DaisyUI 4 variables`, () => {
        if (!existsSync(tenantFile)) return;
        const css = readFileSync(tenantFile, 'utf8');

        for (const varName of LEGACY_DAISY4_VARS) {
          const pattern = legacyDefinitionPattern(varName);
          expect(
            pattern.test(css),
            `Found legacy variable "${varName}:" in ${tenant}/index.css`,
          ).toBe(false);
        }
      });
    }
  });

  describe('compiled dist artifact (dist/modern-engine.css)', () => {
    const DIST_MODERN = join(process.cwd(), 'dist', 'modern-engine.css');
    const distCSS = existsSync(DIST_MODERN)
      ? readFileSync(DIST_MODERN, 'utf8')
      : '';

    it('dist/modern-engine.css should exist', () => {
      expect(existsSync(DIST_MODERN)).toBe(true);
    });

    it.each(LEGACY_DAISY4_VARS)(
      'dist artifact should not contain legacy %s definition',
      (varName) => {
        if (!distCSS) return;
        const pattern = legacyDefinitionPattern(varName);
        expect(
          pattern.test(distCSS),
          `Found legacy variable "${varName}:" in dist/modern-engine.css`,
        ).toBe(false);
      },
    );
  });

  it('structural tokens should still be defined', () => {
    const structuralVars = [
      '--rounded-box',
      '--rounded-btn',
      '--rounded-badge',
      '--animation-btn',
      '--animation-input',
      '--btn-focus-scale',
      '--tab-radius',
    ];

    for (const v of structuralVars) {
      expect(themeCSS).toContain(`${v}:`);
    }
  });
});
