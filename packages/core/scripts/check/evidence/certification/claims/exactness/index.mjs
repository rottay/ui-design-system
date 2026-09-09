#!/usr/bin/env node
/**
 * WO-GAT-07 — deterministic Phase-0 exact proof and bounded claim floor.
 *
 * The authoritative digest is derived from a complete relevant-input manifest,
 * never from the UI repository HEAD. docs-engineering is separately sealed to
 * a reviewed implementation commit after its documentation changes land.
 * Final DS-IMP-060 certification remains WO-GAT-09 in Phase 6.
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import ts from 'typescript';

import { summarizeZeroLocks } from '../../../../../libraries/engine/zero-locks/index.mjs';
import { countArc09PaintInFile } from '../../../../../libraries/paint/inline/index.mjs';
import {
  ENGINE_TOKEN_EXACT,
  ENGINE_TOKEN_MINIMUM,
} from '../../../../../libraries/engine/tokens/index.mjs';
import { readFirstPartyRosterSource } from '../../../../../libraries/roster/index.mjs';
import {
  analyzeClaimSourceRecords,
  analyzeTenantFloorCssRecords,
  buildClaimDocumentationInventory,
  collectDataPartStampsFromText,
  extractRegistryFactsFromText,
  extractRosterProjectedRegistryFacts,
  findStaleClaimsInRecords,
  validateClaimDocumentationInventory,
} from '../../../../../libraries/evidence/claims/index.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const UI_ROOT = findRepoRoot(HERE);
const WORKSPACE_ROOT = resolve(UI_ROOT, '..');
export const DOCS_ROOT = resolve(
  process.env.DOCS_ENGINEERING_ROOT || join(WORKSPACE_ROOT, 'docs-engineering'),
);
const COMPONENTS = join(CORE_ROOT, 'src/components');
const CLAIM_FLOOR_PATH = join(HERE, 'public-claim-floor/index.json');
const CLAIM_DOC_ALLOWLIST_PATH = join(HERE, 'documentation-allowlist/index.json');
const DOCUMENTATION_SEAL_PATH = join(HERE, 'documentation-seal/index.json');
const STALE_CORPUS_PATH = join(HERE, 'stale-corpus/index.json');
const CI_WORKFLOW_PATH = join(UI_ROOT, '.github/workflows/ci.yml');
const BASELINE_PATH = join(CORE_ROOT, 'scripts/check/engine/tokens/audit/baseline/index.json');
const AUDIT_PATH = join(CORE_ROOT, 'scripts/check/engine/tokens/audit/index.mjs');
const DATA_PART_DOC = join(
  DOCS_ROOT,
  'engineering/design-system/runtime/skins/data-part-contracts/README.md',
);
// TWO OWNERS, ON PURPOSE.
//
// `exactness/` is the SEALED ARCHIVE: the WO-GAT-07 record as it was written,
// at the documentation revision and the input hashes of its own day. It is
// historical evidence. This gate reads it and never writes it -- there is no
// code path here that opens it for writing, and `--write` refuses if the
// archive bytes move under it.
//
// `exactness-live/` is the LIVE proof: the same two deterministic runs against
// TODAY's tree, plus a provenance record that names, input by input, where the
// archive and the live tree disagree. That third file is what keeps the archive
// visible instead of quietly superseded.
//
// Before this split there was one owner doing both jobs, and it could not do
// them at once: four of its five divergent inputs (`ci.yml`, root
// `package.json`, `CLAUDE.md`, `keyframe-namespace-contract.test.ts`) are
// byte-identical between HEAD and the worktree, so the archive was already
// stale AT HEAD and the only ways to green it were to overwrite historical
// evidence or to leave a blocking gate red forever.
const ARCHIVE_DIR = join(CORE_ROOT, 'artifacts/quality/certification/claims/exactness');
const ARCHIVE_EVIDENCE_PATH = join(ARCHIVE_DIR, 'evidence/index.json');
const ARCHIVE_DIGEST_PATH = join(ARCHIVE_DIR, 'digest/index.txt');
const LIVE_DIR = join(CORE_ROOT, 'artifacts/quality/certification/claims/exactness-live');
const LIVE_EVIDENCE_PATH = join(LIVE_DIR, 'evidence/index.json');
const LIVE_DIGEST_PATH = join(LIVE_DIR, 'digest/index.txt');
const LIVE_PROVENANCE_PATH = join(LIVE_DIR, 'provenance/index.json');
const ROOT_PACKAGE_PATH = join(UI_ROOT, 'package.json');
const CORE_PACKAGE_PATH = join(CORE_ROOT, 'package.json');
const PNPM_LOCK_PATH = join(UI_ROOT, 'pnpm-lock.yaml');
const PNPM_WORKSPACE_PATH = join(UI_ROOT, 'pnpm-workspace.yaml');
const ROADMAP_REGISTRY_PATH = join(UI_ROOT, 'roadmap/registry.json');
const CI_PATH = join(UI_ROOT, '.github/workflows/ci.yml');
const REQUIREMENTS_REVISION = '969205380fd24eb45947bf3748db5a6cacd798f8';

const PRODUCTION_SOURCE_RE = /\.(?:ts|tsx)$/;
const SOURCE_EXCLUDE_RE = /(?:^|\/)(?:tests?|__tests__|stories)(?:\/|$)|\.(?:test|spec|stories)\./;
const SKIN_DIRS = [
  join(CORE_ROOT, 'src/foundation/tokens/css/runtime/engines/modern/skin'),
  join(CORE_ROOT, 'src/foundation/tokens/css/runtime/engines/rustic/skin'),
  join(CORE_ROOT, 'src/foundation/tokens/css/presentation/components/skin'),
];

const CANONICAL_DOC_MARKERS = Object.freeze({
  'component-extensions': '<!-- GAT07-CLAIM component-extensions: reserved-deprecated; runtime=unimplemented; affirmative-behavior=false; owner=DS-IMP-021 -->',
  'surface-profile-overrides': '<!-- GAT07-CLAIM surface-profile-overrides: active; runtime=declared-32-applied-31; affirmative-behavior=true; owner=DS-IMP-022 -->',
});

const CLAIM_DOCS = [
  { path: join(CORE_ROOT, 'docs/reference/contracts/index.md'), claims: ['component-extensions'] },
  { path: join(UI_ROOT, 'CLAUDE.md'), claims: ['surface-profile-overrides'] },
  { path: join(DOCS_ROOT, 'engineering/design-system/README.md'), claims: ['component-extensions', 'surface-profile-overrides'] },
  { path: join(DOCS_ROOT, 'engineering/design-system/foundations/contracts/README.md'), claims: ['component-extensions'] },
  { path: join(DOCS_ROOT, 'engineering/design-system/foundations/hooks/README.md'), claims: ['surface-profile-overrides'] },
  { path: join(DOCS_ROOT, 'engineering/design-system/components/surfaces/README.md'), claims: ['surface-profile-overrides'] },
  { path: join(DOCS_ROOT, 'engineering/design-system/components/surfaces/foundation/README.md'), claims: ['surface-profile-overrides'] },
  { path: join(DOCS_ROOT, 'engineering/design-system/components/surfaces/pages/README.md'), claims: ['surface-profile-overrides'] },
];

const VERTICAL_DOCS = {
  verticals: join(DOCS_ROOT, 'engineering/design-system/runtime/verticals/README.md'),
  tenancy: join(DOCS_ROOT, 'engineering/design-system/runtime/tenancy/README.md'),
  engines: join(DOCS_ROOT, 'engineering/design-system/runtime/engines/README.md'),
};

// Reference/spec documents whose volatile prose claims (the showroom stats
// table, the engine-modern work-order count) carry no named GAT07-CLAIM block
// and are not code-derived vertical rows, so neither the claim-block census nor
// the vertical-line requirement fits them. They are instead governed by the
// whole-file SHA-256 documentation seal: any drifted stats row or reverted
// work-order count changes the file hash and is rejected until the document is
// re-reviewed and re-sealed to a new documentation revision. Both MUST resolve
// under DOCS_ROOT, or validateDocumentationSeal's DOCS_ROOT filter silently
// skips them and the coverage is a no-op (asserted by the seal contract test).
export const SEALED_REFERENCE_DOCS = Object.freeze({
  showroom: join(DOCS_ROOT, 'engineering/design-system/showroom/README.md'),
  engineModern: join(DOCS_ROOT, 'engineering/design-system/runtime/engines/modern/README.md'),
});

const CLAIM_FLOOR_KEYS = new Set([
  'id',
  'symbols',
  'disposition',
  'runtimeStatus',
  'affirmativeBehaviorClaimAllowed',
  'deferredOwner',
  'definitionFiles',
  'authority',
  'productionConsumers',
  'executableAssertions',
  'requiredAssertions',
]);
const CLAIM_FLOOR_ROOT_KEYS = new Set(['schemaVersion', 'scope', 'finalCertificationAuthority', 'claims']);
const CLAIM_DEFERRED_OWNER_KEYS = new Set(['sourceId', 'owner', 'targetPhase', 'decision']);
const GAT07_STATIC_REGISTRY_FIELDS = Object.freeze([
  'id',
  'title',
  'lane',
  'order',
  'size',
  'dependsOn',
  'mustLandWith',
  'programs',
  'sourceIds',
  'supportsSourceIds',
  'milestone',
  'phase',
  'notes',
  'execution',
]);
/**
 * The applied-consumer roster: every productive Core file that DIRECTLY calls
 * `useSurfaceProfileDefaultsWithOverrides`. Sorted, and byte-identical to the
 * analyzer's measured set -- the claim floor mirrors the measurement, it never
 * sources it. The structure-tier `header-surface` consumer is included; the
 * former `/src/components/surfaces/` census filter silently dropped it.
 */
