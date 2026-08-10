#!/usr/bin/env node
/**
 * @fileoverview Drills for the writeSet intersection checker.
 *
 * The one that matters is TERRITORY. Two lanes over `packages/core/scripts`
 * shaped `*-gate.mjs` and `build-*.mjs` share no file that exists today — a
 * file-level intersection calls them disjoint and is wrong the first time
 * anybody writes `build-something-gate.mjs`. The drill asserts BOTH halves:
 * that today's intersection really is empty (so the drill is not accidentally
 * proving the easy thing), and that the checker refuses the pair anyway.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDrillSuite, run, withTempDir } from '../../../foundation/harness/index.mjs';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const CHECKER = `${ROOT}/packages/core/src/tooling/lane-control/public/write-set-intersection/index.mjs`;
const EXAMPLE_PLAN = `${ROOT}/packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json`;

function checkPlan(dir, name, plan) {
  const path = join(dir, `${name}.json`);
  writeFileSync(path, JSON.stringify(plan, null, 2));
  return run(process.execPath, [CHECKER, '--plan', path], { cwd: ROOT });
}

export function runDrills() {
  const suite = createDrillSuite('intersection drills');

  return withTempDir('intersection', (dir) => {
    suite.expectPass({
      label: 'POSITIVE CONTROL — the shipped example plan (6 lanes, incl. two nested writeRoots) passes',
      result: run(process.execPath, [CHECKER, '--plan', EXAMPLE_PLAN], { cwd: ROOT }),
    });

    // R2 — two lanes over the same existing files.
    suite.expectRefusal({
      label: 'R2 — two lanes rooted on the same family collide on files that exist',
      rule: 'R2-collision',
      result: checkPlan(dir, 'r2', {
        planId: 'drill-r2',
        lanes: [
          { id: 'X', row: 'primitive/display/avatar' },
          { id: 'Y', row: 'primitive/display/avatar' },
        ],
      }),
    });

    // R3 — the collision that does not exist yet.
    const gateFiles = execFileSync('git', ['ls-files', 'packages/core/scripts'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    const bothShapes = gateFiles.filter((file) => {
      const name = file.slice(file.lastIndexOf('/') + 1);
      return name.endsWith('-gate.mjs') && name.startsWith('build-');
    });
    suite.expectFact({
      label: 'SETUP — no file in packages/core/scripts matches both `*-gate.mjs` and `build-*.mjs` today',
      ok: bothShapes.length === 0,
      details: [`files matching both shapes: ${bothShapes.length} — a file-level intersection therefore reports these lanes as disjoint`],
    });
    suite.expectRefusal({
      label: 'R3 — lanes sharing a directory by shape are refused, with a witness that does not exist yet',
      rule: 'R3-territory',
      showOutput: true,
      result: checkPlan(dir, 'r3', {
        planId: 'drill-r3',
        lanes: [
          { id: 'GATES', writeRoot: 'packages/core/scripts', writeSet: ['packages/core/scripts/**/*-gate.mjs'] },
          { id: 'GEN', writeRoot: 'packages/core/scripts', writeSet: ['packages/core/scripts/**/build-*.mjs'] },
        ],
      }),
    });
    suite.expectPass({
      label: 'R3 CONTROL — the same two lanes pass once each excludes the other\'s shape (the shipped synthetic rows)',
      result: checkPlan(dir, 'r3-control', {
        planId: 'drill-r3-control',
        lanes: [
          { id: 'GATES', row: 'tooling:gates' },
          { id: 'GEN', row: 'tooling:generator' },
        ],
      }),
    });

    // The nested writeRoot pairs: prove the ledger's writeExcludes are load-bearing.
    suite.expectRefusal({
      label: 'R3 — the nested shell pair collides once app-shell\'s writeExcludes is dropped',
      rule: 'R3-territory',
      result: checkPlan(dir, 'nested', {
        planId: 'drill-nested',
        lanes: [
          { id: 'SHELL', writeRoot: 'packages/core/src/ui/structures/shell' },
          { id: 'TABS', row: 'structure/shell/bottom-tab-bar' },
        ],
      }),
    });

    // R1 — a declaration that escapes its own bound.
    suite.expectRefusal({
      label: 'R1 — a writeSet reaching outside its row\'s writeRoot is refused',
      rule: 'R1-bound',
      result: checkPlan(dir, 'r1', {
        planId: 'drill-r1',
        lanes: [
          {
            id: 'ESCAPE',
            row: 'primitive/display/avatar',
            writeSet: ['packages/core/src/ui/primitives/display/Avatar/**', 'packages/core/src/foundation/tokens/css/**'],
          },
        ],
      }),
    });

    // R4 — the single-owner rules, both directions.
    suite.expectRefusal({
      label: 'R4 — a lane covering themes/default.css without claiming it is refused',
      rule: 'R4-single-owner',
      result: checkPlan(dir, 'r4-silent', {
        planId: 'drill-r4-silent',
        lanes: [{ id: 'BASE', row: 'layer:base' }],
      }),
    });
    suite.expectRefusal({
      label: 'R4 — two lanes claiming themes/default.css in one plan is refused (single ownership, always)',
      rule: 'R4-single-owner',
      showOutput: true,
      result: checkPlan(dir, 'r4-two', {
        planId: 'drill-r4-two',
        lanes: [
          {
            id: 'B1',
            writeRoot: 'packages/core/src/foundation/tokens/css/foundation/themes',
            writeSet: ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'],
            claimsSharedFiles: ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'],
          },
          {
            id: 'B2',
            writeRoot: 'packages/core/src/foundation/tokens/css/foundation/themes',
            writeSet: ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'],
            claimsSharedFiles: ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'],
          },
        ],
      }),
    });

    // R4 derived half — a shared skin file the ledger shows has several owners.
    suite.expectRefusal({
      label: 'R4 — a lane covering a multi-owner skin file derived from the ledger is refused',
      rule: 'R4-single-owner',
      result: checkPlan(dir, 'r4-derived', {
        planId: 'drill-r4-derived',
        lanes: [
          {
            id: 'SKIN',
            writeRoot: 'packages/core/src/foundation/tokens/css/presentation/components/skin',
            writeSet: ['packages/core/src/foundation/tokens/css/presentation/components/skin/button-icon.css'],
          },
        ],
      }),
    });

    return suite.summary();
  });
}

if (process.argv[1]?.endsWith('drills/intersection/index.mjs')) {
  process.exit(runDrills() ? 0 : 1);
}
