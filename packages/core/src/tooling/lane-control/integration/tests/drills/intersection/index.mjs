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
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDrillSuite, inProcess, run, withTempDir } from '../../harness/index.mjs';
// The fixture catalog is injected through the module API, never through a flag:
// the commands refuse `--inventory` / `--synthetic` outright, and the drills
// below prove both halves — that the override still binds in process, and that
// no caller can reach it.
import { checkPlan as evaluatePlan } from '../../../../public/write-set-intersection/index.mjs';
import { loadContext, readPlan } from '../../../../composition/plan/index.mjs';
import {
  DEFAULT_INVENTORY_PATH,
  DEFAULT_SYNTHETIC_PATH,
  loadRows,
} from '../../../../runtime/ownership-rows/index.mjs';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const CHECKER = `${ROOT}/packages/core/src/tooling/lane-control/public/write-set-intersection/index.mjs`;
const EXAMPLE_PLAN = `${ROOT}/packages/core/src/tooling/lane-control/composition/plan/examples/plan.example.json`;
// The catalogs the loader reads by default, named ONCE. A drill that copies a
// catalog into a probe tree has to copy it to the path the loader will look at,
// and a second hand-written spelling of that path is a second authority.
const INVENTORY = join(ROOT, DEFAULT_INVENTORY_PATH);
const SYNTHETIC_ROWS = join(ROOT, DEFAULT_SYNTHETIC_PATH);
// The sealed R0 receipt. Repo-relative, because the drill below writes it into
// a DIFFERENT repository; `REAL_LEDGER` is the only absolute form, it is only
// ever read, and it is never passed to a write.
const HISTORY_LEDGER_PATH = 'packages/core/test-artifacts/quality-evidence/wo-cra-23/family-ledger.json';
const REAL_LEDGER = join(ROOT, HISTORY_LEDGER_PATH);
const AVATAR_ROW = 'primitive/display/avatar';
const MOVED_OWNER = 'packages/core/src/ui/primitives/display/Badge';

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * A fixture write that CANNOT land outside the drill's temp directory.
 *
 * Every path this drill writes is composed here, from a temp root plus a
 * repo-relative tail, and a tail that is absolute or climbs out is refused
 * rather than joined. The containment is computed, not promised in a comment.
 */
function writeFixture(tempRoot, relative, contents) {
  if (isAbsolute(relative) || relative.split('/').includes('..')) {
    throw new Error(`drill: fixture path "${relative}" would escape the temp directory`);
  }
  const path = join(tempRoot, relative);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  return path;
}

/**
 * A whole repository the checker can be pointed at, built inside the drill's
 * temp directory.
 *
 * The checker resolves its root with `git rev-parse` from its OWN cwd and reads
 * every input relative to that root — the inventory, the synthetic rows and the
 * file universe. So a probe tree with a git directory of its own, handed to the
 * checker as its cwd, moves all of those inputs into the temp directory and
 * leaves the working tree read-only. The archive is copied in at its canonical
 * path so the drill can empty THAT copy and still be asking the same question.
 */
