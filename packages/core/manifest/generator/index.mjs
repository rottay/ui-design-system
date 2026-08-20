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

import { parseRegistry } from '../../scripts/tokens/customization-surface-census/index.mjs';
import { loadProgramContracts } from '../../scripts/quality-evidence/v2/contracts.mjs';
import {
  APPLICABLE_FAMILY_FIELDS,
  ASSESSMENT_STATE_RANK,
  CELL_MECHANISMS,
  CHANNEL_PREFIXES,
  CHANNEL_REPLACEMENT_STATES,
  EVIDENCE_PROOF_ROLES,
  FAMILY_SECTION_KEYS,
  INTERNAL_CHANNEL_FIELDS,
  RED_TEST_ALLOWED_ACTIONS,
  RED_TEST_CLASSES,
  RED_TEST_REQUIRED_FIELDS,
  checkSourceInventoryCorrespondence,
  findForbiddenFamilyEdgeFields,
  validateCell,
  validateControlOrthogonality,
  validateInternalChannelLaws,
  validateMaximumClaim,
  validateRedTestClassifications,
  validateSection,
  validateSourceBindings,
} from '../rules/index.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../scripts/lib/repo-root/index.mjs';

export {
  APPLICABLE_FAMILY_FIELDS,
  CELL_MECHANISMS,
  CHANNEL_PREFIXES,
  CHANNEL_REPLACEMENT_STATES,
  EVIDENCE_PROOF_ROLES,
  INTERNAL_CHANNEL_FIELDS,
  RED_TEST_ALLOWED_ACTIONS,
  RED_TEST_CLASSES,
  RED_TEST_REQUIRED_FIELDS,
};

const HERE = dirname(fileURLToPath(import.meta.url));
/** `packages/core/` -- the anchor every path inside `index.json` is relative to.
 *  The manifest graduated to `packages/core/manifest/`, so HERE is that folder. */
const PACKAGE_ROOT = findPackageRoot(HERE);
/** The manifest ROOT -- the data (`index.json`, `schema.json`, `controls/`,
 *  `groups/`, `families/`) did NOT move into the capability folders. */
const MANIFEST_ROOT = resolve(HERE, '..');
/** The programme folder did NOT graduate: it stays under `scripts/`. */
const PROGRAM_ROOT = resolve(PACKAGE_ROOT, 'scripts/quality-evidence/programs/modern-rescue');
const REPOSITORY_ROOT = findRepoRoot(HERE);
const INVENTORY_PATH = join(PROGRAM_ROOT, 'family-inventory.json');
const PROGRAM_PATH = join(PROGRAM_ROOT, 'program.json');
const SCHEMA_PATH = join(MANIFEST_ROOT, 'schema.json');
const INDEX_PATH = join(MANIFEST_ROOT, 'index.json');
const CONTROLS_ROOT = join(MANIFEST_ROOT, 'controls');
const GROUPS_ROOT = join(MANIFEST_ROOT, 'groups');
const FAMILIES_ROOT = join(MANIFEST_ROOT, 'families');
const CASCADE_ROOTS_DIR = join(MANIFEST_ROOT, 'cascade', 'roots');
const CATALOG_PATH = join(MANIFEST_ROOT, 'cascade', 'root-catalog.json');
const REGISTRY_SOURCE = join(
  REPOSITORY_ROOT,
  'packages/core/src/foundation/contracts/composition/tenants/capabilities/index.ts',
);
// There is deliberately no ledger path here. `test-artifacts/.../wo-cra-23/family-ledger.json`
// is sealed historical evidence: it records git-derived SOURCE_TOUCHED coverage facts from the
// 252-family era and makes no quality claim. This generator used to hash it into the source
// digest and require exact id parity with the inventory, which promoted history to an active
// authority -- a renamed family could not land until the historical record was rewritten to
// agree with it, so the archive tracked the present and stopped being an archive. Active
// identity comes from the family inventory and the manifest cells; the denominator comes from
// the program contract. History is read as evidence, never executed as law.
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
  return relative(PACKAGE_ROOT, pathname).replaceAll('\\', '/');
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

/**
 * The cascade catalog and its roots enter the digest net (correccion F2 de la
 * auditoria Fable). Antes quedaban fuera: una edicion manual del catalogo -- o
 * intercambiar el `channel` de dos raices, que deja verdes a freshness y a
 * exposure a la vez -- salia CONSTITUTION_READY. Controles y familias ya
 * estaban pineados; la asimetria no tenia razon escrita, y ahora no existe.
 */
function cascadeInputsDigest() {
  const entries = {};
  if (existsSync(CATALOG_PATH)) entries['root-catalog.json'] = sha256(readFileSync(CATALOG_PATH));
  if (existsSync(CASCADE_ROOTS_DIR)) {
    for (const name of readdirSync(CASCADE_ROOTS_DIR).sort()) {
      if (!name.endsWith('.json')) continue;
      entries[`roots/${name}`] = sha256(readFileSync(join(CASCADE_ROOTS_DIR, name)));
    }
  }
  return jsonDigest(entries);
}