const SURFACE_PROFILE_OVERRIDE_CONSUMERS = Object.freeze([
  'src/components/structures/headers/header-surface/index.tsx',
  'src/components/surfaces/presentation/pages/admin/audit/index.tsx',
  'src/components/surfaces/presentation/pages/admin/billing/index.tsx',
  'src/components/surfaces/presentation/pages/admin/file-browser/index.tsx',
  'src/components/surfaces/presentation/pages/admin/import-export/index.tsx',
  'src/components/surfaces/presentation/pages/admin/integration/index.tsx',
  'src/components/surfaces/presentation/pages/admin/profile/index.tsx',
  'src/components/surfaces/presentation/pages/admin/settings/index.tsx',
  'src/components/surfaces/presentation/pages/admin/team/index.tsx',
  'src/components/surfaces/presentation/pages/data/compare/index.tsx',
  'src/components/surfaces/presentation/pages/data/dashboard/index.tsx',
  'src/components/surfaces/presentation/pages/data/detail/index.tsx',
  'src/components/surfaces/presentation/pages/data/list/index.tsx',
  'src/components/surfaces/presentation/pages/data/report/index.tsx',
  'src/components/surfaces/presentation/pages/data/search/index.tsx',
  'src/components/surfaces/presentation/pages/data/visualization/index.tsx',
  'src/components/surfaces/presentation/pages/experience/auth/index.tsx',
  'src/components/surfaces/presentation/pages/experience/chat/index.tsx',
  'src/components/surfaces/presentation/pages/experience/editor/index.tsx',
  'src/components/surfaces/presentation/pages/experience/empty-state/index.tsx',
  'src/components/surfaces/presentation/pages/experience/marketing/index.tsx',
  'src/components/surfaces/presentation/pages/experience/media/index.tsx',
  'src/components/surfaces/presentation/pages/experience/notification/index.tsx',
  'src/components/surfaces/presentation/pages/experience/pricing/index.tsx',
  'src/components/surfaces/presentation/pages/forms/detail-form/index.tsx',
  'src/components/surfaces/presentation/pages/forms/form/index.tsx',
  'src/components/surfaces/presentation/pages/forms/wizard/index.tsx',
  'src/components/surfaces/presentation/pages/operations/activity/index.tsx',
  'src/components/surfaces/presentation/pages/operations/kanban/index.tsx',
  'src/components/surfaces/presentation/pages/operations/operational/index.tsx',
  'src/components/surfaces/presentation/pages/operations/scheduler/index.tsx',
]);
const SURFACE_PROFILE_OVERRIDE_ASSERTIONS = Object.freeze([
  'scripts/check/evidence/certification/claims/exactness/tests/index.test.mjs',
  'src/components/surfaces/tests/SurfacesLongTailBatch.contract.test.tsx',
]);
/**
 * Declaration identity. A count of 32 is not, by itself, an authority: the same
 * 32 could be produced by moving a declaration between owners or re-hosting it
 * on another type. This block pins WHERE the declarations live -- the owner
 * distribution, the two structure-tier enclosing types, a type that must stay
 * absent, and the single declared-but-never-applied field whose wire-or-remove
 * decision is still OPEN.
 */
const SURFACE_PROFILE_AUTHORITY = Object.freeze({
  declarationOwners: {
    'src/components/structures/foundation/chrome/contracts/index.ts': 2,
    'src/components/surfaces/foundation/contracts/index.ts': 30,
  },
  pinnedEnclosingTypes: [
    {
      enclosingType: 'SidebarSurfaceVisualConfig',
      path: 'src/components/structures/foundation/chrome/contracts/index.ts',
      declarations: 1,
    },
    {
      enclosingType: 'HeaderSurfaceVisualConfig',
      path: 'src/components/structures/foundation/chrome/contracts/index.ts',
      declarations: 1,
    },
  ],
  absentEnclosingTypes: ['HeaderSurfacePresentationConfig'],
  declaredNotApplied: [
    {
      enclosingType: 'SidebarSurfaceVisualConfig',
      path: 'src/components/structures/foundation/chrome/contracts/index.ts',
      wireOrRemove: 'OPEN',
    },
  ],
});
const EXPECTED_CLAIM_FLOOR = Object.freeze({
  'component-extensions': {
    symbols: ['ComponentExtensions', 'ExtensionHelpers', 'EngineAwareProps.extensions'],
    disposition: 'reserved-deprecated',
    runtimeStatus: 'unimplemented',
    deferredOwner: {
      sourceId: 'DS-IMP-021',
      owner: 'design-system-program',
      targetPhase: '2A',
      decision: 'external-import census, then component-owned replacement or removal',
    },
    definitionFiles: [
      'src/foundation/contracts/kernel/tokens/extensions/index.ts',
      'src/foundation/contracts/runtime/engine/index.ts',
    ],
    requiredAssertions: {
      staticallyResolvedExtensionRuntimeReferences: 0,
      staticallyResolvedExtensionHelperReferences: 0,
      staticallyResolvedPotentialConsumers: 0,
      unsupportedGovernedReferences: 0,
      registeredExecutableEvidence: 0,
      deprecatedMarkersMinimum: 3,
    },
  },
  'surface-profile-overrides': {
    symbols: ['SurfaceVisualOverrides', 'useSurfaceProfileDefaultsWithOverrides', 'visual.profileOverrides'],
    disposition: 'active',
    // Declared (32) and applied (31) are DISTINCT censuses, not a parity claim.
    // `SidebarSurfaceVisualConfig.profileOverrides` is declared and never read.
    runtimeStatus: 'declared-32-applied-31',
    deferredOwner: {
      sourceId: 'DS-IMP-022',
      owner: 'design-system-program',
      targetPhase: '2A',
      decision: 'maintain the exact declaration and applied-consumer census with executable evidence; close or retire the declared-not-applied gap',
    },
    definitionFiles: [
      'src/components/structures/foundation/chrome/contracts/index.ts',
      'src/components/structures/foundation/chrome/runtime/profile-defaults/overrides/index.ts',
      'src/components/surfaces/foundation/contracts/index.ts',
      'src/components/surfaces/index.ts',
    ],
    authority: SURFACE_PROFILE_AUTHORITY,
    productionConsumers: SURFACE_PROFILE_OVERRIDE_CONSUMERS,
    executableAssertions: SURFACE_PROFILE_OVERRIDE_ASSERTIONS,
    requiredAssertions: {
      profileOverrideDeclarations: 32,
      staticallyResolvedSurfaceHookCalls: 31,
      // `productionConsumers` is governed by APPLICATIONS, not by bare calls.
      staticallyResolvedSurfaceProfileApplications: 31,
      staticallyResolvedShowroomProfileOverrideReferences: 0,
      staticallyResolvedPotentialConsumers: 31,
      unsupportedGovernedReferences: 0,
      registeredExecutableEvidence: 2,
    },
  },
});

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const normalizePath = (path) => path.split(sep).join('/');
function pathWithin(root, path) {
  return path === root || path.startsWith(`${root}${sep}`);
}

/**
 * Evidence paths name logical repositories, never their checkout placement.
 * CI intentionally nests docs under ui-design-system/.gat07 while local work
 * normally keeps both repositories as siblings; those layouts must serialize
 * to byte-identical evidence.
 */
function workspacePath(path) {
  const absolute = resolve(path);
  // DOCS_ROOT may be nested under UI_ROOT in CI, so test it first.
  if (pathWithin(DOCS_ROOT, absolute)) {
    return normalizePath(join('docs-engineering', relative(DOCS_ROOT, absolute)));
  }
  if (pathWithin(UI_ROOT, absolute)) {
    return normalizePath(join('ui-design-system', relative(UI_ROOT, absolute)));
  }
  return normalizePath(relative(WORKSPACE_ROOT, absolute));
}

/**
 * The inverse of `workspacePath`. An evidence path names a LOGICAL repository,
 * so reconstructing a real file from it must go back through the roots this run
 * actually uses -- never through `<workspace>/<logical name>`, which resolves
 * into a DIFFERENT checkout whenever this repository is not the sibling
 * directory that happens to share the logical name. That is how a run inside a
 * worktree read another clone's files, or died on an input the tree in front of
 * it carries.
 */
export function workspaceAbsolute(path) {
  const normalized = normalizePath(path);
  if (normalized === 'docs-engineering' || normalized.startsWith('docs-engineering/')) {
    return join(DOCS_ROOT, normalized.slice('docs-engineering'.length));
  }
  if (normalized === 'ui-design-system' || normalized.startsWith('ui-design-system/')) {
    return join(UI_ROOT, normalized.slice('ui-design-system'.length));
  }
  return join(WORKSPACE_ROOT, normalized);
}

function read(path) {
  if (!existsSync(path)) throw new Error(`required GAT-07 input is missing: ${workspacePath(path)}`);
  return readFileSync(path, 'utf8');
}

function walkFiles(root, predicate = () => true) {
  const out = [];
  if (!existsSync(root)) return out;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(path, predicate));
    else if (entry.isFile() && predicate(path)) out.push(path);
  }
  return out.sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
}

function sourceFiles(root = join(CORE_ROOT, 'src')) {
  return walkFiles(root, (path) => PRODUCTION_SOURCE_RE.test(path) && !SOURCE_EXCLUDE_RE.test(normalizePath(path)));
}

