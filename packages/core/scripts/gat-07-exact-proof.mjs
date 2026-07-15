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

import { summarizeZeroLocks } from './lib/zero-lock-policy.mjs';
import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import {
  ENGINE_TOKEN_EXACT,
  ENGINE_TOKEN_MINIMUM,
} from './lib/engine-token-governance.mjs';
import {
  analyzeClaimSourceRecords,
  analyzeTenantFloorCssRecords,
  buildClaimDocumentationInventory,
  collectDataPartStampsFromText,
  extractRegistryFactsFromText,
  findStaleClaimsInRecords,
  validateClaimDocumentationInventory,
} from './lib/gat-07-static-analysis.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(HERE, '..');
const UI_ROOT = resolve(CORE_ROOT, '../..');
const WORKSPACE_ROOT = resolve(UI_ROOT, '..');
const DOCS_ROOT = resolve(
  process.env.DOCS_ENGINEERING_ROOT || join(WORKSPACE_ROOT, 'docs-engineering'),
);
const COMPONENTS = join(CORE_ROOT, 'src/components');
const CLAIM_FLOOR_PATH = join(HERE, 'gat-07-public-claim-floor.json');
const CLAIM_DOC_ALLOWLIST_PATH = join(HERE, 'gat-07-doc-claim-allowlist.json');
const DOCUMENTATION_SEAL_PATH = join(HERE, 'gat-07-documentation-seal.json');
const STALE_CORPUS_PATH = join(HERE, 'gat-07-stale-corpus.json');
const BASELINE_PATH = join(HERE, 'engine-token-audit.baseline.json');
const AUDIT_PATH = join(HERE, 'engine-token-audit.mjs');
const DATA_PART_DOC = join(
  DOCS_ROOT,
  'engineering/design-system/runtime/skins/data-part-contracts/README.md',
);
const ARTIFACT_DIR = join(UI_ROOT, 'test-artifacts/gates/gat-07');
const ARTIFACT_PATH = join(ARTIFACT_DIR, 'semantic-evidence.json');
const HASH_PATH = join(ARTIFACT_DIR, 'semantic-hash.txt');
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
  join(CORE_ROOT, 'src/tokens/css/engines/modern/skin'),
  join(CORE_ROOT, 'src/tokens/css/engines/rustic/skin'),
  join(CORE_ROOT, 'src/tokens/css/components/skin'),
];

const CANONICAL_DOC_MARKERS = Object.freeze({
  'component-extensions': '<!-- GAT07-CLAIM component-extensions: reserved-deprecated; runtime=unimplemented; affirmative-behavior=false; owner=DS-IMP-021 -->',
  'surface-profile-overrides': '<!-- GAT07-CLAIM surface-profile-overrides: reserved-experimental; runtime=unconsumed; affirmative-behavior=false; owner=DS-IMP-022 -->',
});

