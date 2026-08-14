#!/usr/bin/env node
/**
 * @fileoverview Drills for the converse ratchet.
 *
 * THE ONE THAT MATTERS IS `INTERPOLATED-REACH`. A naive implementation builds
 * its reach set by grepping the compilers for `--ds-*` strings. Every name
 * emitted through `` `--ds-${namespace}-bg` `` is then invisible to it and gets
 * reported as tenant-unreachable — a defect count inflated with names that are
 * perfectly reachable. That drill takes the gate's own audit output, keeps only
 * the names that are reachable ONLY by interpolation AND appear nowhere as
 * literal text in the reach corpus, and asserts none of them is flagged.
 *
 * NO DRILL HERE IMPORTS ITS TARGET. Everything runs in a child process against
 * the shipped source: the gate through its CLI, the reach model through a
 * one-line runner written into the temp directory. Exercising the command is
 * also the more honest test, since that is what a coordinator actually runs.
 *
 * The ratchet rules are drilled through `--evaluate-fixture` with synthetic
 * measurements rather than by mutating a committed artifact: injecting a
 * violation into an artifact means writing a file this lane does not own, in a
 * tree other agents are working in.
 */
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createDrillSuite, run, withTempDir } from '../../harness/index.mjs';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const LANE_CONTROL = `${ROOT}/packages/core/src/tooling/lane-control`;
const GATE = `${LANE_CONTROL}/public/tenant-reachability/index.mjs`;
const TENANT_REACH = `${LANE_CONTROL}/runtime/tenant-reach/index.mjs`;

const gate = (...args) => run(process.execPath, [GATE, ...args], { cwd: ROOT });

/**
 * The files `tenantReach` reads. Mirrored into a temp root so a drill can plant
 * an emitter in one of them without writing a byte into the tree other agents
 * are working in.
 */
const REACH_CORPUS = Object.freeze([
  'packages/core/src/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.ts',
  'packages/core/src/infrastructure/compilers/kernel/runtime/appearance/index.ts',
  'packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts',
  'packages/core/src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts',
  'packages/core/src/foundation/kernel/color/oklch/ramp/index.ts',
]);

/** Mirror the reach corpus into `dir/name`, optionally appending to one file. */
function mirrorCorpus(dir, name, { appendTo, text } = {}) {
  const mirror = join(dir, name);
  for (const path of REACH_CORPUS) {
    const destination = join(mirror, path);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(join(ROOT, path), destination);
    if (path === appendTo) {
      writeFileSync(destination, `${readFileSync(destination, 'utf8')}\n${text}\n`);
    }
  }
  return mirror;
}

/** Run the SHIPPED reach model over a mirrored root, in a child process. */
function reachOver(dir, mirror) {
  const runner = join(dir, `runner-${mirror.split('/').pop()}.mjs`);
  writeFileSync(
    runner,
    [
      `import { tenantReach } from ${JSON.stringify(pathToFileURL(TENANT_REACH).href)};`,
      `const model = tenantReach({ root: ${JSON.stringify(mirror)} });`,
      'console.log(JSON.stringify({ unattributed: model.unattributed, enumerators: model.enumerators.length }));',
    ].join('\n'),
  );
  const result = run(process.execPath, [runner], { cwd: ROOT });
  if (result.status !== 0) throw new Error(`reach runner failed: ${result.output}`);
  return JSON.parse(result.stdout);
}

