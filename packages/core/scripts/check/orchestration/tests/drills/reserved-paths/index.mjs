/**
 * @fileoverview Drills for the reservedPaths admission allowlist.
 *
 * `orchestration/index.json#reservedPaths` is the list a family-writer lane may
 * not own. It is matched by GLOB, and a glob that matches nothing refuses
 * nothing: a relocation that moves a governed tree without updating the list
 * silently DE-RESERVES it, and no check anywhere notices. That is fail-open,
 * the worst class, and it is the one shape of drift this authority cannot
 * detect about itself.
 *
 * This drill is READ-ONLY over the authority. It never edits
 * `orchestration/index.json`: that file is a lane-C constitution owner, and a
 * checker that repairs the thing it audits is not a checker.
 *
 * Resolution is judged against the GIT INDEX, not the filesystem. `existsSync`
 * resolves `.../inputs/Button` on a case-insensitive filesystem and fails on a
 * case-sensitive one, so a filesystem probe would hide exactly the mis-cased
 * relocation this drill exists to find.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createDrillSuite } from '../../harness/index.mjs';
import { patternToRegex } from '../../../../evidence/framework/ownership-overlap/index.mjs';
import { repoRoot as findRepoRoot, packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = findRepoRoot(HERE);
const AUTHORITY = join(findPackageRoot(HERE), 'scripts/check/modern-rescue/orchestration/index.json');

/**
 * Two classes of reserved path cannot resolve in this index and are not drift.
 * They are enumerated rather than pattern-matched so a third class cannot join
 * them by accident.
 */
const UNRESOLVABLE_BY_DESIGN = new Map([
  ['packages/core/dist/**', 'build output; ignored by git and produced by the build, never tracked'],
  ['../docs-engineering/**', 'a sibling repository; outside this index by construction'],
]);

/**
 * Source-pinned obligation, owner lane C.
 *
 * Two globs name trees the structural relocation removed. They are recorded
 * here, in reviewed source, rather than in the authority — repairing the
 * authority is lane C's act, and absorbing them into
 * `UNRESOLVABLE_BY_DESIGN` would turn a finding into a permanent excuse.
 *
 * The obligation is EXACT and expires by being resolved: a glob that starts
 * resolving fails this drill just as loudly as a new one that stops, so the
 * ledger cannot fossilise and cannot absorb the next relocation.
 */
const LANE_C_OBLIGATION = Object.freeze({
  owner: 'lane C (Modern Rescue constitution)',
  reason:
    'the structural relocation removed both trees and the reservedPaths list was not re-derived; '
    + 'orchestration/index.json is a lane-C authority and C0 asserts over it rather than editing it',
  globs: Object.freeze([
    'packages/core/src/infrastructure/i18n/**',
    'packages/core/artifacts/generated/styles/**',
  ]),
});

function trackedPaths() {
  const NUL = String.fromCharCode(0);
  return execFileSync('git', ['ls-files', '-z'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  })
    .split(NUL)
    .filter(Boolean);
}

/**
 * How many tracked paths a reserved glob reserves. A wildcard-free entry means
 * its whole subtree, matching how `laneScopeContains` reads the same list.
 */
function reservedMatchCount(pattern, tracked) {
  const matcher = patternToRegex(pattern);
  const bare = !pattern.includes('*');
  const prefix = `${pattern.replace(/\/+$/, '')}/`;
  return tracked.filter((file) => matcher.test(file) || (bare && (file === pattern || file.startsWith(prefix))))
    .length;
}

export function runDrills() {
  const suite = createDrillSuite('reservedPaths resolution drills');
  const authority = JSON.parse(readFileSync(AUTHORITY, 'utf8'));
  const reserved = authority.reservedPaths ?? [];
  const tracked = trackedPaths();

  suite.expectFact({
    label: 'PRECONDITION — the authority declares a non-empty reservedPaths list',
    ok: Array.isArray(reserved) && reserved.length > 0 && tracked.length > 0,
    details: [`${reserved.length} reserved pattern(s) · ${tracked.length} tracked path(s)`],
  });

  const counts = new Map(reserved.map((pattern) => [pattern, reservedMatchCount(pattern, tracked)]));
  const empty = reserved.filter((pattern) => counts.get(pattern) === 0);
  const unexplained = empty.filter(
    (pattern) => !UNRESOLVABLE_BY_DESIGN.has(pattern) && !LANE_C_OBLIGATION.globs.includes(pattern),
  );

  suite.expectFact({
    label:
      'W1 — every reserved glob reserves at least one TRACKED path, except the two declared '
      + 'unresolvable classes and the recorded lane-C obligation',
    ok: unexplained.length === 0,
    details:
      unexplained.length === 0
        ? [`${reserved.length - empty.length} pattern(s) resolve; ${empty.length} accounted for by name`]
        : unexplained.map((pattern) => `de-reserved: ${pattern} matches 0 tracked paths and is not declared`),
  });

  suite.expectFact({
    label: 'W2 — the lane-C obligation is EXACT: every recorded glob still resolves to nothing',
    ok: LANE_C_OBLIGATION.globs.every((pattern) => counts.get(pattern) === 0),
    details: LANE_C_OBLIGATION.globs.map(
      (pattern) => `${pattern} -> ${counts.get(pattern) ?? 'ABSENT FROM THE AUTHORITY'} tracked path(s)`,
    ),
  });

  suite.expectFact({
    label: 'W2 — and every recorded glob is still declared by the authority, so the ledger cannot outlive it',
    ok: LANE_C_OBLIGATION.globs.every((pattern) => reserved.includes(pattern)),
    details: [`owner=${LANE_C_OBLIGATION.owner}`, LANE_C_OBLIGATION.reason],
  });

  suite.expectFact({
    label: 'W3 — the declared unresolvable classes really do resolve to nothing, so neither is a stale excuse',
    ok: [...UNRESOLVABLE_BY_DESIGN.keys()].every(
      (pattern) => !reserved.includes(pattern) || counts.get(pattern) === 0,
    ),
    details: [...UNRESOLVABLE_BY_DESIGN.entries()].map(
      ([pattern, why]) => `${pattern} -> ${counts.get(pattern) ?? 'not declared'} · ${why}`,
    ),
  });

  // NEGATIVE CONTROL. A predicate that answered "resolves" for everything would
  // satisfy W1 on any authority at all, including one whose every glob is dead.
  const plantedDead = 'packages/core/src/this-tree-was-never-tracked/**';
  suite.expectFact({
    label: 'NEGATIVE CONTROL — a planted dead glob is measured as reserving nothing',
    ok: reservedMatchCount(plantedDead, tracked) === 0
      && reservedMatchCount('packages/core/scripts/**', tracked) > 0,
    details: [
      `${plantedDead} -> ${reservedMatchCount(plantedDead, tracked)}`,
      `packages/core/scripts/** -> ${reservedMatchCount('packages/core/scripts/**', tracked)}`,
    ],
  });

  return suite.summary();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(runDrills() ? 0 : 1);
}
