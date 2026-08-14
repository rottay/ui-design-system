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
 * The real Modern Rescue README is never written by a drill. The coordinator
 * holds its checkpoint transition.
 */
import { pathToFileURL } from 'node:url';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDrillSuite, run, withTempDir } from '../../harness/index.mjs';
// The command is exercised as a SUBPROCESS everywhere below — that is what a coordinator runs.
// These three are imported directly for one purpose only: to compare two derivations — and two
// renderings — of the same repository across a mutation, which no exit code can express.
// `isProvenance` in particular is the writer's own pinned/provenance classifier, so the drill
// cannot drift into its own private idea of which facts are allowed to move.
import { derive, isProvenance, renderBody } from '../../../../public/program-state/index.mjs';
// Same reason, one layer down: the archive's inertness is a claim about LANE BOUNDS as much as
// about figures, and a bound is an object, not an exit code.
import { loadContext, readPlan, resolveLane } from '../../../../composition/plan/index.mjs';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const CHECKER = `${ROOT}/packages/core/src/tooling/lane-control/public/program-state/index.mjs`;

const STATE_FILE = 'packages/core/scripts/quality-evidence/programs/modern-rescue/README.md';
const INTENT_FILE = 'packages/core/src/tooling/lane-control/public/program-state/state.intent.example.json';

/** Everything `derive()` reads, copied at its repo-relative path. */
const CARRIED = [
  STATE_FILE,
  INTENT_FILE,
  // Sealed historical evidence. It is carried NOT because `derive()` reads it -- it no longer
  // does -- but so the inverse drill below can prove that editing it changes nothing.
  'packages/core/test-artifacts/quality-evidence/wo-cra-23/family-ledger.json',
  'packages/core/scripts/quality-evidence/programs/modern-rescue/family-inventory.json',
  'packages/core/scripts/quality-evidence/programs/modern-rescue/manifest/index.json',
  'packages/core/src/tooling/lane-control/public/work-order/synthetic-rows.json',
  'packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json',
];

