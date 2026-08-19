import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  evaluateBaselineTightening,
  evaluateZeroLockCheck,
  summarizeZeroLocks,
} from './lib/zero-lock-policy.mjs';
import { countArc09PaintInFile } from './lib/inline-paint-counter.mjs';
import { analyzeEmbeddedCssPaint } from './lib/embedded-css-paint-counter.mjs';
import {
  analyzeClaimSourceRecords,
  analyzeTenantFloorCssRecords,
  buildClaimDocumentationInventory,
  collectDataPartStampsFromText,
  extractRegistryFactsFromText,
  findStaleClaimsInRecords,
  validateClaimDocumentationInventory,
} from './lib/gat-07-static-analysis.mjs';
import {
  DOCS_ROOT,
  SEALED_REFERENCE_DOCS,
  discoverStaleTypescriptFiles,
  evaluateDataPartUnresolved,
  evaluateClaimAuthority,
  evaluateClaimFloor,
  projectGat07RegistryDefinition,
  sealedDocumentationContentMatches,
} from './gat-07-exact-proof.mjs';
import { repoRoot as findRepoRoot } from './lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const AUDIT = join(HERE, 'engine-token-audit.mjs');
const CLAIM_FLOOR = join(HERE, 'gat-07-public-claim-floor.json');
const REGISTRY = join(findRepoRoot(HERE), 'roadmap/registry.json');

test('zero-lock policy rejects slack, laundering, deletion and exact/floor drift', () => {
  assert.deepEqual(summarizeZeroLocks(
    { zero: 0, debt: 3, exactPositive: 2, floorPositive: 4 },
    { exact: { exactPositive: 2 }, minimum: { floorPositive: 1 } },
  ), {
    ok: true,
    errors: [],
    counters: 4,
    zeroLocked: 1,
    positiveGoverned: 3,
    ordinaryCeilings: 2,
    positiveOrdinaryCeilings: 1,
    exactInvariants: 1,
    positiveExactInvariants: 1,
    minimumFloors: 1,
    positiveMinimumFloors: 1,
  });

  const slack = evaluateZeroLockCheck({ baseline: { paint: 50 }, current: { paint: 0 } });
  assert.equal(slack.ok, false);
  assert.match(slack.errors.join('\n'), /completed zero retains slack/);

  const regression = evaluateZeroLockCheck({ baseline: { paint: 0 }, current: { paint: 1 } });
  assert.equal(regression.ok, false);
  assert.match(regression.errors.join('\n'), /ceiling regression/);

  const deleted = evaluateZeroLockCheck({ baseline: { paint: 0 }, current: {} });
  assert.equal(deleted.ok, false);
  assert.match(deleted.errors.join('\n'), /baseline counter disappeared/);

  const unbaselined = evaluateZeroLockCheck({ baseline: {}, current: { paint: 0 } });
  assert.equal(unbaselined.ok, false);
  assert.match(unbaselined.errors.join('\n'), /counter has no baseline/);

  const inheritedName = evaluateZeroLockCheck({
    baseline: {},
    current: { constructor: 0 },
  });
  assert.equal(inheritedName.ok, false);
  assert.match(inheritedName.errors.join('\n'), /counter has no baseline: constructor/);

  const exactDrift = evaluateZeroLockCheck({
    baseline: { exact: 1 },
    current: { exact: 0 },
    exact: { exact: 0 },
  });
  assert.equal(exactDrift.ok, false);
  assert.match(exactDrift.errors.join('\n'), /exact baseline drift/);

  const belowFloor = evaluateZeroLockCheck({
    baseline: { files: 10 },
    current: { files: 9 },
    minimum: { files: 10 },
  });
  assert.equal(belowFloor.ok, false);
  assert.match(belowFloor.errors.join('\n'), /below minimum floor/);

  const laundering = evaluateBaselineTightening({
    baseline: { paint: 0, debt: 4 },
    candidate: { paint: 1, debt: 3 },
  });
  assert.equal(laundering.ok, false);
  assert.match(laundering.errors.join('\n'), /absorb an increase/);

  const updateDeletion = evaluateBaselineTightening({
    baseline: { paint: 0, debt: 4 },
    candidate: { paint: 0 },
  });
  assert.equal(updateDeletion.ok, false);
  assert.match(updateDeletion.errors.join('\n'), /baseline counter cannot be deleted/);

  const updateAddition = evaluateBaselineTightening({
    baseline: { paint: 0 },
    candidate: { paint: 0, newCounter: 0 },
  });
  assert.equal(updateAddition.ok, false);
  assert.match(updateAddition.errors.join('\n'), /new counter requires an explicit reviewed baseline entry/);

  assert.equal(
    evaluateBaselineTightening({
      baseline: { paint: 0, debt: 4 },
      candidate: { paint: 0, debt: 3 },
    }).ok,
    true,
  );

  // A MINIMUM-governed key ratchets upward, so an update must be able to record its rise.
  // Refusing it froze the real baseline: `effects.glassConsumers` and the `*.filesScanned`
  // coverage floors all grew, no update could ever be written again, and the file's aggregate
  // totals drifted away from their own per-file sums with no sanctioned way back.
  const minimumRise = evaluateBaselineTightening({
    baseline: { consumers: 3, debt: 4 },
    candidate: { consumers: 7, debt: 3 },
    minimum: { consumers: 1 },
  });
  assert.equal(minimumRise.ok, true, minimumRise.errors.join('\n'));

  // The exemption is scoped to the floor. An ungoverned key rising in the same update is still
  // absorption, and a governed key may still never fall below its floor.
  const mixedRise = evaluateBaselineTightening({
    baseline: { consumers: 3, debt: 4 },
    candidate: { consumers: 7, debt: 5 },
    minimum: { consumers: 1 },
  });
  assert.equal(mixedRise.ok, false);
  assert.match(mixedRise.errors.join('\n'), /absorb an increase: debt 4 -> 5/);

  const governedFall = evaluateBaselineTightening({
    baseline: { consumers: 3 },
    candidate: { consumers: 0 },
    minimum: { consumers: 1 },
  });
  assert.equal(governedFall.ok, false);
  assert.match(governedFall.errors.join('\n'), /below minimum floor/);
});

test('zero-lock policy is total and fail-closed over missing governance and exotic maps', () => {
  const governedFailures = [
    {
      baseline: { paint: 0 },
      current: { paint: 0 },
      exact: { missing: 0 },
    },
    {
      baseline: { paint: 0 },
      current: { paint: 0 },
      minimum: { missing: 1 },
    },
    {
      baseline: { paint: 0 },
      current: { paint: 0 },
      exact: { paint: 0 },
      minimum: { paint: 0 },
    },
  ];
  for (const input of governedFailures) {
    let result;
    assert.doesNotThrow(() => { result = evaluateZeroLockCheck(input); });
    assert.equal(result.ok, false);
    assert.equal(evaluateBaselineTightening({
      baseline: input.baseline,
      candidate: input.current,
      exact: input.exact,
      minimum: input.minimum,
    }).ok, false);
  }

  let getterRuns = 0;
  const accessor = {};
  Object.defineProperty(accessor, 'paint', {
    enumerable: true,
    get() {
      getterRuns += 1;
      return 0;
    },
  });
  const symbol = { paint: 0 };
  symbol[Symbol('shadow')] = 0;
  const nonEnumerable = {};
  Object.defineProperty(nonEnumerable, 'paint', { enumerable: false, value: 0 });
  const customPrototype = Object.create({ inherited: 0 });
  customPrototype.paint = 0;
  const hostileProxy = new Proxy({ paint: 0 }, {
    ownKeys() {
      throw new Error('must never inspect proxy traps');
    },
  });
  const exoticMaps = [
    new Map([['paint', 0]]),
    new Date(0),
    customPrototype,
    accessor,
    symbol,
    nonEnumerable,
    hostileProxy,
  ];
  for (const map of exoticMaps) {
    let result;
    assert.doesNotThrow(() => {
      result = evaluateZeroLockCheck({ baseline: map, current: { paint: 0 } });
    });
    assert.equal(result.ok, false, Object.prototype.toString.call(map));
    assert.equal(summarizeZeroLocks(map).ok, false);
  }
  assert.equal(getterRuns, 0);

  const nullPrototype = Object.create(null);
  nullPrototype.paint = 0;
  assert.equal(evaluateZeroLockCheck({ baseline: nullPrototype, current: { paint: 0 } }).ok, true);
});

test('zero-lock policy rejects 19 hostile shapes and remains linear at 100,000 counters', () => {
  let getterRuns = 0;
  const customPrototype = Object.create({ inherited: 0 });
  customPrototype.paint = 0;
  const accessor = {};
  Object.defineProperty(accessor, 'paint', {
    enumerable: true,
    get() {
      getterRuns += 1;
      return 0;
    },
  });
  const symbolKey = { paint: 0 };
  symbolKey[Symbol('paint')] = 0;
  const nonEnumerable = {};
  Object.defineProperty(nonEnumerable, 'paint', { enumerable: false, value: 0 });
  const hostileProxy = new Proxy({ paint: 0 }, {
    ownKeys() {
      throw new Error('must not execute proxy traps');
    },
  });
  const invalid = [
    null,
    undefined,
    [],
    new Map([['paint', 0]]),
    new Date(0),
    customPrototype,
    accessor,
    symbolKey,
    nonEnumerable,
    hostileProxy,
    function invalidFunction() {},
    'paint',
    42,
    { paint: -1 },
    { paint: 1.5 },
    { paint: Number.MAX_SAFE_INTEGER + 1 },
    { '': 0 },
    { paint: Number.NaN },
    { paint: Number.POSITIVE_INFINITY },
  ];
  assert.equal(invalid.length, 19);
  for (const baseline of invalid) {
    let result;
    assert.doesNotThrow(() => {
      result = evaluateZeroLockCheck({ baseline, current: { paint: 0 } });
    });
    assert.equal(result.ok, false, Object.prototype.toString.call(baseline));
  }
  assert.equal(getterRuns, 0);

  const baseline = Object.create(null);
  const current = Object.create(null);
  for (let index = 0; index < 100_000; index += 1) {
    const key = `counter.${index.toString().padStart(6, '0')}`;
    baseline[key] = 0;
    current[key] = 0;
  }
  const checked = evaluateZeroLockCheck({ baseline, current });
  assert.equal(checked.ok, true, checked.errors.join('\n'));
  const summary = summarizeZeroLocks(baseline);
  assert.equal(summary.ok, true);
  assert.equal(summary.counters, 100_000);
  assert.equal(summary.zeroLocked, 100_000);
});

