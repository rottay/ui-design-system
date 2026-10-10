/**
 * @fileoverview Caller-part runtime pin for the icon system (WO-ARC-12, F1 B-evidence).
 *
 * The family-cut gate admits a PACKAGE component as a `data-part` stamp only
 * through this committed runtime evidence. Every exported semantic icon, every
 * exported catalog icon and every `@phosphor-icons/react` glyph the icon
 * modules import is rendered with a caller `data-part`, and the part must land
 * on the rendered `<svg>`. `caller-part-pin.json` enumerates the proven glyphs
 * (`specifier#export`) and pins the counts; the gate reads it by path and fails
 * closed when it, or this contract, is missing or does not enumerate a glyph.
 *
 * Re-verify on ANY `@phosphor-icons/react` lockfile change: the manifest pins
 * the installed package version, so an upgrade turns this contract red until
 * the sweep is re-run and the manifest re-read from it.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import * as catalog from '../glyphs/presentation/catalog';

type CallerPartPin = Readonly<{
  package: string;
  packageVersion: string;
  counts: Readonly<{ semantic: number; catalog: number; glyphs: number }>;
  glyphs: readonly string[];
}>;

const ICONS_ROOT = join(process.cwd(), 'src/graphics/icons');
const ROLES_ROOT = join(ICONS_ROOT, 'semantic/generated/roles');
const CATALOG_ROOT = join(ICONS_ROOT, 'glyphs/presentation/catalog');
const PIN: CallerPartPin = JSON.parse(readFileSync(join(ICONS_ROOT, 'tests/caller-part-pin.json'), 'utf8'));
const PROBE = 'caller-part-pin-probe';
const PACKAGE_IMPORT = /import\s*\{([^}]*)\}\s*from\s*["'](@phosphor-icons\/react[^"']*)["']/gu;

/** A React component object (`forwardRef` / `memo`), the shape every exported icon has. */
const isComponent = (value: unknown): value is ComponentType<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && '$$typeof' in value;

/** The opening tag of the first `<svg>` the markup renders, or '' when it renders none. */
const svgOpening = (markup: string): string => /<svg\b[^>]*>/u.exec(markup)?.[0] ?? '';
const stampsProbe = (markup: string): boolean => svgOpening(markup).includes(`data-part="${PROBE}"`);

const roleFiles = readdirSync(ROLES_ROOT).filter((name) => name.endsWith('.ts')).sort();
const catalogModules = readdirSync(CATALOG_ROOT)
  .filter((name) => name !== 'tests' && statSync(join(CATALOG_ROOT, name)).isDirectory())
  .flatMap((name) => readdirSync(join(CATALOG_ROOT, name))
    .filter((file) => /^index\.tsx?$/u.test(file))
    .map((file) => join(CATALOG_ROOT, name, file)));

/** The package glyph keys the semantic roles and the catalog modules import. */
function importedGlyphKeys(): string[] {
  const keys = new Set<string>();
  for (const file of [...roleFiles.map((name) => join(ROLES_ROOT, name)), ...catalogModules]) {
    for (const match of readFileSync(file, 'utf8').matchAll(PACKAGE_IMPORT)) {
      for (const specifier of match[1].split(',').map((entry) => entry.trim()).filter(Boolean)) {
        keys.add(`${match[2]}#${specifier.split(/\s+as\s+/u)[0].trim()}`);
      }
    }
  }
  return [...keys].sort();
}

describe('icon caller-part runtime pin (family-cut B-evidence)', () => {
  it('pins the installed @phosphor-icons/react version (re-verify on any lockfile change)', () => {
    const installed = JSON.parse(
      readFileSync(join(process.cwd(), 'node_modules/@phosphor-icons/react/package.json'), 'utf8'),
    ) as { version: string };
    expect(PIN.package).toBe('@phosphor-icons/react');
    expect(installed.version).toBe(PIN.packageVersion);
  });

  it('enumerates exactly the package glyphs the icon modules import', () => {
    expect([...PIN.glyphs]).toEqual(importedGlyphKeys());
    expect(PIN.glyphs.length).toBe(PIN.counts.glyphs);
  });

  it('every enumerated package glyph stamps a caller data-part on its svg', async () => {
    const missing: string[] = [];
    for (const key of PIN.glyphs) {
      const [specifier, exported] = key.split('#');
      const glyph = (await import(specifier))[exported] as unknown;
      if (!isComponent(glyph) || !stampsProbe(renderToStaticMarkup(createElement(glyph, { 'data-part': PROBE })))) {
        missing.push(key);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every exported semantic icon stamps a caller data-part on its svg', async () => {
    const icons: Array<[string, ComponentType<Record<string, unknown>>]> = [];
    for (const name of roleFiles) {
      const module = (await import(join(ROLES_ROOT, name))) as Record<string, unknown>;
      for (const [exported, value] of Object.entries(module)) if (isComponent(value)) icons.push([exported, value]);
    }
    const missing = icons
      .filter(([, icon]) => !stampsProbe(renderToStaticMarkup(createElement(icon, { decorative: true, 'data-part': PROBE }))))
      .map(([exported]) => exported);
    expect(missing).toEqual([]);
    expect(icons.length).toBe(PIN.counts.semantic);
  });

  it('every exported catalog icon stamps a caller data-part on its svg', () => {
    const icons = Object.entries(catalog as Record<string, unknown>)
      .filter((entry): entry is [string, ComponentType<Record<string, unknown>>] => isComponent(entry[1]));
    const missing = icons
      .filter(([, icon]) => !stampsProbe(renderToStaticMarkup(createElement(icon, { 'data-part': PROBE }))))
      .map(([exported]) => exported);
    expect(missing).toEqual([]);
    expect(icons.length).toBe(PIN.counts.catalog);
  });
});
