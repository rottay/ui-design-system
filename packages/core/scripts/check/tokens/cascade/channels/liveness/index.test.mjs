import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, sep } from 'node:path';

import {
  // parsing primitives
  extractBracketBlock,
  splitTopLevelListItems,
  extractFlatLiteralArray,
  // DECLARED
  extractOverrideTokens,
  extractReferenceTokens,
  DEFAULT_TENANT_THEME_CONTRACT,
  // EMITTED
  extractTintRampEmissions,
  extractDirectVarsAssignments,
  extractInterpolatedAssignments,
  findUnresolvedInterpolatedAssignments,
  findDuplicateTintScales,
  findDuplicateDirectAssignments,
  findTintDirectOverlap,
  DEFAULT_BRAND_THEME_COMPILER_ROOT,
  collectBrandThemeCompilerSources,
  extractIdentifierVarsAssignments,
  extractKeyedVarsEmissions,
  findCrossFileProducerCollisions,
  // corpus
  isScannableCorpusFile,
  collectSourceFiles,
  readStylesheets,
  classifyConsumerScope,
  FROZEN_ENGINE_PATH,
  MODERN_ENGINE_PATH,
  DEFAULT_CSS_ROOTS,
  CORE_ROOT,
  REPO_ROOT,
  siblingReposRoot,
  // paint graph (defect 1)
  buildPaintGraph,
  computePaint,
  scanTsReads,
  // family attribution (defect 4)
  loadFamilyRows,
  buildFamilyIndex,
  attributeFamily,
  DEFAULT_FAMILY_INVENTORY,
  // semantic owner (defect 4)
  classifySemanticOwner,
  SEMANTIC_OWNER_RULES,
  // classification (defects 3, 8)
  LIVENESS,
  LIVE_CLASSIFICATIONS,
  UNPROVEN_CLASSIFICATIONS,
  STRUCTURAL_CLASSIFICATIONS,
  classifyLiveness,
  deriveCanonicalZScaleRoster,
  DEFAULT_Z_INDEX_SCALE_OWNER,
  // disposition registry -- ownership of every standing non-LIVE row
  CHANNEL_DISPOSITIONS,
  DISPOSITION_OWNER_PATTERN,
  buildDispositionIndex,
  adjudicateDispositions,
  dispositionFailures,
  assessChannelEffect,
  mayWriteArtifact,
  // digest + ratchet (defects 2, 6, 7)
  computeInputsDigest,
  compareAgainstPrevious,
  // consumerRoots (defect 7)
  loadConsumerRootCorpus,
  DEFAULT_CONSUMER_ROOTS,
  // analyzer + CLI plumbing
  analyzeChannelLiveness,
  runGate,
  buildArtifact,
  formatReport,
  resolveCurrentRound,
  defaultArtifactPath,
  DEFAULT_EVIDENCE_ROOT,
  DEFAULT_ROUND,
  ARTIFACT_FILE_NAME,
} from './index.mjs';

/* ---------------------------------------------------------------------- */
/* Shared hermetic fixtures                                               */
/* ---------------------------------------------------------------------- */

const FIXTURE_TENANT_THEME_SOURCE = `
export const TENANT_THEME_OVERRIDE_TOKENS = [
  "--ds-color-primary",
  "--ds-surface-panel",
] as const;

export const TENANT_THEME_REFERENCE_TOKENS = new Set([
  ...TENANT_THEME_OVERRIDE_TOKENS,
  "--ds-tint-4",
  "--ds-tint-16",
]);
`;

const FIXTURE_BRAND_THEME_SOURCE = `
function setTintRampVariables(vars, scale, colorVar) {
  vars[\`\${scale}-4\`] = tintStep(colorVar, 4);
  vars[\`\${scale}-8\`] = tintStep(colorVar, 8);
}
setTintRampVariables(vars, "--ds-tint", "--ds-color-primary-500");

vars["--ds-color-primary"] = "#111111";
vars["--ds-surface-panel"] = "#eeeeee";
`;

const FIXTURE_FAMILY_ROWS = [
  { id: 'primitive/display/button', sourceOwner: 'packages/core/src/components/primitives/display/Button' },
  { id: 'primitive/display/badge', sourceOwner: 'packages/core/src/components/primitives/display/Badge' },
  // A SHARED owner: two canonical ids, one sourceOwner folder (defect 4 fixture).
  { id: 'pattern/data/table-a', sourceOwner: 'packages/core/src/components/patterns/data/SharedFolder' },
  { id: 'pattern/data/table-b', sourceOwner: 'packages/core/src/components/patterns/data/SharedFolder' },
];

function css(file, text) {
  return { file, text };
}

/* ---------------------------------------------------------------------- */
/* 1. Parsing primitives (unchanged low-level helpers)                    */
/* ---------------------------------------------------------------------- */

test('extractBracketBlock slices a balanced bracket block and skips quoted brackets', () => {
  const src = 'const X = ["a]b", "c"];';
  const block = extractBracketBlock(src, 'X = [', '[', ']');
  assert.equal(block, '"a]b", "c"');
});

test('extractBracketBlock returns null when the marker or a balanced close is missing', () => {
  assert.equal(extractBracketBlock('const X = [', 'X = [', '[', ']'), null);
  assert.equal(extractBracketBlock('no marker here', 'X = [', '[', ']'), null);
});

test('splitTopLevelListItems keeps nested calls, arrays and template interpolation as one element', () => {
  const items = splitTopLevelListItems('"a", ROLES.flatMap((r) => [`x-${r}-y`, "z"]), "b"');
  assert.deepEqual(items, ['"a"', 'ROLES.flatMap((r) => [`x-${r}-y`, "z"])', '"b"']);
});

test('extractFlatLiteralArray reads a flat const array of strings or numbers', () => {
  const src = 'export const NAME = ["a", "b", 1, 2] as const;';
  assert.deepEqual(extractFlatLiteralArray(src, 'NAME'), ['a', 'b', '1', '2']);
});

/* ---------------------------------------------------------------------- */
/* 2. DECLARED extraction                                                 */
/* ---------------------------------------------------------------------- */

test('extractOverrideTokens resolves literal entries', () => {
  const { names, unresolvedSpreads } = extractOverrideTokens(FIXTURE_TENANT_THEME_SOURCE);
  assert.ok(names.has('--ds-color-primary'));
  assert.ok(names.has('--ds-surface-panel'));
  assert.deepEqual(unresolvedSpreads, []);
});

test('extractReferenceTokens is a superset of override tokens plus literal tint entries', () => {
  const { names: overrideNames } = extractOverrideTokens(FIXTURE_TENANT_THEME_SOURCE);
  const { names, unresolvedSpreads } = extractReferenceTokens(FIXTURE_TENANT_THEME_SOURCE, overrideNames);
  assert.ok(names.has('--ds-color-primary'));
  assert.ok(names.has('--ds-tint-4'));
  assert.ok(names.has('--ds-tint-16'));
  assert.deepEqual(unresolvedSpreads, []);
});

test('RED: a missing TENANT_THEME_OVERRIDE_TOKENS declaration fails closed, not silently empty', () => {
  assert.throws(() => extractOverrideTokens('export const SOMETHING_ELSE = [];'));
});

test('LIVE: the real tenant-theme contract resolves both token lists well past a literal-only scan', () => {
  const source = readFileSync(DEFAULT_TENANT_THEME_CONTRACT, 'utf8');
  const { names: overrideNames, unresolvedSpreads: overrideUnresolved } = extractOverrideTokens(source);
  const { names: referenceNames, unresolvedSpreads: referenceUnresolved } = extractReferenceTokens(source, overrideNames);
  assert.ok(overrideNames.size > 100, `expected > 100 override names, got ${overrideNames.size}`);
  assert.ok(referenceNames.size >= overrideNames.size, 'reference tokens must be a superset of override tokens');
  assert.ok(referenceNames.has('--ds-tint-4'), '--ds-tint-4 must be a declared reference token');
  assert.ok(referenceNames.has('--ds-tint-16'), '--ds-tint-16 must be a declared reference token');
  assert.deepEqual(overrideUnresolved, [], `override tokens must resolve cleanly against the real contract today: ${JSON.stringify(overrideUnresolved)}`);
  assert.deepEqual(referenceUnresolved, [], `reference tokens must resolve cleanly against the real contract today: ${JSON.stringify(referenceUnresolved)}`);
});

/* ---------------------------------------------------------------------- */
/* 3. EMITTED extraction + defect 5 (duplicates / overlap / unresolved)   */
/* ---------------------------------------------------------------------- */

test('extractTintRampEmissions cross-multiplies literal call sites x literal suffixes', () => {
  const { names, suffixes, callSites } = extractTintRampEmissions(FIXTURE_BRAND_THEME_SOURCE);
  assert.deepEqual(suffixes, ['-4', '-8']);
  assert.equal(callSites.length, 1);
  assert.ok(names.has('--ds-tint-4'));
  assert.ok(names.has('--ds-tint-8'));
});

test('extractDirectVarsAssignments finds both quote styles with line numbers', () => {
  const sites = extractDirectVarsAssignments(FIXTURE_BRAND_THEME_SOURCE);
  assert.ok(sites.has('--ds-color-primary'));
  assert.ok(sites.has('--ds-surface-panel'));
});

test('extractInterpolatedAssignments finds vars[`...`] template assignments with raw text', () => {
  const src = 'vars[`${prefix}-background`] = x; vars[`${scale}-4`] = tintStep(c, 4);';
  const sites = extractInterpolatedAssignments(src);
  assert.deepEqual(sites.map((s) => s.raw), ['${prefix}-background', '${scale}-4']);
});

test('defect 5: findUnresolvedInterpolatedAssignments excludes ONLY the modeled tint-ramp shape', () => {
  const src = 'vars[`${prefix}-background`] = x; vars[`${scale}-4`] = y; vars[`${role}-${step}`] = z;';
  const unresolved = findUnresolvedInterpolatedAssignments(src);
  assert.deepEqual(unresolved.map((s) => s.raw), ['${prefix}-background', '${role}-${step}']);
});

test('defect 5: findDuplicateTintScales fires on ANY repeated scale, matching colorVar or not', () => {
  assert.deepEqual(findDuplicateTintScales([{ scale: '--ds-tint', colorVar: '--x', line: 1 }]), []);
  const sameColor = findDuplicateTintScales([
    { scale: '--ds-tint', colorVar: '--x', line: 1 },
    { scale: '--ds-tint', colorVar: '--x', line: 5 },
  ]);
  assert.equal(sameColor.length, 1, 'a scale repeated with the SAME colorVar must still be flagged as a duplicate producer');
  const conflicting = findDuplicateTintScales([
    { scale: '--ds-tint', colorVar: '--x', line: 1 },
    { scale: '--ds-tint', colorVar: '--y', line: 5 },
  ]);
  assert.equal(conflicting.length, 1);
  assert.deepEqual(conflicting[0].colorVars.sort(), ['--x', '--y']);
});

test('defect 5: findDuplicateDirectAssignments fires when a name is assigned more than once', () => {
  const directEmission = new Map([
    ['--ds-a', [{ line: 1 }]],
    ['--ds-b', [{ line: 2 }, { line: 9 }]],
  ]);
  const duplicates = findDuplicateDirectAssignments(directEmission);
  assert.equal(duplicates.length, 1);
  assert.equal(duplicates[0].name, '--ds-b');
});

test('defect 5: findTintDirectOverlap fires when a name is emitted by BOTH mechanisms', () => {
  const tintNames = new Set(['--ds-tint-4', '--ds-tint-8']);
  const directEmission = new Map([['--ds-tint-4', [{ line: 1 }]]]);
  assert.deepEqual(findTintDirectOverlap(tintNames, directEmission), ['--ds-tint-4']);
  assert.deepEqual(findTintDirectOverlap(new Set(['--ds-tint-4']), new Map()), []);
});

test('LIVE: the real brand-theme compiler registers zero duplicate tint-scale producers', () => {
  const callSites = collectBrandThemeCompilerSources().flatMap(
    (source) => extractTintRampEmissions(source.text).callSites,
  );
  assert.deepEqual(findDuplicateTintScales(callSites), []);
});

test('LIVE: every family deriver declares a rank, and none is unranked', () => {
  const sources = collectBrandThemeCompilerSources();
  assert.ok(sources.length > 0, 'the derivation registry resolved to zero families');
  const unranked = sources.filter((source) => source.rank === 'unranked').map((s) => s.relativePath);
  assert.deepEqual(unranked, [], `every family deriver must declare a merge rank, unranked: ${unranked.join(', ')}`);
});