function sourceInputsDigest() {
  return jsonDigest({
    inventory: sha256(readFileSync(INVENTORY_PATH)),
    registry: sha256(readFileSync(REGISTRY_SOURCE)),
    schema: sha256(readFileSync(SCHEMA_PATH)),
    cascade: cascadeInputsDigest(),
  });
}

function defaultCalibration() {
  return {
    assessmentState: 'UNKNOWN',
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

/**
 * The reverse control -> family/part/channel view, DERIVED from family cells.
 *
 * This is the only place the edge may be read from, and it is generated rather than authored:
 * `customization-model.json#controlImpactContract` used to REQUIRE `families`, `parts` and
 * `propertyGroups` on a control while `schema.json` and this generator FORBADE them, so the
 * contract contradicted itself and nothing enforced either half. Families own the edge; this
 * function projects it.
 *
 * A row is emitted for every cell that has said anything at all -- a disposition or a
 * verificationState above UNKNOWN. Emitting a row is not progress: `unknownCells` and each row's
 * own disposition/verificationState travel with it, so a reader cannot mistake a declared edge
 * for a verified one.
 */
function buildControlFamilyView(controls, familyRecords) {
  const sorted = (values) => [...new Set(values)].sort();
  const view = [];

  for (const control of controls) {
    const rows = [];
    let unknownCells = 0;

    for (const { value: family } of familyRecords) {
      const cell = family.themeControls.find((entry) => entry.controlId === control.id);
      if (!cell) continue;
      const declared =
        cell.disposition !== 'UNKNOWN' ||
        (ASSESSMENT_STATE_RANK[cell.verificationState] ?? 0) > ASSESSMENT_STATE_RANK.UNKNOWN;
      if (!declared) {
        unknownCells += 1;
        continue;
      }
      rows.push({
        familyId: family.familyId,
        layer: family.identity.layer,
        disposition: cell.disposition,
        verificationState: cell.verificationState,
        stableParts: sorted(cell.stableParts ?? []),
        propertyGroups: sorted(cell.propertyGroups ?? []),
        computedProperties: sorted(cell.computedProperties ?? []),
        channels: sorted([
          ...(cell.outputBindings ?? []),
          ...(cell.internalChannels ?? []).map((channel) => channel.channelId),
        ]),
      });
    }

    rows.sort((left, right) => left.familyId.localeCompare(right.familyId));
    view.push({
      controlId: control.id,
      declaredFamilies: rows.length,
      unknownCells,
      applicableFamilyIds: rows
        .filter((row) => row.disposition === 'APPLICABLE')
        .map((row) => row.familyId),
      parts: sorted(rows.flatMap((row) => row.stableParts)),
      propertyGroups: sorted(rows.flatMap((row) => row.propertyGroups)),
      channels: sorted(rows.flatMap((row) => row.channels)),
      families: rows,
    });
  }

  return view;
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
    generatedBy: 'node packages/core/manifest/generator/index.mjs --sync',
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
    generatedControlFamilyView: {
      law: 'Generated from family cells. Controls must not hand-author a family edge; a declared row is not progress, and every row carries its own disposition and verificationState.',
      controls: buildControlFamilyView(controls, familyRecords),
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

function validateControl(value, expected, label, errors, context) {
  if (value.controlId !== expected.id) errors.push(`${label}: controlId must equal ${expected.id}`);
  if (value.lifecycleState !== 'OPERATIONAL') errors.push(`${label}: active registry row must be OPERATIONAL`);
  if (value.tier !== expected.tier) errors.push(`${label}: tier drifted from registry`);
  for (const where of findForbiddenFamilyEdgeFields(value)) {
    errors.push(
      `${label}: controls must not own family edges; found ${where} (families own edges, the index generates the reverse view)`,
    );
  }
  if (!ASSESSMENT_STATES.has(value.calibration?.assessmentState)) {
    errors.push(`${label}: invalid calibration assessmentState`);
  }
  // Calibration bindings are graded whenever they are present, and required from SOURCE_BOUND.
  const calibrationLabel = `${label}: calibration`;
  const calibrationBindings = value.calibration?.sourceBindings;
  const calibrationRank = ASSESSMENT_STATE_RANK[value.calibration?.assessmentState] ?? -1;
  if (calibrationRank >= ASSESSMENT_STATE_RANK.SOURCE_BOUND) {
    const declared = Array.isArray(calibrationBindings)
      ? calibrationBindings.length
      : calibrationBindings && typeof calibrationBindings === 'object'
        ? Object.keys(calibrationBindings).length
        : 0;
    if (declared === 0) {
      errors.push(
        `${calibrationLabel}: assessmentState ${value.calibration.assessmentState} requires non-empty sourceBindings`,
      );
    }
  }
  errors.push(
    ...validateSourceBindings(calibrationBindings, {
      label: calibrationLabel,
      repositoryRoot: REPOSITORY_ROOT,
    }),
  );
  errors.push(
    ...validateRedTestClassifications(value.calibration?.redTestClassifications, {
      label: calibrationLabel,
      repositoryRoot: REPOSITORY_ROOT,
    }),
  );
  if (context) {
    context.independentInvariantByControl.set(expected.id, value.independentSemanticInvariant ?? null);
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

function validateFamily(value, row, controlIds, label, errors, context) {
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
    const graded = validateCell(cell, {
      label,
      familyId: row.id,
      anatomy: value.anatomy,
      repositoryRoot: REPOSITORY_ROOT,
      contracts: context.contracts,
      activeControlIds: controlIds,
      familyIds: context.familyIds,
      now: context.now,
    });
    errors.push(...graded.errors);
    context.channelDeclarations.push(...graded.declared);
    if (cell.disposition === 'APPLICABLE') {
      const consumers = context.consumerSetsByControl.get(cell.controlId) ?? new Set();
      for (const group of cell.propertyGroups ?? []) consumers.add(`${row.id}::${group}`);
      context.consumerSetsByControl.set(cell.controlId, consumers);
    }
  }
  for (const key of FAMILY_SECTION_KEYS) {
    if (!ASSESSMENT_STATES.has(value[key]?.assessmentState)) {
      errors.push(`${label}: ${key} has invalid assessmentState`);
    }
    errors.push(
      ...validateSection(value[key], key, {
        label,
        familyId: row.id,
        repositoryRoot: REPOSITORY_ROOT,
        contracts: context.contracts,
        now: context.now,
      }),
    );
  }
  errors.push(...validateMaximumClaim(value, { label }));
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
  // Uniqueness is asserted on the inventory itself. It used to ride on the ledger's id list,
  // which meant the invariant lived in the archive; and it cannot be inferred from the path
  // checks below, because `expectedFamilyPaths` is a Set -- two rows sharing an id collapse to
  // one path and every downstream check still passes while the denominator silently drops.
  const duplicateIds = [...new Set(inventoryIds.filter((id, index) => inventoryIds.indexOf(id) !== index))];
  if (duplicateIds.length > 0) {
    errors.push(`family inventory ids must be unique; duplicated: ${duplicateIds.join(', ')}`);
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

  const context = {
    contracts: loadProgramContracts(),
    familyIds: new Set(inventoryIds),
    now: new Date(),
    channelDeclarations: [],
    consumerSetsByControl: new Map(),
    independentInvariantByControl: new Map(),
  };

  const controlRecords = controls.map((entry) => {
    const pathname = controlPath(entry.id);
    const value = readJson(pathname);
    validateControl(value, entry, relativeManifestPath(pathname), errors, context);
    return { pathname, value };
  });
  const familyRecords = inventory.rows.map((row) => {
    const pathname = familyPath(row.id);
    const value = readJson(pathname);
    validateFamily(value, row, controlIds, relativeManifestPath(pathname), errors, context);
    return { pathname, value };
  });
  errors.push(...validateInternalChannelLaws(context.channelDeclarations));
  errors.push(
    ...validateControlOrthogonality({
      consumerSetsByControl: context.consumerSetsByControl,
      independentInvariantByControl: context.independentInvariantByControl,
    }),
  );
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
  // The denominator is read from the program contract rather than restated here, so a
  // recount lands in one place. It was hardcoded twice (here and in program-check), which
  // is exactly how the two authorities drifted apart during the taxonomy adjudication.
  const expectedFamilyTotal = readJson(PROGRAM_PATH).denominators.visibleFamilies;
  if (inventory.rows.length !== expectedFamilyTotal) {
    errors.push(`canonical family denominator must remain ${expectedFamilyTotal} (inventory holds ${inventory.rows.length})`);
  }
  // Inventory -> source.
  for (const row of inventory.rows) {
    const owner = join(REPOSITORY_ROOT, row.sourceOwner ?? '');
    if (!row.sourceOwner || !existsSync(owner)) {
      errors.push(`family ${row.id} sourceOwner does not resolve: ${row.sourceOwner ?? '<missing>'}`);
    }
  }
  // Source -> inventory: a new family under a canonical root cannot sit outside the catalog.
  errors.push(...checkSourceInventoryCorrespondence({ repositoryRoot: REPOSITORY_ROOT, inventory }));

  if (existsSync(INDEX_PATH)) {
    const expectedIndex = buildIndex(inventory, controls, familyRecords, controlRecords, groups);
    const actualIndex = readJson(INDEX_PATH);
    if (JSON.stringify(actualIndex) !== JSON.stringify(expectedIndex)) {
      errors.push('manifest/index.json is stale; run generator/index.mjs --write');
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