function seedHistoryProbeRepo(dir) {
  const tempRoot = join(dir, 'history-probe');
  mkdirSync(tempRoot, { recursive: true });
  execFileSync('git', ['init', '--quiet'], { cwd: tempRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

  const inventoryBytes = readFileSync(INVENTORY);
  const inventoryPath = writeFixture(tempRoot, DEFAULT_INVENTORY_PATH, inventoryBytes);
  const syntheticPath = writeFixture(tempRoot, DEFAULT_SYNTHETIC_PATH, readFileSync(SYNTHETIC_ROWS));
  const ledgerPath = writeFixture(tempRoot, HISTORY_LEDGER_PATH, readFileSync(REAL_LEDGER));

  // `deriveFamilyRows` refuses a catalog whose sourceOwner is not a directory in
  // THIS tree — which is the check that makes an empty bound impossible, and
  // which the probe repo therefore has to satisfy for real.
  const inventory = JSON.parse(inventoryBytes.toString('utf8'));
  for (const row of inventory.rows) mkdirSync(join(tempRoot, row.sourceOwner), { recursive: true });

  // One file, so `files=1` in the control is a count of something. An empty
  // bound covers nothing and passes every containment check vacuously.
  const avatarOwner = inventory.rows.find((row) => row.id === AVATAR_ROW).sourceOwner;
  const coveredFile = `${avatarOwner}/index.tsx`;
  writeFixture(tempRoot, coveredFile, 'export const Avatar = null; // drill probe file\n');

  // The plan lives OUTSIDE the probe repo: it is an argument, not a tree input,
  // and keeping it out leaves the probe's file universe exactly what was seeded.
  const planPath = writeFixture(dir, 'history-probe.plan.json', `${JSON.stringify(
    {
      planId: 'drill-history-probe',
      lanes: [{ id: 'AV', row: AVATAR_ROW, writeSet: [`${avatarOwner}/**`] }],
    },
    null,
    2,
  )}\n`);

  return { tempRoot, inventoryPath, syntheticPath, ledgerPath, planPath, avatarOwner, coveredFile };
}

function checkPlan(dir, name, plan) {
  const path = join(dir, `${name}.json`);
  writeFileSync(path, JSON.stringify(plan, null, 2));
  return run(process.execPath, [CHECKER, '--plan', path], { cwd: ROOT });
}

/** The same check, over a fixture catalog no command line can name. */
function checkPlanWithCatalog(dir, name, plan, testCatalog) {
  const path = join(dir, `${name}.json`);
  writeFileSync(path, JSON.stringify(plan, null, 2));
  return inProcess(
    () => evaluatePlan({ plan: readPlan(path), context: loadContext({ root: ROOT, testCatalog }) }).findings,
  );
}

/**
 * A fabricated catalog file in the temp directory. Rows the product catalog
 * does not contain, so a drill about nesting never depends on two real
 * families happening to nest today — and cannot be silently disarmed by a
 * later reorganisation of the product tree.
 */
function writeRowsFile(dir, name, rows) {
  const path = join(dir, `rows.${name}.json`);
  writeFileSync(path, JSON.stringify({ schemaVersion: 1, rows }, null, 2));
  return path;
}

export function runDrills() {
  const suite = createDrillSuite('intersection drills');

  return withTempDir('intersection', (dir) => {
    suite.expectPass({
      label: 'POSITIVE CONTROL — the shipped example plan (6 lanes, incl. a nested source-owner pair) passes',
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
    // Both lanes are legally shaped `domain` lanes on real synthetic rows. The
    // ONLY difference from the control below is a substitute rows file with the
    // mutual exclusions removed — so what this drill isolates is the exclusions
    // being load-bearing, not a lane that was malformed to begin with.
    const strippedRows = JSON.parse(readFileSync(SYNTHETIC_ROWS, 'utf8'));
    for (const row of strippedRows.rows) {
      if (row.id === 'tooling:gates' || row.id === 'tooling:generator') row.writeExcludes = [];
    }
    const strippedPath = join(dir, 'synthetic-rows.no-excludes.json');
    writeFileSync(strippedPath, JSON.stringify(strippedRows, null, 2));

    suite.expectRefusal({
      label: 'R3 — lanes sharing a directory by shape are refused, with a witness that does not exist yet',
      rule: 'R3-territory',
      showOutput: true,
      result: checkPlanWithCatalog(
        dir,
        'r3',
        {
          planId: 'drill-r3',
          lanes: [
            { id: 'GATES', laneRole: 'domain', row: 'tooling:gates' },
            { id: 'GEN', laneRole: 'domain', row: 'tooling:generator' },
          ],
        },
        { syntheticPath: strippedPath },
      ),
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

    // The DERIVED writeExcludes are load-bearing — the ones `deriveFamilyRows`
    // computes from the inventory, not the ones a synthetic row declares for
    // itself. Both halves run over a fabricated nested pair in the temp
    // directory. The predecessor drill made this point by hand-declaring the
    // outer lane's writeRoot to strip the derivation; a hand-declared root is
    // now an integrator lane, integrator roots are the shared regions only, and
    // R0-lane-role refuses the shape before R3 is ever consulted. Bypassing
    // derivation is no longer reachable, so the pair is fabricated instead: the
    // inner owner is present in one inventory and absent from the other, which
    // is the same mechanism with nothing rigged.
    const DERIVED_OUTER = 'packages/core/src/tooling/lane-control/integration';
    const DERIVED_INNER = 'packages/core/src/tooling/lane-control/integration/tests/harness';
    const nestedPair = writeRowsFile(dir, 'nested-pair', [
      { id: 'drill:outer', layer: 'structure', family: 'DrillOuter', sourceOwner: DERIVED_OUTER },
      { id: 'drill:inner', layer: 'structure', family: 'DrillInner', sourceOwner: DERIVED_INNER },
    ]);
    const outerOnly = writeRowsFile(dir, 'outer-only', [
      { id: 'drill:outer', layer: 'structure', family: 'DrillOuter', sourceOwner: DERIVED_OUTER },
    ]);
    const derivedOuter = loadRows({ root: ROOT, testCatalog: { inventoryPath: nestedPair, syntheticPath: null } })
      .index.get('drill:outer');
    const strippedOuter = loadRows({ root: ROOT, testCatalog: { inventoryPath: outerOnly, syntheticPath: null } })
      .index.get('drill:outer');
    suite.expectFact({
      label: 'SETUP — the outer row excludes the nested owner because the inventory DERIVES it, and excludes nothing without it',
      ok:
        derivedOuter.writeExcludes.length === 1
        && derivedOuter.writeExcludes[0] === DERIVED_INNER
        && strippedOuter.writeExcludes.length === 0,
      details: [
        `with the inner owner: drill:outer writeExcludes = ${JSON.stringify(derivedOuter.writeExcludes)}`,
        `without it:          drill:outer writeExcludes = ${JSON.stringify(strippedOuter.writeExcludes)}`,
      ],
    });
    suite.expectPass({
      label: 'R3 CONTROL — the nested pair passes: the outer lane\'s derived exclusion hands the inner subtree to the inner lane',
      result: checkPlanWithCatalog(
        dir,
        'nested-control',
        {
          planId: 'drill-nested-control',
          lanes: [
            { id: 'OUTER', row: 'drill:outer' },
            { id: 'INNER', row: 'drill:inner' },
          ],
        },
        { inventoryPath: nestedPair, syntheticPath: null },
      ),
    });
    // Same two territories, same two lanes. The only change is that the inner
    // owner is no longer a family row, so the outer row derives no exclusion
    // over it — and the subtree is claimed twice.
    suite.expectRefusal({
      label: 'R3 — the same nested pair collides once the inner owner is absent from the inventory and nothing is derived away',
      rule: 'R3-territory',
      showOutput: true,
      result: checkPlanWithCatalog(
        dir,
        'nested',
        {
          planId: 'drill-nested',
          lanes: [
            { id: 'OUTER', row: 'drill:outer' },
            { id: 'INNER', laneRole: 'domain', row: 'drill:inner-claim' },
          ],
        },
        {
          inventoryPath: outerOnly,
          syntheticPath: writeRowsFile(dir, 'inner-claim', [
            {
              id: 'drill:inner-claim',
              layer: 'structure',
              family: 'DrillInner',
              synthetic: true,
              sourceOwner: DERIVED_INNER,
              writeRoot: DERIVED_INNER,
              writeSet: [`${DERIVED_INNER}/**`],
              writeExcludes: [],
            },
          ]),
        },
      ),
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

    // R4 shared CSS — the component skin layer is single-owner by architecture,
    // so an ad-hoc lane rooted straight into it is refused for silence.
    suite.expectRefusal({
      label: 'R4 — a lane covering a component skin sheet without claiming it is refused',
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
    suite.expectRefusal({
      label: 'R4 — the same refusal for the modern engine skin, which no family source owner contains',
      rule: 'R4-single-owner',
      result: checkPlan(dir, 'r4-engine-skin', {
        planId: 'drill-r4-engine-skin',
        lanes: [
          {
            id: 'ENGINE',
            writeRoot: 'packages/core/src/foundation/tokens/css/runtime/engines/modern/skin',
            writeSet: ['packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/alert.css'],
          },
        ],
      }),
    });

    // SHARED-CSS ROUTING. A family lane may not buy its way into shared CSS by
    // declaring it owns it. The bound is checked FIRST and separately: the
    // write set escapes the family's sourceOwner, so R1 refuses it before R4
    // ever reads `claimsSharedFiles`. The only lane that can hold shared CSS is
    // one raised explicitly for it, with its own declared root — and then only
    // one such lane per plan. That is the singleton integrator, computed.
    const SKIN_FILE = 'packages/core/src/foundation/tokens/css/presentation/components/skin/button-icon.css';
    suite.expectRefusal({
      label: 'ROUTING — a family lane claiming a shared skin sheet is refused on its BOUND, not merely on the claim',
      rule: 'R1-bound',
      showOutput: true,
      result: checkPlan(dir, 'family-claims-shared', {
        planId: 'drill-family-claims-shared',
        lanes: [
          {
            id: 'BUTTON',
            row: 'primitive/inputs/button',
            writeSet: ['packages/core/src/ui/primitives/inputs/Button/**', SKIN_FILE],
            claimsSharedFiles: [SKIN_FILE],
          },
        ],
      }),
    });
    suite.expectPass({
      label: 'ROUTING CONTROL — an explicit integrator lane, declared root and claim, may hold the same sheet',
      result: checkPlan(dir, 'integrator-holds-shared', {
        planId: 'drill-integrator',
        lanes: [
          { id: 'BUTTON', row: 'primitive/inputs/button' },
          {
            id: 'INTEGRATOR',
            writeRoot: 'packages/core/src/foundation/tokens/css/presentation/components/skin',
            writeSet: [SKIN_FILE],
            claimsSharedFiles: [SKIN_FILE],
          },
        ],
      }),
    });
    suite.expectRefusal({
      label: 'ROUTING — two integrator lanes on one sheet is refused (single ownership, always)',
      rule: 'R4-single-owner',
      result: checkPlan(dir, 'two-integrators', {
        planId: 'drill-two-integrators',
        lanes: [
          {
            id: 'I1',
            writeRoot: 'packages/core/src/foundation/tokens/css/presentation/components/skin',
            writeSet: [SKIN_FILE],
            claimsSharedFiles: [SKIN_FILE],
          },
          {
            id: 'I2',
            writeRoot: 'packages/core/src/foundation/tokens/css/presentation/components/skin',
            writeSet: [SKIN_FILE],
            claimsSharedFiles: [SKIN_FILE],
          },
        ],
      }),
    });

    // THE ONE THE PER-FILE RULE MISSED. Two integrators on two DIFFERENT sheets
    // intersect on no file, so R2, R3 and the per-file claimant rule all pass
    // them. They are still two writers in one cascade: `alert-compounds.css` and
    // `button-icon.css` are read in the same order, by the same selectors,
    // against the same tokens, and neither lane can review the other's half.
    // The domain, not the file, is what admits a single integrator.
    const OTHER_SKIN_FILE = 'packages/core/src/foundation/tokens/css/presentation/components/skin/alert-compounds.css';
    const disjointPlan = {
      planId: 'drill-two-integrators-disjoint',
      lanes: [
        {
          id: 'I1',
          writeRoot: 'packages/core/src/foundation/tokens/css/presentation/components/skin',
          writeSet: [SKIN_FILE],
          claimsSharedFiles: [SKIN_FILE],
        },
        {
          id: 'I2',
          writeRoot: 'packages/core/src/foundation/tokens/css/presentation/components/skin',
          writeSet: [OTHER_SKIN_FILE],
          claimsSharedFiles: [OTHER_SKIN_FILE],
        },
      ],
    };
    const disjointResult = checkPlan(dir, 'two-integrators-disjoint', disjointPlan);
    suite.expectFact({
      label: 'SETUP — the two sheets are different files, so no per-file rule can see this collision',
      ok: SKIN_FILE !== OTHER_SKIN_FILE && !disjointResult.output.includes('lanes claim single-owner file'),
      details: [
        `I1 claims ${SKIN_FILE}`,
        `I2 claims ${OTHER_SKIN_FILE}`,
        'the per-file claimant rule reports nothing here — only the per-domain singleton does',
      ],
    });
    suite.expectRefusal({
      label: 'ROUTING — two integrator lanes on DIFFERENT sheets of one shared domain is refused: a domain admits one integrator',
      rule: 'a shared domain admits one integrator',
      showOutput: true,
      result: disjointResult,
    });

    // SINGLE CANON. One document decides both what a family IS and what its
    // lane may WRITE. These drills are the set: the active catalog is
    // load-bearing, no caller can substitute one, and the sealed R0 receipt is
    // inert.
    //
    // Nothing here edits the working tree, and nothing here goes through a
    // flag. The fixture catalogs are copies in a temp directory, injected
    // through the module API — which is the only door left, because the
    // commands now refuse `--inventory` and `--synthetic` outright.
    const AVATAR_WRITE_SET = ['packages/core/src/ui/primitives/display/Avatar/**'];
    const movedInventory = JSON.parse(readFileSync(INVENTORY, 'utf8'));
    const avatarRow = movedInventory.rows.find((row) => row.id === 'primitive/display/avatar');
    const originalOwner = avatarRow.sourceOwner;
    // A directory that EXISTS. A bound pointed at a path that does not exist is
    // refused earlier, by a different rule, and would prove that rule instead of
    // this one.
    avatarRow.sourceOwner = 'packages/core/src/ui/primitives/display/Badge';
    const movedPath = join(dir, 'family-inventory.moved.json');
    writeFileSync(movedPath, JSON.stringify(movedInventory, null, 2));

    const vanishedInventory = JSON.parse(readFileSync(INVENTORY, 'utf8'));
    vanishedInventory.rows.find((row) => row.id === 'primitive/display/avatar').sourceOwner =
      'packages/core/src/ui/primitives/display/media/Avatar';
    const vanishedPath = join(dir, 'family-inventory.vanished.json');
    writeFileSync(vanishedPath, JSON.stringify(vanishedInventory, null, 2));

    suite.expectPass({
      label: 'SINGLE CANON control — the lane is inside its bound while the catalog says the family lives there',
      result: checkPlan(dir, 'canon-before', {
        planId: 'drill-canon-before',
        lanes: [{ id: 'AV', row: 'primitive/display/avatar', writeSet: AVATAR_WRITE_SET }],
      }),
    });
    suite.expectRefusal({
      label: 'SINGLE CANON — moving the family\'s sourceOwner in the catalog moves its lane bound, and the old write set now escapes',
      rule: 'R1-bound',
      showOutput: true,
      result: checkPlanWithCatalog(
        dir,
        'canon-after',
        {
          planId: 'drill-canon-after',
          lanes: [{ id: 'AV', row: 'primitive/display/avatar', writeSet: AVATAR_WRITE_SET }],
        },
        { inventoryPath: movedPath },
      ),
    });

    // THE CATALOG IS NOT AN ARGUMENT. The drill above is exactly the capability
    // that must not exist on a command line: the same fixture, handed to the
    // public command, rebound a family lane onto another family's subtree and
    // exited 0. Both flags are refused before anything is loaded, and refused
    // LOUDLY — silently ignoring one would leave every stale caller believing
    // it had checked something it had not.
    for (const flag of ['inventory', 'synthetic']) {
      const planPath = join(dir, `canon-flag-${flag}.json`);
      writeFileSync(
        planPath,
        JSON.stringify(
          { planId: `drill-canon-flag-${flag}`, lanes: [{ id: 'AV', row: 'primitive/display/avatar', writeSet: AVATAR_WRITE_SET }] },
          null,
          2,
        ),
      );
      suite.expectRefusal({
        label: `THE CATALOG IS NOT AN ARGUMENT — the public checker refuses --${flag}, so no caller can name the catalog it is judged against`,
        rule: 'the catalog is not an argument',
        exitCode: 2,
        result: run(process.execPath, [CHECKER, '--plan', planPath, `--${flag}`, movedPath], { cwd: ROOT }),
      });
    }
    suite.expectRefusal({
      label: 'THE CATALOG IS NOT AN ARGUMENT — containment refuses it too; one bypass on one command is the whole bypass',
      rule: 'the catalog is not an argument',
      exitCode: 2,
      result: run(
        process.execPath,
        [
          `${ROOT}/packages/core/src/tooling/lane-control/public/containment/index.mjs`,
          '--plan',
          EXAMPLE_PLAN,
          '--lane',
          'F1',
          '--inventory',
          movedPath,
        ],
        { cwd: ROOT },
      ),
    });
    suite.expectFact({
      label: 'SINGLE CANON — the mutation was real and the working tree was not touched',
      ok:
        originalOwner === 'packages/core/src/ui/primitives/display/Avatar' &&
        JSON.parse(readFileSync(INVENTORY, 'utf8')).rows.find((row) => row.id === 'primitive/display/avatar')
          .sourceOwner === originalOwner,
      details: [
        `catalog on disk still says: ${originalOwner}`,
        'the moved catalog exists only in the drill temp directory',
      ],
    });
    suite.expectRefusal({
      label: 'SINGLE CANON — a catalog whose sourceOwner is not a directory is refused: an empty bound passes every containment check vacuously',
      rule: 'not a directory in this tree',
      exitCode: 2,
      result: checkPlanWithCatalog(
        dir,
        'canon-vanished',
        { planId: 'drill-canon-vanished', lanes: [{ id: 'AV', row: 'primitive/display/avatar' }] },
        { inventoryPath: vanishedPath },
      ),
    });

    // The other half, and it has to be BEHAVIOURAL. Grepping the sources for
    // `family-ledger.json` and counting any mention as a reader made the two
    // paragraphs of prose explaining that the archive is inert turn the drill
    // red for saying so. What is actually claimed is that emptying the archive
    // changes NOTHING, so the drill empties one and compares the whole verdict:
    // exit code, every resolved bound, every finding, byte for byte.
    //
    // IT MAY NOT EMPTY THE REAL ONE. The predecessor overwrote the working
    // tree's archive in place and trusted `finally` to put it back. `finally`
    // does not run through a SIGKILL, a crashed child, or a throw inside the
    // restore itself, and the file it would leave destroyed is an uncommitted
    // 224 KB receipt — the exact file the drill exists to say nobody may
    // rewrite. So the mutation moves into a git repository of the drill's own,
    // seeded in the temp directory: the checker takes its root from `git
    // rev-parse` in its cwd, so a cwd inside the probe repo moves the catalog,
    // the universe and the archive it is asked about into the temp tree. The
    // working tree's copy is read, hashed, and never opened for writing — there
    // is no restore step here because there is nothing to restore.
    const realLedgerBefore = readFileSync(REAL_LEDGER);
    const realLedgerShaBefore = sha256(realLedgerBefore);
    const probe = seedHistoryProbeRepo(dir);
    const probeLedgerBefore = readFileSync(probe.ledgerPath);
    const probeLedgerShaBefore = sha256(probeLedgerBefore);
    const archivedRows = JSON.parse(realLedgerBefore.toString('utf8')).rows ?? [];
    suite.expectFact({
      label: 'HISTORY PROBE SETUP — the probe repo holds a byte-identical copy of the sealed receipt, and the receipt is not already empty',
      ok: probeLedgerBefore.equals(realLedgerBefore) && archivedRows.length > 0,
      details: [
        `copy is byte-identical: ${probeLedgerBefore.equals(realLedgerBefore)} (${realLedgerBefore.length} bytes)`,
        `sha256 ${probeLedgerShaBefore}`,
        `rows in the archive: ${archivedRows.length} — emptying it removes every one of them, which is a violent edit and not a cosmetic one`,
      ],
    });

    const historyBefore = run(process.execPath, [CHECKER, '--plan', probe.planPath], { cwd: probe.tempRoot });
    suite.expectPass({
      label: 'HISTORY PROBE CONTROL — the public checker runs against the probe repo and finds one clean, bounded Avatar lane',
      result: historyBefore,
    });
    suite.expectFact({
      label: 'HISTORY PROBE CONTROL — and the verdict is about the PROBE tree: the lane resolves the probe\'s row, the probe\'s root and the one file seeded there',
      ok:
        historyBefore.stdout.includes(`row=${AVATAR_ROW}`)
        && historyBefore.stdout.includes(`root=${probe.avatarOwner}`)
        && /files=\s*1\b/.test(historyBefore.stdout),
      details: [
        `row=${AVATAR_ROW} present: ${historyBefore.stdout.includes(`row=${AVATAR_ROW}`)}`,
        `root=${probe.avatarOwner} present: ${historyBefore.stdout.includes(`root=${probe.avatarOwner}`)}`,
        `files=1: ${/files=\s*1\b/.test(historyBefore.stdout)} — the only file seeded under that root is ${probe.coveredFile}`,
      ],
    });

    // The mutation, and only inside the probe repo.
    writeFixture(
      probe.tempRoot,
      HISTORY_LEDGER_PATH,
      JSON.stringify({ note: 'EMPTIED INSIDE THE DRILL PROBE REPO', rows: [], sharedSkinFiles: {} }, null, 2),
    );
    const probeLedgerAfter = readFileSync(probe.ledgerPath);
    const emptiedRows = JSON.parse(probeLedgerAfter.toString('utf8')).rows;
    suite.expectFact({
      label: 'HISTORY PROBE — the mutation is real: the probe\'s receipt lost every row and its hash moved',
      ok: sha256(probeLedgerAfter) !== probeLedgerShaBefore && emptiedRows.length === 0 && archivedRows.length > 0,
      details: [
        `rows ${archivedRows.length} → ${emptiedRows.length}`,
        `sha256 ${probeLedgerShaBefore.slice(0, 16)}… → ${sha256(probeLedgerAfter).slice(0, 16)}…`,
        'a reader deriving its bounds from this file would now resolve no row at all and the plan would not survive one lane',
      ],
    });

    const historyAfter = run(process.execPath, [CHECKER, '--plan', probe.planPath], { cwd: probe.tempRoot });
    suite.expectFact({
      label: 'HISTORY IS NOT AUTHORITY — emptying the sealed R0 receipt changes the verdict, the bounds and the output not at all',
      ok:
        historyBefore.status === 0
        && historyAfter.status === historyBefore.status
        && historyAfter.stdout === historyBefore.stdout
        && historyAfter.stderr === historyBefore.stderr,
      details: [
        `exit before=${historyBefore.status} after=${historyAfter.status}`,
        `stdout identical: ${historyAfter.stdout === historyBefore.stdout} (${historyBefore.stdout.length} bytes, and it prints each lane's resolved root)`,
        `stderr identical: ${historyAfter.stderr === historyBefore.stderr}`,
      ],
    });

    // AND THE PROBE IS NOT INERT. A tree the checker never read would produce
    // that identical verdict for the wrong reason — the drill would be proving
    // that a file nobody opens does not matter, in a directory nobody opens
    // either. Same repo, same plan, same cwd; the one edit is to the file the
    // checker DOES read, and the verdict flips. That is what makes the pair
    // above evidence about the ARCHIVE rather than about the probe.
    mkdirSync(join(probe.tempRoot, MOVED_OWNER), { recursive: true });
    const movedProbeInventory = JSON.parse(readFileSync(probe.inventoryPath, 'utf8'));
    movedProbeInventory.rows.find((row) => row.id === AVATAR_ROW).sourceOwner = MOVED_OWNER;
    writeFixture(probe.tempRoot, DEFAULT_INVENTORY_PATH, JSON.stringify(movedProbeInventory, null, 2));
    suite.expectRefusal({
      label: 'HISTORY PROBE — the same plan, the same repo, refused the moment the probe\'s INVENTORY moves the family: the checker reads THIS tree, which is why the archive result counts',
      rule: 'R1-bound',
      showOutput: true,
      result: run(process.execPath, [CHECKER, '--plan', probe.planPath], { cwd: probe.tempRoot }),
    });

    const realLedgerAfter = readFileSync(REAL_LEDGER);
    suite.expectFact({
      label: 'HISTORY IS NOT AUTHORITY — the working tree\'s archive was never opened for writing: identical bytes, identical hash, and no restore to trust',
      ok: realLedgerAfter.equals(realLedgerBefore) && sha256(realLedgerAfter) === realLedgerShaBefore,
      details: [
        HISTORY_LEDGER_PATH,
        `sha256 before ${realLedgerShaBefore}`,
        `sha256 after  ${sha256(realLedgerAfter)}`,
        `${realLedgerBefore.length} bytes, unchanged — the drill copies history and mutates the copy; it never rewrites history and never has to restore it`,
      ],
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
