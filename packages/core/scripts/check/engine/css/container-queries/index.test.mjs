/**
 * Self-test for container-query-gate.mjs (W6-A).
 *
 * Pure-function unit tests drill the two detection passes in isolation
 * (mirroring skin-dead-part-audit.test.mjs's direct-import style); a small
 * set of spawnSync fixture runs prove the CLI wiring end to end, including
 * the negative paths a pure-function test cannot reach on its own (baseline
 * loading, --seed round-trip, process exit codes) -- mirroring
 * css-layer-paint-gate.test.mjs's fixture() convention.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  classifyMediaParams,
  compoundWithin,
  evaluateDeadNames,
  evaluateSelfReferentialQueries,
  evaluateViewportQueries,
  extractContainerQueries,
  extractDeclaredContainerNames,
  extractMediaQueries,
  extractSelfReferenceFacts,
  parseComplexSelector,
  parseCompound,
  selfReferenceSiteId,
  stripComments,
} from './index.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'index.mjs');

function runGate(args) {
  return spawnSync(process.execPath, [gate, ...args], { encoding: 'utf8' });
}

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'container-query-gate-'));
  const write = (rel, source) => {
    const full = join(dir, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, source);
    return full;
  };
  const cssRoot = join(dir, 'css-root');
  const componentsRoot = join(cssRoot, 'presentation/components');
  const baselinePath = join(dir, 'baseline.json');
  write('baseline.json', JSON.stringify({ deadContainerNames: {}, viewportQueries: {} }));
  return {
    dir,
    write,
    cssRoot,
    componentsRoot,
    baselinePath,
    args: ['--css-root', cssRoot, '--components-root', componentsRoot, '--baseline', baselinePath],
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}

/* ------------------------------------------------------------------------ */
/* stripComments                                                            */
/* ------------------------------------------------------------------------ */

test('stripComments blanks comment text but preserves every newline (line numbers stay accurate)', () => {
  const css = '.a { color: red; }\n/* line 2\n   line 3 */\n.b { color: blue; }\n';
  const stripped = stripComments(css);
  assert.equal(stripped.split('\n').length, css.split('\n').length);
  assert.doesNotMatch(stripped, /line 2|line 3/);
  assert.match(stripped, /\.b \{ color: blue; \}/);
});

/* ------------------------------------------------------------------------ */
/* extractDeclaredContainerNames                                            */
/* ------------------------------------------------------------------------ */

test('extractDeclaredContainerNames reads the longhand property, a multi-name list, and ignores none', () => {
  const css = [
    '.a { container-type: inline-size; container-name: ds-page; }',
    '.b { container-name: ds-rail ds-detail; }',
    '.c { container-name: none; }',
  ].join('\n');
  assert.deepEqual([...extractDeclaredContainerNames(css)].sort(), ['ds-detail', 'ds-page', 'ds-rail']);
});

test('extractDeclaredContainerNames reads the container shorthand and never matches container-type alone', () => {
  const css = [
    '.a { container: ds-collection / inline-size; }',
    '.b { container-type: inline-size; }',
  ].join('\n');
  assert.deepEqual([...extractDeclaredContainerNames(css)], ['ds-collection']);
});

test('extractDeclaredContainerNames ignores names quoted inside a comment', () => {
  const css = '/* container-name: ds-ghost; */\n.a { color: red; }';
  assert.deepEqual([...extractDeclaredContainerNames(css)], []);
});

test('extractDeclaredContainerNames does not match a custom property that merely ENDS in "container"', () => {
  // Regression: --ds-spacing-container is a real token (spacing.css); a plain
  // \b boundary treats the leading `-` as a word break and false-matches the
  // `container` shorthand inside it.
  const css = '  --ds-spacing-container: var(--ds-spacing-6);\n';
  assert.deepEqual([...extractDeclaredContainerNames(css)], []);
});

/* ------------------------------------------------------------------------ */
/* extractContainerQueries                                                  */
/* ------------------------------------------------------------------------ */

