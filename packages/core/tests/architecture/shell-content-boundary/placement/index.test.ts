/**
 * @fileoverview The content-boundary flag: it ships dark, fails closed, is
 * read only by the shells it places, and every placement it can name covers
 * the whole content slot.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  activeContentBoundaryRegions,
  CONTENT_BOUNDARY_PLACEMENT,
  CONTENT_BOUNDARY_PLACEMENTS,
  resolveContentBoundaryPlacement,
  type ContentBoundaryPlacement,
} from '@/components/structures/foundation/content-boundary/policy';

const SRC = resolve(__dirname, '../../../../src');

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'tests' ? [] : sources(path);
    return /\.(ts|tsx)$/.test(name) && !/\.(test|stories)\.tsx?$/.test(name) ? [path] : [];
  });
}

describe('content-boundary placement flag', () => {
  it('F-1 ships dark: the placement is off and no region is active until the joint matrix rules', () => {
    expect(CONTENT_BOUNDARY_PLACEMENT).toBe('off');
    expect(activeContentBoundaryRegions()).toEqual([]);
  });

  it('F-2 fails closed: only an exact placement name selects a placement', () => {
    for (const value of ['content-slot', 'structure-regions'] as const) {
      expect(resolveContentBoundaryPlacement(value)).toBe(value);
    }
    for (const value of [undefined, null, '', 'on', 'true', '1', 1, true, 'Content-Slot', ' content-slot', 'structure-regions ', {}]) {
      expect(resolveContentBoundaryPlacement(value)).toBe('off');
    }
  });

  it('F-3 is not a consumer door: only the region helper reads the flag, and only the four placed owners import the helper', () => {
    const OWNER = 'components/structures/foundation/content-boundary';
    const edges = sources(SRC).flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/(import|export)\b[^;]*?from\s+'([^']+)'/g)].map(([, kind, specifier]) => {
        const target = specifier.startsWith('@/')
          ? specifier.slice(2)
          : specifier.startsWith('.')
            ? relative(SRC, resolve(join(file, '..'), specifier))
            : specifier;
        return { kind, from: relative(SRC, file), target };
      }),
    );
    const importers = (target: string) =>
      edges.filter((edge) => edge.target === target).map((edge) => edge.from).sort();

    expect(importers(`${OWNER}/policy`)).toEqual([`${OWNER}/region/index.tsx`]);
    expect(importers(`${OWNER}/region`)).toEqual([
      'components/structures/shell/app-shell/index.tsx',
      'components/structures/shell/page-shell-surface/index.tsx',
      'components/structures/shell/surface-chrome/index.tsx',
      'components/structures/shell/workspace-shell/index.tsx',
    ]);
    expect(edges.filter((edge) => edge.kind === 'export' && edge.target.startsWith(OWNER))).toEqual([]);
    expect(edges.filter((edge) => edge.target === OWNER || edge.target.startsWith(`${OWNER}/index`))).toEqual([]);
  });

  it('F-4 every placement it can name covers the whole content slot (no uncovered content position)', () => {
    for (const [placement, regions] of Object.entries(CONTENT_BOUNDARY_PLACEMENTS) as [ContentBoundaryPlacement, readonly string[]][]) {
      if (placement === 'off') expect(regions).toEqual([]);
      else expect(regions).toContain('content-slot');
    }
  });

  it('F-5 the workspace shell content box is a page-content slot (P-1), and P-2 keeps every P-1 region', () => {
    expect(CONTENT_BOUNDARY_PLACEMENTS['content-slot']).toEqual(['content-slot', 'workspace-content']);
    expect(CONTENT_BOUNDARY_PLACEMENTS['structure-regions']).toEqual(['content-slot', 'section-content', 'workspace-content']);
  });
});
