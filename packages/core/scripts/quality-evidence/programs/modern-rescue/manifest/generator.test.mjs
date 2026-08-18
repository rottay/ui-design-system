import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { computeSourceDigest } from '../../../v2/receipts.mjs';
import {
  certifyCustomizationManifest,
  validateCustomizationManifest,
} from './generator.mjs';
import {
  APPLICABLE_FAMILY_FIELDS,
  CELL_MECHANISMS,
  CHANNEL_PREFIXES,
  CHANNEL_REPLACEMENT_STATES,
  EVIDENCE_PROOF_ROLES,
  FORBIDDEN_CONTROL_FAMILY_EDGE_FIELDS,
  INTERNAL_CHANNEL_FIELDS,
  MAXIMUM_CLAIM_BY_ASSESSMENT_STATE,
  RED_TEST_ALLOWED_ACTIONS,
  RED_TEST_CLASSES,
  RED_TEST_REQUIRED_FIELDS,
  findForbiddenFamilyEdgeFields,
  checkSourceInventoryCorrespondence,
  resolveSourceBinding,
  validateCascadeRoot,
  validateCell,
  validateControlOrthogonality,
  validateInternalChannelLaws,
  validateMaximumClaim,
  validateRedTestClassifications,
  validateSection,
} from './rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROGRAM_ROOT = join(HERE, '..');
const REPOSITORY_ROOT = join(HERE, '../../../../../../..');
const INDEX = JSON.parse(readFileSync(join(HERE, 'index.json'), 'utf8'));
const SCHEMA = JSON.parse(readFileSync(join(HERE, 'schema.json'), 'utf8'));
const MODEL = JSON.parse(readFileSync(join(PROGRAM_ROOT, 'customization-model.json'), 'utf8'));
const PROGRAM = JSON.parse(readFileSync(join(PROGRAM_ROOT, 'program.json'), 'utf8'));
const EVIDENCE_CONTRACT = JSON.parse(
  readFileSync(join(PROGRAM_ROOT, 'evidence-contract.json'), 'utf8'),
);

// ---------------------------------------------------------------------------
// Existing structural contract
// ---------------------------------------------------------------------------

test('the segmented manifest is structurally complete without treating UNKNOWN as progress', () => {
  assert.deepEqual(validateCustomizationManifest(), []);
  // The family count is DERIVED from the program contract, never restated here.
  // Pinning the literal is what made this pair drift twice already -- it read
  // 252/5040, then 253/5060, and each recount had to be chased through every
  // file that had copied the number. program.json is the one authority; this
  // asserts the generated index agrees with it, which is the real invariant.
  const families = PROGRAM.denominators.visibleFamilies;
  assert.equal(INDEX.denominators.canonicalFamilies, families);
  assert.equal(INDEX.denominators.activeStandardControls, 13);
  assert.equal(INDEX.denominators.activeProCapabilities, 7);
  assert.equal(INDEX.denominators.controlFamilyCells, families * 20);
  assert.equal(INDEX.rollups.controlFamilyDispositions.UNKNOWN, families * 20);
  assert.equal(INDEX.rollups.familyReviews.accepted, 0);
  assert.equal(INDEX.rollups.skeletonsCountAsProgress, false);
});

test('frontier, internal and proposed controls never create R0-R6 family cells', () => {
  assert.deepEqual(
    INDEX.excludedRegistryRows.map((entry) => entry.controlId).sort(),
    ['palette.dark-mode', 'palette.status-seeds'],
  );
  const dataTable = JSON.parse(
    readFileSync(join(HERE, 'families/pattern/data/pattern-data-table.json'), 'utf8'),
  );
  assert.equal(dataTable.themeControls.length, 20);
  assert.equal(dataTable.themeControls.some((cell) => cell.controlId === 'surface.edge'), false);
  assert.equal(dataTable.themeControls.some((cell) => cell.controlId === 'motion.character'), false);
});

test('controls and recipe groups do not duplicate reverse family edges', () => {
  for (const entry of [...INDEX.controls, ...INDEX.groups]) {
    const value = JSON.parse(readFileSync(join(HERE, '..', entry.path), 'utf8'));
    // Recursive, at every depth. A top-level-only check passed for an entire
    // session while `calibration.representativeFamilyIds` hand-listed four
    // families and `calibration.mountClassIds` named DOM classes (`ds-flex`)
    // that no engine emits -- the real ones are `rottay-flex` and friends.
    assert.deepEqual(
      findForbiddenFamilyEdgeFields(value),
      [],
      `${entry.path} hand-authors a family edge`,
    );
  }
});

test('the reverse control -> family/part/channel view is generated from family cells', () => {
  const view = INDEX.generatedControlFamilyView;
  assert.equal(view.controls.length, 20);

  const rhythm = view.controls.find((entry) => entry.controlId === 'spacing.rhythm');
  // Derived from the four canary family cells, which are the only cells that
  // have said anything. Everything else is still honestly UNKNOWN.
  assert.deepEqual(rhythm.families.map((row) => row.familyId), [
    'primitive/layout/flex',
    'primitive/layout/grid',
    'primitive/layout/space',
    'primitive/layout/stack',
  ]);
  assert.equal(rhythm.declaredFamilies, 4);
  assert.equal(rhythm.unknownCells, INDEX.denominators.canonicalFamilies - 4);
  assert.equal(
    rhythm.declaredFamilies + rhythm.unknownCells,
    INDEX.denominators.canonicalFamilies,
  );

  // A declared row is NOT progress.
  assert.deepEqual(rhythm.applicableFamilyIds, []);
  for (const row of rhythm.families) assert.equal(row.disposition, 'UNKNOWN');
  assert.ok(rhythm.channels.includes('--ds-rhythm-effective-scale'));

  // Every projected value must trace back to a family cell, never to the control.
  for (const entry of view.controls) {
    for (const row of entry.families) {
      const family = JSON.parse(
        readFileSync(join(HERE, `families/${row.familyId}.json`), 'utf8'),
      );
      const cell = family.themeControls.find((item) => item.controlId === entry.controlId);
      assert.equal(cell.disposition, row.disposition);
      assert.equal(cell.verificationState, row.verificationState);
    }
  }
});

test('family identity does not promote category-wide export candidates into family API truth', () => {
  const table = JSON.parse(
    readFileSync(join(HERE, 'families/pattern/data/pattern-data-table.json'), 'utf8'),
  );
  assert.deepEqual(table.identity.publicComponents, ['PatternDataTable']);
  assert.equal(Object.hasOwn(table.identity, 'publicExports'), false);
  assert.equal(
    table.identity.publicApiCompleteness,
    'COMPONENT_SYMBOLS_ONLY_REQUIRES_FAMILY_EXPORT_CENSUS',
  );
});

