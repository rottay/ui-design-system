/**
 * @fileoverview Modern engine framework-projection retirement contract.
 *
 * The DaisyUI projection (`runtime/engines/modern/framework-token-projection`)
 * is retired: nothing in the kit, the showroom or the apps read its framework
 * vocabulary, and no Daisy plugin ships in the bundle. Modern paint reads the
 * canonical `--ds-*` authority directly.
 *
 * This contract asserts:
 *  1. the projection file is gone and the engine index does not import it;
 *  2. no source stylesheet under `foundation/tokens/css` declares the DaisyUI 5
 *     colour or structural vocabulary;
 *  3. `theme.css`, the tenant artifacts and the compiled dist never reintroduce
 *     the removed DaisyUI 4 vocabulary.
 *
 * `scripts/generate/framework-class-paint/tests/index.test.mjs` enforces the
 * same retirement across the whole source tree; the two change together.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const TOKENS_ROOT = join(process.cwd(), 'src', 'foundation', 'tokens', 'css');
const MODERN_ROOT = join(TOKENS_ROOT, 'runtime', 'engines', 'modern');
const MODERN_THEME = join(MODERN_ROOT, 'theme', 'index.css');
const MODERN_PROJECTION = join(MODERN_ROOT, 'framework-token-projection', 'index.css');

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
 * Removed DaisyUI 4 structural names.
 * DaisyUI 5 replaced them with `--radius-*` / `--size-*` / `--border`.
 */
const LEGACY_DAISY4_STRUCTURAL_PATTERN =
  /--(rounded-[a-z]+|animation-[a-z]+|btn-focus-scale|tab-[a-z-]+)\s*:/;

/** DaisyUI 5 colour vocabulary the retired projection used to declare. */
const DAISY5_COLOR_VARS = [
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

/** DaisyUI 5 structural vocabulary the retired projection used to declare. */
const DAISY5_STRUCTURAL_VARS = [
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

function collectStylesheets(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) collectStylesheets(path, out);
    else if (entry.endsWith('.css')) out.push(path);
  }
  return out;
}

describe('modern engine framework-projection retirement', () => {
  const themeCSS = existsSync(MODERN_THEME) ? readFileSync(MODERN_THEME, 'utf8') : '';

  // theme.css defaults to '' when absent, and a `.toBe(false)` over '' passes
  // for the wrong reason; an absent input must fail every assertion below.
  beforeAll(() => {
    expect(themeCSS, `${MODERN_THEME} is missing or empty; an absent input cannot certify anything`).not.toBe('');
  });

  it('theme.css file should exist', () => {
    expect(existsSync(MODERN_THEME)).toBe(true);
  });

  it('the framework projection is retired', () => {
    expect(existsSync(MODERN_PROJECTION)).toBe(false);
  });

  it('the engine index does not import the projection', () => {
    const engineIndex = readFileSync(join(TOKENS_ROOT, 'runtime', 'engines', 'index.css'), 'utf8');
    expect(engineIndex).not.toContain('framework-token-projection');
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
  });

  describe('no source stylesheet declares the DaisyUI 5 vocabulary', () => {
    const stylesheets = collectStylesheets(TOKENS_ROOT);

    it('the stylesheet walk found the token tree', () => {
      expect(stylesheets.length).toBeGreaterThan(0);
    });

    it.each([...DAISY5_COLOR_VARS, ...DAISY5_STRUCTURAL_VARS])(
      'nothing declares %s',
      (varName) => {
        const offenders = stylesheets.filter((file) =>
          definitionPattern(varName).test(readFileSync(file, 'utf8')),
        );
        expect(offenders, `"${varName}" has no reader; nothing may declare it`).toEqual([]);
      },
    );
  });

  describe('no legacy variable definitions in tenant CSS', () => {
    const tenants = ['rottay', 'bithire', 'evnto'];

    for (const tenant of tenants) {
      const tenantFile = join(TOKENS_ROOT, 'facade', 'artifacts', tenant, 'index.css');

      it(`${tenant}/index.css should not define legacy DaisyUI 4 variables`, () => {
        expect(
          existsSync(tenantFile),
          `${tenant}/index.css is a committed first-party artifact; a missing input is a failure, not a pass`,
        ).toBe(true);
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
        expect(
          distCSS,
          'dist/modern-engine.css is not built. Run `pnpm -C packages/core build`: this block asserts about the '
            + 'COMPILED artifact and cannot pass without one.',
        ).not.toBe('');
        expect(
          definitionPattern(varName).test(distCSS),
          `Found legacy variable "${varName}:" in dist/modern-engine.css`,
        ).toBe(false);
      },
    );
  });

  it('theme.css does not reintroduce the removed DaisyUI 4 structural names', () => {
    expect(
      LEGACY_DAISY4_STRUCTURAL_PATTERN.test(themeCSS),
      'Found a removed DaisyUI 4 structural definition (--rounded-*/--animation-*/--btn-focus-scale/--tab-*) in theme.css',
    ).toBe(false);
  });
});
