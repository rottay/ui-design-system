/**
 * Self-drills for artifact-provenance-gate.mjs (AD-7 T2/T3, Codex C2).
 *
 * A gate that has never been shown to go RED is a gate nobody has tested, and a
 * gate that goes red for the WRONG reason is worse than none: it teaches
 * reviewers to read the exit code instead of the finding. So every drill here
 * is built as a matched pair -- a control sheet that is green against its own
 * seeded baseline, and a planted sheet that differs in exactly one architectural
 * property -- and asserts the EXACT set of checks that fire.
 *
 * The law drills are deliberately volume-neutral swaps (an Ant selector
 * replacing a DaisyUI one, an `!important` moving between two selectors). A
 * decrease-only ratchet cannot see those; the laws can, which is the whole
 * reason the laws exist on top of the ratchets.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  buildBaseline,
  countLiterals,
  evaluateVertical,
  inventoryOf,
  loadFrameworkClasses,
  normalizeSelector,
  parseExceptionHeader,
  readCompiledBlock,
  run,
} from './artifact-provenance-gate.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'artifact-provenance-gate.mjs');
const FRAMEWORK_CLASSES = loadFrameworkClasses();

// The fixture vertical is named `bithire` so `.bithire-*` and `[data-bithire-*]`
// are genuinely application tokens under the gate's own slug vocabulary.
const SLUG = 'bithire';

const ARTIFACT = `/* GENERATED — do not edit */

/* === Compiled from BrandTheme via compileBrandTheme — do not edit === */
html[data-tenant='bithire'] {
  color-scheme: light;
  --ds-color-primary: #3A6FB0;
  --ds-motion-calm: 200ms;
}

/* === Declared artifact extension (authored source, mechanically scoped) === */
html[data-tenant='bithire'] {
  --ds-bithire-only: 1px;
}
`;

// ── sheet construction ──────────────────────────────────

const header = (kind, reachability, purpose, extra = '') =>
  `/* @ds-exception kind=${kind} owner=claude purpose="${purpose}" reachability=${reachability}${extra} */`;

const GAP = `${header('capability-gap', 'shipped', 'drill gap', ' retire="the contract grows a field"')}
html[data-tenant="bithire"] {
  --ds-color-primary: #123456;
}`;

const MODE = `${header('mode-block', 'mode:dark', 'drill mode')}
html[data-tenant="bithire"][data-theme="dark"] {
  --ds-color-primary: #654321;
}`;

const skin = (selector, important = '') => `${header('component-local', 'subtree', 'drill skin')}
html[data-tenant="bithire"] :where(${selector}) {
  color: #111111${important};
}`;

const twoRuleSkin = (firstImportant, secondImportant) => `${header('component-local', 'subtree', 'drill skin')}
html[data-tenant="bithire"] :where(.ds-panel) {
  color: #111111${firstImportant};
}

