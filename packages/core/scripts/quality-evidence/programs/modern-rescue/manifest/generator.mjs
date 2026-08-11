import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { parseRegistry } from '../../../../customization-surface-census.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROGRAM_ROOT = resolve(HERE, '..');
const REPOSITORY_ROOT = resolve(HERE, '../../../../../../..');
const INVENTORY_PATH = join(PROGRAM_ROOT, 'family-inventory.json');
const SCHEMA_PATH = join(HERE, 'schema.json');
const INDEX_PATH = join(HERE, 'index.json');
const CONTROLS_ROOT = join(HERE, 'controls');
const GROUPS_ROOT = join(HERE, 'groups');
const FAMILIES_ROOT = join(HERE, 'families');
const REGISTRY_SOURCE = join(
  REPOSITORY_ROOT,
  'packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts',
);
const LEDGER_PATH = join(
  REPOSITORY_ROOT,
  'packages/core/test-artifacts/quality-evidence/wo-cra-23/family-ledger.json',
);

const ACTIVE_PUBLIC_TIERS = new Set(['standard', 'pro']);
const DISPOSITIONS = new Set([
  'UNKNOWN',
  'APPLICABLE',
  'INVARIANT_WITH_REASON',
  'NOT_APPLICABLE_WITH_REASON',
]);
const ASSESSMENT_STATES = new Set([
  'UNKNOWN',
  'SOURCE_BOUND',
  'IMPLEMENTED',
  'COMPUTED_VERIFIED',
  'SIGHTED_ACCEPTED',
]);
const MAXIMUM_CLAIMS = new Set([
  'INVENTORIED_ONLY',
  'SOURCE_BOUND',
  'ASSESSED',
  'COMPUTED_VERIFIED',
  'SIGHTED_ACCEPTED',
]);
const REVIEW_VERDICTS = new Set([
  null,
  'ACCEPTED',
  'ASSESSED_NOT_ELEVATED',
  'BLOCKED_OWNER_DECISION',
]);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function jsonDigest(value) {
  return sha256(JSON.stringify(value));
}

function readJson(pathname) {
  return JSON.parse(readFileSync(pathname, 'utf8'));
}