function sameJsonValue(actual, expected) {
  if (Array.isArray(expected)) {
    return Array.isArray(actual)
      && actual.length === expected.length
      && actual.every((value, index) => sameJsonValue(value, expected[index]));
  }
  if (expected && typeof expected === 'object') {
    return actual && typeof actual === 'object' && !Array.isArray(actual)
      && Object.keys(actual).sort().join('\0') === Object.keys(expected).sort().join('\0')
      && Object.entries(expected).every(([key, value]) => sameJsonValue(actual[key], value));
  }
  return actual === expected;
}

function unknownKeys(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.keys(value).filter((key) => !allowed.has(key));
}

export function evaluateClaimFloor(floor) {
  const errors = [];
  if (!floor || typeof floor !== 'object' || Array.isArray(floor)) {
    return { ok: false, errors: ['claim floor must be an object'] };
  }
  for (const key of unknownKeys(floor, CLAIM_FLOOR_ROOT_KEYS)) errors.push(`unknown claim-floor root key ${key}`);
  if (floor.schemaVersion !== 1) errors.push('claim-floor schemaVersion must be 1');
  if (floor.scope !== 'DS-IMP-060-phase-0-minimum') errors.push('claim floor must stay bounded to Phase 0');
  if (floor.finalCertificationAuthority !== 'WO-GAT-09') errors.push('WO-GAT-09 must remain final certification authority');
  if (!Array.isArray(floor.claims) || floor.claims.length !== 2) {
    errors.push('Phase-0 claim floor must contain exactly two seeded claim families');
  }
  const ids = new Set();
  for (const [index, claim] of (Array.isArray(floor.claims) ? floor.claims : []).entries()) {
    if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
      errors.push(`claim floor entry ${index} must be an object`);
      continue;
    }
    if (!claim.id || ids.has(claim.id)) errors.push(`missing/duplicate claim id: ${String(claim.id)}`);
    ids.add(claim.id);
    for (const key of unknownKeys(claim, CLAIM_FLOOR_KEYS)) errors.push(`${claim.id}: unknown claim key ${key}`);
    for (const key of unknownKeys(claim.deferredOwner, CLAIM_DEFERRED_OWNER_KEYS)) {
      errors.push(`${claim.id}: unknown deferredOwner key ${key}`);
    }
    const expected = EXPECTED_CLAIM_FLOOR[claim.id];
    if (!expected) {
      errors.push(`unknown seeded claim family: ${String(claim.id)}`);
      continue;
    }
    for (const [field, expectedValue] of Object.entries(expected)) {
      if (!sameJsonValue(claim[field], expectedValue)) {
        errors.push(`${claim.id}.${field} must match the adjudicated Phase-0 claim floor`);
      }
    }
    const active = claim.disposition === 'active';
    if (active) {
      if (claim.affirmativeBehaviorClaimAllowed !== true) {
        errors.push(`${claim.id}: active claim must allow its bounded affirmative behavior`);
      }
      if (!Array.isArray(claim.productionConsumers) || claim.productionConsumers.length === 0) {
        errors.push(`${claim.id}: active claim must register productionConsumers`);
      }
      if (!Array.isArray(claim.executableAssertions) || claim.executableAssertions.length === 0) {
        errors.push(`${claim.id}: active claim must register executableAssertions`);
      }
    } else {
      if (claim.affirmativeBehaviorClaimAllowed !== false) {
        errors.push(`${claim.id}: reserved/deferred claim cannot allow affirmative behavior language`);
      }
      if (!Array.isArray(claim.productionConsumers) || claim.productionConsumers.length !== 0) {
        errors.push(`${claim.id}: reserved claim must have zero productionConsumers`);
      }
      if (!Array.isArray(claim.executableAssertions) || claim.executableAssertions.length !== 0) {
        errors.push(`${claim.id}: reserved claim must have zero executableAssertions`);
      }
    }
  }
  for (const required of Object.keys(EXPECTED_CLAIM_FLOOR)) {
    if (!ids.has(required)) errors.push(`missing seeded claim family: ${required}`);
  }
  return { ok: errors.length === 0, errors };
}

function claimDocumentationRecords() {
  return CLAIM_DOCS.map(({ path, claims }) => ({
    path: workspacePath(path),
    absolutePath: path,
    claims,
    text: read(path),
  }));
}

function generatedClaimDocumentationTemplates(floor) {
  return Object.fromEntries((Array.isArray(floor?.claims) ? floor.claims : []).map((claim) => [
    claim.id,
    `GAT07-CONTRACT ${claim.id}: symbols=[${claim.symbols.join(', ')}]; disposition=${claim.disposition}; runtime-status=${claim.runtimeStatus}; affirmative-behavior=${claim.affirmativeBehaviorClaimAllowed}; production-consumers=${claim.productionConsumers.length}; executable-assertions=${claim.executableAssertions.length}; owner=${claim.deferredOwner.owner}/${claim.deferredOwner.sourceId}; target-phase=${claim.deferredOwner.targetPhase}.`,
  ]));
}

/**
 * Declaration identity, enforced against the measured records. A count of 32 is
 * not an authority on its own: the owner distribution, the pinned structure-tier
 * enclosing types, and the type that must stay absent are all pinned, so a
 * declaration that MOVES between owners or is RE-HOSTED on another type turns
 * red while the count still reads 32.
 */
export function evaluateClaimAuthority(claim, measured) {
  const errors = [];
  const authority = claim.authority;
  const records = measured.profileOverrideDeclarationRecords;
  if (!Array.isArray(records)) {
    errors.push(`${claim.id}.authority: the analyzer emitted no declaration-identity records`);
    return errors;
  }
  const owners = authority.declarationOwners ?? {};
  const ownedBy = (record, owner) => record.path === owner || record.path.endsWith(`/${owner}`);
  for (const [owner, expected] of Object.entries(owners)) {
    const actual = records.filter((record) => ownedBy(record, owner)).length;
    if (actual !== expected) {
      errors.push(`${claim.id}.authority.declarationOwners[${owner}]: ${actual} != ${expected}`);
    }
  }
  const unattributed = records.filter((record) => !Object.keys(owners).some((owner) => ownedBy(record, owner)));
  for (const record of unattributed) {
    errors.push(`${claim.id}.authority.declarationOwners: ${record.enclosingType} declares outside the pinned owners (${record.path})`);
  }
  for (const pinned of authority.pinnedEnclosingTypes ?? []) {
    const actual = records.filter(
      (record) => record.enclosingType === pinned.enclosingType && ownedBy(record, pinned.path),
    ).length;
    if (actual !== pinned.declarations) {
      errors.push(`${claim.id}.authority.pinnedEnclosingTypes[${pinned.enclosingType}]: ${actual} != ${pinned.declarations} in ${pinned.path}`);
    }
  }
  for (const absent of authority.absentEnclosingTypes ?? []) {
    if (records.some((record) => record.enclosingType === absent)) {
      errors.push(`${claim.id}.authority.absentEnclosingTypes: ${absent} must not host a governed declaration`);
    }
  }
  for (const gap of authority.declaredNotApplied ?? []) {
    if (!records.some((record) => record.enclosingType === gap.enclosingType && ownedBy(record, gap.path))) {
      errors.push(`${claim.id}.authority.declaredNotApplied: ${gap.enclosingType} no longer declares the governed field`);
    }
    if (gap.wireOrRemove !== 'OPEN') {
      errors.push(`${claim.id}.authority.declaredNotApplied: ${gap.enclosingType} wire-or-remove must stay OPEN until it is wired or removed`);
    }
  }
  // The gap is an exact SET DIFFERENCE between the governed declarations and
  // the identities actually applied -- never a count. A consumer that applies
  // ANOTHER owner's field leaves both the count and the roster intact while
  // moving WHICH declaration is unapplied, so only identity can see it.
  // `wireOrRemove` is registry bookkeeping and is deliberately ignored here;
  // it is enforced by the loop above.
  const registeredGap = authority.declaredNotApplied ?? [];
  const measuredGap = measured.profileOverrideUnappliedDeclarationRecords;
  if (!Array.isArray(measuredGap)) {
    errors.push(`${claim.id}.authority.declaredNotApplied: the analyzer emitted no unapplied-declaration records`);
    return errors;
  }
  const sameIdentity = (gap, record) => record.enclosingType === gap.enclosingType && ownedBy(record, gap.path);
  for (const gap of registeredGap) {
    if (!measuredGap.some((record) => sameIdentity(gap, record))) {
      errors.push(`${claim.id}.authority.declaredNotApplied: ${gap.enclosingType} (${gap.path}) is registered as declared-not-applied but the tree applies it`);
    }
  }
  for (const record of measuredGap) {
    if (!registeredGap.some((gap) => sameIdentity(gap, record))) {
      errors.push(`${claim.id}.authority.declaredNotApplied: ${record.enclosingType} (${record.path}) is declared and never applied but is not registered`);
    }
  }
  return errors;
}

