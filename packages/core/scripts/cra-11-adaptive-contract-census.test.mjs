import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';
import {
  buildCra11Census,
  serializeCra11Census,
  stringLiteralContentSpan,
} from './lib/cra-11-adaptive-contract-census.mjs';

const TSCONFIG = `${JSON.stringify({
  compilerOptions: {
    target: 'ES2020',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    strict: true,
    noEmit: true,
  },
  include: ['src'],
}, null, 2)}\n`;

async function put(root, relative, source) {
  const absolute = path.join(root, relative);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, source);
  return absolute;
}

async function fixtureWorkspace() {
  const workspaceRoot = await mkdtemp(path.join(tmpdir(), 'rottay-cra11-'));
  const designSystemRoot = path.join(workspaceRoot, 'ui-design-system');
  const coreRoot = path.join(designSystemRoot, 'packages/core');
  for (const root of [
    coreRoot,
    path.join(workspaceRoot, 'app-bithire'),
    path.join(workspaceRoot, 'app-platform'),
    path.join(workspaceRoot, 'app-evnto'),
  ]) {
    await put(root, 'tsconfig.json', TSCONFIG);
    await mkdir(path.join(root, 'src'), { recursive: true });
  }

  await put(coreRoot, 'src/ui/surfaces/foundation/contracts/index.ts', `
    export interface DemoMobileConfig {
      active?: boolean;
      dead?: boolean;
      'quotedMobile'?: boolean;
    }
    export interface VisualConfig { stackOnMobile?: boolean; }
    export interface TransportMobileVisualConfig {
      stackOnMobile?: boolean;
      stackOnTablet?: boolean;
      inertMobile?: boolean;
      nestedMobile?: { enabled?: boolean; href?: string };
    }
    export interface SectionMobileConfig {
      hideOnMobile?: boolean;
      mobilePriority?: number;
      mobileSpan?: number;
      inert?: boolean;
    }
  `);
  await put(coreRoot, 'src/ui/surfaces/foundation/contracts/adaptive/index.ts', `
    export interface SurfacePosture { collection?: 'table' | 'cards'; custom?: Record<string, unknown>; }
    export interface AdaptiveConfig { desktop?: SurfacePosture; tablet?: SurfacePosture; phone?: SurfacePosture; }
  `);
  await put(coreRoot, 'src/ui/surfaces/presentation/renderer.ts', `
    import type { DemoMobileConfig, SectionMobileConfig, TransportMobileVisualConfig, VisualConfig } from '../foundation/contracts';
    import type { AdaptiveConfig } from '../foundation/contracts/adaptive';
    import { forwardResponsiveVisual } from '../runtime/responsive-transport';
    export function render(config: DemoMobileConfig, visual: VisualConfig, adaptive: AdaptiveConfig) {
      return config.active && visual['stackOnMobile'] ? adaptive.phone : undefined;
    }
    export function renderTransport(config: TransportMobileVisualConfig) {
      return forwardResponsiveVisual(config);
    }
    export function renderSections(sections: SectionMobileConfig[]) {
      return sections
        .filter((section) => !section.hideOnMobile)
        .sort((left, right) => (left.mobilePriority ?? 0) - (right.mobilePriority ?? 0))
        .map((section) => section.mobileSpan);
    }
  `);
  await put(coreRoot, 'src/ui/surfaces/runtime/responsive-transport.ts', `
    interface ResponsiveTransport {
      stackOnMobile?: boolean;
      stackOnTablet?: boolean;
      nestedMobile?: { enabled?: boolean; href?: string };
    }
    function consumeResponsiveVisual(input?: ResponsiveTransport) {
      const alias = input;
      const { stackOnMobile } = alias ?? {};
      return Boolean(stackOnMobile || alias?.stackOnTablet || alias?.nestedMobile?.href);
    }
    export function forwardResponsiveVisual(input?: ResponsiveTransport) {
      const forwarded = input;
      return consumeResponsiveVisual(forwarded);
    }
  `);
  await put(coreRoot, 'src/ui/surfaces/runtime/builders/index.ts', `
    import type { DemoMobileConfig, VisualConfig } from '../../foundation/contracts';
    import type { AdaptiveConfig } from '../../foundation/contracts/adaptive';
    export const demo: DemoMobileConfig = { dead: true };
    export const visual: VisualConfig = { stackOnMobile: true };
    export const adaptive: AdaptiveConfig = { tablet: { collection: 'cards' } };
    export function createLiveConfig() { return {}; }
    export function createDeadConfig() { return {}; }
    export function createLeafConfig() { return {}; }
    export function createChainConfig() { return createLeafConfig(); }
    const build = () => ({});
    export { build as createIndirectConfig };
  `);
  await put(coreRoot, 'src/ui/surfaces/tests/renderer.test.ts', `
    import type { DemoMobileConfig } from '../foundation/contracts';
    export const observe = (config: DemoMobileConfig) => config.dead;
  `);

  const bitHire = path.join(workspaceRoot, 'app-bithire');
  await put(bitHire, 'src/config.ts', `
    export function createAppLiveConfig() { return {}; }
    export function createAppDeadConfig() { return {}; }
  `);
  await put(bitHire, 'src/barrel.ts', `
    export { createAppLiveConfig } from './config';
  `);
  await put(bitHire, 'src/screen.ts', `
    import { createLiveConfig as makeLive } from '@rottay/design-system';
    import { createAppLiveConfig as makeApp } from './barrel';
    export type LiveInput = Parameters<typeof makeLive>[0];
    makeLive();
    makeApp();
  `);
  await put(bitHire, 'src/config.test.ts', `
    import { createAppDeadConfig } from './config';
    createAppDeadConfig();
  `);

  const platform = path.join(workspaceRoot, 'app-platform');
  await put(platform, 'src/screen.ts', `
    import * as DS from '@rottay/design-system';
    DS['createChainConfig']();
  `);

  const evnto = path.join(workspaceRoot, 'app-evnto');
  await put(evnto, 'src/screen.ts', `
    import { createIndirectConfig as build } from '@rottay/design-system';
    build();
  `);

  return { workspaceRoot, designSystemRoot, coreRoot, platform };
}

