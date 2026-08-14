#!/usr/bin/env node
/**
 * @fileoverview Drills for the post-hoc containment check.
 *
 * These run against a THROWAWAY repository built in a temp directory, never
 * against the working tree. A containment drill has to create commits, dirty
 * files and a rename to be worth anything, and doing that in a shared tree
 * where other agents are writing is exactly the accident this whole folder
 * exists to prevent.
 */
import { pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDrillSuite, run, withTempDir } from '../../harness/index.mjs';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const CHECKER = `${ROOT}/packages/core/src/tooling/lane-control/public/containment/index.mjs`;

function git(repo, args) {
  execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function seedRepo(dir) {
  git(dir, ['init', '--quiet', '--initial-branch=main']);
  git(dir, ['config', 'user.email', 'drill@example.invalid']);
  git(dir, ['config', 'user.name', 'drill']);
  for (const path of ['lane/a.css', 'lane/nested/b.css', 'lane/excluded/c.css', 'elsewhere/d.css']) {
    mkdirSync(join(dir, path.slice(0, path.lastIndexOf('/'))), { recursive: true });
    writeFileSync(join(dir, path), `/* ${path} */\n`);
  }
  git(dir, ['add', '.']);
  git(dir, ['commit', '--quiet', '-m', 'seed']);
}

const LANE = ['--write-root', 'lane', '--write-set', 'lane/**', '--exclude', 'lane/excluded', '--lane', 'L'];

export function runDrills() {
  const suite = createDrillSuite('containment drills');

  return withTempDir('containment', (dir) => {
    seedRepo(dir);

    // Positive control: a change INSIDE the lane.
    writeFileSync(join(dir, 'lane/a.css'), '/* edited inside the lane */\n');
    suite.expectPass({
      label: 'POSITIVE CONTROL — an edit inside the write set is contained',
      result: run(process.execPath, [CHECKER, ...LANE], { cwd: dir }),
    });

    // C1 — a change outside the writeRoot entirely.
    writeFileSync(join(dir, 'elsewhere/d.css'), '/* edited outside the lane */\n');
    suite.expectRefusal({
      label: 'C1 — an edit outside writeRoot is refused',
      rule: 'C1-escaped',
      showOutput: true,
      result: run(process.execPath, [CHECKER, ...LANE], { cwd: dir }),
    });
    git(dir, ['checkout', '--', 'elsewhere/d.css']);

    // C1 — a change inside an excluded subtree.
    writeFileSync(join(dir, 'lane/excluded/c.css'), '/* edited inside the exclusion */\n');
    suite.expectRefusal({
      label: 'C1 — an edit inside a declared writeExclude is refused',
      rule: 'C1-escaped',
      result: run(process.execPath, [CHECKER, ...LANE], { cwd: dir }),
    });
    git(dir, ['checkout', '--', 'lane/excluded/c.css']);

    // C1 — an untracked file created outside the lane.
    mkdirSync(join(dir, 'elsewhere/new'), { recursive: true });
    writeFileSync(join(dir, 'elsewhere/new/e.css'), '/* created outside the lane */\n');
    suite.expectRefusal({
      label: 'C1 — a NEW file created outside the write set is refused (untracked files are in the diff)',
      rule: 'C1-escaped',
      result: run(process.execPath, [CHECKER, ...LANE], { cwd: dir }),
    });

    // C1 — a rename that moves a file OUT of the lane. Both ends must be seen.
    git(dir, ['checkout', '--', 'lane/a.css']);
    execFileSync('rm', ['-rf', join(dir, 'elsewhere/new')]);
    renameSync(join(dir, 'lane/nested/b.css'), join(dir, 'elsewhere/b.css'));
    git(dir, ['add', '-A']);
    const renameResult = run(process.execPath, [CHECKER, ...LANE, '--mode', 'staged'], { cwd: dir });
    suite.expectRefusal({
      label: 'C1 — a rename OUT of the lane is refused, and the report names the destination',
      rule: 'C1-escaped',
      showOutput: true,
      result: renameResult,
    });
    git(dir, ['reset', '--hard', '--quiet', 'HEAD']);

    // C1 — a rename INTO the lane. The destination is legitimate; the SOURCE
    // is a file this lane never owned and has just deleted. Only a check that
    // examines both ends of a rename can see it, which is the whole point.
    renameSync(join(dir, 'elsewhere/d.css'), join(dir, 'lane/d.css'));
    git(dir, ['add', '-A']);
    const renameIn = run(process.execPath, [CHECKER, ...LANE, '--mode', 'staged'], { cwd: dir });
    suite.expectRefusal({
      label: 'C1 — a rename INTO the lane is refused on its SOURCE: the lane deleted a file it never owned',
      rule: 'rename source',
      showOutput: true,
      result: renameIn,
    });
    git(dir, ['reset', '--hard', '--quiet', 'HEAD']);

    // C0 — an empty diff is not evidence of containment.
    suite.expectPass({
      label: 'C0 CONTROL — a clean tree passes when no changes are expected',
      result: run(process.execPath, [CHECKER, ...LANE], { cwd: dir }),
    });
    suite.expectRefusal({
      label: 'C0 — a clean tree is REFUSED under --expect-changes (a check that scans nothing passes everything)',
      rule: 'C0-empty-diff',
      result: run(process.execPath, [CHECKER, ...LANE, '--expect-changes'], { cwd: dir }),
    });

    // Usage errors must be distinguishable from violations.
    suite.expectRefusal({
      label: 'EXIT CODES — an unbounded lane (no writeRoot) exits 2, not 1',
      rule: 'could not run',
      exitCode: 2,
      result: run(process.execPath, [CHECKER, '--write-set', 'lane/**'], { cwd: dir }),
    });

    return suite.summary();
  });
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
  process.exit(runDrills() ? 0 : 1);
}
