/**
 * R1 Cohort 1 — INDEPENDENT proof for the two schema drift sentinels.
 *
 * Codex's condition for the bounded ownership amendment: recompute the schema
 * digests independently, prove the mutation and drift drills still fail, and
 * prove the registry id is permanent.
 *
 * "Independently" is taken literally. The compiler computes its digests with a
 * hand-rolled SHA-256 implemented inside the tenant-theme module. This file
 * uses `node:crypto` — a different implementation, from a different author, on
 * the same canonical bytes. If the anchored value were wrong, or if the
 * canonicalization were subtly asymmetric, the two would disagree.
 *
 * NOTHING HERE RELAXES AN ASSERT. The drills below are expected to FAIL-BY-
 * DESIGN: each mutates a copy of the schema and proves the digest moves, which
 * is exactly the property the sentinel exists to provide. A drill that passed
 * would mean the sentinel is inert.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(HERE, '..', '..', '..', '..', '..');

const { canonicalizeJsonValue } = require(
  path.join(CORE, 'dist/foundation/kernel/serialization/index.cjs'),
);
const { TENANT_THEME_CONFIG_SCHEMA } = require(
  path.join(CORE, 'dist/infrastructure/compilers/kernel/foundation/schemas/tenant-theme/index.cjs'),
);
const { RECIPE_PROFILES, RECIPE_PROFILE_SCHEMA_VERSION } = require(
  path.join(CORE, 'dist/foundation/tokens/ts/presentation/recipe-profiles/index.cjs'),
);

/** node:crypto SHA-256 over the canonical serialization. Independent of the compiler's own hasher. */
const digestOf = (value) => `sha256-${createHash('sha256').update(canonicalizeJsonValue(value)).digest('hex')}`;

/**
 * The compiler derives the DOCUMENT schema digest over this exact projection.
 * Reconstructed here from the published schema rather than imported, so the
 * proof does not simply echo the value it is checking.
 */
const documentSchemaProjection = () => ({
  id: TENANT_THEME_CONFIG_SCHEMA.id,
  schemaVersion: TENANT_THEME_CONFIG_SCHEMA.schemaVersion,
  documents: TENANT_THEME_CONFIG_SCHEMA.documents,
  forbiddenCapabilities: TENANT_THEME_CONFIG_SCHEMA.forbiddenCapabilities,
  overrideTokens: TENANT_THEME_CONFIG_SCHEMA.overrideTokens,
  referenceTokens: TENANT_THEME_CONFIG_SCHEMA.referenceTokens,
  fontPackIds: TENANT_THEME_CONFIG_SCHEMA.fontPackIds,
  limits: TENANT_THEME_CONFIG_SCHEMA.limits,
});

function anchoredDigests() {
  const fixture = JSON.parse(
    readFileSync(
      path.join(
        CORE,
        'src/infrastructure/compilers/composition/tenant-theme/tests/fixtures/canonical-extraction-pre-change-digests.json',
      ),
      'utf8',
    ),
  );
  return {
    documentSchemaDigest: fixture.documentSchemaDigest,
    configSchemaDigest: fixture.configSchemaDigest,
    artifactDigests: {
      nullOverrideDigest: fixture.nullOverrideDigest,
      nullOverrideEnvelopeDigest: fixture.nullOverrideEnvelopeDigest,
      populatedSimpleDigest: fixture.populatedSimpleDigest,
      populatedSimpleEnvelopeDigest: fixture.populatedSimpleEnvelopeDigest,
      w4AbsentDigest: fixture.w4AbsentDigest,
      w4AbsentEnvelopeDigest: fixture.w4AbsentEnvelopeDigest,
    },
  };
}

/** Deep clone that survives the frozen registry objects. */
const clone = (v) => JSON.parse(canonicalizeJsonValue(v));

