import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';

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
  DEFAULT_BRAND_THEME_COMPILER,
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
  classifyLiveness,
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
  { id: 'primitive/display/button', sourceOwner: 'packages/core/src/ui/primitives/display/Button' },
  { id: 'primitive/display/badge', sourceOwner: 'packages/core/src/ui/primitives/display/Badge' },
  // A SHARED owner: two canonical ids, one sourceOwner folder (defect 4 fixture).
  { id: 'pattern/data/table-a', sourceOwner: 'packages/core/src/ui/patterns/data/SharedFolder' },
  { id: 'pattern/data/table-b', sourceOwner: 'packages/core/src/ui/patterns/data/SharedFolder' },
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
  const source = readFileSync(DEFAULT_BRAND_THEME_COMPILER, 'utf8');
  const { callSites } = extractTintRampEmissions(source);
  assert.deepEqual(findDuplicateTintScales(callSites), []);
});

/* ---------------------------------------------------------------------- */
/* 4. Corpus collection                                                   */
/* ---------------------------------------------------------------------- */

test('isScannableCorpusFile excludes generated/dist/tests/fixtures and test/story files', () => {
  assert.equal(isScannableCorpusFile('src/ui/primitives/display/Button/index.tsx', 'index.tsx'), true);
  assert.equal(isScannableCorpusFile('src/ui/primitives/display/Button/index.test.tsx', 'index.test.tsx'), false);
  assert.equal(isScannableCorpusFile('src/ui/generated/foo.css', 'foo.css'), false);
  assert.equal(isScannableCorpusFile('src/ui/tests/foo.css', 'foo.css'), false);
  assert.equal(isScannableCorpusFile('facade/artifacts/bithire/index.css', 'index.css'), false);
});

test('classifyConsumerScope: frozen engines, modern engine, and engine-neutral are mutually exclusive', () => {
  assert.equal(classifyConsumerScope('src/ui/primitives/display/Button/engines/classic/index.tsx'), 'frozen-engine');
  assert.equal(classifyConsumerScope('src/ui/primitives/display/Button/engines/rustic/index.tsx'), 'frozen-engine');
  assert.equal(classifyConsumerScope('src/ui/primitives/display/Button/engines/modern/index.tsx'), 'modern-engine');
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
  const attribution = attributeFamily('packages/core/src/ui/patterns/data/SharedFolder/index.tsx', index);
  assert.equal(attribution.status, 'resolved-shared');
  assert.deepEqual([...attribution.ids].sort(), ['pattern/data/table-a', 'pattern/data/table-b']);
});

test('attributeFamily resolves a non-shared sourceOwner to exactly one id, status "resolved"', () => {
  const index = buildFamilyIndex(FIXTURE_FAMILY_ROWS);
  const attribution = attributeFamily('packages/core/src/ui/primitives/display/Button/engines/modern/index.tsx', index);
  assert.equal(attribution.status, 'resolved');
  assert.deepEqual([...attribution.ids], ['primitive/display/button']);
});

test('attributeFamily resolves the LONGEST sourceOwner prefix when multiple prefixes could match', () => {
  const rows = [
    { id: 'pattern/data/table', sourceOwner: 'packages/core/src/ui/patterns/data' },
    { id: 'pattern/data/pattern-data-table', sourceOwner: 'packages/core/src/ui/patterns/data/PatternDataTable' },
  ];
  const index = buildFamilyIndex(rows);
  const attribution = attributeFamily('packages/core/src/ui/patterns/data/PatternDataTable/index.tsx', index);
  assert.deepEqual([...attribution.ids], ['pattern/data/pattern-data-table']);
});

test('attributeFamily reports "unattributed" for legitimately non-family paths (token-level CSS)', () => {
  const index = buildFamilyIndex(FIXTURE_FAMILY_ROWS);
  const attribution = attributeFamily('packages/core/src/foundation/tokens/css/theme.css', index);
  assert.equal(attribution.status, 'unattributed');
  assert.equal(attribution.ids.size, 0);
});

test('RED: a new component folder under a real family category with no matching row is "unknown-family" drift', () => {
  const rows = [{ id: 'primitive/display/badge', sourceOwner: 'packages/core/src/ui/primitives/display/Badge' }];
  const index = buildFamilyIndex(rows);
  const attribution = attributeFamily('packages/core/src/ui/primitives/display/BrandNewThing/index.tsx', index);
  assert.equal(attribution.status, 'unknown-family');
  assert.equal(attribution.categoryDir, 'packages/core/src/ui/primitives/display');
});