test('extractContainerQueries captures a named query with its real line number', () => {
  const css = '.a { color: red; }\n\n@container ds-page (max-width: 640px) {\n  .b { color: blue; }\n}\n';
  const queries = extractContainerQueries(css, 'fixture.css');
  assert.deepEqual(queries, [{ name: 'ds-page', line: 3, file: 'fixture.css' }]);
});

test('extractContainerQueries skips unnamed, not(), and style() queries', () => {
  const css = [
    '@container (min-width: 400px) { .a { color: red; } }',
    '@container not (min-width: 400px) { .b { color: red; } }',
    "@container style(--responsive: true) { .c { color: red; } }",
  ].join('\n');
  assert.deepEqual(extractContainerQueries(css), []);
});

test('extractContainerQueries does not read a name out of prose that quotes @container in a comment', () => {
  const css = '/* see @container ds-ghost (max-width: 1px) for reference */\n.a { color: red; }';
  assert.deepEqual(extractContainerQueries(css), []);
});

/* ------------------------------------------------------------------------ */
/* classifyMediaParams / extractMediaQueries                                */
/* ------------------------------------------------------------------------ */

test('classifyMediaParams: semantic features and print are exempt, width queries are viewport, everything else is other', () => {
  assert.equal(classifyMediaParams('(forced-colors: active)'), 'semantic');
  assert.equal(classifyMediaParams('(prefers-reduced-motion: reduce)'), 'semantic');
  assert.equal(classifyMediaParams('(prefers-contrast: more)'), 'semantic');
  assert.equal(classifyMediaParams('print'), 'semantic');
  assert.equal(classifyMediaParams('print, screen'), 'semantic');
  assert.equal(classifyMediaParams('(max-width: 640px)'), 'viewport');
  assert.equal(classifyMediaParams('(min-width: 900px)'), 'viewport');
  assert.equal(classifyMediaParams('(hover: hover)'), 'other');
});

test('extractMediaQueries reports the real line and strips comments first', () => {
  const css = '/* @media (max-width: 1px) in prose */\n.a{}\n@media (max-width: 640px) {\n  .b{}\n}\n';
  const queries = extractMediaQueries(css);
  assert.equal(queries.length, 1);
  assert.equal(queries[0].kind, 'viewport');
  assert.equal(queries[0].line, 3);
});

/* ------------------------------------------------------------------------ */
/* evaluateDeadNames / evaluateViewportQueries (pure evaluators)            */
/* ------------------------------------------------------------------------ */

test('evaluateDeadNames: undeclared name with no baseline entry is newDead; a baselined one is not', () => {
  const declaredNames = new Set(['ds-page']);
  const referencedQueries = [{ name: 'ds-page' }, { name: 'ds-table' }, { name: 'ds-ghost' }];
  const result = evaluateDeadNames({
    declaredNames,
    referencedQueries,
    baseline: { 'ds-table': { reason: 'accepted debt' } },
  });
  assert.deepEqual(result.dead, ['ds-ghost', 'ds-table']);
  assert.deepEqual(result.newDead, ['ds-ghost']);
  assert.deepEqual(result.revived, []);
});

test('evaluateDeadNames: a baselined name that is now declared is revived', () => {
  const result = evaluateDeadNames({
    declaredNames: new Set(['ds-table']),
    referencedQueries: [{ name: 'ds-table' }],
    baseline: { 'ds-table': { reason: 'was dead' } },
  });
  assert.deepEqual(result.dead, []);
  assert.deepEqual(result.revived, ['ds-table']);
});

test('evaluateViewportQueries: classifies new / grown / shrunk / stale against a baseline', () => {
  const result = evaluateViewportQueries({
    countsByFile: { 'a.css': 2, 'b.css': 1, 'c.css': 3 },
    baseline: {
      'b.css': { count: 1 },
      'c.css': { count: 5 },
      'd.css': { count: 1 },
    },
  });
  assert.deepEqual(result.newViolations, [{ file: 'a.css', count: 2 }]);
  assert.deepEqual(result.grown, []);
  assert.deepEqual(result.shrunk, [{ file: 'c.css', count: 3, ceiling: 5 }]);
  assert.deepEqual(result.stale, ['d.css']);
});