test('paint scanners close bound/call/apply and style children/spread aliases', () => {
  const attributeWriters = [
    `export function probe(el: HTMLElement) { const set = el.setAttribute.bind(el); set('style', 'color: red'); }`,
    `export function probe(el: HTMLElement) { el.setAttribute.call(el, 'style', 'border-color: red'); }`,
    `export function probe(el: HTMLElement) { const set = el.setAttribute; set.call(el, 'style', 'background: red'); }`,
    `export function probe(el: HTMLElement) { el.setAttribute.apply(el, ['style', 'outline: 1px solid red']); }`,
    `export function probe(el: HTMLElement) { Reflect.apply(el.setAttribute, el, ['style', 'filter: blur(1px)']); }`,
    `export function probe(el: Element) { Reflect.apply(el.setAttributeNS, el, [null, 'style', 'color: red']); }`,
    `export function probe(el: HTMLElement) { const { setAttribute: set } = el; set.call(el, 'style', 'color: red'); }`,
  ];
  for (const [index, source] of attributeWriters.entries()) {
    assert.equal(countArc09PaintInFile(source, `attribute-writer-${index}.tsx`), 1, source);
  }
  assert.equal(
    countArc09PaintInFile(
      `export function probe(el: HTMLElement) { const { style } = el; style.color = 'red'; }`,
      'destructured-style.tsx',
    ),
    1,
  );
  assert.equal(
    countArc09PaintInFile(
      `export function probe(el: HTMLElement) { const name = ` + "`st${'yle'}`" + `; el.setAttribute(name, 'color: red'); }`,
      'computed-style-attribute.tsx',
    ),
    1,
  );

  const embeddedRoots = [
    `export function Probe() { const css = '.x { color: red; }'; return <style children={css} />; }`,
    `export function Probe() { const css = '.x { color: red; }'; const props = { children: css }; const alias = props; return <style {...alias} />; }`,
    `import React from 'react'; export function Probe() { const css = '.x { color: red; }'; const h = React.createElement; return h('style', { children: css }); }`,
    `import React from 'react'; export function Probe() { const css = '.x { color: red; }'; const { createElement: h } = React; return h('style', { children: css }); }`,
  ];
  for (const [index, source] of embeddedRoots.entries()) {
    const result = analyzeEmbeddedCssPaint(source, `embedded-root-${index}.tsx`);
    assert.equal(result.classifiedPaint, 1, JSON.stringify(result));
    assert.equal(result.unclassified, 0, JSON.stringify(result));
  }

  const embeddedAliases = [
    `document.body.insertAdjacentHTML('beforeend', '<style>.x { color: red; }</style>');`,
    `document.body.innerHTML = '<style>.x { color: red; }</style>';`,
    `node.outerHTML = '<style>.x { color: red; }</style>';`,
    `const make = document.createElement.bind(document); const style = make('style'); style.textContent = '.x { color: red; }';`,
    `const style = document.createElement.call(document, 'style'); style.textContent = '.x { color: red; }';`,
    `const style = document.createElement.apply(document, ['style']); style.textContent = '.x { color: red; }';`,
    `const style = Reflect.apply(document.createElement, document, ['style']); style.textContent = '.x { color: red; }';`,
    `import React from 'react'; export const style = React.createElement.call(React, 'style', { children: '.x { color: red; }' });`,
    `import React from 'react'; const h = React.createElement.bind(React); export const style = h('style', { children: '.x { color: red; }' });`,
    `import React from 'react'; export const style = React.createElement.apply(React, ['style', { children: '.x { color: red; }' }]);`,
    `import React from 'react'; export const style = Reflect.apply(React.createElement, React, ['style', { children: '.x { color: red; }' }]);`,
    `const sheet = new CSSStyleSheet(); sheet.replaceSync('.x { color: red; }'); document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];`,
  ];
  for (const [index, source] of embeddedAliases.entries()) {
    const result = analyzeEmbeddedCssPaint(source, `embedded-alias-${index}.tsx`);
    assert.equal(result.classifiedPaint, 1, JSON.stringify(result));
    assert.equal(result.unclassified, 0, JSON.stringify(result));
  }

  const opaqueEmbeddedSinks = [
    `export function install(html: string) { document.body.innerHTML = html; }`,
    `export function install(sheet: CSSStyleSheet, css: string) { sheet.replace(css); }`,
    `export function install(sheet: CSSStyleSheet, css: string) { sheet.replaceSync(css); }`,
  ];
  for (const [index, source] of opaqueEmbeddedSinks.entries()) {
    const result = analyzeEmbeddedCssPaint(source, `opaque-embedded-${index}.tsx`);
    assert.equal(result.classifiedPaint, 0, JSON.stringify(result));
    assert.equal(result.unclassified, 1, JSON.stringify(result));
  }
});

test('G1-G7 structured analyzers fail closed on opaque claims and noncanonical evidence', () => {
  const claimFacts = analyzeClaimSourceRecords([
    {
      path: '/repo/src/foundation/contracts/kernel/tokens/extensions/index.ts',
      kind: 'core',
      text: `export interface ExtensionHelpers<T> { resolve(value: T): T }`,
    },
    {
      path: '/repo/src/runtime/consumer.ts',
      kind: 'core',
      text: `const key = 'ext' + 'ensions'; export const consume = (props: any) => props[key];`,
    },
    {
      path: '/repo/src/runtime/helper.ts',
      kind: 'core',
      text: `import { ExtensionHelpers as Helpers } from '../foundation/contracts/kernel/tokens/extensions'; export const implementation = Helpers;`,
    },
    {
      path: '/repo/src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/index.ts',
      kind: 'core',
      text: `export function useSurfaceProfileDefaultsWithOverrides(value: unknown) { return value; } export const selfProbe = () => useSurfaceProfileDefaultsWithOverrides({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/demo.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useOverrides } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides'; export const Demo = () => useOverrides({});`,
    },
    {
      path: '/repo/packages/showroom/src/demo.tsx',
      kind: 'showroom',
      text: `const key = 'profile' + 'Overrides'; export const fake = { [key]: { density: 'compact' } };`,
    },
  ]);
  assert.equal(claimFacts['component-extensions'].staticallyResolvedExtensionRuntimeReferences, 0);
  assert.equal(claimFacts['component-extensions'].staticallyResolvedExtensionHelperReferences, 0);
  assert.equal(claimFacts['component-extensions'].staticallyResolvedPotentialConsumers, 0);
  assert.equal(claimFacts['component-extensions'].unsupportedGovernedReferences, 1);
  // The owner's own `selfProbe` call is authorship, not an applied consumer.
  assert.equal(claimFacts['surface-profile-overrides'].staticallyResolvedSurfaceHookCalls, 1);
  assert.deepEqual(claimFacts['surface-profile-overrides'].staticallyResolvedSurfaceHookCallFiles, [
    '/repo/src/ui/surfaces/pages/demo.tsx',
  ]);
  assert.equal(claimFacts['surface-profile-overrides'].staticallyResolvedShowroomProfileOverrideReferences, 0);
  assert.equal(claimFacts['surface-profile-overrides'].unsupportedGovernedReferences, 1);
  assert.equal(claimFacts['surface-profile-overrides'].registeredExecutableEvidence, 0);

  const registry = extractRegistryFactsFromText(`
    const value = 'modern';
    const extra = { engine: 'modern' };
    const REGISTRY = {
      absent: {},
      nullValue: { engine: null },
      literal: { engine: 'modern' },
      alias: { engine: value },
      spread: { ...extra },
      [getKey()]: { engine: 'modern' },
      ...other,
    };
  `, 'registry.ts', 'REGISTRY', ['engine']);
  assert.deepEqual(registry.facts.absent.engine, { kind: 'absent' });
  assert.deepEqual(registry.facts.nullValue.engine, { kind: 'literal', value: null });
  assert.deepEqual(registry.facts.literal.engine, { kind: 'literal', value: 'modern' });
  assert.equal(registry.facts.alias.engine.kind, 'nonLiteral');
  assert.deepEqual(registry.facts.spread.engine, { kind: 'absent' });
  assert.equal(registry.unresolvedEntries.length, 4);
  assert.equal(registry.declaration.evidenceKind, 'authoredInitializerProjection');

  const stamps = collectDataPartStampsFromText(`
    import { select } from 'd3-selection';
    const root = 'ro' + 'ot';
    export function Probe({ condition }: { condition: boolean }) {
      const selection = select(document.body);
      selection.attr('data-part', condition ? 'one' : 'two');
      return <><div part="shadow-only" data-part={root} /><div data-part={makePart('fake')} /></>;
    }
  `, 'parts.tsx');
  assert.deepEqual(stamps.stamps, []);
  assert.equal(stamps.unresolved.filter(({ syntax }) => syntax === 'raw-attribute-call').length, 1);
  assert.equal(stamps.unresolved.filter(({ syntax }) => syntax.endsWith('dynamic-value')).length, 2);

  const floors = analyzeTenantFloorCssRecords([
    {
      path: 'rottay.css',
      text: `html[data-tenant = "rottay"] *, html[data-tenant = "rottay"] ::before, html[data-tenant = "rottay"] ::after, html[data-tenant = "rottay"] ::backdrop, html[data-tenant = "rottay"] ::file-selector-button { border-color: red; }`,
    },
    {
      path: 'bithire.css',
      text: `html[data-tenant=bithire] { &::file-selector-button, & ::backdrop, & ::after, & ::before, & * { BORDER-COLOR: blue; } }`,
    },
  ]);
  assert.deepEqual(floors.owners, ['bithire', 'rottay']);
  assert.equal(floors.floors.length, 2);
  assert.deepEqual(floors.parseErrors, []);

  const stale = findStaleClaimsInRecords([
    {
      path: 'engine.tsx',
      kind: 'typescript',
      text: `// This view uses only inline styles.\nconst safe = 'every tenant ships a border floor';`,
    },
    {
      path: 'skin.css',
      kind: 'css',
      text: `/* Every tenant ships a universal border floor. */\n.x { color: red; }`,
    },
  ]);
  assert.equal(stale.staleInline.length, 1);
  assert.equal(stale.falseTenantFloor.length, 1);
  assert.deepEqual(stale.parseErrors, []);
});

