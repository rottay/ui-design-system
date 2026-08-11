#!/usr/bin/env node
/**
 * @fileoverview Drills for the state-file writer.
 *
 * These run inside a THROWAWAY GIT REPOSITORY, not just a temp directory, and
 * that is the point. The defect this file now guards against could not be
 * reproduced without commits: `--write` stamped the HEAD it rendered against
 * and pinned HEAD-varying values into a byte-verified body, so committing the
 * render moved HEAD past its own stamp and the check went permanently red.
 * A drill that never commits cannot see that, and the first version of this
 * file never committed.
 *
 * THE REGRESSION DRILL IS THE ONE THAT MATTERS: write, commit, commit again,
 * check — and the check must be GREEN. Every other drill here is protecting
 * the teeth while that one protects the satisfiability.
 *
 * The real `PROGRAM-STATE.md` is never written by a drill. The coordinator
 * holds that transition.
 */
import { pathToFileURL } from 'node:url';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDrillSuite, run, withTempDir } from '../../../foundation/harness/index.mjs';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const CHECKER = `${ROOT}/packages/core/src/tooling/lane-control/public/program-state/index.mjs`;

const STATE_FILE = 'packages/core/test-artifacts/quality-evidence/wo-cra-23/PROGRAM-STATE.md';
const INTENT_FILE = 'packages/core/src/tooling/lane-control/public/program-state/state.intent.example.json';

/** Everything `derive()` reads, copied at its repo-relative path. */
const CARRIED = [
  STATE_FILE,
  INTENT_FILE,
  'packages/core/test-artifacts/quality-evidence/wo-cra-23/family-ledger.json',
  'packages/core/src/tooling/lane-control/public/work-order/synthetic-rows.json',
  'packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json',
];