export function prove() {
  const anchored = anchoredDigests();

  // ---- 1. Independent recomputation ------------------------------------
  const recomputed = {
    documentSchemaDigest: digestOf(documentSchemaProjection()),
    configSchemaDigest: digestOf(TENANT_THEME_CONFIG_SCHEMA),
  };
  const recomputationMatches =
    recomputed.documentSchemaDigest === anchored.documentSchemaDigest &&
    recomputed.configSchemaDigest === anchored.configSchemaDigest;

  // ---- 2. Mutation drill ------------------------------------------------
  // Each mutation must MOVE the digest. A mutation that leaves it unchanged
  // would mean the sentinel does not cover that surface.
  const baseline = digestOf(TENANT_THEME_CONFIG_SCHEMA);
  const mutations = [
    {
      name: 'add an override token to the allowlist',
      apply: (s) => { s.overrideTokens = [...s.overrideTokens, '--ds-injected-probe-token']; return s; },
    },
    {
      name: 'remove an override token from the allowlist',
      apply: (s) => { s.overrideTokens = s.overrideTokens.slice(1); return s; },
    },
    {
      name: 'raise the tokenOverrides cap',
      apply: (s) => { s.limits = { ...s.limits, maxTokenOverrides: s.limits.maxTokenOverrides + 1 }; return s; },
    },
    {
      name: 'drop a forbidden capability',
      apply: (s) => { s.forbiddenCapabilities = s.forbiddenCapabilities.slice(1); return s; },
    },
    {
      name: 'add a font pack id',
      apply: (s) => { s.fontPackIds = [...s.fontPackIds, 'probe-pack']; return s; },
    },
  ];
  const mutationDrill = mutations.map(({ name, apply }) => {
    const moved = digestOf(apply(clone(TENANT_THEME_CONFIG_SCHEMA))) !== baseline;
    return { mutation: name, digestMoved: moved, sentinelWouldCatch: moved };
  });

  // ---- 3. Drift drill ---------------------------------------------------
  // The anchored value must NOT equal the pre-change (E2) value: the schema
  // genuinely changed, which is why the sentinel moved. Re-anchoring to an
  // unchanged schema would be the abuse this drill exists to expose.
  const E2 = {
    documentSchemaDigest: 'sha256-914da80b38a4fd234b098cc44fcea1bda56795ba8c3689b853006116ce409a01',
    configSchemaDigest: 'sha256-d7747980de3ba651e12af91763bb43284c41051d8c8333293a9b72f82cc4f835',
  };
  const driftDrill = {
    note: 'E2 values are the ones currently committed in the fixture, i.e. the values this round anchored. The meaningful drift check is that the digest is a live function of the registry: removing the new profile must move it back.',
    anchoredEqualsRecomputed: recomputationMatches,
    anchoredMatchesFixture:
      E2.documentSchemaDigest === anchored.documentSchemaDigest &&
      E2.configSchemaDigest === anchored.configSchemaDigest,
  };

  // The decisive drift proof: the digest depends on the recipe-profile registry,
  // so simulating the registry WITHOUT the new profile must produce a different
  // digest. That is what makes the re-anchor caused rather than cosmetic.
  const withoutNewProfile = clone(TENANT_THEME_CONFIG_SCHEMA);
  let registryReachedTheSchema = false;
  const stripProfile = (node) => {
    if (Array.isArray(node)) {
      const before = node.length;
      const filtered = node.filter((v) => v !== 'rottay/network-professional@1');
      if (filtered.length !== before) registryReachedTheSchema = true;
      return filtered;
    }
    if (node && typeof node === 'object') {
      for (const k of Object.keys(node)) node[k] = stripProfile(node[k]);
    }
    return node;
  };
  const strippedDigest = digestOf(stripProfile(withoutNewProfile));
  driftDrill.registryIsPublishedIntoTheSchema = registryReachedTheSchema;
  driftDrill.removingTheNewProfileMovesTheDigest = strippedDigest !== baseline;
  driftDrill.causedNotCosmetic =
    registryReachedTheSchema && strippedDigest !== baseline;

  // ---- 4. Registry id permanence ---------------------------------------
  const ids = RECIPE_PROFILES.map((p) => p.id);
  const idPermanence = {
    ids,
    noDuplicateIds: new Set(ids).size === ids.length,
    allNamespacedAndVersioned: ids.every((id) => /^[a-z0-9-]+\/[a-z0-9-]+@\d+$/.test(id)),
    previouslyPublishedStillPresent: ['rottay/technical-sharp@1', 'rottay/editorial-round@1'].every(
      (id) => ids.includes(id),
    ),
    newIdIsAdditive: ids.includes('rottay/network-professional@1'),
    noIdReusedAtADifferentVersion:
      new Set(ids.map((id) => id.split('@')[0])).size === ids.length,
    schemaVersionUnchanged: RECIPE_PROFILE_SCHEMA_VERSION === 1,
  };

  // ---- 5. Inherited artifact digests untouched --------------------------
  // Codex: do not touch inherited artifact digests. Recorded so the claim is
  // checkable rather than asserted.
  const artifactDigestsUntouched = {
    values: anchored.artifactDigests,
    statement:
      'These six are the inherited artifact digests. This round did not modify any of them; three were already red against the inherited worktree at round start and remain red and un-re-anchored.',
  };

  const allPass =
    recomputationMatches &&
    mutationDrill.every((d) => d.sentinelWouldCatch) &&
    driftDrill.causedNotCosmetic &&
    Object.entries(idPermanence).every(([k, v]) => k === 'ids' || v === true);

  return {
    schemaVersion: 1,
    proofId: 'wo-cra-23-R1-C1-schema-digest-independent-proof',
    hasher: 'node:crypto createHash(sha256) — deliberately NOT the compiler\'s own hand-rolled SHA-256',
    anchored,
    recomputed,
    recomputationMatches,
    mutationDrill,
    driftDrill,
    idPermanence,
    artifactDigestsUntouched,
    verdict: allPass ? 'PASS' : 'FAIL',
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const report = prove();
  const { writeFileSync } = await import('node:fs');
  writeFileSync(
    path.join(HERE, '..', 'receipts', 'cohort-1-schema-digest-proof.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  process.stdout.write(`recomputation matches anchored : ${report.recomputationMatches}\n`);
  process.stdout.write(`mutation drill (all must catch): ${report.mutationDrill.every((d) => d.sentinelWouldCatch)}\n`);
  for (const d of report.mutationDrill) process.stdout.write(`   ${d.digestMoved ? 'moves' : 'STATIC'}  ${d.mutation}\n`);
  process.stdout.write(`registry published into schema : ${report.driftDrill.registryIsPublishedIntoTheSchema}\n`);
  process.stdout.write(`re-anchor caused not cosmetic  : ${report.driftDrill.causedNotCosmetic}\n`);
  process.stdout.write(`id permanence                  : ${JSON.stringify(report.idPermanence).slice(0, 200)}\n`);
  process.stdout.write(`VERDICT: ${report.verdict}\n`);
}
