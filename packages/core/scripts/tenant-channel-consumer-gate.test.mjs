// Self-test for tenant-channel-consumer-gate.mjs (design section 7a).
//
// Hermetic: drills the pure exported helpers with a SYNTHETIC emitter and
// synthetic source blobs, so it needs neither dist nor a build and is safe in
// the pre-build test:scripts slot. The synthetic emitter reproduces every access
// idiom the real chrome emitter uses (truthiness guards, `!= null` numeric
// guards, String() coercion, `??` fallbacks, helper delegation, deep optional
// chaining) so a Proxy regression that breaks any of them fails here.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  ANATOMY_ATTRIBUTE_BY_FAMILY,
  CHART_SERIES_CHANNELS,
  EMITTER_CHANNEL_FLOOR,
  anatomyChannelsFrom,
  classifyConsumerScope,
  collectEmittedChannelNames,
  emptyScopeIndex,
  evaluateChannels,
  evaluateModernView,
  extractConsumedAnatomySelectors,
  extractConsumedVarNames,
  makePopulatedChrome,
  modernReasonFor,
  reasonFor,
  scanConsumers,
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

/* ========================================================================== */
/* engine=modern view                                                         */
/* ========================================================================== */
//
// The defect this view closes: the global scan above walks ALL of `src/`, so a
// channel whose only reader is `engines/rustic/skin/tabs.css` counts as ALIVE —
// even though Classic and Rustic are frozen (policy 2026-07-25) and paint
// nothing in the engine we ship. The tests below pin that distinction down:
// same channel, two verdicts, and the modern one must call it dead.
//
// These stay hermetic like the rest of the file. The one CLI run over the real
// tree needs dist and SKIPS when dist is absent, so the pre-build test:scripts
// slot is unaffected; it asserts invariants rather than fixed counts, so a
// concurrent edit elsewhere in the package cannot make it flake.

const scriptDir = dirname(fileURLToPath(import.meta.url));
const gate = join(scriptDir, 'tenant-channel-consumer-gate.mjs');
const packageRoot = dirname(scriptDir);
const modernBaselinePath = join(scriptDir, 'tenant-channel-consumer-gate.modern.baseline.json');

const RUSTIC_SKIN = `${packageRoot}/src/foundation/tokens/css/runtime/engines/rustic/skin/tabs.css`;
const CLASSIC_COMPONENT = `${packageRoot}/src/ui/primitives/layout/Box/engines/classic/index.tsx`;
const MODERN_SKIN = `${packageRoot}/src/foundation/tokens/css/runtime/engines/modern/skin/tabs.css`;
const MODERN_COMPONENT = `${packageRoot}/src/ui/primitives/layout/Box/engines/modern/index.tsx`;
const MODERN_PATTERN_STYLE = `${packageRoot}/src/ui/patterns/foundation/engine-styles/modern/index.css`;
const NEUTRAL_SOURCE = `${packageRoot}/src/ui/structures/headers/collection-header/index.tsx`;

test('classifyConsumerScope separates frozen engines, the modern engine, and engine-neutral source', () => {
  assert.equal(classifyConsumerScope(RUSTIC_SKIN), 'frozen-engine');
  assert.equal(classifyConsumerScope(CLASSIC_COMPONENT), 'frozen-engine');
  assert.equal(classifyConsumerScope(MODERN_SKIN), 'modern-engine');
  assert.equal(classifyConsumerScope(MODERN_COMPONENT), 'modern-engine');
  assert.equal(classifyConsumerScope(MODERN_PATTERN_STYLE), 'modern-engine');
  assert.equal(classifyConsumerScope(NEUTRAL_SOURCE), 'engine-neutral');
});

test('classifyConsumerScope does not mistake a folder that merely contains an engine name', () => {
  assert.equal(classifyConsumerScope('/src/ui/classic-layouts/index.tsx'), 'engine-neutral');
  assert.equal(classifyConsumerScope('/src/ui/engines/custom/index.tsx'), 'engine-neutral');
});