test('evaluateViewportQueries: growth past the ceiling is reported', () => {
  const result = evaluateViewportQueries({
    countsByFile: { 'a.css': 4 },
    baseline: { 'a.css': { count: 1 } },
  });
  assert.deepEqual(result.grown, [{ file: 'a.css', count: 4, ceiling: 1 }]);
});

/* ------------------------------------------------------------------------ */
/* CLI integration                                                          */
/* ------------------------------------------------------------------------ */

test('gate passes on the real tree with the committed baseline', () => {
  const result = runGate(['--check']);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /OK -- no new dead container names/);
});

test('fixture: a new dead @container name fails --check and names the site', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/foo.css',
      '@container ds-ghost (min-width: 10px) {\n  .x { color: red; }\n}\n',
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /new dead @container name: 'ds-ghost'/);
    assert.match(result.stderr, /foo\.css:1/);
  } finally {
    f.cleanup();
  }
});

test('fixture: declaring container-name clears the dead-name failure', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/foo.css',
      '.root { container-type: inline-size; container-name: ds-ghost; }\n\n' +
        '@container ds-ghost (min-width: 10px) {\n  .x { color: red; }\n}\n',
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    f.cleanup();
  }
});

test('fixture: a NEW viewport @media under presentation/components fails --check', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/presentation/components/foo.css',
      '@media (max-width: 600px) {\n  .x { color: red; }\n}\n',
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /new viewport-query file/);
  } finally {
    f.cleanup();
  }
});

test('fixture: semantic queries (forced-colors, prefers-*, print) are never restricted', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/presentation/components/foo.css',
      [
        '@media (forced-colors: active) { .a { color: red; } }',
        '@media (prefers-reduced-motion: reduce) { .b { color: red; } }',
        '@media print { .c { color: red; } }',
      ].join('\n'),
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    f.cleanup();
  }
});

test('fixture: --seed writes a baseline that then makes --check pass, and re-running --seed is idempotent', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/presentation/components/foo.css',
      '@media (max-width: 600px) {\n  .x { color: red; }\n}\n',
    );
    f.write('css-root/bar.css', '@container ds-ghost (min-width: 10px) {\n  .y { color: blue; }\n}\n');

    const seeded = runGate([...f.args, '--seed']);
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);

    const checked = runGate([...f.args, '--check']);
    assert.equal(checked.status, 0, checked.stderr || checked.stdout);

    const reseeded = runGate([...f.args, '--seed']);
    assert.equal(reseeded.status, 0, reseeded.stderr || reseeded.stdout);
    const recheck = runGate([...f.args, '--check']);
    assert.equal(recheck.status, 0, recheck.stderr || recheck.stdout);
  } finally {
    f.cleanup();
  }
});

test('fixture: growth past a seeded ceiling fails --check', () => {
  const f = fixture();
  try {
    f.write(
      'css-root/presentation/components/foo.css',
      '@media (max-width: 600px) {\n  .x { color: red; }\n}\n',
    );
    const seeded = runGate([...f.args, '--seed']);
    assert.equal(seeded.status, 0, seeded.stderr || seeded.stdout);

    f.write(
      'css-root/presentation/components/foo.css',
      '@media (max-width: 600px) { .x { color: red; } }\n@media (min-width: 900px) { .y { color: blue; } }\n',
    );
    const result = runGate([...f.args, '--check']);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /viewport-query ceiling grew/);
  } finally {
    f.cleanup();
  }
});

/* ------------------------------------------------------------------------ */
/* (c) self-referential container queries                                   */
/* ------------------------------------------------------------------------ */

const CARD = ".ds-card.ds-card--modern[data-part='root'] { container-name: ds-card; container-type: inline-size; }\n";

function selfSites(css, baseline = {}) {
  return evaluateSelfReferentialQueries({ ...extractSelfReferenceFacts(css, 'skin.css'), baseline });
}

function inQuery(rule) {
  return `${CARD}@container ds-card (max-width: 28rem) {\n  ${rule} { gap: 0; }\n}\n`;
}