function git(repo, args) {
  return execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/**
 * A deterministic hand-written checkpoint, installed over whatever the real document
 * currently carries.
 *
 * The real README is live — the coordinator transitions it, and
 * its checkpoint is now a rendered section against the coordinator's own intent. A
 * drill that asserted against that content would go red every time the
 * programme made progress, which is a drill measuring the wrong thing. The
 * sections OUTSIDE the checkpoint are still the real ones, so the byte-preservation drill
 * keeps its meaning.
 */
const HAND_WRITTEN_SECTION = `## Current checkpoint

*Everything in this section is intent.*

**Current wave:** hand-written, never transitioned by the command.

**Blocked on:** nothing — this is a drill fixture.

`;

function installHandWrittenSection(path) {
  const document = readFileSync(path, 'utf8');
  const start = document.indexOf('## Current checkpoint');
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
  // Every family's source owner, as a directory, in THIS repository.
  //
  // The row loader refuses a family whose `sourceOwner` is not a directory in
  // the tree it is reading: a lane rooted at a path that does not exist covers
  // no file, so every containment check over it passes vacuously and the lane
  // is unbounded while looking bounded. That guard is fail-closed and stays
  // that way — so the throwaway repo has to satisfy it rather than be excused
  // from it. The directories are empty on purpose: this drill is about the
  // checkpoint document, and a bound is a bound whether or not anything has
  // been written inside it yet. (Git does not track empty directories, so they
  // survive `add`/`commit` untracked and unlisted, which is exactly right —
  // they must not enter the universe and inflate a covered-file figure.)
  const inventory = JSON.parse(
    readFileSync(join(dir, 'packages/core/scripts/quality-evidence/programs/modern-rescue/family-inventory.json'), 'utf8'),
  );
  for (const row of inventory.rows ?? []) {
    mkdirSync(join(dir, row.sourceOwner), { recursive: true });
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
  const start = document.indexOf('## Current checkpoint');
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
      label: 'P4 — a checkpoint that was hand-written, not transitioned, is refused',
      rule: 'P4-unstamped',
      result: call('--check'),
    });

    suite.expectPass({ label: 'ROUND TRIP (1/2) — --write performs the transition', result: call('--write') });
    suite.expectPass({ label: 'ROUND TRIP (2/2) — --check passes immediately afterwards', result: call('--check') });

    // ── THE REGRESSION DRILL ────────────────────────────────────────────────
    const renderCommit = commitAll(dir, 'docs: transition programme checkpoint');
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
        `current HEAD ${headNow} does not appear in the checkpoint body`,
        'HEAD identity now lives in the stamp as provenance — a record of what the render was produced against, not a claim about now',
      ],
    });
    suite.expectFact({
      label: 'TEETH — the pinned figures are still in the body and still byte-verified',
      ok: /\| `inventory\.families` \| \d+ \|/.test(section)
        && /\| `manifest\.controlFamilyCells` \| \d+ \|/.test(section)
        && /\| `singleOwner\.entries` \| \d+ \|/.test(section),
      details: [
        (section.match(/\| `inventory\.families` \| .* \|/) ?? ['<missing>'])[0].trim(),
        (section.match(/\| `manifest\.controlFamilyCells` \| .* \|/) ?? ['<missing>'])[0].trim(),
        (section.match(/\| `singleOwner\.entries` \| .* \|/) ?? ['<missing>'])[0].trim(),
      ],
    });
    suite.expectFact({
      label: 'ROUND TRIP — the rest of the document is untouched byte-for-byte',
      ok: (() => {
        const cut = (text) => text.replace(sectionOf(text), '');
        return cut(pristine) === cut(written);
      })(),
      details: ['everything outside the checkpoint is compared byte-for-byte before and after the write'],
    });

    // ── TEETH, all preserved across commits ─────────────────────────────────
    const tampered = written.replace(/\| `inventory\.families` \| (\d+) \|/, (_m, value) => `| \`inventory.families\` | ${Number(value) + 1} |`);
    writeFileSync(target, tampered);
    suite.expectRefusal({
      label: 'P8 — a derived figure edited by hand is STILL refused, in a committed tree',
      rule: 'P8-body-mismatch',
      showOutput: true,
      result: call('--check'),
    });
    writeFileSync(target, written);

    // A real content change in an ACTIVE source must still go red: the pinned facts have teeth.
    // This drill used to remove a row from `family-ledger.json`, because the family denominator
    // was pinned from the ledger. It is pinned from the manifest and the family inventory now,
    // so the ledger is no longer a source a pinned figure can be false about.
    const manifestPath = join(
      dir,
      'packages/core/scripts/quality-evidence/programs/modern-rescue/manifest/index.json',
    );
    const manifestBefore = readFileSync(manifestPath, 'utf8');
    const cellsIndex = JSON.parse(manifestBefore);
    cellsIndex.denominators.controlFamilyCells += 1;
    writeFileSync(manifestPath, JSON.stringify(cellsIndex, null, 2));
    suite.expectRefusal({
      label: 'P8 — a REAL manifest denominator change goes red, because the pinned figure is now false',
      rule: 'P8-body-mismatch',
      showOutput: true,
      result: call('--check'),
    });
    writeFileSync(manifestPath, manifestBefore);

    // THE INVERSE, and the reason the drill above changed shape.
    //
    // Sealed historical evidence must not decide ANYTHING that runs. `family-ledger.json` is
    // carried into this repository so that can be MEASURED rather than asserted: mutate the
    // archive as violently as the format allows, then compare the three things the archive used
    // to govern —
    //
    //   the VERDICT   the `--check` exit code;
    //   the CHECKPOINT the section the writer renders from the same intent, byte for byte;
    //   the FIGURES   every pinned fact: denominator, cells, adjudication rollup, per-layer counts,
    //                 synthetic rows, single-owner entries;
    //   the BOUNDS    each lane's resolved writeRoot, derived writeExcludes and covered-file count.
    //
    // WHAT CHANGED, AND WHY THE PREDECESSOR DRILL IS GONE. This block used to end with a second
    // drill — "THE SEAL HAS TEETH" — which corrupted the archive's recorded `sharedSkinFiles` map
    // and required the checkpoint to go RED, because the checkpoint pinned that map's internal
    // consistency as a fact. That was the last thread by which the archive still governed a live
    // gate, and it had the defect in miniature: a sealed file could not be examined, moved or
    // re-serialised without a checkpoint failing, so the only way to keep the gate green was to
    // never touch history — or to rewrite it. Both halves are now stated as one law, and the
    // mutation below deliberately includes the very corruption that rule existed to catch:
    // editing the archive changes nothing, INCLUDING the thing it used to change.
    // WHAT IS COMPARED, AND WHAT IS DELIBERATELY NOT. Raw `--check` output is not an invariant and
    // must not be asserted as one: it reports provenance LIVE — HEAD, `tree.dirty`, the universe
    // file count, path-changed diagnostics — and every one of those legitimately moves when any
    // carried file is written, the drill's own mutation included. Requiring byte-identical
    // diagnostics would be requiring the drill not to have happened, and would re-create in a new
    // place the exact defect this law removes: a file that cannot be touched without a gate failing.
    // What must not move is the VERDICT, the RENDERED CHECKPOINT, the PINNED FIGURES and the BOUNDS.
    // Pinned-versus-provenance is not re-guessed here either — `isProvenance` is the writer's own
    // classifier, so a fact reclassified upstream is reclassified here in the same commit.
    const pinnedFigures = (root) => {
      const derived = derive({ root });
      return Object.fromEntries(
        Object.entries(derived)
          .filter(([key]) => !isProvenance(derived, key))
          .map(([key, entry]) => [key, entry.value]),
      );
    };
    const renderedCheckpoint = (root) =>
      renderBody(JSON.parse(readFileSync(join(root, INTENT_FILE), 'utf8')), derive({ root }));
    const laneBounds = (root) => {
      const context = loadContext({ root });
      const plan = readPlan(join(root, 'packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json'));
      return plan.lanes
        .map((lane) => resolveLane(lane, context))
        .map((lane) => `${lane.id} | ${lane.writeRoot} | excl[${lane.writeExcludes.join(',')}] | files=${lane.files.length}`);
    };

    const ledgerPath = join(dir, 'packages/core/test-artifacts/quality-evidence/wo-cra-23/family-ledger.json');
    const ledgerBefore = readFileSync(ledgerPath, 'utf8');
    const verdictBefore = call('--check');
    const figuresBefore = pinnedFigures(dir);
    const boundsBefore = laneBounds(dir);
    const renderBefore = renderedCheckpoint(dir);

    const ledger = JSON.parse(ledgerBefore);
    const droppedRow = ledger.rows.pop();
    for (const row of ledger.rows) {
      row.sourceOwner = 'packages/core/src/__archive_says_the_family_moved_here__';
      row.skinFiles = [];
    }
    ledger.sharedSkinFiles = {
      'packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/__not-a-real-file.css': ['a', 'b'],
    };
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

    const verdictAfter = call('--check');
    const figuresAfter = pinnedFigures(dir);
    const boundsAfter = laneBounds(dir);
    const renderAfter = renderedCheckpoint(dir);
    const rowsOnDisk = JSON.parse(readFileSync(ledgerPath, 'utf8')).rows.length;
    writeFileSync(ledgerPath, ledgerBefore);

    suite.expectFact({
      label: 'HISTORY IS NOT AUTHORITY — rewriting every sealed row moves no verdict, no rendered checkpoint, no figure and no lane bound',
      ok:
        rowsOnDisk === JSON.parse(ledgerBefore).rows.length - 1
        && verdictBefore.status === 0
        && verdictAfter.status === verdictBefore.status
        && renderBefore.body.length > 0
        && renderAfter.body === renderBefore.body
        && Object.keys(figuresBefore).length >= 8
        && JSON.stringify(figuresBefore) === JSON.stringify(figuresAfter)
        && boundsBefore.length > 0
        && JSON.stringify(boundsBefore) === JSON.stringify(boundsAfter),
      details: [
        `dropped the sealed row "${droppedRow?.id ?? '<none>'}", repointed every remaining sourceOwner at a path that does not exist, emptied every skinFiles and replaced sharedSkinFiles with one fabricated entry`,
        `--check verdict: exit ${verdictBefore.status} → ${verdictAfter.status} (raw diagnostics are NOT compared: they report provenance live, which any write moves)`,
        `checkpoint re-rendered from the same intent: ${renderBefore.body.length} bytes, identical: ${renderAfter.body === renderBefore.body}`,
        `${Object.keys(figuresBefore).length} pinned figures re-derived, every one unchanged`,
        `${boundsBefore.length} lane bounds re-resolved, every one unchanged: ${boundsBefore.join(' · ')}`,
      ],
    });
    suite.expectFact({
      label: 'HISTORY IS NOT AUTHORITY — the archive was restored byte-for-byte',
      ok: readFileSync(ledgerPath, 'utf8') === ledgerBefore,
      details: [`${ledgerBefore.length} bytes restored — the drill mutates history, it does not rewrite it`],
    });

    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.rollups.familyReviews.blockedOwnerDecision += 1;
    manifest.rollups.familyReviews.unreviewed -= 1;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    suite.expectRefusal({
      label: 'P8 — a REAL manifest adjudication change goes red until the checkpoint is re-rendered',
      rule: 'P8-body-mismatch',
      showOutput: true,
      result: call('--check'),
    });
    manifest.rollups.familyReviews.blockedOwnerDecision -= 1;
    manifest.rollups.familyReviews.unreviewed += 1;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

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

    // The figure is READ from the derivation, not typed here. It used to be the literal 252,
    // which stopped colliding with anything the moment the catalog moved — so the drill went
    // green while testing nothing. A drill that hardcodes the number it is trying to catch
    // decays into a no-op exactly when the thing it guards starts moving.
    const familyCount = derive({ root: dir })['inventory.families'].value;
    intentBody.blockedOn = `the catalog carries ${familyCount} families and the drain is not finished`;
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

    // THE EXCEPTION LIST CANNOT REACH A SHA. The allowlist was consulted before
    // the sha rule ran, so the "unconditional" refusal had a conditional in
    // front of it: one entry explaining the sha and a frozen HEAD walked into
    // the document. The list covers exactly one case — an integer that collides
    // with a derived figure while meaning something else — and both halves are
    // drilled here: the sha is still refused WITH the exception present, and
    // the exception itself is refused for not being an integer.
    intentBody.allowedLiterals = [
      ...(intentBody.allowedLiterals ?? []),
      { value: '7db6a8d4a', reason: 'This is the commit the adjudication is blocked behind, and it is stated deliberately.' },
    ];
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    const shaWithException = call('--write');
    suite.expectRefusal({
      label: 'P1 — a sha stays refused even when allowedLiterals explains it; the exception list covers integer collisions, nothing else',
      rule: 'P1-typed-figure',
      showOutput: true,
      result: shaWithException,
    });
    suite.expectFact({
      label: 'P1 — and the exception itself is refused: a value that is not an integer has nothing to be an exception TO',
      ok:
        shaWithException.output.includes('is commit-sha-shaped')
        && shaWithException.output.includes('is not an integer'),
      details: [
        'both findings are present: the sha in the prose, and the allowedLiterals entry that tried to license it',
        'a single refusal would not prove this — the sha could have been caught while the laundering entry survived',
      ],
    });
    intentBody.allowedLiterals = intentBody.allowedLiterals.filter((entry) => entry.value !== '7db6a8d4a');

    // THE SAME SHA, TYPED IN CAPITALS. The rule was case-sensitive while git is
    // not: `git rev-parse 68F258690` and `git rev-parse 68f258690` resolve the
    // identical commit, so one spelling of a frozen HEAD was refused and the
    // other was written into the checkpoint. The drill uses a REAL sha from this
    // repository, because a rule that only catches the lowercase half is not a
    // rule about shas — it is a rule about lowercase letters.
    intentBody.blockedOn = 'blocked behind commit 68F258690 until it is adjudicated';
    writeFileSync(intent, JSON.stringify(intentBody, null, 2));
    suite.expectRefusal({
      label: 'P1 — an UPPERCASE sha is refused exactly like the lowercase one; hex is hex whichever case it is typed in',
      rule: 'P1-typed-figure',
      showOutput: true,
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
