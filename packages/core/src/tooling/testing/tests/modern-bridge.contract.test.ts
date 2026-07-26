/**
 * @fileoverview Modern engine bridge contract test.
 *
 * The Modern engine speaks to DaisyUI through one file only:
 * `runtime/engines/modern/framework-token-projection.css`. That file projects
 * the resolved canonical `--ds-*` authority into DaisyUI's private variable
 * vocabulary; `theme.css` is a consumer of the canonical tokens and must never
 * declare a framework variable itself.
 *
 * This contract therefore asserts three things:
 *  1. the projection defines the full DaisyUI 5 `--color-*` contract, and every
 *     value resolves from a canonical `--ds-*` token (never a literal);
 *  2. `theme.css` does not compete as a second emitter of those variables;
 *  3. neither file reintroduces the removed DaisyUI 4 vocabulary — the
 *     `--p`/`--b1` colour short-hands or the `--rounded-*` / `--animation-*` /
 *     `--btn-focus-scale` / `--tab-*` structural names.
 *
 * The structural half of the projection is DaisyUI 5's own vocabulary
 * (`--radius-*`, `--size-*`, `--border`, `--depth`, `--noise`). The node gate
 * `scripts/daisy-projection-contract.test.mjs` enforces the same single-owner
 * law across the whole source tree and pins the installed DaisyUI version;
 * the two must be changed together.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const TOKENS_ROOT = join(process.cwd(), 'src', 'foundation', 'tokens', 'css');
const MODERN_ROOT = join(TOKENS_ROOT, 'runtime', 'engines', 'modern');
const MODERN_THEME = join(MODERN_ROOT, 'theme.css');
const MODERN_PROJECTION = join(MODERN_ROOT, 'framework-token-projection.css');

/** Legacy DaisyUI 4 short-hand variable names that must NOT appear as definitions. */
const LEGACY_DAISY4_VARS = [
  '--p', '--pf', '--pc',
  '--s', '--sf', '--sc',
  '--a', '--af', '--ac',
  '--n', '--nf', '--nc',
  '--b1', '--b2', '--b3', '--bc',
  '--su', '--wa', '--er', '--in',
];

/**
 * Removed DaisyUI 4 structural names. The projection's own header forbids them
 * by name; DaisyUI 5 replaced them with `--radius-*` / `--size-*` / `--border`.
 */
const LEGACY_DAISY4_STRUCTURAL_PATTERN =
  /--(rounded-[a-z]+|animation-[a-z]+|btn-focus-scale|tab-[a-z-]+)\s*:/;

/** DaisyUI 5 color variables that MUST be projected from canonical tokens. */
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

/** DaisyUI 5 structural vocabulary that replaced the removed Daisy 4 names. */
const REQUIRED_DAISY5_STRUCTURAL_VARS = [
  '--radius-selector',
  '--radius-field',
  '--radius-box',
  '--size-selector',
  '--size-field',
  '--border',
  '--depth',
  '--noise',
];

function definitionPattern(varName: string): RegExp {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*${escaped}\\s*:`, 'm');
}

/** Captures the value a variable is defined with, so we can prove its source. */
function definedValue(css: string, varName: string): string | undefined {
  const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*${escaped}\\s*:([^;]+);`, 'm').exec(css)?.[1].trim();
}

describe('modern engine bridge contract', () => {
  const themeCSS = existsSync(MODERN_THEME) ? readFileSync(MODERN_THEME, 'utf8') : '';
  const projectionCSS = existsSync(MODERN_PROJECTION)
    ? readFileSync(MODERN_PROJECTION, 'utf8')
    : '';

  it('theme.css file should exist', () => {
    expect(existsSync(MODERN_THEME)).toBe(true);
  });

  it('framework-token-projection.css file should exist', () => {
    expect(existsSync(MODERN_PROJECTION)).toBe(true);
  });

  it('the projection is imported by the engine index', () => {
    const engineIndex = readFileSync(join(TOKENS_ROOT, 'runtime', 'engines', 'index.css'), 'utf8');
    expect(engineIndex).toContain("@import './modern/framework-token-projection.css';");
  });

  describe('no legacy DaisyUI 4 variable definitions', () => {
    it.each(LEGACY_DAISY4_VARS)(
      'should not define %s in theme.css',
      (varName) => {
        expect(
          definitionPattern(varName).test(themeCSS),
          `Found legacy DaisyUI 4 variable definition "${varName}:" in theme.css`,
        ).toBe(false);
      },
    );

    it.each(LEGACY_DAISY4_VARS)(
      'should not define %s in framework-token-projection.css',
      (varName) => {
        expect(
          definitionPattern(varName).test(projectionCSS),
          `Found legacy DaisyUI 4 variable definition "${varName}:" in the projection`,
        ).toBe(false);
      },
    );
  });

  describe('required DaisyUI 5 color variables', () => {
    it.each(REQUIRED_DAISY5_VARS)(
      'should define %s in framework-token-projection.css',
      (varName) => {
        expect(
          definitionPattern(varName).test(projectionCSS),
          `Missing required DaisyUI 5 variable "${varName}:" in framework-token-projection.css`,
        ).toBe(true);
      },
    );

    it.each(REQUIRED_DAISY5_VARS)(
      'should project %s from a canonical --ds-* token',
      (varName) => {
        const value = definedValue(projectionCSS, varName);
        expect(value, `"${varName}" is not defined in the projection`).toBeDefined();
        expect(
          value,
          `"${varName}: ${value}" must resolve from a canonical --ds-* token, not a literal`,
        ).toMatch(/^var\(--ds-[a-z0-9-]+\)$/);
      },
    );

    it.each(REQUIRED_DAISY5_VARS)(
      'theme.css must not compete as a second emitter of %s',
      (varName) => {
        expect(
          definitionPattern(varName).test(themeCSS),
          `"${varName}" is declared in theme.css; the projection is the single owner`,
        ).toBe(false);
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
          expect(
            definitionPattern(varName).test(css),
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
        expect(
          definitionPattern(varName).test(distCSS),
          `Found legacy variable "${varName}:" in dist/modern-engine.css`,
        ).toBe(false);
      },
    );
  });

  describe('structural vocabulary', () => {
    it.each(REQUIRED_DAISY5_STRUCTURAL_VARS)(
      'should project %s from a canonical --ds-* token',
      (varName) => {
        const value = definedValue(projectionCSS, varName);
        expect(
          value,
          `Missing DaisyUI 5 structural variable "${varName}:" in the projection`,
        ).toBeDefined();
        expect(
          value,
          `"${varName}: ${value}" must resolve from a canonical --ds-* token, not a literal`,
        ).toMatch(/^var\(--ds-[a-z0-9-]+\)$/);
      },
    );

    it('should not reintroduce the removed DaisyUI 4 structural names', () => {
      for (const [label, css] of [
        ['framework-token-projection.css', projectionCSS],
        ['theme.css', themeCSS],
      ] as const) {
        expect(
          LEGACY_DAISY4_STRUCTURAL_PATTERN.test(css),
          `Found a removed DaisyUI 4 structural definition (--rounded-*/--animation-*/--btn-focus-scale/--tab-*) in ${label}`,
        ).toBe(false);
      }
    });
  });
});
