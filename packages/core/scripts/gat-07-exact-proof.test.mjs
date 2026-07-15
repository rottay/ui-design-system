import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
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
  discoverStaleTypescriptFiles,
  evaluateDataPartUnresolved,
  evaluateClaimFloor,
  projectGat07RegistryDefinition,
} from './gat-07-exact-proof.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const AUDIT = join(HERE, 'engine-token-audit.mjs');
const CLAIM_FLOOR = join(HERE, 'gat-07-public-claim-floor.json');
const REGISTRY = join(HERE, '../../../roadmap/registry.json');

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
      path: '/repo/src/contracts/extensions/index.ts',
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
      text: `import { ExtensionHelpers as Helpers } from '../contracts/extensions'; export const implementation = Helpers;`,
    },
    {
      path: '/repo/src/components/surfaces/foundation/hooks/useSurfaceProfileDefaultsWithOverrides.ts',
      kind: 'core',
      text: `export function useSurfaceProfileDefaultsWithOverrides(value: unknown) { return value; } export const selfProbe = () => useSurfaceProfileDefaultsWithOverrides({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/demo.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useOverrides } from '../foundation/hooks/useSurfaceProfileDefaultsWithOverrides'; export const Demo = () => useOverrides({});`,
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
  assert.equal(claimFacts['surface-profile-overrides'].staticallyResolvedSurfaceHookCalls, 2);
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
  const hookPath = '/repo/src/components/surfaces/foundation/hooks/useSurfaceProfileDefaultsWithOverrides.ts';
  const records = [
    {
      path: hookPath,
      kind: 'core',
      text: `export function useSurfaceProfileDefaultsWithOverrides(value: unknown) { return value; }`,
    },
    {
      path: '/repo/src/components/surfaces/foundation/types.ts',
      kind: 'core',
      text: `export interface SurfaceVisualOverrides { density?: string } export interface VisualOptions { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      path: '/repo/src/components/surfaces/foundation/hooks/named.ts',
      kind: 'core',
      text: `export { useSurfaceProfileDefaultsWithOverrides as useProfile } from './useSurfaceProfileDefaultsWithOverrides';`,
    },
    {
      path: '/repo/src/components/surfaces/foundation/hooks/default.ts',
      kind: 'core',
      text: `export { useSurfaceProfileDefaultsWithOverrides as default } from './useSurfaceProfileDefaultsWithOverrides';`,
    },
    {
      path: '/repo/src/components/surfaces/foundation/hooks/star.ts',
      kind: 'core',
      text: `export * from './useSurfaceProfileDefaultsWithOverrides';`,
    },
    {
      path: '/repo/src/components/surfaces/pages/named.tsx', kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as invoke } from '../foundation/hooks/useSurfaceProfileDefaultsWithOverrides'; export const Demo = () => invoke({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/default.tsx', kind: 'core',
      text: `import invoke from '../foundation/hooks/default'; export const Demo = () => invoke({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/namespace.tsx', kind: 'core',
      text: `import * as Hooks from '../foundation/hooks/useSurfaceProfileDefaultsWithOverrides'; export const Demo = () => Hooks.useSurfaceProfileDefaultsWithOverrides({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/reexport.tsx', kind: 'core',
      text: `import { useProfile } from '../foundation/hooks/named'; export const Demo = () => useProfile({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/star.tsx', kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as invoke } from '../foundation/hooks/star'; export const Demo = () => invoke({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/scope-shadow.tsx', kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as invoke } from '../foundation/hooks/useSurfaceProfileDefaultsWithOverrides'; export const outer = () => invoke({}); export function inner() { const invoke = () => null; return invoke(); }`,
    },
  ];
  const facts = analyzeClaimSourceRecords(records)['surface-profile-overrides'];
  assert.equal(facts.staticallyResolvedSurfaceHookCalls, 6);
  assert.equal(facts.staticallyResolvedPotentialConsumers, 6);
  assert.equal(facts.unsupportedGovernedReferences, 0);
  assert.equal(facts.registeredExecutableEvidence, 0);
  assert.deepEqual(facts.staticallyResolvedSurfaceHookCallFiles, [
    '/repo/src/components/surfaces/pages/default.tsx',
    '/repo/src/components/surfaces/pages/named.tsx',
    '/repo/src/components/surfaces/pages/namespace.tsx',
    '/repo/src/components/surfaces/pages/reexport.tsx',
    '/repo/src/components/surfaces/pages/scope-shadow.tsx',
    '/repo/src/components/surfaces/pages/star.tsx',
  ]);
});

test('G2 claim census keeps opaque transports and computed access out of direct evidence', () => {
  const records = [
    {
      path: '/repo/src/contracts/extensions/index.ts',
      kind: 'core',
      text: `export interface ComponentExtensions { slot?: unknown } export interface ExtensionHelpers<T> { resolve(value: T): T }`,
    },
    {
      path: '/repo/src/contracts/engine/index.ts',
      kind: 'core',
      text: `import type { ComponentExtensions } from '../extensions'; export interface EngineAwareProps { extensions?: ComponentExtensions }`,
    },
    {
      path: '/repo/src/components/surfaces/foundation/types.ts',
      kind: 'core',
      text: `export interface SurfaceVisualOverrides { density?: string } export interface VisualOptions { profileOverrides?: SurfaceVisualOverrides }`,
    },
    {
      path: '/repo/src/components/surfaces/foundation/hooks/useSurfaceProfileDefaultsWithOverrides.ts',
      kind: 'core',
      text: `export function useSurfaceProfileDefaultsWithOverrides(value: unknown) { return value; } export const selfProbe = () => useSurfaceProfileDefaultsWithOverrides({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/direct.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useProfile } from '../foundation/hooks/useSurfaceProfileDefaultsWithOverrides'; export const Demo = () => useProfile({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/container.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useProfile } from '../foundation/hooks/useSurfaceProfileDefaultsWithOverrides'; const hooks = [useProfile]; export const Demo = () => hooks[0]({});`,
    },
    {
      path: '/repo/src/components/surfaces/pages/helper.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useProfile } from '../foundation/hooks/useSurfaceProfileDefaultsWithOverrides'; const forward = (value: unknown) => value; export const opaque = forward(useProfile);`,
    },
    {
      path: '/repo/src/components/surfaces/pages/wrappers.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as useProfile } from '../foundation/hooks/useSurfaceProfileDefaultsWithOverrides'; export const opaque = [useProfile.call(null, {}), Reflect.apply(useProfile, null, [{}]), useProfile.bind(null)];`,
    },
    {
      path: '/repo/src/runtime/extensions-direct.ts',
      kind: 'core',
      text: `
        import type { EngineAwareProps } from '../contracts/engine';
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
      text: `import type { EngineAwareProps } from '../contracts/engine'; type Selected = Pick<EngineAwareProps, 'extensions'>; export const read = (props: Selected) => props.extensions;`,
    },
    {
      path: '/repo/src/runtime/extensions-computed.ts',
      kind: 'core',
      text: `export const read = (props: any) => [props['extensions'], Reflect.get(props, 'extensions')];`,
    },
    {
      path: '/repo/src/components/surfaces/pages/name-only-fakes.tsx',
      kind: 'core',
      text: `import { useSurfaceProfileDefaultsWithOverrides as external } from 'untracked-package'; const fake = { useSurfaceProfileDefaultsWithOverrides() {} }; export const Demo = () => [external({}), fake.useSurfaceProfileDefaultsWithOverrides()];`,
    },
    {
      path: '/repo/packages/showroom/src/profile.tsx',
      kind: 'showroom',
      text: `import type { VisualOptions } from '../../../src/components/surfaces/foundation/types'; export const read = (visual: VisualOptions) => visual.profileOverrides; const fake = { profileOverrides: true }; export const ignored = fake.profileOverrides;`,
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
  assert.equal(surfaces.staticallyResolvedSurfaceHookCalls, 2);
  assert.equal(surfaces.staticallyResolvedShowroomProfileOverrideReferences, 1);
  assert.equal(surfaces.staticallyResolvedPotentialConsumers, 6);
  assert.equal(surfaces.unsupportedGovernedReferences, 5);
  assert.deepEqual(surfaces.staticallyResolvedSurfaceHookCallFiles, [
    '/repo/src/components/surfaces/foundation/hooks/useSurfaceProfileDefaultsWithOverrides.ts',
    '/repo/src/components/surfaces/pages/direct.tsx',
  ]);
  assert.equal(surfaces.potentialConsumers.some(({ path }) => path.endsWith('name-only-fakes.tsx')), false);
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
  const result = collectDataPartStampsFromText(`
    import { Box, Text } from '../primitives';
    import React from 'react';
    import type { Box as TypeBox } from '../primitives';
    import { Box as ExternalBox } from '/evil/src/components/primitives';
    import { stampDataPart } from '../../runtime/data-part';
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
        <Text data-part="text" />
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
  `, '/repo/src/components/structures/demo.tsx');
  assert.deepEqual([...new Set(result.stamps.map(({ part }) => part))].sort(), [
    'box', 'helper', 'one', 'root', 'text', 'two',
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
  `, '/repo/src/components/structures/unrelated.tsx');
  assert.deepEqual(unrelatedSpread.unresolved, []);
  assert.equal(evaluateDataPartUnresolved(unrelatedSpread.unresolved).ok, true);
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
    'surface-profile-overrides': '<!-- GAT07-CLAIM surface-profile-overrides: reserved-experimental; runtime=isolated-helper-unconsumed-by-surfaces; affirmative-behavior=false; owner=DS-IMP-022 -->',
  };
  const templates = {
    'component-extensions': 'GAT07-CONTRACT component-extensions: symbols=[ComponentExtensions, ExtensionHelpers, EngineAwareProps.extensions]; disposition=reserved-deprecated; runtime-status=unimplemented; affirmative-behavior=false; production-consumers=0; executable-assertions=0; owner=design-system-program/DS-IMP-021; target-phase=2A.',
    'surface-profile-overrides': 'GAT07-CONTRACT surface-profile-overrides: symbols=[SurfaceVisualOverrides, useSurfaceProfileDefaultsWithOverrides, visual.profileOverrides]; disposition=reserved-experimental; runtime-status=isolated-helper-unconsumed-by-surfaces; affirmative-behavior=false; production-consumers=0; executable-assertions=0; owner=design-system-program/DS-IMP-022; target-phase=2A.',
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

test('G3 public claim floor is exact and rejects invented authority, assertions, or families', () => {
  const floor = JSON.parse(readFileSync(CLAIM_FLOOR, 'utf8'));

  assert.equal(evaluateClaimFloor(floor).ok, true);

  const mutations = [
    (candidate) => { candidate.claims[0].runtimeStatus = 'implemented'; },
    (candidate) => { candidate.claims[1].affirmativeBehaviorClaimAllowed = true; },
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
    cwd: join(HERE, '../../..'),
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
          { cwd: join(HERE, '../../..'), encoding: 'utf8', timeout: 120_000 },
        );
        const output = `${result.stdout}\n${result.stderr}`;
        assert.equal(result.status, 1, output);
        assert.match(output, /WO-GAT-07 evasion fixture result/);
        assert.match(
          output,
          /arc09\.inlinePaint\.primitives\/display\/Table\/engines\/modern\.tsx|embeddedCssPaint\.primitives\/display\/Table\/engines\/modern\.tsx/,
        );
      });
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
