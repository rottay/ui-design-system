import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { describe, expect, expectTypeOf, it } from 'vitest';

import type { ListSurfaceToolbarConfig } from '@/components/surfaces/foundation/contracts';
import type { DENSITY_POSTURES, DensityPosture } from '@/infrastructure/runtime/foundation/density';

import type { ListToolbarProps } from '../contracts';

const PACKAGES_ROOT = resolve(__dirname, '../../../../../../..');
const SOURCE_ROOTS = [join(PACKAGES_ROOT, 'core/src'), join(PACKAGES_ROOT, 'showroom/src')];
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.next']);
const RETIRED_NAME = ['Density', 'Key'].join('');

function sources(directory: string): string[] {
  const found: string[] = [];
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(item.name)) found.push(...sources(path));
    } else if (/\.(tsx?|mts|cts|mdx?)$/.test(item.name)) {
      found.push(path);
    }
  }
  return found;
}

describe('ListToolbar density posture', () => {
  it('types the toolbar density by the one density-posture declaration', () => {
    expectTypeOf<DensityPosture>().toEqualTypeOf<(typeof DENSITY_POSTURES)[number]>();
    expectTypeOf<ListToolbarProps['density']>().toEqualTypeOf<DensityPosture>();
    expectTypeOf<Parameters<ListToolbarProps['onDensityChange']>[0]>().toEqualTypeOf<DensityPosture>();
    expectTypeOf<ListSurfaceToolbarConfig['density']>().toEqualTypeOf<DensityPosture>();
    expectTypeOf<Parameters<ListSurfaceToolbarConfig['onDensityChange']>[0]>().toEqualTypeOf<DensityPosture>();
  });

  it('leaves no file in the package or the showroom naming the retired density type', () => {
    const retired = new RegExp(`\\b${RETIRED_NAME}\\b`);
    const carriers = SOURCE_ROOTS.flatMap((root) => sources(root))
      .filter((file) => retired.test(readFileSync(file, 'utf8')))
      .map((file) => relative(PACKAGES_ROOT, file).split(sep).join('/'));

    expect(carriers).toEqual([]);
  });
});
