#!/usr/bin/env node
/**
 * @fileoverview DELIVERABLE 2 — the post-hoc containment check.
 *
 * This is what an auditor runs. Deliverable 1 asks *could these lanes
 * collide?* before the work; this asks *did this lane stay inside its
 * boundary?* after it. Same declaration, opposite direction in time.
 *
 * THREE THINGS IT DELIBERATELY DOES.
 *
 *   A RENAME IS TWO PATHS. `git diff -M` reports a move as one record. Both
 *   ends are checked: moving a file OUT of a lane's territory writes the
 *   destination and deletes the source, and a check that only looked at the
 *   destination would wave through a lane that deleted another lane's file.
 *
 *   PATTERNS, NOT A PRE-RESOLVED LIST. Membership is decided against the
 *   declared globs, so a file the lane CREATED is judged by whether the lane
 *   was allowed to create it there — not by whether it happened to exist when
 *   the plan was written.
 *
 *   AN EMPTY DIFF IS REPORTED, NOT PASSED SILENTLY. A containment check that
 *   scans nothing passes everything, and this programme has already had a
 *   gate assert cleanliness over an empty corpus. `--expect-changes` turns
 *   that into a refusal.
 *
 * USAGE
 *   node .../containment/index.mjs --plan <plan.json> --lane <id> [--mode worktree|staged|range] [--range A..B]
 *   node .../containment/index.mjs --write-set 'a/**' --write-set 'b/**' --write-root a [--exclude a/c]
 *
 * EXIT 0 contained · 1 escaped · 2 could not run.
 */
import { pathToFileURL } from 'node:url';
import { compilePatterns, isUnderOrEqual, matchesAny, matchesCompiled, normalizePath } from '../../foundation/glob/index.mjs';
import { changedPaths, repoRoot } from '../../foundation/git/index.mjs';
import { loadContext, laneCovers, readPlan, resolveLane } from '../../composition/plan/index.mjs';
import { conclude, createFindings, EXIT, parseArgs } from '../../foundation/report/index.mjs';

function asArray(value) {
  if (value === undefined || value === true) return [];
  return Array.isArray(value) ? value : [value];
}

/** Build a lane-shaped object from raw flags, for auditing without a plan. */
function laneFromFlags(flags) {
  const writeSet = asArray(flags.get('write-set'));
  if (writeSet.length === 0) return null;
  const writeRoot = normalizePath(flags.get('write-root') ?? '');
  const writeExcludes = asArray(flags.get('exclude')).map((entry) => normalizePath(entry));
  if (!writeRoot) throw new Error('lane-control: --write-set requires --write-root; an unbounded lane cannot be checked');
  return {
    id: flags.get('lane') === undefined || flags.get('lane') === true ? '<ad-hoc>' : String(flags.get('lane')),
    writeRoot,
    writeExcludes,
    declaredWriteSet: writeSet.map((entry) => normalizePath(entry)),
    compiledWrite: compilePatterns(writeSet),
    compiledExclude: [...compilePatterns(writeExcludes.map((entry) => `${entry}/**`)), ...compilePatterns(writeExcludes)],
  };
}

export function checkContainment({ lane, changes, expectChanges = false }) {
  const { add, findings } = createFindings();

  if (changes.length === 0 && expectChanges) {
    add({
      rule: 'C0-empty-diff',
      message: `lane ${lane.id}: the diff is empty, and --expect-changes was passed. A check that scans nothing passes everything.`,
    });
  }

  const escaped = [];
  for (const change of changes) {
    const path = normalizePath(change.path);
    if (laneCovers(lane, path)) continue;
    const excluded = lane.compiledExclude.some((compiled) => matchesCompiled(path, compiled));
    const outsideRoot = !isUnderOrEqual(path, lane.writeRoot);
    const unmatched = !matchesAny(path, lane.compiledWrite);
    escaped.push({
      path,
      status: change.status,
      role: change.role,
      why: outsideRoot
        ? `outside writeRoot ${lane.writeRoot}`
        : excluded
          ? 'inside a declared writeExclude'
          : unmatched
            ? 'not matched by any writeSet pattern'
            : 'outside the lane',
    });
  }

  if (escaped.length > 0) {
    add({
      rule: 'C1-escaped',
      message: `lane ${lane.id}: ${escaped.length} changed path(s) fall outside the declared write set`,
      details: escaped.map(
        (entry) => `${entry.status.padEnd(3)} ${entry.role === 'rename-source' ? '(rename source) ' : entry.role === 'rename-target' ? '(rename target) ' : ''}${entry.path}  — ${entry.why}`,
      ),
    });
  }

  return {
    findings,
    summary: `${changes.length} changed path(s) examined · ${changes.length - escaped.length} inside · ${escaped.length} outside`,
    escaped,
  };
}

function main(argv) {
  const { flags } = parseArgs(argv);
  let lane;
  let changes;

  try {
    const root = repoRoot();
    const adHoc = laneFromFlags(flags);
    if (adHoc) {
      lane = adHoc;
    } else {
      const planPath = flags.get('plan');
      const laneId = flags.get('lane');
      if (!planPath || planPath === true || !laneId || laneId === true) {
        console.error(
          'usage: containment --plan <plan.json> --lane <id> [--mode worktree|staged|range --range A..B] [--expect-changes] [--json]\n' +
            '   or: containment --write-root <dir> --write-set <glob> [--write-set <glob>…] [--exclude <dir>…]',
        );
        return EXIT.USAGE;
      }
      const plan = readPlan(String(planPath));
      const declared = plan.lanes.find((entry) => entry.id === String(laneId));
      if (!declared) throw new Error(`plan "${planPath}" declares no lane "${laneId}"`);
      const context = loadContext({
        root,
        ledgerPath: typeof flags.get('ledger') === 'string' ? flags.get('ledger') : undefined,
        syntheticPath: typeof flags.get('synthetic') === 'string' ? flags.get('synthetic') : undefined,
      });
      lane = resolveLane(declared, context);
    }

    changes = changedPaths(root, {
      mode: typeof flags.get('mode') === 'string' ? flags.get('mode') : 'worktree',
      range: typeof flags.get('range') === 'string' ? flags.get('range') : null,
    });
  } catch (error) {
    console.error(`✗ containment could not run: ${error.message}`);
    return EXIT.USAGE;
  }

  const result = checkContainment({ lane, changes, expectChanges: Boolean(flags.get('expect-changes')) });
  if (!flags.get('json')) {
    console.log(`lane ${lane.id} · writeRoot ${lane.writeRoot} · ${lane.declaredWriteSet.length} pattern(s) · ${lane.writeExcludes?.length ?? 0} exclusion(s)`);
  }
  return conclude({ name: 'containment', findings: result.findings, json: flags.get('json'), summary: result.summary });
}

/**
 * Exact entrypoint identity.
 *
 * A suffix test (`argv[1].endsWith("x/index.mjs")`) matches ANY path ending
 * that way. The drill folder for this module ends the same way, so importing
 * this file from its own drill ran main() and exited the process before a
 * single drill executed. Compare the resolved URL instead.
 */
function isEntrypoint(moduleUrl) {
  return process.argv[1] !== undefined && moduleUrl === pathToFileURL(process.argv[1]).href;
}

if (isEntrypoint(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
