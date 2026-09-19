/**
 * @fileoverview Fail-closed gate: `useSortableList` is retired, with no way back.
 *
 * WHY IT EXISTS. WO-FAM-08 measured the hook and found it UNADOPTED -- zero
 * productive callers in `packages/core/src` and zero in app-bithire, app-evnto
 * and app-platform -- while it sat on the published surface as a SECOND drag
 * transport beside the real one. Owner resolution R2 (2026-09-19) retired it.
 * A deletion is only a deletion until someone re-exports the name to "unbreak"
 * a build, so the retirement is asserted here rather than assumed: the owner is
 * gone, the name is absent from the package surface at runtime AND at compile
 * time, and no productive source may reach for it again.
 *
 * WHAT REPLACED IT. Nothing was ported: the surviving transport is the sortable
 * kernel at `components/primitives/runtime/collection/sortable`, which is
 * INTERNAL by design -- kanban-board, file-manager, saved-views, column-menu,
 * tree and upload consume it through their engines, not through a public hook.
 * Its own suites (`drag-session`, `kernel-invariants`, `resolvers`, `refusals`)
 * are the behavioural evidence; this file only pins the one behaviour the
 * retired hook uniquely claimed -- immutable single-list reorder -- onto the
 * kernel's `reorderByKey`, so the retirement cannot be read as a capability loss.
 *
 * The mutation block at the bottom proves the source scan can fail. A gate that
 * has never been shown to go red is not evidence.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as publicSurface from '@rottay/design-system';
import * as reactHooksFacade from '@/infrastructure/runtime/facade';
import { reorderByKey } from '@/components/primitives/runtime/collection/sortable';

const PACKAGE_ROOT = resolve(__dirname, '../../..');
const SRC_ROOT = join(PACKAGE_ROOT, 'src');
const SHOWROOM_ROOT = resolve(PACKAGE_ROOT, '../showroom/src');

/** The owner that existed solely to hold the hook. */
const RETIRED_OWNER = 'src/infrastructure/runtime/application/interaction/drag-and-drop';

/** The retired value export. */
const RETIRED_HOOK = 'useSortableList';

/** The four type exports the hook owned exclusively. */
const RETIRED_TYPES = [
  'UseSortableListOptions',
  'UseSortableListReturn',
  'SortableContainerProps',
  'SortableItemProps',
] as const;

/**
 * The module specifier the facade used. A relative re-export is the cheapest
 * way the name comes back, so the path is scanned for as well as the symbol.
 */
const RETIRED_SPECIFIER = 'interaction/drag-and-drop';

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

/** Files whose text names the retired hook or its retired module path. */
function filesNaming(files: readonly string[], needles: readonly string[]): string[] {
  return files
    .filter((file) => {
      const text = readFileSync(file, 'utf8');
      return needles.some((needle) => text.includes(needle));
    })
    .map((file) => relative(PACKAGE_ROOT, file).split(sep).join('/'));
}

describe('useSortableList -- the owner is gone', () => {
  it('has no source folder left to import from', () => {
    expect(existsSync(join(PACKAGE_ROOT, RETIRED_OWNER))).toBe(false);
  });

  it('leaves its sibling interaction owner untouched', () => {
    // The retirement is the hook, not the tier. `shortcuts` is the proof that
    // `application/interaction` was narrowed rather than emptied by accident.
    expect(
      existsSync(join(PACKAGE_ROOT, 'src/infrastructure/runtime/application/interaction/shortcuts')),
    ).toBe(true);
  });
});

describe('useSortableList -- the package surface refuses the name', () => {
  it('is absent from the root barrel', () => {
    expect(publicSurface).not.toHaveProperty(RETIRED_HOOK);
  });

  it('is absent from the react-hooks facade that re-exported it', () => {
    expect(reactHooksFacade).not.toHaveProperty(RETIRED_HOOK);
  });

  it('keeps no alias under a renamed spelling', () => {
    // A re-export under a new name would restore the second transport while
    // passing the two censuses above, so the barrel is read for the shape
    // rather than for the one spelling.
    const aliases = Object.keys(publicSurface).filter((name) => /sortablelist/iu.test(name));
    expect(aliases).toEqual([]);
  });
});

describe('useSortableList -- no productive source reaches for it', () => {
  it('names neither the hook nor its module path anywhere productive', () => {
    expect(filesNaming(productiveSources(), [RETIRED_HOOK, RETIRED_SPECIFIER])).toEqual([]);
  });

  it('names none of its four exclusive types', () => {
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

// @ts-expect-error `UseSortableListOptions` is retired (R2, WO-FAM-08).
export type _RetiredOptions = import('@rottay/design-system').UseSortableListOptions<string>;
// @ts-expect-error `UseSortableListReturn` is retired (R2, WO-FAM-08).
export type _RetiredReturn = import('@rottay/design-system').UseSortableListReturn<string>;
// @ts-expect-error `SortableContainerProps` is retired (R2, WO-FAM-08).
export type _RetiredContainerProps = import('@rottay/design-system').SortableContainerProps;
// @ts-expect-error `SortableItemProps` is retired (R2, WO-FAM-08).
export type _RetiredItemProps = import('@rottay/design-system').SortableItemProps;

describe('the surviving transport still reorders a single list immutably', () => {
  it('moves a key to the target index without mutating the input', () => {
    const order = Object.freeze(['a', 'b', 'c', 'd']);
    expect(reorderByKey(order, 'a', 'c')).toEqual(['b', 'c', 'a', 'd']);
    expect(order).toEqual(['a', 'b', 'c', 'd']);
  });

  it('answers an unknown or self-directed move with the order it was given', () => {
    expect(reorderByKey(['a', 'b'], 'a', 'a')).toEqual(['a', 'b']);
    expect(reorderByKey(['a', 'b'], 'z', 'b')).toEqual(['a', 'b']);
  });
});

describe('the scan can fail', () => {
  it('reports a planted productive caller', () => {
    // The scanner is run against its own source, which names the hook in prose.
    // If `filesNaming` were fail-open this would come back empty and every
    // finding above would be vacuous.
    const planted = filesNaming([__filename], [RETIRED_HOOK]);
    expect(planted).toHaveLength(1);
    expect(planted[0]).toContain('retired-sortable-list');
  });
});
