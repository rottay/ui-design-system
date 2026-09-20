/**
 * @fileoverview Fail-closed gate: `ChartFamilyFrame` is retired, with no way back.
 *
 * WHY IT EXISTS. The adapter was published from the root barrel AND from the
 * `@rottay/design-system/charts` entrypoint, and nothing consumed it: zero
 * families in `packages/core/src`, zero showroom pages, zero callers in
 * app-bithire, app-evnto and app-platform. It was also a support-segment export
 * that no inventory row could own -- the taxonomy register carried it as an
 * admitted `chart-internals` finding rather than a component a catalog offers.
 * Owner resolution R2 (2026-09-19) retired it. A deletion is only a deletion
 * until someone re-exports the name, so the retirement is asserted here: the
 * owner is gone, the name is absent from both published surfaces at runtime AND
 * at compile time, and no productive source may reach for it again.
 *
 * WHAT REPLACED IT. Nothing was ported, because nothing it did was its own. It
 * composed four owners that all remain public and independently tested:
 * `ChartFrame` (chrome and state), `resolveChartProjection` (the device
 * decision), `ChartMetricTrendView` and `ChartRankedRowsView` (the two generic
 * phone renderers). The last block pins that composition path directly, so the
 * retirement cannot be read as a loss of the semantic-projection capability.
 *
 * The mutation block at the bottom proves the source scan can fail. A gate that
 * has never been shown to go red is not evidence.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as publicSurface from '@rottay/design-system';
import * as chartsEntrypoint from '@/entrypoints/charts';
import * as chartsSurface from '@/components/patterns/visualization/charts';
import { resolveChartProjection } from '@/components/patterns/visualization/charts/runtime/chart-engine';

const PACKAGE_ROOT = resolve(__dirname, '../../..');
const SRC_ROOT = join(PACKAGE_ROOT, 'src');
const SHOWROOM_ROOT = resolve(PACKAGE_ROOT, '../showroom/src');

const CHARTS_ROOT = 'src/components/patterns/visualization/charts';

/** The owner that existed solely to hold the adapter. */
const RETIRED_OWNER = `${CHARTS_ROOT}/presentation/family-frame`;

/** The retired value export. */
const RETIRED_COMPONENT = 'ChartFamilyFrame';

/** The two type exports the adapter owned exclusively. */
const RETIRED_TYPES = ['ChartFamilyFrameProps', 'ChartFamilyFrameStateProps'] as const;

/** The module specifier both barrels used. */
const RETIRED_SPECIFIER = 'presentation/family-frame';

const TEST_OR_SUPPORT =
  /(?:^|[\\/])(?:tests?|__tests__|fixtures|__fixtures__|stories)[\\/]|\.(?:test|spec|stories)\.[cm]?tsx?$/u;

function walk(root: string): string[] {
  // An absent root would make every "no productive caller" assertion below pass
  // on an empty list. The caller asserts the root exists before walking it.
  const found: string[] = [];
  for (const entry of readdirSync(root)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const absolute = join(root, entry);
    if (statSync(absolute).isDirectory()) found.push(...walk(absolute));
    else if (/\.[cm]?tsx?$/u.test(absolute)) found.push(absolute);
  }
  return found;
}

/** Every productive (non-test, non-fixture, non-story) source file. */
function productiveSources(): string[] {
  const roots = [SRC_ROOT, SHOWROOM_ROOT];
  for (const root of roots) {
    expect(existsSync(root), `source root moved: ${root}`).toBe(true);
  }
  return roots
    .flatMap(walk)
    .filter((file) => !TEST_OR_SUPPORT.test(relative(PACKAGE_ROOT, file)));
}

/** Files whose text names the retired adapter, its types, or its module path. */
function filesNaming(files: readonly string[], needles: readonly string[]): string[] {
  return files
    .filter((file) => {
      const text = readFileSync(file, 'utf8');
      return needles.some((needle) => text.includes(needle));
    })
    .map((file) => relative(PACKAGE_ROOT, file).split(sep).join('/'));
}