const CLAIM_DOCS = [
  { path: join(CORE_ROOT, 'docs/reference/contracts/README.md'), claims: ['component-extensions'] },
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

const CLAIM_FLOOR_KEYS = new Set([
  'id',
  'symbols',
  'disposition',
  'runtimeStatus',
  'affirmativeBehaviorClaimAllowed',
  'deferredOwner',
  'definitionFiles',
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
    definitionFiles: ['src/contracts/extensions/index.ts', 'src/contracts/engine/index.ts'],
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
    disposition: 'reserved-experimental',
    runtimeStatus: 'isolated-helper-unconsumed-by-surfaces',
    deferredOwner: {
      sourceId: 'DS-IMP-022',
      owner: 'design-system-program',
      targetPhase: '2A',
      decision: 'wire each field with runtime and visual evidence or remove it',
    },
    definitionFiles: [
      'src/components/surfaces/foundation/types.ts',
      'src/components/surfaces/foundation/hooks/useSurfaceProfileDefaultsWithOverrides.ts',
      'src/components/surfaces/index.ts',
    ],
    requiredAssertions: {
      profileOverrideDeclarations: 33,
      staticallyResolvedSurfaceHookCalls: 0,
      staticallyResolvedShowroomProfileOverrideReferences: 0,
      staticallyResolvedPotentialConsumers: 0,
      unsupportedGovernedReferences: 0,
      registeredExecutableEvidence: 0,
      deprecatedMarkersMinimum: 3,
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
    if (claim.affirmativeBehaviorClaimAllowed !== false) {
      errors.push(`${claim.id}: reserved/deferred claim cannot allow affirmative behavior language`);
    }
    if (!Array.isArray(claim.productionConsumers) || claim.productionConsumers.length !== 0) {
      errors.push(`${claim.id}: Phase-0 reserved claim must have zero productionConsumers`);
    }
    if (!Array.isArray(claim.executableAssertions) || claim.executableAssertions.length !== 0) {
      errors.push(`${claim.id}: Phase-0 reserved claim must have zero executableAssertions`);
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
    for (const [assertion, expected] of Object.entries(claim.requiredAssertions ?? {})) {
      const actual = measured[assertion.replace(/Minimum$/, '')];
      if (assertion.endsWith('Minimum')) {
        if (!(actual >= expected)) errors.push(`${claim.id}.${assertion}: ${actual} < ${expected}`);
      } else if (actual !== expected) {
        errors.push(`${claim.id}.${assertion}: ${actual} != ${expected}`);
      }
    }
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
      ...coreRecords.map((record) => join(WORKSPACE_ROOT, record.path)),
      ...showroomRecords.map((record) => join(WORKSPACE_ROOT, record.path)),
      ...documentationRecords.map((record) => record.absolutePath),
    ],
  };
}

function literalEquals(state, value) {
  return state?.kind === 'literal' && state.value === value;
}

function measureVerticals() {
  const verticalPath = join(CORE_ROOT, 'src/runtime/verticals/registry.ts');
  const tenantPath = join(CORE_ROOT, 'src/runtime/tenant/registry/index.ts');
  const verticalResult = extractRegistryFactsFromText(
    read(verticalPath), workspacePath(verticalPath), 'VERTICAL_REGISTRY', ['engine', 'density', 'defaultProductProfile'],
  );
  const tenantResult = extractRegistryFactsFromText(
    read(tenantPath), workspacePath(tenantPath), 'KNOWN_TENANTS', ['engine', 'vertical'],
  );
  const errors = [];
  if (!verticalResult.declaration.readonlyTypeAnnotation) {
    errors.push(`VERTICAL_REGISTRY must retain an authored Readonly<...> type annotation: ${JSON.stringify(verticalResult.declaration.typeAnnotation)}`);
  }
  if (!tenantResult.declaration.readonlyTypeAnnotation) {
    errors.push(`KNOWN_TENANTS must retain an authored Readonly<...> type annotation: ${JSON.stringify(tenantResult.declaration.typeAnnotation)}`);
  }
  for (const unresolved of verticalResult.unresolvedEntries) errors.push(`vertical registry unresolved at line ${unresolved.line}: ${unresolved.reason}`);
  for (const unresolved of tenantResult.unresolvedEntries) errors.push(`tenant registry unresolved at line ${unresolved.line}: ${unresolved.reason}`);
  for (const key of ['platform', 'bithire', 'evnto']) {
    if (!literalEquals(verticalResult.facts[key]?.engine, 'modern')) {
      errors.push(`${key} vertical engine is not a literal modern value: ${JSON.stringify(verticalResult.facts[key]?.engine)}`);
    }
  }
  for (const key of ['rottay', 'bithire', 'evnto']) {
    if (tenantResult.facts[key]?.engine?.kind !== 'absent') {
      errors.push(`${key} tenant engine must be demonstrably absent: ${JSON.stringify(tenantResult.facts[key]?.engine)}`);
    }
  }

  const docRequirements = {
    verticals: [
      '| **Vertical preset engine** | modern | modern | modern |',
      '| **First-party tenant explicit engine** | not set | not set | not set |',
    ],
    tenancy: [
      '| `rottay` | Rottay | not set |',
      '| `bithire` | BitHire | not set |',
      '| `evnto` | Evnto | not set |',
    ],
    engines: [
      '| Classic | `classic` | Ant Design 5 (`antd`) | Stable | -- |',
      '| Modern | `modern` | Rottay-native/Tailwind bridge | Stable | Platform, BitHire, Evnto vertical presets |',
    ],
  };
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
      disclaimer: 'Static projection of direct registry object-literal initializers plus a fail-closed same-module capability-write scan; it does not assert runtime immutability outside the authored source.',
      sourceFiles: [verticalPath, tenantPath].map((path) => ({ path: workspacePath(path), sha256: sha256(read(path)) })),
      declarations: {
        verticals: verticalResult.declaration,
        tenants: tenantResult.declaration,
      },
      verticals: verticalResult.facts,
      tenants: Object.fromEntries(['rottay', 'bithire', 'evnto'].map((key) => [key, tenantResult.facts[key]])),
      documentation,
    },
    errors,
    inputFiles: [verticalPath, tenantPath, ...Object.values(VERTICAL_DOCS)],
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

function componentDirectoryFromDoc(path) {
  const clean = path.replace(/^components\//, '').replace(/\.(?:ts|tsx)$/, '');
  const parts = clean.split('/');
  if (['primitives', 'patterns'].includes(parts[0])) return join(COMPONENTS, ...parts.slice(0, 3));
  if (['structures', 'surfaces'].includes(parts[0])) {
    for (let length = parts.length; length >= 2; length -= 1) {
      const candidate = join(COMPONENTS, ...parts.slice(0, length));
      if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate;
    }
    return join(COMPONENTS, ...parts.slice(0, 3));
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
      disclaimer: 'Deterministic source evidence from finite intrinsic JSX, canonical Box/Text forwarders, or the canonical helper; not runtime route/mount or anatomy-completeness proof.',
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
    'authoredExtensionRoots',
  ]);
  const errors = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('GAT-07 stale corpus must be an object');
  }
  for (const key of unknownKeys(config, allowedKeys)) errors.push(`unknown stale-corpus key ${key}`);
  if (config.schemaVersion !== 2) errors.push('stale-corpus schemaVersion must be 2');

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
    authoredExtensionRoots: resolveEntries('authoredExtensionRoots', 'directory'),
  };
  if (errors.length > 0) throw new Error(`invalid GAT-07 stale corpus:\n- ${errors.join('\n- ')}`);
  return corpus;
}

