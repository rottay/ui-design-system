/**
 * The drill for `contract-changeset`: both answers must be demonstrated.
 *
 * A gate that only proves its red is half a gate — the half that stops work.
 * A gate that only proves its green is the one this replaces, which could not
 * fail because a committed changeset satisfied it forever. So every class in
 * `DRILLS` declares its direction and is planted in a real git range, and the
 * roster assertion keeps a class from arriving without a plant.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BUMP_LEVELS,
  CONTRACT_DIFF_KINDS,
  CONTRACT_PREFIXES,
  DRILLS,
  LIBRARY_ROOT,
  auditRange,
  classifyPath,
  classifyPaths,
  isChangesetFile,
  parseChangeset,
  pendingContractDiff,
  parseContractDiffRow,
  readPendingChangesets,
  runDrill,
  unresolvedSurfaceInputs,
} from '../index.mjs';
import { moduleExports } from '../surface/index.mjs';

const changeset = (body) => parseChangeset('planted.md', body);

test('every path this gate can see lands in exactly one class', () => {
  assert.equal(classifyPath('packages/core/src/entrypoints/server/index.ts'), 'contract');
  assert.equal(classifyPath('packages/core/docs/consumer-contract/index.md'), 'contract');
  assert.equal(classifyPath('packages/core/docs/consumer-contract/protocol/index.md'), 'contract');
  assert.equal(classifyPath('packages/core/contracts/package/entrypoints/index.json'), 'contract');
  assert.equal(classifyPath('packages/core/src/components/primitives/button/index.tsx'), 'library');
  assert.equal(classifyPath('packages/core/package.json'), 'library');
  assert.equal(classifyPath('packages/core/docs/guides/getting-started/index.md'), 'exempt');
  assert.equal(classifyPath('packages/core/docs/architecture/index.md'), 'exempt');
  assert.equal(classifyPath('roadmap/registry.json'), 'outside');
  assert.equal(classifyPath('packages/showroom/src/app/page.tsx'), 'outside');
});

test('the contract documents are never read as ordinary documentation', () => {
  // `docs/consumer-contract/` sits under the exempt `docs/` prefix; contract
  // classification must win, or the contract itself would be exempt from the
  // rule it states.
  const contractDoc = 'packages/core/docs/consumer-contract/index.md';
  assert.ok(CONTRACT_PREFIXES.some((prefix) => contractDoc.startsWith(prefix)));
  assert.equal(classifyPath(contractDoc), 'contract');
  const buckets = classifyPaths([contractDoc, 'packages/core/docs/guides/index.md']);
  assert.deepEqual(buckets.contract, [contractDoc]);
  assert.deepEqual(buckets.exempt, ['packages/core/docs/guides/index.md']);
});

test('a guaranteed-surface change with no changeset in the range is a finding', () => {
  const findings = auditRange({ changed: ['packages/core/src/entrypoints/server/index.ts'] });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].leg, 'contract');
});

test('a changeset committed on the base branch does not cover the range that follows it', () => {
  // The defect of the replaced inline step, stated as an assertion: `declared`
  // carries only what the RANGE introduces, so a retained changeset is absent
  // from it and the finding stands.
  const findings = auditRange({ changed: ['packages/core/src/entrypoints/server/index.ts'], declared: [] });
  assert.equal(findings.length, 1);
  assert.match(findings[0].detail, /adds no changeset/);
});

test('a guaranteed-surface change needs a contract-diff block, not only a bump', () => {
  const declared = [changeset('---\n"@rottay/design-system": minor\n---\n\nA bump with no statement.\n')];
  const findings = auditRange({ changed: ['packages/core/src/entrypoints/server/index.ts'], declared });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].leg, 'contract-diff');
});

test('a declared guaranteed-surface change is clean', () => {
  const declared = [changeset([
    '---',
    '"@rottay/design-system": minor',
    '---',
    '',
    'Declared.',
    '',
    '```contract-diff',
    'signature ./server#mountTenantTheme — accepts the retained `artifact` input',
    '```',
    '',
  ].join('\n'))];
  assert.deepEqual(auditRange({ changed: ['packages/core/src/entrypoints/server/index.ts'], declared }), []);
  assert.deepEqual(declared[0].contractDiff, [{
    kind: 'signature',
    target: './server#mountTenantTheme',
    detail: 'accepts the retained `artifact` input',
    changeset: 'planted.md',
  }]);
});

test('a contract document owes a changeset but not an invented diff row', () => {
  const doc = 'packages/core/docs/consumer-contract/protocol/index.md';
  assert.equal(auditRange({ changed: [doc] }).length, 1);
  assert.equal(auditRange({ changed: [doc] })[0].leg, 'contract');
  const declared = [changeset('---\n"@rottay/design-system": patch\n---\n\nThe contract text moved.\n')];
  assert.deepEqual(auditRange({ changed: [doc], declared }), []);
  // The same changeset does NOT cover a published signature.
  assert.equal(
    auditRange({ changed: [doc, 'packages/core/src/entrypoints/server/index.ts'], declared })[0].leg,
    'contract-diff',
  );
});

test('a shipped change needs a changeset; a document outside the contract does not', () => {
  assert.equal(auditRange({ changed: ['packages/core/src/components/primitives/button/index.tsx'] }).length, 1);
  assert.deepEqual(auditRange({ changed: ['packages/core/docs/guides/getting-started/index.md'] }), []);
  assert.deepEqual(auditRange({ changed: ['roadmap/registry.json'] }), []);
});

test('a release range is covered by the changesets it consumes', () => {
  // `changeset version` deletes the declarations it folds into the changelog
  // and bumps the version. Demanding a NEW changeset there would make the
  // release itself unmergeable.
  assert.deepEqual(
    auditRange({
      changed: ['packages/core/package.json', 'packages/core/src/entrypoints/server/index.ts'],
      consumed: ['.changeset/retained.md'],
      versionBumped: true,
    }),
    [],
  );
  // A deletion without a version bump is not a release, and covers nothing.
  assert.equal(
    auditRange({
      changed: ['packages/core/src/entrypoints/server/index.ts'],
      consumed: ['.changeset/retained.md'],
      versionBumped: false,
    }).length,
    1,
  );
});

test('the changeset reader refuses every file it cannot certify', () => {
  assert.throws(() => changeset('no frontmatter here'), /no `---` frontmatter block/);
  assert.throws(() => changeset('---\n---\n\nbody\n'), /names no package/);
  assert.throws(() => changeset('---\n"@rottay/design-system": huge\n---\n\nbody\n'), /is not major\/minor\/patch/);
  assert.throws(() => changeset('---\nnot a mapping\n---\n\nbody\n'), /is not `"package": level`/);
  assert.throws(() => changeset('---\n"@rottay/design-system": minor\n---\n\n'), /summary is empty/);
  assert.throws(
    () => changeset('---\n"@rottay/design-system": minor\n---\n\nbody\n\n```contract-diff\n```\n'),
    /declares nothing/,
  );
  assert.throws(
    () => changeset('---\n"@rottay/design-system": minor\n---\n\nbody\n\n```contract-diff\nsubpath ./server\n'),
    /opened and never closed/,
  );
});

test('the contract-diff grammar is closed in every position', () => {
  assert.deepEqual(parseContractDiffRow('subpath ./commercial — removed').row, {
    kind: 'subpath',
    target: './commercial',
    detail: 'removed',
  });
  assert.match(parseContractDiffRow('subpath ./commercial - removed').error, /em dash/);
  assert.match(parseContractDiffRow('tokens ./commercial — removed').error, /unknown kind/);
  assert.match(parseContractDiffRow('subpath commercial — removed').error, /not a package subpath/);
  assert.match(parseContractDiffRow('signature ./server — moved').error, /<subpath>#<symbol>/);
  assert.match(parseContractDiffRow('export ./server# — moved').error, /<subpath>#<symbol>/);
  for (const kind of CONTRACT_DIFF_KINDS) {
    const target = kind === 'subpath' ? './server' : './server#name';
    assert.equal(parseContractDiffRow(`${kind} ${target} — detail`).row.kind, kind);
  }
});

test('only real changeset files count as declarations', () => {
  assert.equal(isChangesetFile('.changeset/planted.md'), true);
  assert.equal(isChangesetFile('.changeset/README.md'), false);
  assert.equal(isChangesetFile('.changeset/config.json'), false);
  assert.equal(isChangesetFile('packages/core/docs/planted.md'), false);
});

test('every changeset committed in this repository parses', () => {
  // The gate reads these files to build the STATUS contract diff. A pending
  // changeset that does not parse must be found here, not on a release day.
  const pending = readPendingChangesets();
  for (const entry of pending) {
    assert.ok(BUMP_LEVELS.includes(entry.level), `${entry.name}: ${entry.level}`);
    assert.ok(entry.summary.length > 0, entry.name);
  }
  assert.deepEqual([...pending].map((entry) => entry.name).sort(), pending.map((entry) => entry.name));
});

test('every declared drill class is planted and lands in its declared direction', { timeout: 300000 }, () => {
  assert.deepEqual(Object.keys(DRILLS).sort(), [
    'contract-doc-without-diff-block',
    'contract-with-changeset',
    'contract-without-changeset',
    'contract-without-diff-block',
    'docs-outside-contract',
    'foreign-package-declaration',
    'library-without-changeset',
    'malformed-changeset',
    'overload-implementation-changed',
    'public-overload-change-declared',
    'public-overload-changed',
    'published-export-resolvable',
    'published-export-unresolvable',
    'published-root-symbol-changed',
    'signature-defined-outside-entrypoints',
    'stale-changeset-only',
    'star-export-inside-source-tree',
    'star-export-outside-source-tree',
    'surface-body-only-change',
    'surface-change-declared',
  ]);
  for (const [drill, expected] of Object.entries(DRILLS)) {
    const result = runDrill(drill);
    assert.equal(result.landed, expected, `${drill} landed ${result.landed}, declared ${expected}`);
  }
});

test('the derived surface sees a signature that changes where it is DEFINED', { timeout: 300000 }, () => {
  // The reproduction the 2026-09-08 re-audit ran: a public type moves in the
  // module that declares it, far from any entrypoint directory, and arrives
  // with a version bump. The previous check called that `library` and asked for
  // nothing more.
  const result = runDrill('signature-defined-outside-entrypoints');
  assert.equal(result.landed, 'red');
  assert.equal(result.findings[0].leg, 'surface-coverage');
  assert.match(result.findings[0].detail, /MountTenantThemeOptions/);
});

test('the published root barrel is a signature surface, not library bytes', { timeout: 300000 }, () => {
  const result = runDrill('published-root-symbol-changed');
  assert.equal(result.landed, 'red');
  assert.match(result.findings.map((finding) => finding.detail).join(' '), /\.#root/);
});

test('a declaration that names another package is not coverage for this one', { timeout: 300000 }, () => {
  const result = runDrill('foreign-package-declaration');
  assert.equal(result.landed, 'red');
  const legs = result.findings.map((finding) => finding.leg);
  assert.ok(legs.includes('package-identity'), JSON.stringify(result.findings));
  assert.ok(legs.includes('contract'), JSON.stringify(result.findings));
});

test('CONTROL: an implementation change behind an unchanged signature is not a contract event', {
  timeout: 300000,
}, () => {
  // Without this the three drills above would pass for the wrong reason: the
  // derived leg could be demanding a row for every edit to a surface file.
  const result = runDrill('surface-body-only-change');
  assert.equal(result.landed, 'green');
});

test('CONTROL: the same signature change WITH its row is green', { timeout: 300000 }, () => {
  const result = runDrill('surface-change-declared');
  assert.equal(result.landed, 'green');
});

// ---------------------------------------------------------------------------
// The two defects the 2026-09-08 lot review reproduced against this check
// ---------------------------------------------------------------------------

test('the OVERLOADS are the published contract, not the implementation signature', () => {
  // The unit the drill below rests on: three declarations of one name, and the
  // shape a caller type-checks against is the two overloads.
  const table = moduleExports('mount.ts', [
    'export function resolveMount(input: string): string;',
    'export function resolveMount(input: number): number;',
    'export function resolveMount(input: string | number): string | number { return input; }',
    '',
  ].join('\n'));
  const { fingerprint } = table.local.get('resolveMount');
  assert.match(fingerprint, /\(input: string\): string;/);
  assert.match(fingerprint, /\(input: number\): number;/);
  assert.ok(
    !fingerprint.includes('string | number'),
    `the hidden implementation signature is not the contract: ${fingerprint}`,
  );
  // And the mutation the review ran changes it.
  const changed = moduleExports('mount.ts', [
    'export function resolveMount(input: string): string;',
    'export function resolveMount(input: number): string;',
    'export function resolveMount(input: string | number): string | number { return input; }',
    '',
  ].join('\n')).local.get('resolveMount').fingerprint;
  assert.notEqual(changed, fingerprint);
});

test('a changed public overload is a contract event', { timeout: 300000 }, () => {
  // The review's reproduction: the phone overload's return type moved, a real
  // consumer went from clean to TS2322, and this check answered exit 0 with
  // zero surface changes because the implementation overwrote the overloads.
  const result = runDrill('public-overload-changed');
  assert.equal(result.landed, 'red');
  assert.match(result.findings.map((finding) => finding.detail).join(' '), /resolveMount/);
});

test('CONTROL: the same overload change WITH its row is green', { timeout: 300000 }, () => {
  assert.equal(runDrill('public-overload-change-declared').landed, 'green');
});

test('CONTROL: widening the hidden implementation signature is not a contract event', {
  timeout: 300000,
}, () => {
  // Without this the drill above could be passing because ANY edit to an
  // overloaded function is red, which would be a different gate.
  assert.equal(runDrill('overload-implementation-changed').landed, 'green');
});

test('an unresolvable published subpath is a finding, never a quiet hole', { timeout: 300000 }, () => {
  // A subpath the derivation cannot resolve publishes symbols that are absent
  // from BOTH ends of the diff, so every one of them reads as unchanged.
  const result = runDrill('published-export-unresolvable');
  assert.equal(result.landed, 'red');
  assert.equal(result.findings[0].leg, 'surface-unresolved');
  assert.match(result.findings[0].detail, /\.\/audit-missing/);
});

test('a star export the resolver cannot follow is the same finding', { timeout: 300000 }, () => {
  // The second discarded class: `collectPublicSurface` reported it and
  // `auditRange` dropped it on the floor.
  const result = runDrill('star-export-outside-source-tree');
  assert.equal(result.landed, 'red');
  assert.equal(result.findings[0].leg, 'surface-unresolved');
  assert.match(result.findings[0].detail, /star export leaves the source tree/);
});

test('CONTROL: a subpath and a star that DO resolve are not accused', { timeout: 300000 }, () => {
  assert.equal(runDrill('published-export-resolvable').landed, 'green');
  assert.equal(runDrill('star-export-inside-source-tree').landed, 'green');
});

test('the unresolved leg reads every class by name and counts each defect once', () => {
  const rows = [
    { subpath: './audit-missing', target: './dist/audit-missing.js', reason: 'no source module for the published target' },
    { subpath: './audit-missing', target: './dist/audit-missing.js', reason: 'no source module for the published target' },
    { file: 'packages/core/src/entrypoints/server/index.ts', specifier: 'elsewhere', reason: 'star export leaves the source tree' },
    { subpath: './server', name: 'lost', reason: '`lost` is not exported by packages/core/src/x/index.ts' },
  ];
  // Base and head both carry the same broken subpath: one defect, not two.
  assert.deepEqual(unresolvedSurfaceInputs(rows).length, 3);
  const findings = auditRange({ changed: [], surfaceUnresolved: rows });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].leg, 'surface-unresolved');
  for (const fragment of ['./audit-missing', 'star export leaves the source tree', './server#lost']) {
    assert.match(findings[0].detail, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')));
  }
});

test('a range with no unresolved input carries no unresolved finding', () => {
  assert.deepEqual(auditRange({ changed: [], surfaceUnresolved: [] }), []);
});

test('the stale-changeset drill is red because of the range, not a missing file', {
  timeout: 300000,
}, () => {
  // If the plant had removed the retained changeset, the red would prove
  // nothing about ranges. The drill leaves it byte-exact and still goes red.
  const result = runDrill('stale-changeset-only');
  assert.equal(result.landed, 'red');
  assert.equal(result.threw, false);
  assert.equal(result.findings[0].leg, 'contract');
});

test('the malformed drill is red by refusal, not by a quiet miss', { timeout: 300000 }, () => {
  const result = runDrill('malformed-changeset');
  assert.equal(result.threw, true);
  assert.match(result.findings[0].detail, /contract-diff row/);
});

test('the producer emits the shape the status tool republishes', () => {
  const emitted = pendingContractDiff();
  assert.equal(emitted.package, '@rottay/design-system');
  assert.match(emitted.version, /^\d+\.\d+\.\d+$/);
  for (const entry of emitted.changesets) {
    assert.equal(typeof entry.name, 'string');
    assert.ok(BUMP_LEVELS.includes(entry.level), entry.name);
    assert.ok(Number.isInteger(entry.declares) && entry.declares >= 0, entry.name);
  }
  for (const row of emitted.rows) {
    for (const field of ['kind', 'target', 'detail', 'changeset', 'level']) {
      assert.equal(typeof row[field], 'string', `${field} of ${JSON.stringify(row)}`);
    }
  }
  // Deterministic: the same tree emits the same bytes, or STATUS would churn.
  assert.deepEqual(pendingContractDiff(), emitted);
});

test('the library root the gate governs is the published package', () => {
  assert.equal(LIBRARY_ROOT, 'packages/core/');
});