html[data-tenant="bithire"] :where(.ds-rail) {
  color: #222222${secondImportant};
}`;

const structural = (kind, body) => `${header(kind, 'subtree', 'drill structure')}
${body}`;

const SHELL_CHANNEL = `html[data-tenant="bithire"] .ds-shell {
  --ds-shell-gap: 4px;
}`;

const SHELL_PAINT = `html[data-tenant="bithire"] .ds-shell {
  color: #111111;
}`;

const rootStructural = (property) => `${header('structural', 'subtree', 'drill structure')}
html[data-tenant="bithire"] {
  ${property}: 4px;
}`;

const media = (body) => `${header('media', 'media', 'drill media')}
@media (max-width: 720px) {
${body}
}`;

const MEDIA_ROOT_CHANNEL = `  html[data-tenant="bithire"] {
    --ds-listing-min: 100%;
  }`;

const MEDIA_DESCENDANT_SKIN = `  html[data-tenant="bithire"] .ds-listing {
    --ds-listing-min: 100%;
  }`;

const sheet = (...regions) => `${regions.join('\n\n')}\n`;

/**
 * Pad every variant with an inert trailing comment so they share a byte count.
 * Without this, a one-token swap would also trip the bytes ratchet and the
 * drill could no longer prove WHICH rule caught it.
 */
function balance(...variants) {
  const target = Math.max(...variants.map((css) => Buffer.byteLength(css))) + 16;
  return variants.map((css) => {
    const fill = target - Buffer.byteLength(css) - 5;
    return `${css}\n/*${' '.repeat(fill)}*/`;
  });
}

// ── harness ─────────────────────────────────────────────

function evaluate(extensionCss, artifactCss = ARTIFACT) {
  return evaluateVertical({
    slug: SLUG,
    slugs: [SLUG],
    artifactCss,
    extensionCss,
    frameworkClasses: FRAMEWORK_CLASSES,
  });
}

/** The baseline `--seed` would write for this exact sheet. */
function baselineFor(extensionCss, artifactCss = ARTIFACT) {
  return buildBaseline([evaluate(extensionCss, artifactCss)]);
}

function tree(extensionCss, baseline, artifactCss = ARTIFACT) {
  const dir = mkdtempSync(join(tmpdir(), 'artifact-provenance-'));
  const artifactsRoot = join(dir, 'artifacts');
  mkdirSync(join(artifactsRoot, `${SLUG}/_source`), { recursive: true });
  writeFileSync(join(artifactsRoot, `${SLUG}/index.css`), artifactCss);
  writeFileSync(join(artifactsRoot, `${SLUG}/_source/extension.css`), extensionCss);
  const baselinePath = join(dir, 'baseline.json');
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
  return { artifactsRoot, baselinePath };
}

/** Every distinct check id a sheet produces against a baseline. */
function checksOf(extensionCss, baseline, artifactCss = ARTIFACT) {
  const { artifactsRoot } = tree(extensionCss, baseline, artifactCss);
  const { results, growth } = run({ artifactsRoot, baseline, frameworkClasses: FRAMEWORK_CLASSES });
  const findings = results.flatMap((result) => [...result.violations, ...result.lawFindings]);
  return [...new Set([...findings.map((f) => f.check), ...growth.map((g) => g.check)])].sort();
}

function runCli(extensionCss, baseline, artifactCss = ARTIFACT) {
  const { artifactsRoot, baselinePath } = tree(extensionCss, baseline, artifactCss);
  return spawnSync(
    process.execPath,
    [gate, '--check', '--artifacts-root', artifactsRoot, '--baseline', baselinePath],
    { encoding: 'utf8' }
  );
}

/**
 * Assert that `planted` fails for exactly `expected` and that its `control`
 * twin is green against the same baseline. The control assertion is what makes
 * the drill honest: a gate that reddened both sheets would prove nothing.
 */
function drill({ control, planted, expected }) {
  const baseline = baselineFor(control);
  assert.deepEqual(checksOf(control, baseline), [], 'control sheet must be green against its own baseline');
  assert.equal(runCli(control, baseline).status, 0, 'control sheet must exit 0');

  assert.deepEqual(checksOf(planted, baseline), expected);
  const cli = runCli(planted, baseline);
  assert.equal(cli.status, 1, cli.stdout + cli.stderr);
  return cli;
}

// ── L-B: application and framework vocabulary ───────────

test('L-B · an Ant selector swapped in for a DaisyUI one is RED (engine check only)', () => {
  const [control, planted] = balance(
    sheet(GAP, MODE, skin('.rt-preview, .badge')),
    sheet(GAP, MODE, skin('.rt-preview, .ant-table'))
  );
  const cli = drill({ control, planted, expected: ['law:engine-selector'] });
  assert.match(cli.stderr, /NEW framework\/engine selector token \.ant-table/);

  // The swap is volume-neutral: one engine token before, one after. Only the
  // vocabulary law can see it.
  assert.equal(evaluate(control).metrics.total.engineSelectors, 1);
  assert.equal(evaluate(planted).metrics.total.engineSelectors, 1);
});

test('L-B · a NEW .bithire-* Candidates selector is RED (app check only)', () => {
  const [control, planted] = balance(
    sheet(GAP, MODE, skin('.bithire-preview-rail')),
    sheet(GAP, MODE, skin('.bithire-candidates-rail'))
  );
  const cli = drill({ control, planted, expected: ['law:app-selector'] });
  assert.match(cli.stderr, /NEW application selector token \.bithire-candidates-rail/);
  assert.equal(evaluate(planted).metrics.total.appSelectors, evaluate(control).metrics.total.appSelectors);
});

test('L-B · a NEW [data-bithire-*] attribute selector is RED', () => {
  const [control, planted] = balance(
    sheet(GAP, MODE, skin('[data-bithire-preview-focused="true"]')),
    sheet(GAP, MODE, skin('[data-bithire-candidate-selected="true"]'))
  );
  const cli = drill({ control, planted, expected: ['law:app-selector'] });
  assert.match(cli.stderr, /NEW application selector token \[data-bithire-candidate-selected\]/);
});

// ── L-A: component-local is not a valid kind ────────────

test('L-A · a NEW component-local region is RED even at identical volume', () => {
  const [control, planted] = balance(
    sheet(GAP, MODE, skin('.ds-panel'), structural('structural', SHELL_CHANNEL)),
    sheet(GAP, MODE, skin('.ds-panel'), structural('component-local', SHELL_CHANNEL))
  );
  const cli = drill({ control, planted, expected: ['law:component-local'] });
  assert.match(cli.stderr, /NEW kind=component-local region component-local#/);

  // The one that already exists stays grandfathered, and the report names it.
  const inventory = inventoryOf(evaluate(control));
  assert.equal(inventory.componentLocalRegions.length, 1);
});

// ── L-C: !important ─────────────────────────────────────

test('L-C · an !important moved to another selector is RED (count unchanged)', () => {
  const control = sheet(GAP, MODE, twoRuleSkin('', ' !important'));
  const planted = sheet(GAP, MODE, twoRuleSkin(' !important', ''));
  assert.equal(Buffer.byteLength(control), Buffer.byteLength(planted));
  assert.equal(evaluate(control).metrics.total.important, evaluate(planted).metrics.total.important);

  const cli = drill({ control, planted, expected: ['law:important'] });
  assert.match(cli.stderr, /NEW !important \(1 > 0 grandfathered\)/);
});

// ── L-D / L-E: kind-scope laws ──────────────────────────

test('L-D · a descendant skin inside a media region is RED', () => {
  const [control, planted] = balance(
    sheet(GAP, MODE, media(MEDIA_ROOT_CHANNEL)),
    sheet(GAP, MODE, media(MEDIA_DESCENDANT_SKIN))
  );
  const cli = drill({ control, planted, expected: ['law:media-scope'] });
  assert.match(cli.stderr, /kind=media may only declare semantic root channels/);
});

test('L-E · custom-property-free component paint in a structural region is RED', () => {
  const [control, planted] = balance(
    sheet(GAP, MODE, structural('structural', SHELL_CHANNEL)),
    sheet(GAP, MODE, structural('structural', SHELL_PAINT))
  );
  const cli = drill({ control, planted, expected: ['law:structural-paint'] });
  assert.match(cli.stderr, /kind=structural carries component paint/);
});

test('L-E · keyframe steps are not component paint', () => {
  const keyframes = `@keyframes bithire-enter {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}`;
  const css = sheet(GAP, MODE, structural('structural', keyframes));
  assert.deepEqual(checksOf(css, baselineFor(css)), []);
  assert.deepEqual(inventoryOf(evaluate(css)).structuralPaintSelectors, []);
});

// ── L-F: header completeness ────────────────────────────

test('L-F · a capability-gap header missing retire= or owner= is RED now', () => {
  const control = sheet(GAP, MODE);
  const baseline = baselineFor(control);

  const noRetire = sheet(header('capability-gap', 'shipped', 'drill gap'), MODE);
  assert.deepEqual(checksOf(noRetire, baseline), ['header']);

  const noOwner = sheet(
    '/* @ds-exception kind=capability-gap owner= purpose="drill gap" reachability=shipped retire="soon" */',
    MODE
  );
  assert.deepEqual(checksOf(noOwner, baseline), ['header']);

  assert.deepEqual(
    parseExceptionHeader('@ds-exception kind=media owner=claude purpose="x" reachability=media').problems,
    []
  );
  assert.deepEqual(
    parseExceptionHeader('@ds-exception kind=media owner=claude reachability=media').problems,
    ['missing purpose="…"']
  );
  assert.deepEqual(
    parseExceptionHeader('@ds-exception kind=nonsense owner=claude purpose="x" reachability=media').problems,
    ['unknown kind=nonsense']
  );
  assert.deepEqual(
    parseExceptionHeader('@ds-exception kind=capability-gap owner=claude purpose="x" reachability=shipped').problems,
    ['capability-gap must carry retire="…" (decrease-only ratchet)']
  );
});

// ── ratchets ────────────────────────────────────────────

test('ratchet · added volume is RED through the budgets alone', () => {
  const control = sheet(GAP, MODE, skin('.ds-panel'));
  const planted = sheet(
    GAP,
    MODE,
    `${skin('.ds-panel')}

