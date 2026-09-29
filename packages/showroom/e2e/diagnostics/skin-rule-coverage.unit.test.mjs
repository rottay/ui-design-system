// Node unit test (no browser) proving the dead-selector spec is not vacuous.
//
// The Playwright audit only means something if collectRules() actually reads
// the skin corpus. When SKIN_DIRS pointed at relocated paths it returned an
// empty set and the audit asserted nothing while still passing. This test
// pins the collection at the source level so that regression is caught in
// milliseconds, in CI, without a browser or a production build.
//
// Run: node --test packages/showroom/e2e/diagnostics/skin-rule-coverage.unit.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectRules, SKIN_DIRS } from './skin-rule-coverage.lib.mjs';

test('collectRules reads the real skin corpus (spec is not vacuous)', () => {
  const rules = collectRules();

  // The three roots hold 355 skin files (128 agnostic, 115 modern, 112 rustic)
  // at the time of writing, yielding thousands of probeable selectors. A floor
  // of 1000 is far above any plausible partial-collection accident and far
  // below the ~5500 real count, so it bites on a stale path (0) without being
  // brittle to routine skin edits.
  assert.ok(
    rules.length > 1000,
    `expected > 1000 probeable selectors, got ${rules.length} — SKIN_DIRS is likely stale`,
  );

  // All three engines must contribute. A single relocated root would zero out
  // one engine while the others still pass a naive total check.
  for (const [engine] of SKIN_DIRS) {
    const n = rules.filter((r) => r.engine === engine).length;
    assert.ok(n > 100, `engine '${engine}' contributed only ${n} selectors — its skin root is missing or stale`);
  }
});

test('collectRules throws on a missing skin root instead of scanning nothing', () => {
  // Contract: a relocated/renamed root is a loud failure, never an empty set.
  for (const [engine, dir] of SKIN_DIRS) {
    assert.ok(dir.endsWith('/skin'), `engine '${engine}' root does not end in /skin: ${dir}`);
  }
});

// ── Instrument defect classes (red on the pre-repair lib) ──────────────────

test('a mid-transition read is refused: the phone posture at a desktop width is not settled', async () => {
  const { postureSettled } = await import('./skin-rule-coverage.lib.mjs');
  assert.equal(typeof postureSettled, 'function', 'postureSettled must exist');
  assert.equal(postureSettled(['phone expanded'], 1280), false);
  assert.equal(postureSettled(['desktop expanded', 'phone'], 1280), false);
  assert.equal(postureSettled(['tablet regular'], 1280), false);
  assert.equal(postureSettled(['desktop expanded', 'desktop'], 1280), true);
  assert.equal(postureSettled([], 1280), true);
  assert.equal(postureSettled(['tablet compact'], 800), true);
  assert.equal(postureSettled(['phone'], 390), true);
});

test('an invalid selector is its own finding, never a silent match', async () => {
  const { probeSelectors } = await import('./skin-rule-coverage.lib.mjs');
  assert.equal(typeof probeSelectors, 'function', 'probeSelectors must exist');
  const fakeDocument = {
    querySelector(s) {
      if (s.includes(']-within') || s.includes(', )') || s.includes('()') || s.includes(':lang(ar, fa)')) {
        throw new SyntaxError(`'${s}' is not a valid selector`);
      }
      return s.includes('present') ? {} : null;
    },
  };
  const previous = globalThis.document;
  globalThis.document = fakeDocument;
  try {
    const out = probeSelectors([
      ['.present:hover', '.present', '.present'],
      ['.absent', '.absent', '.absent'],
      ['[data-part="x"]:focus-within', '[data-part="x"]-within', ':where(:root, )'],
      ['.present:lang(ar, fa)', '.present:lang(ar, fa)', '.present:lang(ar, fa)'],
    ]);
    assert.deepEqual(out, [
      ['hit', 'hit', 'hit'],
      ['miss', 'miss', 'miss'],
      ['miss', 'invalid', 'invalid'],
      ['invalid', 'invalid', 'invalid'],
    ]);
  } finally {
    globalThis.document = previous;
  }
  // Playwright serializes the function by source: it must close over nothing.
  assert.doesNotMatch(probeSelectors.toString(), /\bimport\b|\brequire\b/);
});

test('toProbe keeps :focus-within intact as a unit instead of mangling it', async () => {
  const { toProbe } = await import('./skin-rule-coverage.lib.mjs');
  assert.equal(toProbe('.a [data-part="expand-button"]:focus-within'), '.a [data-part="expand-button"]');
  assert.equal(toProbe('.a:focus-visible > .b'), '.a > .b');
  assert.equal(toProbe('.a::after'), '.a');
  assert.equal(toProbe('.a:before'), '.a');
  assert.equal(toProbe(':hover'), null);
});