describe('ChartFamilyFrame -- the owner is gone', () => {
  it('has no source folder left to import from', () => {
    expect(existsSync(join(PACKAGE_ROOT, RETIRED_OWNER))).toBe(false);
  });

  it('leaves its sibling presentation owners untouched', () => {
    // The retirement is the adapter, not the tier. `scaffold` is the path every
    // family actually takes, and it is the proof that `charts/presentation` was
    // narrowed rather than emptied by accident.
    for (const survivor of [
      `${CHARTS_ROOT}/presentation/scaffold`,
      `${CHARTS_ROOT}/presentation/tooltip`,
      `${CHARTS_ROOT}/presentation/crosshair`,
    ]) {
      expect(existsSync(join(PACKAGE_ROOT, survivor)), survivor).toBe(true);
    }
  });
});

describe('ChartFamilyFrame -- both published surfaces refuse the name', () => {
  it('is absent from the root barrel and the charts barrel behind it', () => {
    expect(publicSurface).not.toHaveProperty(RETIRED_COMPONENT);
    expect(chartsSurface).not.toHaveProperty(RETIRED_COMPONENT);
  });

  it('is absent from the dedicated `@rottay/design-system/charts` entrypoint', () => {
    // The adapter was published twice. A gate that read only the root barrel
    // would call it retired while the subpath still served it.
    expect(chartsEntrypoint).not.toHaveProperty(RETIRED_COMPONENT);
  });

  it('keeps no alias under a renamed spelling', () => {
    const aliases = [
      ...Object.keys(publicSurface),
      ...Object.keys(chartsEntrypoint),
    ].filter((name) => /familyframe/iu.test(name));
    expect(aliases).toEqual([]);
  });

  it('keeps the four owners it used to compose', () => {
    // The capability was never the adapter's; deleting it must not quietly take
    // the generic projection renderers with it.
    for (const survivor of [
      'ChartFrame',
      'ChartMetricTrendView',
      'ChartRankedRowsView',
      'resolveChartProjection',
    ]) {
      expect(chartsEntrypoint, survivor).toHaveProperty(survivor);
    }
  });
});

describe('ChartFamilyFrame -- no productive source reaches for it', () => {
  it('names neither the adapter nor its module path anywhere productive', () => {
    expect(filesNaming(productiveSources(), [RETIRED_COMPONENT, RETIRED_SPECIFIER])).toEqual([]);
  });

  it('names neither of its two exclusive types', () => {
    expect(filesNaming(productiveSources(), RETIRED_TYPES)).toEqual([]);
  });
});

/**
 * The compile-time half. Each `@ts-expect-error` IS the assertion: if the name
 * becomes importable again the directive turns into an unused expect-error and
 * `typecheck:tests` goes red on this file. `tsconfig.tests.json` resolves
 * `@rottay/design-system` to the package's real entrypoint, so this reads the
 * published surface an application sees -- not a paraphrase of it.
 */
type PublicSurface = typeof import('@rottay/design-system');

/** True only while the adapter is absent from the published value surface. */
type ComponentIsRetired = typeof RETIRED_COMPONENT extends keyof PublicSurface ? false : true;
type AssertTrue<T extends true> = T;
export type _ComponentIsRetired = AssertTrue<ComponentIsRetired>;

// @ts-expect-error `ChartFamilyFrameProps` is retired (R2, WO-FAM-09).
export type _RetiredProps = import('@rottay/design-system').ChartFamilyFrameProps;
// @ts-expect-error `ChartFamilyFrameStateProps` is retired (R2, WO-FAM-09).
export type _RetiredStateProps = import('@rottay/design-system').ChartFamilyFrameStateProps;

describe('the surviving projection path still makes the device decision', () => {
  it('routes a phone viewer to the ranked-rows view and a desktop viewer to the full plot', () => {
    const projection = {
      desktop: { mode: 'full', rendererId: 'funnel' },
      phone: {
        mode: 'ranked-rows',
        rendererId: 'ds.chart.ranked-rows',
        fieldIds: ['Stage', 'Value'],
      },
    } as const;

    expect(resolveChartProjection(projection, 'desktop')).toEqual(projection.desktop);
    expect(resolveChartProjection(projection, 'phone')).toEqual(projection.phone);
  });
});

describe('the scan can fail', () => {
  it('reports a planted productive caller', () => {
    // The scanner is run against its own source, which names the adapter in
    // prose. If `filesNaming` were fail-open this would come back empty and
    // every finding above would be vacuous.
    const planted = filesNaming([__filename], [RETIRED_COMPONENT]);
    expect(planted).toHaveLength(1);
    expect(planted[0]).toContain('retired-chart-family-frame');
  });
});