html[data-tenant="bithire"] :where(.ds-extra) {
  opacity: 1;
}`
  );
  const cli = drill({
    control,
    planted,
    expected: ['ratchet:bytes', 'ratchet:declarations', 'ratchet:rules'],
  });
  assert.match(cli.stderr, /rules grew to 4, baseline allows 3 \(decrease-only\)/);
});

test('ratchet · capability-gap growth past the baseline is RED', () => {
  const css = sheet(GAP, MODE);
  const baseline = baselineFor(css);
  assert.deepEqual(checksOf(css, baseline), []);

  baseline.capabilityGaps[SLUG] = 0;
  assert.deepEqual(checksOf(css, baseline), ['ratchet:capabilityGaps']);
  assert.match(runCli(css, baseline).stderr, /baseline allows 0 \(decrease-only\)/);
});

test('ratchet · a vertical with no baseline entry is RED, not silently green', () => {
  const css = sheet(GAP, MODE);
  // With no baseline, the grandfather-backed laws have nothing to allow either,
  // so L-H reports the gap's re-declared channel alongside the two ratchets.
  assert.deepEqual(checksOf(css, {}), [
    'law:redeclared-emitted-channel',
    'ratchet:capabilityGaps',
    'ratchet:metrics',
  ]);
});

// ── provenance (the original property) ──────────────────

test('T2 · a default-mode redeclaration of a compiled channel is RED', () => {
  const [control, planted] = balance(
    sheet(GAP, MODE, rootStructural('--ds-local-thing')),
    sheet(GAP, MODE, rootStructural('--ds-color-primary'))
  );
  const cli = drill({ control, planted, expected: ['provenance'] });
  assert.match(cli.stderr, /--ds-color-primary re-declares a compiler-emitted channel/);
});

test('T2 · a redeclaration with no exception header at all is RED', () => {
  const css = sheet(GAP, MODE, 'html[data-tenant="bithire"] {\n  --ds-color-primary: #FF0000;\n}');
  const undeclared = `html[data-tenant="bithire"] {\n  --ds-color-primary: #FF0000;\n}\n${css}`;
  const cli = runCli(undeclared, baselineFor(css));
  assert.equal(cli.status, 1);
  assert.match(cli.stderr, /not covered by an @ds-exception header/);
});