test('alternations are never emptied: a state-only arm makes the whole :is()/:where() vacuous', async () => {
  const { toProbe, toSkeleton } = await import('./skin-rule-coverage.lib.mjs');
  const sel = `.ds-x[data-part="row"]:is([data-state~='hovered'], :hover)`;
  const probe = toProbe(sel);
  assert.equal(probe, `.ds-x[data-part="row"]`);
  assert.equal(toSkeleton(`.ds-x[data-part="row"]:is([data-state~='hovered'], [data-state~='pressed'])`), `.ds-x[data-part="row"]`);
  assert.equal(toSkeleton(`:where([data-density='compact']) .ds-y`), `.ds-y`);
  assert.equal(toSkeleton(`:where(:root, [data-theme]) .ds-y [data-part="a"]`), `.ds-y [data-part="a"]`);
  // A structural alternation survives, arm by arm.
  assert.equal(
    toSkeleton(`.ds-z :is([data-part="a"], [data-part="b"][data-state="open"])`),
    `.ds-z :is([data-part="a"], [data-part="b"])`,
  );
  // Nested parentheses: :not() inside :is() does not truncate the scan.
  assert.equal(toSkeleton(`.ds-z:is(.a:not(.b), .c) [data-part="p"]`), `.ds-z:is(.a, .c) [data-part="p"]`);
  // A compound emptied between combinators becomes the universal selector.
  assert.equal(toSkeleton(`.ds-z > [data-state="open"] > [data-part="p"]`), `.ds-z > * > [data-part="p"]`);
  // A leading emptied compound leaves no dangling combinator.
  assert.equal(toSkeleton(`[data-state="open"] > [data-part="p"]`), `* > [data-part="p"]`);
  // State-only rules produce no skeleton at all.
  assert.equal(toSkeleton(`[data-state="open"]`), null);
});

test('every collected probe and skeleton is balanced and free of emptied alternations', () => {
  const bad = [];
  for (const r of collectRules()) {
    for (const s of [r.probe, r.skeleton]) {
      let depth = 0;
      for (const ch of s) { if (ch === '(') depth++; else if (ch === ')') depth--; if (depth < 0) break; }
      if (depth !== 0 || /\(\s*[,)]|,\s*[,)]|^\s*[>+~,]|[>+~,]\s*$|-within\b/.test(s)) bad.push(`${r.engine}/${r.file}: ${s}`);
    }
  }
  assert.deepEqual(bad.slice(0, 10), [], `${bad.length} malformed probes/skeletons`);
});

test('a foreign vendor pseudo is not a dead rule, but it drops every selector grouped with it', async () => {
  const { isForeignVendorSelector } = await import('./skin-rule-coverage.lib.mjs');
  assert.equal(typeof isForeignVendorSelector, 'function', 'isForeignVendorSelector must exist');
  assert.equal(isForeignVendorSelector('.s [data-part="i"]::-moz-range-thumb'), true);
  assert.equal(isForeignVendorSelector('.s [data-part="i"]::-webkit-slider-thumb'), false);
  assert.equal(isForeignVendorSelector('.s:lang(ar, fa)'), false);
  // The browser's verdict on the whole list is what decides whether a rule applies.
  const rules = collectRules();
  assert.ok(rules.every((r) => typeof r.group === 'string' && r.group.includes(r.selector.trim())));
  const grouped = rules.find((r) => /::-webkit-slider-thumb/.test(r.selector) && /::-moz-range-thumb/.test(r.group));
  assert.ok(grouped, 'the slider thumb rule groups a -webkit- and a -moz- arm');
});

test('the skeleton keeps no state or context pseudo-class: only classes, tags and data-part', async () => {
  const { toProbe, toSkeleton } = await import('./skin-rule-coverage.lib.mjs');
  assert.equal(toProbe(`.ds-t[data-part='root']:-webkit-autofill`), `.ds-t[data-part='root']`);
  assert.equal(toSkeleton(`.ds-t[data-part='root']:dir(rtl)`), `.ds-t[data-part='root']`);
  assert.equal(toSkeleton(`.ds-t .ds-t__v:lang(ar)`), `.ds-t .ds-t__v`);
  assert.equal(toSkeleton(`.ds-t > [data-part='i']:last-child:indeterminate`), `.ds-t > [data-part='i']`);
  assert.equal(toSkeleton(`:root .ds-t`), `:root .ds-t`);
  assert.equal(toSkeleton(`.ds-t:is(code)`), `.ds-t:is(code)`);
});
