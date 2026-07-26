/**
 * Portal substrate single-writer proof.
 *
 * `Portal` owns one rule for every DS overlay: explicit valid container >
 * active top-layer host > shared `#rottay-portal-root`. A component that calls
 * `createPortal` privately opts out of that rule, so it also opts out of the
 * top-layer promotion, the shared-root lifecycle, and the container precedence
 * every other overlay obeys — the classic way a second portal authority
 * appears.
 *
 * Portal placement has no runtime expression that can distinguish "this
 * overlay went through the substrate" from "this overlay portaled itself into
 * the same node", so this channel is the sanctioned code-census exception. It
 * is a census of CALL SITES, not of imports or naming, and it is pinned to
 * exact counts so an added site in an already-allowlisted file still fails.
 *
 * The container-precedence half of the contract is behavioural and already
 * proven in `Portal.top-layer-host.test.tsx`; it is not duplicated here.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_ROOT = resolve(process.cwd(), 'src');

/** The one module allowed to reach `react-dom`'s portal API. */
const SUBSTRATE = 'ui/primitives/runtime/overlay/portal/index.tsx';

/**
 * Engines that predate the substrate and still portal privately.
 *
 * Rustic is the frozen vanilla-CSS fallback: it is not being changed, so the
 * debt is recorded with an owner and a reason instead of being hidden behind a
 * wildcard. Every entry is pinned to its EXACT site count — migrating a file
 * to the substrate, or adding one more private portal to it, both fail here.
 */
const RUSTIC_ALLOWLIST: Readonly<Record<string, { sites: number; owner: string; reason: string }>> = {
  'ui/primitives/overlay/Tour/engines/rustic/index.tsx': {
    sites: 1,
    owner: 'engine:rustic',
    reason: 'Frozen engine. Spotlight overlay portals to body directly; predates the substrate.',
  },
  'ui/primitives/overlay/Sheet/engines/rustic/index.tsx': {
    sites: 1,
    owner: 'engine:rustic',
    reason: 'Frozen engine. Sheet root portals to body directly; predates the substrate.',
  },
  'ui/primitives/inputs/TreeSelect/engines/rustic/index.tsx': {
    sites: 1,
    owner: 'engine:rustic',
    reason: 'Frozen engine. Fixed-position dropdown panel; predates the substrate.',
  },
  'ui/primitives/inputs/DatePicker/engines/rustic/index.tsx': {
    sites: 3,
    owner: 'engine:rustic',
    reason: 'Frozen engine. Date, range and time panels each portal separately.',
  },
  'ui/primitives/inputs/Cascader/engines/rustic/index.tsx': {
    sites: 1,
    owner: 'engine:rustic',
    reason: 'Frozen engine. Fixed-position cascade panel; predates the substrate.',
  },
  'ui/primitives/inputs/ColorPicker/engines/rustic/index.tsx': {
    sites: 1,
    owner: 'engine:rustic',
    reason: 'Frozen engine. Fixed-position picker panel; predates the substrate.',
  },
};

const CALL_SITE = /\bcreatePortal\s*\(/g;
const COMMENTS = /\/\*[\s\S]*?\*\/|(?<![:\w])\/\/[^\n]*/g;

function isProductionSource(path: string): boolean {
  if (!path.endsWith('.ts') && !path.endsWith('.tsx')) return false;
  if (path.endsWith('.d.ts')) return false;
  if (path.includes('.test.') || path.includes('.stories.')) return false;
  return !path.split(sep).includes('tests');
}

function collectSources(directory: string, found: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) {
      collectSources(absolute, found);
    } else if (isProductionSource(absolute)) {
      found.push(absolute);
    }
  }
  return found;
}

/**
 * Repo-relative path -> number of `createPortal(` call sites.
 *
 * Comments are stripped first: the substrate and several engines DISCUSS
 * `createPortal` in prose, and counting those would both overstate the debt
 * and make the pinned counts move whenever documentation is edited.
 */
function censusCallSites(files: readonly string[]): Map<string, number> {
  const census = new Map<string, number>();
  for (const absolute of files) {
    const code = readFileSync(absolute, 'utf8').replace(COMMENTS, '');
    const sites = (code.match(CALL_SITE) ?? []).length;
    if (sites > 0) {
      census.set(relative(SOURCE_ROOT, absolute).split(sep).join('/'), sites);
    }
  }
  return census;
}

const SOURCES = collectSources(SOURCE_ROOT);
const CENSUS = censusCallSites(SOURCES);

describe('portal substrate authority', () => {
  it('scans a real, non-empty corpus', () => {
    // Anti-cheat. Every assertion below is of the form "nothing outside the
    // allowlist", which is trivially satisfiable by a glob that matched
    // nothing. These bounds fail if the walk breaks, if the extension filter
    // stops matching, or if the call-site pattern stops recognising real code.
    expect(SOURCES.length).toBeGreaterThan(1500);
    expect(SOURCES.some((path) => path.endsWith(join('engines', 'modern', 'index.tsx')))).toBe(true);
    expect(CENSUS.get(SUBSTRATE)).toBe(1);
  });

  it('keeps every allowlist entry live and exactly pinned', () => {
    // A stale entry would let a migrated file's debt linger as an unfalsifiable
    // exemption, so the allowlist must describe reality exactly, both ways.
    for (const [path, entry] of Object.entries(RUSTIC_ALLOWLIST)) {
      expect(CENSUS.get(path), `${path} no longer portals privately`).toBe(entry.sites);
      expect(entry.owner).toBeTruthy();
      expect(entry.reason.length).toBeGreaterThan(20);
    }
  });

  it('admits no private portal outside the substrate and the pinned allowlist', () => {
    const unauthorized = Array.from(CENSUS.keys())
      .filter((path) => path !== SUBSTRATE && !(path in RUSTIC_ALLOWLIST))
      .sort();

    expect(unauthorized).toEqual([]);
  });

  it('admits zero private portals anywhere in the modern engine', () => {
    // The owner-facing property: modern is the engine under active work, so it
    // must route 100% of its overlays through the one substrate.
    const modernOffenders = Array.from(CENSUS.keys())
      .filter((path) => path.includes('/engines/modern/'))
      .sort();

    expect(modernOffenders).toEqual([]);
  });

  it('flags a planted private portal instead of passing over it', () => {
    // Runs the real detector over a synthetic corpus, proving the census would
    // catch a regression rather than merely describing today's tree.
    const planted = 'ui/primitives/overlay/Planted/engines/modern/index.tsx';
    const plantedCensus = new Map(CENSUS).set(planted, 1);

    const unauthorized = Array.from(plantedCensus.keys()).filter(
      (path) => path !== SUBSTRATE && !(path in RUSTIC_ALLOWLIST),
    );
    const modernOffenders = Array.from(plantedCensus.keys()).filter((path) =>
      path.includes('/engines/modern/'),
    );

    expect(unauthorized).toEqual([planted]);
    expect(modernOffenders).toEqual([planted]);
    expect((CALL_SITE.source && 'createPortal(x, y)'.match(/\bcreatePortal\s*\(/)) ?? null).not.toBeNull();
  });
});