/* ---------------------------------------------------------------------- */
/* 3b. Producer discovery: nested owners and non-literal emission keys    */
/* ---------------------------------------------------------------------- */

/** A registry whose family holds its emissions in a SUB-owner, as the real one does. */
function plantNestedRegistry() {
  const root = mkdtempSync(join(tmpdir(), 'liveness-registry-'));
  mkdirSync(join(root, 'typography', 'weights'), { recursive: true });
  writeFileSync(
    join(root, 'typography', 'index.ts'),
    'export const typographyDeriver = { family: "typography", rank: "derived" };\n'
    + 'export const derive = () => ({ ...deriveWeights() });\n',
  );
  writeFileSync(
    join(root, 'typography', 'weights', 'index.ts'),
    'export function deriveWeights(vars) {\n  vars["--ds-font-weight-heading"] = "700";\n}\n',
  );
  return root;
}

test('NEGATIVE CONTROL: a family that emits from a SUB-owner is not an empty family', () => {
  // The 2026-09-09 cascade checkpoint's blind spot: the walk read
  // `<root>/<family>/index.ts` only, so a parent that merely composes its
  // sub-owners looked like a family that emits nothing and every channel behind
  // it left the census.
  const root = plantNestedRegistry();
  try {
    const sources = collectBrandThemeCompilerSources(root);
    const nested = sources.find((source) => source.relativePath.endsWith('typography/weights/index.ts'));
    assert.ok(nested, `the sub-owner must be discovered, got: ${sources.map((s) => s.relativePath).join(', ')}`);
    // A layer of one authority carries that authority's rank; it does not
    // become a second, unranked producer.
    assert.equal(nested.rank, 'derived');
    assert.equal(nested.family, 'typography');
    assert.equal(nested.declaresRank, false);
    const emitted = new Set(sources.flatMap((source) => [...extractDirectVarsAssignments(source.text).keys()]));
    assert.ok(emitted.has('--ds-font-weight-heading'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('LIVE: the real registry reaches its sub-owners, and every one inherits a real rank', () => {
  const sources = collectBrandThemeCompilerSources();
  const nested = sources.filter((source) => !source.declaresRank).map((source) => source.relativePath);
  assert.ok(
    nested.some((path) => path.endsWith('derivation/typography/weights/index.ts')),
    `the recursive walk must reach typography/weights, reached: ${nested.join(', ')}`,
  );
  assert.ok(
    nested.some((path) => path.endsWith('derivation/elevation/z-index/index.ts')),
    'the recursive walk must reach elevation/z-index',
  );
  assert.deepEqual(sources.filter((source) => source.rank === 'unranked'), []);
});

test('a roster membership guard resolves to the roster it names', () => {
  const source = [
    'const PAIRING = new Set<string>(["--ds-font-family-base", "--ds-line-height-display"]);',
    'export function derive(vars, table) {',
    '  for (const [channel, value] of Object.entries(table)) {',
    '    if (PAIRING.has(channel)) vars[channel] = value;',
    '  }',
    '}',
  ].join('\n');
  const { resolved, unresolved } = extractKeyedVarsEmissions(source);
  assert.deepEqual([...resolved.keys()].sort(), ['--ds-font-family-base', '--ds-line-height-display']);
  assert.deepEqual(unresolved, []);
});

test('CONTROL: a NEGATED membership guard is reported, never guessed at', () => {
  // The complement of a roster over a table computed elsewhere is not
  // enumerable from source. `axes/index.ts` is the real instance.
  const source = [
    'const FOREIGN = new Set<string>(["--ds-font-family-base"]);',
    'export function derive(vars, table) {',
    '  for (const [channel, value] of Object.entries(table)) {',
    '    if (!FOREIGN.has(channel)) vars[channel] = value;',
    '  }',
    '}',
  ].join('\n');
  const { resolved, unresolved } = extractKeyedVarsEmissions(source);
  assert.equal(resolved.size, 0);
  assert.equal(unresolved.length, 1);
  assert.match(unresolved[0].reason, /COMPLEMENT/);
});

test('a template over a literal table resolves to one name per key', () => {
  const source = [
    'const BANDS = Object.freeze({ base: 0, modal: 1500, max: 9999 });',
    'export function derive(vars) {',
    '  for (const [band, value] of Object.entries(BANDS)) {',
    '    vars[`--ds-z-index-${band}`] = String(value);',
    '  }',
    '}',
  ].join('\n');
  const { resolved, unresolved } = extractKeyedVarsEmissions(source);
  assert.deepEqual([...resolved.keys()].sort(), ['--ds-z-index-base', '--ds-z-index-max', '--ds-z-index-modal']);
  assert.deepEqual(unresolved, []);
});

test('CONTROL: a template over a table filled at RUNTIME stays an unresolved pattern', () => {
  // `typography/scale` declares `const entries: string[] = []` and fills it in a
  // loop. Reading that initializer literally would certify "emits nothing" for a
  // template that emits the whole type ramp, so an empty domain is refused.
  const source = [
    'export function derive(vars, table) {',
    '  const entries: string[] = [];',
    '  for (const [channel] of Object.entries(table)) entries.push(channel);',
    '  for (const name of entries) vars[`--ds-text-${name}`] = "x";',
    '}',
  ].join('\n');
  const { resolved, unresolved } = extractKeyedVarsEmissions(source);
  assert.equal(resolved.size, 0);
  assert.equal(unresolved.length, 1);
  assert.match(unresolved[0].reason, /NON-EMPTY/);
});

test('extractIdentifierVarsAssignments reads a named constant key and its guard', () => {
  const source = [
    'const DENSITY = "--ds-density-mode-factor";',
    'export function derive(vars) { vars[DENSITY] = "1"; }',
  ].join('\n');
  assert.deepEqual(
    extractIdentifierVarsAssignments(source).map((site) => ({ key: site.key, guard: site.guard })),
    [{ key: 'DENSITY', guard: null }],
  );
  assert.deepEqual([...extractKeyedVarsEmissions(source).resolved.keys()], ['--ds-density-mode-factor']);
});

test('findCrossFileProducerCollisions fires across FILES at one rank, not within one', () => {
  // Two writes to one channel inside a single owner are sequential refinement
  // (`typography/pairing` sets a posture floor, then an authored ceiling).
  // Two different family files at one rank have no such order.
  const one = new Map([['--ds-x', [{ file: 'a/index.ts', rank: 'derived' }, { file: 'a/index.ts', rank: 'derived' }]]]);
  assert.deepEqual(findCrossFileProducerCollisions(one, new Map()), []);
  const two = new Map([['--ds-x', [{ file: 'b/index.ts', rank: 'derived' }]]]);
  assert.deepEqual(findCrossFileProducerCollisions(one, two), [
    { name: '--ds-x', rank: 'derived', files: ['a/index.ts', 'b/index.ts'] },
  ]);
});

test('LIVE: the shapes the old walk could not see are in the emitted universe, with owners', () => {
  const sources = collectBrandThemeCompilerSources();
  const emitted = new Set(sources.flatMap((source) => [
    ...extractDirectVarsAssignments(source.text).keys(),
    ...extractKeyedVarsEmissions(source.text, { file: source.path }).resolved.keys(),
  ]));
  for (const name of [
    '--ds-font-weight-heading',      // a sub-owner literal assignment
    '--ds-elevation-border-style',   // a sub-owner roster membership guard
    '--ds-z-index-modal',            // a sub-owner template over a literal table
    '--ds-breakpoint-sm',            // a top-level template over an IMPORTED table
    '--ds-density-mode-factor',      // a top-level named-constant key
  ]) {
    assert.ok(emitted.has(name), `${name} must be visible to the producer census`);
    assert.notEqual(classifySemanticOwner(name), null, `${name} must resolve to a semantic owner`);
  }
});

test('LIVE: no channel is produced twice at one rank across the derivation registry', () => {
  const directEmission = new Map();
  for (const source of collectBrandThemeCompilerSources()) {
    for (const [name, sites] of extractDirectVarsAssignments(source.text)) {
      const merged = directEmission.get(name) ?? [];
      for (const site of sites) merged.push({ ...site, file: source.relativePath, rank: source.rank });
      directEmission.set(name, merged);
    }
  }
  assert.deepEqual(findDuplicateDirectAssignments(directEmission), []);
});

/* ---------------------------------------------------------------------- */
/* 4. Corpus collection                                                   */
/* ---------------------------------------------------------------------- */

test('isScannableCorpusFile excludes generated/dist/tests/fixtures and test/story files', () => {
  assert.equal(isScannableCorpusFile('src/components/primitives/display/Button/index.tsx', 'index.tsx'), true);
  assert.equal(isScannableCorpusFile('src/components/primitives/display/Button/index.test.tsx', 'index.test.tsx'), false);
  assert.equal(isScannableCorpusFile('src/components/generated/foo.css', 'foo.css'), false);
  assert.equal(isScannableCorpusFile('src/components/tests/foo.css', 'foo.css'), false);
  assert.equal(isScannableCorpusFile('facade/artifacts/bithire/index.css', 'index.css'), false);
});

test('classifyConsumerScope: frozen engines, modern engine, and engine-neutral are mutually exclusive', () => {
  assert.equal(classifyConsumerScope('src/components/primitives/display/Button/engines/classic/index.tsx'), 'frozen-engine');
  assert.equal(classifyConsumerScope('src/components/primitives/display/Button/engines/rustic/index.tsx'), 'frozen-engine');
  assert.equal(classifyConsumerScope('src/components/primitives/display/Button/engines/modern/index.tsx'), 'modern-engine');
  assert.equal(classifyConsumerScope('src/foundation/tokens/css/theme.css'), 'engine-neutral');
  assert.ok(FROZEN_ENGINE_PATH.test('engines/classic/index.tsx'));
  assert.ok(MODERN_ENGINE_PATH.test('engine-styles/modern/index.css'));
});

test('collectSourceFiles requires an explicit baseRoot and excludes generated/test output', () => {
  const files = collectSourceFiles(DEFAULT_CSS_ROOTS, ['.css'], CORE_ROOT);
  assert.ok(files.length > 10, 'expected a real CSS corpus under the DS roots');
  assert.ok(files.every((f) => !/\.test\.css$/.test(f)));
});

test('DEFAULT_CSS_ROOTS point at the two documented corpus roots under CORE_ROOT', () => {
  assert.ok(DEFAULT_CSS_ROOTS.every((root) => root.startsWith(CORE_ROOT)));
  assert.equal(DEFAULT_CSS_ROOTS.length, 2);
});

/* ---------------------------------------------------------------------- */
/* 5. THE PAINT GRAPH (defect 1: separate READ from terminal PAINT)       */
/* ---------------------------------------------------------------------- */

test('defect 1: a direct terminal read is immediate paint', () => {
  const graph = buildPaintGraph([css('a.css', ':root { color: var(--ds-x); }')]);
  const paint = computePaint(graph, '--ds-x');
  assert.equal(paint.painted, true);
  assert.equal(paint.terminalSites.length, 1);
  assert.equal(paint.terminalSites[0].prop, 'color');
});

test('defect 1: a channel that only feeds ANOTHER custom property, with no terminal consumer anywhere, is READ but NOT paint', () => {
  const graph = buildPaintGraph([css('a.css', ':root { --other: var(--ds-x); }')]);
  const paint = computePaint(graph, '--ds-x');
  assert.equal(paint.painted, false, 'no finite chain from --ds-x reaches a terminal declaration -- this must never count as PAINT');
  assert.equal(paint.terminalSites.length, 0);
  assert.ok(graph.customEdges.has('--ds-x'), 'the read itself must still be visible for READ_NO_PRODUCTIVE_TERMINAL provenance');
});

test('defect 1: a multi-hop chain that DOES reach a terminal counts as paint (channel -> private custom property -> terminal)', () => {
  const graph = buildPaintGraph([
    css('tokens.css', ':root { --ds-x: #111; --button-accent: var(--ds-x); }'),
    css('button.css', '.button { background: var(--button-accent); }'),
  ]);
  const paint = computePaint(graph, '--ds-x');
  assert.equal(paint.painted, true);
  assert.equal(paint.terminalSites[0].prop, 'background');
  assert.equal(paint.terminalSites[0].file, 'button.css');
});

test('defect 1: a cycle (a feeds b feeds a) with no terminal is finite and never paints -- BFS terminates, never hangs', () => {
  const graph = buildPaintGraph([css('cycle.css', ':root { --a: var(--b); --b: var(--a); }')]);
  const paint = computePaint(graph, '--a');
  assert.equal(paint.painted, false);
  assert.ok(paint.reachedCustomProps.length <= 2, 'the visited set must stay bounded despite the cycle');
});

test('defect 1: a cycle that ALSO reaches a terminal via one branch still paints (the cycle does not poison the whole chain)', () => {
  const graph = buildPaintGraph([
    css('cycle.css', ':root { --a: var(--b); --b: var(--a); }'),
    css('use.css', '.x { color: var(--b); }'),
  ]);
  const paint = computePaint(graph, '--a');
  assert.equal(paint.painted, true);
});

test('defect 1: comments never count -- a var() occurrence inside a CSS comment is not a PostCSS declaration value', () => {
  const graph = buildPaintGraph([css('a.css', '/* color: var(--ds-x); */ .y { color: red; }')]);
  const paint = computePaint(graph, '--ds-x');
  assert.equal(paint.painted, false);
  assert.equal(graph.customEdges.has('--ds-x'), false);
  assert.equal(graph.terminalEdges.has('--ds-x'), false);
});

test('defect 1: scanTsReads records raw TS/TSX var() occurrences, which are separately treated as READ_UNPROVEN, never paint', () => {
  const reads = scanTsReads([css('component.tsx', 'const s = { color: "var(--ds-x)" };')]);
  assert.ok(reads.has('--ds-x'));
  assert.equal(reads.get('--ds-x')[0].line, 1);
});

test('buildPaintGraph records a corpus parse error rather than silently skipping malformed CSS', () => {
  // An unterminated comment is a reliable PostCSS `CssSyntaxError` trigger.
  const graph = buildPaintGraph([css('broken.css', '.a { color: red; } /* never closed')]);
  assert.equal(graph.parseErrors.length, 1);
  assert.equal(graph.parseErrors[0].file, 'broken.css');
});

test('LIVE: buildPaintGraph resolves against the real DS corpus without throwing and finds at least one real terminal paint', () => {
  const files = collectSourceFiles(DEFAULT_CSS_ROOTS, ['.css'], CORE_ROOT);
  const stylesheets = readStylesheets(files, CORE_ROOT);
  const graph = buildPaintGraph(stylesheets, classifyConsumerScope);
  assert.deepEqual(graph.parseErrors, []);
  const paint = computePaint(graph, '--ds-color-primary');
  assert.ok(paint.terminalSites.length > 0 || graph.customEdges.has('--ds-color-primary'), 'expected --ds-color-primary to be read somewhere in the real corpus');
});

/* ---------------------------------------------------------------------- */
/* 6. Family attribution (defect 4: Set<canonicalId>, never one row)      */
/* ---------------------------------------------------------------------- */

test('defect 4: a SHARED sourceOwner returns ALL its canonical ids, never just the first row', () => {
  const index = buildFamilyIndex(FIXTURE_FAMILY_ROWS);
  const attribution = attributeFamily('packages/core/src/components/patterns/data/SharedFolder/index.tsx', index);
  assert.equal(attribution.status, 'resolved-shared');
  assert.deepEqual([...attribution.ids].sort(), ['pattern/data/table-a', 'pattern/data/table-b']);
});

test('attributeFamily resolves a non-shared sourceOwner to exactly one id, status "resolved"', () => {
  const index = buildFamilyIndex(FIXTURE_FAMILY_ROWS);
  const attribution = attributeFamily('packages/core/src/components/primitives/display/Button/engines/modern/index.tsx', index);
  assert.equal(attribution.status, 'resolved');
  assert.deepEqual([...attribution.ids], ['primitive/display/button']);
});

test('attributeFamily resolves the LONGEST sourceOwner prefix when multiple prefixes could match', () => {
  const rows = [
    { id: 'pattern/data/table', sourceOwner: 'packages/core/src/components/patterns/data' },
    { id: 'pattern/data/pattern-data-table', sourceOwner: 'packages/core/src/components/patterns/data/PatternDataTable' },
  ];
  const index = buildFamilyIndex(rows);
  const attribution = attributeFamily('packages/core/src/components/patterns/data/PatternDataTable/index.tsx', index);
  assert.deepEqual([...attribution.ids], ['pattern/data/pattern-data-table']);
});

test('attributeFamily reports "unattributed" for legitimately non-family paths (token-level CSS)', () => {
  const index = buildFamilyIndex(FIXTURE_FAMILY_ROWS);
  const attribution = attributeFamily('packages/core/src/foundation/tokens/css/theme.css', index);
  assert.equal(attribution.status, 'unattributed');
  assert.equal(attribution.ids.size, 0);
});

test('RED: a new component folder under a real family category with no matching row is "unknown-family" drift', () => {
  const rows = [{ id: 'primitive/display/badge', sourceOwner: 'packages/core/src/components/primitives/display/Badge' }];
  const index = buildFamilyIndex(rows);
  const attribution = attributeFamily('packages/core/src/components/primitives/display/BrandNewThing/index.tsx', index);
  assert.equal(attribution.status, 'unknown-family');
  assert.equal(attribution.categoryDir, 'packages/core/src/components/primitives/display');
});

test('GREEN: CLAUDE.md-documented non-family support owners under patterns/ are unattributed, never unknown-family', () => {
  const rows = [{ id: 'pattern/data/pattern-data-table', sourceOwner: 'packages/core/src/components/patterns/data' }];
  const index = buildFamilyIndex(rows);
  const attribution = attributeFamily('packages/core/src/components/patterns/foundation/whatever/index.tsx', index);
  assert.equal(attribution.status, 'unattributed');
});

test('LIVE: the real family-inventory/index.json resolves and buildFamilyIndex handles it without throwing', () => {
  const { rows } = loadFamilyRows(DEFAULT_FAMILY_INVENTORY);
  assert.ok(rows.length > 100);
  const index = buildFamilyIndex(rows);
  assert.ok(index.ownerPrefixes.length > 0);
  assert.ok(index.categoryDirs.size > 0);
});

/* ---------------------------------------------------------------------- */
/* 7. Semantic owner (defect 4: unknown owner FAILS, no truthy 'other')   */
/* ---------------------------------------------------------------------- */

test('defect 4: classifySemanticOwner returns null (not a truthy "other") for an unmapped prefix', () => {
  assert.equal(classifySemanticOwner('--ds-totally-unmapped-prefix-xyz'), null);
});

test('classifySemanticOwner covers every declared rule and role-suffixes the tint ramp', () => {
  assert.equal(classifySemanticOwner('--ds-tint-success-4'), 'palette.tint-ramp.success');
  assert.equal(classifySemanticOwner('--ds-tint-4'), 'palette.tint-ramp.primary');
  assert.equal(classifySemanticOwner('--ds-color-primary'), 'palette');
  assert.equal(classifySemanticOwner('--ds-modal-title-font-size'), 'chrome.modal');
  assert.equal(classifySemanticOwner('--ds-sheet-layer'), 'chrome.sheet');
  assert.equal(classifySemanticOwner('--ds-alert-dialog-icon-bg'), 'chrome.alert-dialog');
  assert.equal(classifySemanticOwner('--ds-alert-warning-wash'), 'chrome.alert');
  assert.equal(classifySemanticOwner('--ds-hover-card-layer'), 'chrome.hover-card');
  assert.equal(classifySemanticOwner('--ds-notifier-message-bg'), 'chrome.notifier');
  assert.equal(classifySemanticOwner('--ds-tour-surface-bg'), 'chrome.tour');
  assert.equal(classifySemanticOwner('--ds-radius-md'), 'surfaces.radius');
  assert.equal(classifySemanticOwner('--ds-toggle-track-bg-checked'), 'chrome.toggle');
  assert.equal(classifySemanticOwner('--ds-input-number-border-focus'), 'chrome.input-number');
  assert.equal(classifySemanticOwner('--ds-form-field-label-color'), 'chrome.form-field');
  assert.equal(classifySemanticOwner('--ds-select-option-bg-selected'), 'chrome.select');
  assert.equal(classifySemanticOwner('--ds-tree-select-level'), 'chrome.tree-select');
  assert.equal(classifySemanticOwner('--ds-auto-complete-dropdown-bg'), 'chrome.auto-complete');
  assert.equal(classifySemanticOwner('--ds-date-picker-cell-bg-selected'), 'chrome.date-picker');
  assert.equal(classifySemanticOwner('--ds-time-picker-panel-bg'), 'chrome.time-picker');
  assert.equal(classifySemanticOwner('--ds-color-picker-panel-bg'), 'chrome.color-picker');
  assert.equal(classifySemanticOwner('--ds-color-primary'), 'palette');
  assert.equal(classifySemanticOwner('--ds-rhythm-scale'), 'surfaces.rhythm');
  assert.equal(classifySemanticOwner('--ds-motion-calm'), 'motion');
  assert.equal(classifySemanticOwner('--ds-motion-ease-enter'), 'motion.easing');
  assert.equal(classifySemanticOwner('--ds-ease-exit'), 'motion.easing');
  assert.equal(classifySemanticOwner('--ds-motion-spring-gentle'), 'motion.spring');
  assert.equal(classifySemanticOwner('--ds-text-eyebrow-line-height'), 'typography.eyebrow');
  assert.equal(classifySemanticOwner('--ds-text-body'), null);
  assert.ok(SEMANTIC_OWNER_RULES.length > 10);
});

test('LIVE: every real declared/emitted channel name resolves to a non-null semantic owner today', () => {
  const tenantThemeSource = readFileSync(DEFAULT_TENANT_THEME_CONTRACT, 'utf8');
  const { names: overrideNames } = extractOverrideTokens(tenantThemeSource);
  const { names: referenceNames } = extractReferenceTokens(tenantThemeSource, overrideNames);
  const sources = collectBrandThemeCompilerSources();
  const tintNames = new Set(sources.flatMap((source) => [...extractTintRampEmissions(source.text).names]));
  const directNames = new Set(
    sources.flatMap((source) => [...extractDirectVarsAssignments(source.text).keys()]),
  );
  const universe = new Set([...overrideNames, ...referenceNames, ...tintNames, ...directNames]);
  const unmapped = [...universe].filter((name) => classifySemanticOwner(name) === null);
  assert.deepEqual(unmapped, [], `expected zero unmapped channel names against SEMANTIC_OWNER_RULES, found: ${unmapped.join(', ')}`);
});

/* ---------------------------------------------------------------------- */
/* 8. classifyLiveness — full priority matrix (defects 1, 3, 8)           */
/* ---------------------------------------------------------------------- */

const BASE_CLASSIFY_INPUT = {
  declaredOverride: false,
  declaredReference: false,
  dsModernPainted: false,
  dsFrozenOnlyPainted: false,
  externalConsumerPainted: false,
  cssReadNoTerminal: false,
  tsReadOnly: false,
  canonicalRosterMember: false,
};

test('classifyLiveness: dsModernPainted wins over every other signal', () => {
  const { classification } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, dsModernPainted: true, declaredReference: true });
  assert.equal(classification, LIVENESS.modernPainted);
});

test('classifyLiveness: dsFrozenOnlyPainted is LIVE but distinct from modernPainted', () => {
  const { classification } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, dsFrozenOnlyPainted: true });
  assert.equal(classification, LIVENESS.frozenEnginePainted);
  assert.ok(LIVE_CLASSIFICATIONS.has(classification));
});

test('defect 7: externalConsumerPainted (app-bithire) is LIVE when the DS itself has zero terminal paint', () => {
  const { classification, reason } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, externalConsumerPainted: true, declaredReference: true });
  assert.equal(classification, LIVENESS.externalConsumerPainted);
  assert.match(reason, /external/i);
  assert.ok(LIVE_CLASSIFICATIONS.has(classification));
});