test('scanConsumers indexes each consumer by scope and derives the union the global view uses', () => {
  const sources = {
    [RUSTIC_SKIN]: '.tab { color: var(--ds-tabs-ink); }',
    [MODERN_SKIN]: '.tab { background: var(--ds-tabs-bg); }',
    [NEUTRAL_SOURCE]: "const s = { gap: 'var(--ds-space-4)' };",
  };
  const scan = scanConsumers(Object.keys(sources), (path) => sources[path]);

  assert.deepEqual([...scan.vars['frozen-engine']], ['--ds-tabs-ink']);
  assert.deepEqual([...scan.vars['modern-engine']], ['--ds-tabs-bg']);
  assert.deepEqual([...scan.vars['engine-neutral']], ['--ds-space-4']);
  // The union is derived FROM the scopes, so the two views can never disagree
  // about what "consumed" means.
  assert.deepEqual([...scan.consumedVars].sort(), [
    '--ds-space-4',
    '--ds-tabs-bg',
    '--ds-tabs-ink',
  ]);
  assert.deepEqual(scan.filesByScope, {
    'frozen-engine': 1,
    'modern-engine': 1,
    'engine-neutral': 1,
  });
});

test('scanConsumers routes anatomy selectors through the same scope index', () => {
  const sources = {
    [RUSTIC_SKIN]: "[data-anatomy-table='compact'] { padding: 0; }",
    [MODERN_SKIN]: "[data-anatomy-card='flat'] { border: 0; }",
  };
  const scan = scanConsumers(Object.keys(sources), (path) => sources[path]);
  assert.deepEqual([...scan.merged['frozen-engine']], ["[data-anatomy-table='compact']"]);
  assert.deepEqual([...scan.merged['modern-engine']], ["[data-anatomy-card='flat']"]);
});

function scopesWith({ frozen = [], modern = [], neutral = [] }) {
  const index = emptyScopeIndex();
  for (const name of frozen) index['frozen-engine'].add(name);
  for (const name of modern) index['modern-engine'].add(name);
  for (const name of neutral) index['engine-neutral'].add(name);
  return index;
}

test('a channel read ONLY by a rustic skin is CONSUMED but NOT PAINTED — dead in modern', () => {
  const view = evaluateModernView({
    channels: ['--ds-tabs-ink'],
    declaredNames: [],
    emittedNames: ['--ds-tabs-ink'],
    scopes: scopesWith({ frozen: ['--ds-tabs-ink'] }),
    baseline: { channels: {} },
  });
  const [row] = view.rows;
  assert.equal(row.consumed, true, 'the global view calls this alive');
  assert.equal(row.painted, false, 'but nothing paints it under modern');
  assert.deepEqual(view.frozenOnly, ['--ds-tabs-ink']);
  assert.deepEqual(view.deadInModern, ['--ds-tabs-ink']);
  assert.deepEqual(view.deadGlobal, [], 'it is not globally dead — that is the whole point');

  // Same channel, global evaluator: ALIVE. The blind spot is asserted here so a
  // future refactor cannot quietly change one view without the other.
  const global = evaluateChannels({
    varChannels: new Set(['--ds-tabs-ink']),
    anatomyChannels: [],
    consumedVars: new Set(['--ds-tabs-ink']),
    consumedAnatomy: new Set(),
    baseline: { channels: {} },
  });
  assert.deepEqual(global.dead, []);
});

test('a modern-engine or engine-neutral consumer PAINTS; only engine-neutral is flagged diagnostically', () => {
  const view = evaluateModernView({
    channels: ['--ds-modern-only', '--ds-neutral-only', '--ds-both'],
    declaredNames: [],
    emittedNames: [],
    scopes: scopesWith({
      modern: ['--ds-modern-only', '--ds-both'],
      neutral: ['--ds-neutral-only', '--ds-both'],
    }),
    baseline: { channels: {} },
  });
  assert.equal(view.counts.painted, 3);
  assert.deepEqual(view.deadInModern, []);
  // Engine-neutral source renders under every engine, modern included, so this
  // is a diagnostic ("no modern-specific block"), never a dead channel.
  assert.deepEqual(view.paintedWithoutModernBlock, ['--ds-neutral-only']);
});