export function runDrills() {
  const suite = createDrillSuite('tenant-reachability drills');

  return withTempDir('tenant-reachability', (dir) => {
    const fixture = (name, body) => {
      const path = join(dir, `${name}.json`);
      writeFileSync(path, JSON.stringify(body, null, 2));
      return gate('--evaluate-fixture', path);
    };
    const literal = (name, reads = 1) => ({ name, reads, literalIn: ['rottay'], formulaIn: [], sample: '#000000' });

    suite.expectPass({
      label: 'POSITIVE CONTROL — the gate passes against its own seeded baseline',
      result: gate(),
    });

    suite.expectRefusal({
      label: 'E1 — a NEW literal-declared unreachable name fails IMMEDIATELY, with a large seed already in place',
      rule: 'E1-new-unreachable-literal',
      showOutput: true,
      result: fixture('e1', {
        unreachable: [literal('--ds-brand-new-literal', 4)],
        baseline: { names: Array.from({ length: 548 }, (_, index) => `--ds-seeded-${index}`) },
        accepted: { names: {} },
      }),
    });

    suite.expectRefusal({
      label: 'E2 — the ratchet refuses growth (decrease-only)',
      rule: 'E2-ratchet-increased',
      result: fixture('e2', {
        unreachable: [literal('--ds-a'), literal('--ds-b')],
        baseline: { names: ['--ds-a'] },
        accepted: { names: {} },
      }),
    });

    suite.expectRefusal({
      label: 'E3 — an accepted constant with no written reason is refused; silence is not acceptance',
      rule: 'E3-acceptance-without-reason',
      result: fixture('e3', {
        unreachable: [literal('--ds-c')],
        baseline: { names: ['--ds-c'] },
        accepted: { names: { '--ds-c': 'because' } },
      }),
    });

    suite.expectPass({
      label: 'E3 CONTROL — a name with a real written reason is accepted and drops out of the live set',
      result: fixture('e3-control', {
        unreachable: [literal('--ds-c')],
        baseline: { names: ['--ds-c'] },
        accepted: {
          names: {
            '--ds-c': 'Structural constant: a physical hairline that no tenant may scale without breaking alignment across every density.',
          },
        },
      }),
    });

    suite.expectRefusal({
      label: 'E0 — an emitter nobody enumerated REFUSES the report rather than inflating the defect count',
      rule: 'E0-unattributed-emitter',
      showOutput: true,
      result: fixture('e0', {
        reachModel: { unattributed: [{ owner: 'setSomethingVars', template: '--ds-${thing}-bg' }] },
        unreachable: [],
        baseline: { names: [] },
        accepted: { names: {} },
      }),
    });

    // ── THE ONE A NAIVE IMPLEMENTATION GETS WRONG ─────────────────────────
    const audit = JSON.parse(gate('--audit-json').stdout);
    suite.expectFact({
      label: 'SETUP — names reachable ONLY by interpolation, appearing NOWHERE as literal text in the reach corpus',
      ok: audit.interpolationOnly.length > 0,
      details: [
        `${audit.interpolationOnly.length} such names — a grep-based reach set would report every one as unreachable`,
        `e.g. ${audit.interpolationOnly.slice(0, 4).join(', ')}`,
      ],
    });

    const flagged = new Set(audit.unreachable);
    const wronglyFlagged = audit.interpolationOnly.filter((name) => flagged.has(name));
    suite.expectFact({
      label: 'INTERPOLATED-REACH — the gate does NOT flag them: this is the case a naive implementation gets wrong',
      ok: wronglyFlagged.length === 0,
      details: [
        `${audit.interpolationOnly.length} interpolation-only names checked, ${wronglyFlagged.length} wrongly flagged`,
        `a grep-based implementation would have inflated the defect by up to ${audit.interpolationOnly.length} names`,
      ],
    });

    suite.expectFact({
      label: 'TOTALITY — the shipped enumeration leaves no unattributed emitter, so the reported number is admissible',
      ok: audit.unattributed === 0,
      details: [`unattributed emitters: ${audit.unattributed}`],
    });

    // ── TOTALITY, PLANTED ─────────────────────────────────────────────────
    //
    // The fact above is an OBSERVATION: zero unattributed. Zero is also what an
    // extractor that finds nothing at all reports, and the difference between
    // those two zeroes is the whole admissibility argument.
    //
    // It is not hypothetical. `functionBodies` took the first `{` after the
    // function NAME as the body, so a signature ending `context:
    // ChromeVariableContext = {}` handed it a two-character body and
    // `chromeToVariables` contributed none of its ten button-geometry names to
    // the reach model. The loud-failure design held that time — the gate did
    // refuse with E0 rather than quietly shrinking the reach set — but nothing
    // in the suite demonstrated that the extractor can read a body at all.
    //
    // So: plant a real emitter nobody could enumerate — the interpolated part
    // comes from a PARAMETER, so there is no vocabulary to resolve — behind a
    // signature carrying exactly that default-parameter object. The extractor
    // must walk past the signature to find it. If it ever stops doing so, this
    // drill reports zero and FAILS, which is the whole point.
    const PLANT = [
      'export function plantedTenantVars(',
      '  vars: Record<string, string>,',
      '  facets: readonly string[],',
      '  context: ChromeVariableContext = {}',
      '): void {',
      '  for (const facet of facets) {',
      '    vars[`--ds-planted-${facet}-tone`] = context.tone ?? "0";',
      '  }',
      '}',
    ].join('\n');

    const control = reachOver(dir, mirrorCorpus(dir, 'corpus-clean'));
    suite.expectFact({
      label: 'PLANT CONTROL — the mirrored corpus is faithful: the real sources still enumerate cleanly out of tree',
      ok: control.unattributed.length === 0 && control.enumerators > 0,
      details: [
        `${REACH_CORPUS.length} sources mirrored · ${control.enumerators} enumerators · ${control.unattributed.length} unattributed`,
      ],
    });

    const planted = reachOver(
      dir,
      mirrorCorpus(dir, 'corpus-planted', { appendTo: REACH_CORPUS[0], text: PLANT }),
    );
    const caught = planted.unattributed.filter((entry) => entry.owner === 'plantedTenantVars');
    suite.expectFact({
      label: 'PLANTED TOTALITY — an emitter hidden behind a default-parameter signature is FOUND and reported unattributed',
      ok: caught.length > 0,
      details: [
        `unattributed after the plant: ${planted.unattributed.length} · owned by plantedTenantVars: ${caught.length}`,
        caught.length > 0
          ? `witness: ${caught[0].owner} ${caught[0].template ?? ''}`.trim()
          : 'NO WITNESS — the extractor did not see past the signature, exactly the failure this drill exists to catch',
      ],
    });

    // The read floor only ever excludes, never invents.
    const floored = JSON.parse(gate('--audit-json', '--min-reads', '1000000').stdout);
    suite.expectFact({
      label: 'READ FLOOR — raising the floor only ever REMOVES names; an undercounted read can never invent a finding',
      ok: floored.unreachable.length <= audit.unreachable.length,
      details: [`floor=1 → ${audit.unreachable.length} names · floor=1000000 → ${floored.unreachable.length} names`],
    });

    suite.expectFact({
      label: 'INTERNAL CONSISTENCY — the union is never smaller than any single vertical',
      ok: Object.values(audit.perVertical).every((count) => count <= audit.unreachable.length),
      details: [
        `union ${audit.unreachable.length} · per vertical ${Object.entries(audit.perVertical).map(([vertical, count]) => `${vertical} ${count}`).join(' · ')}`,
        'the figure supplied with the specification fails this: union 606 with rottay 625',
      ],
    });

    return suite.summary();
  });
}

/**
 * Exact entrypoint identity. A suffix test matches ANY path ending that way,
 * and this drill's own path ends with `tenant-reachability/index.mjs` — which
 * is how importing the gate here once ran the gate's main() and exited before a
 * single drill executed.
 */
function isEntrypoint(moduleUrl) {
  return process.argv[1] !== undefined && moduleUrl === pathToFileURL(process.argv[1]).href;
}

if (isEntrypoint(import.meta.url)) {
  process.exit(runDrills() ? 0 : 1);
}