test('defect 1: cssReadNoTerminal (channel feeds a private custom property with no terminal anywhere) is UNPROVEN, not LIVE', () => {
  const { classification } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, cssReadNoTerminal: true, declaredReference: true });
  assert.equal(classification, LIVENESS.readNoProductiveTerminal);
  assert.ok(UNPROVEN_CLASSIFICATIONS.has(classification));
});

test('defect 1: tsReadOnly (raw TS/TSX var() occurrence, zero CSS evidence) is READ_UNPROVEN, never paint', () => {
  const { classification } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, tsReadOnly: true, declaredReference: true });
  assert.equal(classification, LIVENESS.readUnproven);
  assert.ok(UNPROVEN_CLASSIFICATIONS.has(classification));
});

test('defect 3: declaredReference alone (no terminal, no external evidence) is AUTHORABLE_UNPROVEN_EFFECT -- authorability, not liveness', () => {
  const { classification, reason } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, declaredReference: true });
  assert.equal(classification, LIVENESS.authorableUnprovenEffect);
  assert.match(reason, /authorab/i);
  assert.ok(UNPROVEN_CLASSIFICATIONS.has(classification), 'AUTHORABLE_UNPROVEN_EFFECT must NOT be a protected/live bucket');
});

test('classifyLiveness: declaredOverride-only (no reference declaration) is UNREAD_OVERRIDE_ONLY_NO_KNOWN_ROUTE', () => {
  const { classification } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, declaredOverride: true });
  assert.equal(classification, LIVENESS.unreadOverrideOnly);
});