function authoredExtensionFiles(roots) {
  return roots.flatMap((root) => walkFiles(
    root,
    (path) => normalizePath(path).endsWith('/_source/extension.css'),
  ));
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
  const extensionFiles = authoredExtensionFiles(corpus.authoredExtensionRoots);
  const cssFiles = [
    ...corpus.cssRoots.flatMap((dir) => walkFiles(dir, (path) => path.endsWith('.css'))),
    ...extensionFiles,
  ].sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
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
    ...cssFiles.map((path) => ({ path: workspacePath(path), text: read(path), kind: 'css' })),
  ];
  const comments = findStaleClaimsInRecords(commentRecords);
  const floors = analyzeTenantFloorCssRecords(
    extensionFiles.map((path) => ({ path: workspacePath(path), text: read(path) })),
  );
  const errors = [];
  if (comments.staleInline.length > 0) errors.push(`${comments.staleInline.length} stale inline-paint comments remain`);
  if (comments.falseTenantFloor.length > 0) errors.push(`${comments.falseTenantFloor.length} false fleet-wide tenant-floor comments remain`);
  for (const error of [...comments.parseErrors, ...floors.parseErrors]) errors.push(`${error.path}: ${error.message}`);
  if (floors.floors.length !== 1 || floors.owners.length !== 1 || floors.owners[0] !== 'rottay') {
    errors.push(`expected exactly one structurally parsed Rottay-only authored border floor; found ${JSON.stringify(floors)}`);
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

function validateDocumentationSeal(documentPaths) {
  const seal = JSON.parse(read(DOCUMENTATION_SEAL_PATH));
  const errors = [];
  if (seal.schemaVersion !== 1) errors.push('documentation seal schemaVersion must be 1');
  if (seal.requirementsRevision !== REQUIREMENTS_REVISION) {
    errors.push(`requirementsRevision must remain ${REQUIREMENTS_REVISION}`);
  }
  if (seal.documentationRevision === null) {
    errors.push('documentationRevision is unsealed; commit the 12 inspected docs, set their implementation commit, then regenerate the artifact');
  } else if (!/^[0-9a-f]{40}$/.test(seal.documentationRevision ?? '')) {
    errors.push('documentationRevision must be a full 40-character Git commit');
  } else {
    const docsPaths = [...new Set(documentPaths)]
      .filter((candidate) => candidate.startsWith(`${DOCS_ROOT}${sep}`))
      .sort();
    const relativeDocsPaths = docsPaths.map((path) => normalizePath(relative(DOCS_ROOT, path)));
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
      } else if (sha256(result.stdout) !== sha256(read(path))) {
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
  const styles = walkFiles(join(CORE_ROOT, 'styles'), (path) => path.endsWith('.css'));
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
  if (process.argv.includes('--write')) {
    writeAtomic(ARTIFACT_PATH, artifactBytes);
    writeAtomic(HASH_PATH, hashBytes);
  }
  if (process.argv.includes('--check-artifact')) {
    const mismatches = [];
    if (!existsSync(ARTIFACT_PATH) || readFileSync(ARTIFACT_PATH, 'utf8') !== artifactBytes) {
      mismatches.push(workspacePath(ARTIFACT_PATH));
    }
    if (!existsSync(HASH_PATH) || readFileSync(HASH_PATH, 'utf8') !== hashBytes) {
      mismatches.push(workspacePath(HASH_PATH));
    }
    if (mismatches.length > 0) {
      throw new Error(`WO-GAT-07 authoritative artifact is stale/missing: ${mismatches.join(', ')}; run gat07:write after the documentation seal is committed`);
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