test('T2 · the same shape declared honestly as a capability gap is GREEN and counted', () => {
  const declared = sheet(
    `${header('capability-gap', 'shipped', 'drill gap', ' retire="the contract grows a field"')}
html[data-tenant="bithire"] {
  --ds-color-primary: #FF0000;
}`,
    MODE
  );
  const result = evaluate(declared);
  assert.deepEqual(result.violations, []);
  assert.equal(result.capabilityGaps, 1);
});

test('T3 · a declared reduced-motion exception is GREEN; removing its header is RED', () => {
  const body = `${header('reduced-motion', 'media', 'drill motion')}
@media (prefers-reduced-motion: reduce) {
  html[data-tenant="bithire"] {
    --ds-motion-calm: 0ms;
  }
}`;
  const declared = sheet(GAP, MODE, body);
  assert.equal(runCli(declared, baselineFor(declared)).status, 0);

  // Leading, so the block orphans instead of inheriting the previous header.
  const stripped = sheet(body.split('\n').slice(1).join('\n'), GAP, MODE);
  const undeclared = runCli(stripped, baselineFor(declared));
  assert.equal(undeclared.status, 1);
  assert.match(undeclared.stderr, /not covered by an @ds-exception header/);
});

test('T3 · a media-gated block declared under a non-at-rule kind is RED', () => {
  const css = sheet(
    GAP,
    MODE,
    `${header('component-local', 'subtree', 'drill skin')}
@media (max-width: 720px) {
  html[data-tenant="bithire"] .ds-panel { gap: 0; }
}`
  );
  const result = evaluate(css);
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0].message, /@media declared under kind=component-local/);
});

test('a mode-block that also matches the DEFAULT mode is RED', () => {
  const bare = evaluate(
    sheet(`${header('mode-block', 'mode:dark', 'drill mode')}
html[data-tenant="bithire"] {
  --ds-color-primary: #000;
}`)
  );
  assert.equal(bare.violations.length, 1);
  assert.match(bare.violations[0].message, /also matches the DEFAULT mode \(light\)/);
  assert.deepEqual(evaluate(sheet(MODE)).violations, []);
});

test('component-local that matches the tenant root is RED', () => {
  const result = evaluate(
    sheet(`${header('component-local', 'subtree', 'drill skin')}
html[data-tenant="bithire"] {
  --ds-bithire-only: 2px;
}`)
  );
  assert.equal(result.violations.length, 1);
  assert.match(result.violations[0].message, /matches the tenant root/);
});