test('classifyLiveness: emitted-only (neither declared list) is UNREAD_EMITTED_NO_KNOWN_ROUTE', () => {
  const { classification } = classifyLiveness({ ...BASE_CLASSIFY_INPUT });
  assert.equal(classification, LIVENESS.unreadEmittedNoRoute);
});

test('classifyLiveness: a canonical roster member with no other signal is STRUCTURAL_CONSTANT -- neither LIVE nor UNPROVEN', () => {
  const { classification, reason } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, canonicalRosterMember: true });
  assert.equal(classification, LIVENESS.structuralConstant);
  assert.ok(STRUCTURAL_CLASSIFICATIONS.has(classification));
  assert.ok(!LIVE_CLASSIFICATIONS.has(classification), 'a structural constant is not proven liveness');
  assert.ok(!UNPROVEN_CLASSIFICATIONS.has(classification), 'a structural constant is not an unproven effect');
  assert.match(reason, /single z-index scale/);
  assert.match(reason, /one declaration site/);
  assert.match(reason, /z-index-single-scale/);
  assert.match(reason, /never read by design/);
  assert.match(reason, /not an emission waiting for an effect/);
});

test('classifyLiveness: roster membership never outranks paint -- dsModernPainted + roster is LIVE_MODERN_PAINTED', () => {
  const { classification } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, dsModernPainted: true, canonicalRosterMember: true });
  assert.equal(classification, LIVENESS.modernPainted);
});

test('classifyLiveness: roster membership never touches a tenant dial -- declaredOverride + roster is UNREAD_OVERRIDE_ONLY_NO_KNOWN_ROUTE', () => {
  const { classification } = classifyLiveness({ ...BASE_CLASSIFY_INPUT, declaredOverride: true, canonicalRosterMember: true });
  assert.equal(classification, LIVENESS.unreadOverrideOnly);
});

test('classifyLiveness: every pre-existing branch keeps its precedence over the roster; only the final fallback is re-read', () => {
  const expected = [
    ['dsFrozenOnlyPainted', LIVENESS.frozenEnginePainted],
    ['externalConsumerPainted', LIVENESS.externalConsumerPainted],
    ['cssReadNoTerminal', LIVENESS.readNoProductiveTerminal],
    ['tsReadOnly', LIVENESS.readUnproven],
    ['declaredReference', LIVENESS.authorableUnprovenEffect],
  ];
  for (const [signal, classification] of expected) {
    const withRoster = classifyLiveness({ ...BASE_CLASSIFY_INPUT, [signal]: true, canonicalRosterMember: true });
    const without = classifyLiveness({ ...BASE_CLASSIFY_INPUT, [signal]: true });
    assert.equal(withRoster.classification, classification, `${signal} + roster`);
    assert.equal(withRoster.classification, without.classification, `${signal}: the roster changed a verdict it must not touch`);
  }
});

test('META: no LIVENESS classification constant contains the word "dead"', () => {
  for (const value of Object.values(LIVENESS)) {
    assert.ok(!/dead/i.test(value), `classification "${value}" must never contain the word "dead"`);
  }
});

test('META: LIVE / UNPROVEN / STRUCTURAL partition every LIVENESS value into exactly one set with no overlap', () => {
  const all = Object.values(LIVENESS);
  for (const value of all) {
    const memberships = [LIVE_CLASSIFICATIONS, UNPROVEN_CLASSIFICATIONS, STRUCTURAL_CLASSIFICATIONS].filter((set) => set.has(value)).length;
    assert.equal(memberships, 1, `"${value}" must be in exactly one of LIVE / UNPROVEN / STRUCTURAL`);
  }
  assert.equal(LIVE_CLASSIFICATIONS.size + UNPROVEN_CLASSIFICATIONS.size + STRUCTURAL_CLASSIFICATIONS.size, all.length);
  assert.deepEqual([...STRUCTURAL_CLASSIFICATIONS], [LIVENESS.structuralConstant]);
});

/* ---------------------------------------------------------------------- */
/* 8c. The canonical z-scale roster is measured, never listed             */
/* ---------------------------------------------------------------------- */

const ZSCALE_FIXTURE_WITH_FLOOR = `
:root {
  /* --ds-z-index-commented: 5; */
  --ds-z-index-base: 0;
  --ds-z-index-dropdown: 1000;
  --ds-z-index-max: 9999;
  --ds-z-index-navbar: var(--ds-z-index-fixed);
  --ds-z-index-loading-overlay: calc(var(--ds-z-index-modal) + 100);
  --ds-z-index-relative-below: -1;
  --ds-z-dropdown: var(--ds-z-index-dropdown, 1000);
  @media (min-width: 1px) { --ds-z-index-nested: 7; }
}
.not-root { --ds-z-index-elsewhere: 42; }
`;

test('deriveCanonicalZScaleRoster keeps only bare unsigned integer --ds-z-index-* declarations directly under :root', () => {
  const roster = deriveCanonicalZScaleRoster(ZSCALE_FIXTURE_WITH_FLOOR);
  assert.deepEqual([...roster].sort(), ['--ds-z-index-base', '--ds-z-index-dropdown', '--ds-z-index-max']);
  assert.ok(!roster.has('--ds-z-index-navbar'), 'a var() alias is not a band');
  assert.ok(!roster.has('--ds-z-index-loading-overlay'), 'a calc() alias is not a band');
  assert.ok(!roster.has('--ds-z-index-relative-below'), 'a signed literal is not the \\d+ grammar the invariant reads');
  assert.ok(!roster.has('--ds-z-index-commented'), 'a name inside a comment never counts');
  assert.ok(!roster.has('--ds-z-index-nested'), 'a declaration inside a nested at-rule is not directly under :root');
  assert.ok(!roster.has('--ds-z-index-elsewhere'), 'a declaration outside :root is not the scale');
  assert.ok(!roster.has('--ds-z-dropdown'), 'the short alias namespace is not a band');
});

test('DRILL: a declaration site without the zero band yields a roster without it -- the roster is measured, not wired', () => {
  const withoutFloor = ZSCALE_FIXTURE_WITH_FLOOR.replace('  --ds-z-index-base: 0;\n', '');
  assert.ok(!withoutFloor.includes('--ds-z-index-base'), 'fixture precondition: the floor is gone from the text');
  const roster = deriveCanonicalZScaleRoster(withoutFloor);
  assert.ok(!roster.has('--ds-z-index-base'));
  assert.deepEqual([...roster].sort(), ['--ds-z-index-dropdown', '--ds-z-index-max']);
  assert.ok(deriveCanonicalZScaleRoster(ZSCALE_FIXTURE_WITH_FLOOR).has('--ds-z-index-base'), 'control: the same deriver sees the floor when it is declared');
});

test('deriveCanonicalZScaleRoster propagates a parse error rather than returning an empty roster', () => {
  assert.throws(() => deriveCanonicalZScaleRoster(':root { --ds-z-index-base: 0; '));
});

test('LIVE: the real declaration site yields a roster that carries every band the single-scale invariant names and no alias', () => {
  const roster = deriveCanonicalZScaleRoster(readFileSync(DEFAULT_Z_INDEX_SCALE_OWNER, 'utf8'));
  for (const band of [
    '--ds-z-index-base', '--ds-z-index-dropdown', '--ds-z-index-sticky', '--ds-z-index-fixed', '--ds-z-index-overlay',
    '--ds-z-index-drawer', '--ds-z-index-modal', '--ds-z-index-popover', '--ds-z-index-tooltip', '--ds-z-index-notification',
    '--ds-z-index-max',
  ]) {
    assert.ok(roster.has(band), `${band} must be measured from the real declaration site`);
  }
  assert.ok(!roster.has('--ds-z-index-navbar'));
  assert.ok(!roster.has('--ds-z-index-loading-overlay'));
  assert.ok(DEFAULT_Z_INDEX_SCALE_OWNER.endsWith(join('src', 'foundation', 'tokens', 'css', 'foundation', 'base', 'z-index', 'index.css')));
});

/* ---------------------------------------------------------------------- */
/* 9. Digest (defect 6) + regression ratchet (defects 2, 3, 7, 8)         */
/* ---------------------------------------------------------------------- */

const BASE_DIGEST_INPUT = {
  gateScriptSource: 'GATE_SCRIPT_V1',
  evidenceContractRaw: 'CONTRACT_V1',
  ciGatesManifestRaw: 'MANIFEST_V1',
  packageJsonRaw: 'PKG_V1',
  tenantThemeSource: 'TENANT_V1',
  brandThemeSource: 'BRAND_V1',
  familyInventoryRaw: 'FAMILY_V1',
  cssStylesheets: [css('a.css', '.a{color:red}')],
  tsStylesheets: [css('a.tsx', 'const a = 1;')],
  consumerCorpora: [{ id: 'app-bithire', cssStylesheets: [css('app-bithire/x.css', '.x{color:blue}')], tsStylesheets: [] }],
};

test('computeInputsDigest is deterministic', () => {
  assert.equal(computeInputsDigest(BASE_DIGEST_INPUT), computeInputsDigest(BASE_DIGEST_INPUT));
});

test('defect 6: computeInputsDigest changes when the gate script source itself changes', () => {
  const changed = computeInputsDigest({ ...BASE_DIGEST_INPUT, gateScriptSource: 'GATE_SCRIPT_V2' });
  assert.notEqual(changed, computeInputsDigest(BASE_DIGEST_INPUT));
});

test('defect 6: computeInputsDigest changes when the evidence contract (schema) changes', () => {
  const changed = computeInputsDigest({ ...BASE_DIGEST_INPUT, evidenceContractRaw: 'CONTRACT_V2' });
  assert.notEqual(changed, computeInputsDigest(BASE_DIGEST_INPUT));
});

test('defect 6: computeInputsDigest changes when the CI wiring (ci-gates.manifest.mjs / package.json) changes', () => {
  const changedManifest = computeInputsDigest({ ...BASE_DIGEST_INPUT, ciGatesManifestRaw: 'MANIFEST_V2' });
  const changedPkg = computeInputsDigest({ ...BASE_DIGEST_INPUT, packageJsonRaw: 'PKG_V2' });
  assert.notEqual(changedManifest, computeInputsDigest(BASE_DIGEST_INPUT));
  assert.notEqual(changedPkg, computeInputsDigest(BASE_DIGEST_INPUT));
});

test('defect 6 + 7: computeInputsDigest changes when a consumerRoot (app-bithire) file changes', () => {
  const changed = computeInputsDigest({
    ...BASE_DIGEST_INPUT,
    consumerCorpora: [{ id: 'app-bithire', cssStylesheets: [css('app-bithire/x.css', '.x{color:green}')], tsStylesheets: [] }],
  });
  assert.notEqual(changed, computeInputsDigest(BASE_DIGEST_INPUT));
});

test('compareAgainstPrevious is vacuous with no previous artifact', () => {
  assert.deepEqual(compareAgainstPrevious([{ name: '--ds-x', classification: LIVENESS.modernPainted }], null), []);
});

test('RED: a NEW dead name -- a channel live in the previous artifact and unproven now fails closed', () => {
  const previous = { channels: [{ name: '--ds-x', classification: LIVENESS.modernPainted }] };
  const current = [{ name: '--ds-x', classification: LIVENESS.authorableUnprovenEffect }];
  const failures = compareAgainstPrevious(current, previous);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /new dead name/);
});

test('RED: stale revived debt -- previously-unproven debt that is now proven live must force regeneration, not carry silently', () => {
  const previous = { channels: [{ name: '--ds-x', classification: LIVENESS.authorableUnprovenEffect }] };
  const current = [{ name: '--ds-x', classification: LIVENESS.modernPainted }];
  const failures = compareAgainstPrevious(current, previous);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /stale revived debt/);
});

test('defect 7: a removed protected channel is detected even when it is fully absent from the current universe (not just unread)', () => {
  const previous = { channels: [{ name: '--ds-tint-4', classification: LIVENESS.externalConsumerPainted }] };
  const current = []; // --ds-tint-4 no longer declared or emitted at all
  const failures = compareAgainstPrevious(current, previous);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /removed protected channel/);
  assert.match(failures[0], /--ds-tint-4/);
});