test('parseCompound: attribute quoting and duplicates normalize, so equal compounds compare equal', () => {
  const a = parseCompound(".ds-card[data-part='root'][data-part='root']");
  const b = parseCompound('.ds-card[data-part="root"]');
  assert.deepEqual([...a.simples].sort(), [...b.simples].sort());
  assert.equal(parseCompound('.x::before').pseudoElement, true);
});

test('compoundWithin: a narrower compound is within the declared one; a broader one is not', () => {
  const declared = parseCompound(".ds-card.ds-card--modern[data-part='root']");
  assert.equal(compoundWithin(parseCompound(".ds-card.ds-card--modern[data-part='root']:hover"), declared), true);
  assert.equal(compoundWithin(parseCompound(".ds-card--modern.ds-card[data-part=root]"), declared), true);
  assert.equal(compoundWithin(parseCompound("[data-part='root']"), declared), false);
});

test('parseComplexSelector: descendant and child compounds are ancestors; sibling compounds are not', () => {
  const complex = parseComplexSelector(".a > .b + .c .d");
  assert.deepEqual(complex.map((c) => [c.text, c.ancestor]), [['.a', true], ['.b', false], ['.c', true], ['.d', false]]);
});

test('self-reference: a planted query from the declaring selector is a finding', () => {
  const result = selfSites(inQuery(".ds-card.ds-card--modern[data-part='root']"));
  assert.equal(result.live.length, 1);
  assert.deepEqual(result.newSites, [selfReferenceSiteId(result.live[0])]);
});

test('self-reference: a narrower compound on the same element (root:hover, root:not(...)) is a finding', () => {
  assert.equal(selfSites(inQuery(".ds-card.ds-card--modern[data-part='root']:hover")).live.length, 1);
  assert.equal(selfSites(inQuery(".ds-card--modern.ds-card[data-part=\"root\"]:not([data-x])")).live.length, 1);
});

test('self-reference: a query on real descendants is valid', () => {
  for (const rule of [".ds-card.ds-card--modern[data-part='root'] > *", ".ds-card.ds-card--modern[data-part='root'] [data-part='body']", "[data-part='root']"]) {
    assert.deepEqual(selfSites(inQuery(rule)).live, [], rule);
  }
});

test('self-reference: a card inside a card names its same-name ancestor and is valid', () => {
  const nested = ".ds-card.ds-card--modern[data-part='root'] .ds-card.ds-card--modern[data-part='root']";
  assert.deepEqual(selfSites(inQuery(nested)).live, []);
  const sibling = ".ds-card.ds-card--modern[data-part='root'] + .ds-card.ds-card--modern[data-part='root']";
  assert.equal(selfSites(inQuery(sibling)).live.length, 1, 'a sibling is not an ancestor');
});

test('self-reference: a pseudo-element of the declaring element is counted as not judged, never as a finding', () => {
  const result = selfSites(inQuery(".ds-card.ds-card--modern[data-part='root']::before"));
  assert.deepEqual(result.live, []);
  assert.equal(result.unjudged, 1);
});

test('self-reference ledger: a listed site passes, a vanished site is stale, and removal needs a reason and a mover', () => {
  const css = inQuery(".ds-card.ds-card--modern[data-part='root']");
  const id = selfReferenceSiteId(selfSites(css).live[0]);
  assert.deepEqual(selfSites(css, { sites: { [id]: { adjudication: 'A' } } }).newSites, []);
  const gone = selfSites(inQuery(".ds-card.ds-card--modern[data-part='root'] > *"), { sites: { [id]: { adjudication: 'A' } } });
  assert.deepEqual(gone.staleSites, [id]);
  const removed = selfSites(css.replace('max-width', 'min-width'), { sites: { [id]: { adjudication: 'A' } }, removed: { other: { reason: 'fixed', mover: 'not-a-sha' } } });
  assert.match(removed.malformed.join('\n'), /other: a removed site needs a reason and the commit that moved it/);
  const unadjudicated = selfSites(css, { sites: { [id]: {} } });
  assert.match(unadjudicated.malformed.join('\n'), /needs an adjudication/);
});

