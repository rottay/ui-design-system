/**
 * The gate's own drill: each forbidden shape is PLANTED in a fixture tree and
 * must be found. A gate that cannot be reddened is not measuring anything.
 */
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import {
  CEREMONIAL_ENGINE_CENSUS,
  PRIMARY_ENGINE_OWNER,
  PRIMARY_ENGINE_READERS,
  auditEngineWiring,
  collectCeremonialEngineOwners,
  normalizeEngineImplementation,
} from './index.mjs';

const CORE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');

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

function rules(root, options = { ceremonialCensus: {} }) {
  const report = auditEngineWiring(root, options);
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

/* -------------------------------------------------------------------------- */
/* C4 · the roster engine has one law, and PRIMARY_ENGINE is not it            */
/* -------------------------------------------------------------------------- */

test('a reinstated roster engine fallback is caught', () => {
  const found = rules(
    fixture({
      'src/components/preview/index.ts':
        "import { getFirstPartyVertical } from 'x';\n" +
        'export const engine = getFirstPartyVertical(slug)?.engine ?? PRIMARY_ENGINE;\n',
    })
  );
  assert.ok(found.includes('fallback-shape'));
  assert.ok(found.includes('primary-engine-read'));
});

test('the `||` spelling of the same fallback is caught', () => {
  const found = rules(
    fixture({
      'src/components/preview/index.ts':
        'export const engine = rosterEngine(slug) || PRIMARY_ENGINE;\n',
    })
  );
  assert.ok(found.includes('fallback-shape'));
});

test('a bare PRIMARY_ENGINE read outside the resolver is caught', () => {
  const found = rules(
    fixture({ 'src/components/preview/index.ts': 'export const e = PRIMARY_ENGINE;\n' })
  );
  assert.ok(found.includes('primary-engine-read'));
});

test('the declared readers may read it, so the rule is not refusing everything', () => {
  const overrides = {};
  for (const reader of PRIMARY_ENGINE_READERS) {
    if (reader === PRIMARY_ENGINE_OWNER) continue;
    overrides[reader] = 'export const e = PRIMARY_ENGINE;\n';
  }
  assert.deepEqual(
    rules(fixture(overrides)).filter((rule) => rule === 'primary-engine-read'),
    []
  );
});

test('PRIMARY_ENGINE named only in a comment is not a read', () => {
  const found = rules(
    fixture({
      'src/components/preview/index.ts':
        '// falls back to PRIMARY_ENGINE\n/* PRIMARY_ENGINE */\nexport const e = 1;\n',
    })
  );
  assert.ok(!found.includes('primary-engine-read'));
});

/* -------------------------------------------------------------------------- */
/* WO-CAN-06 · one roster, one custom path, no forwarding by re-export         */
/* -------------------------------------------------------------------------- */

test('a second roster written as a type union is caught', () => {
  const found = rules(
    fixture({
      'src/components/widget/contracts/index.ts':
        "export interface P { engine?: 'classic' | 'modern' | 'rustic' }\n",
    })
  );
  assert.ok(found.includes('roster-union'));
});

test('a second roster written as an array is caught', () => {
  const found = rules(
    fixture({
      'src/app/roster/index.ts': "export const ENGINES = ['classic', 'modern', 'rustic'];\n",
    })
  );
  assert.ok(found.includes('roster-array'));
});

test('a second roster written as a comparison chain is caught', () => {
  const found = rules(
    fixture({
      'src/app/guard/index.ts':
        "export const ok = (v) => v === 'classic' || v === 'modern' || v === 'rustic';\n",
    })
  );
  assert.ok(found.includes('roster-comparison'));
});

test('the identity contract may enumerate the roster; nobody else may', () => {
  const found = rules(
    fixture({
      [PRIMARY_ENGINE_OWNER]:
        "export const ENGINE_NAMES = ['classic', 'modern', 'rustic', 'custom'] as const;\n" +
        "export const PRIMARY_ENGINE = 'modern';\n",
    })
  );
  assert.deepEqual(found, []);
});

test('naming ONE engine is not a roster', () => {
  const found = rules(
    fixture({ 'src/app/one/index.ts': "export const e = 'modern';\n" })
  );
  assert.deepEqual(found, []);
});

test('a custom branch that returns a shipped engine is caught', () => {
  const found = rules(
    fixture({
      'src/components/toast/index.ts':
        'export function resolve(engine) {\n' +
        "  if (engine === 'custom') {\n" +
        '    return classicEngine;\n' +
        '  }\n' +
        '  return engines[engine];\n' +
        '}\n',
    })
  );
  assert.ok(found.includes('custom-degradation'));
});

test('a custom branch that refuses by name is legal', () => {
  const found = rules(
    fixture({
      'src/components/toast/index.ts':
        'export function resolve(engine) {\n' +
        '  if (engine === EXTENSION_ENGINE) {\n' +
        "    throw new Error('Toast has no custom implementation.');\n" +
        '  }\n' +
        '  return engines[engine];\n' +
        '}\n',
    })
  );
  assert.deepEqual(found, []);
});

test('a custom branch that resolves a registered pack is legal', () => {
  const found = rules(
    fixture({
      'src/components/toast/index.ts':
        'export function resolve(engine, pack) {\n' +
        '  if (engine === EXTENSION_ENGINE) {\n' +
        '    return getCustomComponent(name, pack);\n' +
        '  }\n' +
        '  return engines[engine];\n' +
        '}\n',
    })
  );
  assert.deepEqual(found, []);
});

test('a rustic engine file that re-exports classic is caught', () => {
  const found = rules(
    fixture({
      'src/components/widget/engines/rustic/index.tsx': "export { default } from '../classic';\n",
    })
  );
  assert.ok(found.includes('forwarding-engine'));
});

test('a deep relative specifier does not dodge the forwarding rule', () => {
  const found = rules(
    fixture({
      'src/components/widget/engines/rustic/index.tsx':
        "export * from '../../../other/engines/classic';\n",
    })
  );
  assert.ok(found.includes('forwarding-engine'));
});

test('an engine file re-exporting its OWN engine is not forwarding', () => {
  const found = rules(
    fixture({
      'src/components/widget/engines/rustic/index.tsx':
        "export { default } from './rustic/inner';\n",
    })
  );
  assert.deepEqual(found, []);
});

test('a deep relative loader specifier does not dodge the forwarding rule', () => {
  const found = rules(
    fixture({
      'src/components/widget/index.ts':
        "export const Widget = createEngineComponent<Props>('Widget', {\n" +
        "    classic: () => import('./engines/classic'),\n" +
        "    modern: () => import('./engines/modern'),\n" +
        "    rustic: () => import('../shared/engines/classic'),\n  }\n);\n",
    })
  );
  assert.ok(found.includes('forwarding-engine'));
});

test('a sync implementation record that omits an engine is caught', () => {
  const found = rules(
    fixture({
      'src/components/text/index.tsx':
        'const TextImplementations = {\n' +
        '    classic: ClassicText,\n' +
        '    modern: ModernText,\n  }\n;\n' +
        "export const Text = createSyncEngineComponent<TextProps>('Text', TextImplementations);\n",
    })
  );
  assert.ok(found.includes('sync-loader-totality'));
});

test('a total sync implementation record is legal', () => {
  const found = rules(
    fixture({
      'src/components/text/index.tsx':
        'const TextImplementations = {\n' +
        '    classic: ClassicText,\n' +
        '    modern: ModernText,\n' +
        '    rustic: RusticText,\n  }\n;\n' +
        "export const Text = createSyncEngineComponent<TextProps>('Text', TextImplementations);\n",
    })
  );
  assert.deepEqual(found, []);
});

/* ------------------------------------------------------------------------- *
 * ceremonial-engine (F-79): three structurally identical implementations.
 * ------------------------------------------------------------------------- */

/** Three engine files that render the same tree, differing only in their name. */
function ceremonialTrio(owner, body = "export { default } from '../../runtime/rendering';\n") {
  return {
    [`${owner}/engines/classic/index.tsx`]: body.replace('<E>', 'Classic'),
    [`${owner}/engines/modern/index.tsx`]: body.replace('<E>', 'Modern'),
    [`${owner}/engines/rustic/index.tsx`]: body.replace('<E>', 'Rustic'),
  };
}

test('an uncensused identical engine trio is caught', () => {
  const found = rules(fixture(ceremonialTrio('src/components/structures/ceremony')));
  assert.ok(found.includes('ceremonial-engine'));
});

test('a trio that differs only by the engine name in its identifier is still identical', () => {
  const found = rules(
    fixture(
      ceremonialTrio(
        'src/components/structures/ceremony',
        'export default function <E>Frame(p) {\n  return <Shared {...p} />;\n}\n'
      )
    )
  );
  assert.ok(found.includes('ceremonial-engine'));
});

test('a censused trio is silent, so the census is what fences it', () => {
  const found = rules(fixture(ceremonialTrio('src/components/structures/ceremony')), {
    ceremonialCensus: { 'src/components/structures/ceremony': 'owner: drill' },
  });
  assert.ok(!found.includes('ceremonial-engine'));
});

test('a census entry with no trio behind it is a STALE finding, so the list can only shrink', () => {
  const found = rules(fixture(), {
    ceremonialCensus: { 'src/components/structures/retired': 'owner: drill' },
  });
  assert.ok(found.includes('ceremonial-engine'));
});

test('two identical engines are a pair, not a ceremonial trio', () => {
  const trio = ceremonialTrio('src/components/structures/pair');
  delete trio['src/components/structures/pair/engines/rustic/index.tsx'];
  assert.ok(!rules(fixture(trio)).includes('ceremonial-engine'));
});

test('three engines that really differ are not ceremonial', () => {
  const found = rules(
    fixture({
      'src/components/structures/real/engines/classic/index.tsx': 'export default () => <Antd />;\n',
      'src/components/structures/real/engines/modern/index.tsx': 'export default () => <Skin />;\n',
      'src/components/structures/real/engines/rustic/index.tsx': 'export default () => <Plain />;\n',
    })
  );
  assert.ok(!found.includes('ceremonial-engine'));
});

test('normalizeEngineImplementation ignores comments, whitespace and the engine name', () => {
  const a = normalizeEngineImplementation("/* classic */\nexport default function ClassicX(){}\n");
  const b = normalizeEngineImplementation('// modern\nexport   default function ModernX(){}');
  assert.equal(a, b);
});

test('the committed tree carries exactly the censused ceremonial trios, no padding', () => {
  const owners = collectCeremonialEngineOwners(CORE_ROOT).map((row) => row.owner);
  assert.deepEqual(owners.sort(), Object.keys(CEREMONIAL_ENGINE_CENSUS).sort());
});
