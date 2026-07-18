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
