/**
 * Pins brand-theme ownership in the file tree (WO-ARC-06): a vertical is a
 * folder and its tenants live inside it. This walks the real filesystem
 * rather than an import graph, so a file dropped back at the brand-themes
 * root — or a fixture smuggled inside a vertical folder — fails here.
 */
import { readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { FIRST_PARTY_ARTIFACT_SPECS } from '../../runtime/tenant/storage/static/generator';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const BRAND_THEMES_DIR = resolve(TEST_DIR, '..', 'ts/brand-themes');

const VERTICAL_FOLDERS = ['platform', 'bithire', 'evnto'] as const;
type VerticalFolder = (typeof VERTICAL_FOLDERS)[number];
const FIXTURES_FOLDER = '_fixtures';

/** Vertical folder each FIRST_PARTY_ARTIFACT_SPECS slug is authored under. */
const VERTICAL_BY_SLUG: Record<string, VerticalFolder> = {
  rottay: 'platform',
  bithire: 'bithire',
  evnto: 'evnto',
};

describe('brand-themes tree pins vertical ownership', () => {
  it('every FIRST_PARTY_ARTIFACT_SPECS slug resolves inside its vertical folder', () => {
    expect(FIRST_PARTY_ARTIFACT_SPECS.length).toBeGreaterThan(0);
    for (const spec of FIRST_PARTY_ARTIFACT_SPECS) {
      const vertical = VERTICAL_BY_SLUG[spec.slug];
      expect(vertical).toBeDefined();
      const filePath = resolve(BRAND_THEMES_DIR, vertical, `${spec.slug}.ts`);
      expect(() => statSync(filePath)).not.toThrow();
    }
  });

  it('tenant and torture fixtures live outside every vertical folder', () => {
    expect(() => statSync(resolve(BRAND_THEMES_DIR, FIXTURES_FOLDER, 'torture.ts'))).not.toThrow();
    expect(() => statSync(resolve(BRAND_THEMES_DIR, FIXTURES_FOLDER, 'themanagementmiami.ts'))).not.toThrow();
    for (const vertical of VERTICAL_FOLDERS) {
      expect(() => statSync(resolve(BRAND_THEMES_DIR, vertical, 'torture.ts'))).toThrow();
      expect(() => statSync(resolve(BRAND_THEMES_DIR, vertical, 'themanagementmiami.ts'))).toThrow();
    }
  });

  it('the brand-themes root holds only the barrel and owner folders — no flat peer files', () => {
    const entries = readdirSync(BRAND_THEMES_DIR, { withFileTypes: true });
    const allowedDirs = new Set<string>([...VERTICAL_FOLDERS, FIXTURES_FOLDER]);
    for (const entry of entries) {
      if (entry.isFile()) {
        expect(entry.name).toBe('index.ts');
      } else if (entry.isDirectory()) {
        expect(allowedDirs.has(entry.name)).toBe(true);
      }
    }
  });
});
