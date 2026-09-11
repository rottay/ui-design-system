#!/usr/bin/env node
/**
 * entrypoint-parity — every public subpath is CLASSIFIED, and every entrypoint
 * owner on disk is reachable from one.
 *
 * WHAT ALREADY EXISTS, and is cited rather than repeated. `public-entrypoint-boundary`
 * is the entrypoint parity gate of this repository: for the 76 subpaths the
 * governed manifest names, it compares the manifest against `package.json`
 * exports, the source file, the exported symbols, `releaseSync`, the vite
 * config and the coverage totals, and it fails in both directions. Nothing here
 * re-asserts any of that.
 *
 * THE GAP IT LEAVES, measured. Its reverse rule is scoped:
 *
 *     if (OWNERS.some((owner) => subpath.startsWith(`./${owner}/`)) && !governed.has(subpath))
 *
 * so it only notices an ungoverned subpath under `contracts/`, `runtime/`,
 * `primitives/`, `patterns/`, `structures/` or `surfaces/`. The package
 * publishes 120 subpaths; 76 are governed and 44 are outside that reverse rule
 * entirely -- `./icons`, `./marks`, `./charts`, `./styles/*`, `./fonts/*`,
 * `./eslint`, `./server`, the CSS glob. Not one of them is wrong, and that is
 * the point: nothing checks them, so a 121st could join them without being
 * looked at.
 *
 * THE LAW HERE. Every published subpath matches exactly one declared CLASS,
 * each class states why it is not in the governed manifest, and each class must
 * match at least one subpath -- a class nobody uses is a stale exemption, which
 * is the shape an exemption list rots into. And every owner under
 * `src/entrypoints/` must be reachable from some public subpath: an entrypoint
 * folder nobody publishes is a boundary that exists only in the tree.
 *
 * NO BASELINE. Both sides are declarations, so a disagreement is an edit
 * somebody made, not debt somebody inherited.
 *
 * Usage: node scripts/check/boundaries/entrypoint-parity/index.mjs
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(HERE);

export const MANIFEST_PATH = 'contracts/package/entrypoints/index.json';

/** The owners whose subpaths `public-entrypoint-boundary` already governs. */
export const GOVERNED_OWNERS = Object.freeze([
  'contracts', 'runtime', 'primitives', 'patterns', 'structures', 'surfaces',
]);

/**
 * The classes a published subpath may belong to, in order of precedence.
 *
 * A class says WHY a subpath is outside the governed manifest and nothing more.
 * It deliberately does NOT name an entrypoint owner: `package.json`
 * `releaseSync.sourceEntrypoints` already states, per subpath, which source
 * file the release wires it to, and a second hand-written mapping beside it
 * would be a listing to keep in step. The reverse question below -- which
 * entrypoint owners nobody publishes -- is answered from that field.
 */
