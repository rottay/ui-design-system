/**
 * The gate's own drill: each forbidden shape is PLANTED in a fixture tree and
 * must be found. A gate that cannot be reddened is not measuring anything.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

import { PRIMARY_ENGINE_OWNER, auditEngineWiring } from './index.mjs';

/** A tree that satisfies every rule, so a plant is the only difference. */
const CLEAN = {
  [PRIMARY_ENGINE_OWNER]: "export const PRIMARY_ENGINE = 'modern';\n",
  'src/app/compile/index.ts':
    "import { compileTheme, resolveAdapter } from 'x';\nexport const run = () => compileTheme(r, resolveAdapter(e));\n",
  'src/components/widget/index.ts':
    "export const Widget = createEngineComponent<Props>('Widget', {\n" +
    "    classic: () => import('./engines/classic'),\n" +
    "    modern: () => import('./engines/modern'),\n" +
    "    rustic: () => import('./engines/rustic'),\n  }\n);\n",
};

function fixture(overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'engine-wiring-'));
  for (const [path, body] of Object.entries({ ...CLEAN, ...overrides })) {
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, body);
  }
  return root;
}

function rules(root) {
  const report = auditEngineWiring(root);
  rmSync(root, { recursive: true, force: true });
  return report.findings.map((finding) => finding.rule);
}

test('a clean tree reports nothing', () => {
  assert.deepEqual(rules(fixture()), []);
});

test('a hardcoded adapter is caught', () => {
  const found = rules(
    fixture({
      'src/app/compile/index.ts':
        "import { compileTheme, resolveAdapter, THEME_ENGINE_ADAPTERS } from 'x';\n" +
        'export const run = () => compileTheme(r, THEME_ENGINE_ADAPTERS.modern);\n',
    })
  );
  assert.ok(found.includes('adapter-literal'));
});

test('a compile door that resolves no adapter is caught', () => {
  const found = rules(
    fixture({
      'src/app/compile/index.ts':
        "import { compileTheme } from 'x';\nexport const run = () => compileTheme(r, adapter);\n",
    })
  );
  assert.ok(found.includes('compile-door-resolves'));
});

for (const symbol of [
  'FALLBACK_ENGINE',
  'getDefaultEngine',
  'fallbackEngine',
  'warnOnFallback',
  'ENGINE_TOKENS',
  'getEngineTokens',
]) {
  test(`the retired symbol ${symbol} is caught`, () => {
    const found = rules(
      fixture({ 'src/app/legacy/index.ts': `export const value = ${symbol};\n` })
    );
    assert.ok(found.includes('retired-symbol'));
  });
}

test('a seventh owner of the engine token baseline is caught', () => {
  const found = rules(
    fixture({
      'src/app/tokens/index.ts':
        "import type { EngineTokenOverrides } from 'x';\nexport const row: EngineTokenOverrides = {};\n",
    })
  );
  assert.ok(found.includes('token-baseline-owner'));
});

test('a declared owner may name the baseline', () => {
  const found = rules(
    fixture({
      'src/foundation/contracts/kernel/tokens/engine-tokens/index.ts':
        'export interface EngineTokenOverrides { densityScale: number }\n',
    })
  );
  assert.deepEqual(found, []);
});

test('a reinstated loader fallback is caught', () => {
  const found = rules(
    fixture({
      'src/app/factory/index.ts': 'const loader = loaders.custom || loaders.rustic;\n',
    })
  );
  assert.ok(found.includes('fallback-shape'));
});

test('a reinstated engine-token fallback is caught', () => {
  const found = rules(
    fixture({ 'src/app/tokens/index.ts': 'export const row = ENGINE_TOKENS[e] || CLASSIC_TOKENS;\n' })
  );
  assert.ok(found.includes('fallback-shape'));
});

test('a reinstated adapter fallback is caught', () => {
  const found = rules(
    fixture({
      'src/app/adapter/index.ts':
        "import { resolveAdapter } from 'x';\nexport const a = registry[e] ?? THEME_ENGINE_ADAPTERS.modern;\n",
    })
  );
  assert.ok(found.includes('fallback-shape'));
});

test('a forwarding engine loader is caught', () => {
  const found = rules(
    fixture({
      'src/components/widget/index.ts':
        "export const Widget = createEngineComponent<Props>('Widget', {\n" +
        "    classic: () => import('./engines/classic'),\n" +
        "    modern: () => import('./engines/modern'),\n" +
        "    rustic: () => import('./engines/classic'),\n  }\n);\n",
    })
  );
  assert.ok(found.includes('forwarding-engine'));
});

test('a loader record that omits an engine is caught', () => {
  const found = rules(
    fixture({
      'src/components/widget/index.ts':
        "export const Widget = createEngineComponent<Props>('Widget', {\n" +
        "    classic: () => import('./engines/classic'),\n" +
        "    modern: () => import('./engines/modern'),\n  }\n);\n",
    })
  );
  assert.ok(found.includes('loader-totality'));
});

test('a declared absence is legal, and is not a forwarding engine', () => {
  const found = rules(
    fixture({
      'src/components/widget/index.ts':
        "export const Widget = createEngineComponent<Props>('Widget', {\n" +
        "    classic: () => import('./engines/classic'),\n" +
        "    modern: () => import('./engines/modern'),\n" +
        '    rustic: null,\n  }\n);\n',
    })
  );
  assert.deepEqual(found, []);
});

test('a second primary-engine declaration is caught', () => {
  const found = rules(
    fixture({ 'src/app/second/index.ts': "export const PRIMARY_ENGINE = 'classic';\n" })
  );
  assert.ok(found.includes('second-primary'));
});

test('deleting the only primary-engine declaration is caught', () => {
  const root = mkdtempSync(join(tmpdir(), 'engine-wiring-'));
  for (const [path, body] of Object.entries(CLEAN)) {
    if (path === PRIMARY_ENGINE_OWNER) continue;
    const file = join(root, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, body);
  }
  const found = auditEngineWiring(root).findings.map((finding) => finding.rule);
  rmSync(root, { recursive: true, force: true });
  assert.ok(found.includes('second-primary'));
});