test('the compiled block is read from the artifact, not from dist', () => {
  const { channels, defaultMode, found } = readCompiledBlock(ARTIFACT);
  assert.equal(found, true);
  assert.equal(defaultMode, 'light');
  assert.deepEqual([...channels].sort(), ['--ds-color-primary', '--ds-motion-calm']);

  // The extension block that follows must not be mistaken for compiler output.
  assert.equal(channels.has('--ds-bithire-only'), false);

  const missing = evaluate('', 'html[data-tenant="bithire"] { --x: 1px; }');
  assert.match(missing.violations[0].message, /no compiled BrandTheme block/);
});

// ── measurement primitives ──────────────────────────────

test('literals count paint values, not derivations or keywords', () => {
  assert.deepEqual(countLiterals('#3A6FB0'), { color: 1, spacing: 0, motion: 0 });
  assert.deepEqual(countLiterals('rgba(0, 0, 0, 0.4)'), { color: 1, spacing: 0, motion: 0 });
  assert.deepEqual(countLiterals('color-mix(in srgb, var(--ds-color-primary) 9%, transparent)'), {
    color: 0,
    spacing: 0,
    motion: 0,
  });
  assert.deepEqual(countLiterals('var(--ds-space-2)'), { color: 0, spacing: 0, motion: 0 });
  assert.deepEqual(countLiterals('0 1px 2px rgba(0,0,0,.2)'), { color: 1, spacing: 2, motion: 0 });
  assert.deepEqual(countLiterals('200ms cubic-bezier(.2, 0, 0, 1)'), { color: 0, spacing: 0, motion: 2 });
});

test('selector identity survives the multi-line :where() authoring style', () => {
  assert.equal(
    normalizeSelector('html[data-tenant="bithire"]\n  :where(\n    .a,\n    .b\n  )'),
    'html[data-tenant="bithire"] :where( .a, .b )'
  );
});

// ── L-G / L-H / L-I: a gap header may not legalize a theme ──

/** A capability-gap region declaring `count` distinct inert channels. */
const gapOf = (count, offset = 0, purpose = 'drill gap') =>
  `${header('capability-gap', 'shipped', purpose, ' retire="the contract grows a field"')}
html[data-tenant="bithire"] {
${Array.from({ length: count }, (_, i) => `  --ds-drill-${offset + i}: ${offset + i + 1}px;`).join('\n')}
}`;

/** The law findings a sheet produces, with the volume ratchets set aside. */
const lawsOf = (...args) => checksOf(...args).filter((check) => check.startsWith('law:'));

test('L-G: one region may not hold what two honest regions hold', () => {
  // Volume-neutral by construction: both sheets declare 16 channels in one rule
  // each, so every ratchet (bytes after balancing, rules, declarations,
  // literals) sees the same numbers. The ONLY difference is whether those 16
  // channels sit behind one exception header or two.
  const [split, giant] = balance(
    sheet(gapOf(8, 0, 'drill gap A'), gapOf(8, 8, 'drill gap B')),
    sheet(gapOf(16, 0, 'drill gap A'))
  );
  const baseline = baselineFor(split);

  assert.deepEqual(checksOf(split, baseline), []);
  assert.deepEqual(checksOf(giant, baseline), ['law:capability-gap-budget']);

  // The budget is a real number, not just "more than the control": a single
  // region at the budget is green even with no baseline entry for it. Crossing
  // it necessarily adds volume too, so the law is asserted on its own.
  assert.deepEqual(checksOf(sheet(gapOf(10)), baselineFor(sheet(gapOf(10)))), []);
  assert.deepEqual(lawsOf(sheet(gapOf(11)), baselineFor(sheet(gapOf(10)))), [
    'law:capability-gap-budget',
  ]);
});

