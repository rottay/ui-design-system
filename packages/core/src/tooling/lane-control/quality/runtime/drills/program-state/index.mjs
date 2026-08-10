#!/usr/bin/env node
/**
 * @fileoverview Drills for the state-file writer.
 *
 * EVERY ONE OF THESE RUNS AGAINST A COPY in a temp directory. The real
 * `PROGRAM-STATE.md` is never written by a drill: the transition is the
 * coordinator's to perform, and a drill that rewrote the programme's own
 * resume point would be doing exactly what this folder exists to stop.
 *
 * The round trip is the positive control — write, then check, and the check
 * must pass. Then four separate ways the document can stop being true, each
 * asserted to produce its own rule so the failure says which one happened.
 */
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDrillSuite, run, withTempDir } from '../../../foundation/harness/index.mjs';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const CHECKER = `${ROOT}/packages/core/src/tooling/lane-control/public/program-state/index.mjs`;
const SOURCE = `${ROOT}/packages/core/test-artifacts/quality-evidence/wo-cra-23/PROGRAM-STATE.md`;
const INTENT = `${ROOT}/packages/core/src/tooling/lane-control/public/program-state/state.intent.example.json`;

export function runDrills() {
  const suite = createDrillSuite('program-state drills');

  return withTempDir('program-state', (dir) => {
    const target = join(dir, 'PROGRAM-STATE.md');
    const intent = join(dir, 'intent.json');
    copyFileSync(SOURCE, target);
    copyFileSync(INTENT, intent);

    const call = (...args) => run(process.execPath, [CHECKER, ...args, '--intent', intent, '--target', target], { cwd: ROOT });

    // The document as it stands today: §4 was hand-written.
    suite.expectRefusal({
      label: 'P4 — a §4 that was hand-written, not transitioned, is refused',
      rule: 'P4-unstamped',
      result: call('--check'),
    });

    suite.expectPass({ label: 'ROUND TRIP (1/2) — --write performs the transition', result: call('--write') });
    suite.expectPass({ label: 'ROUND TRIP (2/2) — --check passes immediately afterwards', result: call('--check') });

    const written = readFileSync(target, 'utf8');
    suite.expectFact({
      label: 'ROUND TRIP — §4 now carries derived figures the intent never typed',
      ok: written.includes('### Derived at write time') && /\| `ledger\.families` \| \d+ \|/.test(written),
      details: [
        (written.match(/\| `ledger\.families` \| .* \|/) ?? ['<missing>'])[0].trim(),
        (written.match(/\| `universe\.files` \| .* \|/) ?? ['<missing>'])[0].trim(),
      ],
    });
    suite.expectFact({
      label: 'ROUND TRIP — the rest of the document is untouched (§1, §2, §3, §5, §6 survive byte-for-byte)',
      ok: (() => {
        const before = readFileSync(SOURCE, 'utf8');
        const cut = (text) => text.slice(0, text.indexOf('## 4. STATE')) + text.slice(text.indexOf('## 5. DECISIONS TAKEN'));
        return cut(before) === cut(written);
      })(),
      details: ['everything outside §4 is compared byte-for-byte before and after the write'],
    });

    // P8 — somebody edits a derived figure by hand.
    const tampered = written.replace(/\| `ledger\.families` \| (\d+) \|/, (_match, value) => `| \`ledger.families\` | ${Number(value) + 1} |`);
    writeFileSync(target, tampered);
    suite.expectRefusal({
      label: 'P8 — a derived figure edited by hand is refused (the figure no longer matches the repository)',
      rule: 'P8-body-mismatch',
      showOutput: true,
      result: call('--check'),
    });
    writeFileSync(target, written);

    // P5 — HEAD moves. Simulated by rewriting the stamped sha, which is the
    // same condition the check faces after any commit lands.
    writeFileSync(target, written.replace(/head=([0-9a-f]+)/, 'head=0000000'));
    suite.expectRefusal({
      label: 'P5 — a §4 written against a different HEAD is refused: every derived figure in it is stale',
      rule: 'P5-head-moved',
      showOutput: true,
      result: call('--check'),
    });
    writeFileSync(target, written);

    // P6 — the intent changes and nobody re-renders.
    const intentBody = JSON.parse(readFileSync(intent, 'utf8'));
    intentBody.blockedOn = 'a different blocker that was never rendered into the document';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P6 — an intent that changed without a re-render is refused',
      rule: 'P6-intent-drift',
      result: call('--check'),
    });

    // P1 — a figure a command could produce, typed into the intent.
    intentBody.blockedOn = 'the ledger carries 252 families and the drain is not finished';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P1 — --write REFUSES an intent with a typed figure a command could produce',
      rule: 'P1-typed-figure',
      showOutput: true,
      result: call('--write'),
    });

    // P1 — a sha typed into the intent.
    intentBody.blockedOn = 'blocked behind commit 7db6a8d4a until it is adjudicated';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P1 — a commit sha typed into the intent is refused; a sha is always derivable',
      rule: 'P1-typed-figure',
      result: call('--write'),
    });

    // P2 — a placeholder no derivation produces.
    intentBody.blockedOn = 'blocked on {{derived.does.not.exist}}';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P2 — a placeholder no derivation produces is refused rather than rendered literally',
      rule: 'P2-unknown-derivation',
      result: call('--write'),
    });

    return suite.summary();
  });
}

if (process.argv[1]?.endsWith('drills/program-state/index.mjs')) {
  process.exit(runDrills() ? 0 : 1);
}