test('G1 typed claim references resolve named/default/namespace/reexports without scope-name false positives', () => {
  const hookPath = '/repo/src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/index.ts';
  const records = [
    {
      path: hookPath,
      kind: 'core',
      text: `export function useSurfaceProfileDefaultsWithOverrides(value: unknown) { return value; }`,
    },
    {
      path: '/repo/src/ui/structures/foundation/chrome/contracts/index.ts',
      kind: 'core',
      text: `export interface SurfaceVisualOverrides { density?: string } export interface HeaderSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      // The surfaces facade re-exports the claim type and declares its own
      // governed fields; both owners contribute to the declaration census.
      path: '/repo/src/ui/surfaces/foundation/contracts/index.ts',
      kind: 'core',
      text: `import type { SurfaceVisualOverrides } from '../../../structures/foundation/chrome/contracts'; export type { SurfaceVisualOverrides }; export interface VisualOptions { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      path: '/repo/src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/named.ts',
      kind: 'core',
      text: `export { useSurfaceProfileDefaultsWithOverrides as useProfile } from './index';`,
    },
    {
      path: '/repo/src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/default.ts',
      kind: 'core',
      text: `export { useSurfaceProfileDefaultsWithOverrides as default } from './index';`,
    },
    {
      path: '/repo/src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/star.ts',
      kind: 'core',
      text: `export * from './index';`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/named.tsx', kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as invoke } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides'; export const Demo = () => invoke({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/default.tsx', kind: 'core',
      text: `import invoke from '../../structures/foundation/chrome/runtime/profile-defaults/overrides/default'; export const Demo = () => invoke({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/namespace.tsx', kind: 'core',
      text: `import * as Hooks from '../../structures/foundation/chrome/runtime/profile-defaults/overrides'; export const Demo = () => Hooks.useSurfaceProfileDefaultsWithOverrides({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/reexport.tsx', kind: 'core',
      text: `import { useProfile } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides/named'; export const Demo = () => useProfile({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/star.tsx', kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as invoke } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides/star'; export const Demo = () => invoke({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/scope-shadow.tsx', kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as invoke } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides'; export const outer = () => invoke({}); export function inner() { const invoke = () => null; return invoke(); }`,
    },
  ];
  const facts = analyzeClaimSourceRecords(records)['surface-profile-overrides'];
  assert.equal(facts.staticallyResolvedSurfaceHookCalls, 6);
  assert.equal(facts.staticallyResolvedPotentialConsumers, 6);
  assert.equal(facts.unsupportedGovernedReferences, 0);
  assert.equal(facts.registeredExecutableEvidence, 0);
  // Both declaring owners are counted; neither is counted as a consumer.
  assert.equal(facts.profileOverrideDeclarations, 2);
  assert.deepEqual(facts.staticallyResolvedSurfaceHookCallFiles, [
    '/repo/src/ui/surfaces/pages/default.tsx',
    '/repo/src/ui/surfaces/pages/named.tsx',
    '/repo/src/ui/surfaces/pages/namespace.tsx',
    '/repo/src/ui/surfaces/pages/reexport.tsx',
    '/repo/src/ui/surfaces/pages/scope-shadow.tsx',
    '/repo/src/ui/surfaces/pages/star.tsx',
  ]);
});

test('G1b unused underscore exclusion destructuring is containment, a read binding is consumption', () => {
  const definitions = [
    {
      path: '/repo/src/foundation/contracts/runtime/engine/index.ts',
      kind: 'core',
      text: `export interface EngineAwareProps { extensions?: Record<string, unknown>; engine?: string }`,
    },
    {
      path: '/repo/src/foundation/contracts/kernel/tokens/extensions/index.ts',
      kind: 'core',
      text: `export interface ComponentExtensions { slot?: string } export const ExtensionHelpers = {};`,
    },
  ];
  const containment = {
    path: '/repo/src/ui/primitives/display/Card/engines/classic/index.tsx',
    kind: 'core',
    text: `import type { EngineAwareProps } from '../../../../../../foundation/contracts/runtime/engine/index';
const Impl = (props: EngineAwareProps) => { const { extensions: _extensions, ...rest } = props; return rest; };
export default Impl;`,
  };
  const consumption = {
    path: '/repo/src/ui/primitives/display/Card/engines/modern/index.tsx',
    kind: 'core',
    text: `import type { EngineAwareProps } from '../../../../../../foundation/contracts/runtime/engine/index';
const Impl = (props: EngineAwareProps) => { const { extensions: _extensions, ...rest } = props; void _extensions; return rest; };
export default Impl;`,
  };
  const facts = analyzeClaimSourceRecords([...definitions, containment, consumption])['component-extensions'];
  assert.equal(facts.staticallyResolvedExtensionRuntimeReferences, 1);
  assert.deepEqual(facts.staticallyResolvedExtensionRuntimeReferenceFiles, [consumption.path]);
  assert.equal(facts.containmentExclusions.length, 1);
  assert.equal(facts.containmentExclusions[0].path, containment.path);
  assert.equal(facts.staticallyResolvedPotentialConsumers, 1);
});

test('G2 claim census keeps opaque transports and computed access out of direct evidence', () => {
  const records = [
    {
      path: '/repo/src/foundation/contracts/kernel/tokens/extensions/index.ts',
      kind: 'core',
      text: `export interface ComponentExtensions { slot?: unknown } export interface ExtensionHelpers<T> { resolve(value: T): T }`,
    },
    {
      path: '/repo/src/foundation/contracts/runtime/engine/index.ts',
      kind: 'core',
      text: `import type { ComponentExtensions } from '../../kernel/tokens/extensions'; export interface EngineAwareProps { extensions?: ComponentExtensions }`,
    },
    {
      path: '/repo/src/ui/structures/foundation/chrome/contracts/index.ts',
      kind: 'core',
      text: `export interface SurfaceVisualOverrides { density?: string }`,
    },
    {
      path: '/repo/src/ui/surfaces/foundation/contracts/index.ts',
      kind: 'core',
      text: `import type { SurfaceVisualOverrides } from '../../../structures/foundation/chrome/contracts'; export type { SurfaceVisualOverrides }; export interface VisualOptions { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      path: '/repo/src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/index.ts',
      kind: 'core',
      text: `export function useSurfaceProfileDefaultsWithOverrides(value: unknown) { return value; } export const selfProbe = () => useSurfaceProfileDefaultsWithOverrides({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/direct.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useProfile } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides'; export const Demo = () => useProfile({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/container.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useProfile } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides'; const hooks = [useProfile]; export const Demo = () => hooks[0]({});`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/helper.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useProfile } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides'; const forward = (value: unknown) => value; export const opaque = forward(useProfile);`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/wrappers.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useProfile } from '../../structures/foundation/chrome/runtime/profile-defaults/overrides'; export const opaque = [useProfile.call(null, {}), Reflect.apply(useProfile, null, [{}]), useProfile.bind(null)];`,
    },
    {
      path: '/repo/src/runtime/extensions-direct.ts',
      kind: 'core',
      text: `
        import type { EngineAwareProps } from '../foundation/contracts/runtime/engine';
        const extensions = {};
        export const assigned: EngineAwareProps = { extensions };
        export const quoted: EngineAwareProps = { 'extensions': {} };
        export const read = (props: EngineAwareProps) => {
          const { extensions: destructured } = props;
          return [props.extensions, destructured];
        };
      `,
    },
    {
      path: '/repo/src/runtime/extensions-mapped.ts',
      kind: 'core',
      text: `import type { EngineAwareProps } from '../foundation/contracts/runtime/engine'; type Selected = Pick<EngineAwareProps, 'extensions'>; export const read = (props: Selected) => props.extensions;`,
    },
    {
      path: '/repo/src/runtime/extensions-computed.ts',
      kind: 'core',
      text: `export const read = (props: any) => [props['extensions'], Reflect.get(props, 'extensions')];`,
    },
    {
      path: '/repo/src/ui/surfaces/pages/name-only-fakes.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as external } from 'untracked-package'; const fake = { useSurfaceProfileDefaultsWithOverrides() {} }; export const Demo = () => [external({}), fake.useSurfaceProfileDefaultsWithOverrides()];`,
    },
    {
      // A look-alike type name and a same-named LOCAL interface are not the
      // governed contract; a substring match on the printed type would count
      // both. Neither may enter the declaration census.
      path: '/repo/src/ui/surfaces/pages/impostor-types.tsx',
      kind: 'core',
      text: `interface NotSurfaceVisualOverrides { density?: string } interface SurfaceVisualOverrides { density?: string } export interface FakeA { profileOverrides?: NotSurfaceVisualOverrides } export interface FakeB { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      path: '/repo/packages/showroom/src/profile.tsx',
      kind: 'showroom',
      text: `import type { VisualOptions } from '../../../src/ui/surfaces/foundation/contracts'; export const read = (visual: VisualOptions) => visual.profileOverrides; const fake = { profileOverrides: true }; export const ignored = fake.profileOverrides;`,
    },
  ];
  const forward = analyzeClaimSourceRecords(records);
  const reverse = analyzeClaimSourceRecords([...records].reverse());
  assert.deepEqual(reverse, forward);

  const extensions = forward['component-extensions'];
  assert.equal(extensions.staticallyResolvedExtensionRuntimeReferences, 2);
  assert.equal(extensions.staticallyResolvedExtensionHelperReferences, 0);
  assert.equal(extensions.staticallyResolvedPotentialConsumers, 2);
  assert.equal(extensions.unsupportedGovernedReferences, 2);
  assert.equal(extensions.registeredExecutableEvidence, 0);

  const surfaces = forward['surface-profile-overrides'];
  // Only `direct.tsx` applies the hook: the owner's self-probe is authorship,
  // and the container/helper/wrapper transports are opaque, not direct calls.
  assert.equal(surfaces.staticallyResolvedSurfaceHookCalls, 1);
  assert.equal(surfaces.staticallyResolvedShowroomProfileOverrideReferences, 1);
  assert.equal(surfaces.staticallyResolvedPotentialConsumers, 6);
  assert.equal(surfaces.unsupportedGovernedReferences, 5);
  assert.deepEqual(surfaces.staticallyResolvedSurfaceHookCallFiles, [
    '/repo/src/ui/surfaces/pages/direct.tsx',
  ]);
  assert.equal(surfaces.potentialConsumers.some(({ path }) => path.endsWith('name-only-fakes.tsx')), false);
  // The single governed declaration is the surfaces facade's `VisualOptions`;
  // the impostor and local look-alike contribute nothing.
  assert.equal(surfaces.profileOverrideDeclarations, 1);
  assert.equal(surfaces.potentialConsumers.some(({ path }) => path.endsWith('impostor-types.tsx')), false);
});

test('G6 registry proof is a strict authored-initializer projection', () => {
  const result = extractRegistryFactsFromText(`
    const selected = 'modern';
    const inherited = { engine: 'modern' };
    export const REGISTRY: Readonly<Record<string, unknown>> = {
      literal: { engine: 'classic' },
      absent: {},
      alias: { engine: selected },
      spreadEntry: { ...inherited },
      callEntry: buildEntry(),
      ['computed']: { engine: 'modern' },
      ...other,
      duplicate: { engine: 'classic', engine: 'modern' },
      repeated: { engine: 'classic' },
      repeated: { engine: 'modern' },
    };
    REGISTRY.literal.engine = 'modern';
    Object.assign(REGISTRY, { injected: { engine: 'modern' } });
  `, 'registry-authored.ts', 'REGISTRY', ['engine']);
  assert.deepEqual(result.facts.literal.engine, { kind: 'literal', value: 'classic' });
  assert.deepEqual(result.facts.absent.engine, { kind: 'absent' });
  assert.equal(result.facts.alias.engine.kind, 'nonLiteral');
  assert.deepEqual(result.facts.spreadEntry.engine, { kind: 'absent' });
  assert.equal(result.facts.callEntry.state, 'nonLiteralEntry');
  assert.equal(result.facts.duplicate.engine.kind, 'nonLiteral');
  assert.equal(result.facts.repeated.state, 'nonLiteralEntry');
  assert.equal(result.declaration.evidenceKind, 'authoredInitializerProjection');
  assert.equal(result.declaration.readonlyTypeAnnotation, true);
  const reasons = result.unresolvedEntries.map(({ reason }) => reason).join('\n');
  assert.match(reasons, /alias\.engine is not a literal authored value/);
  assert.match(reasons, /spreadEntry registry entry contains a spread/);
  assert.match(reasons, /callEntry must be a direct object literal/);
  assert.match(reasons, /computed registry key/);
  assert.match(reasons, /registry spread/);
  assert.match(reasons, /duplicate\.engine is not a unique data property/);
  assert.match(reasons, /duplicate authored registry key repeated/);
  assert.match(reasons, /registry capability mutation via =/);
  assert.match(reasons, /registry capability passed to mutator Object\.assign/);

  const callInitializer = extractRegistryFactsFromText(
    `export const REGISTRY = buildRegistry();`,
    'registry-call.ts',
    'REGISTRY',
    ['engine'],
  );
  assert.deepEqual(callInitializer.facts, {});
  assert.match(callInitializer.unresolvedEntries[0].reason, /initializer must be a direct object literal/);

  const safeReads = extractRegistryFactsFromText(`
    export const REGISTRY: Readonly<Record<string, unknown>> = { good: { engine: 'classic' } };
    const entry = REGISTRY.good;
    const keys = Object.keys(REGISTRY);
    const spreadCopy = { ...REGISTRY };
    const assignedCopy = Object.assign({}, REGISTRY);
    const clonedCopy = structuredClone(REGISTRY);
    clonedCopy.good.engine = 'local-only';
    let { engine } = REGISTRY.good;
    engine = 'modern';
    Object.assign({}, REGISTRY);
    function shadowed(REGISTRY: any) { REGISTRY.good.engine = 'modern'; }
  `, 'registry-safe-reads.ts', 'REGISTRY', ['engine']);
  assert.deepEqual(safeReads.unresolvedEntries, []);

  for (const [id, attack] of Object.entries({
    direct: `REGISTRY.good.engine = 'modern';`,
    alias: `const entry = REGISTRY.good; entry.engine = 'modern';`,
    delete: `delete REGISTRY.good.engine;`,
    update: `REGISTRY.good.counter++;`,
    assign: `Object.assign(REGISTRY, { injected: {} });`,
    defineProperty: `Object.defineProperty(REGISTRY.good, 'engine', { value: 'modern' });`,
    defineProperties: `Object.defineProperties(REGISTRY, { injected: { value: {} } });`,
    reflect: `Reflect.set(REGISTRY, 'injected', {});`,
    reflectDelete: `Reflect.deleteProperty(REGISTRY.good, 'engine');`,
    capability: `mutate(REGISTRY);`,
    nestedCapability: `mutate(REGISTRY.good);`,
    methodCapability: `REGISTRY.good.mutate();`,
    returned: `function getEntry() { return REGISTRY.good; } const entry = getEntry(); entry.engine = 'modern';`,
    aliasedMutator: `const assign = Object.assign; assign(REGISTRY, { injected: {} });`,
    valuesAlias: `const values = Object.values(REGISTRY); values[0].engine = 'modern';`,
    shadowedClone: `function structuredClone(value: any) { return value; } const copy = structuredClone(REGISTRY); copy.good.engine = 'modern';`,
    aliasedClone: `const clone = structuredClone; const copy = clone(REGISTRY); copy.good.engine = 'modern';`,
  })) {
    const attacked = extractRegistryFactsFromText(`
      export const REGISTRY: Readonly<Record<string, unknown>> = { good: { engine: 'classic' } };
      ${attack}
    `, `registry-${id}.ts`, 'REGISTRY', ['engine']);
    assert.equal(
      attacked.unresolvedEntries.some(({ reason }) => /registry capability/.test(reason)),
      true,
      `${id}: ${JSON.stringify(attacked.unresolvedEntries)}`,
    );
  }
});

test('G7 data-part evidence accepts only canonical static sinks', () => {
  // B-1 deleted the hardcoded Box/Stack/Text module-suffix whitelist: a
  // canonical forwarder is now accepted only when the proof reads the target
  // module and shows a caller-supplied `data-part` reaching a rendered element.
  // This fixture therefore has to SUPPLY its own module tree instead of relying
  // on a name match. Every module below genuinely forwards, so the assertions
  // are unchanged in value but are now proven rather than whitelisted.
  const forwardingModule = (name) =>
    `export function ${name}(props: { 'data-part'?: string }) { return <div {...props} />; }`;
  const fixtureModules = new Map([
    ['/repo/src/ui/primitives', {
      path: '/repo/src/ui/primitives/index.tsx',
      text: `export * from './layout/Box';\nexport * from './layout/Stack';\nexport * from './display/Typography';`,
    }],
    ['/repo/src/ui/primitives/layout/Box', {
      path: '/repo/src/ui/primitives/layout/Box/index.tsx',
      text: forwardingModule('Box'),
    }],
    ['/repo/src/ui/primitives/layout/Stack', {
      path: '/repo/src/ui/primitives/layout/Stack/index.tsx',
      text: forwardingModule('Stack'),
    }],
    ['/repo/src/ui/primitives/display/Typography', {
      path: '/repo/src/ui/primitives/display/Typography/index.tsx',
      text: forwardingModule('Text'),
    }],
    ['/repo/src/infrastructure/runtime/dom/foundation/data-part', {
      path: '/repo/src/infrastructure/runtime/dom/foundation/data-part/index.ts',
      text: `export function stampDataPart(node: Element, part: string): void { node.setAttribute('data-part', part); }`,
    }],
  ]);
  const moduleReader = (base) => fixtureModules.get(base) ?? null;
  const result = collectDataPartStampsFromText(`
    import { Box, Stack, Text } from '../primitives';
    import { Box as AliasBox } from '@/ui/primitives/layout/Box';
    import { Stack as AliasStack } from '@/ui/primitives/layout/Stack';
    import { Text as AliasText } from '@/ui/primitives/display/Typography';
    import React from 'react';
    import type { Box as TypeBox } from '../primitives';
    import { Box as ExternalBox } from '/evil/src/ui/primitives';
    import { stampDataPart } from '../../infrastructure/runtime/dom/foundation/data-part';
    import { SearchIcon } from '@phosphor-icons/react';
    const Fake = (_props: { 'data-part'?: string }) => null;
    export function Probe(node: Element, dynamic: string, condition: boolean) {
      stampDataPart(node, 'helper');
      node.setAttribute('data-part', 'raw-dom');
      fakeSelection.attr('data-part', 'raw-d3');
      const set = node.setAttribute;
      const attributeName = 'data-part';
      set('data-part', 'raw-alias');
      set(attributeName, 'raw-name-alias');
      node.setAttribute.call(node, 'data-part', 'raw-call');
      Reflect.apply(node.setAttribute, node, ['data-part', 'raw-reflect']);
      React.createElement('i', { 'data-part': 'react-create-element' });
      React.createElement('i', { label: 'data-part' });
      console.log('data-part');
      telemetry({ 'data-part': 'analytics-dimension' });
      ['data-part'].includes(dynamic);
      React.forwardRef(() => 'data-part');
      const spread = { 'data-part': 'spread' };
      const unrelated = { className: 'unrelated' };
      const unknown = getUnknownProps();
      return <>
        <div data-part="root" />
        <span data-part={condition ? 'one' : 'two'} />
        <Box data-part="box" />
        <Stack data-part="stack" />
        <Text data-part="text" />
        <AliasBox data-part="alias-box" />
        <AliasStack data-part="alias-stack" />
        <AliasText data-part="alias-text" />
        <Fake data-part="fake" />
        <SearchIcon data-part="icon" />
        <TypeBox data-part="type-only" />
        <ExternalBox data-part="external" />
        <div data-part={dynamic} />
        <div {...spread} />
        <div {...unrelated} />
        <div {...unknown} />
      </>;
    }
  `, '/repo/src/ui/structures/demo.tsx', { moduleReader });
  assert.deepEqual([...new Set(result.stamps.map(({ part }) => part))].sort(), [
    'alias-box', 'alias-stack', 'alias-text', 'box', 'helper', 'one', 'root', 'stack', 'text', 'two',
  ]);
  assert.deepEqual([...new Set(result.stamps.map(({ sinkKind }) => sinkKind))].sort(), [
    'canonical-forwarder', 'canonical-helper', 'intrinsic-dom',
  ]);
  assert.equal(result.stamps.every(({ provenance, staticValues }) => provenance && staticValues.length > 0), true);
  assert.equal(result.unresolved.filter(({ syntax }) => syntax === 'jsx-custom-unproven-forwarder').length, 4);
  assert.equal(result.unresolved.filter(({ syntax }) => syntax === 'raw-attribute-call').length, 7);
  assert.deepEqual(
    [...new Set(result.unresolved
      .filter(({ syntax }) => syntax === 'raw-attribute-call')
      .map(({ provenance }) => provenance.method))].sort(),
    ['attribute.attr', 'element.setAttribute', 'react.createElement'],
  );
  assert.equal(result.unresolved.filter(({ syntax }) => syntax === 'jsx-intrinsic-dynamic-value').length, 1);
  assert.equal(result.unresolved.filter(({ syntax }) => syntax === 'jsx-spread-data-part').length, 1);
  assert.equal(result.stamps.some(({ part }) => ['fake', 'icon', 'raw-dom', 'raw-d3', 'spread'].includes(part)), false);
  assert.equal(evaluateDataPartUnresolved(result.unresolved).ok, false);

  const unrelatedSpread = collectDataPartStampsFromText(`
    export const Demo = ({ props }: { props: Record<string, unknown> }) => {
      const known = { className: 'safe', role: 'presentation' };
      const opaque = makeProps('data-part');
      return <><div data-part="root" /><div {...known} /><div {...props} /><div {...opaque} /></>;
    };
  `, '/repo/src/ui/structures/unrelated.tsx');
  assert.deepEqual(unrelatedSpread.unresolved, []);
  assert.equal(evaluateDataPartUnresolved(unrelatedSpread.unresolved).ok, true);
});

test('G7/B-1 forwarder terminals: drop, override order, imperative stamps and module misses', () => {
  // F1/F2/f3/f4. B-1 accepts a custom tag only by READING its module, so every
  // shape below has to be supplied as a real module tree. These are the four
  // ways the proof can be wrong: it can believe a component that accepts the
  // caller's part and drops it (C4), believe an override that JSX itself
  // discards (C1), miss an imperative re-stamp (C2), or silently pass a module
  // it could not read (fail-closed).
  const OWNER = '/repo/src/infrastructure/runtime/dom/foundation/data-part';
  const owned = new Map([[OWNER, {
    path: `${OWNER}/index.ts`,
    text: `export function stampDataPart(node: Element, part: string): void { node.setAttribute('data-part', part); }`,
  }]]);
  const family = (name, text) => [`/repo/src/ui/primitives/layout/${name}`, {
    path: `/repo/src/ui/primitives/layout/${name}/index.tsx`,
    text,
  }];
  const probe = (name, moduleText, extra = []) => {
    const modules = new Map([...owned, ...(moduleText ? [family(name, moduleText)] : []), ...extra]);
    return collectDataPartStampsFromText(
      `import { ${name} } from '@/ui/primitives/layout/${name}';\n` +
      `export const Probe = () => <${name} data-part="caller" />;`,
      '/repo/src/ui/structures/probe.tsx',
      { moduleReader: (base) => modules.get(base) ?? null },
    );
  };
  const provenBy = (result) => {
    assert.equal(result.unresolved.length, 0, JSON.stringify(result.unresolved));
    assert.deepEqual(result.stamps.map(({ part, sinkKind }) => [part, sinkKind]), [['caller', 'canonical-forwarder']]);
    return result.stamps[0].provenance.forwardingProof;
  };
  const rejectedFor = (result) => {
    assert.deepEqual(result.stamps, []);
    assert.equal(result.unresolved.length, 1, JSON.stringify(result.unresolved));
    assert.equal(result.unresolved[0].syntax, 'jsx-custom-unproven-forwarder');
    assert.equal(evaluateDataPartUnresolved(result.unresolved).ok, false);
    return result.unresolved[0].provenance.reason;
  };

  // F1. Accept-and-drop: the rest bag no longer holds the part it was asked to
  // forward. Spreading it is honest about everything EXCEPT the anatomy part.
  assert.match(
    rejectedFor(probe('Dropper', `
      export function Dropper({ 'data-part': _part, ...rest }: { 'data-part'?: string }) {
        return <div {...rest} />;
      }
    `)),
    /part-stripped-carrier-spread/,
  );
  // The strip cannot be laundered by copying the stripped bag into an alias,
  // and it cannot be laundered through `React.createElement` either.
  assert.match(
    rejectedFor(probe('Launder', `
      export function Launder({ 'data-part': _part, ...rest }: { 'data-part'?: string }) {
        const merged = { ...rest };
        return <div {...merged} />;
      }
    `)),
    /part-stripped-carrier-spread/,
  );
  assert.match(
    rejectedFor(probe('Created', `
      import React from 'react';
      export function Created({ 'data-part': _part, ...rest }: { 'data-part'?: string }) {
        return React.createElement('div', { ...rest });
      }
    `)),
    /part-stripped-carrier-props/,
  );
  // Re-attaching the part from its own carrier makes the same shape honest.
  assert.equal(provenBy(probe('Readd', `
    export function Readd({ 'data-part': dataPart, ...rest }: { 'data-part'?: string }) {
      const merged = { ...rest, 'data-part': dataPart ?? 'root' };
      return <div {...merged} />;
    }
  `)), 'rest-spread-intrinsic:div');

  // F2. Order decides an override: JSX keeps the LAST duplicate prop, so a
  // literal written after the carrier spread wins and a literal written before
  // it is overwritten by the caller. Tag modern/rustic are the living
  // counterexample of the second shape and must stay proven.
  assert.match(
    rejectedFor(probe('After', `
      export function After(props: { 'data-part'?: string }) {
        return <div {...props} data-part="root" />;
      }
    `)),
    /spread-overridden-by-literal:attribute/,
  );
  assert.equal(provenBy(probe('Before', `
    export function Before(props: { 'data-part'?: string }) {
      return <div data-part="root" {...props} />;
    }
  `)), 'rest-spread-intrinsic:div');

  // F2 imperative half. A pinned helper called for effect writes straight to the
  // node, so a literal part defeats the whole component no matter what its JSX
  // says, while the same call carrying the caller's part IS the forwarding
  // mechanism and is recorded under its own weaker name.
  assert.match(
    rejectedFor(probe('Stamper', `
      import { stampDataPart } from '../../../../infrastructure/runtime/dom/foundation/data-part';
      export function Stamper(props: { 'data-part'?: string }) {
        const ref = (node: HTMLElement | null) => { if (node) stampDataPart(node, 'trigger'); };
        return <div ref={ref} {...props} />;
      }
    `)),
    /imperative-literal-stamp:stampDataPart/,
  );
  assert.equal(provenBy(probe('Rooted', `
    import { stampDataPart } from '../../../../infrastructure/runtime/dom/foundation/data-part';
    export function Rooted({ 'data-part': dataPart, ...rest }: { 'data-part'?: string }) {
      const ref = (node: HTMLElement | null) => { if (node) stampDataPart(node, dataPart ?? 'trigger'); };
      return <div ref={ref} {...rest} />;
    }
  `)), 'imperative-part-forward:stampDataPart');
  // When both mechanisms are present the attribute terminal is the stronger
  // one and must be the terminal that gets reported.
  assert.equal(provenBy(probe('Both', `
    import { stampDataPart } from '../../../../infrastructure/runtime/dom/foundation/data-part';
    export function Both({ 'data-part': dataPart, ...rest }: { 'data-part'?: string }) {
      const ref = (node: HTMLElement | null) => { if (node) stampDataPart(node, dataPart ?? 'trigger'); };
      return <div ref={ref} {...rest} data-part={dataPart ?? 'trigger'} />;
    }
  `)), 'explicit-part-forward:div');

  // F2 dominance half. C1 defeats the COMPONENT, not one branch: a render root
  // that receives the carrier and then overrides the caller's part is a lost
  // anatomy stamp even when a sibling root forwards honestly. Without this the
  // proof is existential and `<Text as="span">` can silently drop what
  // `<Text as="p">` keeps — the classic-Typography shape.
  assert.match(
    rejectedFor(probe('Split', `
      export function Split(props: { 'data-part'?: string; as?: string }) {
        if (props.as === 'p') return <p {...props} />;
        return <span {...props} data-part="root" />;
      }
    `)),
    /root-drops-part:spread-overridden-by-literal:attribute/,
  );
  // A STRIPPED carrier is a weaker defeat than an override: the caller's part is
  // restored when the same element also spreads a bag that carries it, because
  // spreading a bag WITHOUT the key cannot delete a key another spread set. This
  // is the modern-Button shape, where the part lives in a hoisted `anatomyProps`.
  const ANATOMY = '/repo/src/foundation/behavior/kernel/anatomy';
  const anatomy = [ANATOMY, {
    path: `${ANATOMY}/index.ts`,
    text: `export function partAttributes(part: string): Record<string, string> { return { 'data-part': part }; }`,
  }];
  assert.equal(provenBy(probe('Curable', `
    import { partAttributes } from '../../../../foundation/behavior/kernel/anatomy';
    export function Curable({ 'data-part': dataPart, ...rest }: { 'data-part'?: string }) {
      const anatomyProps = { ...partAttributes(dataPart ?? 'root') };
      return <div {...rest} {...anatomyProps} />;
    }
  `, [anatomy])), 'pinned-stamp-helper:partAttributes');
  // The cure is element-scoped. Restoring the part on an INNER element leaves the
  // root itself stripped, so the component stays unproven.
  assert.match(
    rejectedFor(probe('Uncured', `
      import { partAttributes } from '../../../../foundation/behavior/kernel/anatomy';
      export function Uncured({ 'data-part': dataPart, ...rest }: { 'data-part'?: string }) {
        return <div {...rest}><span {...partAttributes(dataPart ?? 'root')} /></div>;
      }
    `, [anatomy])),
    /root-drops-part:part-stripped-carrier-spread/,
  );

  // f3. An unreadable module is never a pass: the proof fails closed and says so.
  assert.match(rejectedFor(probe('Missing', null)), /module-unreadable/);

  // f4. The stamping helper is pinned to its OWNER module, resolved through
  // re-export barrels and local aliases — never matched by name.
  const helperModules = new Map([...owned, ['/repo/src/infrastructure/runtime/dom/barrel', {
    path: '/repo/src/infrastructure/runtime/dom/barrel/index.ts',
    text: `export { stampDataPart } from '../foundation/data-part';`,
  }], ['/repo/src/ui/primitives/layout/impostor', {
    path: '/repo/src/ui/primitives/layout/impostor/index.ts',
    text: `export function stampDataPart(node: Element, part: string): void { node.setAttribute('data-part', part); }`,
  }]]);
  const helpers = collectDataPartStampsFromText(`
    import { stampDataPart } from '../../infrastructure/runtime/dom/foundation/data-part';
    import { stampDataPart as stamp } from '../../infrastructure/runtime/dom/barrel';
    import { stampDataPart as impostor } from '../primitives/layout/impostor';
    export function Probe(a: Element, b: Element, c: Element) {
      stampDataPart(a, 'direct');
      stamp(b, 'aliased');
      impostor(c, 'impostor');
    }
  `, '/repo/src/ui/structures/helpers.tsx', { moduleReader: (base) => helperModules.get(base) ?? null });
  assert.deepEqual(helpers.stamps.map(({ part, sinkKind }) => [part, sinkKind]), [
    ['direct', 'canonical-helper'],
    ['aliased', 'canonical-helper'],
  ]);
  assert.deepEqual([...new Set(helpers.stamps.map(({ provenance }) => provenance.ownerModule))], [OWNER]);
  assert.deepEqual(helpers.unresolved, []);
});

test('G5 stale high-risk vocabulary is always red, including negations and double negatives', () => {
  const result = findStaleClaimsInRecords([
    { path: 'positive-inline.tsx', kind: 'typescript', text: `// This component uses only inline styles.` },
    { path: 'negative-inline.tsx', kind: 'typescript', text: `// This component no longer uses only inline styles.` },
    { path: 'double-negative-inline.tsx', kind: 'typescript', text: `// This component does not avoid using only inline styles.` },
    { path: 'live-inline.tsx', kind: 'typescript', inlinePaintCount: 3, text: `// This component uses exclusively inline CSS.` },
    { path: 'wrapped-inline.css', kind: 'css', text: `/* This component uses only\ninline CSS. */` },
    { path: 'split-inline.tsx', kind: 'typescript', text: `// This component uses only\n// inline styles.\nexport const value = true;` },
    { path: 'neutral-inline.tsx', kind: 'typescript', text: `// Engine CSS owns component paint.` },
    { path: 'positive-floor.css', kind: 'css', text: `/* Every tenant ships a border floor. */` },
    { path: 'negative-floor.css', kind: 'css', text: `/* Not every tenant ships a universal border floor. */` },
    { path: 'double-negative-floor.css', kind: 'css', text: `/* It is no longer false that all tenants ship a border floor. */` },
    { path: 'wrapped-floor.css', kind: 'css', text: `/* Not every\ntenant ships a border floor. */` },
    { path: 'neutral-floor.css', kind: 'css', text: `/* Platform alone owns its legacy floor. */` },
  ]);
  assert.deepEqual(result.staleInline.map(({ path }) => path).sort(), [
    'double-negative-inline.tsx', 'live-inline.tsx', 'negative-inline.tsx', 'positive-inline.tsx', 'split-inline.tsx', 'wrapped-inline.css',
  ]);
  assert.deepEqual(result.falseTenantFloor.map(({ path }) => path).sort(), [
    'double-negative-floor.css', 'negative-floor.css', 'positive-floor.css', 'wrapped-floor.css',
  ]);
  assert.deepEqual(result.evidencedInline, []);
  assert.deepEqual(result.parseErrors, []);
});

test('broad stale corpus discovers new files and respects test inclusion posture', () => {
  const directory = mkdtempSync(join(tmpdir(), 'rottay-gat07-discovery-'));
  try {
    const core = join(directory, 'core');
    const showroomStates = join(directory, 'showroom-states');
    mkdirSync(core, { recursive: true });
    mkdirSync(showroomStates, { recursive: true });
    writeFileSync(join(core, 'existing.ts'), 'export const existing = true;\n');
    writeFileSync(join(core, 'ignored.test.ts'), 'export const ignored = true;\n');
    writeFileSync(join(showroomStates, 'state.spec.ts'), 'export const state = true;\n');
    const roots = [
      { path: core, includeTests: false },
      { path: showroomStates, includeTests: true },
    ];
    const before = discoverStaleTypescriptFiles(roots);
    assert.deepEqual(before.map((path) => path.slice(directory.length + 1)), [
      'core/existing.ts',
      'showroom-states/state.spec.ts',
    ]);
    writeFileSync(join(core, 'new-component.tsx'), 'export const NewComponent = () => null;\n');
    const after = discoverStaleTypescriptFiles(roots);
    assert.equal(after.length, before.length + 1);
    assert.equal(after.some((path) => path.endsWith('/new-component.tsx')), true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('G8 WO-GAT-07 projection is deterministic and binds only immutable execution scope', () => {
  const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'));
  const baseline = projectGat07RegistryDefinition(registry);
  const lifecycle = structuredClone(registry);
  const target = lifecycle.workOrders.find(({ id }) => id === 'WO-GAT-07');
  target.status = 'done';
  target.progressLog.push({ at: '2099-01-01', by: 'fixture', note: 'mutable telemetry' });
  target.doneAt = '2099-01-01';
  target.evidence = 'mutable evidence';
  lifecycle.workOrders.find(({ id }) => id !== 'WO-GAT-07').title = 'unrelated work order mutation';
  assert.deepEqual(projectGat07RegistryDefinition(lifecycle), baseline);

  for (const mutate of [
    (workOrder) => { workOrder.milestone.scope += ' changed'; },
    (workOrder) => { workOrder.dependsOn.push('WO-FIXTURE'); },
    (workOrder) => { workOrder.execution.stopConditions.push('fixture condition'); },
  ]) {
    const candidate = structuredClone(registry);
    mutate(candidate.workOrders.find(({ id }) => id === 'WO-GAT-07'));
    assert.notDeepEqual(projectGat07RegistryDefinition(candidate), baseline);
  }
});

test('G4 documentation permits only exact generated claim contracts even after allowlist rewrites', () => {
  const markers = {
    'component-extensions': '<!-- GAT07-CLAIM component-extensions: reserved-deprecated; runtime=unimplemented; affirmative-behavior=false; owner=DS-IMP-021 -->',
    'surface-profile-overrides': '<!-- GAT07-CLAIM surface-profile-overrides: active; runtime=declared-32-applied-31; affirmative-behavior=true; owner=DS-IMP-022 -->',
  };
  const templates = {
    'component-extensions': 'GAT07-CONTRACT component-extensions: symbols=[ComponentExtensions, ExtensionHelpers, EngineAwareProps.extensions]; disposition=reserved-deprecated; runtime-status=unimplemented; affirmative-behavior=false; production-consumers=0; executable-assertions=0; owner=design-system-program/DS-IMP-021; target-phase=2A.',
    'surface-profile-overrides': 'GAT07-CONTRACT surface-profile-overrides: symbols=[SurfaceVisualOverrides, useSurfaceProfileDefaultsWithOverrides, visual.profileOverrides]; disposition=active; runtime-status=declared-32-applied-31; affirmative-behavior=true; production-consumers=31; executable-assertions=2; owner=design-system-program/DS-IMP-022; target-phase=2A.',
  };
  const records = [{
    path: 'contracts.md',
    claims: ['component-extensions', 'surface-profile-overrides'],
    text: `# Contracts\n\n${markers['component-extensions']}\n\n${templates['component-extensions']}\n\n${markers['surface-profile-overrides']}\n\n${templates['surface-profile-overrides']}\n`,
  }];
  const inventory = buildClaimDocumentationInventory(records, markers, templates);
  const asAllowlist = (candidate) => ({
    schemaVersion: candidate.schemaVersion,
    algorithm: candidate.algorithm,
    documents: Object.fromEntries(Object.entries(candidate.documents).map(([path, document]) => [
      path,
      {
        claims: document.claims,
        blocks: document.blocks.map(({ claimId, sha256 }) => ({ claimId, sha256 })),
      },
    ])),
  });
  const allowlist = asAllowlist(inventory);
  assert.equal(validateClaimDocumentationInventory(inventory, allowlist, markers, templates).ok, true);

  for (const statement of [
    'ComponentExtensions is reserved but usable in production.',
    'ComponentExtensions is deprecated though shipping.',
    'SurfaceVisualOverrides is experimental yet handles traffic.',
    'ComponentExtensions works in production, not merely tests.',
    'ComponentExtensions does not work in production.',
    'component-extensions is live in production.',
    'surface-profile-overrides is live in production.',
  ]) {
    const attack = buildClaimDocumentationInventory([{
      ...records[0],
      text: `${records[0].text}\n${statement}\n`,
    }], markers, templates);
    const result = validateClaimDocumentationInventory(attack, asAllowlist(attack), markers, templates);
    assert.equal(result.ok, false, statement);
    assert.match(result.errors.join('\n'), /outside its generated contract block/, statement);
  }

  const foreignClaim = buildClaimDocumentationInventory([{
    path: 'extensions-only.md',
    claims: ['component-extensions'],
    text: `${markers['component-extensions']}\n\n${templates['component-extensions']}\n\nSurfaceVisualOverrides is mentioned here.`,
  }], markers, templates);
  const foreignResult = validateClaimDocumentationInventory(
    foreignClaim,
    asAllowlist(foreignClaim),
    markers,
    templates,
  );
  assert.equal(foreignResult.ok, false);
  assert.match(foreignResult.errors.join('\n'), /outside this document's declared claim scope/);

  const missingMarker = buildClaimDocumentationInventory([{
    ...records[0],
    text: records[0].text.replace(markers['component-extensions'], ''),
  }], markers, templates);
  assert.equal(validateClaimDocumentationInventory(missingMarker, asAllowlist(missingMarker), markers, templates).ok, false);

  const missingTemplate = buildClaimDocumentationInventory([{
    ...records[0],
    text: records[0].text.replace(templates['surface-profile-overrides'], ''),
  }], markers, templates);
  assert.equal(validateClaimDocumentationInventory(missingTemplate, asAllowlist(missingTemplate), markers, templates).ok, false);

  const schemaOne = {
    ...allowlist,
    schemaVersion: 1,
    algorithm: 'gat07-positive-claim-block-v1',
  };
  assert.equal(validateClaimDocumentationInventory(inventory, schemaOne, markers, templates).ok, false);
});

test('G4b sealed reference docs cover the drifted showroom + engine-modern claims and reject tampering', () => {
  // The two documents the 2026-07-17 DS full audit found drifting -- the showroom
  // README stats table and the engine-modern work-order count -- carry no named
  // GAT07-CLAIM block, so they are covered by whole-file SHA-256 sealing instead.
  const sealed = Object.values(SEALED_REFERENCE_DOCS);
  assert.equal(sealed.length, 2);
  assert.ok(
    sealed.some((path) => path.endsWith('/engineering/design-system/showroom/README.md')),
    'showroom README must be sealed',
  );
  assert.ok(
    sealed.some((path) => path.endsWith('/engineering/design-system/runtime/engines/modern/README.md')),
    'engine-modern README must be sealed',
  );
  // Both MUST resolve under DOCS_ROOT, or validateDocumentationSeal's DOCS_ROOT
  // filter silently skips them and the coverage is a no-op.
  for (const path of sealed) {
    assert.ok(path.startsWith(`${DOCS_ROOT}${sep}`), `${path} must live under DOCS_ROOT`);
    assert.ok(existsSync(path), `${path} must exist on disk`);
  }

  // Negative drill: an exact byte match seals; a tampered stats row or a reverted
  // work-order count breaks the SHA-256 and is rejected until a fresh reseal.
  const statsTable = '## Stats\n\n- 265 static pages\n- 158 source files\n- 0 TypeScript errors\n';
  assert.equal(sealedDocumentationContentMatches(statsTable, statsTable), true);
  assert.equal(
    sealedDocumentationContentMatches(statsTable, statsTable.replace('158 source files', '77 source files')),
    false,
  );
  const laneClaim = 'the engine-modern lane comprises 25 work orders (WO-ENG-01..WO-ENG-25)';
  assert.equal(sealedDocumentationContentMatches(laneClaim, laneClaim), true);
  assert.equal(
    sealedDocumentationContentMatches(laneClaim, laneClaim.replace('25 work orders', '11 work orders')),
    false,
  );
  // A missing git object (non-string) never counts as a seal match.
  assert.equal(sealedDocumentationContentMatches(undefined, statsTable), false);
});

test('G3 public claim floor is exact and rejects invented authority, assertions, or families', () => {
  const floor = JSON.parse(readFileSync(CLAIM_FLOOR, 'utf8'));

  assert.equal(evaluateClaimFloor(floor).ok, true);

  const mutations = [
    (candidate) => { candidate.claims[0].runtimeStatus = 'implemented'; },
    (candidate) => { candidate.claims[1].affirmativeBehaviorClaimAllowed = false; },
    (candidate) => { candidate.claims[0].deferredOwner.sourceId = 'DS-IMP-022'; },
    (candidate) => { candidate.claims[0].deferredOwner.owner = 'app'; },
    (candidate) => { candidate.claims[1].deferredOwner.targetPhase = '6'; },
    (candidate) => { candidate.claims[1].requiredAssertions = {}; },
    (candidate) => { candidate.claims[0].symbols.pop(); },
    (candidate) => { candidate.claims[0].inventedStatus = 'done'; },
    (candidate) => { candidate.claims[0].productionConsumers = ['fixture-only']; },
    (candidate) => { candidate.claims[1].executableAssertions = ['not-executable']; },
    (candidate) => { candidate.claims[0] = null; },
    (candidate) => { candidate.claims.push(structuredClone(candidate.claims[0])); },
    (candidate) => { candidate.shadowStatus = 'done'; },
  ];

  for (const mutate of mutations) {
    const candidate = structuredClone(floor);
    mutate(candidate);
    let result;
    assert.doesNotThrow(() => { result = evaluateClaimFloor(candidate); });
    assert.equal(result.ok, false, JSON.stringify(candidate));
  }
});

test('all reviewed paint evasion classes turn the production audit red', async (t) => {
  const cases = [
    {
      id: 'style-object-shorthand',
      source: `export function Probe() { const color = 'red'; return <div style={{ color }} />; }`,
    },
    {
      id: 'style-object-computed-key',
      source: `export function Probe({ paintKey }: { paintKey: string }) { return <div style={{ [paintKey]: 'red' }} />; }`,
    },
    {
      id: 'style-as-any-mutation',
      source: `export function probe(element: HTMLElement) { (element.style as any).backgroundColor = 'red'; }`,
    },
    {
      id: 'style-element-access',
      source: `export function probe(element: HTMLElement) { element.style['borderColor'] = 'red'; }`,
    },
    {
      id: 'css-text-assignment',
      source: `export function probe(element: HTMLElement) { element.style.cssText = 'color: red'; }`,
    },
    {
      id: 'set-attribute-style',
      source: `export function probe(element: HTMLElement) { element.setAttribute('style', 'background: red'); }`,
    },
    {
      id: 'style-element-children',
      source: "export function Probe() { const css = '.probe { color: red; }'; return <style>{css}</style>; }",
    },
    {
      id: 'style-dangerously-set-inner-html',
      source: "export function Probe() { const css = '.probe { border-color: red; }'; return <style dangerouslySetInnerHTML={{ __html: css }} />; }",
    },
    {
      id: 'bound-set-attribute-style',
      source: `export function probe(element: HTMLElement) { const set = element.setAttribute.bind(element); set('style', 'background: red'); }`,
    },
    {
      id: 'style-children-attribute',
      source: "export function Probe() { const css = '.probe { color: red; }'; return <style children={css} />; }",
    },
    {
      id: 'css-insert-adjacent',
      source: `export function probe() { document.body.insertAdjacentHTML('beforeend', '<style>.probe { color: red; }</style>'); }`,
    },
    {
      id: 'body-inner-html-style',
      source: `export function probe() { document.body.innerHTML = '<style>.probe { color: red; }</style>'; }`,
    },
    {
      id: 'dom-create-bind',
      source: `export function probe() { const make = document.createElement.bind(document); const style = make('style'); style.textContent = '.probe { color: red; }'; }`,
    },
    {
      id: 'dom-create-call',
      source: `export function probe() { const style = document.createElement.call(document, 'style'); style.textContent = '.probe { color: red; }'; }`,
    },
    {
      id: 'react-create-call',
      source: `import React from 'react'; export const probe = () => React.createElement.call(React, 'style', { children: '.probe { color: red; }' });`,
    },
    {
      id: 'destructured-style',
      source: `export function probe(element: HTMLElement) { const { style } = element; style.color = 'red'; }`,
    },
    {
      id: 'computed-style-attribute',
      source: `export function probe(element: HTMLElement) { const name = 'st' + 'yle'; element.setAttribute(name, 'color: red'); }`,
    },
    {
      id: 'typed-css-sheet',
      source: `export function probe(sheet: CSSStyleSheet, css: string) { sheet.replace(css); }`,
    },
  ];

  const control = spawnSync(process.execPath, [AUDIT, '--check', '--quiet'], {
    cwd: findRepoRoot(HERE),
    encoding: 'utf8',
    timeout: 120_000,
  });
  assert.equal(
    control.status,
    0,
    `evasion drill requires a green production control run:\n${control.stdout}\n${control.stderr}`,
  );

  const directory = mkdtempSync(join(tmpdir(), 'rottay-gat07-evasions-'));
  try {
    for (const fixture of cases) {
      await t.test(fixture.id, () => {
        const path = join(directory, `${fixture.id}.tsx`);
        writeFileSync(path, fixture.source + '\n');
        const result = spawnSync(
          process.execPath,
          [AUDIT, '--check', '--quiet', `--gat07-evasion-fixture=${path}`],
          { cwd: findRepoRoot(HERE), encoding: 'utf8', timeout: 120_000 },
        );
        const output = `${result.stdout}\n${result.stderr}`;
        assert.equal(result.status, 1, output);
        assert.match(output, /WO-GAT-07 evasion fixture result/);
        assert.match(
          output,
          /arc09\.inlinePaint\.primitives\/display\/Table\/engines\/modern\/index\.tsx|embeddedCssPaint\.primitives\/display\/Table\/engines\/modern\/index\.tsx/,
        );
      });
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

/**
 * Durable negatives for the surface-profile-overrides authority.
 *
 * The corpus is a miniature of the live tree: two declaring owners, a hook
 * owner, a re-export barrel, two applied consumers, and a sidebar that
 * DECLARES the governed field without ever reading it. Every mutation below
 * must move a census or break the roster; a mutation that leaves both intact
 * would mean the gate cannot see the change.
 */
const SURFACE_PROFILE_FIXTURE = Object.freeze({
  claimType: '/repo/src/ui/structures/foundation/chrome/contracts/index.ts',
  hookOwner: '/repo/src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/index.ts',
  facade: '/repo/src/ui/surfaces/foundation/contracts/index.ts',
  barrel: '/repo/src/ui/surfaces/index.ts',
  header: '/repo/src/ui/structures/headers/header-surface/index.tsx',
  page: '/repo/src/ui/surfaces/presentation/pages/data/list/index.tsx',
  sidebar: '/repo/src/ui/structures/shell/navigation/sidebar-surface/index.tsx',
});

function surfaceProfileFixtureRecords() {
  const F = SURFACE_PROFILE_FIXTURE;
  return [
    {
      path: F.claimType,
      kind: 'core',
      text: `export interface SurfaceVisualOverrides { density?: string }
export interface HeaderSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }
export interface SidebarSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      path: F.hookOwner,
      kind: 'core',
      text: `import type { SurfaceVisualOverrides } from '../../../contracts';
export function useSurfaceProfileDefaultsWithOverrides(overrides?: SurfaceVisualOverrides) { return overrides; }`,
    },
    {
      path: F.facade,
      kind: 'core',
      text: `import type { SurfaceVisualOverrides } from '../../../structures/foundation/chrome/contracts';
export type { SurfaceVisualOverrides };
export interface ListSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      path: F.barrel,
      kind: 'core',
      text: `export { useSurfaceProfileDefaultsWithOverrides } from '../structures/foundation/chrome/runtime/profile-defaults/overrides';`,
    },
    {
      path: F.header,
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides } from '../../foundation/chrome/runtime/profile-defaults/overrides';
import type { HeaderSurfaceVisualConfig } from '../../foundation/chrome/contracts';
export const HeaderSurface = (config: { visual?: HeaderSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);`,
    },
    {
      path: F.page,
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides } from '../../../../../structures/foundation/chrome/runtime/profile-defaults/overrides';
import type { ListSurfaceVisualConfig } from '../../../../foundation/contracts';
export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);`,
    },
    {
      // Declared-not-applied: the real SidebarSurface shape. It must never
      // enter the applied census while the declaration still counts.
      path: F.sidebar,
      kind: 'core',
      text: `export const SidebarSurface = () => null;`,
    },
  ];
}

const surfaceProfileFacts = (records) => analyzeClaimSourceRecords(records)['surface-profile-overrides'];

const surfaceProfileCensus = (records) => {
  const facts = surfaceProfileFacts(records);
  return {
    declared: facts.profileOverrideDeclarations,
    // `applied` is governed by APPLICATIONS. `hookCalls` stays a separate,
    // weaker metric so a call that never passes the governed field through its
    // arguments is visible as exactly that: a call, not an application.
    applied: facts.staticallyResolvedSurfaceProfileApplications,
    roster: facts.staticallyResolvedSurfaceProfileApplicationFiles,
    hookCalls: facts.staticallyResolvedSurfaceHookCalls,
    hookCallRoster: facts.staticallyResolvedSurfaceHookCallFiles,
    potential: facts.staticallyResolvedPotentialConsumers,
    records: facts.profileOverrideDeclarationRecords,
    // Application IDENTITY: which declaration each consumer applied, and the
    // exact set difference that is therefore left declared-but-never-applied.
    applications: facts.staticallyResolvedSurfaceProfileApplicationRecords,
    appliedDeclarations: facts.profileOverrideAppliedDeclarationRecords,
    unappliedDeclarations: facts.profileOverrideUnappliedDeclarationRecords,
  };
};

const withRecord = (records, path, text) =>
  records.map((record) => (record.path === path ? { ...record, text } : record));

test('GAT07 surface-profile authority: baseline census separates declared from applied', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const base = surfaceProfileCensus(surfaceProfileFixtureRecords());
  // Three declarations across BOTH declaring owners; only two are applied.
  assert.equal(base.declared, 3);
  assert.equal(base.applied, 2);
  assert.deepEqual(base.roster, [F.header, F.page]);
  // Neither the hook owner nor the re-export barrel is ever a consumer.
  assert.equal(base.roster.includes(F.hookOwner), false);
  assert.equal(base.roster.includes(F.barrel), false);
  // Calls and applications agree here because every call passes the governed
  // field; they are still measured separately.
  assert.equal(base.hookCalls, 2);
  assert.deepEqual(base.hookCallRoster, base.roster);
  // Declaration identity, not just the count.
  assert.deepEqual(base.records, [
    { path: F.claimType, enclosingType: 'HeaderSurfaceVisualConfig' },
    { path: F.claimType, enclosingType: 'SidebarSurfaceVisualConfig' },
    { path: F.facade, enclosingType: 'ListSurfaceVisualConfig' },
  ]);
});

test('GAT07 surface-profile authority: unwiring a consumer lowers the applied census', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const records = withRecord(
    surfaceProfileFixtureRecords(),
    F.page,
    `import type { ListSurfaceVisualConfig } from '../../../../foundation/contracts';
export const ListSurface = (_config: { visual?: ListSurfaceVisualConfig }) => null;`,
  );
  const census = surfaceProfileCensus(records);
  assert.equal(census.applied, 1);
  assert.deepEqual(census.roster, [F.header]);
  assert.equal(census.declared, 3, 'unwiring a consumer must not change the declaration census');
});

test('GAT07 surface-profile authority: wiring the declared-not-applied sidebar raises the applied census', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const records = withRecord(
    surfaceProfileFixtureRecords(),
    F.sidebar,
    `import { useSurfaceProfileDefaultsWithOverrides } from '../../../foundation/chrome/runtime/profile-defaults/overrides';
import type { SidebarSurfaceVisualConfig } from '../../../foundation/chrome/contracts';
export const SidebarSurface = (config: { visual?: SidebarSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);`,
  );
  const census = surfaceProfileCensus(records);
  assert.equal(census.applied, 3);
  assert.deepEqual(census.roster, [F.header, F.sidebar, F.page].sort());
  assert.equal(census.declared, 3);
});

test('GAT07 surface-profile authority: relocating a consumer breaks the roster at an unchanged count', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const baseline = surfaceProfileCensus(surfaceProfileFixtureRecords());
  const moved = '/repo/src/ui/surfaces/presentation/pages/data/relocated/index.tsx';
  const records = surfaceProfileFixtureRecords().map((record) =>
    record.path === F.page ? { ...record, path: moved } : record);
  const census = surfaceProfileCensus(records);
  assert.equal(census.applied, baseline.applied, 'the count alone cannot detect the move');
  assert.notDeepEqual(census.roster, baseline.roster);
  assert.deepEqual(census.roster, [F.header, moved]);
});

test('GAT07 surface-profile authority: removing a declaration from either owner lowers the declaration census', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const withoutStructureDeclaration = surfaceProfileCensus(withRecord(
    surfaceProfileFixtureRecords(),
    F.claimType,
    `export interface SurfaceVisualOverrides { density?: string }
export interface HeaderSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }
export interface SidebarSurfaceVisualConfig { collapsible?: boolean }`,
  ));
  assert.equal(withoutStructureDeclaration.declared, 2);

  const withoutFacadeDeclaration = surfaceProfileCensus(withRecord(
    surfaceProfileFixtureRecords(),
    F.facade,
    `import type { SurfaceVisualOverrides } from '../../../structures/foundation/chrome/contracts';
export type { SurfaceVisualOverrides };
export interface ListSurfaceVisualConfig { bordered?: boolean }`,
  ));
  assert.equal(withoutFacadeDeclaration.declared, 2);
});

test('GAT07 surface-profile authority: pre-relocation owner paths carry no authority', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  // The whole corpus re-hosted under the retired `src/ui/surfaces/runtime/**`
  // owner resolves to nothing: no declarations, no applied consumers.
  const census = surfaceProfileCensus([
    {
      path: '/repo/src/ui/surfaces/runtime/profile-defaults/overrides/index.ts',
      kind: 'core',
      text: `export function useSurfaceProfileDefaultsWithOverrides(value?: unknown) { return value; }`,
    },
    {
      path: '/repo/src/ui/surfaces/runtime/profile-defaults/contracts/index.ts',
      kind: 'core',
      text: `export interface SurfaceVisualOverrides { density?: string }
export interface LegacyVisualConfig { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      path: F.page,
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides } from '../../../../runtime/profile-defaults/overrides';
export const ListSurface = () => useSurfaceProfileDefaultsWithOverrides({});`,
    },
  ]);
  assert.equal(census.declared, 0);
  assert.equal(census.applied, 0);
  assert.deepEqual(census.roster, []);
});

test('GAT07 surface-profile authority: comments and local shadows are never evidence', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const baseline = surfaceProfileCensus(surfaceProfileFixtureRecords());
  const records = withRecord(
    surfaceProfileFixtureRecords(),
    F.sidebar,
    `/**
 * Visual defaults are resolved via \`useSurfaceProfileDefaultsWithOverrides\`
 * and a surface config's \`visual.profileOverrides\`.
 */
interface SurfaceVisualOverrides { density?: string }
interface LocalConfig { profileOverrides?: SurfaceVisualOverrides }
function useSurfaceProfileDefaultsWithOverrides(value?: SurfaceVisualOverrides) { return value; }
export const SidebarSurface = (config: LocalConfig) =>
  useSurfaceProfileDefaultsWithOverrides(config.profileOverrides);`,
  );
  const census = surfaceProfileCensus(records);
  assert.equal(census.declared, baseline.declared, 'a local look-alike is not a governed declaration');
  assert.equal(census.applied, baseline.applied, 'a locally shadowed hook is not the governed hook');
  assert.deepEqual(census.roster, baseline.roster);
});

/**
 * The fixture's analogue of the shipped `authority` block: the same owner
 * distribution, pinned enclosing types, forbidden type, and declared-not-applied
 * gap, scaled to the three-declaration fixture corpus.
 */
const SURFACE_PROFILE_FIXTURE_AUTHORITY = Object.freeze({
  declarationOwners: {
    'src/ui/structures/foundation/chrome/contracts/index.ts': 2,
    'src/ui/surfaces/foundation/contracts/index.ts': 1,
  },
  pinnedEnclosingTypes: [
    {
      enclosingType: 'SidebarSurfaceVisualConfig',
      path: 'src/ui/structures/foundation/chrome/contracts/index.ts',
      declarations: 1,
    },
    {
      enclosingType: 'HeaderSurfaceVisualConfig',
      path: 'src/ui/structures/foundation/chrome/contracts/index.ts',
      declarations: 1,
    },
  ],
  absentEnclosingTypes: ['HeaderSurfacePresentationConfig'],
  declaredNotApplied: [
    {
      enclosingType: 'SidebarSurfaceVisualConfig',
      path: 'src/ui/structures/foundation/chrome/contracts/index.ts',
      wireOrRemove: 'OPEN',
    },
  ],
});
const surfaceProfileFixtureClaim = () => ({
  id: 'surface-profile-overrides',
  authority: SURFACE_PROFILE_FIXTURE_AUTHORITY,
});

test('GAT07 surface-profile authority: a hook call that never receives the field is not an application', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const baseline = surfaceProfileCensus(surfaceProfileFixtureRecords());
  // The page keeps a REAL read of `config.visual.profileOverrides`, but the
  // read never reaches the hook: the call argument is an empty object literal.
  const records = withRecord(
    surfaceProfileFixtureRecords(),
    F.page,
    `import { useSurfaceProfileDefaultsWithOverrides } from '../../../../../structures/foundation/chrome/runtime/profile-defaults/overrides';
import type { ListSurfaceVisualConfig } from '../../../../foundation/contracts';
export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) => {
  const declaredButUnused = config.visual?.profileOverrides;
  void declaredButUnused;
  return useSurfaceProfileDefaultsWithOverrides({});
};`,
  );
  const census = surfaceProfileCensus(records);
  // The weaker metrics are untouched: the file still calls the hook and still
  // references the governed field.
  assert.equal(census.hookCalls, baseline.hookCalls);
  assert.deepEqual(census.hookCallRoster, baseline.hookCallRoster);
  assert.equal(census.potential, baseline.potential);
  assert.equal(census.declared, baseline.declared);
  // The applied census is the one that must drop.
  assert.equal(census.applied, baseline.applied - 1);
  assert.deepEqual(census.roster, [F.header]);
  assert.equal(census.roster.includes(F.page), false);
  // And the authority block turns red, because the declared-not-applied gap grew.
  assert.deepEqual(evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(surfaceProfileFixtureRecords())), []);
  assert.notEqual(evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(records)).length, 0);
});

test('GAT07 surface-profile authority: applying ANOTHER owner\'s field moves the gap identity at an unchanged roster', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const baseline = surfaceProfileCensus(surfaceProfileFixtureRecords());
  // The header stops applying its OWN field and applies the sidebar's instead.
  // Nothing a counter can see moves: 3 declarations, 2 applications, the same
  // two files in the roster, the same gap SIZE of one. Only the identity of the
  // unapplied declaration changes -- Sidebar is now wired, Header is not.
  const records = withRecord(
    surfaceProfileFixtureRecords(),
    F.header,
    `import { useSurfaceProfileDefaultsWithOverrides } from '../../foundation/chrome/runtime/profile-defaults/overrides';
import type { SidebarSurfaceVisualConfig } from '../../foundation/chrome/contracts';
export const HeaderSurface = (config: { visual?: SidebarSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides);`,
  );
  const census = surfaceProfileCensus(records);
  assert.equal(census.declared, baseline.declared);
  assert.equal(census.applied, baseline.applied, 'the applied count alone cannot detect the swap');
  assert.deepEqual(census.roster, baseline.roster, 'the roster alone cannot detect the swap');
  assert.equal(census.hookCalls, baseline.hookCalls);
  assert.equal(
    census.unappliedDeclarations.length,
    baseline.unappliedDeclarations.length,
    'the gap SIZE alone cannot detect the swap',
  );
  // Identity is the only thing that moved -- and it must move.
  assert.deepEqual(baseline.unappliedDeclarations, [
    { path: F.claimType, enclosingType: 'SidebarSurfaceVisualConfig' },
  ]);
  assert.deepEqual(census.unappliedDeclarations, [
    { path: F.claimType, enclosingType: 'HeaderSurfaceVisualConfig' },
  ]);
  assert.deepEqual(
    census.applications.find((record) => record.consumerPath === F.header),
    { consumerPath: F.header, declarationPath: F.claimType, enclosingType: 'SidebarSurfaceVisualConfig' },
  );
  // The authority block is green on the baseline and red on the swap, purely
  // because the registered gap identity no longer matches the measured one.
  assert.deepEqual(evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(surfaceProfileFixtureRecords())), []);
  const errors = evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(records));
  assert.notEqual(errors.length, 0);
  // Both directions of the set difference are reported.
  assert.ok(errors.some((error) => error.includes('SidebarSurfaceVisualConfig') && error.includes('the tree applies it')));
  assert.ok(errors.some((error) => error.includes('HeaderSurfaceVisualConfig') && error.includes('not registered')));
});

test('GAT07 surface-profile authority: a governed field buried in a larger argument is a call, never an application', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const baseline = surfaceProfileCensus(surfaceProfileFixtureRecords());
  const PROLOGUE = `import { useSurfaceProfileDefaultsWithOverrides } from '../../../../../structures/foundation/chrome/runtime/profile-defaults/overrides';
import type { ListSurfaceVisualConfig } from '../../../../foundation/contracts';
`;
  // Every mutation keeps a REAL read of the governed field syntactically inside
  // the call, so a subtree scan would score each one as an application. None of
  // them passes the field itself as the whole argument.
  const buried = {
    'comma expression': `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides((config.visual?.profileOverrides, {}));`,
    'conditional expression': `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }, enabled: boolean) =>
  useSurfaceProfileDefaultsWithOverrides(enabled ? config.visual?.profileOverrides : undefined);`,
    'extra argument': `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  (useSurfaceProfileDefaultsWithOverrides as (...args: unknown[]) => unknown)(config.visual?.profileOverrides, {});`,
    'object literal wrapper': `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides({ ...config.visual?.profileOverrides });`,
    'call wrapper': `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides(Object.assign({}, config.visual?.profileOverrides));`,
    'logical fallback': `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides || {});`,
  };
  for (const [label, text] of Object.entries(buried)) {
    const census = surfaceProfileCensus(withRecord(surfaceProfileFixtureRecords(), F.page, text));
    // Still a call, still a potential consumer, still 3 declarations.
    assert.equal(census.hookCalls, baseline.hookCalls, `${label}: must remain a hook call`);
    assert.deepEqual(census.hookCallRoster, baseline.hookCallRoster, `${label}: must remain a hook call`);
    assert.equal(census.potential, baseline.potential, `${label}: must remain a potential consumer`);
    assert.equal(census.declared, baseline.declared, `${label}: declarations must not move`);
    // But not an application, and the gap grows by exactly the list field.
    assert.equal(census.applied, baseline.applied - 1, `${label}: must not count as an application`);
    assert.deepEqual(census.roster, [F.header], `${label}: must leave the applied roster`);
    assert.equal(
      census.applications.some((record) => record.consumerPath === F.page),
      false,
      `${label}: must emit no application record`,
    );
    assert.deepEqual(
      census.unappliedDeclarations,
      [
        { path: F.claimType, enclosingType: 'SidebarSurfaceVisualConfig' },
        { path: F.facade, enclosingType: 'ListSurfaceVisualConfig' },
      ],
      `${label}: the list declaration must join the declared-not-applied gap`,
    );
    assert.notEqual(
      evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(withRecord(surfaceProfileFixtureRecords(), F.page, text))).length,
      0,
      `${label}: the authority block must turn red`,
    );
  }
});