test('self-reference: a repeated selector in the same file is two sites', () => {
  const css = `${CARD}@container ds-card (max-width: 28rem) { .ds-card.ds-card--modern[data-part='root'] { gap: 0; } }\n@container ds-card (max-width: 20rem) { .ds-card.ds-card--modern[data-part='root'] { gap: 1px; } }\n`;
  const ids = selfSites(css).live.map(selfReferenceSiteId);
  assert.equal(ids.length, 2);
  assert.match(ids[1], / #2$/);
});

test('fixture: a planted self-referential query fails --check; the ancestor-query and nested forms pass', () => {
  const f = fixture();
  try {
    f.write('css-root/runtime/engines/modern/skin/probe/index.css', inQuery(".ds-card.ds-card--modern[data-part='root']"));
    const red = runGate([...f.args, '--check']);
    assert.equal(red.status, 1);
    assert.match(red.stderr, /new self-referential container query: .*probe\/index\.css:3 queries @container ds-card/);

    f.write('css-root/runtime/engines/modern/skin/probe/index.css', inQuery(".ds-card.ds-card--modern[data-part='root'] > *") + inQuery(".ds-card.ds-card--modern[data-part='root'] .ds-card.ds-card--modern[data-part='root']"));
    const green = runGate([...f.args, '--check']);
    assert.equal(green.status, 0, green.stderr);
  } finally {
    f.cleanup();
  }
});

test('the committed ledger names every live site with an adjudication', () => {
  const result = runGate([]);
  assert.match(result.stdout, /self-referential queries\s+: (\d+) live/);
  assert.match(result.stdout, /new self-referential \(fail\) : 0/);
});

test('fixture: --seed carries the self-referential ledger verbatim and never regenerates it', async () => {
  const f = fixture();
  try {
    f.write('css-root/probe.css', inQuery(".ds-card.ds-card--modern[data-part='root']"));
    const ledger = { sites: { 'hand-written id': { adjudication: 'kept as written' } }, removed: {} };
    f.write('baseline.json', JSON.stringify({ deadContainerNames: {}, viewportQueries: {}, selfReferentialQueries: ledger }));
    const seeded = runGate([...f.args, '--seed']);
    assert.equal(seeded.status, 0, seeded.stderr);
    const { readFileSync } = await import('node:fs');
    assert.deepEqual(JSON.parse(readFileSync(f.baselinePath, 'utf8')).selfReferentialQueries, ledger);
  } finally {
    f.cleanup();
  }
});

/* ------------------------------------------------------------------------ */
/* (c) class twins                                                          */
/* ------------------------------------------------------------------------ */

const TWIN_K = ".ds-structure.ds-x[data-part='root']";
const TWIN_C = '.ds-structure.ds-x.ds-x__root';

function declare(...selectors) {
  return `${selectors.join(', ')} { container-name: ds-x; container-type: inline-size; }\n`;
}

const TWIN_DECL = declare(TWIN_K, TWIN_C);

function inTwinQuery(selector, decl = TWIN_DECL) {
  return `${decl}@container ds-x (inline-size < 20rem) {\n  ${selector} { gap: 0; }\n}\n`;
}

function twinId(selector, occurrence = 1) {
  return selfReferenceSiteId({ file: 'skin.css', name: 'ds-x', selector, occurrence });
}

const TWIN_K_LEDGER = { sites: { [twinId(TWIN_K)]: { adjudication: 'A' } } };

test('self-reference twin: a class twin of a live part site in the same rule is one site, reported as collapsed', () => {
  for (const order of [[TWIN_K, TWIN_C], [TWIN_C, TWIN_K]]) {
    const css = inTwinQuery(order.join(', '), declare(...order));
    const fresh = selfSites(css);
    assert.equal(fresh.live.length, 1, order.join(', '));
    assert.deepEqual(fresh.newSites, [twinId(TWIN_K)]);
    assert.deepEqual(fresh.collapsed.map((entry) => [entry.selector, entry.into]), [[TWIN_C, twinId(TWIN_K)]]);
    const ledgered = selfSites(css, TWIN_K_LEDGER);
    assert.deepEqual(ledgered.newSites, []);
    assert.deepEqual(ledgered.staleSites, []);
  }
});

test("self-reference twin: repeated twin rules each collapse into their own rule's site, which keeps its ordinal", () => {
  const css = `${TWIN_DECL}@container ds-x (inline-size < 30rem) {\n  ${TWIN_K}, ${TWIN_C} { gap: 0; }\n}\n@container ds-x (inline-size < 20rem) {\n  ${TWIN_K}, ${TWIN_C} { gap: 1px; }\n}\n`;
  const result = selfSites(css);
  assert.deepEqual(result.live.map(selfReferenceSiteId), [twinId(TWIN_K), twinId(TWIN_K, 2)]);
  assert.deepEqual(result.collapsed.map((entry) => [entry.line, entry.into]), [[3, twinId(TWIN_K)], [6, twinId(TWIN_K, 2)]]);
});

test('self-reference twin: a twin without a live part member in its own rule stays a new site', () => {
  const alone = selfSites(inTwinQuery(TWIN_C), TWIN_K_LEDGER);
  assert.deepEqual(alone.newSites, [twinId(TWIN_C)]);
  assert.deepEqual(alone.staleSites, [twinId(TWIN_K)]);
  assert.deepEqual(alone.collapsed, []);

  const sameLine = selfSites(`${TWIN_DECL}@container ds-x (inline-size < 20rem) {\n  ${TWIN_K} { gap: 0; } ${TWIN_C} { gap: 0; }\n}\n`, TWIN_K_LEDGER);
  assert.deepEqual(sameLine.live.map((site) => site.line), [3, 3]);
  assert.deepEqual(sameLine.newSites, [twinId(TWIN_C)]);
  assert.deepEqual(sameLine.collapsed, []);

  const facts = extractSelfReferenceFacts(inTwinQuery(`${TWIN_K}, ${TWIN_C}`), 'skin.css');
  for (const fact of [...facts.declarations, ...facts.queries]) delete fact.rule;
  const anonymous = evaluateSelfReferentialQueries({ ...facts, baseline: TWIN_K_LEDGER });
  assert.deepEqual(anonymous.newSites, [twinId(TWIN_C)]);
  assert.deepEqual(anonymous.collapsed, []);
});

test('self-reference twin: a member that is not the exact class twin stays a new site', () => {
  const quotedPart = ".ds-structure.ds-x[data-part='root'][data-note='a  b']";
  const quotedTwin = ".ds-structure.ds-x.ds-x__root[data-note='a b']";
  const rows = [
    ['reordered', TWIN_K, '.ds-x.ds-structure.ds-x__root', TWIN_DECL],
    ['duplicated', TWIN_K, '.ds-structure.ds-x.ds-x.ds-x__root', TWIN_DECL],
    ['narrowed', TWIN_K, `${TWIN_C}:hover`, TWIN_DECL],
    ['widened', `${TWIN_K}:not([data-x])`, TWIN_C, TWIN_DECL],
    ['combinator', `.w > ${TWIN_K}`, `.w ${TWIN_C}`, TWIN_DECL],
    ['separate declaring rules', TWIN_K, TWIN_C, `${declare(TWIN_K)}${declare(TWIN_C)}`],
    ['one broader declarer', TWIN_K, TWIN_C, declare('.ds-structure.ds-x')],
    ['quoted attribute value', quotedPart, quotedTwin, declare(quotedPart, quotedTwin)],
  ];
  for (const [label, part, twin, decl] of rows) {
    const result = selfSites(inTwinQuery(`${part}, ${twin}`, decl), { sites: { [twinId(part)]: { adjudication: 'A' } } });
    assert.deepEqual(result.newSites, [twinId(twin)], label);
    assert.deepEqual(result.collapsed, [], label);
  }
});

test('self-reference twin: another scope or part, a non-exact part token, or an ambiguous pairing never collapses', () => {
  const foreign = '.ds-structure.ds-x.ds-y__root';
  const body = '.ds-structure.ds-x.ds-x__body';
  const tilde = ".ds-structure.ds-x[data-part~='root']";
  const otherScope = '.ds-structure.ds-x.ds-structure__root';
  const quoted = '.ds-structure.ds-x[data-part="root"]';
  const rows = [
    ['foreign scope', [TWIN_K, foreign], [TWIN_K, foreign], [foreign]],
    ['wrong part', [TWIN_K, body], [TWIN_K, body], [body]],
    ['operator', [tilde, TWIN_C], [tilde, TWIN_C], [tilde, TWIN_C]],
    ['two twins of one part member', [TWIN_K, TWIN_C, otherScope], [TWIN_K, TWIN_C, otherScope], [TWIN_C, otherScope]],
    ['one twin of two part members', [TWIN_K, TWIN_C], [TWIN_K, quoted, TWIN_C], [quoted, TWIN_C]],
    ['repeated part member', [TWIN_K, TWIN_C], [TWIN_K, TWIN_C, TWIN_K], [TWIN_C]],
  ];
  for (const [label, decl, query, members] of rows) {
    const result = selfSites(inTwinQuery(query.join(', '), declare(...decl)));
    for (const member of members) assert.ok(result.newSites.includes(twinId(member)), `${label}: ${member}`);
    assert.deepEqual(result.collapsed, [], label);
  }
});

test('self-reference twin: a third live member of the rule is judged on its own', () => {
  const hovered = `${TWIN_K}:hover`;
  const result = selfSites(inTwinQuery(`${TWIN_K}, ${TWIN_C}, ${hovered}`), TWIN_K_LEDGER);
  assert.deepEqual(result.newSites, [twinId(hovered)]);
  assert.deepEqual(result.collapsed.map((entry) => entry.into), [twinId(TWIN_K)]);
});

test('self-reference twin: pseudo-element members stay not judged and never collapse', () => {
  const both = selfSites(inTwinQuery(`${TWIN_K}::before, ${TWIN_C}::before`));
  assert.deepEqual(both.live, []);
  assert.equal(both.unjudged, 2);
  assert.deepEqual(both.collapsed, []);
  const one = selfSites(inTwinQuery(`${TWIN_K}, ${TWIN_C}::before`));
  assert.equal(one.live.length, 1);
  assert.equal(one.unjudged, 1);
  assert.deepEqual(one.collapsed, []);
});

test('fixture: --check prints the collapsed twin and still fails on every other finding', () => {
  const f = fixture();
  try {
    const probe = 'css-root/runtime/engines/modern/skin/probe/index.css';
    const twinRule = inTwinQuery(`${TWIN_K}, ${TWIN_C}`);
    const extraRule = `@container ds-x (inline-size < 10rem) {\n  ${TWIN_K}:focus-within { gap: 0; }\n}\n`;
    const twinLine = /collapsed class twin: .*probe\/index\.css:\d+ @container ds-x \.ds-structure\.ds-x\.ds-x__root -> (.+)$/mu;
    f.write(probe, twinRule + extraRule);
    const unledgered = runGate([...f.args, '--check']);
    assert.equal(unledgered.status, 1);
    assert.match(unledgered.stdout, /collapsed class twins\s+: 1/u);
    const partId = unledgered.stdout.match(twinLine)?.[1];
    assert.ok(partId, unledgered.stdout);
    assert.match(unledgered.stderr, /FAIL \(2\)/u);
    assert.doesNotMatch(unledgered.stderr, /ds-x__root/u);

    f.write('baseline.json', JSON.stringify({ deadContainerNames: {}, viewportQueries: {}, selfReferentialQueries: { sites: { [partId]: { adjudication: 'A' } } } }));
    const ledgered = runGate([...f.args, '--check']);
    assert.equal(ledgered.status, 1);
    assert.match(ledgered.stderr, /FAIL \(1\)/u);
    assert.doesNotMatch(ledgered.stderr, /ds-x__root/u);

    f.write(probe, twinRule);
    const clean = runGate([...f.args, '--check']);
    assert.equal(clean.status, 0, clean.stderr);
    assert.match(clean.stdout, /collapsed class twins\s+: 1/u);
    assert.match(clean.stdout, twinLine);
  } finally {
    f.cleanup();
  }
});