test('certification fails closed while cells or family reviews remain unknown', () => {
  const errors = certifyCustomizationManifest();
  assert.ok(errors.some((error) => error.includes('UNKNOWN=0')));
  assert.ok(
    errors.some((error) =>
      error.includes(`${INDEX.denominators.canonicalFamilies} unreviewed`),
    ),
  );
});

test('bootstrap refuses to overwrite the existing manifest', () => {
  const result = spawnSync(
    process.execPath,
    ['packages/core/scripts/quality-evidence/programs/modern-rescue/manifest/generator.mjs', '--bootstrap'],
    { cwd: REPOSITORY_ROOT, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /bootstrap requires an absent manifest/);
});

// ---------------------------------------------------------------------------
// Drill fixtures — every mutation happens in memory or in a temp tree
// ---------------------------------------------------------------------------

const ANATOMY = { assessmentState: 'SOURCE_BOUND', stableParts: ['root'], propertyGroups: ['gap'] };
const REAL_BINDING = 'packages/core/scripts/quality-evidence/programs/modern-rescue/README.md';
const ACTIVE_CONTROL_IDS = ['spacing.rhythm', 'density.mode'];
const FAMILY_IDS = new Set(['primitive/layout/flex', 'primitive/layout/grid']);

function gradeCell(cell, overrides = {}) {
  return validateCell(cell, {
    label: 'fixture.json',
    familyId: 'primitive/layout/flex',
    anatomy: ANATOMY,
    repositoryRoot: REPOSITORY_ROOT,
    contracts: { evidence: EVIDENCE_CONTRACT, rounds: { rounds: [] }, inventory: { rows: [] } },
    activeControlIds: ACTIVE_CONTROL_IDS,
    familyIds: FAMILY_IDS,
    now: new Date(),
    ...overrides,
  });
}

function assertNames(errors, ...fragments) {
  for (const fragment of fragments) {
    assert.ok(
      errors.some((error) => error.includes(fragment)),
      `expected an error naming ${JSON.stringify(fragment)}; got ${JSON.stringify(errors, null, 2)}`,
    );
  }
}

function liveChannel(overrides = {}, binding = REAL_BINDING) {
  return {
    channelId: '--ds-rhythm-effective-scale',
    semanticOwner: 'spacing.rhythm',
    producer: binding,
    fallbackAuthority: null,
    productiveConsumerFamilyIds: ['primitive/layout/flex'],
    sourceBindings: [binding],
    replacementDisposition: { state: 'LIVE' },
    ...overrides,
  };
}

/** A temp repository carrying one evidence root, one artifact and the receipts under test. */
function evidenceFixture(receipts) {
  const root = mkdtempSync(join(tmpdir(), 'modern-rescue-evidence-'));
  const evidenceRoot = 'test-artifacts/quality-evidence/fixture';
  const artifactRelative = `${evidenceRoot}/captures/artifact.txt`;
  mkdirSync(join(root, `${evidenceRoot}/receipts`), { recursive: true });
  mkdirSync(join(root, `${evidenceRoot}/captures`), { recursive: true });
  mkdirSync(join(root, 'src'), { recursive: true });
  // The fixture repository needs its own resolvable source binding, because these drills
  // grade cells against the temporary root rather than the real repository.
  const binding = 'src/binding.ts';
  writeFileSync(join(root, binding), 'export const RhythmBinding = 1;\n');
  writeFileSync(join(root, artifactRelative), 'artifact bytes\n');
  const artifactSha256 = createHash('sha256')
    .update(readFileSync(join(root, artifactRelative)))
    .digest('hex');
  const sourceFiles = [artifactRelative];
  const contracts = {
    evidence: { root: evidenceRoot, receiptRequiredFields: EVIDENCE_CONTRACT.receiptRequiredFields },
    rounds: { rounds: [{ id: 'R2' }] },
    inventory: { rows: [{ id: 'primitive/layout/flex' }, { id: 'primitive/layout/grid' }] },
  };
  const evidenceIds = [];
  for (const [name, overrides] of Object.entries(receipts)) {
    const receipt = {
      schemaVersion: 2,
      roundId: 'R2',
      familyId: 'primitive/layout/flex',
      scenarioId: 'fixture',
      evidenceKind: 'computed-delta',
      commandOrTool: 'node --test',
      toolVersion: '1.0.0',
      exitCode: 0,
      sourceFiles,
      sourceDigest: computeSourceDigest(sourceFiles, { root }),
      artifactPath: artifactRelative,
      artifactSha256,
      createdAt: new Date(Date.now() - 60_000).toISOString(),
      negativeDrill: { violation: 'fixture', failsClosed: true, proof: 'generator.test.mjs' },
      producer: 'lane-a',
      ...overrides,
    };
    const relative = `${evidenceRoot}/receipts/${name}.json`;
    writeFileSync(join(root, relative), `${JSON.stringify(receipt, null, 2)}\n`);
    evidenceIds.push(relative);
  }
  return { root, contracts, evidenceIds, binding };
}

function sourceTreeFixture() {
  const root = mkdtempSync(join(tmpdir(), 'modern-rescue-tree-'));
  const write = (relative, contents) => {
    mkdirSync(join(root, dirname(relative)), { recursive: true });
    writeFileSync(join(root, relative), contents);
  };
  write('ui/primitives/display/Avatar/index.ts', 'export function Avatar() { return null; }\n');
  write('ui/primitives/display/Sparkle/index.tsx', 'export function Sparkle() { return null; }\n');
  write('ui/primitives/display/compose-things/index.ts', 'export const composeThings = () => null;\n');
  write('ui/primitives/display/examples/index.tsx', "import { Avatar } from '..';\nexport function AvatarExample() { return Avatar; }\n");
  write('ui/primitives/display/Avatar/contracts/index.ts', 'export function AvatarInternal() { return null; }\n');

  // Family SHAPE without family SUBSTANCE: every production entrypoint only forwards.
  write(
    'ui/primitives/display/LegacyAvatar/index.ts',
    "/** @deprecated Compatibility surface. */\nexport { Avatar as LegacyAvatar } from '../../facade';\nexport { AVATAR_SIZE_MAP } from './contracts';\n",
  );
  write(
    'ui/primitives/display/LegacyAvatar/contracts/index.ts',
    "export const AVATAR_SIZE_MAP = { sm: 'var(--ds-avatar-sm)' };\n",
  );
  write(
    'ui/primitives/display/LegacyAvatar/engines/modern/index.tsx',
    "export { ModernAvatar as default } from '../../../../facade';\n",
  );
  write(
    'ui/primitives/display/LegacyAvatar/engines/rustic/index.tsx',
    "export { RusticAvatar as default } from '../../../../facade';\n",
  );

  // Same folder shape, but its engine really implements. This half is what keeps the
  // compatibility-surface predicate from becoming a hiding place.
  write(
    'ui/primitives/display/ForkedAvatar/index.ts',
    "export { ForkedAvatar } from './engines/modern';\n",
  );
  write(
    'ui/primitives/display/ForkedAvatar/contracts/index.ts',
    "export const FORKED_SIZE_MAP = { sm: 'var(--ds-avatar-sm)' };\n",
  );
  write(
    'ui/primitives/display/ForkedAvatar/engines/modern/index.tsx',
    'export function ForkedAvatar() {\n  return null;\n}\n',
  );
  const inventory = {
    rows: [
      {
        id: 'primitive/display/avatar',
        sourceRoot: 'ui/primitives',
        sourceOwner: 'ui/primitives/display/Avatar',
        resolvedBy: 'folder-slug',
      },
    ],
  };
  return { root, inventory };
}

// ---------------------------------------------------------------------------
// Rule 1 — state-graded cells and sections
// ---------------------------------------------------------------------------

test('a source binding resolves by content, so a path never proves a symbol', () => {
  assert.equal(resolveSourceBinding(REAL_BINDING, { repositoryRoot: REPOSITORY_ROOT }), null);
  assert.equal(
    resolveSourceBinding('packages/core/src/ui/primitives', { repositoryRoot: REPOSITORY_ROOT }),
    null,
    'a directory binding is legal',
  );
  assert.match(
    resolveSourceBinding(`${REAL_BINDING}#NoSuchSymbolAnywhere`, { repositoryRoot: REPOSITORY_ROOT }),
    /does not contain symbol/,
  );
  assert.match(
    resolveSourceBinding('packages/core/src/ui/primitives#Flex', { repositoryRoot: REPOSITORY_ROOT }),
    /must name a file/,
  );
  assert.match(
    resolveSourceBinding('packages/core/does-not-exist.ts', { repositoryRoot: REPOSITORY_ROOT }),
    /path does not exist/,
  );
});

test('SOURCE_BOUND refuses an unresolvable binding and names it', () => {
  const { errors } = gradeCell({
    controlId: 'spacing.rhythm',
    disposition: 'UNKNOWN',
    verificationState: 'SOURCE_BOUND',
    unknownReason: 'PENDING',
    sourceBindings: [REAL_BINDING, 'packages/core/src/ui/primitives/layout/Flex/contracts/index.ts#NOT_A_REAL_EXPORT'],
  });
  assertNames(errors, 'spacing.rhythm', 'NOT_A_REAL_EXPORT', 'does not resolve');

  const missing = gradeCell({
    controlId: 'spacing.rhythm',
    disposition: 'UNKNOWN',
    verificationState: 'SOURCE_BOUND',
    unknownReason: 'PENDING',
  }).errors;
  assertNames(missing, 'spacing.rhythm SOURCE_BOUND requires non-empty sourceBindings');
});

test('IMPLEMENTED requires a declared mechanism from the closed set', () => {
  const base = {
    controlId: 'spacing.rhythm',
    disposition: 'UNKNOWN',
    verificationState: 'IMPLEMENTED',
    sourceBindings: [REAL_BINDING],
    stableParts: ['root'],
    propertyGroups: ['gap'],
    computedProperties: ['gap'],
    internalChannels: [liveChannel()],
  };
  assertNames(gradeCell(base).errors, 'spacing.rhythm', 'requires mechanism');
  assertNames(
    gradeCell({ ...base, mechanism: 'CSS_TOKEN' }).errors,
    'spacing.rhythm',
    'requires mechanism',
    '"CSS_TOKEN"',
  );
  assert.deepEqual(gradeCell({ ...base, mechanism: 'THEME_CONTROL' }).errors, []);
});

test('a cell may not invent a stable part or property group the family anatomy does not own', () => {
  const base = {
    controlId: 'spacing.rhythm',
    disposition: 'UNKNOWN',
    verificationState: 'IMPLEMENTED',
    mechanism: 'THEME_CONTROL',
    sourceBindings: [REAL_BINDING],
    computedProperties: ['gap'],
    internalChannels: [liveChannel()],
  };
  assertNames(
    gradeCell({ ...base, stableParts: ['invented-part'], propertyGroups: ['gap'] }).errors,
    'spacing.rhythm',
    '"invented-part"',
    'anatomy.stableParts does not own',
  );
  assertNames(
    gradeCell({ ...base, stableParts: ['root'], propertyGroups: ['invented-group'] }).errors,
    'spacing.rhythm',
    '"invented-group"',
    'anatomy.propertyGroups does not own',
  );
});

test('IMPLEMENTED requires internalChannels, and APPLICABLE requires the whole applicableFamilyFields row', () => {
  const implemented = {
    controlId: 'spacing.rhythm',
    disposition: 'UNKNOWN',
    verificationState: 'IMPLEMENTED',
    mechanism: 'THEME_CONTROL',
    sourceBindings: [REAL_BINDING],
    stableParts: ['root'],
    propertyGroups: ['gap'],
    computedProperties: ['gap'],
  };
  assertNames(gradeCell(implemented).errors, 'spacing.rhythm IMPLEMENTED requires non-empty internalChannels');

  // APPLICABLE below IMPLEMENTED is refused outright.
  assertNames(
    gradeCell({
      controlId: 'spacing.rhythm',
      disposition: 'APPLICABLE',
      verificationState: 'SOURCE_BOUND',
      sourceBindings: [REAL_BINDING],
    }).errors,
    'spacing.rhythm disposition APPLICABLE requires verificationState IMPLEMENTED or stronger',
  );

  // The static/DB binding split is what makes per-family equivalence checkable.
  const applicable = {
    ...implemented,
    disposition: 'APPLICABLE',
    internalChannels: [liveChannel()],
    familyId: 'primitive/layout/flex',
    states: ['scalar'],
    staticSourceBindings: [REAL_BINDING],
    negativeControls: ['numeric gaps remain exact'],
    stressCases: ['rtl'],
    evidenceIds: [],
    nextAction: 'PROVE',
  };
  assertNames(
    gradeCell(applicable).errors,
    'spacing.rhythm disposition APPLICABLE requires non-empty dbSourceBindings',
  );
  assertNames(
    gradeCell({ ...applicable, dbSourceBindings: ['packages/core/nope.ts'] }).errors,
    'dbSourceBindings',
    'does not resolve',
  );
  assertNames(
    gradeCell({ ...applicable, dbSourceBindings: [REAL_BINDING], familyId: 'primitive/layout/grid' }).errors,
    'declares familyId primitive/layout/grid, which is not the owning family primitive/layout/flex',
  );
  for (const field of APPLICABLE_FAMILY_FIELDS) {
    if (field === 'evidenceIds') continue;
    const stripped = { ...applicable, dbSourceBindings: [REAL_BINDING] };
    delete stripped[field];
    assertNames(gradeCell(stripped).errors, `APPLICABLE requires non-empty ${field}`);
  }
});

test('a negative disposition needs a measured negative proof, not a path that exists', () => {
  for (const disposition of ['NOT_APPLICABLE_WITH_REASON', 'INVARIANT_WITH_REASON']) {
    const bare = gradeCell({
      controlId: 'density.mode',
      disposition,
      verificationState: 'SOURCE_BOUND',
      sourceBindings: [REAL_BINDING],
    }).errors;
    assertNames(
      bare,
      `density.mode ${disposition} requires reason`,
      `density.mode ${disposition} requires non-empty negativeControls`,
      `density.mode ${disposition} requires non-empty evidenceIds`,
      'requires negativeProof',
      'an existing path is not proof',
    );

    const halfProof = gradeCell({
      controlId: 'density.mode',
      disposition,
      verificationState: 'SOURCE_BOUND',
      sourceBindings: [REAL_BINDING],
      reason: 'Flex owns no radius surface.',
      negativeControls: ['border-radius stays 0px'],
      evidenceIds: [],
      negativeProof: { measuredScope: 'root' },
    }).errors;
    assertNames(
      halfProof,
      'density.mode negativeProof requires non-empty measuredProperties',
      'density.mode negativeProof requires method',
    );
  }
});

test('a section at SOURCE_BOUND or above must carry resolving sourceBindings', () => {
  const options = {
    label: 'fixture.json',
    familyId: 'primitive/layout/flex',
    repositoryRoot: REPOSITORY_ROOT,
    contracts: { evidence: EVIDENCE_CONTRACT, rounds: { rounds: [] }, inventory: { rows: [] } },
    now: new Date(),
  };
  assertNames(
    validateSection({ assessmentState: 'SOURCE_BOUND' }, 'instanceApi', options),
    'instanceApi assessmentState SOURCE_BOUND requires non-empty sourceBindings',
  );
  assertNames(
    validateSection({ assessmentState: 'SOURCE_BOUND', sourceBindings: ['packages/core/nope.ts'] }, 'invariants', options),
    'invariants',
    'does not resolve',
  );
  assert.deepEqual(
    validateSection({ assessmentState: 'UNKNOWN' }, 'statesMotion', options),
    [],
    'UNKNOWN may still be incomplete',
  );
  assert.deepEqual(
    validateSection({ assessmentState: 'SOURCE_BOUND', sourceBindings: [REAL_BINDING] }, 'anatomy', options),
    [],
  );
});

test('maximumClaim may not exceed the strongest state the family actually reaches', () => {
  const family = {
    maximumClaim: 'ASSESSED',
    themeControls: [{ controlId: 'spacing.rhythm', verificationState: 'SOURCE_BOUND' }],
    anatomy: { assessmentState: 'SOURCE_BOUND' },
    recipeAnatomy: { assessmentState: 'UNKNOWN' },
    instanceApi: { assessmentState: 'UNKNOWN' },
    hostAdaptation: { assessmentState: 'UNKNOWN' },
    statesMotion: { assessmentState: 'UNKNOWN' },
    invariants: { assessmentState: 'UNKNOWN' },
  };
  assertNames(
    validateMaximumClaim(family, { label: 'fixture.json' }),
    'maximumClaim ASSESSED exceeds the strongest state',
    'SOURCE_BOUND allows at most SOURCE_BOUND',
  );
  assert.deepEqual(validateMaximumClaim({ ...family, maximumClaim: 'SOURCE_BOUND' }, { label: 'x' }), []);
  assert.equal(MAXIMUM_CLAIM_BY_ASSESSMENT_STATE.IMPLEMENTED, 'ASSESSED');
});

// ---------------------------------------------------------------------------
// Rule 2 — internal channels
// ---------------------------------------------------------------------------

test('an internal channel edge must carry every internalChannelFields entry', () => {
  for (const field of INTERNAL_CHANNEL_FIELDS) {
    const edge = liveChannel();
    delete edge[field];
    const { errors } = gradeCell({
      controlId: 'spacing.rhythm',
      disposition: 'UNKNOWN',
      verificationState: 'UNKNOWN',
      unknownReason: 'PENDING',
      internalChannels: [edge],
    });
    assertNames(errors, `is missing ${field}`);
  }
});

test('a channel is refused when its id, semantic owner, consumers or disposition do not hold up', () => {
  const grade = (edge) =>
    gradeCell({
      controlId: 'spacing.rhythm',
      disposition: 'UNKNOWN',
      verificationState: 'UNKNOWN',
      unknownReason: 'PENDING',
      internalChannels: [edge],
    }).errors;

  assertNames(grade(liveChannel({ channelId: 'rhythm-scale' })), '"rhythm-scale"', CHANNEL_PREFIXES[0]);
  assertNames(
    grade(liveChannel({ semanticOwner: 'spacing.cadence' })),
    'names semanticOwner spacing.cadence, which is not an active control manifest id',
  );
  assertNames(
    grade(liveChannel({ producer: 'packages/core/not-here.ts' })),
    '--ds-rhythm-effective-scale producer does not resolve',
  );
  assertNames(
    grade(liveChannel({ fallbackAuthority: 'packages/core/not-here.css' })),
    'fallbackAuthority does not resolve',
    'declare null when the channel has no fallback authority',
  );
  assertNames(
    grade(liveChannel({ productiveConsumerFamilyIds: [] })),
    '--ds-rhythm-effective-scale declares no productiveConsumerFamilyIds, so it is a dead channel',
  );
  assertNames(
    grade(liveChannel({ productiveConsumerFamilyIds: ['primitive/layout/nope'] })),
    '"primitive/layout/nope"',
    'is not a canonical family id',
  );
  assertNames(
    grade(liveChannel({ replacementDisposition: { state: 'ALIAS' } })),
    'replacementDisposition.state "ALIAS"',
  );
  assertNames(
    grade(liveChannel({ replacementDisposition: { state: 'RETIRED', reason: 'superseded' } })),
    'replacementDisposition RETIRED requires replacedBy, or an explicit null',
  );
  assertNames(
    grade(liveChannel({ replacementDisposition: { state: 'REQUIRED_ADDITION' } })),
    'replacementDisposition REQUIRED_ADDITION requires reason',
  );
  assert.deepEqual(grade(liveChannel()), []);
  assert.deepEqual([...CHANNEL_REPLACEMENT_STATES], ['LIVE', 'REQUIRED_ADDITION', 'RETIRED']);
});

test('cardinalityLaw: a channel may have many consumers but never competing semantic owners', () => {
  const errors = validateInternalChannelLaws([
    { channelId: '--ds-rhythm-effective-scale', semanticOwner: 'spacing.rhythm', owner: 'flex/spacing.rhythm', state: 'LIVE' },
    { channelId: '--ds-rhythm-effective-scale', semanticOwner: 'spacing.rhythm', owner: 'grid/spacing.rhythm', state: 'LIVE' },
    { channelId: '--ds-rhythm-effective-scale', semanticOwner: 'density.mode', owner: 'stack/density.mode', state: 'LIVE' },
  ]);
  assertNames(
    errors,
    'channel --ds-rhythm-effective-scale has competing semantic owners',
    'spacing.rhythm (flex/spacing.rhythm)',
    'density.mode (stack/density.mode)',
  );
  assert.equal(errors.length, 1, 'two agreeing owners are not a conflict');
});

test('a retired channel may not still be alive anywhere in the manifest', () => {
  assertNames(
    validateInternalChannelLaws([
      { channelId: '--ds-legacy-gap', semanticOwner: 'spacing.rhythm', owner: 'flex/spacing.rhythm', state: 'RETIRED' },
      { channelId: '--ds-legacy-gap', semanticOwner: 'spacing.rhythm', owner: 'grid/spacing.rhythm', state: 'LIVE' },
    ]),
    'channel --ds-legacy-gap is retired by flex/spacing.rhythm but is still declared LIVE by grid/spacing.rhythm',
  );
  assert.deepEqual(
    validateInternalChannelLaws([
      { channelId: '--ds-legacy-gap', semanticOwner: 'spacing.rhythm', owner: 'flex/spacing.rhythm', state: 'RETIRED' },
    ]),
    [],
  );
});

// ---------------------------------------------------------------------------
// Rule 3 — reverse source -> inventory correspondence
// ---------------------------------------------------------------------------

test('a new family-shaped source directory cannot sit outside the inventory', () => {
  const { root, inventory } = sourceTreeFixture();
  const errors = checkSourceInventoryCorrespondence({ repositoryRoot: root, inventory });
  assertNames(errors, 'source family directory is claimed by no family-inventory.json row', 'ui/primitives/display/Sparkle');

  const claim = (id, owner) => ({ id, sourceRoot: 'ui/primitives', sourceOwner: owner, resolvedBy: 'folder-slug' });
  const claimed = {
    rows: [
      ...inventory.rows,
      claim('primitive/display/sparkle', 'ui/primitives/display/Sparkle'),
      claim('primitive/display/forked-avatar', 'ui/primitives/display/ForkedAvatar'),
    ],
  };
  assert.deepEqual(checkSourceInventoryCorrespondence({ repositoryRoot: root, inventory: claimed }), []);
});

test('a forwarding compatibility surface is not a family, but the same shape that implements is', () => {
  const { root, inventory } = sourceTreeFixture();
  const errors = checkSourceInventoryCorrespondence({ repositoryRoot: root, inventory });

  // LegacyAvatar has the full family SHAPE — engines/, contracts/, a component-shaped export —
  // but every production entrypoint only re-exports, so it is a retained import path.
  assert.equal(
    errors.some((error) => error.includes('LegacyAvatar')),
    false,
    `a forwarding compatibility surface must not be reported; got ${JSON.stringify(errors, null, 2)}`,
  );

  // ForkedAvatar has the SAME shape but its engine declares a real component, so a second
  // implementation can never hide behind the compatibility predicate.
  assertNames(
    errors,
    'source family directory is claimed by no family-inventory.json row: ui/primitives/display/ForkedAvatar',
  );

  assert.deepEqual(
    errors.map((error) => error.split(': ').at(-1)).sort(),
    ['ui/primitives/display/ForkedAvatar', 'ui/primitives/display/Sparkle'],
    'exactly the two directories that implement something of their own are findings',
  );
});

test('two folder-slug rows may not claim the same source directory', () => {
  const { root, inventory } = sourceTreeFixture();
  const doubled = {
    rows: [
      ...inventory.rows,
      { ...inventory.rows[0], id: 'primitive/display/avatar-again' },
      {
        id: 'primitive/display/sparkle',
        sourceRoot: 'ui/primitives',
        sourceOwner: 'ui/primitives/display/Sparkle',
        resolvedBy: 'folder-slug',
      },
    ],
  };
  assertNames(
    checkSourceInventoryCorrespondence({ repositoryRoot: root, inventory: doubled }),
    'is claimed by more than one folder-slug row',
    'primitive/display/avatar, primitive/display/avatar-again',
  );
});

// ---------------------------------------------------------------------------
// Rule 4 — evidence resolved by content
// ---------------------------------------------------------------------------

/** Grades one cell against a fixture repository instead of the real one. */
function gradeAgainst(fixture, state, overrides = {}) {
  const cell = {
    controlId: 'spacing.rhythm',
    disposition: 'UNKNOWN',
    verificationState: state,
    mechanism: 'THEME_CONTROL',
    sourceBindings: [fixture.binding],
    stableParts: ['root'],
    propertyGroups: ['gap'],
    computedProperties: ['gap'],
    internalChannels: [liveChannel({}, fixture.binding)],
    negativeControls: ['numeric gaps remain exact'],
    evidenceIds: fixture.evidenceIds,
    ...overrides,
  };
  return gradeCell(cell, { contracts: fixture.contracts, repositoryRoot: fixture.root }).errors;
}

test('evidence is accepted by receipt content, never by a path that exists', () => {
  const computedOnly = evidenceFixture({ computed: {} });

  // A path outside the declared evidence root is refused before it is ever read.
  assertNames(
    gradeAgainst(computedOnly, 'COMPUTED_VERIFIED', { evidenceIds: ['src/binding.ts'] }),
    'is outside the allowed evidence root',
  );

  // A receipt whose declared digest does not match the artifact bytes is refused.
  const tampered = evidenceFixture({ tampered: { artifactSha256: 'f'.repeat(64) } });
  assertNames(gradeAgainst(tampered, 'COMPUTED_VERIFIED'), 'does not match declared');

  // A stale source digest is refused, so a receipt cannot outlive the source it measured.
  const stale = evidenceFixture({ stale: { sourceDigest: '0'.repeat(64) } });
  assertNames(gradeAgainst(stale, 'COMPUTED_VERIFIED'), 'source digest is stale');

  // A receipt bound to another family cannot be borrowed.
  const borrowed = evidenceFixture({ borrowed: { familyId: 'primitive/layout/grid' } });
  assertNames(
    gradeAgainst(borrowed, 'COMPUTED_VERIFIED'),
    'is bound to family primitive/layout/grid, not primitive/layout/flex',
  );

  // COMPUTED_VERIFIED needs a computed-delta receipt AND an exact-restore receipt.
  assertNames(
    gradeAgainst(computedOnly, 'COMPUTED_VERIFIED'),
    'requires a receipt whose evidenceKind proves exact restore',
  );
  const restoreOnly = evidenceFixture({ restored: { evidenceKind: 'exact-restore' } });
  assertNames(
    gradeAgainst(restoreOnly, 'COMPUTED_VERIFIED'),
    'requires a receipt whose evidenceKind proves computed deltas',
  );
  const both = evidenceFixture({ computed: {}, restored: { evidenceKind: 'exact-restore' } });
  assert.deepEqual(gradeAgainst(both, 'COMPUTED_VERIFIED'), []);
});

test('SIGHTED_ACCEPTED needs a sighted receipt the sighted approver did not produce', () => {
  const build = (producer) =>
    evidenceFixture({
      computed: {},
      restored: { evidenceKind: 'exact-restore' },
      sighted: { evidenceKind: 'sighted-acceptance', producer },
    });

  assertNames(
    gradeAgainst(build('Codex'), 'SIGHTED_ACCEPTED'),
    'producer must not be the sighted approver',
  );
  assert.deepEqual(gradeAgainst(build('lane-a'), 'SIGHTED_ACCEPTED'), []);

  const noSighted = evidenceFixture({ computed: {}, restored: { evidenceKind: 'exact-restore' } });
  assertNames(gradeAgainst(noSighted, 'SIGHTED_ACCEPTED'), 'requires a sighted receipt');
});

// ---------------------------------------------------------------------------
// Rule 5 — test-truth classification
// ---------------------------------------------------------------------------

test('a red-test classification without full authority may only allow NONE', () => {
  const complete = {
    testRef: REAL_BINDING,
    class: 'CURRENT_CONTRACT',
    authorityRef: 'README.md#test-truth-policy',
    measuredScope: 'computed gap on the Flex root',
    sourceSha: 'fb1e200ca7544e4b373bff28f50731fdb8a1609b',
    positiveControl: 'the same probe passes at rhythm=normal',
    allowedAction: 'FIX_SOURCE',
  };
  const grade = (record) =>
    validateRedTestClassifications([record], { label: 'fixture.json', repositoryRoot: REPOSITORY_ROOT });

  assert.deepEqual(grade(complete), []);

  for (const field of RED_TEST_REQUIRED_FIELDS) {
    const stripped = { ...complete };
    delete stripped[field];
    assertNames(
      grade(stripped),
      `is missing ${field}`,
      `so allowedAction must be NONE, got "FIX_SOURCE"`,
    );
    assert.deepEqual(
      grade({ ...stripped, allowedAction: 'NONE' }).filter((error) => error.includes('allowedAction')),
      [],
      'NONE is the honest action for an incomplete record',
    );
  }

  assertNames(
    grade({ ...complete, allowedAction: 'FIX_INSTRUMENT' }),
    'class CURRENT_CONTRACT permits allowedAction FIX_SOURCE, got "FIX_INSTRUMENT"',
  );
  assertNames(grade({ ...complete, class: 'FLAKY' }), '"FLAKY"', 'which is not one of');
  assertNames(
    grade({ ...complete, testRef: 'packages/core/no-such-test.ts' }),
    'does not resolve',
  );
  for (const [className, action] of Object.entries(RED_TEST_ALLOWED_ACTIONS)) {
    assert.deepEqual(grade({ ...complete, class: className, allowedAction: action }), []);
  }
});

// ---------------------------------------------------------------------------
// Rule 6 — duplicate-control orthogonality
// ---------------------------------------------------------------------------

test('two controls above the 0.80 consumer Jaccard ceiling must derive, merge or record an invariant', () => {
  const shared = ['primitive/layout/flex::gap', 'primitive/layout/grid::gap', 'primitive/layout/stack::gap'];
  const consumerSetsByControl = new Map([
    ['spacing.rhythm', new Set(shared)],
    ['spacing.cadence', new Set(shared)],
  ]);
  assertNames(
    validateControlOrthogonality({
      consumerSetsByControl,
      independentInvariantByControl: new Map(),
    }),
    'controls spacing.rhythm and spacing.cadence share 1.00 consumer/property-group Jaccard similarity',
  );
  assert.deepEqual(
    validateControlOrthogonality({
      consumerSetsByControl,
      independentInvariantByControl: new Map([
        ['spacing.cadence', 'Cadence moves vertical flow only; rhythm moves both axes.'],
      ]),
    }),
    [],
  );
  // Inert while nothing is APPLICABLE: two empty sets must never fabricate similarity.
  assert.deepEqual(
    validateControlOrthogonality({
      consumerSetsByControl: new Map([['a', new Set()], ['b', new Set()]]),
      independentInvariantByControl: new Map(),
    }),
    [],
  );
  // Below the ceiling is allowed.
  assert.deepEqual(
    validateControlOrthogonality({
      consumerSetsByControl: new Map([
        ['spacing.rhythm', new Set(shared)],
        ['density.mode', new Set([shared[0], 'primitive/layout/stack::control-size'])],
      ]),
      independentInvariantByControl: new Map(),
    }),
    [],
  );
});

// ---------------------------------------------------------------------------
// Vocabulary agreement — the schema documents exactly what the generator enforces
// ---------------------------------------------------------------------------

test('schema.json, customization-model.json and the generator vocabularies agree', () => {
  assert.deepEqual(SCHEMA.vocabulary.cellMechanisms, [...CELL_MECHANISMS]);
  assert.deepEqual(SCHEMA.vocabulary.channelPrefixes, [...CHANNEL_PREFIXES]);
  assert.deepEqual(SCHEMA.vocabulary.channelReplacementStates, [...CHANNEL_REPLACEMENT_STATES]);
  assert.deepEqual(SCHEMA.vocabulary.redTestClasses, [...RED_TEST_CLASSES]);
  assert.deepEqual(SCHEMA.vocabulary.redTestAllowedActions, { ...RED_TEST_ALLOWED_ACTIONS });
  assert.deepEqual(SCHEMA.vocabulary.redTestRequiredFields, [...RED_TEST_REQUIRED_FIELDS]);
  assert.deepEqual(SCHEMA.vocabulary.evidenceProofRoles, JSON.parse(JSON.stringify(EVIDENCE_PROOF_ROLES)));
  assert.deepEqual(SCHEMA.vocabulary.maximumClaimByAssessmentState, { ...MAXIMUM_CLAIM_BY_ASSESSMENT_STATE });

  // The field spellings are owned by customization-model.json, not minted here.
  assert.deepEqual(SCHEMA.vocabulary.applicableFamilyFields, MODEL.controlImpactContract.applicableFamilyFields);
  assert.deepEqual(SCHEMA.vocabulary.internalChannelFields, MODEL.controlImpactContract.internalChannelFields);
  assert.deepEqual([...APPLICABLE_FAMILY_FIELDS], MODEL.controlImpactContract.applicableFamilyFields);
  assert.deepEqual([...INTERNAL_CHANNEL_FIELDS], MODEL.controlImpactContract.internalChannelFields);

  // The forbidden family-edge set had THREE different spellings: the schema
  // listed three names, the generator checked two, and the model REQUIRED the
  // very fields the other two forbade. One owner now, mirrored into both.
  assert.deepEqual(
    [...FORBIDDEN_CONTROL_FAMILY_EDGE_FIELDS],
    MODEL.controlImpactContract.forbiddenControlSegmentFields,
  );
  assert.deepEqual(
    SCHEMA.segments.control.forbidden,
    MODEL.controlImpactContract.forbiddenControlSegmentFields,
  );
  assert.equal(
    Object.hasOwn(MODEL.controlImpactContract, 'requiredFields'),
    false,
    'requiredFields described the generated view while reading as an authored-segment requirement',
  );
  // The projection must not silently drop a field the model promises.
  for (const field of MODEL.controlImpactContract.generatedControlViewFields) {
    assert.ok(
      Object.hasOwn(INDEX.generatedControlFamilyView.controls[0], field),
      `the generated view is missing ${field}`,
    );
  }
  assert.deepEqual(
    [...SCHEMA.vocabulary.controlDispositions].sort(),
    [...MODEL.controlImpactContract.familyDispositionVocabulary].sort(),
  );
  assert.equal(SCHEMA.orthogonalityLaw.jaccardCeiling, 0.8);
  assert.match(MODEL.orthogonality.duplicateControlRule, /0\.80/);

  // The progress law the structural check depends on must not drift.
  assert.equal(SCHEMA.progressLaw.structuralCheckAllowsUnknown, true);
  assert.equal(SCHEMA.progressLaw.certificationRequiresUnknownZero, true);
  assert.equal(SCHEMA.progressLaw.bootstrapNeverOverwrites, true);
  assert.equal(SCHEMA.progressLaw.syncNeverDeletes, true);
});

// ---------------------------------------------------------------------------
// Rule 7 — cascade roots: an empty closed vocabulary must say why
// ---------------------------------------------------------------------------

/**
 * These grade a SYNTHETIC cascade root through the pure `validateCascadeRoot`
 * entrypoint. They deliberately do NOT plant mutations into
 * `manifest/cascade/roots/*.json` the way the program-check drills do: the
 * authored roots are a live, concurrently edited surface, and a drill that
 * writes and restores real files can only prove the law by racing whoever is
 * filling those vocabularies. rules.mjs is documented as pure with respect to
 * an explicit context object precisely so a fixture can be graded instead.
 */
const CASCADE_FIXTURE_SITE =
  'packages/core/scripts/quality-evidence/programs/modern-rescue/manifest/rules.mjs';

const CASCADE_FIXTURE_CONTEXT = Object.freeze({
  label: 'fixture/cascade/roots/fixture.axis.json',
  repositoryRoot: REPOSITORY_ROOT,
  activeControlIds: ['fixture.axis'],
  controlTier: 'standard',
  familyIds: new Set(),
  socketOwnership: new Map(),
});

function cascadeRootFixture(overrides = {}) {
  return {
    schemaVersion: 1,
    rootId: 'fixture.axis',
    tier: 'standard',
    rootChannel: {
      channel: '--ds-fixture-axis',
      emission: [{ kind: 'compiler-emit', site: CASCADE_FIXTURE_SITE }],
    },
    dependsOn: [],
    derivations: [],
    derivationsEmptyReason: 'fixture: no channel->channel edge is declared for this synthetic axis.',
    terminalReach: [],
    overlaps: [],
    ...overrides,
  };
}

const VARIANTS_HOLE = 'empty variants requires variantsEmptyReason';
const VARIANTS_LIE = 'variantsEmptyReason is declared while variants is non-empty';

const NAMED_VARIANT = Object.freeze({
  id: 'estandar',
  value: { level: 1 },
  effects: { '--ds-fixture-axis': '1' },
  pinned: {},
});

const VARIANTS_REASON =
  'CERO variantes por diseno: el eje es un escape hatch, no un vocabulario cerrado. Declarado en fuente, no tapado: packages/core/scripts/quality-evidence/programs/modern-rescue/manifest/rules.mjs:1.';

test('a cascade root with an empty vocabulary and no declared reason fails closed', () => {
  const errors = validateCascadeRoot(
    cascadeRootFixture({ variants: [] }),
    CASCADE_FIXTURE_CONTEXT,
  );
  assert.ok(
    errors.some((error) => error.includes(VARIANTS_HOLE)),
    `an empty variants without variantsEmptyReason must be rejected; got ${JSON.stringify(errors)}`,
  );
  // An ABSENT variants is the same silent hole as an empty one, not a way out.
  const absent = cascadeRootFixture();
  delete absent.variants;
  assert.ok(
    validateCascadeRoot(absent, CASCADE_FIXTURE_CONTEXT).some((error) =>
      error.includes(VARIANTS_HOLE),
    ),
    'an absent variants must fail exactly like an empty one',
  );
});

test('a cascade root with an empty vocabulary and a declared reason is accepted', () => {
  assert.deepEqual(
    validateCascadeRoot(
      cascadeRootFixture({ variants: [], variantsEmptyReason: VARIANTS_REASON }),
      CASCADE_FIXTURE_CONTEXT,
    ),
    [],
  );
});

test('a reason for a hole that does not exist is a declared lie and fails closed', () => {
  const errors = validateCascadeRoot(
    cascadeRootFixture({ variants: [NAMED_VARIANT], variantsEmptyReason: VARIANTS_REASON }),
    CASCADE_FIXTURE_CONTEXT,
  );
  assert.ok(
    errors.some((error) => error.includes(VARIANTS_LIE)),
    `variantsEmptyReason beside a non-empty vocabulary must be rejected; got ${JSON.stringify(errors)}`,
  );
});

test('a cascade root with a real vocabulary and no reason is accepted', () => {
  assert.deepEqual(
    validateCascadeRoot(
      cascadeRootFixture({ variants: [NAMED_VARIANT] }),
      CASCADE_FIXTURE_CONTEXT,
    ),
    [],
  );
});

test('variantsLaw stays optional, but an empty one is not a law', () => {
  // Optional: three of the twenty authored roots carry it, seventeen do not.
  assert.deepEqual(
    validateCascadeRoot(
      cascadeRootFixture({ variants: [NAMED_VARIANT] }),
      CASCADE_FIXTURE_CONTEXT,
    ),
    [],
  );
  for (const empty of ['', '   ', 42]) {
    assert.ok(
      validateCascadeRoot(
        cascadeRootFixture({ variants: [NAMED_VARIANT], variantsLaw: empty }),
        CASCADE_FIXTURE_CONTEXT,
      ).some((error) => error.includes('variantsLaw is optional')),
      `variantsLaw ${JSON.stringify(empty)} must be rejected as a non-law`,
    );
  }
  assert.deepEqual(
    validateCascadeRoot(
      cascadeRootFixture({
        variants: [NAMED_VARIANT],
        variantsLaw: 'Ninguna variante reordena DOM ni foco.',
      }),
      CASCADE_FIXTURE_CONTEXT,
    ),
    [],
  );
});

// ---------------------------------------------------------------------------
// Rule 8 — cascade roots: an empty derivation tail must say why
// ---------------------------------------------------------------------------

/**
 * The tail's own tooth. `derivationsEmptyReason` was the sibling BOTH the head
 * and the vocabulary cite by name, yet no line read it: five authored roots
 * declared it into a gate that never looked. These grade the same SYNTHETIC
 * root through the pure `validateCascadeRoot` entrypoint, for the same reason
 * the vocabulary tests do — `manifest/cascade/roots/*.json` is a live,
 * concurrently edited surface and must not be written by a test.
 *
 * `overlaps` has NO such test on purpose: `overlaps: []` is a complete
 * assertion, not a silent hole. See the rule's docstring in rules.mjs.
 */
const DERIVATIONS_HOLE = 'empty derivations requires derivationsEmptyReason';
const DERIVATIONS_LIE = 'derivationsEmptyReason is declared while derivations is non-empty';

const NAMED_DERIVATION = Object.freeze({
  from: '--ds-fixture-axis',
  to: '--ds-fixture-axis-step',
  rule: { kind: 'calc-multiply', factor: 2 },
  state: 'LIVE',
  site: CASCADE_FIXTURE_SITE,
});

const DERIVATIONS_REASON =
  'CERO derivaciones por diseno: el eje emite su canal cabeza y nadie deriva de el. Declarado en fuente, no tapado: packages/core/scripts/quality-evidence/programs/modern-rescue/manifest/rules.mjs:1.';

test('a cascade root with an empty derivation tail and no declared reason fails closed', () => {
  const empty = cascadeRootFixture({ derivations: [] });
  delete empty.derivationsEmptyReason;
  const errors = validateCascadeRoot(empty, CASCADE_FIXTURE_CONTEXT);
  assert.ok(
    errors.some((error) => error.includes(DERIVATIONS_HOLE)),
    `an empty derivations without derivationsEmptyReason must be rejected; got ${JSON.stringify(errors)}`,
  );
  // An ABSENT derivations is the same silent hole as an empty one, not a way out.
  const absent = cascadeRootFixture();
  delete absent.derivations;
  delete absent.derivationsEmptyReason;
  assert.ok(
    validateCascadeRoot(absent, CASCADE_FIXTURE_CONTEXT).some((error) =>
      error.includes(DERIVATIONS_HOLE),
    ),
    'an absent derivations must fail exactly like an empty one',
  );
  // A blank reason is not a reason, exactly as for the head and the vocabulary.
  for (const blank of ['', '   ', 42]) {
    assert.ok(
      validateCascadeRoot(
        cascadeRootFixture({ derivations: [], derivationsEmptyReason: blank }),
        CASCADE_FIXTURE_CONTEXT,
      ).some((error) => error.includes(DERIVATIONS_HOLE)),
      `derivationsEmptyReason ${JSON.stringify(blank)} must be rejected as a non-reason`,
    );
  }
});

test('a cascade root with an empty derivation tail and a declared reason is accepted', () => {
  assert.deepEqual(
    validateCascadeRoot(
      cascadeRootFixture({
        variants: [NAMED_VARIANT],
        derivations: [],
        derivationsEmptyReason: DERIVATIONS_REASON,
      }),
      CASCADE_FIXTURE_CONTEXT,
    ),
    [],
  );
});

test('a reason for a derivation hole that does not exist is a declared lie and fails closed', () => {
  const errors = validateCascadeRoot(
    cascadeRootFixture({
      derivations: [NAMED_DERIVATION],
      derivationsEmptyReason: DERIVATIONS_REASON,
    }),
    CASCADE_FIXTURE_CONTEXT,
  );
  assert.ok(
    errors.some((error) => error.includes(DERIVATIONS_LIE)),
    `derivationsEmptyReason beside a non-empty tail must be rejected; got ${JSON.stringify(errors)}`,
  );
});

test('a cascade root with a real derivation tail and no reason is accepted', () => {
  const live = cascadeRootFixture({ variants: [NAMED_VARIANT], derivations: [NAMED_DERIVATION] });
  delete live.derivationsEmptyReason;
  assert.deepEqual(validateCascadeRoot(live, CASCADE_FIXTURE_CONTEXT), []);
});