export const CLASSES = Object.freeze([
  {
    id: 'governed-manifest',
    reason:
      'named by contracts/package/entrypoints/index.json and fully compared by public-entrypoint-boundary: '
      + 'manifest, package export, source file, symbols, releaseSync, vite config and coverage',
    match: (subpath, { governed }) => governed.has(subpath),
  },
  {
    id: 'package-root',
    reason: 'the default import of the package; its surface is the public barrel, guarded by public-barrel',
    match: (subpath) => subpath === '.',
  },
  {
    id: 'server-boundary',
    reason:
      'the server-only boundary (compilers and emitters). Its surface is fenced by name in F-24 and its '
      + 'single-door law by tests/architecture/theme-lowering-single-door',
    match: (subpath) => subpath === './server',
  },
  {
    id: 'manifest-self',
    reason: 'the governed manifest published as data so a consumer can read the boundary set it is held to',
    match: (subpath) => subpath === './public-entrypoints-manifest',
  },
  {
    id: 'graphics-pack',
    reason:
      'icon, mark and pictogram packs: generated asset entrypoints whose supplier fence, licences, embedding and '
      + 'corpus are owned by graphics-packaging-integrity and graphics-licenses',
    match: (subpath) => /^\.\/(icons|marks|pictograms)(\/|$)/u.test(subpath),
  },
  {
    id: 'charts-boundary',
    reason: 'the chart family boundary and its spec/access/renderer splits, owned by src/entrypoints/charts',
    match: (subpath) => /^\.\/charts(\/|$)/u.test(subpath),
  },
  {
    id: 'design-vocabulary',
    reason:
      'motion, effects and spatial: vocabulary boundaries re-exported from the public owner, held by '
      + 'motion-contracts and effects:provenance',
    match: (subpath) => /^\.\/(motion|effects|spatial)(\/|$)/u.test(subpath),
  },
  {
    id: 'stylesheet-asset',
    reason:
      'a built CSS artifact, not a module boundary. Freshness is owned by vertical-css-source-staleness and '
      + 'first-party-artifacts-source-staleness; existence by exports:artifact',
    match: (subpath) => /^\.\/(styles|fonts|dist)(\/|\.css$|$)/u.test(subpath),
  },
  {
    id: 'tooling-boundary',
    reason: 'the published ESLint rules, whose config is held by the eslint-config drill',
    match: (subpath) => subpath === './eslint',
  },
  {
    id: 'supplier-boundary',
    reason: 'the supplier contract and its honesty CLI, held by contract:check',
    match: (subpath) => subpath === './supplier-contract' || subpath === './supplier-honesty-cli',
  },
  {
    id: 'published-manifest-data',
    reason:
      'generated data a consumer reads instead of re-deriving: the app/DS hook contract and the tenant-theme '
      + 'canary fixtures, each with its own freshness gate',
    match: (subpath) => subpath === './hooks-manifest' || subpath === './tenant-theme-canary-fixtures',
  },
]);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function measure(root = DEFAULT_ROOT) {
  const pkg = readJson(join(root, 'package.json'));
  const manifestPath = join(root, MANIFEST_PATH);
  const manifest = existsSync(manifestPath) ? readJson(manifestPath) : { entries: {} };
  const governed = new Set(Object.keys(manifest.entries ?? {}));
  const subpaths = Object.keys(pkg.exports ?? {});

  const classified = subpaths.map((subpath) => {
    const matches = CLASSES.filter((entry) => entry.match(subpath, { governed }));
    return { subpath, classes: matches.map((entry) => entry.id) };
  });

  // Which entrypoint owner each subpath is wired to, read from the release
  // mapping rather than guessed from the subpath name: `./marks` lives under
  // `entrypoints/graphics/`, and a name-based guess would have invented an
  // owner called `marks`.
  const sourceEntrypoints = pkg.releaseSync?.sourceEntrypoints ?? {};
  const publishedOwners = new Set();
  for (const source of Object.values(sourceEntrypoints)) {
    if (typeof source !== 'string') continue;
    const owner = source.replace(/^entrypoints\//u, '').split('/')[0];
    if (owner) publishedOwners.add(owner);
  }

  const entrypointRoot = join(root, 'src/entrypoints');
  const owners = existsSync(entrypointRoot)
    ? readdirSync(entrypointRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
    : [];

  return {
    subpaths,
    governed: [...governed].sort(),
    classified,
    owners,
    publishedOwners: [...publishedOwners].sort(),
    releaseMapped: Object.keys(sourceEntrypoints).length,
  };
}

export function evaluate(result) {
  const failures = [];
  if (result.subpaths.length === 0) failures.push('the package publishes no subpath at all — the reader is broken');
  if (result.governed.length === 0) failures.push('the governed manifest names no entry — the reader is broken');

  for (const row of result.classified) {
    if (row.classes.length === 0) {
      failures.push(
        `${row.subpath}: published and classified by nothing. Every public subpath belongs to the governed `
        + `manifest or to a named class with a written reason (the classes are ${CLASSES.map((c) => c.id).join(', ')})`,
      );
    } else if (row.classes.length > 1) {
      failures.push(
        `${row.subpath}: matches ${row.classes.join(' and ')} — a subpath with two classes has two owners`,
      );
    }
  }

  for (const entry of CLASSES) {
    const members = result.classified.filter((row) => row.classes.includes(entry.id));
    if (members.length === 0) {
      failures.push(`${entry.id}: a declared class no published subpath matches; a stale exemption, remove it`);
    }
    if (entry.reason.trim().length < 40) {
      failures.push(`${entry.id}: the reason is a placeholder`);
    }
  }

  // The governed set must be exactly the subpaths under the six owners
  // `public-entrypoint-boundary` reverse-checks. If they drift apart, one of
  // the two gates is looking at a set the other is not.
  const underOwners = result.subpaths.filter((subpath) =>
    GOVERNED_OWNERS.some((owner) => subpath.startsWith(`./${owner}/`)));
  for (const subpath of underOwners) {
    if (!result.governed.includes(subpath)) {
      failures.push(`${subpath}: under a governed owner and absent from ${MANIFEST_PATH}`);
    }
  }
  for (const subpath of result.governed) {
    if (!underOwners.includes(subpath)) {
      failures.push(
        `${subpath}: governed by the manifest but outside the six owners public-entrypoint-boundary `
        + 'reverse-checks; the two gates would be measuring different sets',
      );
    }
  }

  // And the reverse question nothing asked: an entrypoint owner nobody
  // publishes is a boundary that exists only in the tree.
  if (result.releaseMapped === 0) {
    failures.push('package.json declares no releaseSync.sourceEntrypoints; the owner walk has nothing to read');
  }
  const published = new Set(result.publishedOwners);
  for (const owner of result.owners) {
    if (!published.has(owner)) {
      failures.push(
        `src/entrypoints/${owner}: no published subpath names it. Either publish it, or delete the owner; an `
        + 'entrypoint nobody can import is not a boundary',
      );
    }
  }
  for (const owner of published) {
    if (!result.owners.includes(owner)) {
      failures.push(
        `releaseSync wires a subpath to src/entrypoints/${owner} and no such owner exists on disk`,
      );
    }
  }
  return failures;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = measure();
  const failures = evaluate(result);
  const byClass = CLASSES.map((entry) =>
    `${entry.id} ${result.classified.filter((row) => row.classes.includes(entry.id)).length}`).join(', ');
  console.log(
    `entrypoint-parity — ${result.subpaths.length} published subpath(s), ${result.governed.length} governed by `
    + `${MANIFEST_PATH}; ${result.owners.length} entrypoint owner(s) on disk, all published`
    + `\n  classes: ${byClass}`,
  );
  if (failures.length > 0) {
    for (const failure of failures) console.error(`entrypoint-parity FAIL — ${failure}`);
    process.exit(1);
  }
  console.log('entrypoint-parity OK — every subpath classified once, every entrypoint owner published.');
}