function writeJson(pathname, value) {
  mkdirSync(dirname(pathname), { recursive: true });
  const temporary = `${pathname}.tmp-${process.pid}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, pathname);
}

function filesBelow(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = join(current, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && entry.name.endsWith('.json')) files.push(absolute);
    }
  };
  visit(root);
  return files.sort();
}

function relativeManifestPath(pathname) {
  return relative(PROGRAM_ROOT, pathname).replaceAll('\\', '/');
}

function familyPath(familyId) {
  return join(FAMILIES_ROOT, `${familyId}.json`);
}

function controlPath(controlId) {
  return join(CONTROLS_ROOT, `${controlId}.json`);
}

function activePublicControls() {
  return parseRegistry().filter(
    (entry) => entry.status === 'active' && ACTIVE_PUBLIC_TIERS.has(entry.tier),
  );
}

function sourceInputsDigest() {
  return jsonDigest({
    inventory: sha256(readFileSync(INVENTORY_PATH)),
    registry: sha256(readFileSync(REGISTRY_SOURCE)),
    ledger: sha256(readFileSync(LEDGER_PATH)),
    schema: sha256(readFileSync(SCHEMA_PATH)),
  });
}

function defaultCalibration() {
  return {
    assessmentState: 'UNKNOWN',
    representativeFamilyIds: [],
    normalizedStops: [],
    staticDbParityEvidenceIds: [],
    exactRestoreEvidenceIds: [],
    negativeControls: [],
    nextAction: 'CALIBRATE_LOWERERS_COMPUTED_DELTAS_NEGATIVES_AND_EXACT_RESTORE',
  };
}

function buildControl(entry, existing = {}) {
  return {
    schemaVersion: 1,
    controlId: entry.id,
    lifecycleState: 'OPERATIONAL',
    tier: entry.tier,
    scope: entry.scope,
    semanticOwner: {
      owner: entry.owner,
      registryPath: relative(REPOSITORY_ROOT, REGISTRY_SOURCE).replaceAll('\\', '/'),
      registryDigest: sha256(readFileSync(REGISTRY_SOURCE)),
    },
    title: entry.title,
    valueType: entry.valueType,
    domain: {
      kind: entry.enumValues?.length ? 'closed-enum' : entry.bounds ? 'bounded' : entry.valueType,
      enumValues: entry.enumValues ?? [],
      bounds: entry.bounds ?? null,
      defaultBehavior: entry.defaultBehavior,
    },
    ingress: {
      staticBrandThemePath: entry.brandThemePath,
      dbTenantThemePath: entry.documentPath,
    },
    declaredOutputs: {
      channels: entry.derivedChannels ?? [],
      rootAttributes: entry.derivedRootAttributes ?? [],
      representativeOnly: true,
    },
    dependsOn: entry.dependsOn ?? [],
    compatibility: entry.compat,
    productiveConsumerWitness: entry.evidence ?? null,
    calibration: existing.calibration ?? defaultCalibration(),
    retiredAliases: existing.retiredAliases ?? [],
  };
}

function defaultControlDisposition(controlId) {
  return {
    controlId,
    disposition: 'UNKNOWN',
    verificationState: 'UNKNOWN',
    unknownReason: 'NOT_ASSESSED',
    evidenceIds: [],
    nextAction: 'DIFFERENTIAL_COMPILE_AND_COMPUTED_FAMILY_BINDING',
  };
}

function normalizedExistingControlDisposition(controlId, existing) {
  if (!existing) return defaultControlDisposition(controlId);
  const generatedKeys = new Set([
    'controlId',
    'disposition',
    'verificationState',
    'unknownReason',
    'axisDispositions',
    'outputBindings',
    'stableParts',
    'states',
    'propertyGroups',
    'computedProperties',
    'internalChannels',
    'sourceBindings',
    'negativeControls',
    'stressCases',
    'evidenceIds',
    'nextAction',
  ]);
  const hasAuthoredExtension = Object.keys(existing).some((key) => !generatedKeys.has(key));
  const emptyGeneratedSkeleton =
    !hasAuthoredExtension &&
    existing.disposition === 'UNKNOWN' &&
    existing.unknownReason === 'NOT_ASSESSED' &&
    (existing.evidenceIds?.length ?? 0) === 0 &&
    [
      'axisDispositions',
      'outputBindings',
      'stableParts',
      'states',
      'propertyGroups',
      'computedProperties',
      'internalChannels',
      'sourceBindings',
      'negativeControls',
      'stressCases',
    ].every((key) => (existing[key]?.length ?? 0) === 0);
  return emptyGeneratedSkeleton ? defaultControlDisposition(controlId) : existing;
}

function unknownSection(nextAction, extra = {}) {
  return {
    assessmentState: 'UNKNOWN',
    ...extra,
    evidenceIds: [],
    nextAction,
  };
}

function buildFamily(row, controls, existing = {}) {
  const existingControls = new Map(
    (existing.themeControls ?? []).map((entry) => [entry.controlId, entry]),
  );
  return {
    schemaVersion: 1,
    familyId: row.id,
    identity: {
      layer: row.layer,
      category: row.category,
      name: row.family,
      components: row.components,
      sourceRoot: row.sourceRoot,
      sourceOwner: row.sourceOwner,
      publicComponents: row.declaredComponentsPublic ?? [],
      unresolvedPublicComponents: row.declaredComponentsNotPubliclyNamed ?? [],
      publicApiCompleteness: 'COMPONENT_SYMBOLS_ONLY_REQUIRES_FAMILY_EXPORT_CENSUS',
      inventoryResolution: row.sourceResolution,
      inventoryRowDigest: jsonDigest(row),
    },
    maximumClaim: existing.maximumClaim ?? 'INVENTORIED_ONLY',
    review: existing.review ?? {
      verdict: null,
      acceptedSourceDigest: null,
      evidenceIds: [],
      decisionReason: null,
    },
    anatomy: existing.anatomy ?? unknownSection(
      'SOURCE_BIND_ROOT_PARTS_STATES_PROPERTY_GROUPS_AND_INVARIANTS',
      { stableParts: [], states: [], propertyGroups: [], invariants: [] },
    ),
    themeControls: controls.map((control) =>
      normalizedExistingControlDisposition(control.id, existingControls.get(control.id))
    ),
    retiredThemeControls: existing.retiredThemeControls ?? [],
    recipeAnatomy: existing.recipeAnatomy ?? unknownSection(
      'CENSUS_TYPED_RECIPE_AND_ANATOMY_VARIANTS',
      { groupBindings: [], variants: [], deprecatedAliases: [] },
    ),
    instanceApi: existing.instanceApi ?? unknownSection(
      'CENSUS_PUBLIC_PROPS_SLOTS_CALLBACKS_AND_CONTROLLED_STATE',
      { props: [], slots: [], callbacks: [], controlledState: [] },
    ),
    hostAdaptation: existing.hostAdaptation ?? unknownSection(
      'PROVE_PAGE_EMBED_CONTAINER_VIEWPORT_AND_HOST_POSTURES',
      { contexts: [], containerRules: [], invariants: [] },
    ),
    statesMotion: existing.statesMotion ?? unknownSection(
      'CENSUS_STATES_TRANSITIONS_INPUTS_AND_REDUCED_MOTION',
      { states: [], transitions: [], inputModes: [], reducedMotion: [] },
    ),
    invariants: existing.invariants ?? unknownSection(
      'AUTHOR_STRUCTURAL_BEHAVIORAL_ACCESSIBILITY_AND_RESTORE_INVARIANTS',
      { entries: [] },
    ),
    premiumCandidates: existing.premiumCandidates ?? [],
  };
}

function groupRecords() {
  return filesBelow(GROUPS_ROOT).map((pathname) => ({ pathname, value: readJson(pathname) }));
}

function buildIndex(inventory, controls, familyRecords, controlRecords, groups) {
  const dispositionCounts = Object.fromEntries([...DISPOSITIONS].map((key) => [key, 0]));
  const claimCounts = Object.fromEntries([...MAXIMUM_CLAIMS].map((key) => [key, 0]));
  const reviewCounts = {
    unreviewed: 0,
    accepted: 0,
    assessedNotElevated: 0,
    blockedOwnerDecision: 0,
  };

  for (const { value } of familyRecords) {
    claimCounts[value.maximumClaim] = (claimCounts[value.maximumClaim] ?? 0) + 1;
    for (const cell of value.themeControls) {
      dispositionCounts[cell.disposition] = (dispositionCounts[cell.disposition] ?? 0) + 1;
    }
    if (value.review.verdict === null) reviewCounts.unreviewed += 1;
    else if (value.review.verdict === 'ACCEPTED') reviewCounts.accepted += 1;
    else if (value.review.verdict === 'ASSESSED_NOT_ELEVATED') reviewCounts.assessedNotElevated += 1;
    else if (value.review.verdict === 'BLOCKED_OWNER_DECISION') reviewCounts.blockedOwnerDecision += 1;
  }

  const registryRows = parseRegistry();
  const inputsDigest = jsonDigest({
    sourceInputs: sourceInputsDigest(),
    controls: controlRecords.map(({ value }) => jsonDigest(value)),
    families: familyRecords.map(({ value }) => jsonDigest(value)),
    groups: groups.map(({ value }) => jsonDigest(value)),
  });

  return {
    schemaVersion: 1,
    generatedBy: 'node packages/core/scripts/quality-evidence/programs/modern-rescue/manifest/generator.mjs --sync',
    authorityLaw: 'Controls own semantics, groups own recipe vocabularies, families own applicability edges, and this index owns generated rollups.',
    inputsDigest,
    denominators: {
      canonicalFamilies: inventory.rows.length,
      activeStandardControls: controls.filter((entry) => entry.tier === 'standard').length,
      activeProCapabilities: controls.filter((entry) => entry.tier === 'pro').length,
      activePublicControls: controls.length,
      controlFamilyCells: controls.length * inventory.rows.length,
      recipeGroups: groups.length,
    },
    excludedRegistryRows: registryRows
      .filter((entry) => !controls.some((control) => control.id === entry.id))
      .map((entry) => ({
        controlId: entry.id,
        tier: entry.tier,
        lifecycleState: entry.status === 'frontier' ? 'FRONTIER_NON_CERTIFYING' : 'INTERNAL_NON_CERTIFYING',
        reason: 'Only active Standard and Pro controls create R0-R6 family certification cells.',
      })),
    rollups: {
      familyMaximumClaims: claimCounts,
      familyReviews: reviewCounts,
      controlFamilyDispositions: dispositionCounts,
      skeletonsCountAsProgress: false,
    },
    paths: {
      schema: relativeManifestPath(SCHEMA_PATH),
      controlsRoot: relativeManifestPath(CONTROLS_ROOT),
      groupsRoot: relativeManifestPath(GROUPS_ROOT),
      familiesRoot: relativeManifestPath(FAMILIES_ROOT),
    },
    controls: controlRecords.map(({ pathname, value }) => ({
      controlId: value.controlId,
      path: relativeManifestPath(pathname),
      digest: jsonDigest(value),
    })),
    groups: groups.map(({ pathname, value }) => ({
      groupId: value.groupId,
      path: relativeManifestPath(pathname),
      digest: jsonDigest(value),
    })),
    families: familyRecords.map(({ pathname, value }) => ({
      familyId: value.familyId,
      path: relativeManifestPath(pathname),
      digest: jsonDigest(value),
      maximumClaim: value.maximumClaim,
      reviewVerdict: value.review.verdict,
    })),
  };
}

function recordsForExpectedPaths(items, pathFor) {
  return items.map((item) => {
    const pathname = pathFor(item.id);
    return { pathname, value: readJson(pathname) };
  });
}

export function writeCustomizationManifest() {
  const beforeDigest = sourceInputsDigest();
  const inventory = readJson(INVENTORY_PATH);
  const controls = activePublicControls();
  mkdirSync(CONTROLS_ROOT, { recursive: true });
  mkdirSync(GROUPS_ROOT, { recursive: true });
  mkdirSync(FAMILIES_ROOT, { recursive: true });

  for (const entry of controls) {
    const pathname = controlPath(entry.id);
    const existing = existsSync(pathname) ? readJson(pathname) : {};
    writeJson(pathname, buildControl(entry, existing));
  }
  for (const row of inventory.rows) {
    const pathname = familyPath(row.id);
    const existing = existsSync(pathname) ? readJson(pathname) : {};
    writeJson(pathname, buildFamily(row, controls, existing));
  }

  const controlRecords = recordsForExpectedPaths(controls, controlPath);
  const familyRecords = recordsForExpectedPaths(inventory.rows, familyPath);
  const groups = groupRecords();
  if (sourceInputsDigest() !== beforeDigest) {
    throw new Error('manifest source inputs drifted during generation; retry from a frozen tree');
  }
  writeJson(INDEX_PATH, buildIndex(inventory, controls, familyRecords, controlRecords, groups));
}

function expectedGeneratedFilesExist() {
  return existsSync(INDEX_PATH) || filesBelow(CONTROLS_ROOT).length > 0 || filesBelow(FAMILIES_ROOT).length > 0;
}

export function bootstrapCustomizationManifest() {
  if (expectedGeneratedFilesExist()) {
    throw new Error('bootstrap requires an absent manifest; use --sync to preserve authored cells');
  }
  writeCustomizationManifest();
}

function validateControl(value, expected, label, errors) {
  if (value.controlId !== expected.id) errors.push(`${label}: controlId must equal ${expected.id}`);
  if (value.lifecycleState !== 'OPERATIONAL') errors.push(`${label}: active registry row must be OPERATIONAL`);
  if (value.tier !== expected.tier) errors.push(`${label}: tier drifted from registry`);
  if (Object.hasOwn(value, 'families') || Object.hasOwn(value, 'familyIds')) {
    errors.push(`${label}: controls must not own family edges`);
  }
  if (!ASSESSMENT_STATES.has(value.calibration?.assessmentState)) {
    errors.push(`${label}: invalid calibration assessmentState`);
  }
  const consumer = value.productiveConsumerWitness?.consumer;
  const symbol = value.productiveConsumerWitness?.symbol;
  if (!consumer || !symbol) {
    errors.push(`${label}: active control requires a productive consumer witness`);
  } else {
    const absoluteConsumer = join(REPOSITORY_ROOT, 'packages/core', consumer);
    if (!existsSync(absoluteConsumer)) errors.push(`${label}: productive consumer does not exist: ${consumer}`);
    else if (!readFileSync(absoluteConsumer, 'utf8').includes(symbol)) {
      errors.push(`${label}: productive consumer is missing witness symbol ${JSON.stringify(symbol)}`);
    }
  }
}

function validateFamily(value, row, controlIds, label, errors) {
  if (value.familyId !== row.id) errors.push(`${label}: familyId must equal ${row.id}`);
  if (!MAXIMUM_CLAIMS.has(value.maximumClaim)) errors.push(`${label}: invalid maximumClaim`);
  if (!REVIEW_VERDICTS.has(value.review?.verdict)) errors.push(`${label}: invalid review verdict`);
  if (value.identity?.inventoryRowDigest !== jsonDigest(row)) {
    errors.push(`${label}: identity is stale relative to family-inventory.json`);
  }
  const cells = value.themeControls ?? [];
  const actualIds = cells.map((cell) => cell.controlId);
  if (actualIds.join('|') !== controlIds.join('|')) {
    errors.push(`${label}: themeControls must contain each active Standard/Pro control exactly once in registry order`);
  }
  for (const cell of cells) {
    if (!DISPOSITIONS.has(cell.disposition)) errors.push(`${label}: ${cell.controlId} has invalid disposition`);
    if (!ASSESSMENT_STATES.has(cell.verificationState)) errors.push(`${label}: ${cell.controlId} has invalid verificationState`);
    if (cell.disposition === 'UNKNOWN' && !cell.unknownReason) {
      errors.push(`${label}: ${cell.controlId} UNKNOWN requires unknownReason`);
    }
    if (cell.disposition === 'NOT_APPLICABLE_WITH_REASON' && cell.evidenceIds.length === 0) {
      errors.push(`${label}: ${cell.controlId} N/A requires negative proof evidence`);
    }
  }
  for (const key of ['anatomy', 'recipeAnatomy', 'instanceApi', 'hostAdaptation', 'statesMotion', 'invariants']) {
    if (!ASSESSMENT_STATES.has(value[key]?.assessmentState)) {
      errors.push(`${label}: ${key} has invalid assessmentState`);
    }
  }
  for (const candidate of value.premiumCandidates ?? []) {
    if (candidate.countsAsCapability !== false) {
      errors.push(`${label}: premium candidate ${candidate.id ?? '<missing>'} must set countsAsCapability=false`);
    }
  }
}

function validateGroup(value, label, errors) {
  if (!value.groupId) errors.push(`${label}: groupId is required`);
  if (!value.implementationState) errors.push(`${label}: implementationState is required`);
  if (!Array.isArray(value.variants)) errors.push(`${label}: variants must be an array`);
  if (!Array.isArray(value.invariants)) errors.push(`${label}: invariants must be an array`);
  for (const forbidden of ['families', 'familyIds', 'themeControls']) {
    if (Object.hasOwn(value, forbidden)) errors.push(`${label}: recipe groups must not own ${forbidden}`);
  }
}

export function validateCustomizationManifest() {
  const errors = [];
  const inventory = readJson(INVENTORY_PATH);
  const controls = activePublicControls();
  const controlIds = controls.map((entry) => entry.id);
  const expectedControlPaths = new Set(controls.map((entry) => controlPath(entry.id)));
  const expectedFamilyPaths = new Set(inventory.rows.map((row) => familyPath(row.id)));

  const inventoryIds = inventory.rows.map((row) => row.id);
  const ledger = readJson(LEDGER_PATH);
  const ledgerIds = (ledger.rows ?? []).map((row) => row.id);
  if (new Set(ledgerIds).size !== ledgerIds.length) errors.push('family ledger ids must be unique');
  if ([...inventoryIds].sort().join('|') !== [...ledgerIds].sort().join('|')) {
    errors.push('family inventory and family ledger must contain the exact same 252 ids');
  }

  const expectedPaths = [...expectedControlPaths, ...expectedFamilyPaths];
  const caseFolded = expectedPaths.map((pathname) => pathname.toLocaleLowerCase('en-US'));
  if (new Set(caseFolded).size !== caseFolded.length) {
    errors.push('manifest paths must not collide under case folding');
  }

  for (const pathname of expectedControlPaths) {
    if (!existsSync(pathname)) errors.push(`missing control manifest ${relativeManifestPath(pathname)}`);
    else if (lstatSync(pathname).isSymbolicLink()) errors.push(`control manifest must not be a symlink ${relativeManifestPath(pathname)}`);
  }
  for (const pathname of expectedFamilyPaths) {
    if (!existsSync(pathname)) errors.push(`missing family manifest ${relativeManifestPath(pathname)}`);
    else if (lstatSync(pathname).isSymbolicLink()) errors.push(`family manifest must not be a symlink ${relativeManifestPath(pathname)}`);
  }
  for (const pathname of filesBelow(CONTROLS_ROOT)) {
    if (!expectedControlPaths.has(pathname)) errors.push(`unexpected control manifest ${relativeManifestPath(pathname)}`);
  }
  for (const pathname of filesBelow(FAMILIES_ROOT)) {
    if (!expectedFamilyPaths.has(pathname)) errors.push(`unexpected family manifest ${relativeManifestPath(pathname)}`);
  }

  if (errors.length > 0) return errors;

  const controlRecords = controls.map((entry) => {
    const pathname = controlPath(entry.id);
    const value = readJson(pathname);
    validateControl(value, entry, relativeManifestPath(pathname), errors);
    return { pathname, value };
  });
  const familyRecords = inventory.rows.map((row) => {
    const pathname = familyPath(row.id);
    const value = readJson(pathname);
    validateFamily(value, row, controlIds, relativeManifestPath(pathname), errors);
    return { pathname, value };
  });
  const groups = groupRecords();
  for (const { pathname, value } of groups) {
    validateGroup(value, relativeManifestPath(pathname), errors);
  }
  const groupIds = groups.map(({ value }) => value.groupId);
  if (new Set(groupIds).size !== groupIds.length) errors.push('recipe group ids must be unique');

  if (controls.filter((entry) => entry.tier === 'standard').length !== 13) {
    errors.push('active Standard control denominator must remain 13');
  }
  if (controls.filter((entry) => entry.tier === 'pro').length !== 7) {
    errors.push('active Pro capability denominator must remain 7');
  }
  if (inventory.rows.length !== 252) errors.push('canonical family denominator must remain 252');
  for (const row of inventory.rows) {
    const owner = join(REPOSITORY_ROOT, row.sourceOwner ?? '');
    if (!row.sourceOwner || !existsSync(owner)) {
      errors.push(`family ${row.id} sourceOwner does not resolve: ${row.sourceOwner ?? '<missing>'}`);
    }
  }

  if (existsSync(INDEX_PATH)) {
    const expectedIndex = buildIndex(inventory, controls, familyRecords, controlRecords, groups);
    const actualIndex = readJson(INDEX_PATH);
    if (JSON.stringify(actualIndex) !== JSON.stringify(expectedIndex)) {
      errors.push('manifest/index.json is stale; run generator.mjs --write');
    }
  } else {
    errors.push('manifest/index.json is missing');
  }
  return errors;
}


export function certifyCustomizationManifest() {
  const errors = validateCustomizationManifest();
  if (errors.length > 0) return errors;
  const index = readJson(INDEX_PATH);
  if (index.rollups.controlFamilyDispositions.UNKNOWN !== 0) {
    errors.push(`certification requires UNKNOWN=0, got ${index.rollups.controlFamilyDispositions.UNKNOWN}`);
  }
  if (index.rollups.familyReviews.unreviewed !== 0) {
    errors.push(`certification requires every family reviewed, got ${index.rollups.familyReviews.unreviewed} unreviewed`);
  }
  return errors;
}

function main() {
  const bootstrap = process.argv.includes('--bootstrap');
  const sync = process.argv.includes('--sync') || process.argv.includes('--write');
  const check = process.argv.includes('--check');
  const certify = process.argv.includes('--certify');
  if (bootstrap && sync) throw new Error('choose exactly one of --bootstrap or --sync');
  if (bootstrap) bootstrapCustomizationManifest();
  if (sync) writeCustomizationManifest();
  const errors = certify ? certifyCustomizationManifest() : validateCustomizationManifest();
  if (errors.length > 0) {
    for (const error of errors) console.error(`customization-manifest FAIL — ${error}`);
    process.exitCode = 1;
    return;
  }
  if (check || sync || bootstrap || certify) {
    const index = readJson(INDEX_PATH);
    console.log(
      `customization-manifest ${certify ? 'CERTIFIED' : 'OK'} (${index.denominators.activePublicControls} controls × ${index.denominators.canonicalFamilies} families = ${index.denominators.controlFamilyCells} cells; ${index.rollups.controlFamilyDispositions.UNKNOWN} unknown; ${index.rollups.familyReviews.accepted} accepted)`,
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