test('L-G: an over-budget region is grandfathered at its size and may only shrink', () => {
  const oversized = sheet(gapOf(40));
  const baseline = baselineFor(oversized);
  // Only over-budget regions are inventoried, and each is recorded at its size.
  assert.deepEqual(Object.values(baseline.grandfather[SLUG].capabilityGapRegionSizes), [40]);

  // Its own baseline keeps it green, and draining it stays green...
  assert.deepEqual(checksOf(oversized, baseline), []);
  assert.deepEqual(checksOf(sheet(gapOf(30)), baseline), []);
  // ...but growing past the grandfathered size is not fundable.
  assert.deepEqual(lawsOf(sheet(gapOf(41)), baseline), ['law:capability-gap-budget']);

  // Splitting the grandfathered giant into honest atomic gaps satisfies every
  // law: each part is a new, smaller region and no part needs a grandfather
  // entry. It is NOT free, though — one region becomes four headers and four
  // rules, so the volume ratchets see growth in `rules` and `bytes` even though
  // not one channel was added. Atomization is therefore a re-seed event, and
  // this assertion pins which dimension may move and which may not.
  const atomized = sheet(...Array.from({ length: 4 }, (_, i) => gapOf(10, i * 10, `atomic gap ${i}`)));
  assert.deepEqual(lawsOf(atomized, baseline), []);
  assert.deepEqual(checksOf(atomized, baseline), ['ratchet:bytes', 'ratchet:rules']);
  assert.deepEqual(
    checksOf(atomized, baselineFor(atomized)).filter((c) => c === 'ratchet:declarations'),
    []
  );
});

test('L-H: a supported field re-declared in an extension is red, at constant volume', () => {
  // Both sheets re-declare exactly one compiler-emitted channel, so
  // `capabilityGaps` is 1 either way and the count-based ratchet cannot see the
  // swap. Only the name-keyed law can.
  const declaring = (channel) => `${header('capability-gap', 'shipped', 'drill gap', ' retire="the contract grows a field"')}
html[data-tenant="bithire"] {
  ${channel}: #123456;
}`;
  const [control, swapped] = balance(
    sheet(declaring('--ds-color-primary')),
    sheet(declaring('--ds-motion-calm'))
  );
  const baseline = baselineFor(control);
  assert.deepEqual(baseline.grandfather[SLUG].capabilityGapChannels, ['--ds-color-primary']);

  assert.deepEqual(checksOf(control, baseline), []);
  assert.deepEqual(checksOf(swapped, baseline), ['law:redeclared-emitted-channel']);
});

test('L-I: a capability gap declares channels, never a raw CSS bag', () => {
  const gapBody = (body) => `${header('capability-gap', 'shipped', 'drill gap', ' retire="the contract grows a field"')}
html[data-tenant="bithire"] {
  ${body}
}`;
  const [channels, rawCss] = balance(
    sheet(gapBody('--ds-drill-pad: 4px;')),
    sheet(gapBody('padding: 4px;'))
  );
  const baseline = baselineFor(channels);

  assert.deepEqual(checksOf(channels, baseline), []);
  assert.deepEqual(checksOf(rawCss, baseline), ['law:capability-gap-raw-css']);

  // A gap that mixes one raw property into real channels is still a bag.
  const mixed = sheet(gapBody('--ds-drill-pad: 4px;\n  padding: 4px;'));
  assert.ok(checksOf(mixed, baselineFor(channels)).includes('law:capability-gap-raw-css'));
});

// ── the real tree ───────────────────────────────────────

test('the real package tree is GREEN against its committed baseline', () => {
  const result = spawnSync(process.execPath, [gate, '--check'], {
    encoding: 'utf8',
    cwd: resolve(scriptDir, '..'),
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /✓ bithire:/);
  assert.match(result.stdout, /✓ evnto:/);
  assert.match(result.stdout, /✓ rottay:/);

  // Green here means "no growth", never "clean".
  assert.match(result.stdout, /no debt growth \(baseline: \d+ items outstanding\)/);
  assert.doesNotMatch(result.stdout, /\bclean\b/);

  // Every vertical reports an empty Phase-3 grandfather inventory, and no
  // vertical prints a drain backlog, because there are no `component-local`
  // regions left to drain. Asserting the absence is what keeps a reintroduced
  // region loud: a new one would both mint an unbaselined id (red) and print a
  // backlog here.
  assert.doesNotMatch(result.stdout, /component-local drain backlog:/);
  const grandfathered = result.stdout.match(/^ {2}grandfathered: .*$/gm) ?? [];
  assert.equal(grandfathered.length, 3, result.stdout);
  for (const line of grandfathered) {
    assert.doesNotMatch(line, /\b[1-9]\d*\b/, `outstanding debt remains: ${line}`);
  }

  // The L-G/L-H/L-I debt is NOT zero and must not be printed as if it were:
  // every vertical still carries over-budget gap regions. A report that hid
  // them would be the "green means clean" reading this gate exists to refuse.
  const gapDebt = result.stdout.match(/^ {2}gap debt: .*$/gm) ?? [];
  assert.equal(gapDebt.length, 3, result.stdout);
  for (const line of gapDebt) {
    assert.match(line, /[1-9]\d* region\(s\) over the 10-channel budget/, line);
  }
});
