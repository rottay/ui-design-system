#!/usr/bin/env node
/**
 * @fileoverview Drills for the work-order validator.
 *
 * Every mutation below is a real way a work order has gone wrong, or would:
 * a model chosen without a pre-pass, a substitution table on a lane that is
 * not allowed to substitute, a paraphrased mandatory sentence, a verification
 * that needs the build that is red, a commit pathspec that stages another
 * lane's files. The validator is asserted to refuse each one BY RULE ID, so a
 * refusal for an unrelated reason does not count.
 */
import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDrillSuite, run, withTempDir } from '../../../foundation/harness/index.mjs';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const CHECKER = `${ROOT}/packages/core/src/tooling/lane-control/public/work-order/index.mjs`;
const EXAMPLE = `${ROOT}/packages/core/src/tooling/lane-control/public/work-order/examples/wo-example.json`;

export function runDrills() {
  const suite = createDrillSuite('work-order drills');
  const base = JSON.parse(readFileSync(EXAMPLE, 'utf8'));

  return withTempDir('work-order', (dir) => {
    const check = (name, mutate) => {
      const workOrder = JSON.parse(JSON.stringify(base));
      mutate(workOrder);
      const path = join(dir, `${name}.json`);
      writeFileSync(path, JSON.stringify(workOrder, null, 2));
      return run(process.execPath, [CHECKER, '--work-order', path], { cwd: ROOT });
    };

    suite.expectPass({
      label: 'POSITIVE CONTROL — the shipped example work order validates',
      result: run(process.execPath, [CHECKER, '--work-order', EXAMPLE], { cwd: ROOT }),
    });

    suite.expectRefusal({
      label: 'S — a missing required field is refused',
      rule: 'S-shape',
      result: check('missing-field', (wo) => delete wo.commitPathspecs),
    });

    suite.expectRefusal({
      label: 'W1 — a PADDED model reason is refused: length clears the schema, distinct words do not',
      rule: 'W1-model-reason',
      showOutput: true,
      result: check('boilerplate', (wo) => {
        wo.model.reason = 'Mechanical'.padEnd(61, '.');
      }),
    });

    suite.expectRefusal({
      label: 'W1 — a sonnet lane with no pre-pass evidence is refused',
      rule: 'W1-model-reason',
      result: check('no-prepass', (wo) => delete wo.model.prePassEvidence),
    });

    suite.expectRefusal({
      label: 'W1 — a sonnet lane citing pre-pass evidence that is not on disk is refused',
      rule: 'W1-model-reason',
      result: check('ghost-prepass', (wo) => {
        wo.model.prePassEvidence = 'packages/core/test-artifacts/quality-evidence/wo-cra-23/no-such-pre-pass.md';
      }),
    });

    suite.expectRefusal({
      label: 'W2 — a headers-only lane carrying a substitution table is refused',
      rule: 'W2-edit-class',
      result: check('headers-with-table', (wo) => {
        wo.editClass = 'headers-only';
      }),
    });

    suite.expectRefusal({
      label: 'W2 — a deletion lane with no death proof is refused (a zero read count is a FLOOR)',
      rule: 'W2-edit-class',
      result: check('no-death-proof', (wo) => {
        wo.editClass = 'deletion-with-death-proof';
        wo.substitutionTable = [];
      }),
    });

    suite.expectRefusal({
      label: 'S — a substitution with no expectedCount is refused',
      rule: 'S-shape',
      result: check('no-count', (wo) => delete wo.substitutionTable[0].expectedCount),
    });

    suite.expectRefusal({
      label: 'W3 — a PARAPHRASED mandatory sentence is refused; §2 requires it verbatim',
      rule: 'W3-mandatory-sentence',
      showOutput: true,
      result: check('paraphrase', (wo) => {
        wo.mandatorySentence =
          'Only make the edits in the substitution table. Do not declare token names outside it, and do not fix anything adjacent; write findings instead of editing them.';
      }),
    });

    suite.expectRefusal({
      label: 'W4 — a verification command that needs the build is refused (the build has been red)',
      rule: 'W4-build-free',
      showOutput: true,
      result: check('build-bound', (wo) => {
        wo.verificationCommands = [
          'pnpm -C packages/core build && node packages/core/scripts/channel-wiring-zero-delta-gate.mjs --baseline <pinned>',
        ];
      }),
    });

    suite.expectRefusal({
      label: 'W4 — a work order omitting the mandatory channel-wiring gate is refused',
      rule: 'W4-build-free',
      result: check('no-gate', (wo) => {
        wo.verificationCommands = ['git diff --stat'];
      }),
    });

    suite.expectRefusal({
      label: 'W5 — `git commit -- .` as a pathspec is refused (in a shared tree it commits another agent\'s work)',
      rule: 'W5-commit-pathspec',
      result: check('dot-pathspec', (wo) => {
        wo.commitPathspecs = ['.'];
      }),
    });

    suite.expectRefusal({
      label: 'W5 — a pathspec containing an excluded region is refused',
      rule: 'W5-commit-pathspec',
      showOutput: true,
      result: check('swallowing-pathspec', (wo) => {
        wo.row = 'structure/shell/app-shell';
        wo.writeSet = ['packages/core/src/ui/structures/shell/**'];
        wo.writeExcludes = ['packages/core/src/ui/structures/shell/bottom-tab-bar'];
        wo.commitPathspecs = ['packages/core/src/ui/structures/shell'];
      }),
    });

    suite.expectRefusal({
      label: 'W6 — a findings file with nowhere to land is refused',
      rule: 'W6-findings-file',
      result: check('no-findings-dir', (wo) => {
        wo.findingsFile = 'packages/core/test-artifacts/quality-evidence/no-such-directory/findings.md';
      }),
    });

    suite.expectRefusal({
      label: 'W7 — a writeSet escaping the row\'s bound is refused by the SAME machinery the plan checker uses',
      rule: 'W7-bound',
      result: check('escapes-bound', (wo) => {
        wo.writeSet = ['packages/core/src/ui/primitives/display/Avatar/**', 'packages/core/src/foundation/tokens/css/**'];
      }),
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