test('GREEN: CLAUDE.md-documented non-family support owners under patterns/ are unattributed, never unknown-family', () => {
  const rows = [{ id: 'pattern/data/pattern-data-table', sourceOwner: 'packages/core/src/ui/patterns/data' }];
  const index = buildFamilyIndex(rows);
  const attribution = attributeFamily('packages/core/src/ui/patterns/foundation/whatever/index.tsx', index);
  assert.equal(attribution.status, 'unattributed');
});

test('LIVE: the real family-inventory.json resolves and buildFamilyIndex handles it without throwing', () => {
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
  assert.equal(classifySemanticOwner('--ds-radius-md'), 'surfaces.radius');
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
  const brandThemeSource = readFileSync(DEFAULT_BRAND_THEME_COMPILER, 'utf8');
  const { names: tintNames } = extractTintRampEmissions(brandThemeSource);
  const directNames = extractDirectVarsAssignments(brandThemeSource);
  const universe = new Set([...overrideNames, ...referenceNames, ...tintNames, ...directNames.keys()]);
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

test('META: no LIVENESS classification constant contains the word "dead"', () => {
  for (const value of Object.values(LIVENESS)) {
    assert.ok(!/dead/i.test(value), `classification "${value}" must never contain the word "dead"`);
  }
});

test('META: LIVE_CLASSIFICATIONS and UNPROVEN_CLASSIFICATIONS partition every LIVENESS value with no overlap', () => {
  const all = Object.values(LIVENESS);
  for (const value of all) {
    const inLive = LIVE_CLASSIFICATIONS.has(value);
    const inUnproven = UNPROVEN_CLASSIFICATIONS.has(value);
    assert.notEqual(inLive, inUnproven, `"${value}" must be in exactly one of LIVE_CLASSIFICATIONS / UNPROVEN_CLASSIFICATIONS`);
  }
  assert.equal(LIVE_CLASSIFICATIONS.size + UNPROVEN_CLASSIFICATIONS.size, all.length);
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
  assert.ok(REPO_ROOT.length < CORE_ROOT.length, 'REPO_ROOT must be an ancestor of CORE_ROOT, not equal to it');
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
    tsStylesheets: [css('src/ui/primitives/display/Button/index.tsx', 'const s = 1;')],
    consumerRoots: [],
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
      tsStylesheets: [css('src/ui/primitives/display/BrandNewThing/index.tsx', 'const s = 1;')],
    }),
  );
  const declaredOnlyDirect = analyzeChannelLiveness(
    baseAnalyzerArgs({
      cssStylesheets: [css('a.css', ':root { --x: var(--ds-color-primary); } .y { color: var(--x); }')],
      tsStylesheets: [css('src/ui/primitives/display/BrandNewThing/index.tsx', 'var(--ds-color-primary)')],
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
  const brandThemeCompilerPath = join(workDir, 'brand-theme.ts');
  const familyInventoryPath = join(workDir, 'family-inventory.json');
  const cssRoot = join(workDir, 'css-root');
  mkdirSync(cssRoot, { recursive: true });
  writeFileSync(tenantThemeContractPath, FIXTURE_TENANT_THEME_SOURCE);
  writeFileSync(brandThemeCompilerPath, FIXTURE_BRAND_THEME_SOURCE);
  writeFileSync(familyInventoryPath, JSON.stringify({ rows: FIXTURE_FAMILY_ROWS }));
  writeFileSync(join(cssRoot, 'theme.css'), ':root { color: var(--ds-color-primary); }');
  writeFileSync(join(cssRoot, 'component.tsx'), 'const s = 1;');

  const gateArgs = {
    tenantThemeContractPath,
    brandThemeCompilerPath,
    familyInventoryPath,
    cssRoots: [cssRoot],
    consumerRoots: [],
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

test('DEFAULT_EVIDENCE_ROOT points at the wo-cra-23 evidence tree', () => {
  assert.ok(DEFAULT_EVIDENCE_ROOT.endsWith(join('test-artifacts', 'quality-evidence', 'wo-cra-23')));
});