function git(repo, args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/**
 * A deterministic hand-written §4, installed over whatever the real document
 * currently carries.
 *
 * The real `PROGRAM-STATE.md` is live — the coordinator transitions it, and
 * its §4 is now a rendered section against the coordinator's own intent. A
 * drill that asserted against that content would go red every time the
 * programme made progress, which is a drill measuring the wrong thing. The
 * sections OUTSIDE §4 are still the real ones, so the byte-preservation drill
 * keeps its meaning.
 */
const HAND_WRITTEN_SECTION = `## 4. STATE

*Everything in this section is intent.*

**Current wave:** hand-written, never transitioned by the command.

**Blocked on:** nothing — this is a drill fixture.

`;

function installHandWrittenSection(path) {
  const document = readFileSync(path, 'utf8');
  const start = document.indexOf('## 4. STATE');
  const rest = document.slice(start + 1);
  const next = rest.indexOf('\n## ');
  const end = next === -1 ? document.length : start + 1 + next + 1;
  writeFileSync(path, `${document.slice(0, start)}${HAND_WRITTEN_SECTION}${document.slice(end)}`);
}

function seedRepo(dir) {
  git(dir, ['init', '--quiet', '--initial-branch=main']);
  git(dir, ['config', 'user.email', 'drill@example.invalid']);
  git(dir, ['config', 'user.name', 'drill']);
  for (const path of CARRIED) {
    mkdirSync(join(dir, dirname(path)), { recursive: true });
    copyFileSync(`${ROOT}/${path}`, join(dir, path));
  }
  installHandWrittenSection(join(dir, STATE_FILE));
  git(dir, ['add', '.']);
  git(dir, ['commit', '--quiet', '-m', 'seed']);
}

function commitAll(repo, message) {
  git(repo, ['add', '-A']);
  git(repo, ['commit', '--quiet', '-m', message]);
  return git(repo, ['rev-parse', '--short', 'HEAD']).trim();
}

function sectionOf(document) {
  const start = document.indexOf('## 4. STATE');
  const rest = document.slice(start + 1);
  const next = rest.indexOf('\n## ');
  return next === -1 ? document.slice(start) : document.slice(start, start + 1 + next);
}

export function runDrills() {
  const suite = createDrillSuite('program-state drills');

  return withTempDir('program-state', (dir) => {
    seedRepo(dir);
    const target = join(dir, STATE_FILE);
    const intent = join(dir, INTENT_FILE);
    const pristine = readFileSync(target, 'utf8');

    const call = (...args) => run(process.execPath, [CHECKER, ...args, '--intent', intent, '--target', target], { cwd: dir });

    suite.expectRefusal({
      label: 'P4 — a §4 that was hand-written, not transitioned, is refused',
      rule: 'P4-unstamped',
      result: call('--check'),
    });

    suite.expectPass({ label: 'ROUND TRIP (1/2) — --write performs the transition', result: call('--write') });
    suite.expectPass({ label: 'ROUND TRIP (2/2) — --check passes immediately afterwards', result: call('--check') });

    // ── THE REGRESSION DRILL ────────────────────────────────────────────────
    const renderCommit = commitAll(dir, 'docs: transition PROGRAM-STATE §4');
    const afterCommit = call('--check');
    suite.expectPass({
      label: `REGRESSION — --check is GREEN after the render is COMMITTED (this was permanently red: committing moved HEAD past the stamp)`,
      result: afterCommit,
    });

    writeFileSync(join(dir, 'unrelated.txt'), 'a lane did some ordinary work\n');
    commitAll(dir, 'chore: unrelated commit');
    writeFileSync(join(dir, 'unrelated-2.txt'), 'and some more\n');
    const laterCommit = commitAll(dir, 'chore: another unrelated commit');
    suite.expectPass({
      label: 'REGRESSION — still GREEN two further commits later; drift no longer widens into a failure',
      result: call('--check'),
      showOutput: true,
    });
    suite.expectFact({
      label: 'REGRESSION — HEAD drift is still REPORTED, with its distance, so the signal is not simply discarded',
      ok: call('--check').output.includes('commit(s) since') && renderCommit !== laterCommit,
      details: [(call('--check').output.match(/·.*commit\(s\) since.*/) ?? ['<missing>'])[0].trim()],
    });

    const written = readFileSync(target, 'utf8');
    const section = sectionOf(written);
    const headNow = git(dir, ['rev-parse', '--short', 'HEAD']).trim();
    suite.expectFact({
      label: 'ROOT CAUSE — no HEAD-varying value is pinned in the rendered body any more',
      ok: !section.replace(/<!--[\s\S]*?-->/g, '').includes(headNow) && !section.includes('| `head.short` |'),
      details: [
        `current HEAD ${headNow} does not appear in the §4 body`,
        'HEAD identity now lives in the stamp as provenance — a record of what the render was produced against, not a claim about now',
      ],
    });
    suite.expectFact({
      label: 'TEETH — the pinned figures are still in the body and still byte-verified',
      ok: /\| `ledger\.families` \| \d+ \|/.test(section) && /\| `singleOwner\.entries` \| \d+ \|/.test(section),
      details: [
        (section.match(/\| `ledger\.families` \| .* \|/) ?? ['<missing>'])[0].trim(),
        (section.match(/\| `singleOwner\.entries` \| .* \|/) ?? ['<missing>'])[0].trim(),
      ],
    });
    suite.expectFact({
      label: 'ROUND TRIP — the rest of the document is untouched (§1, §2, §3, §5, §6 survive byte-for-byte)',
      ok: (() => {
        const cut = (text) => text.slice(0, text.indexOf('## 4. STATE')) + text.slice(text.indexOf('## 5. DECISIONS TAKEN'));
        return cut(pristine) === cut(written);
      })(),
      details: ['everything outside §4 is compared byte-for-byte before and after the write'],
    });

    // ── TEETH, all preserved across commits ─────────────────────────────────
    const tampered = written.replace(/\| `ledger\.families` \| (\d+) \|/, (_m, value) => `| \`ledger.families\` | ${Number(value) + 1} |`);
    writeFileSync(target, tampered);
    suite.expectRefusal({
      label: 'P8 — a derived figure edited by hand is STILL refused, in a committed tree',
      rule: 'P8-body-mismatch',
      showOutput: true,
      result: call('--check'),
    });
    writeFileSync(target, written);

    // A real content change must still go red: the pinned facts have teeth.
    const ledgerPath = join(dir, 'packages/core/test-artifacts/quality-evidence/wo-cra-23/family-ledger.json');
    const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));
    const removed = ledger.rows.pop();
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    suite.expectRefusal({
      label: 'P8 — a REAL ledger change (a row removed) goes red, because the pinned figure is now false',
      rule: 'P8-body-mismatch',
      showOutput: true,
      result: call('--check'),
    });
    ledger.rows.push(removed);
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

    // ── P9: the guard that stops the defect coming back ─────────────────────
    const intentBody = JSON.parse(readFileSync(intent, 'utf8'));
    const restoreIntent = JSON.parse(JSON.stringify(intentBody));

    intentBody.derivedFacts = [...intentBody.derivedFacts, 'head.short'];
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P9 — pinning a PROVENANCE fact into the body is refused: this is the defect, blocked at its source',
      rule: 'P9-provenance-pinned',
      showOutput: true,
      result: call('--write'),
    });

    intentBody.derivedFacts = restoreIntent.derivedFacts;
    intentBody.blockedOn = 'blocked as of {{derived.head.short}}';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P9 — interpolating a provenance value into PROSE is refused too; the same hole, the other path',
      rule: 'P9-provenance-pinned',
      result: call('--write'),
    });

    // ── The rules that were already right ───────────────────────────────────
    intentBody.blockedOn = 'a different blocker that was never rendered into the document';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P6 — an intent that changed without a re-render is refused',
      rule: 'P6-intent-drift',
      result: call('--check'),
    });

    intentBody.blockedOn = 'the ledger carries 252 families and the drain is not finished';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P1 — --write REFUSES an intent with a typed figure a command could produce',
      rule: 'P1-typed-figure',
      result: call('--write'),
    });

    intentBody.blockedOn = 'blocked behind commit 7db6a8d4a until it is adjudicated';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P1 — a commit sha typed into the intent is refused; a sha is always derivable',
      rule: 'P1-typed-figure',
      result: call('--write'),
    });

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