function measureClaims() {
  const floor = JSON.parse(read(CLAIM_FLOOR_PATH));
  const errors = [...evaluateClaimFloor(floor).errors];
  const coreRecords = sourceFiles().map((path) => ({ path: workspacePath(path), text: read(path), kind: 'core' }));
  const showroomPaths = sourceFiles(join(UI_ROOT, 'packages/showroom/src'));
  const showroomRecords = showroomPaths.map((path) => ({ path: workspacePath(path), text: read(path), kind: 'showroom' }));
  const facts = analyzeClaimSourceRecords([...coreRecords, ...showroomRecords]);
  for (const claim of (Array.isArray(floor.claims) ? floor.claims : [])) {
    const measured = facts[claim.id];
    if (!measured) continue;
    const registeredAssertions = (claim.executableAssertions ?? []).filter((path) => {
      const absolutePath = join(CORE_ROOT, path);
      if (!existsSync(absolutePath)) {
        errors.push(`${claim.id}.executableAssertions: missing ${path}`);
        return false;
      }
      return true;
    });
    measured.registeredExecutableEvidence = registeredAssertions.length;
    for (const path of claim.productionConsumers ?? []) {
      if (!existsSync(join(CORE_ROOT, path))) {
        errors.push(`${claim.id}.productionConsumers: missing ${path}`);
      }
    }
    for (const [assertion, expected] of Object.entries(claim.requiredAssertions ?? {})) {
      const actual = measured[assertion.replace(/Minimum$/, '')];
      if (assertion.endsWith('Minimum')) {
        if (!(actual >= expected)) errors.push(`${claim.id}.${assertion}: ${actual} < ${expected}`);
      } else if (actual !== expected) {
        errors.push(`${claim.id}.${assertion}: ${actual} != ${expected}`);
      }
    }
    if (claim.authority) errors.push(...evaluateClaimAuthority(claim, measured));
  }

  const documentationRecords = claimDocumentationRecords();
  const canonicalTemplates = generatedClaimDocumentationTemplates(floor);
  const inventory = buildClaimDocumentationInventory(documentationRecords, CANONICAL_DOC_MARKERS, canonicalTemplates);
  const allowlist = JSON.parse(read(CLAIM_DOC_ALLOWLIST_PATH));
  errors.push(...validateClaimDocumentationInventory(inventory, allowlist, CANONICAL_DOC_MARKERS, canonicalTemplates).errors);
  const documentation = {
    allowlist: { path: workspacePath(CLAIM_DOC_ALLOWLIST_PATH), sha256: sha256(read(CLAIM_DOC_ALLOWLIST_PATH)) },
    documents: Object.fromEntries(
      Object.entries(inventory.documents).map(([path, value]) => [
        path,
        {
          claims: value.claims,
          sha256: sha256(documentationRecords.find((record) => record.path === path).text),
          blocks: value.blocks.map(({ claimId, line, sha256: hash }) => ({ claimId, line, sha256: hash })),
        },
      ]),
    ),
  };

  return {
    evidence: { floor, facts, documentation },
    errors,
    inputFiles: [
      CLAIM_FLOOR_PATH,
      CLAIM_DOC_ALLOWLIST_PATH,
      ...coreRecords.map((record) => workspaceAbsolute(record.path)),
      ...showroomRecords.map((record) => workspaceAbsolute(record.path)),
      ...documentationRecords.map((record) => record.absolutePath),
    ],
  };
}

function literalEquals(state, value) {
  return state?.kind === 'literal' && state.value === value;
}

/**
 * The code-derived lines the vertical/tenancy/engine documentation must carry
 * verbatim. Everything the roster can author IS authored from the roster; only
 * the engine-role wording is a literal, because the role a frozen engine plays
 * is a product decision the roster does not carry. Those literals track the
 * documentation, not the other way round: the doc is the live truth, and this
 * function is what the seal pins it against.
 */
export function verticalDocumentationRequirements(roster, rosterEngine) {
  const engineLabel = `${String(rosterEngine).charAt(0).toUpperCase()}${String(rosterEngine).slice(1)}`;
  return {
    verticals: [
      `| **Vertical preset engine** | ${roster.map((entry) => entry.engine).join(' | ')} |`,
      `| **First-party tenant explicit engine** | ${roster.map(() => 'not set').join(' | ')} |`,
    ],
    tenancy: roster.map((entry) => `| \`${entry.slug}\` | ${entry.name} | not set |`),
    engines: [
      '| Classic | `classic` | Ant Design 5 (`antd`) | Frozen, fail-closed | -- |',
      `| ${engineLabel} | \`${rosterEngine}\` | Rottay-native premium skin | **PRIMARY, and the only productive engine** | ${roster.map((entry) => entry.name).join(', ')} vertical presets |`,
    ],
  };
}

function measureVerticals() {
  const verticalPath = join(
    CORE_ROOT,
    'src/foundation/presets/verticals/index.ts',
  );
  const tenantPath = join(
    CORE_ROOT,
    'src/infrastructure/runtime/tenant/foundation/configuration/registry/index.ts',
  );
  const rosterPath = join(
    CORE_ROOT,
    'src/foundation/tokens/ts/presentation/brand-themes/index.ts',
  );
  // The roster is the single author of first-party identity, so the trio is
  // READ from it. A literal ['rottay', 'bithire', 'evnto'] in this gate would
  // be a second authority that keeps passing after the roster changes.
  const roster = readFirstPartyRosterSource(rosterPath);
  const verticalResult = extractRegistryFactsFromText(
    read(verticalPath), workspacePath(verticalPath), 'VERTICAL_REGISTRY', ['engine', 'density', 'defaultProductProfile'],
  );
  // `KNOWN_TENANTS` is a roster projection, not a hand-authored key-per-tenant
  // literal: its rows are proven through the map/factory shape and the single
  // authored literal every row reaches.
  const tenantResult = extractRosterProjectedRegistryFacts(
    read(tenantPath), workspacePath(tenantPath), {
      variableName: 'KNOWN_TENANTS',
      rosterName: 'FIRST_PARTY_VERTICAL_ROSTER',
      slugs: roster.map((entry) => entry.slug),
      fields: ['engine', 'vertical'],
    },
  );
  const errors = [];
  if (!verticalResult.declaration.readonlyTypeAnnotation) {
    errors.push(`VERTICAL_REGISTRY must retain an authored Readonly<...> type annotation: ${JSON.stringify(verticalResult.declaration.typeAnnotation)}`);
  }
  if (!tenantResult.declaration.readonlyTypeAnnotation) {
    errors.push(`KNOWN_TENANTS must retain an authored Readonly<...> type annotation: ${JSON.stringify(tenantResult.declaration.typeAnnotation)}`);
  }
  const expectedRosterSpecifier = `@/${normalizePath(relative(join(CORE_ROOT, 'src'), dirname(rosterPath)))}`;
  if (tenantResult.projection && tenantResult.projection.rosterModule !== expectedRosterSpecifier) {
    errors.push(`KNOWN_TENANTS must project the canonical roster module ${expectedRosterSpecifier}: ${JSON.stringify(tenantResult.projection.rosterModule)}`);
  }
  for (const unresolved of verticalResult.unresolvedEntries) errors.push(`vertical registry unresolved at line ${unresolved.line}: ${unresolved.reason}`);
  for (const unresolved of tenantResult.unresolvedEntries) errors.push(`tenant registry unresolved at line ${unresolved.line}: ${unresolved.reason}`);
  for (const { slug: key, verticalKey } of roster) {
    if (!literalEquals(verticalResult.facts[key]?.engine, 'modern')) {
      errors.push(`${key} vertical engine is not a literal modern value: ${JSON.stringify(verticalResult.facts[key]?.engine)}`);
    }
    const tenantEngine = tenantResult.facts[key]?.engine;
    if (tenantEngine?.kind !== 'absent') {
      errors.push(`${key} tenant engine must be demonstrably absent: ${JSON.stringify(tenantEngine)}`);
    }
    // The projected `vertical` is proven either as the authored literal key or
    // as the roster row's own `verticalKey`; the roster already pins the two
    // identical, so both readings are the same fact.
    const tenantVertical = tenantResult.facts[key]?.vertical;
    const verticalProven = literalEquals(tenantVertical, verticalKey)
      || (tenantVertical?.kind === 'rosterField' && tenantVertical.field === 'verticalKey');
    if (!verticalProven) {
      errors.push(`${key} tenant vertical must be the roster vertical key: ${JSON.stringify(tenantVertical)}`);
    }
  }

  const rosterEngines = [...new Set(roster.map((entry) => entry.engine))];
  if (rosterEngines.length !== 1) {
    errors.push(`first-party roster must declare exactly one engine: ${JSON.stringify(rosterEngines)}`);
  }
  const docRequirements = verticalDocumentationRequirements(roster, rosterEngines[0]);
  const documentation = {};
  for (const [name, path] of Object.entries(VERTICAL_DOCS)) {
    const text = read(path);
    documentation[name] = { path: workspacePath(path), sha256: sha256(text) };
    for (const line of docRequirements[name]) {
      if (!text.includes(line)) errors.push(`${name} documentation missing code-derived line: ${line}`);
    }
  }

  return {
    evidence: {
      classification: 'authoredInitializerProjection',
      disclaimer: 'Static projection of direct registry object-literal initializers, plus the roster-projected factory literal reached through a proven Object.freeze/Object.fromEntries/roster.map shape, plus a fail-closed same-module capability-write scan; it does not assert runtime immutability outside the authored source.',
      sourceFiles: [verticalPath, tenantPath, rosterPath].map((path) => ({ path: workspacePath(path), sha256: sha256(read(path)) })),
      declarations: {
        verticals: verticalResult.declaration,
        tenants: tenantResult.declaration,
      },
      tenantProjection: tenantResult.projection,
      verticals: verticalResult.facts,
      tenants: tenantResult.facts,
      documentation,
    },
    errors,
    inputFiles: [verticalPath, tenantPath, rosterPath, ...Object.values(VERTICAL_DOCS)],
  };
}