test('GREEN: a channel with no prior entry (new to the universe) triggers no regression failure by itself', () => {
  const previous = { channels: [{ name: '--ds-x', classification: LIVENESS.modernPainted }] };
  const current = [
    { name: '--ds-x', classification: LIVENESS.modernPainted },
    { name: '--ds-brand-new', classification: LIVENESS.unreadEmittedNoRoute },
  ];
  assert.deepEqual(compareAgainstPrevious(current, previous), []);
});

test('GREEN: a channel that stays live, or stays unproven, across both snapshots is not a regression', () => {
  const previous = {
    channels: [
      { name: '--ds-a', classification: LIVENESS.modernPainted },
      { name: '--ds-b', classification: LIVENESS.unreadEmittedNoRoute },
    ],
  };
  const current = [
    { name: '--ds-a', classification: LIVENESS.modernPainted },
    { name: '--ds-b', classification: LIVENESS.unreadEmittedNoRoute },
  ];
  assert.deepEqual(compareAgainstPrevious(current, previous), []);
});

/* ---------------------------------------------------------------------- */
/* 10. consumerRoots (defect 7)                                           */
/* ---------------------------------------------------------------------- */

let consumerFixtureDir;

test('defect 7: a required consumerRoot that does not exist fails closed with an exact error, never a silent empty corpus', () => {
  const result = loadConsumerRootCorpus({ id: 'app-bithire', root: join(tmpdir(), 'channel-liveness-does-not-exist-xyz-12345'), required: true });
  assert.equal(result.ok, false);
  assert.match(result.error, /does not exist/);
  assert.deepEqual(result.cssStylesheets, []);
});

test('defect 7: a real consumerRoot with a genuine external terminal chain is discovered and classified LIVE_EXTERNAL_CONSUMER_PAINTED', () => {
  consumerFixtureDir = mkdtempSync(join(tmpdir(), 'channel-liveness-consumer-'));
  mkdirSync(join(consumerFixtureDir, 'components', 'Sidebar'), { recursive: true });
  mkdirSync(join(consumerFixtureDir, 'components', 'LiveScoring'), { recursive: true });
  // A real, discoverable, MULTI-hop external terminal chain for --ds-tint-4.
  writeFileSync(
    join(consumerFixtureDir, 'components', 'Sidebar', 'index.css'),
    ':root { --sidebar-accent: var(--ds-tint-4); }\n.sidebar-item--active { background: var(--sidebar-accent); }\n',
  );
  // A direct terminal for --ds-tint-16.
  writeFileSync(
    join(consumerFixtureDir, 'components', 'LiveScoring', 'index.css'),
    '.live-scoring-badge { color: var(--ds-tint-16); }\n',
  );
  // A raw TS occurrence that must NOT be promoted to paint.
  writeFileSync(
    join(consumerFixtureDir, 'components', 'Sidebar', 'index.tsx'),
    'const style = { borderColor: "var(--ds-tint-99-unproven)" };\n',
  );

  const load = loadConsumerRootCorpus({ id: 'app-bithire', root: consumerFixtureDir, required: true });
  assert.equal(load.ok, true);
  assert.equal(load.cssFileCount, 2);
  assert.equal(load.tsFileCount, 1);

  const externalGraph = buildPaintGraph(load.cssStylesheets, () => 'external-consumer');
  const tint4Paint = computePaint(externalGraph, '--ds-tint-4');
  const tint16Paint = computePaint(externalGraph, '--ds-tint-16');
  assert.equal(tint4Paint.painted, true, '--ds-tint-4 must paint via the sidebar --sidebar-accent chain');
  assert.equal(tint16Paint.painted, true, '--ds-tint-16 must paint via the direct live-scoring terminal');

  const tsReads = scanTsReads(load.tsStylesheets);
  assert.ok(tsReads.has('--ds-tint-99-unproven'));

  // End-to-end through analyzeChannelLiveness: an otherwise-unread reference
  // token becomes LIVE_EXTERNAL_CONSUMER_PAINTED purely because of this
  // external evidence, discovered from the corpus, not hardcoded.
  const { rows: familyRows } = loadFamilyRows(DEFAULT_FAMILY_INVENTORY);
  const result = analyzeChannelLiveness({
    tenantThemeSource: FIXTURE_TENANT_THEME_SOURCE,
    brandThemeSource: FIXTURE_BRAND_THEME_SOURCE,
    familyRows,
    cssStylesheets: [],
    tsStylesheets: [],
    consumerRoots: [{ id: 'app-bithire', root: consumerFixtureDir, required: true }],
  });
  const tint4Row = result.channels.find((r) => r.name === '--ds-tint-4');
  const tint16Row = result.channels.find((r) => r.name === '--ds-tint-16');
  assert.equal(tint4Row.classification, LIVENESS.externalConsumerPainted);
  assert.equal(tint16Row.classification, LIVENESS.externalConsumerPainted);
  assert.ok(tint4Row.consumerSites.some((s) => s.startsWith('external-terminal:')));

  rmSync(consumerFixtureDir, { recursive: true, force: true });
});

test('DEFAULT_CONSUMER_ROOTS names app-bithire as a required consumerRoot resolved under the monorepo root, not inside ui-design-system', () => {
  assert.equal(DEFAULT_CONSUMER_ROOTS.length, 1);
  assert.equal(DEFAULT_CONSUMER_ROOTS[0].id, 'app-bithire');
  assert.equal(DEFAULT_CONSUMER_ROOTS[0].required, true);
  assert.ok(DEFAULT_CONSUMER_ROOTS[0].root.endsWith(`${sep}app-bithire${sep}src`));
  assert.ok(!DEFAULT_CONSUMER_ROOTS[0].root.includes(`${sep}ui-design-system${sep}app-bithire`), 'app-bithire is a SIBLING repo, not nested inside ui-design-system');
  assert.ok(REPO_ROOT.length < CORE_ROOT.length, 'REPO_ROOT must be shorter than CORE_ROOT, not equal to it');
});

