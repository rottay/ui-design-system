/**
 * Pins brand-theme ownership in the file tree (WO-ARC-06): a vertical is a
 * folder and nothing else lives beside it. This walks the real filesystem
 * rather than an import graph, so a file dropped back at the brand-themes
 * root — or a fixture smuggled into the production tree — fails here.
 *
 * What changed, and why the shape of this test changed with it: the folder for
 * the `rottay` slug used to be `platform/`, so this file needed a
 * `VERTICAL_BY_SLUG` translation table to find a theme from its slug, and
 * `fixtures/` was an allowed peer of the three verticals. Both are gone. Slug,
 * registry key, `BrandTheme.id` and folder name are now one fact — see
 * `FIRST_PARTY_VERTICAL_ROSTER` — so the lookup is the identity function, and
 * the four probe fixtures moved to `tooling/testing/fixtures/brand-themes`
 * where a proof fixture belongs.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  FIRST_PARTY_VERTICAL_ROSTER,
  FIRST_PARTY_VERTICAL_SLUGS,
} from '@/foundation/tokens/ts/presentation/brand-themes';
import { FIRST_PARTY_ARTIFACT_SPECS } from '@/infrastructure/compilers/runtime/tenant-css';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAND_THEMES_DIR = resolve(TEST_DIR, '..', 'ts/presentation/brand-themes');
const TESTING_FIXTURES_DIR = resolve(
  TEST_DIR,
  '../../..',
  'tooling/testing/fixtures/brand-themes',
);

const PROBE_FIXTURES = [
  'torture',
  'themanagementmiami',
  'divergence-sober',
  'divergence-editorial',
] as const;

describe('brand-themes tree pins vertical ownership', () => {
  it('every FIRST_PARTY_ARTIFACT_SPECS slug resolves inside a folder of its own name', () => {
    expect(FIRST_PARTY_ARTIFACT_SPECS.length).toBeGreaterThan(0);
    for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
      // No translation table: the folder IS the slug. A spec whose slug has no
      // same-named folder is the exact drift this file exists to catch.
      expect(FIRST_PARTY_VERTICAL_SLUGS).toContain(spec.slug);
      expect(() =>
        statSync(resolve(BRAND_THEMES_DIR, spec.slug, 'index.ts')),
      ).not.toThrow();
    }
  });

  it('the roster agrees with the tree, and slug == verticalKey == theme id', () => {
    expect(FIRST_PARTY_VERTICAL_ROSTER.map((row) => row.slug)).toEqual([
      'rottay',
      'bithire',
      'evnto',
    ]);
    for (const row of FIRST_PARTY_VERTICAL_ROSTER) {
      expect(row.verticalKey).toBe(row.slug);
      expect(row.themeId).toBe(row.slug);
      expect(row.theme.id).toBe(row.slug);
      expect(row.themeSourcePath).toBe(
        `foundation/tokens/ts/presentation/brand-themes/${row.slug}/index.ts`,
      );
      expect(() =>
        statSync(resolve(BRAND_THEMES_DIR, row.slug, 'index.ts')),
      ).not.toThrow();
    }
  });

  it('the brand-themes root holds only the barrel and the three vertical folders', () => {
    const entries = readdirSync(BRAND_THEMES_DIR, { withFileTypes: true });
    const allowedDirs = new Set<string>(FIRST_PARTY_VERTICAL_SLUGS);
    for (const entry of entries) {
      if (entry.isFile()) {
        expect(entry.name).toBe('index.ts');
      } else if (entry.isDirectory()) {
        expect(
          allowedDirs.has(entry.name),
          `${entry.name} is not a first-party vertical and must not sit in brand-themes/`,
        ).toBe(true);
      }
    }
  });

  it('probe fixtures live under tooling/testing, never in the production tree', () => {
    for (const fixture of PROBE_FIXTURES) {
      expect(() =>
        statSync(resolve(TESTING_FIXTURES_DIR, fixture, 'index.ts')),
      ).not.toThrow();
      // Not at the brand-themes root, and not inside any vertical folder.
      expect(() => statSync(resolve(BRAND_THEMES_DIR, fixture))).toThrow();
      for (const slug of FIRST_PARTY_VERTICAL_SLUGS) {
        expect(() => statSync(resolve(BRAND_THEMES_DIR, slug, fixture))).toThrow();
      }
    }
    expect(() => statSync(resolve(BRAND_THEMES_DIR, 'fixtures'))).toThrow();
  });

  it('keeps tenant and torture fixtures out of production barrels', () => {
    const brandThemeBarrel = readFileSync(
      resolve(BRAND_THEMES_DIR, 'index.ts'),
      'utf8',
    );
    const packageRoot = readFileSync(
      resolve(TEST_DIR, '../../..', 'index.ts'),
      'utf8',
    );

    for (const fixtureExport of [
      'themanagementmiamiBrandTheme',
      'tortureDarkBrandTheme',
      'tortureLightBrandTheme',
      'TORTURE_PROBE_VARS',
    ]) {
      expect(brandThemeBarrel).not.toContain(fixtureExport);
      expect(packageRoot).not.toContain(fixtureExport);
    }
  });
});
