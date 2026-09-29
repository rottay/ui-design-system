/**
 * DRILL for `property-law` (Arm B).
 *
 * Two things need proving: that the verdict reddens on a new site, a stale
 * roster entry, a shrunken corpus and a grammar that is not the frozen one; and
 * that the GRAMMAR is worth freezing, which is measured here rather than
 * asserted -- a single-line-anchored declaration scan over the same corpus reads
 * a materially different population, so a count seeded against an unfrozen
 * grammar could be moved with no CSS touched anywhere.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { GRAMMAR, LAYOUT_ALIASES, LAYOUT_PROPERTY_TOKENS, audit, scan, sitesInValue, splitSegments } from './index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../../../..');
const baseline = JSON.parse(readFileSync(join(HERE, 'baseline/index.json'), 'utf8'));

test('the tree is clean against its own roster', () => {
  const { problems, sites, files } = audit(baseline);
  assert.deepEqual(problems, []);
  assert.equal(sites.length, baseline.counts.total);
  assert.ok(files >= baseline.corpus.floorFiles, `corpus shrank to ${files}`);
});

test('the baseline freezes the grammar BEFORE the count, and the scanner asserts it', () => {
  assert.equal(baseline.grammar.declarationPattern, GRAMMAR.declarationPattern);
  assert.equal(baseline.grammar.version, GRAMMAR.version);
  // Key order is the ordering law made visible: grammar, then tokens, then count.
  const keys = Object.keys(baseline);
  assert.ok(keys.indexOf('grammar') < keys.indexOf('counts'));
  assert.ok(keys.indexOf('layoutPropertyTokens') < keys.indexOf('counts'));
  assert.ok(keys.indexOf('counts') < keys.indexOf('sites') + 1);
});

test('DRILL: a baseline declaring a different grammar is REFUSED', () => {
  const drifted = { ...baseline, grammar: { ...baseline.grammar, declarationPattern: '^transition\\s*:(.*)$' } };
  const { problems } = audit(drifted);
  assert.ok(problems.some((problem) => problem.includes('freeze the grammar before the count')));
});

test('DRILL: a baseline whose token list differs from the scanner is REFUSED', () => {
  const drifted = { ...baseline, layoutPropertyTokens: baseline.layoutPropertyTokens.slice(0, 5) };
  assert.ok(audit(drifted).problems.some((problem) => problem.includes('token list')));
});

test('DRILL: a new site is REFUSED, and a drained roster entry is REFUSED as stale', () => {
  const withoutFirst = { ...baseline, sites: baseline.sites.slice(1) };
  assert.ok(audit(withoutFirst).problems.some((problem) => problem.startsWith('NEW ')));

  const invented = {
    ...baseline,
    sites: [...baseline.sites, { file: 'src/foundation/tokens/css/not-a-file.css', line: 1, kind: 'layoutProperty', property: 'width' }],
  };
  assert.ok(audit(invented).problems.some((problem) => problem.startsWith('STALE ')));
});

test('DRILL: a scanner that stopped walking is REFUSED by the corpus floor', () => {
  // The floor must exceed the LIVE corpus: pinning it one above the recorded
  // corpus.files silently becomes a live floor once the corpus legitimately
  // grows, and the drill then proves nothing.
  const { files } = audit(baseline);
  const raised = { ...baseline, corpus: { ...baseline.corpus, floorFiles: files + 1 } };
  assert.ok(audit(raised).problems.some((problem) => problem.includes('corpus floor')));
});

test('both definition terms are measured, and the grammar is the larger', () => {
  // The same corpus under a single-line-anchored declaration grammar.
  const singleLine = new RegExp(String.raw`(?:^|[\s;{])(transition(?:-property)?)\s*:([^;}\n]*)[;}]`, 'g');
  const cssFiles = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.css')) cssFiles.push(path);
    }
  };
  walk(join(PACKAGE_ROOT, baseline.scanRoots[0]));
  let narrow = 0;
  for (const path of cssFiles) {
    const relativePath = path.replaceAll('\\', '/');
    if (baseline.excluded.some((fragment) => relativePath.includes(fragment))) continue;
    const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
    for (const match of css.matchAll(singleLine)) narrow += sitesInValue(match[2] ?? '').length;
  }

  const frozen = scan().sites.length;
  const { grammar, tokenList } = baseline.termWeights;
  assert.equal(frozen, grammar.frozen);
  assert.equal(narrow, grammar.singleLineAnchored);
  assert.equal(frozen - narrow, grammar.worth);

  // The second term: the same corpus and grammar under the engine audit's own
  // 14-token kebab list, before this rule widened it.
  const ENGINE_AUDIT_TOKENS = [
    'top', 'left', 'width', 'height',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  ];
  const declarationRe = new RegExp(baseline.grammar.declarationPattern, 'g');
  let narrowTokens = 0;
  for (const path of cssFiles) {
    const relativePath = path.replaceAll('\\', '/');
    if (baseline.excluded.some((fragment) => relativePath.includes(fragment))) continue;
    const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
    declarationRe.lastIndex = 0;
    for (const match of css.matchAll(declarationRe)) {
      for (const segment of splitSegments(match[2] ?? '')) {
        if (LAYOUT_ALIASES.some((alias) => segment.includes(alias))) { narrowTokens += 1; continue; }
        const token = segment.trim().split(/[\s(]/)[0] ?? '';
        if (token === 'all' || ENGINE_AUDIT_TOKENS.includes(token)) narrowTokens += 1;
      }
    }
  }
  assert.equal(narrowTokens, tokenList.engineAuditKebabListOnly);
  assert.equal(frozen - narrowTokens, tokenList.worth);

  // The ordering law's premise: the grammar is the term that moves it most.
  assert.ok(grammar.worth > tokenList.worth,
    `the grammar term (${grammar.worth}) must be the larger; token list is ${tokenList.worth}`);
});

test('the segment split and the site grammar are the ones the baseline describes', () => {
  assert.deepEqual(splitSegments('opacity var(--a, b), inline-size 2s').map((s) => s.trim()),
    ['opacity var(--a, b)', 'inline-size 2s']);

  assert.deepEqual(sitesInValue('transform 200ms'), []);
  assert.deepEqual(sitesInValue('opacity .2s, block-size .2s'), [{ kind: 'layoutProperty', property: 'block-size' }]);
  assert.deepEqual(sitesInValue('all var(--ds-motion-fast)'), [{ kind: 'transitionAll', property: 'all' }]);
  assert.deepEqual(sitesInValue('var(--ds-transition-rearrange)'),
    [{ kind: 'layoutAlias', property: '--ds-transition-rearrange' }]);
  assert.deepEqual(LAYOUT_ALIASES.filter((alias) => !alias.startsWith('--ds-transition-')), []);
});

test('ONE token list, TWO arms: the ESLint rule and this scanner cannot drift', () => {
  const armA = readFileSync(
    join(PACKAGE_ROOT, 'src/entrypoints/eslint/rules/no-layout-property-animation/index.ts'),
    'utf8',
  );
  const declaration = armA.match(/export const LAYOUT_PROPERTY_TOKENS = \[([\s\S]*?)\];/u);
  assert.ok(declaration, 'Arm A must publish its token list as one literal array');
  const armATokens = [...declaration[1].matchAll(/'([^']+)'/gu)].map((match) => match[1]);
  assert.deepEqual(armATokens, [...LAYOUT_PROPERTY_TOKENS]);
});

test('the blind-spot count is MEASURED over the sheets, not read back from the baseline', () => {
  const [blindSpot] = baseline.knownBlindSpots;
  const pattern = new RegExp(blindSpot.pattern, 'g');

  const cssFiles = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.css')) cssFiles.push(path);
    }
  };
  walk(join(PACKAGE_ROOT, blindSpot.scanRoot));

  let declarations = 0;
  const owners = new Set();
  for (const path of cssFiles) {
    // The exclusions are the measurement's: facade/artifacts mirrors the source
    // sheets (5 generated declarations per vertical), and counting generated
    // duplicates would read one authority as two.
    const relativePath = path.replaceAll('\\', '/');
    if (baseline.excluded.some((fragment) => relativePath.includes(fragment))) continue;
    const css = readFileSync(path, 'utf8');
    pattern.lastIndex = 0;
    for (const match of css.matchAll(pattern)) {
      declarations += 1;
      owners.add(match[0].replace(/^--ds-/u, '').replace(/-transition:.*$/u, ''));
    }
  }

  // A self-referential assertion (baseline vs baseline) proves nothing; this one
  // fails when the sheets and the recorded number disagree in either direction.
  assert.equal(declarations, blindSpot.measured,
    `the sheets carry ${declarations} component-channel declarations, the baseline records ${blindSpot.measured}`);
  assert.deepEqual([...owners].sort(), [...blindSpot.owners].sort());
  assert.match(blindSpot.disposition, /not this lot/u);

  // And the class is genuinely distinct from the roster's DIRECT `all` sites.
  // That class is EMPTY since 7a79c1b89 (WO-RET-02 packet 1) drained the single
  // framework-bridge site; the pin is kept at 0 as the anti-return record -- the
  // roster is decrease-only, so a new direct `all` enters as a NEW site and the
  // gate reddens before this assertion is ever reached.
  assert.equal(baseline.counts.byKind.transitionAll, 0);
});