function collectSkinSelectors(paths) {
  const refs = new Map();
  const errors = [];
  for (const path of paths) {
    let root;
    try {
      root = postcss.parse(read(path), { from: path });
    } catch (error) {
      errors.push(`${workspacePath(path)}: CSS parse failure: ${error.reason ?? error.message}`);
      continue;
    }
    root.walkRules((rule) => {
      for (const match of rule.selector.matchAll(/\[data-part\s*=\s*(?:(['"])([a-z0-9-]+)\1|([a-z0-9-]+))\]/gi)) {
        const part = match[2] ?? match[3];
        const list = refs.get(part) ?? [];
        list.push({ path: workspacePath(path), line: rule.source?.start?.line ?? 0 });
        refs.set(part, list);
      }
    });
  }
  return { refs, errors };
}

function parseDataPartDocumentation() {
  const lines = read(DATA_PART_DOC).split('\n');
  const entries = [];
  let section = null;
  let componentPaths = [];
  let inDataPartTable = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##\s+/.test(line)) {
      section = line.replace(/^##\s+/, '').trim();
      componentPaths = [];
      inDataPartTable = false;
      continue;
    }
    if (!section) continue;
    for (const match of line.matchAll(/`((?:primitives|patterns|structures|surfaces)\/[A-Za-z0-9_./-]+)`/g)) {
      const path = match[1].replace(/[.,;:]$/, '');
      if (!path.includes('/skin/') && !componentPaths.includes(path)) componentPaths.push(path);
    }
    if (line.startsWith('|')) {
      const first = (line.split('|')[1] ?? '').replace(/[`*_\s]/g, '').toLowerCase();
      if (first === 'data-part') {
        inDataPartTable = true;
        continue;
      }
    } else if (line.trim() === '') {
      inDataPartTable = false;
    }
    if (!inDataPartTable || !line.startsWith('|') || !line.includes('`') || componentPaths.length === 0) continue;
    const firstCell = line.split('|')[1] ?? '';
    for (const match of firstCell.matchAll(/`([a-z0-9][a-z0-9-]*)`/gi)) {
      entries.push({ section, part: match[1], line: index + 1, componentPaths: [...componentPaths] });
    }
  }
  return entries;
}

function declarativeOwnerSegment(segment) {
  return segment
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

export function componentDirectoryFromDoc(path) {
  const clean = path.replace(/^components\//, '').replace(/\.(?:ts|tsx)$/, '');
  const parts = clean.split('/').map(declarativeOwnerSegment);
  if (['primitives', 'patterns'].includes(parts[0])) {
    const candidate = join(COMPONENTS, ...parts.slice(0, 3));
    return existsSync(candidate) && statSync(candidate).isDirectory() ? candidate : null;
  }
  if (['structures', 'surfaces'].includes(parts[0])) {
    for (let length = parts.length; length >= 2; length -= 1) {
      const candidate = join(COMPONENTS, ...parts.slice(0, length));
      if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate;
    }
  }
  return null;
}

function engineForPath(path) {
  if (/\/engines\/modern(?:\/|\.)/.test(path)) return 'modern';
  if (/\/engines\/rustic(?:\/|\.)/.test(path)) return 'rustic';
  if (/\/engines\/classic(?:\/|\.)/.test(path)) return 'classic';
  return 'shared';
}

export function evaluateDataPartUnresolved(unresolved) {
  if (!Array.isArray(unresolved)) {
    return { ok: false, errors: ['data-part unresolved evidence must be an array'] };
  }
  if (unresolved.length === 0) return { ok: true, errors: [] };
  const examples = unresolved
    .slice()
    .sort((left, right) =>
      String(left.path).localeCompare(String(right.path)) ||
      Number(left.line ?? 0) - Number(right.line ?? 0) ||
      String(left.syntax).localeCompare(String(right.syntax)))
    .slice(0, 5)
    .map((finding) => `${finding.path}:${finding.line}:${finding.syntax}`)
    .join(', ');
  return {
    ok: false,
    errors: [`${unresolved.length} unresolved governed data-part sinks remain${examples ? ` (${examples})` : ''}`],
  };
}

function measureDataParts() {
  const skinFiles = SKIN_DIRS.flatMap((dir) => walkFiles(dir, (path) => path.endsWith('.css')));
  const selectors = collectSkinSelectors(skinFiles);
  const documented = parseDataPartDocumentation();
  const documentedParts = [...new Set(documented.map(({ part }) => part))].sort();
  const skinSelectorCorpus = Object.fromEntries(documentedParts.map((part) => [
    part,
    (selectors.refs.get(part) ?? []).sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line),
  ]));
  const cache = new Map();
  const evidence = [];
  const errors = [...selectors.errors];

  for (const entry of documented) {
    const directories = [...new Set(entry.componentPaths.map(componentDirectoryFromDoc).filter(Boolean))];
    const stamps = [];
    for (const directory of directories) {
      if (!cache.has(directory)) {
        const files = walkFiles(directory, (path) => PRODUCTION_SOURCE_RE.test(path) && !SOURCE_EXCLUDE_RE.test(normalizePath(path)));
        const analyzed = files.map((path) => {
          const result = collectDataPartStampsFromText(read(path), workspacePath(path));
          return { path, ...result };
        });
        cache.set(directory, analyzed);
      }
      stamps.push(...cache.get(directory).flatMap((result) => result.stamps).filter((stamp) => stamp.part === entry.part));
    }
    const uniqueStamps = [...new Map(stamps.map((stamp) => [`${stamp.path}:${stamp.line}:${stamp.syntax}`, stamp])).values()]
      .sort((a, b) => a.path.localeCompare(b.path) || a.line - b.line);
    if (uniqueStamps.length === 0) {
      errors.push(`${entry.section}.${entry.part} (doc line ${entry.line}) has no component-scoped static data-part source stamp`);
    }
    evidence.push({
      section: entry.section,
      part: entry.part,
      documentationLine: entry.line,
      engines: [...new Set(uniqueStamps.map((stamp) => engineForPath(stamp.path)))].sort(),
      sourceStamps: uniqueStamps,
      skinSelectorCorpusKey: entry.part,
      skinSelectorCount: skinSelectorCorpus[entry.part].length,
    });
  }

  const analyzedFiles = [...new Set([...cache.values()].flatMap((records) => records.map((record) => record.path)))].sort();
  const unresolvedStaticSinks = [...cache.values()].flatMap((records) => records.flatMap((record) => record.unresolved));
  const unresolvedEvaluation = evaluateDataPartUnresolved(unresolvedStaticSinks);
  errors.push(...unresolvedEvaluation.errors);
  return {
    evidence: {
      classification: 'STATIC-CANONICAL-SOURCE-EVIDENCE',
      disclaimer: 'Deterministic source evidence from finite intrinsic JSX, audited canonical DOM forwarders, or the canonical helper; not runtime route/mount or anatomy-completeness proof.',
      acceptedSinkKinds: ['intrinsic-dom', 'canonical-forwarder', 'canonical-helper'],
      documentation: { path: workspacePath(DATA_PART_DOC), sha256: sha256(read(DATA_PART_DOC)) },
      documentedEntries: evidence.length,
      inspectedSourceFiles: analyzedFiles.length,
      unresolvedStaticSinks,
      unresolvedPolicy: unresolvedEvaluation,
      skinSelectorCorpus,
      entries: evidence,
    },
    errors,
    inputFiles: [DATA_PART_DOC, ...analyzedFiles, ...skinFiles],
  };
}

function loadStaleCorpus() {
  const config = JSON.parse(read(STALE_CORPUS_PATH));
  const allowedKeys = new Set([
    'schemaVersion',
    'typescriptRoots',
    'cssRoots',
  ]);
  // `authoredExtensionRoots` scanned the `_source/extension.css` drain, which no
  // longer has a single file. A retired key must be REMOVED rather than left
  // pointing at an empty root: a corpus key that silently contributes nothing
  // reads as coverage the gate does not have.
  const retiredKeys = new Set(['authoredExtensionRoots']);
  const errors = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('GAT-07 stale corpus must be an object');
  }
  for (const key of retiredKeys) {
    if (Object.hasOwn(config, key)) errors.push(`retired stale-corpus key ${key} must be removed`);
  }
  for (const key of unknownKeys(config, allowedKeys)) {
    if (!retiredKeys.has(key)) errors.push(`unknown stale-corpus key ${key}`);
  }
  if (config.schemaVersion !== 3) errors.push('stale-corpus schemaVersion must be 3');

  const resolveEntries = (key, expectedKind, extension = null) => {
    const entries = config[key];
    if (!Array.isArray(entries) || entries.length === 0) {
      errors.push(`stale-corpus ${key} must be a non-empty array`);
      return [];
    }
    const paths = [];
    const seen = new Set();
    for (const entry of entries) {
      if (typeof entry !== 'string' || entry.length === 0 || entry.startsWith('/')) {
        errors.push(`stale-corpus ${key} contains an invalid workspace-relative path`);
        continue;
      }
      const path = resolve(UI_ROOT, entry);
      if (path === UI_ROOT || !path.startsWith(`${UI_ROOT}${sep}`)) {
        errors.push(`stale-corpus ${key} escapes the UI repository: ${entry}`);
        continue;
      }
      if (seen.has(path)) {
        errors.push(`stale-corpus ${key} repeats ${entry}`);
        continue;
      }
      seen.add(path);
      if (!existsSync(path)) {
        errors.push(`stale-corpus ${key} path is missing: ${entry}`);
        continue;
      }
      const real = realpathSync(path);
      const realRoot = realpathSync(UI_ROOT);
      if (real === realRoot || !real.startsWith(`${realRoot}${sep}`)) {
        errors.push(`stale-corpus ${key} resolves outside the UI repository: ${entry}`);
        continue;
      }
      const stats = statSync(path);
      if ((expectedKind === 'directory' && !stats.isDirectory()) || (expectedKind === 'file' && !stats.isFile())) {
        errors.push(`stale-corpus ${key} path has the wrong kind: ${entry}`);
        continue;
      }
      if (extension && !path.endsWith(extension)) {
        errors.push(`stale-corpus ${key} path must end in ${extension}: ${entry}`);
        continue;
      }
      paths.push(path);
    }
    return paths.sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
  };

  const resolveTypescriptRoots = () => {
    if (!Array.isArray(config.typescriptRoots) || config.typescriptRoots.length === 0) {
      errors.push('stale-corpus typescriptRoots must be a non-empty array');
      return [];
    }
    const roots = [];
    const seen = new Set();
    for (const entry of config.typescriptRoots) {
      if (
        !entry || typeof entry !== 'object' || Array.isArray(entry) ||
        Object.keys(entry).some((key) => !['path', 'includeTests'].includes(key)) ||
        typeof entry.path !== 'string' || entry.path.length === 0 || entry.path.startsWith('/') ||
        typeof entry.includeTests !== 'boolean'
      ) {
        errors.push('stale-corpus typescriptRoots entries require only { path, includeTests }');
        continue;
      }
      const path = resolve(UI_ROOT, entry.path);
      if (path === UI_ROOT || !path.startsWith(`${UI_ROOT}${sep}`) || seen.has(path)) {
        errors.push(`stale-corpus typescriptRoots contains an escaping/duplicate path: ${entry.path}`);
        continue;
      }
      seen.add(path);
      if (!existsSync(path) || !statSync(path).isDirectory()) {
        errors.push(`stale-corpus typescriptRoots directory is missing: ${entry.path}`);
        continue;
      }
      const real = realpathSync(path);
      const realRoot = realpathSync(UI_ROOT);
      if (real === realRoot || !real.startsWith(`${realRoot}${sep}`)) {
        errors.push(`stale-corpus typescriptRoots resolves outside the UI repository: ${entry.path}`);
        continue;
      }
      roots.push({ path, includeTests: entry.includeTests });
    }
    return roots.sort((a, b) => normalizePath(a.path).localeCompare(normalizePath(b.path)));
  };

  const corpus = {
    typescriptRoots: resolveTypescriptRoots(),
    cssRoots: resolveEntries('cssRoots', 'directory'),
  };
  if (errors.length > 0) throw new Error(`invalid GAT-07 stale corpus:\n- ${errors.join('\n- ')}`);
  return corpus;
}

export function discoverStaleTypescriptFiles(roots) {
  return [...new Set(roots.flatMap(({ path, includeTests }) => walkFiles(
    path,
    (candidate) => PRODUCTION_SOURCE_RE.test(candidate) &&
      (includeTests || !SOURCE_EXCLUDE_RE.test(normalizePath(candidate))),
  )))].sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
}

function measureStaleComments() {
  const corpus = loadStaleCorpus();
  const tsFiles = discoverStaleTypescriptFiles(corpus.typescriptRoots);
  const cssFiles = corpus.cssRoots
    .flatMap((dir) => walkFiles(dir, (path) => path.endsWith('.css')))
    .sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
  const cssRecords = cssFiles.map((path) => ({ path: workspacePath(path), text: read(path), kind: 'css' }));
  const commentRecords = [
    ...tsFiles.map((path) => {
      const text = read(path);
      return {
        path: workspacePath(path),
        text,
        kind: 'typescript',
        inlinePaintCount: countArc09PaintInFile(text, workspacePath(path)),
      };
    }),
    ...cssRecords,
  ];
  const comments = findStaleClaimsInRecords(commentRecords);
  // The universal-border-floor law now reads the AUTHORED CSS corpus. It used to
  // read the retired `_source/extension.css` drain, which is down to zero files,
  // so the law was being asserted over nothing.
  const floors = analyzeTenantFloorCssRecords(
    cssRecords.map(({ path, text }) => ({ path, text })),
  );
  const errors = [];
  if (comments.staleInline.length > 0) errors.push(`${comments.staleInline.length} stale inline-paint comments remain`);
  if (comments.falseTenantFloor.length > 0) errors.push(`${comments.falseTenantFloor.length} false fleet-wide tenant-floor comments remain`);
  for (const error of [...comments.parseErrors, ...floors.parseErrors]) errors.push(`${error.path}: ${error.message}`);
  if (floors.floors.length !== 0 || floors.owners.length !== 0) {
    errors.push(`universal tenant border floors are forbidden; found ${JSON.stringify(floors)}`);
  }
  return {
    evidence: {
      corpus: {
        path: workspacePath(STALE_CORPUS_PATH),
        sha256: sha256(read(STALE_CORPUS_PATH)),
        typescriptRoots: corpus.typescriptRoots.map(({ path, includeTests }) => ({
          path: workspacePath(path),
          includeTests,
        })),
        typescriptFiles: tsFiles.length,
        cssRoots: corpus.cssRoots.map(workspacePath),
        cssFiles: cssFiles.length,
      },
      staleInline: comments.staleInline,
      evidencedInline: comments.evidencedInline,
      falseTenantFloor: comments.falseTenantFloor,
      authoredFloorOwners: floors,
    },
    errors,
    inputFiles: [STALE_CORPUS_PATH, ...tsFiles, ...cssFiles],
  };
}

function runPaintAudit() {
  const result = spawnSync(process.execPath, [AUDIT_PATH, '--check', '--quiet'], {
    cwd: UI_ROOT,
    encoding: 'utf8',
    timeout: 120_000,
  });
  if (result.status !== 0) throw new Error(`engine-token-audit failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
}

/**
 * A sealed reference/claim document is exact only when its worktree bytes hash
 * identically to the bytes committed at the sealed documentation revision. Any
 * edit — a drifted showroom stats row, a reverted engine-modern work-order count
 * — changes the hash and must be rejected until the document is re-reviewed and
 * re-sealed. A non-string input (e.g. a missing git object) never matches.
 */
export function sealedDocumentationContentMatches(revisionContent, worktreeContent) {
  return typeof revisionContent === 'string'
    && typeof worktreeContent === 'string'
    && sha256(revisionContent) === sha256(worktreeContent);
}

/**
 * The revision CI hands this gate must BE the reviewed seal.
 *
 * The workflow checks docs-engineering out at a pinned ref and exports it as
 * `DOCS_ENGINEERING_ROOT`; this gate then refuses any checkout whose HEAD is
 * not `documentationRevision`. Those two numbers were different -- the workflow
 * pinned an ancestor of the sealed commit -- so the gate could only ever have
 * been red in CI, and nothing in the repository said so. The seal is the
 * reviewed authority, so the workflow follows it, and this check keeps them
 * equal by construction rather than by memory.
 */
export function evaluateDocumentationCheckoutPin(workflowText, sealedRevision) {
  if (typeof workflowText !== 'string' || workflowText.length === 0) {
    return { ok: false, pinned: null, errors: ['the CI workflow is unreadable; the documentation pin cannot be verified'] };
  }
  const pins = [...workflowText.matchAll(
    /repository:\s*rottay\/docs-engineering[\s\S]{0,400}?\n\s*ref:\s*([0-9a-fA-F]{7,40})/g,
  )].map((match) => match[1].toLowerCase());
  if (pins.length === 0) {
    return { ok: false, pinned: null, errors: ['the CI workflow declares no pinned docs-engineering checkout'] };
  }
  const mismatched = [...new Set(pins)].filter((pin) => pin !== sealedRevision);
  if (mismatched.length > 0) {
    return {
      ok: false,
      pinned: pins,
      errors: mismatched.map((pin) =>
        `CI checks out docs-engineering ${pin} but the reviewed seal is ${sealedRevision}; the workflow must follow the seal`),
    };
  }
  return { ok: true, pinned: pins, errors: [] };
}

function validateDocumentationSeal(documentPaths) {
  const seal = JSON.parse(read(DOCUMENTATION_SEAL_PATH));
  const errors = [];
  if (seal.schemaVersion !== 1) errors.push('documentation seal schemaVersion must be 1');
  if (seal.requirementsRevision !== REQUIREMENTS_REVISION) {
    errors.push(`requirementsRevision must remain ${REQUIREMENTS_REVISION}`);
  }
  // The inspected-document count is DERIVED from the documents this run
  // actually inspected. A literal count here would drift the moment a doc joins
  // or leaves the inspected set, and would read as a target instead of an
  // observation.
  const docsPaths = [...new Set(documentPaths)]
    .filter((candidate) => candidate.startsWith(`${DOCS_ROOT}${sep}`))
    .sort();
  const relativeDocsPaths = docsPaths.map((path) => normalizePath(relative(DOCS_ROOT, path)));
  if (seal.documentationRevision === null) {
    errors.push(`documentationRevision is unsealed; commit the ${docsPaths.length} inspected docs, set their implementation commit, then regenerate the artifact`);
  } else if (!/^[0-9a-f]{40}$/.test(seal.documentationRevision ?? '')) {
    errors.push('documentationRevision must be a full 40-character Git commit');
  } else {
    errors.push(...evaluateDocumentationCheckoutPin(
      existsSync(CI_WORKFLOW_PATH) ? read(CI_WORKFLOW_PATH) : '',
      seal.documentationRevision,
    ).errors);
    const head = spawnSync('git', ['rev-parse', 'HEAD'], {
      cwd: DOCS_ROOT,
      encoding: 'utf8',
    });
    if (head.status !== 0) {
      errors.push('documentation checkout has no readable Git HEAD');
    } else if (head.stdout.trim() !== seal.documentationRevision) {
      errors.push(`documentation checkout HEAD ${head.stdout.trim()} does not equal sealed revision ${seal.documentationRevision}`);
    }
    const diff = spawnSync(
      'git',
      ['diff', '--quiet', '--no-ext-diff', seal.documentationRevision, '--', ...relativeDocsPaths],
      { cwd: DOCS_ROOT, encoding: 'utf8' },
    );
    if (diff.status !== 0) {
      errors.push(`inspected documentation worktree is not exact at ${seal.documentationRevision}`);
    }
    for (const path of docsPaths) {
      const relativePath = normalizePath(relative(DOCS_ROOT, path));
      const result = spawnSync('git', ['show', `${seal.documentationRevision}:${relativePath}`], {
        cwd: DOCS_ROOT,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
      });
      if (result.status !== 0) {
        errors.push(`documentationRevision does not contain ${relativePath}`);
      } else if (!sealedDocumentationContentMatches(result.stdout, read(path))) {
        errors.push(`${relativePath} does not match documentationRevision ${seal.documentationRevision}`);
      }
    }
  }
  return {
    seal: {
      path: workspacePath(DOCUMENTATION_SEAL_PATH),
      requirementsRevision: seal.requirementsRevision,
      documentationRevision: seal.documentationRevision,
      inspectedDocsMatchRevision: errors.length === 0,
    },
    errors,
  };
}

function canonicalJsonValue(value) {
  if (Array.isArray(value)) return value.map(canonicalJsonValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalJsonValue(value[key])]),
    );
  }
  return value;
}

export function projectGat07RegistryDefinition(registry) {
  if (!registry || typeof registry !== 'object' || Array.isArray(registry) || !Array.isArray(registry.workOrders)) {
    throw new Error('roadmap registry must contain a workOrders array');
  }
  const matching = registry.workOrders.filter((workOrder) => workOrder?.id === 'WO-GAT-07');
  if (matching.length !== 1) throw new Error(`roadmap registry must contain exactly one WO-GAT-07; found ${matching.length}`);
  const workOrder = matching[0];
  const missing = GAT07_STATIC_REGISTRY_FIELDS.filter((field) => !Object.hasOwn(workOrder, field));
  if (missing.length > 0) throw new Error(`WO-GAT-07 static definition is missing: ${missing.join(', ')}`);
  return canonicalJsonValue(Object.fromEntries(
    GAT07_STATIC_REGISTRY_FIELDS.map((field) => [field, workOrder[field]]),
  ));
}

function toolchainEvidence() {
  const rootPackage = JSON.parse(read(ROOT_PACKAGE_PATH));
  const corePackage = JSON.parse(read(CORE_PACKAGE_PATH));
  const lock = read(PNPM_LOCK_PATH);
  const workflow = read(CI_PATH);
  const nodeMatch = workflow.match(/^\s*NODE_VERSION:\s*['"]?(\d+)['"]?\s*$/m);
  if (!nodeMatch) throw new Error('GAT-07 cannot derive the CI Node major from NODE_VERSION');
  const nodeMajor = Number(nodeMatch[1]);
  const runtimeNodeMajor = Number(process.versions.node.split('.')[0]);
  const typescriptVersion = ts.version;
  const postcssVersion = postcss().version;
  const errors = [];
  if (runtimeNodeMajor !== nodeMajor) errors.push(`runtime Node major ${runtimeNodeMajor} != CI Node major ${nodeMajor}`);
  if (!lock.includes(`version: ${typescriptVersion}`)) errors.push(`pnpm lock does not pin TypeScript ${typescriptVersion}`);
  if (!lock.includes(`version: ${postcssVersion}`)) errors.push(`pnpm lock does not pin PostCSS ${postcssVersion}`);
  if (errors.length > 0) throw new Error(`GAT-07 toolchain is not reproducibly pinned:\n- ${errors.join('\n- ')}`);
  return {
    node: {
      authority: 'ci.NODE_VERSION',
      requiredMajor: nodeMajor,
      runtimeMajorCompatible: true,
    },
    pnpm: {
      authority: 'root.packageManager+pnpm-lock.yaml',
      packageManager: rootPackage.packageManager,
      frozenLockfile: true,
    },
    typescript: {
      authority: 'core.package.json+pnpm-lock.yaml',
      specifier: corePackage.devDependencies?.typescript ?? corePackage.dependencies?.typescript ?? null,
      resolvedVersion: typescriptVersion,
    },
    postcss: {
      authority: 'core.package.json+pnpm-lock.yaml',
      specifier: corePackage.devDependencies?.postcss ?? corePackage.dependencies?.postcss ?? null,
      resolvedVersion: postcssVersion,
    },
  };
}

export function buildInputManifest(roleGroups, virtualInputs = []) {
  const files = new Map();
  for (const [role, paths] of Object.entries(roleGroups)) {
    for (const path of [...new Set(paths)].sort()) {
      const entry = files.get(path) ?? new Set();
      entry.add(role);
      files.set(path, entry);
    }
  }
  const entries = [...files.entries()].map(([path, roles]) => {
    const content = read(path);
    return {
      path: workspacePath(path),
      roles: [...roles].sort(),
      bytes: Buffer.byteLength(content),
      sha256: sha256(content),
    };
  });
  for (const input of virtualInputs) {
    if (!input || typeof input.path !== 'string' || !Array.isArray(input.roles) || typeof input.content !== 'string') {
      throw new Error('GAT-07 virtual manifest inputs require { path, roles, content }');
    }
    entries.push({
      path: input.path,
      roles: [...new Set(input.roles)].sort(),
      bytes: Buffer.byteLength(input.content),
      sha256: sha256(input.content),
    });
  }
  entries.sort((a, b) => a.path.localeCompare(b.path) || a.roles.join('\0').localeCompare(b.roles.join('\0')));
  return {
    algorithm: 'sha256(relevant-input-path+roles+bytes+content-sha)-v2',
    entries,
    digest: sha256(JSON.stringify(entries)),
  };
}

function machineryFiles() {
  return walkFiles(HERE, (path) => ['.mjs', '.json'].includes(extname(path)));
}

function broadAuditInputFiles() {
  const coreInputs = walkFiles(join(CORE_ROOT, 'src'), (path) => ['.ts', '.tsx', '.css', '.json'].includes(extname(path)));
  const styles = walkFiles(join(CORE_ROOT, 'artifacts/generated/css'), (path) => path.endsWith('.css'));
  return [...coreInputs, ...styles];
}

function buildSemanticEvidence({ allowUnsealedDocumentation = false } = {}) {
  const toolchain = toolchainEvidence();
  const workOrderDefinition = projectGat07RegistryDefinition(JSON.parse(read(ROADMAP_REGISTRY_PATH)));
  const workOrderDefinitionContent = JSON.stringify(workOrderDefinition);
  const auditOutput = runPaintAudit();
  const baseline = JSON.parse(read(BASELINE_PATH));
  const baselineSummary = summarizeZeroLocks(baseline, {
    exact: ENGINE_TOKEN_EXACT,
    minimum: ENGINE_TOKEN_MINIMUM,
  });
  if (!baselineSummary.ok) throw new Error(`invalid engine baseline summary: ${baselineSummary.errors.join('; ')}`);

  const claims = measureClaims();
  const verticals = measureVerticals();
  const dataParts = measureDataParts();
  const comments = measureStaleComments();
  const errors = [...claims.errors, ...verticals.errors, ...dataParts.errors, ...comments.errors];
  if (errors.length > 0) throw new Error(`WO-GAT-07 exact-proof failed:\n- ${errors.join('\n- ')}`);

  const inspectedDocs = [
    ...CLAIM_DOCS.map(({ path }) => path),
    ...Object.values(VERTICAL_DOCS),
    ...Object.values(SEALED_REFERENCE_DOCS),
    DATA_PART_DOC,
  ];
  const documentation = validateDocumentationSeal(inspectedDocs);
  if (documentation.errors.length > 0 && !allowUnsealedDocumentation) {
    throw new Error(`WO-GAT-07 documentation sealing required:\n- ${documentation.errors.join('\n- ')}`);
  }

  const inputManifest = buildInputManifest({
    'audit-machinery': machineryFiles(),
    'audit-input': broadAuditInputFiles(),
    'claim-census': claims.inputFiles,
    'vertical-facts': verticals.inputFiles,
    'data-part-corpus': dataParts.inputFiles,
    'stale-claim-corpus': comments.inputFiles,
    'documentation-seal': [DOCUMENTATION_SEAL_PATH, ...inspectedDocs],
    'gate-wiring': [CI_PATH, join(UI_ROOT, '.gitignore'), CORE_PACKAGE_PATH],
    'workspace-toolchain': [ROOT_PACKAGE_PATH, CORE_PACKAGE_PATH, PNPM_LOCK_PATH, PNPM_WORKSPACE_PATH, CI_PATH],
  }, [{
    path: 'ui-design-system/roadmap/registry.json#WO-GAT-07/static-definition',
    roles: ['work-order-definition'],
    content: workOrderDefinitionContent,
  }]);

  return {
    schemaVersion: 3,
    authority: 'WO-GAT-07',
    scope: 'Phase-0 exact proof and minimal public-claim floor; not DS-IMP-060 completion',
    reproducibility: {
      classification: 'deterministic same-input runs',
      authorityDigest: inputManifest.digest,
      sourceHeadIsAuthority: false,
      toolchain,
    },
    workOrderDefinition: {
      path: 'ui-design-system/roadmap/registry.json#WO-GAT-07/static-definition',
      mutableLifecycleFieldsExcluded: ['status', 'progressLog', 'claimedBy', 'claimedAt', 'doneAt', 'evidence'],
      projection: workOrderDefinition,
      sha256: sha256(workOrderDefinitionContent),
    },
    documentationAuthority: {
      ...documentation.seal,
      sealed: documentation.errors.length === 0,
      sealingErrors: documentation.errors,
    },
    inputManifest,
    paintAudit: {
      output: auditOutput,
      baseline: { path: workspacePath(BASELINE_PATH), sha256: sha256(read(BASELINE_PATH)), ...baselineSummary },
      governance: {
        exact: ENGINE_TOKEN_EXACT,
        minimum: ENGINE_TOKEN_MINIMUM,
        zeroIsPermanent: true,
        positiveBaselineAboveCurrentZeroRejected: true,
        updateCanOnlyDecreaseExistingKeys: true,
        deletedOrUnbaselinedCounterRejected: true,
      },
    },
    publicClaims: claims.evidence,
    verticalFacts: verticals.evidence,
    dataPartEvidence: dataParts.evidence,
    staleClaimGates: comments.evidence,
  };
}

function semanticHash(evidence) {
  return sha256(JSON.stringify(evidence));
}

function buildArtifact(options) {
  const first = buildSemanticEvidence(options);
  const second = buildSemanticEvidence(options);
  const hashes = [semanticHash(first), semanticHash(second)];
  if (hashes[0] !== hashes[1]) throw new Error(`two deterministic runs disagree: ${hashes.join(' != ')}`);
  return {
    artifact: { ...first, deterministicRuns: { count: 2, hashes, agree: true } },
    semanticHash: hashes[0],
  };
}

function writeAtomic(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, content);
  renameSync(temporary, path);
}

function printDocumentationAllowlist() {
  const floor = JSON.parse(read(CLAIM_FLOOR_PATH));
  const inventory = buildClaimDocumentationInventory(
    claimDocumentationRecords(),
    CANONICAL_DOC_MARKERS,
    generatedClaimDocumentationTemplates(floor),
  );
  const allowlist = {
    schemaVersion: inventory.schemaVersion,
    algorithm: inventory.algorithm,
    documents: Object.fromEntries(Object.entries(inventory.documents).map(([path, document]) => [
      path,
      {
        claims: document.claims,
        blocks: document.blocks.map(({ claimId, sha256: hash }) => ({ claimId, sha256: hash })),
      },
    ])),
  };
  process.stdout.write(`${JSON.stringify(allowlist, null, 2)}\n`);
}

/**
 * The archive, hashed as bytes. Historical evidence is a fact about a file, so
 * it is pinned as a file: two sha256 values and the semantic hash the archive
 * recorded for itself. Nothing here parses it for meaning.
 */
export function readSealedArchive() {
  if (!existsSync(ARCHIVE_EVIDENCE_PATH) || !existsSync(ARCHIVE_DIGEST_PATH)) return null;
  const evidence = readFileSync(ARCHIVE_EVIDENCE_PATH);
  const digest = readFileSync(ARCHIVE_DIGEST_PATH);
  return {
    evidenceSha256: sha256(evidence),
    digestSha256: sha256(digest),
    semanticHash: digest.toString('utf8').trim(),
    inputs: JSON.parse(evidence.toString('utf8')).inputManifest?.entries ?? [],
  };
}

/**
 * Where the archive and the live tree disagree, input by input. This is the
 * bridge between the two owners: it is what stops the live proof from being a
 * fresh start that forgets the seal, and it reproduces on every run, so a
 * changed divergence is a red until the record is regenerated.
 */
export function diffInputManifests(archiveInputs, liveInputs) {
  const byPath = (rows) => new Map(rows.map((row) => [row.path, row]));
  const archive = byPath(archiveInputs);
  const live = byPath(liveInputs);
  const rows = [];
  for (const path of [...new Set([...archive.keys(), ...live.keys()])].sort()) {
    const a = archive.get(path);
    const b = live.get(path);
    if (a && b && a.sha256 === b.sha256) continue;
    rows.push({
      path,
      archive: a ? { bytes: a.bytes ?? null, sha256: a.sha256 ?? null } : null,
      live: b ? { bytes: b.bytes ?? null, sha256: b.sha256 ?? null } : null,
    });
  }
  return rows;
}

function buildProvenance(result, archive) {
  return {
    schemaVersion: 1,
    authority: 'WO-GAT-07',
    _comment:
      'The live proof and the sealed archive, side by side. `exactness/` is never written by this ' +
      'gate: it is the record of what WO-GAT-07 measured on its own day, kept byte-exact. This file ' +
      'names every input the two disagree on, so the archive stays visible rather than superseded in ' +
      'silence, and so a drifted divergence reddens the gate instead of passing unnoticed.',
    sealedArchive: {
      evidence: workspacePath(ARCHIVE_EVIDENCE_PATH),
      digest: workspacePath(ARCHIVE_DIGEST_PATH),
      evidenceSha256: archive?.evidenceSha256 ?? null,
      digestSha256: archive?.digestSha256 ?? null,
      semanticHash: archive?.semanticHash ?? null,
    },
    live: {
      evidence: workspacePath(LIVE_EVIDENCE_PATH),
      digest: workspacePath(LIVE_DIGEST_PATH),
      semanticHash: result.semanticHash,
    },
    divergentInputs: diffInputManifests(archive?.inputs ?? [], result.artifact.inputManifest.entries),
  };
}

function main() {
  if (process.argv.includes('--print-doc-allowlist')) {
    printDocumentationAllowlist();
    return;
  }
  const allowUnsealedDocumentation = process.argv.includes('--allow-unsealed-documentation');
  if (allowUnsealedDocumentation && (process.argv.includes('--write') || process.argv.includes('--check-artifact'))) {
    throw new Error('--allow-unsealed-documentation is diagnostic-only and cannot write/check authoritative artifacts');
  }
  const result = buildArtifact({ allowUnsealedDocumentation });
  const artifactBytes = `${JSON.stringify(result.artifact, null, 2)}\n`;
  const hashBytes = `${result.semanticHash}\n`;
  const archiveBefore = readSealedArchive();
  if (archiveBefore === null) {
    throw new Error(`WO-GAT-07 sealed archive is missing: ${workspacePath(ARCHIVE_EVIDENCE_PATH)}`);
  }
  const provenanceBytes = `${JSON.stringify(buildProvenance(result, archiveBefore), null, 2)}\n`;
  if (process.argv.includes('--write')) {
    writeAtomic(LIVE_EVIDENCE_PATH, artifactBytes);
    writeAtomic(LIVE_DIGEST_PATH, hashBytes);
    writeAtomic(LIVE_PROVENANCE_PATH, provenanceBytes);
    const archiveAfter = readSealedArchive();
    if (
      archiveAfter.evidenceSha256 !== archiveBefore.evidenceSha256 ||
      archiveAfter.digestSha256 !== archiveBefore.digestSha256
    ) {
      throw new Error('WO-GAT-07 sealed archive changed during a live write; the archive is read-only');
    }
  }
  if (process.argv.includes('--check-artifact')) {
    // The archive is checked FIRST and by itself. A tampered archive would also
    // move `provenanceBytes` and would otherwise be reported as a stale live
    // proof -- the true error, under the wrong name.
    if (existsSync(LIVE_PROVENANCE_PATH)) {
      const recorded = JSON.parse(readFileSync(LIVE_PROVENANCE_PATH, 'utf8')).sealedArchive;
      if (
        recorded.evidenceSha256 !== archiveBefore.evidenceSha256 ||
        recorded.digestSha256 !== archiveBefore.digestSha256
      ) {
        throw new Error(
          `WO-GAT-07 sealed archive no longer hashes to the bytes the live proof recorded: ${workspacePath(ARCHIVE_EVIDENCE_PATH)}; the archive is historical evidence and is not rewritten`,
        );
      }
    }
    const mismatches = [];
    for (const [path, bytes] of [
      [LIVE_EVIDENCE_PATH, artifactBytes],
      [LIVE_DIGEST_PATH, hashBytes],
      [LIVE_PROVENANCE_PATH, provenanceBytes],
    ]) {
      if (!existsSync(path) || readFileSync(path, 'utf8') !== bytes) mismatches.push(workspacePath(path));
    }
    if (mismatches.length > 0) {
      throw new Error(`WO-GAT-07 live proof is stale/missing: ${mismatches.join(', ')}; run claim-exactness:write`);
    }
  }
  console.log(
    `WO-GAT-07 exact proof ${allowUnsealedDocumentation ? 'DIAGNOSTIC-UNSEALED' : 'OK'} — 2 deterministic runs agree (${result.semanticHash}); ${result.artifact.paintAudit.baseline.counters} counters / ${result.artifact.paintAudit.baseline.zeroLocked} exact zeros; ${result.artifact.dataPartEvidence.documentedEntries} documented data-part entries`,
  );
  if (allowUnsealedDocumentation) {
    console.log(`UNSEALED: ${result.artifact.documentationAuthority.sealingErrors.join('; ')}`);
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();

export {
  buildSemanticEvidence,
  measureClaims,
  measureDataParts,
  measureStaleComments,
  measureVerticals,
  semanticHash,
};