test('the four states are scored independently: DECLARED, EMITTED, CONSUMED, PAINTED', () => {
  const view = evaluateModernView({
    channels: ['--ds-declared-never-emitted', '--ds-emitted-never-read', '--ds-live'],
    declaredNames: ['--ds-declared-never-emitted', '--ds-live'],
    emittedNames: ['--ds-emitted-never-read', '--ds-live'],
    scopes: scopesWith({ modern: ['--ds-live'] }),
    baseline: { channels: {} },
  });
  assert.deepEqual(view.counts, {
    inventoried: 3,
    declared: 2,
    emitted: 2,
    consumed: 1,
    painted: 1,
  });
  assert.deepEqual(view.deadGlobal, ['--ds-declared-never-emitted', '--ds-emitted-never-read']);
});

test('the modern ratchet is decrease-only: baselined debt passes, a NEW dead-in-modern channel fails', () => {
  const view = evaluateModernView({
    channels: ['--ds-known-debt', '--ds-new-debt', '--ds-revived'],
    declaredNames: [],
    emittedNames: [],
    scopes: scopesWith({
      frozen: ['--ds-known-debt', '--ds-new-debt'],
      modern: ['--ds-revived'],
    }),
    baseline: { channels: { '--ds-known-debt': { reason: 'x' }, '--ds-revived': { reason: 'x' } } },
  });
  assert.deepEqual(view.newDead, ['--ds-new-debt']);
  assert.deepEqual(view.revived, ['--ds-revived']);
});

test('modernReasonFor names the frozen engines for a frozen-only channel', () => {
  const reason = modernReasonFor('--ds-tabs-ink', new Set(['--ds-tabs-ink']));
  assert.match(reason, /ONLY by frozen Classic\/Rustic/);
  assert.match(reason, /never a silent delete/);
  assert.doesNotMatch(modernReasonFor('--ds-other', new Set()), /frozen/);
});

const distReady = existsSync(
  join(packageRoot, 'dist/infrastructure/compilers/kernel/foundation/css/chrome-variables/index.js'),
);

test(
  '--modern reports the four states over the real tree and keeps them internally consistent',
  { skip: distReady ? false : 'dist is not built; the gate imports contract values from dist' },
  () => {
    const result = spawnSync(process.execPath, [gate, '--modern'], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const read = (label) => {
      const match = result.stdout.match(new RegExp(`${label}[^:]*: (\\d+)`));
      assert.ok(match, `missing "${label}" in the report`);
      return Number(match[1]);
    };
    const inventoried = read('channels inventoried');
    const consumed = read('CONSUMED');
    const painted = read('PAINTED');
    const dead = read('dead in modern');
    const neverConsumed = read('never consumed at all');
    const frozenOnly = read('consumed by frozen engines only');

    assert.ok(painted <= consumed, 'PAINTED is a subset of CONSUMED');
    assert.ok(consumed <= inventoried, 'CONSUMED is a subset of the inventory');
    assert.equal(dead, inventoried - painted, 'dead-in-modern is exactly the unpainted remainder');
    assert.equal(dead, neverConsumed + frozenOnly, 'the two dead classes partition the dead set');
    assert.equal(consumed - painted, frozenOnly, 'frozen-only is exactly CONSUMED minus PAINTED');
  },
);

test('the modern baseline is a decrease-only ledger: every entry carries a state and a reason', () => {
  const baseline = JSON.parse(readFileSync(modernBaselinePath, 'utf8'));
  assert.equal(baseline.view, 'engine=modern');
  const entries = Object.entries(baseline.channels);
  assert.ok(entries.length > 0);
  for (const [name, entry] of entries) {
    assert.ok(
      name.startsWith('--ds-') || name.startsWith('[data-anatomy-'),
      `${name} is not a channel name`,
    );
    assert.ok(
      ['never-consumed', 'consumed-frozen-only'].includes(entry.state),
      `${name} has an unknown state ${entry.state}`,
    );
    assert.ok(entry.reason.length > 20, `${name} has no reason`);
  }
});