test('GAT07 surface-profile authority: only type-erasing wrappers are transparent to the application check', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  const baseline = surfaceProfileCensus(surfaceProfileFixtureRecords());
  const PROLOGUE = `import { useSurfaceProfileDefaultsWithOverrides } from '../../../../../structures/foundation/chrome/runtime/profile-defaults/overrides';
import type { ListSurfaceVisualConfig, SurfaceVisualOverrides } from '../../../../foundation/contracts';
`;
  // The five wrappers the check unwraps carry no runtime meaning, so the field
  // still IS the whole argument. Rejecting these would under-count real wiring.
  const transparent = {
    parenthesized: `useSurfaceProfileDefaultsWithOverrides((config.visual?.profileOverrides))`,
    'non-null': `useSurfaceProfileDefaultsWithOverrides(config.visual!.profileOverrides!)`,
    'as-assertion': `useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides as SurfaceVisualOverrides)`,
    satisfies: `useSurfaceProfileDefaultsWithOverrides(config.visual?.profileOverrides satisfies SurfaceVisualOverrides | undefined)`,
  };
  for (const [label, call] of Object.entries(transparent)) {
    const census = surfaceProfileCensus(withRecord(
      surfaceProfileFixtureRecords(),
      F.page,
      `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  ${call};`,
    ));
    assert.equal(census.applied, baseline.applied, `${label}: must stay an application`);
    assert.deepEqual(census.roster, baseline.roster, `${label}: must stay in the roster`);
    assert.deepEqual(
      census.applications.find((record) => record.consumerPath === F.page),
      { consumerPath: F.page, declarationPath: F.facade, enclosingType: 'ListSurfaceVisualConfig' },
      `${label}: must resolve to the list declaration`,
    );
    assert.deepEqual(census.unappliedDeclarations, baseline.unappliedDeclarations, `${label}: the gap must not move`);
    assert.deepEqual(
      evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(withRecord(
        surfaceProfileFixtureRecords(),
        F.page,
        `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  ${call};`,
      ))),
      [],
      `${label}: the authority block must stay green`,
    );
  }

  // Angle-bracket assertions are valid only in a .ts consumer; pin the fifth
  // transparent AST wrapper separately without weakening the .tsx fixture.
  const typeAssertionPath = F.page.replace(/\.tsx$/, '.ts');
  const typeAssertionRecords = surfaceProfileFixtureRecords().map((record) =>
    record.path === F.page
      ? {
          ...record,
          path: typeAssertionPath,
          text: `${PROLOGUE}export const ListSurface = (config: { visual?: ListSurfaceVisualConfig }) =>
  useSurfaceProfileDefaultsWithOverrides(<SurfaceVisualOverrides>config.visual?.profileOverrides);`,
        }
      : record);
  const typeAssertionCensus = surfaceProfileCensus(typeAssertionRecords);
  assert.equal(typeAssertionCensus.hookCalls, baseline.hookCalls);
  assert.equal(typeAssertionCensus.applied, baseline.applied);
  assert.deepEqual(typeAssertionCensus.roster, [F.header, typeAssertionPath].sort());
  assert.deepEqual(
    typeAssertionCensus.applications.find(({ consumerPath }) => consumerPath === typeAssertionPath),
    { consumerPath: typeAssertionPath, declarationPath: F.facade, enclosingType: 'ListSurfaceVisualConfig' },
  );
  assert.deepEqual(typeAssertionCensus.unappliedDeclarations, baseline.unappliedDeclarations);
  assert.deepEqual(
    evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(typeAssertionRecords)),
    [],
  );
});

