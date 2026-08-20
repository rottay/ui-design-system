/**
 * Registered executable evidence for the surface-profile-overrides claim
 * (gat-07-exact-proof.public-claim-floor.json).
 *
 * The ACTUAL censuses come from `analyzeClaimSourceRecords` -- the same
 * checker-backed analyzer the GAT-07 gate uses -- never from the claim floor
 * and never from a regex. The floor is then compared against that measurement.
 * A floor that disagrees with the tree in either direction fails here.
 *
 * The claim is NOT a parity claim: 32 governed field declarations exist and 31
 * of them are APPLIED -- the governed field actually reaches the hook through
 * its own arguments. `SidebarSurfaceVisualConfig` declares `profileOverrides`
 * and never reads it, and its wire-or-remove decision is still OPEN.
 *
 * Calling the hook is a weaker fact than applying it, so the two are measured
 * separately: `staticallyResolvedSurfaceHookCalls` counts calls,
 * `staticallyResolvedSurfaceProfileApplications` counts applications, and the
 * public claim is governed by APPLICATIONS.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyzeClaimSourceRecords } from '../../lib/evidence/gat-07-static-analysis/index.mjs';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const FLOOR = JSON.parse(readFileSync(join(CORE_ROOT, 'scripts/evidence/gat-07-exact-proof/gat-07-exact-proof.public-claim-floor.json'), 'utf8'));
const CLAIM = FLOOR.claims.find((claim) => claim.id === 'surface-profile-overrides');

const SOURCE_EXCLUDE_RE = /(?:^|\/)(?:tests?|__tests__|stories)(?:\/|$)|\.(?:test|spec|stories)\./;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.tsx?$/.test(path) && !/\.d\.ts$/.test(path)) out.push(path);
  }
  return out;
}

/** Measure the live tree. This is the single source of truth for "actual". */
function measure() {
  const records = walk(join(CORE_ROOT, 'src'))
    .map((path) => path.slice(CORE_ROOT.length + 1).split('\\').join('/'))
    .filter((path) => !SOURCE_EXCLUDE_RE.test(path))
    .map((path) => ({ path, kind: 'core', text: readFileSync(join(CORE_ROOT, path), 'utf8') }));
  return analyzeClaimSourceRecords(records)['surface-profile-overrides'];
}

const facts = measure();

const HEADER_CONSUMER = 'src/ui/structures/headers/header-surface/index.tsx';
const SIDEBAR_OWNER = 'src/ui/structures/shell/navigation/sidebar-surface/index.tsx';
const STRUCTURE_CONTRACT = 'src/ui/structures/foundation/chrome/contracts/index.ts';
const SURFACES_CONTRACT = 'src/ui/surfaces/foundation/contracts/index.ts';

test('the measured tree carries the declared-32-applied-31 census', () => {
  assert.equal(facts.profileOverrideDeclarations, 32);
  // Calls and applications are separate metrics. They agree today, and the
  // suite asserts both so a future divergence cannot hide behind one number.
  assert.equal(facts.staticallyResolvedSurfaceHookCalls, 31);
  assert.equal(facts.staticallyResolvedSurfaceProfileApplications, 31);
  assert.equal(facts.staticallyResolvedPotentialConsumers, 31);
  assert.equal(facts.unsupportedGovernedReferences, 0);
  // All three sets are emitted, sorted, and of the declared size.
  assert.equal(facts.staticallyResolvedSurfaceHookCallFiles.length, facts.staticallyResolvedSurfaceHookCalls);
  assert.equal(
    facts.staticallyResolvedSurfaceProfileApplicationFiles.length,
    facts.staticallyResolvedSurfaceProfileApplications,
  );
  assert.equal(
    facts.staticallyResolvedPotentialConsumerFiles.length,
    facts.staticallyResolvedPotentialConsumers,
  );
  for (const roster of [
    facts.staticallyResolvedSurfaceHookCallFiles,
    facts.staticallyResolvedSurfaceProfileApplicationFiles,
    facts.staticallyResolvedPotentialConsumerFiles,
  ]) {
    assert.deepEqual(roster, [...roster].sort());
  }
});

