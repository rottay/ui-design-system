/**
 * @fileoverview Fail-closed gate: `useChartTheme` is retired, with no way back.
 *
 * WHY IT EXISTS. The hook measured ZERO productive callers -- none in
 * `packages/core/src`, none in the showroom, none in app-bithire, app-evnto or
 * app-platform -- while it sat on the published surface as a SECOND paint
 * authority beside the real one: it carried thirteen hardcoded hexes and read
 * `chartPersonality.colors` on its own, so a chart wired to it could paint from
 * one table while the governed resolver decided another. Owner resolution R2
 * (2026-09-19) retired it. A deletion is only a deletion until someone
 * re-exports the name to "unbreak" a build, so the retirement is asserted here:
 * the owner is gone, the name is absent from the package surface at runtime AND
 * at compile time, and no productive source may reach for it again.
 *
 * WHAT REPLACED IT. Nothing was ported. Token-to-colour resolution survives in
 * two governed owners that were always the real ones: `resolveCssColor`
 * (behaviour pinned by the charts' own `css-color-resolution` suite, which
 * inherited the half of the retired hook's suite that outlived it) and
 * `materializeChartPaint`, the single export door that turns a resolved paint
 * decision's consumption expressions into concrete colours. The last block
 * pins that door onto the one capability the hook uniquely claimed -- resolving
 * a chart's palette against one owner element -- so the retirement cannot be
 * read as a capability loss.
 *
 * The mutation block at the bottom proves the source scan can fail. A gate that
 * has never been shown to go red is not evidence.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import * as publicSurface from '@rottay/design-system';
import * as chartsSurface from '@/components/patterns/visualization/charts';
import * as chartHooksSurface from '@/components/patterns/visualization/charts/runtime';
import {
  materializeChartPaint,
  resolveChartPaint,
} from '@/components/patterns/visualization/charts/runtime/theming/composition/foundation/paint';

const PACKAGE_ROOT = resolve(__dirname, '../../..');
const SRC_ROOT = join(PACKAGE_ROOT, 'src');
const SHOWROOM_ROOT = resolve(PACKAGE_ROOT, '../showroom/src');

const CHARTS_ROOT = 'src/components/patterns/visualization/charts';

/** The owner that existed solely to hold the hook. */
const RETIRED_OWNER = `${CHARTS_ROOT}/runtime/theming/presentation`;

/** The retired value export. */
const RETIRED_HOOK = 'useChartTheme';

/** The two type exports the hook owned exclusively. */
const RETIRED_TYPES = ['ChartThemeOwner', 'ChartTheme'] as const;

/**
 * The module specifier every consumer used. A relative re-export is the
 * cheapest way the name comes back, so the path is scanned for as well as the
 * symbol.
 */
const RETIRED_SPECIFIER = 'theming/presentation/react/color-theme';

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

/** Files whose text names the retired hook, its types, or its module path. */
function filesNaming(files: readonly string[], needles: readonly string[]): string[] {
  return files
    .filter((file) => {
      const text = readFileSync(file, 'utf8');
      return needles.some((needle) => text.includes(needle));
    })
    .map((file) => relative(PACKAGE_ROOT, file).split(sep).join('/'));
}

describe('useChartTheme -- the owner is gone', () => {
  it('has no source folder left to import from', () => {
    expect(existsSync(join(PACKAGE_ROOT, RETIRED_OWNER))).toBe(false);
  });

  it('leaves the governed theming owners untouched', () => {
    // The retirement is the hook, not the tier. The paint resolver and the
    // personality hook are the proof that `runtime/theming` was narrowed rather
    // than emptied by accident.
    for (const survivor of [
      `${CHARTS_ROOT}/runtime/theming/composition/foundation/paint`,
      `${CHARTS_ROOT}/runtime/theming/composition/react/paint`,
      `${CHARTS_ROOT}/runtime/theming/composition/react/personality`,
    ]) {
      expect(existsSync(join(PACKAGE_ROOT, survivor)), survivor).toBe(true);
    }
  });
});

describe('useChartTheme -- the package surface refuses the name', () => {
  it('is absent from the root barrel', () => {
    expect(publicSurface).not.toHaveProperty(RETIRED_HOOK);
  });

  it('is absent from the charts barrel and the chart hooks barrel that published it', () => {
    expect(chartsSurface).not.toHaveProperty(RETIRED_HOOK);
    expect(chartHooksSurface).not.toHaveProperty(RETIRED_HOOK);
  });

  it('keeps no alias under a renamed spelling', () => {
    // A re-export under a new name would restore the second paint authority
    // while passing the two censuses above, so the barrel is read for the shape
    // rather than for the one spelling.
    const aliases = Object.keys(publicSurface).filter((name) => /charttheme/iu.test(name));
    expect(aliases).toEqual([]);
  });
});

describe('useChartTheme -- no productive source reaches for it', () => {
  it('names neither the hook nor its module path anywhere productive', () => {
    expect(filesNaming(productiveSources(), [RETIRED_HOOK, RETIRED_SPECIFIER])).toEqual([]);
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

/** True only while the hook is absent from the published value surface. */
type HookIsRetired = typeof RETIRED_HOOK extends keyof PublicSurface ? false : true;
type AssertTrue<T extends true> = T;
export type _HookIsRetired = AssertTrue<HookIsRetired>;

// @ts-expect-error `ChartTheme` is retired (R2, WO-FAM-09).
export type _RetiredTheme = import('@rottay/design-system').ChartTheme;
// @ts-expect-error `ChartThemeOwner` is retired (R2, WO-FAM-09).
export type _RetiredThemeOwner = import('@rottay/design-system').ChartThemeOwner;

describe('the surviving export door still resolves a palette against one owner', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('materializes every categorical slot from the owner it is given', () => {
    const owner = document.createElement('div');
    owner.style.setProperty('--ds-chart-category-1', '#112233');
    document.body.appendChild(owner);

    const decision = resolveChartPaint({ family: 'bar-chart' });
    const materialized = materializeChartPaint(decision, owner);

    expect(materialized.scheme).toBe('default');
    expect(materialized.resolved).toHaveLength(decision.categorical?.slots.length ?? 0);
    expect(materialized.resolved[0]).toBe('#112233');
  });

  it('keeps sibling owners isolated rather than reading a document-global root', () => {
    const tenantA = document.createElement('div');
    const tenantB = document.createElement('div');
    tenantA.style.setProperty('--ds-chart-category-1', '#112233');
    tenantB.style.setProperty('--ds-chart-category-1', '#aabbcc');
    document.body.append(tenantA, tenantB);

    const decision = resolveChartPaint({ family: 'bar-chart' });

    expect(materializeChartPaint(decision, tenantA).resolved[0]).toBe('#112233');
    expect(materializeChartPaint(decision, tenantB).resolved[0]).toBe('#aabbcc');
  });
});

describe('the scan can fail', () => {
  it('reports a planted productive caller', () => {
    // The scanner is run against its own source, which names the hook in prose.
    // If `filesNaming` were fail-open this would come back empty and every
    // finding above would be vacuous.
    const planted = filesNaming([__filename], [RETIRED_HOOK]);
    expect(planted).toHaveLength(1);
    expect(planted[0]).toContain('retired-chart-theme');
  });
});
