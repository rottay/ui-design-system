// Self-test for tenant-channel-consumer-gate.mjs (design section 7a).
//
// Hermetic: drills the pure exported helpers with a SYNTHETIC emitter and
// synthetic source blobs, so it needs neither dist nor a build and is safe in
// the pre-build test:scripts slot. The synthetic emitter reproduces every access
// idiom the real chrome emitter uses (truthiness guards, `!= null` numeric
// guards, String() coercion, `??` fallbacks, helper delegation, deep optional
// chaining) so a Proxy regression that breaks any of them fails here.

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ANATOMY_ATTRIBUTE_BY_FAMILY,
  CHART_SERIES_CHANNELS,
  EMITTER_CHANNEL_FLOOR,
  anatomyChannelsFrom,
  collectEmittedChannelNames,
  evaluateChannels,
  extractConsumedAnatomySelectors,
  extractConsumedVarNames,
  makePopulatedChrome,
  reasonFor,
} from './tenant-channel-consumer-gate.mjs';

function setButton(vars, prefix, btn) {
  if (!btn) return;
  if (btn.bg) vars[`--ds-button-${prefix}-bg`] = btn.bg;
  const color = btn.color ?? btn.text;
  if (color) vars[`--ds-button-${prefix}-color`] = color;
}

// Mirrors the real emitter's idioms against whatever chrome it is handed.
function syntheticEmitter(chrome) {
  const vars = {};
  if (!chrome) return vars;
  if (chrome.sidebar) {
    const s = chrome.sidebar;
    if (s.bg) vars['--ds-sidebar-bg'] = s.bg;
    if (s.groupFontWeight != null) {
      vars['--ds-sidebar-group-font-weight'] = String(s.groupFontWeight);
    }
  }
  if (chrome.controls) {
    const c = chrome.controls;
    setButton(vars, 'primary', c.buttonPrimary);
    if (c.input?.label?.color) vars['--ds-input-label-color'] = c.input.label.color;
  }
  return vars;
}

test('makePopulatedChrome drives every emitter access idiom', () => {
  const names = collectEmittedChannelNames(syntheticEmitter);
  assert.ok(names.includes('--ds-sidebar-bg'), 'truthiness guard emits');
  assert.ok(
    names.includes('--ds-sidebar-group-font-weight'),
    '`!= null` + String() path emits (numeric fields)',
  );
  assert.ok(names.includes('--ds-button-primary-bg'), 'helper delegation emits');
  assert.ok(names.includes('--ds-button-primary-color'), '`??` fallback emits');
  assert.ok(names.includes('--ds-input-label-color'), 'deep optional chaining emits');
});

test('populated chrome coerces to a non-empty string without throwing', () => {
  const chrome = makePopulatedChrome();
  assert.equal(String(chrome.anything.nested), 'x');
  assert.ok(chrome.controls.buttonPrimary.bg);
  assert.notEqual(chrome.sidebar.groupFontWeight, null);
});

test('EMITTER_CHANNEL_FLOOR guards against a collapsed inventory', () => {
  assert.ok(EMITTER_CHANNEL_FLOOR >= 300);
});

test('extractConsumedVarNames respects the name boundary', () => {
  const found = extractConsumedVarNames(
    'a{color:var(--ds-color-primary-500)} b{gap:var( --ds-density-scale , 1)} c{x:var(--ds-x)}',
  );
  assert.ok(found.has('--ds-color-primary-500'), 'full suffixed name captured');
  assert.ok(!found.has('--ds-color-primary'), 'prefix is NOT a false consumer');
  assert.ok(found.has('--ds-density-scale'), 'whitespace + comma form captured');
  assert.ok(found.has('--ds-x'), 'closing-paren form captured');
});

test('extractConsumedAnatomySelectors captures attribute selectors', () => {
  const found = extractConsumedAnatomySelectors(
    "[data-anatomy-card='ghost'] .x{} [data-anatomy-table=\"open\"] td{}",
  );
  assert.ok(found.has("[data-anatomy-card='ghost']"));
  assert.ok(found.has("[data-anatomy-table='open']"));
});

test('anatomyChannelsFrom skips default and maps the family attribute', () => {
  const channels = anatomyChannelsFrom({
    cardComponent: ['default', 'ghost'],
    table: ['default', 'open'],
  });
  const selectors = channels.map((c) => c.selector);
  assert.deepEqual(selectors, [
    "[data-anatomy-card='ghost']",
    "[data-anatomy-table='open']",
  ]);
  assert.equal(ANATOMY_ATTRIBUTE_BY_FAMILY.cardComponent, 'data-anatomy-card');
  assert.equal(anatomyChannelsFrom(null).length, 0);
});

test('evaluateChannels flags NEW dead but accepts baselined dead', () => {
  const result = evaluateChannels({
    varChannels: new Set(['--ds-a', '--ds-b', '--ds-c']),
    anatomyChannels: [{ selector: "[data-anatomy-card='ghost']" }],
    consumedVars: new Set(['--ds-a']),
    consumedAnatomy: new Set(),
    baseline: {
      channels: {
        '--ds-b': { reason: 'debt' },
        "[data-anatomy-card='ghost']": { reason: 'debt' },
      },
    },
  });
  assert.deepEqual(result.dead, [
    '--ds-b',
    '--ds-c',
    "[data-anatomy-card='ghost']",
  ]);
  assert.deepEqual(result.newDead, ['--ds-c'], 'only the unbaselined dead fails');
  assert.deepEqual(result.revived, []);
});

test('evaluateChannels surfaces a revived (now-consumed) baselined channel', () => {
  const result = evaluateChannels({
    varChannels: new Set(['--ds-a', '--ds-b']),
    anatomyChannels: [],
    consumedVars: new Set(['--ds-a', '--ds-b']),
    consumedAnatomy: new Set(),
    baseline: { channels: { '--ds-b': { reason: 'debt' } } },
  });
  assert.deepEqual(result.dead, []);
  assert.deepEqual(result.newDead, []);
  assert.deepEqual(result.revived, ['--ds-b'], 'baselined-but-alive is a tighten hint');
});

test('reasonFor classifies the known debt buckets', () => {
  assert.match(reasonFor('--ds-workspace-card-bg'), /redundancy hand-off/);
  assert.match(reasonFor('--ds-tall-card-shadow'), /redundancy hand-off/);
  assert.match(reasonFor('--ds-chart-series-3'), /chart-series/);
  assert.match(reasonFor('--ds-collection-card-footer-bg'), /partly consumed/);
  assert.match(reasonFor('--ds-color-dark-primary'), /dark-seed/);
  assert.match(reasonFor("[data-anatomy-card='ghost']"), /anatomy variant selector/);
  assert.match(reasonFor('--ds-something-unknown'), /accepted debt/);
});

test('CHART_SERIES_CHANNELS enumerates ten slots', () => {
  assert.equal(CHART_SERIES_CHANNELS.length, 10);
  assert.equal(CHART_SERIES_CHANNELS[0], '--ds-chart-series-1');
  assert.equal(CHART_SERIES_CHANNELS[9], '--ds-chart-series-10');
});