test('the claim floor mirrors the measured census rather than sourcing it', () => {
  assert.equal(CLAIM.runtimeStatus, 'declared-32-applied-31');
  assert.equal(CLAIM.requiredAssertions.profileOverrideDeclarations, facts.profileOverrideDeclarations);
  assert.equal(CLAIM.requiredAssertions.staticallyResolvedSurfaceHookCalls, facts.staticallyResolvedSurfaceHookCalls);
  assert.equal(
    CLAIM.requiredAssertions.staticallyResolvedSurfaceProfileApplications,
    facts.staticallyResolvedSurfaceProfileApplications,
  );
  assert.equal(
    CLAIM.requiredAssertions.staticallyResolvedPotentialConsumers,
    facts.staticallyResolvedPotentialConsumers,
  );
  assert.equal(CLAIM.executableAssertions.length, CLAIM.requiredAssertions.registeredExecutableEvidence);
  // Declared exceeds APPLIED by exactly the registered declared-not-applied gap.
  assert.equal(
    CLAIM.requiredAssertions.profileOverrideDeclarations
      - CLAIM.requiredAssertions.staticallyResolvedSurfaceProfileApplications,
    CLAIM.authority.declaredNotApplied.length,
  );
});

test('the registered consumer roster equals the measured applied set exactly', () => {
  // deepEqual in both directions at once: a phantom roster entry, a missing
  // one, or a consumer that moved while the count stayed 31 all fail here.
  // The roster is governed by APPLICATIONS, not by bare hook calls.
  assert.deepEqual([...CLAIM.productionConsumers].sort(), facts.staticallyResolvedSurfaceProfileApplicationFiles);
  assert.equal(
    CLAIM.productionConsumers.length,
    CLAIM.requiredAssertions.staticallyResolvedSurfaceProfileApplications,
  );
  // Every application is also a call; the reverse is what the metric separation exists to detect.
  const calls = new Set(facts.staticallyResolvedSurfaceHookCallFiles);
  for (const path of facts.staticallyResolvedSurfaceProfileApplicationFiles) {
    assert.ok(calls.has(path), `${path} applies the field without calling the hook`);
  }
  // The structure-tier header consumer is in; the declared-not-applied sidebar owner is out.
  assert.ok(facts.staticallyResolvedSurfaceProfileApplicationFiles.includes(HEADER_CONSUMER));
  assert.ok(!facts.staticallyResolvedSurfaceProfileApplicationFiles.includes(SIDEBAR_OWNER));
});

test('every registered consumer and definition file exists on disk', () => {
  for (const path of [...CLAIM.productionConsumers, ...CLAIM.definitionFiles, ...CLAIM.executableAssertions]) {
    assert.ok(existsSync(join(CORE_ROOT, path)), `claim floor references a missing path: ${path}`);
  }
  assert.ok(existsSync(join(CORE_ROOT, SIDEBAR_OWNER)), 'the declared-not-applied sidebar owner must exist');
});

test('declaration identity pins the owner distribution, not just the count', () => {
  const records = facts.profileOverrideDeclarationRecords;
  assert.equal(records.length, facts.profileOverrideDeclarations);
  assert.deepEqual(
    records,
    [...records].sort((left, right) =>
      left.path.localeCompare(right.path) || left.enclosingType.localeCompare(right.enclosingType)),
  );
  const owned = (path) => records.filter((record) => record.path === path).length;
  // Exact owner distribution: 2 in the structure contract, 30 in the surfaces contract.
  assert.equal(owned(STRUCTURE_CONTRACT), 2);
  assert.equal(owned(SURFACES_CONTRACT), 30);
  assert.equal(owned(STRUCTURE_CONTRACT) + owned(SURFACES_CONTRACT), records.length);
  const hosted = (type, path) =>
    records.filter((record) => record.enclosingType === type && record.path === path).length;
  assert.equal(hosted('SidebarSurfaceVisualConfig', STRUCTURE_CONTRACT), 1);
  assert.equal(hosted('HeaderSurfaceVisualConfig', STRUCTURE_CONTRACT), 1);
  // A type that must never host the governed field.
  assert.ok(!records.some((record) => record.enclosingType === 'HeaderSurfacePresentationConfig'));
  // The floor's authority block mirrors that measurement.
  assert.deepEqual(CLAIM.authority.declarationOwners, {
    [STRUCTURE_CONTRACT]: owned(STRUCTURE_CONTRACT),
    [SURFACES_CONTRACT]: owned(SURFACES_CONTRACT),
  });
  assert.deepEqual(CLAIM.authority.absentEnclosingTypes, ['HeaderSurfacePresentationConfig']);
  for (const pinned of CLAIM.authority.pinnedEnclosingTypes) {
    assert.equal(hosted(pinned.enclosingType, pinned.path), pinned.declarations);
  }
  assert.deepEqual(CLAIM.authority.declaredNotApplied, [
    {
      enclosingType: 'SidebarSurfaceVisualConfig',
      path: STRUCTURE_CONTRACT,
      wireOrRemove: 'OPEN',
    },
  ]);
  // Definition owners define the claim; they are never applied consumers.
  const applied = new Set(facts.staticallyResolvedSurfaceProfileApplicationFiles);
  for (const path of CLAIM.definitionFiles) {
    assert.ok(!applied.has(path), `${path} defines the claim and must not be counted as a consumer`);
  }
  assert.equal(CLAIM.definitionFiles.length, 4);
});