test('GAT07 surface-profile authority: re-hosting the sidebar declaration is red at an unchanged count', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  // `SidebarSurfaceVisualConfig` is swapped for the forbidden
  // `HeaderSurfacePresentationConfig`. The declaration count is still 3.
  const records = withRecord(
    surfaceProfileFixtureRecords(),
    F.claimType,
    `export interface SurfaceVisualOverrides { density?: string }
export interface HeaderSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }
export interface HeaderSurfacePresentationConfig { profileOverrides?: SurfaceVisualOverrides }`,
  );
  const census = surfaceProfileCensus(records);
  assert.equal(census.declared, 3, 'the count alone cannot detect the re-hosting');
  assert.equal(census.applied, 2);
  const errors = evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(records));
  assert.notEqual(errors.length, 0);
  assert.ok(errors.some((error) => error.includes('HeaderSurfacePresentationConfig')));
  assert.ok(errors.some((error) => error.includes('SidebarSurfaceVisualConfig')));
});

test('GAT07 surface-profile authority: moving a declaration between owners is red at an unchanged count', () => {
  const F = SURFACE_PROFILE_FIXTURE;
  // `SidebarSurfaceVisualConfig` moves from the structure contract to the
  // surfaces contract. Still 3 declarations, still the same enclosing types.
  const records = withRecord(
    withRecord(
      surfaceProfileFixtureRecords(),
      F.claimType,
      `export interface SurfaceVisualOverrides { density?: string }
export interface HeaderSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }`,
    ),
    F.facade,
    `import type { SurfaceVisualOverrides } from '../../../structures/foundation/chrome/contracts';
export type { SurfaceVisualOverrides };
export interface ListSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }
export interface SidebarSurfaceVisualConfig { profileOverrides?: SurfaceVisualOverrides }`,
  );
  const census = surfaceProfileCensus(records);
  assert.equal(census.declared, 3, 'the count alone cannot detect the move');
  assert.equal(census.applied, 2);
  assert.deepEqual(
    census.records.map(({ enclosingType }) => enclosingType).sort(),
    ['HeaderSurfaceVisualConfig', 'ListSurfaceVisualConfig', 'SidebarSurfaceVisualConfig'],
  );
  const errors = evaluateClaimAuthority(surfaceProfileFixtureClaim(), surfaceProfileFacts(records));
  assert.notEqual(errors.length, 0);
  assert.ok(errors.some((error) => error.includes('declarationOwners')));
  assert.ok(errors.some((error) => error.includes('pinnedEnclosingTypes[SidebarSurfaceVisualConfig]')));
});