test('the sibling root is the MAIN checkout\'s parent, so a linked worktree still finds app-bithire', () => {
  // A linked worktree's `.git` is a file pointing into the main checkout's
  // `.git/worktrees/<name>`. Resolving the siblings from the worktree's own
  // parent finds nothing there, which reads as a missing required consumerRoot
  // and demotes every externally-painted channel to a non-LIVE class.
  const workDir = mkdtempSync(join(tmpdir(), 'liveness-worktree-fixture-'));
  const main = join(workDir, 'siblings', 'ui-design-system');
  const linked = join(workDir, 'worktrees', 'some-lot');
  for (const dir of [main, join(linked, 'packages', 'core', 'scripts')]) mkdirSync(dir, { recursive: true });
  writeFileSync(join(main, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  writeFileSync(join(linked, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n');
  writeFileSync(join(linked, '.git'), `gitdir: ${join(main, '.git', 'worktrees', 'some-lot')}\n`);

  assert.equal(siblingReposRoot(join(linked, 'packages', 'core', 'scripts')), join(workDir, 'siblings'));

  // A plain checkout keeps the original semantics exactly: parent of the root.
  mkdirSync(join(main, '.git'), { recursive: true });
  assert.equal(siblingReposRoot(main), join(workDir, 'siblings'));
  rmSync(workDir, { recursive: true, force: true });
});

/* ---------------------------------------------------------------------- */
/* 11. analyzeChannelLiveness — end-to-end hermetic scenarios              */
/* ---------------------------------------------------------------------- */

function baseAnalyzerArgs(overrides = {}) {
  return {
    tenantThemeSource: FIXTURE_TENANT_THEME_SOURCE,
    brandThemeSource: FIXTURE_BRAND_THEME_SOURCE,
    familyRows: FIXTURE_FAMILY_ROWS,
    cssStylesheets: [css('src/foundation/tokens/css/theme.css', ':root { color: var(--ds-color-primary); }')],
    tsStylesheets: [css('src/components/primitives/display/Button/index.tsx', 'const s = 1;')],
    consumerRoots: [],
    // A fixture universe is not the real one, so the SHIPPED pins would all be
    // stale against it. Each case below registers exactly the pins it is about.
    dispositions: [],
    ...overrides,
  };
}

test('RED 1/8: zero corpus fails closed', () => {
  const result = analyzeChannelLiveness(baseAnalyzerArgs({ cssStylesheets: [], tsStylesheets: [] }));
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((f) => f.includes('zero corpus')));
});

test('RED 2/8 (write leg): --write REFUSES when the pure analysis is red', () => {
  const result = analyzeChannelLiveness(baseAnalyzerArgs({ cssStylesheets: [], tsStylesheets: [] }));
  // Mirrors the CLI's own refusal condition exactly (see main()'s `--write` branch).
  const wouldRefuse = !result.ok || result.analysisLimitations.length > 0;
  assert.equal(wouldRefuse, true);
});

test('RED 3/8: unknown family -- a consumer site under a known family category with no matching row fails closed', () => {
  const result = analyzeChannelLiveness(
    baseAnalyzerArgs({
      cssStylesheets: [css('src/foundation/tokens/css/theme.css', ':root { color: var(--ds-color-primary); }')],
      tsStylesheets: [css('src/components/primitives/display/BrandNewThing/index.tsx', 'const s = 1;')],
    }),
  );
  const declaredOnlyDirect = analyzeChannelLiveness(
    baseAnalyzerArgs({
      cssStylesheets: [css('a.css', ':root { --x: var(--ds-color-primary); } .y { color: var(--x); }')],
      tsStylesheets: [css('src/components/primitives/display/BrandNewThing/index.tsx', 'var(--ds-color-primary)')],
    }),
  );
  assert.ok(declaredOnlyDirect.failures.some((f) => f.includes('unknown family')));
  assert.ok(result); // sanity: first construction does not throw even without the drifted read
});

test('RED 4/8: a fabricated NEW channel with no terminal and no external evidence is a standing NO-GO row (defect 3 + 8)', () => {
  const tenantThemeSource = `
    export const TENANT_THEME_OVERRIDE_TOKENS = ["--ds-color-primary"] as const;
    export const TENANT_THEME_REFERENCE_TOKENS = new Set([
      ...TENANT_THEME_OVERRIDE_TOKENS,
      "--ds-fabricated-new-channel-no-terminal",
    ]);
  `;
  const result = analyzeChannelLiveness(
    baseAnalyzerArgs({
      tenantThemeSource,
      cssStylesheets: [css('src/foundation/tokens/css/theme.css', ':root { color: var(--ds-color-primary); }')],
    }),
  );
  const row = result.channels.find((r) => r.name === '--ds-fabricated-new-channel-no-terminal');
  assert.equal(row.classification, LIVENESS.authorableUnprovenEffect);
  assert.equal(result.ok, false);
  assert.ok(
    result.failures.some((f) => f.startsWith('STOP NO-GO') && f.includes('--ds-fabricated-new-channel-no-terminal')),
    'the reference allowlist proves authorability only -- a fabricated channel with no terminal must FAIL, exact row named',
  );
});

test('RED 5/8: duplicate tint scale in the real analyzer surfaces as a failure', () => {
  const brandThemeSource = `
    function setTintRampVariables(vars, scale, colorVar) {
      vars[\`\${scale}-4\`] = 1;
    }
    setTintRampVariables(vars, "--ds-tint", "--ds-color-primary-500");
    setTintRampVariables(vars, "--ds-tint", "--ds-color-primary-500");
  `;
  const result = analyzeChannelLiveness(baseAnalyzerArgs({ brandThemeSource }));
  assert.ok(result.failures.some((f) => f.includes('duplicate owner')));
});

test('RED 6/8: tint x direct overlap in the real analyzer surfaces as a failure', () => {
  const brandThemeSource = `
    function setTintRampVariables(vars, scale, colorVar) {
      vars[\`\${scale}-4\`] = 1;
    }
    setTintRampVariables(vars, "--ds-tint", "--ds-color-primary-500");
    vars["--ds-tint-4"] = "#000";
  `;
  const result = analyzeChannelLiveness(baseAnalyzerArgs({ brandThemeSource }));
  assert.ok(result.failures.some((f) => f.includes('tint x direct overlap')));
});

test('RED 7/8: unresolved spread element fails closed instead of silently shrinking the DECLARED universe', () => {
  const tenantThemeSource = `
    export const TENANT_THEME_OVERRIDE_TOKENS = ["--ds-color-primary", ...UNKNOWN_SPREAD] as const;
    export const TENANT_THEME_REFERENCE_TOKENS = new Set([...TENANT_THEME_OVERRIDE_TOKENS]);
  `;
  const result = analyzeChannelLiveness(baseAnalyzerArgs({ tenantThemeSource }));
  assert.ok(result.failures.some((f) => f.includes('unresolved spread')));
});

test('RED 8/8: unclassified output -- the drill-injected row is caught by the completeness check', () => {
  const result = analyzeChannelLiveness(baseAnalyzerArgs({ drill: 'unclassified-output' }));
  assert.ok(result.failures.some((f) => f.includes('unclassified output')));
});

test('a clean hermetic fixture with a matching previous artifact passes with zero failures OTHER than the standing unproven rows it deliberately carries', () => {
  const result = analyzeChannelLiveness(baseAnalyzerArgs());
  // --ds-surface-panel is declared+emitted in the fixture but never read anywhere
  // in this scenario's tiny corpus -- that is an HONEST unproven row, not a bug.
  const panelRow = result.channels.find((r) => r.name === '--ds-surface-panel');
  assert.ok(panelRow);
  assert.ok(UNPROVEN_CLASSIFICATIONS.has(panelRow.classification));
  assert.equal(result.ok, false, 'a fixture carrying a genuinely unproven row must not silently report green');
  const primaryRow = result.channels.find((r) => r.name === '--ds-color-primary');
  assert.equal(primaryRow.classification, LIVENESS.modernPainted);
});

test('LIVE: runGate resolves against the real repository and produces a well-formed report (verdict may legitimately be NO-GO)', () => {
  const gateRun = runGate({ requireArtifact: false });
  assert.ok(gateRun.result.counts.universe > 100);
  assert.ok(Array.isArray(gateRun.failures));
  assert.ok(gateRun.result.consumerRoots.length === 1);
  assert.equal(gateRun.result.consumerRoots[0].id, 'app-bithire');
  // This assertion is DELIBERATELY not `gateRun.ok === true`: per the owner
  // law, a NO-GO verdict against the real corpus is an acceptable, correct
  // outcome and must never be forced green.
});

test('LIVE: the tint-4/tint-16 rows are present and their classification is driven by real corpus + consumerRoot evidence, never hardcoded', () => {
  const gateRun = runGate({ requireArtifact: false });
  const tint4 = gateRun.result.channels.find((r) => r.name === '--ds-tint-4');
  const tint16 = gateRun.result.channels.find((r) => r.name === '--ds-tint-16');
  assert.ok(tint4, '--ds-tint-4 must appear in the real declared universe');
  assert.ok(tint16, '--ds-tint-16 must appear in the real declared universe');
  // Deliberately not pinned to one exact bucket here (that depends on live
  // repo/consumerRoot state this test does not control) -- the structural
  // guarantee this asserts is that BOTH rows always classify into a real,
  // named LIVENESS bucket (never null/undefined) and are never silently
  // dropped from the universe.
  assert.ok(Object.values(LIVENESS).includes(tint4.classification), `--ds-tint-4 must have a real classification, got: ${tint4.classification}`);
  assert.ok(Object.values(LIVENESS).includes(tint16.classification), `--ds-tint-16 must have a real classification, got: ${tint16.classification}`);
  assert.equal(tint4.declaredReference, true);
  assert.equal(tint16.declaredReference, true);
});

test('formatReport names the universe, corpus, family attribution, consumerRoots and both target tokens on distinct lines', () => {
  const gateRun = runGate({ requireArtifact: false });
  const report = formatReport(gateRun);
  assert.match(report, /universe=\d+/);
  assert.match(report, /consumerRoots:/);
  assert.match(report, /app-bithire/);
  assert.match(report, /--ds-tint-4/);
  assert.match(report, /--ds-tint-16/);
});

test('buildArtifact produces a schema-stable document naming the scope law and every digest input category', () => {
  const gateRun = runGate({ requireArtifact: false });
  const artifact = buildArtifact(gateRun, { round: 'R1' });
  assert.equal(artifact.schemaVersion, 2);
  assert.equal(artifact.roundId, 'R1');
  assert.ok(artifact.scopeLaw.includes('app-bithire'));
  assert.ok(artifact.inputs.evidenceContract);
  assert.ok(artifact.inputs.ciGatesManifest);
  assert.ok(artifact.inputs.packageJson);
  assert.ok(Array.isArray(artifact.consumerRoots));
  assert.ok(Array.isArray(artifact.channels));
});

/* ---------------------------------------------------------------------- */
/* 12. defect 2: canonical artifact requiredness + --write refusal        */
/* ---------------------------------------------------------------------- */

test('resolveCurrentRound picks the highest existing R<N> directory, and null when none exist', () => {
  const dir = mkdtempSync(join(tmpdir(), 'channel-liveness-rounds-'));
  assert.equal(resolveCurrentRound(dir), null);
  mkdirSync(join(dir, 'R1'));
  mkdirSync(join(dir, 'R3'));
  mkdirSync(join(dir, 'R2'));
  assert.equal(resolveCurrentRound(dir), 'R3');
  rmSync(dir, { recursive: true, force: true });
});

test('defect 2: defaultArtifactPath defaults to round R1, matching "R1/channel-liveness.json is REQUIRED"', () => {
  const path = defaultArtifactPath({ evidenceRoot: '/evidence-root' });
  assert.ok(path.endsWith(join('R1', ARTIFACT_FILE_NAME)));
  assert.equal(DEFAULT_ROUND, 'R1');
});

test('defect 2: --check fails closed when the R1 artifact is MISSING (this is the literal contract requirement, not just informational)', () => {
  const evidenceRoot = mkdtempSync(join(tmpdir(), 'channel-liveness-evidence-missing-'));
  const gateRun = runGate({ evidenceRoot, round: 'R1', requireArtifact: true });
  assert.equal(gateRun.ok, false);
  assert.ok(gateRun.failures.some((f) => f.startsWith('missing artifact')));
  rmSync(evidenceRoot, { recursive: true, force: true });
});

test('GREEN: in plain report mode (requireArtifact=false) a missing artifact is informational only, never blocking on its own', () => {
  const evidenceRoot = mkdtempSync(join(tmpdir(), 'channel-liveness-evidence-missing-report-'));
  const gateRun = runGate({ evidenceRoot, round: 'R1', requireArtifact: false });
  assert.ok(gateRun.failures.every((f) => !f.startsWith('missing artifact')));
  assert.ok(gateRun.evidenceNote && gateRun.evidenceNote.includes('has not been written yet'));
  rmSync(evidenceRoot, { recursive: true, force: true });
});

test('defect 2: --check fails closed when the artifact is PRESENT but CORRUPT (not valid JSON)', () => {
  const evidenceRoot = mkdtempSync(join(tmpdir(), 'channel-liveness-evidence-corrupt-'));
  mkdirSync(join(evidenceRoot, 'R1'), { recursive: true });
  writeFileSync(join(evidenceRoot, 'R1', ARTIFACT_FILE_NAME), '{ not valid json');
  const gateRun = runGate({ evidenceRoot, round: 'R1', requireArtifact: true });
  assert.equal(gateRun.ok, false);
  assert.ok(gateRun.failures.some((f) => f.startsWith('stale output') && f.includes('not valid JSON')));
  rmSync(evidenceRoot, { recursive: true, force: true });
});

test('defect 2: --check fails closed when the artifact is PRESENT and valid JSON but STALE (sourceDigest mismatch)', () => {
  const evidenceRoot = mkdtempSync(join(tmpdir(), 'channel-liveness-evidence-stale-'));
  mkdirSync(join(evidenceRoot, 'R1'), { recursive: true });
  writeFileSync(join(evidenceRoot, 'R1', ARTIFACT_FILE_NAME), JSON.stringify({ sourceDigest: 'not-the-real-digest', channels: [] }));
  const gateRun = runGate({ evidenceRoot, round: 'R1', requireArtifact: true });
  assert.equal(gateRun.ok, false);
  assert.ok(gateRun.failures.some((f) => f.startsWith('stale output') && f.includes('sourceDigest')));
  rmSync(evidenceRoot, { recursive: true, force: true });
});

test('defect 2: staleness against the on-disk artifact does NOT block a fresh (requireArtifact=false) run -- --write must be able to fix staleness', () => {
  const evidenceRoot = mkdtempSync(join(tmpdir(), 'channel-liveness-evidence-stale-write-'));
  mkdirSync(join(evidenceRoot, 'R1'), { recursive: true });
  writeFileSync(join(evidenceRoot, 'R1', ARTIFACT_FILE_NAME), JSON.stringify({ sourceDigest: 'not-the-real-digest', channels: [] }));
  const gateRun = runGate({ evidenceRoot, round: 'R1', requireArtifact: false });
  assert.ok(
    gateRun.result.failures.every((f) => !f.startsWith('stale output')),
    '--write path (requireArtifact=false) must not refuse merely because the OLD on-disk artifact predates this run',
  );
  rmSync(evidenceRoot, { recursive: true, force: true });
});

test('GREEN: runGate accepts a present, valid, fresh artifact and uses it as the regression-ratchet anchor', () => {
  // Fully hermetic: every input path is a fixture under a fresh temp dir,
  // never the real repository, so this test's "the digest matches between
  // two calls" assertion can never be destabilized by another lane's
  // concurrent writes to the real DS corpus elsewhere in this checkpoint.
  const workDir = mkdtempSync(join(tmpdir(), 'channel-liveness-fresh-fixture-'));
  const evidenceRoot = join(workDir, 'evidence');
  mkdirSync(join(evidenceRoot, 'R1'), { recursive: true });
  const tenantThemeContractPath = join(workDir, 'tenant-theme.ts');
  const brandThemeCompilerRoot = join(workDir, 'derivation');
  const brandThemeCompilerPath = join(brandThemeCompilerRoot, 'fixture/index.ts');
  const familyInventoryPath = join(workDir, 'family-inventory/index.json');
  const cssRoot = join(workDir, 'css-root');
  mkdirSync(dirname(familyInventoryPath), { recursive: true });
  mkdirSync(dirname(brandThemeCompilerPath), { recursive: true });
  mkdirSync(cssRoot, { recursive: true });
  writeFileSync(tenantThemeContractPath, FIXTURE_TENANT_THEME_SOURCE);
  writeFileSync(brandThemeCompilerPath, FIXTURE_BRAND_THEME_SOURCE);
  writeFileSync(familyInventoryPath, JSON.stringify({ rows: FIXTURE_FAMILY_ROWS }));
  writeFileSync(join(cssRoot, 'theme.css'), ':root { color: var(--ds-color-primary); }');
  writeFileSync(join(cssRoot, 'component.tsx'), 'const s = 1;');

  const gateArgs = {
    tenantThemeContractPath,
    brandThemeCompilerRoot,
    familyInventoryPath,
    cssRoots: [cssRoot],
    consumerRoots: [],
    dispositions: [],
    evidenceRoot,
    round: 'R1',
  };

  // First pass: compute the fixture's fresh digest with no previous
  // artifact, then persist exactly that as "previous".
  const dryRun = runGate({ ...gateArgs, requireArtifact: false });
  writeFileSync(
    join(evidenceRoot, 'R1', ARTIFACT_FILE_NAME),
    JSON.stringify({ sourceDigest: dryRun.result.sourceDigest, channels: dryRun.result.channels }),
  );
  const gateRun = runGate({ ...gateArgs, requireArtifact: true });
  assert.ok(gateRun.failures.every((f) => !f.startsWith('stale output')), `expected no staleness failure, got: ${JSON.stringify(gateRun.failures)}`);
  assert.ok(gateRun.failures.every((f) => !f.startsWith('missing artifact')));
  rmSync(workDir, { recursive: true, force: true });
});

/* ---------------------------------------------------------------------- */
/* Disposition registry -- the ownership law, and its three reds          */
/* ---------------------------------------------------------------------- */

/**
 * The drill for the pin table.
 *
 * A pin is only worth having if it cannot rot, so the three transitions it has
 * to catch get a red each: a non-LIVE row nobody registered (the new dead
 * channel the CI exclusion used to hide), a pin pointing at a channel that is
 * no longer measured, and a pin whose channel has gone LIVE and must therefore
 * be deleted. A table that only ever grew would be a baseline wearing a
 * different word.
 */
const FABRICATED = '--ds-color-fabricated-new-channel-no-terminal';

/** A fixture universe in which FABRICATED is authorable-but-unproven, and --ds-color-primary is LIVE. */
function fabricatedArgs(overrides = {}) {
  return baseAnalyzerArgs({
    tenantThemeSource: `
      export const TENANT_THEME_OVERRIDE_TOKENS = ["--ds-color-primary"] as const;
      export const TENANT_THEME_REFERENCE_TOKENS = new Set([
        ...TENANT_THEME_OVERRIDE_TOKENS,
        "${FABRICATED}",
      ]);
    `,
    cssStylesheets: [css('src/foundation/tokens/css/theme.css', ':root { color: var(--ds-color-primary); }')],
    ...overrides,
  });
}

const pinGroup = (over = {}) => ({
  owner: 'WO-DER-06',
  classification: LIVENESS.authorableUnprovenEffect,
  registered: '2026-09-11',
  reason: 'a planted registration, so the verdict stays reachable and the shipped table is never the fixture',
  channels: [FABRICATED],
  ...over,
});

/** FABRICATED is the only non-LIVE row: the one emitted channel is read. */
const isolatedArgs = (overrides = {}) =>
  fabricatedArgs({ brandThemeSource: 'vars["--ds-color-primary"] = "#111111";', familyRows: [], ...overrides });

test('a pin is ownership PASS and full-liveness FAIL: the owned row is published, not discharged', () => {
  const result = analyzeChannelLiveness(isolatedArgs({ dispositions: [pinGroup()] }));
  const row = result.channels.find((entry) => entry.name === FABRICATED);
  assert.equal(row.classification, LIVENESS.authorableUnprovenEffect, 'the row keeps its class; a pin never re-classifies');
  assert.equal(row.reads.total, 0, 'fixture precondition: nothing reads the pinned channel');

  assert.deepEqual(dispositionFailures(result), [], 'ownership leg: the row is owned');
  assert.deepEqual(result.dispositions.byOwner['WO-DER-06'], [FABRICATED]);
  assert.equal(result.dispositions.pinnedRows, 1);

  assert.equal(result.ok, false, 'full result: an owner is not an effect');
  assert.equal(result.effect.ok, false);
  assert.deepEqual(result.effect.rows, [FABRICATED]);
  assert.ok(
    result.effect.failures.some((f) => f.startsWith('unproven effect: 1 channel(s)') && f.includes(FABRICATED)),
    result.effect.failures.join(' | '),
  );
  assert.equal(mayWriteArtifact(result), false, '--write refuses an artifact while a pinned row has no terminal');

  const gateRun = {
    ok: result.ok,
    failures: result.failures,
    evidenceNote: null,
    result,
    corpus: { cssFileCount: 1, tsFileCount: 1 },
    resolvedArtifactPath: null,
  };
  const full = formatReport(gateRun);
  assert.ok(
    full.includes(`WO-DER-06 (1): ${FABRICATED}`),
    'a pinned finding is still a finding: the report prints the row and its owner',
  );
  assert.ok(full.includes('effect verdict FAIL (ownership does not discharge it)'), full);
  assert.ok(full.includes('channel-liveness-gate FAIL'), full);

  const ownership = formatReport({ ...gateRun, ok: true, failures: [] }, { effectBlocks: false });
  assert.ok(ownership.includes('channel-liveness-gate OK'), ownership);
  assert.ok(ownership.includes('not part of this leg'), ownership);
});

test('the same channel with a terminal read and no pin is ownership PASS and full-liveness PASS', () => {
  const result = analyzeChannelLiveness(isolatedArgs({
    dispositions: [],
    cssStylesheets: [
      css('src/foundation/tokens/css/theme.css', `:root { color: var(--ds-color-primary); background: var(${FABRICATED}); }`),
    ],
  }));
  const row = result.channels.find((entry) => entry.name === FABRICATED);
  assert.ok(LIVE_CLASSIFICATIONS.has(row.classification), `fixture precondition: the channel paints (${row.classification})`);
  assert.deepEqual(dispositionFailures(result), []);
  assert.deepEqual(result.effect, { ok: true, failures: [], rows: [] });
  assert.equal(result.ok, true, result.failures.join(' | '));
  assert.equal(mayWriteArtifact(result), true);
});

test('the effect verdict names every UNPROVEN row, pinned or not, and nothing LIVE or STRUCTURAL', () => {
  const effect = assessChannelEffect([
    { name: '--ds-a', classification: LIVENESS.authorableUnprovenEffect },
    { name: '--ds-b', classification: LIVENESS.readUnproven },
    { name: '--ds-c', classification: [...LIVE_CLASSIFICATIONS][0] },
    { name: '--ds-d', classification: null },
    { name: '--ds-z-index-base', classification: LIVENESS.structuralConstant },
  ]);
  assert.equal(effect.ok, false);
  assert.deepEqual(effect.rows, ['--ds-a', '--ds-b']);
  assert.equal(effect.failures.length, 2);
  assert.deepEqual(
    assessChannelEffect([{ name: '--ds-z-index-base', classification: LIVENESS.structuralConstant }]),
    { ok: true, failures: [], rows: [] },
    'a structural constant alone is not an effect finding',
  );
});

test('RED (a): an UNREGISTERED non-LIVE row fails closed, named exactly', () => {
  const result = analyzeChannelLiveness(fabricatedArgs({ dispositions: [] }));
  assert.equal(result.ok, false);
  assert.ok(
    result.failures.some((f) => f.startsWith('STOP NO-GO')
      && f.includes('with NO registered owner')
      && f.includes(FABRICATED)),
    result.failures.join(' | '),
  );
  assert.equal(result.dispositions.pinnedRows, 0);
});

test('RED (b): a STALE pin -- registered against a channel the measurement no longer has -- fails closed', () => {
  const result = analyzeChannelLiveness(fabricatedArgs({
    dispositions: [pinGroup(), pinGroup({ channels: ['--ds-channel-that-was-renamed-away'] })],
  }));
  assert.equal(result.ok, false);
  assert.ok(
    result.failures.some((f) => f.startsWith('stale pin: --ds-channel-that-was-renamed-away')
      && f.includes('no longer exists in the measured universe')),
    result.failures.join(' | '),
  );
});

test('RED (c): a DISCHARGED pin -- the channel is LIVE now -- fails closed; the table only shrinks', () => {
  const result = analyzeChannelLiveness(fabricatedArgs({
    dispositions: [pinGroup(), pinGroup({ channels: ['--ds-color-primary'] })],
  }));
  const live = result.channels.find((entry) => entry.name === '--ds-color-primary');
  assert.ok(LIVE_CLASSIFICATIONS.has(live.classification), 'fixture precondition: this channel paints');
  assert.equal(result.ok, false);
  assert.ok(
    result.failures.some((f) => f.startsWith('discharged pin: --ds-color-primary')
      && f.includes('the work landed, so delete the pin')),
    result.failures.join(' | '),
  );
});

test('RED (d): a DRIFTED pin is re-adjudicated by its owner, not silently re-covered', () => {
  const result = analyzeChannelLiveness(fabricatedArgs({
    dispositions: [pinGroup({ classification: LIVENESS.readUnproven })],
  }));
  assert.ok(
    result.failures.some((f) => f.startsWith(`drifted pin: ${FABRICATED}`)
      && f.includes('re-register it against the class it is actually in')),
    result.failures.join(' | '),
  );
  assert.ok(
    !result.failures.some((f) => f.startsWith('STOP NO-GO') && f.includes(FABRICATED)),
    'a drifted pin is accused ONCE, against the pin -- not a second time as an unregistered row',
  );
});

test('RED: a channel registered twice, or pinned to something that is not a work order, fails closed', () => {
  const duplicated = adjudicateDispositions([], {
    dispositions: [pinGroup(), pinGroup({ owner: 'WO-INV-07' })],
  });
  assert.ok(duplicated.failures.some((f) => f.startsWith(`duplicate pin: ${FABRICATED}`)), duplicated.failures.join(' | '));

  const unowned = adjudicateDispositions([], { dispositions: [pinGroup({ owner: 'the derivation lane' })] });
  assert.ok(
    unowned.failures.some((f) => f.startsWith(`invalid pin: ${FABRICATED}`) && f.includes('owns nothing')),
    unowned.failures.join(' | '),
  );
});

/* ---------------------------------------------------------------------- */
/* The structural pin -- an invariant, not an owner, and the same four reds */
/* ---------------------------------------------------------------------- */

const FLOOR = '--ds-z-index-base';
const structuralPin = (over = {}) => ({
  invariant: 'z-index-single-scale',
  classification: LIVENESS.structuralConstant,
  registered: '2026-09-14',
  reason: 'a planted structural registration, so the verdict stays reachable and the shipped table is never the fixture',
  channels: [FLOOR],
  ...over,
});
const structuralRow = (classification = LIVENESS.structuralConstant) => ({ name: FLOOR, classification });

test('a structural pin and a measured structural row match: no failure, published under the invariant, never under an owner', () => {
  const verdict = adjudicateDispositions([structuralRow()], { dispositions: [structuralPin()] });
  assert.deepEqual(verdict.failures, []);
  assert.equal(verdict.structural.length, 1);
  assert.equal(verdict.structural[0].invariant, 'z-index-single-scale');
  assert.deepEqual(verdict.byInvariant, { 'z-index-single-scale': [FLOOR] });
  assert.deepEqual(verdict.byOwner, {});
  assert.deepEqual(verdict.pinned, []);
  assert.equal(verdict.registered, 1);
  assert.equal(verdict.structuralPins, 1);
  assert.equal(verdict.ownerPins, 0);
});

test('RED: a measured structural row with NO structural pin is a STOP NO-GO row -- the third partition is not free', () => {
  const verdict = adjudicateDispositions([structuralRow()], { dispositions: [] });
  assert.ok(
    verdict.failures.some((f) => f.startsWith(`STOP NO-GO: 1 channel(s) classified ${LIVENESS.structuralConstant} with NO registered structural pin`)
      && f.includes(FLOOR)),
    verdict.failures.join(' | '),
  );
});

test('RED: a structural pin without an invariant registers nothing, and one that also names an owner is a category error', () => {
  const noInvariant = adjudicateDispositions([structuralRow()], { dispositions: [structuralPin({ invariant: undefined })] });
  assert.ok(
    noInvariant.failures.some((f) => f.startsWith(`invalid structural pin: ${FLOOR}`) && f.includes('with no invariant')),
    noInvariant.failures.join(' | '),
  );
  const blankInvariant = adjudicateDispositions([structuralRow()], { dispositions: [structuralPin({ invariant: '   ' })] });
  assert.ok(blankInvariant.failures.some((f) => f.startsWith(`invalid structural pin: ${FLOOR}`) && f.includes('with no invariant')));

  const withOwner = adjudicateDispositions([structuralRow()], { dispositions: [structuralPin({ owner: 'WO-FAM-04' })] });
  assert.ok(
    withOwner.failures.some((f) => f.startsWith(`invalid structural pin: ${FLOOR}`) && f.includes('also names an owner')),
    withOwner.failures.join(' | '),
  );
  assert.ok(
    !withOwner.failures.some((f) => f.startsWith('invalid pin:')),
    'a structural pin is never measured against the work-order pattern',
  );
});

test('RED (drift, roster-drop): a structural pin whose band now measures UNREAD_EMITTED_NO_KNOWN_ROUTE is a DRIFTED pin, accused once', () => {
  const verdict = adjudicateDispositions([structuralRow(LIVENESS.unreadEmittedNoRoute)], { dispositions: [structuralPin()] });
  assert.ok(
    verdict.failures.some((f) => f.startsWith(`drifted pin: ${FLOOR} is pinned to invariant z-index-single-scale as ${LIVENESS.structuralConstant}`)
      && f.includes(`now measures ${LIVENESS.unreadEmittedNoRoute}`)),
    verdict.failures.join(' | '),
  );
  assert.ok(!verdict.failures.some((f) => f.startsWith('STOP NO-GO')), 'accused once, against the pin');
  assert.deepEqual(verdict.structural, []);
});

test('RED (drift, reader): a structural pin whose band now classifies LIVE is a DISCHARGED pin', () => {
  const verdict = adjudicateDispositions([structuralRow(LIVENESS.modernPainted)], { dispositions: [structuralPin()] });
  assert.ok(
    verdict.failures.some((f) => f.startsWith(`discharged pin: ${FLOOR} is pinned to invariant z-index-single-scale`)
      && f.includes('no longer a structural constant, so delete the pin')),
    verdict.failures.join(' | '),
  );
});

test('RED (drift, retirement): a structural pin whose band left the measured universe is a STALE pin', () => {
  const verdict = adjudicateDispositions([], { dispositions: [structuralPin()] });
  assert.ok(
    verdict.failures.some((f) => f.startsWith(`stale pin: ${FLOOR} is pinned to invariant z-index-single-scale`)
      && f.includes('no longer exists in the measured universe')),
    verdict.failures.join(' | '),
  );
});

test('RED: a WO-owned row that drifts INTO the structural class is accused once against its owner pin, never re-covered', () => {
  const verdict = adjudicateDispositions([structuralRow()], {
    dispositions: [{ owner: 'WO-FAM-04', classification: LIVENESS.unreadEmittedNoRoute, registered: '2026-09-14', reason: 'a planted owner pin for a band that is now measured structural', channels: [FLOOR] }],
  });
  assert.ok(
    verdict.failures.some((f) => f.startsWith(`drifted pin: ${FLOOR} is pinned to WO-FAM-04`) && f.includes(`now measures ${LIVENESS.structuralConstant}`)),
    verdict.failures.join(' | '),
  );
  assert.ok(!verdict.failures.some((f) => f.startsWith('STOP NO-GO')));
});

/**
 * The same three drift paths through the ANALYZER, so the call-site wiring
 * (roster measured from the declaration site, handed to the classifier) is
 * what is proven, not only the pure functions.
 */
function zScaleAnalyzerArgs(ownerCss, overrides = {}) {
  const workDir = mkdtempSync(join(tmpdir(), 'liveness-zscale-'));
  const zScaleOwnerPath = join(workDir, 'z-index.css');
  if (ownerCss !== null) writeFileSync(zScaleOwnerPath, ownerCss);
  return {
    workDir,
    args: baseAnalyzerArgs({
      tenantThemeSource: `
        export const TENANT_THEME_OVERRIDE_TOKENS = ["--ds-color-primary"] as const;
        export const TENANT_THEME_REFERENCE_TOKENS = new Set([...TENANT_THEME_OVERRIDE_TOKENS]);
      `,
      brandThemeSource: `vars["--ds-color-primary"] = "#111111"; vars["${FLOOR}"] = "0";`,
      familyRows: [],
      dispositions: [structuralPin()],
      zScaleOwnerPath,
      ...overrides,
    }),
  };
}

test('ANALYZER: an emitted, unread band declared at the measured site classifies STRUCTURAL_CONSTANT and its structural pin holds', () => {
  const { workDir, args } = zScaleAnalyzerArgs(ZSCALE_FIXTURE_WITH_FLOOR);
  const result = analyzeChannelLiveness(args);
  const row = result.channels.find((entry) => entry.name === FLOOR);
  assert.equal(row.reads.total, 0, 'fixture precondition: nothing reads the floor');
  assert.equal(row.classification, LIVENESS.structuralConstant);
  assert.deepEqual(dispositionFailures(result), []);
  assert.deepEqual(result.dispositions.byInvariant, { 'z-index-single-scale': [FLOOR] });
  assert.equal(result.dispositions.structuralRows, 1);
  assert.equal(result.dispositions.pinnedRows, 0);
  assert.deepEqual(result.effect, { ok: true, failures: [], rows: [] }, 'a structural constant is not an effect finding');
  assert.equal(result.counts.byClassification[LIVENESS.structuralConstant], 1);
  const report = formatReport({ ok: result.ok, failures: result.failures, evidenceNote: null, result, corpus: { cssFileCount: 1, tsFileCount: 1 }, resolvedArtifactPath: null });
  assert.ok(report.includes(`z-index-single-scale (1): ${FLOOR}`), report);
  rmSync(workDir, { recursive: true, force: true });
});

test('ANALYZER (drift, roster-drop): the floor leaves the declaration site -> UNREAD_EMITTED_NO_KNOWN_ROUTE and a drifted pin', () => {
  const { workDir, args } = zScaleAnalyzerArgs(ZSCALE_FIXTURE_WITH_FLOOR.replace('  --ds-z-index-base: 0;\n', ''));
  const result = analyzeChannelLiveness(args);
  const row = result.channels.find((entry) => entry.name === FLOOR);
  assert.equal(row.classification, LIVENESS.unreadEmittedNoRoute);
  assert.ok(
    dispositionFailures(result).some((f) => f.startsWith(`drifted pin: ${FLOOR} is pinned to invariant z-index-single-scale`)),
    result.failures.join(' | '),
  );
  assert.ok(!result.failures.some((f) => f.startsWith('STOP NO-GO')), 'accused once, against the pin');
  rmSync(workDir, { recursive: true, force: true });
});

test('ANALYZER (drift, reader): a terminal read of the floor -> LIVE and a discharged pin', () => {
  const { workDir, args } = zScaleAnalyzerArgs(ZSCALE_FIXTURE_WITH_FLOOR, {
    cssStylesheets: [css('src/foundation/tokens/css/theme.css', `:root { color: var(--ds-color-primary); } .x { z-index: var(${FLOOR}); }`)],
  });
  const result = analyzeChannelLiveness(args);
  const row = result.channels.find((entry) => entry.name === FLOOR);
  assert.ok(LIVE_CLASSIFICATIONS.has(row.classification), row.classification);
  assert.ok(
    dispositionFailures(result).some((f) => f.startsWith(`discharged pin: ${FLOOR} is pinned to invariant z-index-single-scale`)),
    result.failures.join(' | '),
  );
  rmSync(workDir, { recursive: true, force: true });
});

test('ANALYZER (new band, no pin): a second measured structural band without a structural pin is STOP NO-GO', () => {
  const { workDir, args } = zScaleAnalyzerArgs(ZSCALE_FIXTURE_WITH_FLOOR, {
    brandThemeSource: `vars["--ds-color-primary"] = "#111111"; vars["${FLOOR}"] = "0"; vars["--ds-z-index-max"] = "9999";`,
  });
  const result = analyzeChannelLiveness(args);
  assert.equal(result.channels.find((entry) => entry.name === '--ds-z-index-max').classification, LIVENESS.structuralConstant);
  assert.ok(
    dispositionFailures(result).some((f) => f.startsWith(`STOP NO-GO: 1 channel(s) classified ${LIVENESS.structuralConstant} with NO registered structural pin`)
      && f.includes('--ds-z-index-max')
      && !f.includes(`${FLOOR},`)),
    result.failures.join(' | '),
  );
  rmSync(workDir, { recursive: true, force: true });
});

test('ANALYZER (broken measurement): an unreadable declaration site fails by name on the ownership leg and classifies nothing structural', () => {
  const { workDir, args } = zScaleAnalyzerArgs(null);
  const result = analyzeChannelLiveness(args);
  assert.equal(result.channels.find((entry) => entry.name === FLOOR).classification, LIVENESS.unreadEmittedNoRoute);
  assert.ok(dispositionFailures(result).some((f) => f.startsWith('z-scale owner unreadable:')), result.failures.join(' | '));
  assert.equal(result.counts.byClassification[LIVENESS.structuralConstant], 0);
  rmSync(workDir, { recursive: true, force: true });
});

test('dispositionFailures is the ownership law plus the preconditions that make it readable', () => {
  const result = {
    failures: [
      'required consumerRoot missing: app-bithire',
      'unknown family: 54 consumer site(s) ...',
      'unresolved emission pattern: vars[channel] ...',
      'missing artifact: ...',
    ],
    dispositions: { failures: ['stale pin: --ds-x ...'] },
  };
  assert.deepEqual(dispositionFailures(result), [
    'required consumerRoot missing: app-bithire',
    'stale pin: --ds-x ...',
  ]);
});

test('META: the SHIPPED table is the registered set -- 48 channels, one owner each, no duplicates', () => {
  const { index, duplicates } = buildDispositionIndex();
  assert.deepEqual(duplicates, []);
  assert.equal(
    index.size,
    48,
    'the pin count is the audit-100 registration, plus the audit-107 status-tint rows, less the pins the cuts discharged and the channels retired: 33 + 13 + 4 + 1 - 1 (the Drawer cut gave --ds-z-index-drawer a terminal; the button cut made --ds-radius-button paint) - 2 (the two governed-selection provenance channels stopped being emitted, so their pin went with them)',
  );
  const byClass = {};
  for (const pin of index.values()) byClass[pin.classification] = (byClass[pin.classification] ?? 0) + 1;
  assert.deepEqual(byClass, {
    [LIVENESS.authorableUnprovenEffect]: 33,
    [LIVENESS.unreadEmittedNoRoute]: 11,
    [LIVENESS.readNoProductiveTerminal]: 2,
    [LIVENESS.readUnproven]: 1,
    [LIVENESS.structuralConstant]: 1,
  });
  for (const pin of index.values()) {
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(pin.registered), `${pin.channel}: a pin without a registration date is an excuse`);
    assert.ok(pin.reason.length > 40, `${pin.channel}: a pin without a stated obligation is an allowlist entry`);
    if (STRUCTURAL_CLASSIFICATIONS.has(pin.classification)) {
      assert.equal(pin.owner, undefined, `${pin.channel}: a structural pin names an invariant, never an owner`);
      assert.ok(typeof pin.invariant === 'string' && pin.invariant.trim().length > 0, `${pin.channel}: a structural pin without an invariant registers nothing`);
      continue;
    }
    assert.ok(UNPROVEN_CLASSIFICATIONS.has(pin.classification), `${pin.channel}: an owner pin may only register a non-LIVE class`);
    assert.ok(DISPOSITION_OWNER_PATTERN.test(pin.owner), `${pin.channel}: "${pin.owner}" is not a work-order id`);
    assert.equal(pin.invariant, undefined, `${pin.channel}: an owner pin does not also name an invariant`);
  }
  for (const group of CHANNEL_DISPOSITIONS) {
    assert.ok(Object.isFrozen(group) && Object.isFrozen(group.channels));
  }
});

test('META: every pinned owner is a work order that is still OPEN in the roadmap registry', () => {
  // A pin addresses an obligation. An owner that is already DONE owns nothing,
  // so the row would be orphaned while still looking registered.
  const registryPath = join(CORE_ROOT, '..', '..', 'roadmap', 'registry.json');
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const statusOf = new Map(registry.workOrders.map((order) => [order.id, order.status]));
  const expand = (owner) => {
    const range = /^(WO-[A-Z]{3,4})-(\d{2})\.\.(\d{2})$/.exec(owner);
    if (range === null) return [owner];
    const ids = [];
    for (let n = Number(range[2]); n <= Number(range[3]); n += 1) {
      ids.push(`${range[1]}-${String(n).padStart(2, '0')}`);
    }
    return ids;
  };
  for (const group of CHANNEL_DISPOSITIONS) {
    if (group.owner === undefined) continue;
    for (const id of expand(group.owner)) {
      assert.ok(statusOf.has(id), `${group.owner}: ${id} is not a work order in roadmap/registry.json`);
      assert.notEqual(statusOf.get(id), 'done', `${group.owner}: ${id} is already done and cannot own a standing finding`);
    }
  }
});

test('META: every structural pin names an invariant whose suite exists, and every channel it covers is measured in the roster of the real declaration site', () => {
  // A structural pin is sustained by an invariant, not a work order: the
  // invariant must be a real suite in the tree, and the band must actually be
  // declared at the site that suite guards -- otherwise the pin is wired, not
  // measured.
  const suites = {
    'z-index-single-scale': join(CORE_ROOT, 'src', 'foundation', 'tokens', 'css', 'foundation', 'base', 'z-index', 'tests', 'z-index-single-scale.test.ts'),
  };
  const roster = deriveCanonicalZScaleRoster(readFileSync(DEFAULT_Z_INDEX_SCALE_OWNER, 'utf8'));
  const structuralGroups = CHANNEL_DISPOSITIONS.filter((group) => STRUCTURAL_CLASSIFICATIONS.has(group.classification));
  assert.equal(structuralGroups.length, 1, 'exactly one structural pin group is registered today');
  for (const group of structuralGroups) {
    assert.equal(group.owner, undefined, 'a structural pin names no owner');
    const suite = suites[group.invariant];
    assert.ok(suite, `${group.invariant}: not a known invariant`);
    assert.ok(existsSync(suite), `${group.invariant}: its suite is missing at ${suite}`);
    for (const channel of group.channels) {
      assert.ok(roster.has(channel), `${channel}: pinned structural but not measured in the canonical roster of the real declaration site`);
    }
  }
  assert.deepEqual(structuralGroups[0].channels, ['--ds-z-index-base']);
});

test('DEFAULT_EVIDENCE_ROOT points at the semantic Modern Rescue evidence tree', () => {
  assert.ok(DEFAULT_EVIDENCE_ROOT.endsWith(join('artifacts', 'quality', 'programs', 'modern-rescue')));
});
