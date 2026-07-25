/**
 * TS-to-CSS parity gate for every first-party vertical artifact (WO-TOK-01).
 *
 * Every variable emitted by `compileBrandTheme(<slug>BrandTheme)` must exist,
 * with an equal value, somewhere in the committed artifact. The artifact is
 * allowed to define MORE variables than the compiler (the declared extension:
 * oklch bridge, color scales, semantic sets, dark-mode overrides) — parity is
 * one-directional (compiler is a subset of artifact). This fails when a
 * BrandTheme `.ts` file changes but the artifact is not regenerated, i.e. it
 * catches a stale/mixed identity before release. Parameterized over
 * FIRST_PARTY_ARTIFACT_SPECS so a newly registered slug is covered automatically.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { FIRST_PARTY_ARTIFACT_SPECS } from '@/infrastructure/compilers/runtime/tenant-css';
import {
  bithireBrandTheme,
  evntoBrandTheme,
  rottayBrandTheme,
} from '../ts/presentation/brand-themes';
import type { BrandTheme } from '../../contracts/composition/tenants/themes';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = resolve(TEST_DIR, '..', 'css/facade/artifacts');

const BRAND_THEMES: Record<string, BrandTheme> = {
  bithire: bithireBrandTheme,
  evnto: evntoBrandTheme,
  rottay: rottayBrandTheme,
};

/** Map every CSS custom property in the artifact to the set of values declared for it. */
function collectDeclaredValues(css: string): Map<string, Set<string>> {
  const declared = new Map<string, Set<string>>();
  postcss.parse(css).walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) return;
    const values = declared.get(decl.prop) ?? new Set<string>();
    values.add(decl.value.trim());
    declared.set(decl.prop, values);
  });
  return declared;
}

function normalizeCssValue(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

describe.each(FIRST_PARTY_ARTIFACT_SPECS.map((spec) => spec.slug))(
  '%s artifact to BrandTheme parity',
  (slug) => {
    const brandTheme = BRAND_THEMES[slug];
    if (!brandTheme) throw new Error(`no BrandTheme registered in this test for slug ${slug}`);
    const compiled = compileBrandTheme({ brandTheme, tenantSlug: slug });
    const declared = collectDeclaredValues(readFileSync(resolve(ARTIFACTS_DIR, `${slug}/index.css`), 'utf8'));

    it('emits a non-trivial number of BrandTheme variables', () => {
      expect(Object.keys(compiled.cssVariables).length).toBeGreaterThan(100);
    });

    it('projects every compiled BrandTheme variable into the artifact with an equal value', () => {
      const mismatches: string[] = [];

      for (const [key, value] of Object.entries(compiled.cssVariables)) {
        const declaredValues = declared.get(key);
        if (!declaredValues) {
          mismatches.push(`${key}: MISSING from artifact`);
          continue;
        }
        if (!declaredValues.has(value.trim())) {
          mismatches.push(
            `${key}: compiler=${JSON.stringify(value)} artifact=${JSON.stringify([...declaredValues])}`,
          );
        }
      }

      expect(mismatches).toEqual([]);
    });
  },
);

describe('bithire declared extension authority', () => {
  const extension = readFileSync(
    resolve(ARTIFACTS_DIR, 'bithire/_source/extension.css'),
    'utf8',
  );
  const declared = collectDeclaredValues(extension);
  const expectedValues: Record<string, string> = {
    '--ds-radius-lg': '14px',
    '--ds-radius-xl': '18px',
    '--ds-surface-icon-bg':
      'color-mix( in srgb, var(--ds-color-primary) 8%, var(--ds-surface-card) )',
    '--ds-premium-card-bg': 'var(--ds-surface-card)',
    '--ds-premium-card-sheen': 'none',
    '--ds-table-sheen': 'none',
    '--ds-shell-breadcrumb-bg':
      'color-mix( in srgb, var(--ds-color-primary) 4%, var(--ds-surface-card) )',
    '--ds-workspace-shell-shadow': '0 1px 2px rgba(20, 40, 59, 0.06)',
    '--ds-command-glow': 'none',
  };

  it.each(Object.entries(expectedValues))(
    'does not shadow the compiled %s contract with stale paint',
    (property, expected) => {
      const values = [...(declared.get(property) ?? [])].map(normalizeCssValue);
      expect(values.length).toBeGreaterThan(0);
      expect(new Set(values)).toEqual(new Set([normalizeCssValue(expected)]));
    },
  );
});
