/**
 * TS-to-CSS parity gate for the bithire vertical artifact (WO-DES-02).
 *
 * Every variable emitted by `compileBrandTheme(bithireBrandTheme)` must exist,
 * with an equal value, in the committed artifact. The artifact is allowed to
 * define MORE variables than the compiler (the declared extension: oklch bridge,
 * color scales, semantic sets, dark-mode overrides) — parity is one-directional
 * (compiler is a subset of artifact). This fails when `bithire.ts` changes but
 * the artifact is not regenerated, i.e. it catches a stale/mixed identity before release.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '../../compilers/brand-theme';
import { bithireBrandTheme } from '../ts/brand-themes/bithire';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const ARTIFACT_PATH = resolve(TEST_DIR, '..', 'css/artifacts/bithire/index.css');

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

describe('bithire artifact to BrandTheme parity', () => {
  const compiled = compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' });
  const declared = collectDeclaredValues(readFileSync(ARTIFACT_PATH, 'utf8'));

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
});