test('StringLiteral offsets exclude quotes exactly', () => {
  const source = ts.createSourceFile('fixture.ts', `const value = { 'mobile-field': true };`, ts.ScriptTarget.Latest, true);
  let literal;
  function visit(node) {
    if (ts.isStringLiteralLike(node)) literal = node;
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(literal);
  const span = stringLiteralContentSpan(source, literal);
  assert.equal(source.text.slice(span.start, span.end), 'mobile-field');
  assert.equal(span.start, literal.getStart(source) + 1);
  assert.equal(span.end, literal.getEnd() - 1);
});

test('adaptive inventory separates productive reads, defaults, tests and type-only fields', async () => {
  const fixture = await fixtureWorkspace();
  try {
    const census = await buildCra11Census(fixture);
    const byId = new Map(census.adaptiveContract.fields.map((field) => [field.id, field]));

    assert.equal(byId.get('DemoMobileConfig.active').productiveConsumers.length, 1);
    assert.equal(byId.get('VisualConfig.stackOnMobile').productiveConsumers.length, 1);
    assert.equal(byId.get('VisualConfig.stackOnMobile').builderDefaults.length, 1);
    assert.equal(byId.get('DemoMobileConfig.dead').testOnly.length, 1);
    assert.equal(byId.get('DemoMobileConfig.dead').builderDefaults.length, 1);
    assert.equal(byId.get('DemoMobileConfig.dead').status, 'type-only');
    assert.equal(byId.get('AdaptiveConfig.phone').productiveConsumers.length, 1);
    assert.equal(byId.get('AdaptiveConfig.tablet').builderDefaults.length, 1);
    assert.equal(byId.get('AdaptiveConfig.tablet').status, 'type-only');
    assert.equal(byId.get('TransportMobileVisualConfig.stackOnMobile').status, 'productive-consumer');
    assert.equal(byId.get('TransportMobileVisualConfig.stackOnTablet').status, 'productive-consumer');
    assert.equal(byId.get('TransportMobileVisualConfig.nestedMobile').status, 'productive-consumer');
    assert.equal(byId.get('TransportMobileVisualConfig.nestedMobile.href').status, 'productive-consumer');
    assert.equal(byId.get('TransportMobileVisualConfig.nestedMobile.enabled').status, 'type-only');
    assert.equal(byId.get('TransportMobileVisualConfig.inertMobile').status, 'type-only');
    assert.ok(byId.get('TransportMobileVisualConfig.stackOnMobile').productiveConsumers.some((site) =>
      site.role === 'transport-read'
    ));
    assert.equal(byId.get('SectionMobileConfig.hideOnMobile').status, 'productive-consumer');
    assert.equal(byId.get('SectionMobileConfig.mobilePriority').status, 'productive-consumer');
    assert.equal(byId.get('SectionMobileConfig.mobileSpan').status, 'productive-consumer');
    assert.equal(byId.get('SectionMobileConfig.inert').status, 'type-only');
    assert.equal(byId.get('DemoMobileConfig.quotedMobile').declaration.offsetEnd
      - byId.get('DemoMobileConfig.quotedMobile').declaration.offsetStart, 'quotedMobile'.length);
    assert.equal(census.analysisErrors.length, 0);
  } finally {
    await rm(fixture.workspaceRoot, { recursive: true, force: true });
  }
});

test('factory inventory follows aliases, namespace literals and live factory chains without test false positives', async () => {
  const fixture = await fixtureWorkspace();
  try {
    const census = await buildCra11Census(fixture);
    const byName = new Map(census.configFactories.factories.map((factory) => [
      `${factory.repository}:${factory.name}`,
      factory,
    ]));

    assert.equal(byName.get('ui-design-system:createLiveConfig').status, 'live');
    assert.equal(byName.get('ui-design-system:createIndirectConfig').status, 'live');
    assert.equal(byName.get('ui-design-system:createChainConfig').status, 'live');
    assert.equal(byName.get('ui-design-system:createLeafConfig').status, 'live');
    assert.equal(byName.get('ui-design-system:createLeafConfig').productiveCallers.length, 0);
    assert.equal(byName.get('ui-design-system:createLeafConfig').factoryCallers.length, 1);
    assert.equal(byName.get('ui-design-system:createDeadConfig').status, 'dead');
    assert.equal(byName.get('app-bithire:createAppLiveConfig').status, 'live');
    assert.equal(byName.get('app-bithire:createAppDeadConfig').status, 'dead');
    assert.ok(census.configFactories.deadFactories.some((id) => id.endsWith(':createDeadConfig')));
    assert.ok(census.configFactories.deadFactories.some((id) => id.endsWith(':createAppDeadConfig')));
  } finally {
    await rm(fixture.workspaceRoot, { recursive: true, force: true });
  }
});

test('census is deterministic, changes on source mutation and fails closed on opaque namespace calls', async () => {
  const fixture = await fixtureWorkspace();
  try {
    const first = serializeCra11Census(await buildCra11Census(fixture));
    const second = serializeCra11Census(await buildCra11Census(fixture));
    assert.equal(first, second);

    const sourcePath = path.join(fixture.platform, 'src/screen.ts');
    const original = await readFile(sourcePath, 'utf8');
    await writeFile(sourcePath, `${original}\nconst key = 'createDeadConfig';\nDS[key]();\n`);
    const mutated = await buildCra11Census(fixture);
    assert.notEqual(serializeCra11Census(mutated), first);
    assert.deepEqual(mutated.analysisErrors.map((error) => error.code), ['opaque-factory-namespace-call']);
    assert.equal(mutated.acceptance.zeroAnalysisErrors, false);
  } finally {
    await rm(fixture.workspaceRoot, { recursive: true, force: true });
  }
});

test('duplicate public adaptive field identities fail closed instead of merging evidence', async () => {
  const fixture = await fixtureWorkspace();
  try {
    const contract = path.join(fixture.coreRoot, 'src/ui/surfaces/foundation/contracts/index.ts');
    const original = await readFile(contract, 'utf8');
    await writeFile(contract, `${original}\nexport interface DemoMobileConfig { active?: boolean; }\n`);
    const census = await buildCra11Census(fixture);
    assert.ok(census.analysisErrors.some((error) =>
      error.code === 'duplicate-adaptive-field-id'
      && error.detail.startsWith('DemoMobileConfig.active ')
    ));
  } finally {
    await rm(fixture.workspaceRoot, { recursive: true, force: true });
  }
});

test('computed adaptive field access fails closed instead of claiming a renderer', async () => {
  const fixture = await fixtureWorkspace();
  try {
    const renderer = path.join(fixture.coreRoot, 'src/ui/surfaces/presentation/renderer.ts');
    const original = await readFile(renderer, 'utf8');
    await writeFile(renderer, `${original}\nexport const opaque = (config: import('../foundation/contracts').DemoMobileConfig, key: keyof import('../foundation/contracts').DemoMobileConfig) => config[key];\n`);
    const census = await buildCra11Census(fixture);
    assert.ok(census.analysisErrors.some((error) => error.code === 'opaque-adaptive-field-access'));
  } finally {
    await rm(fixture.workspaceRoot, { recursive: true, force: true });
  }
});

test('factory values transported through opaque objects fail closed', async () => {
  const fixture = await fixtureWorkspace();
  try {
    const sourcePath = path.join(fixture.platform, 'src/screen.ts');
    const original = await readFile(sourcePath, 'utf8');
    await writeFile(sourcePath, `${original}\nconst registry = { build: DS.createDeadConfig };\nregistry.build();\n`);
    const census = await buildCra11Census(fixture);
    assert.ok(census.analysisErrors.some((error) =>
      error.code === 'opaque-factory-reference'
      && error.detail.includes('createDeadConfig')
    ));
  } finally {
    await rm(fixture.workspaceRoot, { recursive: true, force: true });
  }
});