test('each application names WHICH declaration it applied, not merely that it called', () => {
  const applications = facts.staticallyResolvedSurfaceProfileApplicationRecords;
  assert.equal(applications.length, facts.staticallyResolvedSurfaceProfileApplications);
  assert.deepEqual(
    applications,
    [...applications].sort((left, right) =>
      left.consumerPath.localeCompare(right.consumerPath)
        || left.declarationPath.localeCompare(right.declarationPath)
        || left.enclosingType.localeCompare(right.enclosingType)),
  );
  // Every application record points at a real declaration identity, and its
  // consumer is a file the roster already recognises as an application.
  const declarations = new Set(
    facts.profileOverrideDeclarationRecords.map((record) => `${record.path}::${record.enclosingType}`),
  );
  const consumers = new Set(facts.staticallyResolvedSurfaceProfileApplicationFiles);
  for (const record of applications) {
    assert.ok(
      declarations.has(`${record.declarationPath}::${record.enclosingType}`),
      `application cites an unknown declaration: ${record.declarationPath}::${record.enclosingType}`,
    );
    assert.ok(consumers.has(record.consumerPath), `${record.consumerPath} is not in the applied roster`);
  }
  // The header consumer applies the HEADER field from the structure contract --
  // not some other owner's field that merely happens to be named the same.
  assert.deepEqual(applications.filter((record) => record.consumerPath === HEADER_CONSUMER), [
    {
      consumerPath: HEADER_CONSUMER,
      declarationPath: STRUCTURE_CONTRACT,
      enclosingType: 'HeaderSurfaceVisualConfig',
    },
  ]);
});

test('the declared-not-applied gap is an exact set difference, identified by owner', () => {
  const applied = facts.profileOverrideAppliedDeclarationRecords;
  const unapplied = facts.profileOverrideUnappliedDeclarationRecords;
  // 32 declarations partition exactly into applied + unapplied. A count-only
  // check would pass on any 31/1 split; this pins WHICH one is unapplied.
  assert.equal(applied.length + unapplied.length, facts.profileOverrideDeclarations);
  assert.equal(applied.length, facts.staticallyResolvedSurfaceProfileApplications);
  assert.deepEqual(unapplied, [
    { path: STRUCTURE_CONTRACT, enclosingType: 'SidebarSurfaceVisualConfig' },
  ]);
  const key = (record) => `${record.path}::${record.enclosingType}`;
  assert.deepEqual(
    [...applied, ...unapplied].map(key).sort(),
    facts.profileOverrideDeclarationRecords.map(key).sort(),
  );
  // Disjoint: no declaration may be reported as both applied and unapplied.
  const appliedKeys = new Set(applied.map(key));
  for (const record of unapplied) {
    assert.ok(!appliedKeys.has(key(record)), `${key(record)} is both applied and unapplied`);
  }
  for (const roster of [applied, unapplied]) {
    assert.deepEqual(
      roster,
      [...roster].sort((left, right) =>
        left.path.localeCompare(right.path) || left.enclosingType.localeCompare(right.enclosingType)),
    );
  }
  // The floor's registered gap is that exact difference, modulo wireOrRemove.
  assert.deepEqual(
    CLAIM.authority.declaredNotApplied.map(({ path, enclosingType }) => ({ path, enclosingType })),
    unapplied,
  );
});
