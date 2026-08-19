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
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDrillSuite, inProcess, run, withTempDir } from '../../harness/index.mjs';
// The no-repository path is exercised through the module API, because the
// command no longer offers one: a public exit 0 reached without the catalog is
// a certificate for something nobody checked.
import { registeredAcceptanceGates, SCHEMA_PATH, validateWorkOrder } from '../../../../public/work-order/index.mjs';
// A fabricated nesting needs a fabricated catalog, and the catalog is not an
// argument: it is injected here, through the module API, exactly as the
// intersection drills do it.
import { loadContext } from '../../../../composition/plan/index.mjs';

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
        // A REGISTERED gate, so the build is the only thing wrong with it.
        wo.verificationCommands = [
          'pnpm -C packages/core build && node packages/core/scripts/engine-token-audit.mjs --check',
        ];
      }),
    });

    suite.expectRefusal({
      label: 'W4 — a work order naming no acceptance gate at all is refused: nothing can accept a lane that names no instrument',
      rule: 'W4-build-free',
      result: check('no-gate', (wo) => {
        wo.verificationCommands = ['git diff --stat'];
      }),
    });

    // W4 REGISTRY. The case above is refused by any implementation that looks
    // for something; this one is the rule's actual claim — the gate has to be
    // one CI ENFORCES. A check that accepted any plausible `*-gate.mjs` path
    // passes the drill above and fails here, which is the difference between
    // reading the manifest and pattern-matching a filename.
    const UNREGISTERED_GATE = 'packages/core/scripts/cra-14-public-barrel-gate.mjs';
    const registeredTokens = [...registeredAcceptanceGates().keys()];
    suite.expectFact({
      label: 'W4 SETUP — the script the next drill declares EXISTS and is not a blocking gate, so its refusal is about the register and not about a typo',
      ok:
        existsSync(`${ROOT}/${UNREGISTERED_GATE}`) &&
        !registeredTokens.some((token) => UNREGISTERED_GATE.includes(token)),
      details: [
        `${UNREGISTERED_GATE} is on disk and reachable by hand (\`pnpm cra14:check\`)`,
        `${String(registeredTokens.length)} invocation(s) are registered as blocking in ci-gates.manifest.mjs; this is not one of them`,
      ],
    });
    suite.expectRefusal({
      label: 'W4 — a verification running a REAL script CI does not enforce is refused: an acceptance gate nobody runs accepts nothing',
      rule: 'W4-build-free',
      showOutput: true,
      result: check('unregistered-gate', (wo) => {
        wo.verificationCommands = [`node ${UNREGISTERED_GATE} --check`];
      }),
    });

    suite.expectRefusal({
      label: 'W5 — `git commit -- .` as a pathspec is refused (in a shared tree it commits another agent\'s work)',
      rule: 'W5-commit-pathspec',
      result: check('dot-pathspec', (wo) => {
        wo.commitPathspecs = ['.'];
      }),
    });

    // W5 TRAVERSAL. The containment test under this rule is a prefix relation
    // over strings, and `Avatar/../../inputs/Button` satisfies it: the pathspec
    // reads as inside the Avatar lane and git commits Button. The drill uses
    // the real sibling directory, so a refusal cannot be an accident of a
    // nonexistent path.
    const TRAVERSAL_PATHSPEC = 'packages/core/src/ui/primitives/display/Avatar/../../inputs/Button';
    suite.expectRefusal({
      label: 'W5 — a pathspec that climbs out with `..` is refused: it is checked as one path and committed as another',
      rule: 'W5-commit-pathspec',
      showOutput: true,
      result: check('traversal-pathspec', (wo) => {
        wo.commitPathspecs = [TRAVERSAL_PATHSPEC];
      }),
    });
    suite.expectFact({
      label: 'W5 SETUP — the traversal really does resolve into another family, so the refusal is load-bearing',
      ok:
        execFileSync('node', ['-e', `process.stdout.write(require('node:path').posix.normalize(${JSON.stringify(TRAVERSAL_PATHSPEC)}))`], {
          encoding: 'utf8',
        }) === 'packages/core/src/ui/primitives/inputs/Button',
      details: [
        `${TRAVERSAL_PATHSPEC}`,
        '  resolves to packages/core/src/ui/primitives/inputs/Button — a different family, owned by a different lane',
      ],
    });
    for (const [name, pathspec, why] of [
      ['absolute-pathspec', '/etc/passwd', 'an absolute path ignores the repo root entirely'],
      ['dash-pathspec', '--all', 'git reads a leading dash as an option, not a path'],
      ['magic-pathspec', ':(glob)packages/core/src/**', "git's pathspec magic re-selects files no check ever resolved"],
    ]) {
      suite.expectRefusal({
        label: `W5 — ${why}`,
        rule: 'W5-commit-pathspec',
        result: check(name, (wo) => {
          wo.commitPathspecs = [pathspec];
        }),
      });
    }
    suite.expectRefusal({
      label: 'W7 — the same escape one field over: a writeSet pattern with `..` is refused at compile time, not compared around',
      rule: 'W7-bound',
      showOutput: true,
      result: check('traversal-writeset', (wo) => {
        wo.writeSet = ['packages/core/src/ui/primitives/display/Avatar/../../inputs/Button/**'];
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

    // W5 TERRITORY. The two shapes that made the string test a false green, both
    // reproduced as exit 0 before this pair landed. They are separate drills
    // because they fail for different reasons: the first is a grant narrower
    // than the directory it is committed by, the second an exclusion the
    // DOCUMENT never mentions because the catalog derives it.
    const FILTERED_GRANT = check('filtered-grant-pathspec', (wo) => {
      wo.writeSet = ['packages/core/src/ui/primitives/display/Avatar/**/*.test.tsx'];
      // commitPathspecs is left as the shipped example's: the Avatar directory.
    });
    suite.expectRefusal({
      label: 'W5 — a FILTERED grant committed by naming its directory is refused: `git commit -- <dir>` does not honour a filter',
      rule: 'W5-commit-pathspec',
      showOutput: true,
      result: FILTERED_GRANT,
    });
    // The witnesses are the proof that the finding came from the tree rather than
    // from a string comparison — and every one of them must be a file the filter
    // did NOT grant. A `.test.tsx` in this list would mean the check counted
    // granted files as violations and reached the right verdict for the wrong
    // reason.
    const filteredWitnesses = FILTERED_GRANT.output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('· packages/'))
      .map((line) => line.slice(2));
    suite.expectFact({
      label: 'W5 — that refusal is decided by the TERRITORY, not the string: it names the files the commit would carry, none of them granted',
      ok:
        FILTERED_GRANT.output.includes("of which 10 are outside this lane's write set") &&
        filteredWitnesses.length > 0 &&
        filteredWitnesses.every((file) => file.startsWith('packages/core/src/ui/primitives/display/Avatar/')) &&
        filteredWitnesses.every((file) => !file.endsWith('.test.tsx')),
      details: [
        `writeSet granted 6 test files; the directory pathspec stages all 16 — ${filteredWitnesses.length} witness(es) shown`,
        'the static anchor of `Avatar/**/*.test.tsx` IS the Avatar directory, which is why the prefix test held',
        ...filteredWitnesses.slice(0, 2),
      ],
    });
    suite.expectPass({
      label: 'W5 CONTROL — the same narrow lane passes once its pathspecs name what it was actually granted',
      result: check('filtered-grant-control', (wo) => {
        wo.writeSet = ['packages/core/src/ui/primitives/display/Avatar/**/*.test.tsx'];
        wo.commitPathspecs = [
          'packages/core/src/ui/primitives/display/Avatar/tests/Avatar.test.tsx',
          'packages/core/src/ui/primitives/display/Avatar/tests/Avatar.compounds.test.tsx',
        ];
      }),
    });

    // The nesting is FABRICATED in the temp directory rather than borrowed from
    // two product families that happen to nest today. A drill anchored on real
    // rows is disarmed the moment either family moves — which is precisely how
    // the predecessor version of this pair went stale — and it also cannot say
    // whether the refusal came from the catalog or from the document. Here the
    // inner owner exists only in the fixture inventory, so the ONLY source of
    // the exclusion is `deriveFamilyRows`.
    const DERIVED_OUTER = 'packages/core/src/tooling/lane-control/integration';
    const DERIVED_INNER = 'packages/core/src/tooling/lane-control/integration/tests/harness';
    const fixtureInventory = join(dir, 'inventory.derived-nesting.json');
    writeFileSync(
      fixtureInventory,
      JSON.stringify(
        {
          schemaVersion: 1,
          rows: [
            { id: 'drill:outer', layer: 'structure', family: 'DrillOuter', sourceOwner: DERIVED_OUTER },
            { id: 'drill:inner', layer: 'structure', family: 'DrillInner', sourceOwner: DERIVED_INNER },
          ],
        },
        null,
        2,
      ),
    );
    const derivedContext = loadContext({
      root: ROOT,
      testCatalog: { inventoryPath: fixtureInventory, syntheticPath: null },
    });
    suite.expectFact({
      label: 'W5 SETUP — the outer row declares no exclusions of its own; the catalog DERIVES the nested one',
      ok:
        derivedContext.rowIndex.get('drill:outer').writeExcludes.length === 1 &&
        derivedContext.rowIndex.get('drill:outer').writeExcludes[0] === DERIVED_INNER,
      details: [
        `drill:outer writeExcludes = ${JSON.stringify(derivedContext.rowIndex.get('drill:outer').writeExcludes)}`,
        'nothing in the fixture inventory writes that array — it is computed from drill:inner\'s sourceOwner',
      ],
    });
    const derivedWorkOrder = JSON.parse(JSON.stringify(base));
    // The whole outer subtree, granted and committed by name. The work order
    // declares no excludes at all — which is exactly the point, since the
    // earlier check read only the declared ones.
    derivedWorkOrder.row = 'drill:outer';
    derivedWorkOrder.editClass = 'headers-only';
    derivedWorkOrder.substitutionTable = [];
    derivedWorkOrder.writeSet = [`${DERIVED_OUTER}/**`];
    derivedWorkOrder.writeExcludes = [];
    derivedWorkOrder.commitPathspecs = [DERIVED_OUTER];
    const DERIVED_EXCLUDE = inProcess(
      () =>
        validateWorkOrder(derivedWorkOrder, {
          root: ROOT,
          schema: JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')),
          context: derivedContext,
        }).findings,
    );
    suite.expectRefusal({
      label: 'W5 — a pathspec swallowing a DERIVED exclusion is refused: the nested family the catalog carves out is still committed',
      rule: 'W5-commit-pathspec',
      showOutput: true,
      result: DERIVED_EXCLUDE,
    });
    suite.expectFact({
      label: 'W5 — and the finding says the exclusion is derived, which a document-only check could never know',
      ok:
        DERIVED_EXCLUDE.output.includes(DERIVED_INNER) &&
        DERIVED_EXCLUDE.output.includes('is derived from row'),
      details: ['the work order declares writeExcludes: [] — every exclusion here comes from the catalog'],
    });
    suite.expectPass({
      label: 'W5 CONTROL — the same lane over the same fixture passes once the pathspec stops at a file the derived exclusion cannot reach',
      result: inProcess(() => {
        const clean = JSON.parse(JSON.stringify(derivedWorkOrder));
        clean.commitPathspecs = [`${DERIVED_OUTER}/runtime/drills/intersection/index.mjs`];
        return validateWorkOrder(clean, {
          root: ROOT,
          schema: JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')),
          context: derivedContext,
        }).findings;
      }),
    });

    // THE EXCLUSION ANCHORED ABOVE. `tooling:generator` and `tooling:gates` share
    // the root `packages/core/scripts`, so the generator row is carved by the
    // gate-shaped filters — and those exclusions are anchored at `scripts`, not
    // inside `scripts/codemods`. A prefix reading of "does an exclusion fall
    // inside this pathspec" answers no, and the directory commits clean. No
    // `codemods/*-gate.mjs` exists today; the boundary is still real.
    const ANCHORED_ABOVE = check('exclusion-anchored-above-pathspec', (wo) => {
      wo.row = 'tooling:generator';
      wo.laneRole = 'domain';
      wo.editClass = 'headers-only';
      wo.substitutionTable = [];
      wo.writeSet = ['packages/core/scripts/codemods/**'];
      wo.writeExcludes = [];
      wo.commitPathspecs = ['packages/core/scripts/codemods'];
    });
    suite.expectRefusal({
      label: 'W5 — an exclusion ANCHORED ABOVE the pathspec still reaches inside it: territory intersection, not prefix containment',
      rule: 'W5-commit-pathspec',
      showOutput: true,
      result: ANCHORED_ABOVE,
    });
    suite.expectFact({
      label: 'W5 — and it is refused on a witness that does not exist yet, which is what makes this a boundary rather than an `ls`',
      ok:
        ANCHORED_ABOVE.output.includes('packages/core/scripts/**/*-gate.mjs') &&
        ANCHORED_ABOVE.output.includes('anchored above this pathspec') &&
        /packages\/core\/scripts\/codemods\/\S*gate\.mjs would be staged/.test(ANCHORED_ABOVE.output) &&
        readdirSync(`${ROOT}/packages/core/scripts/codemods`).every((entry) => !entry.endsWith('-gate.mjs')),
      details: [
        'the excluded region is anchored at packages/core/scripts — NOT under the committed directory, which is why the prefix test called it disjoint',
        'no gate-shaped file lives in codemods today; the witness is synthesised from the filter, so the refusal survives the tree changing under it',
      ],
    });
    suite.expectPass({
      label: 'W5 CONTROL — the same lane and the same exclusions pass when the pathspec names a file the filter cannot reach',
      result: check('exclusion-anchored-above-control', (wo) => {
        wo.row = 'tooling:generator';
        wo.laneRole = 'domain';
        wo.editClass = 'headers-only';
        wo.substitutionTable = [];
        wo.writeSet = ['packages/core/scripts/codemods/**'];
        wo.writeExcludes = [];
        wo.commitPathspecs = ['packages/core/scripts/codemods/sizetype-to-size.mjs'];
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

    // W8 — the lane role. A plan may infer it; a work order may not, because the
    // agent that receives this document is not present for the inference.
    suite.expectRefusal({
      label: 'W8 — a work order with no laneRole is refused: in the delegable unit no role is silent',
      rule: 'S-shape',
      result: check('no-role', (wo) => delete wo.laneRole),
    });
    suite.expectRefusal({
      label: 'W8 — a family lane declaring its own writeRoot is refused: that is how the catalog gets bypassed',
      rule: 'W8-lane-role',
      showOutput: true,
      result: check('family-declares-root', (wo) => {
        // The exact bypass: a root pointed at a family subtree inherits none of
        // the exclusions derived for that family, so every family nested inside
        // it is silently owned.
        wo.writeRoot = 'packages/core/src/ui/structures/workspace/connected-command-palette';
      }),
    });
    suite.expectRefusal({
      label: 'W8 — a lane declaring the family role over a SYNTHETIC row is refused (and vice versa)',
      rule: 'W8-lane-role',
      result: check('role-row-mismatch', (wo) => {
        wo.row = 'layer:base';
        wo.writeSet = ['packages/core/src/foundation/tokens/css/foundation/base/**'];
        wo.commitPathspecs = ['packages/core/src/foundation/tokens/css/foundation/base'];
      }),
    });
    suite.expectRefusal({
      label: 'W8 — an integrator lane that names a row is refused: it exists to hold what no row owns',
      rule: 'W8-lane-role',
      result: check('integrator-names-row', (wo) => {
        wo.laneRole = 'integrator';
      }),
    });
    suite.expectRefusal({
      label: 'W8 — an integrator lane rooted OUTSIDE every declared shared region is refused',
      rule: 'W8-lane-role',
      showOutput: true,
      result: check('integrator-outside-domains', (wo) => {
        delete wo.row;
        wo.laneRole = 'integrator';
        wo.writeRoot = 'packages/core/src/ui/primitives/display/Avatar';
        wo.claimsSharedFiles = ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'];
      }),
    });
    suite.expectRefusal({
      label: 'W8 — a CLAIMLESS integrator is refused: holding a shared region is the only reason that role may declare a root',
      rule: 'W8-lane-role',
      result: check('claimless-integrator', (wo) => {
        delete wo.row;
        wo.laneRole = 'integrator';
        wo.writeRoot = 'packages/core/src/foundation/tokens/css/foundation/themes';
        wo.writeSet = ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'];
        wo.commitPathspecs = ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'];
      }),
    });
    suite.expectPass({
      label: 'W8 CONTROL — the same integrator passes once it claims the sheet it is rooted on',
      result: check('integrator-control', (wo) => {
        delete wo.row;
        wo.laneRole = 'integrator';
        wo.writeRoot = 'packages/core/src/foundation/tokens/css/foundation/themes';
        wo.writeSet = ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'];
        wo.claimsSharedFiles = ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'];
        wo.commitPathspecs = ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'];
      }),
    });

    // W9 — shared-region claims, the half one work order can decide.
    suite.expectRefusal({
      label: 'W9 — a claim on a file that is in no shared region is refused: it hides what the lane is really writing',
      rule: 'W9-shared-claim',
      result: check('meaningless-claim', (wo) => {
        wo.claimsSharedFiles = ['packages/core/src/ui/primitives/display/Avatar/index.tsx'];
      }),
    });
    suite.expectRefusal({
      label: 'W9 — a claim the lane\'s own writeSet does not cover is refused',
      rule: 'W9-shared-claim',
      showOutput: true,
      result: check('uncovered-claim', (wo) => {
        wo.claimsSharedFiles = ['packages/core/src/foundation/tokens/css/foundation/themes/default.css'];
      }),
    });
    suite.expectRefusal({
      label: 'W9 — a lane covering a shared sheet WITHOUT claiming it is refused for silence',
      rule: 'W9-shared-claim',
      result: check('silent-coverage', (wo) => {
        delete wo.row;
        wo.laneRole = 'integrator';
        wo.writeRoot = 'packages/core/src/foundation/tokens/css/foundation/base';
        wo.writeSet = ['packages/core/src/foundation/tokens/css/foundation/base/**'];
        wo.claimsSharedFiles = ['packages/core/src/foundation/tokens/css/foundation/base/spacing.css'];
        wo.commitPathspecs = ['packages/core/src/foundation/tokens/css/foundation/base'];
      }),
    });

    // THERE IS NO GREEN WITHOUT THE CATALOG. `--skip-repo-checks` was for
    // validating a work order before its tree was checked out, and it certified
    // documents nothing had been checked against: a lane naming a row that does
    // not exist, with a write set outside every bound, exited 0 and looked
    // exactly like a validated lane. The flag is refused, and the same fixture
    // proves the two halves that must both hold — the command will not issue
    // that verdict, and the in-process skip that remains for callers holding no
    // repository does not call itself certified.
    const unboundedPath = join(dir, 'unbounded-skip-repo.json');
    const unbounded = JSON.parse(JSON.stringify(base));
    unbounded.row = 'primitive/display/no-such-family-anywhere';
    unbounded.writeSet = ['packages/core/src/ui/primitives/inputs/Button/**'];
    writeFileSync(unboundedPath, JSON.stringify(unbounded, null, 2));
    suite.expectRefusal({
      label: 'NO GREEN WITHOUT THE CATALOG — the command refuses --skip-repo-checks; a verdict reached without the catalog is not a verdict about a lane',
      rule: 'skip-repo-checks is refused',
      exitCode: 2,
      showOutput: true,
      result: run(process.execPath, [CHECKER, '--work-order', unboundedPath, '--skip-repo-checks'], { cwd: ROOT }),
    });
    suite.expectRefusal({
      label: 'NO GREEN WITHOUT THE CATALOG — run properly, that same work order is refused: the row does not exist and the write set is outside every bound',
      rule: 'W7-bound',
      showOutput: true,
      result: run(process.execPath, [CHECKER, '--work-order', unboundedPath], { cwd: ROOT }),
    });
    const skipped = validateWorkOrder(JSON.parse(readFileSync(unboundedPath, 'utf8')), {
      schema: JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')),
      skipRepoChecks: true,
    });
    suite.expectFact({
      label: 'NO GREEN WITHOUT THE CATALOG — the in-process skip says NOT CERTIFIED and reports no certification, whatever the finding count',
      ok: skipped.certified === false && skipped.summary.startsWith('NOT CERTIFIED'),
      details: [
        `certified=${skipped.certified}`,
        `summary: ${skipped.summary}`,
        `${skipped.findings.length} finding(s) — the point is not the count but that this result never claims to be a certificate`,
      ],
    });
    // The role rules are still computed WITHOUT the catalog, which is why
    // removing the flag costs nothing: an unbounded lane is refused on the
    // document alone.
    const rolelessDoc = JSON.parse(JSON.stringify(base));
    delete rolelessDoc.row;
    const roleless = validateWorkOrder(rolelessDoc, {
      schema: JSON.parse(readFileSync(SCHEMA_PATH, 'utf8')),
      skipRepoChecks: true,
    });
    suite.expectFact({
      label: 'W8 — role legality is a property of the document: a family lane with no row is refused with no repository at all',
      ok: roleless.findings.some((finding) => finding.rule === 'W8-lane-role'),
      details: roleless.findings.filter((finding) => finding.rule === 'W8-lane-role').map((finding) => finding.message),
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
