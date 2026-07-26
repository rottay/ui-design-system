/**
 * `data-density` writer ratchet.
 *
 * `foundation/base/density.css` gives the attribute real force: any non-root
 * `[data-density]` element re-projects `--ds-density-local-factor`, so every
 * element that stamps it creates a genuine geometry boundary. The runtime owner
 * (`DensityScope` / `RootDensityProvider` / `densityScopeAttributes`) stamps the
 * attribute AND publishes the matching `DensityContext`, which is what keeps the
 * CSS plane and the JS plane answering the same question.
 *
 * A writer that stamps the attribute WITHOUT publishing the context is a second
 * authority: inside it, CSS geometry says one posture and `useDensity()` says
 * another. Ownership has no runtime expression that can tell "stamped by the
 * owner" from "stamped by hand" after the fact — the DOM looks identical — so
 * this channel is a pinned census, decrease-only, with a reason per entry.
 *
 * The behaviour of the owner itself is proven elsewhere and not repeated here:
 * `density-authority.integration.test.tsx` (root posture from Appearance only),
 * `density-authority-equivalence.test.tsx` (five declaration paths, one scale),
 * `density-scope.test.tsx` (nested boundaries).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

const SOURCE_ROOT = resolve(process.cwd(), 'src');
const OWNER = 'infrastructure/runtime/foundation/density/index.ts';

/**
 * Every module outside the owner that stamps `data-density`, pinned to its
 * exact site count. `kind` records whether the site is sanctioned:
 *
 *  - `re-stamp`  — carries an EXISTING boundary across a portal. The value is
 *    read from the anchor's lineage, so no new posture is declared and the JS
 *    plane is unaffected.
 *  - `deviation` — declares a NEW posture without publishing `DensityContext`.
 *    These are the second writers. The count must never grow.
 */
const WRITERS: Readonly<
  Record<string, { sites: number; kind: 're-stamp' | 'deviation'; owner: string; reason: string }>
> = {
  'ui/primitives/runtime/overlay/portal-scope/index.tsx': {
    sites: 1,
    kind: 're-stamp',
    owner: 'overlay-substrate',
    reason:
      'Projects the anchor lineage snapshot onto portaled content. Reads an existing boundary, never declares one.',
  },
  'ui/primitives/display/Tooltip/engines/modern/index.tsx': {
    sites: 3,
    kind: 're-stamp',
    owner: 'engine:modern',
    reason:
      'Portaled tooltip surfaces re-stamp the anchor posture (`density ?? portalScope["data-density"]`).',
  },
  'ui/primitives/overlay/Popover/engines/modern/index.tsx': {
    sites: 4,
    kind: 're-stamp',
    owner: 'engine:modern',
    reason:
      'Portaled popover surfaces re-stamp the anchor posture (`density ?? portalScope["data-density"]`).',
  },
  'ui/structures/workspace/action-dock/runtime/rendering/index.tsx': {
    sites: 1,
    kind: 'deviation',
    owner: 'structures/workspace',
    reason:
      'ActionDock declares a local posture from its own `density` prop straight onto its root Box. It neither spreads densityScopeAttributes() nor wraps children in DensityScope, so CSS inside the dock follows the prop while useDensity() still reports the ambient posture. Migrate to DensityScope; do not add sites.',
  },
};

const WRITER_EXPRESSION = /'data-density':|"data-density":|data-density=\{/g;

function isProductionSource(path: string): boolean {
  if (!path.endsWith('.ts') && !path.endsWith('.tsx')) return false;
  if (path.endsWith('.d.ts') || path.includes('.test.') || path.includes('.stories.')) return false;
  return !path.split(sep).includes('tests');
}

function collectSources(directory: string, found: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    const absolute = join(directory, entry);
    if (statSync(absolute).isDirectory()) collectSources(absolute, found);
    else if (isProductionSource(absolute)) found.push(absolute);
  }
  return found;
}

const SOURCES = collectSources(SOURCE_ROOT);
const CENSUS = new Map<string, number>();
for (const absolute of SOURCES) {
  const sites = (readFileSync(absolute, 'utf8').match(WRITER_EXPRESSION) ?? []).length;
  if (sites > 0) CENSUS.set(relative(SOURCE_ROOT, absolute).split(sep).join('/'), sites);
}

describe('data-density writer ratchet', () => {
  it('scans a real corpus and finds the owner in it', () => {
    // Anti-cheat: a census that matched nothing would satisfy every
    // "no unknown writer" assertion below for free.
    expect(SOURCES.length).toBeGreaterThan(1500);
    expect(CENSUS.get(OWNER)).toBe(2);
  });

  it('admits no writer outside the pinned census', () => {
    const unknown = Array.from(CENSUS.keys())
      .filter((path) => path !== OWNER && !(path in WRITERS))
      .sort();

    expect(unknown).toEqual([]);
  });

  it('pins every known writer to its exact site count', () => {
    for (const [path, entry] of Object.entries(WRITERS)) {
      expect(CENSUS.get(path), `${path} moved`).toBe(entry.sites);
      expect(entry.reason.length).toBeGreaterThan(40);
    }
  });

  it('holds the deviation count at its recorded floor', () => {
    // The load-bearing ratchet. Sanctioned re-stamping may grow with the
    // overlay surface; declaring a posture outside the owner may not.
    const deviations = Object.entries(WRITERS).filter(([, entry]) => entry.kind === 'deviation');
    const deviationSites = deviations.reduce((total, [, entry]) => total + entry.sites, 0);

    expect(deviationSites).toBe(1);
    expect(deviations.map(([path]) => path)).toEqual([
      'ui/structures/workspace/action-dock/runtime/rendering/index.tsx',
    ]);
  });

  it('flags a planted ad-hoc writer instead of passing over it', () => {
    const planted = 'ui/structures/workspace/planted-dock/index.tsx';
    const plantedCensus = new Map(CENSUS).set(planted, 1);

    const unknown = Array.from(plantedCensus.keys()).filter(
      (path) => path !== OWNER && !(path in WRITERS),
    );

    expect(unknown).toEqual([planted]);
    expect('<Box data-density={x}>'.match(WRITER_EXPRESSION)).not.toBeNull();
  });
});