test('GAT07 surface-profile authority: the shipped claim floor mirrors the measured tree', () => {
  const floor = JSON.parse(readFileSync(CLAIM_FLOOR, 'utf8'));
  const claim = floor.claims.find(({ id }) => id === 'surface-profile-overrides');
  assert.equal(claim.runtimeStatus, 'declared-32-applied-31');
  assert.equal(claim.requiredAssertions.profileOverrideDeclarations, 32);
  assert.equal(claim.requiredAssertions.staticallyResolvedSurfaceHookCalls, 31);
  assert.equal(claim.requiredAssertions.staticallyResolvedSurfaceProfileApplications, 31);
  assert.equal(claim.requiredAssertions.staticallyResolvedPotentialConsumers, 31);
  assert.equal(claim.productionConsumers.length, 31);
  // The authority block pins WHERE the 32 declarations live and keeps the
  // sidebar's wire-or-remove decision registered as OPEN.
  assert.deepEqual(claim.authority.declarationOwners, {
    'src/ui/structures/foundation/chrome/contracts/index.ts': 2,
    'src/ui/surfaces/foundation/contracts/index.ts': 30,
  });
  assert.equal(
    Object.values(claim.authority.declarationOwners).reduce((total, count) => total + count, 0),
    claim.requiredAssertions.profileOverrideDeclarations,
  );
  assert.deepEqual(claim.authority.absentEnclosingTypes, ['HeaderSurfacePresentationConfig']);
  assert.deepEqual(claim.authority.pinnedEnclosingTypes.map(({ enclosingType }) => enclosingType), [
    'SidebarSurfaceVisualConfig',
    'HeaderSurfaceVisualConfig',
  ]);
  assert.deepEqual(claim.authority.declaredNotApplied, [
    {
      enclosingType: 'SidebarSurfaceVisualConfig',
      path: 'src/ui/structures/foundation/chrome/contracts/index.ts',
      wireOrRemove: 'OPEN',
    },
  ]);
  assert.equal(
    claim.requiredAssertions.profileOverrideDeclarations
      - claim.requiredAssertions.staticallyResolvedSurfaceProfileApplications,
    claim.authority.declaredNotApplied.length,
  );
  assert.deepEqual([...claim.productionConsumers].sort(), claim.productionConsumers);
  assert.deepEqual([...new Set(claim.productionConsumers)], claim.productionConsumers);
  assert.deepEqual(claim.definitionFiles, [
    'src/ui/structures/foundation/chrome/contracts/index.ts',
    'src/ui/structures/foundation/chrome/runtime/profile-defaults/overrides/index.ts',
    'src/ui/surfaces/foundation/contracts/index.ts',
    'src/ui/surfaces/index.ts',
  ]);
  // A phantom or dropped roster entry is rejected against the live tree.
  for (const consumer of claim.productionConsumers) {
    assert.ok(existsSync(join(HERE, '..', consumer)), `phantom claim-floor consumer: ${consumer}`);
  }
});
