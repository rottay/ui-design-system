/**
 * Drills for the contextual TS literal classifier (C2c blocker: reads ≠
 * writers ≠ metadata). Each case pins exactly one classification law with a
 * synthetic source file — the classifier, not a grep, decides.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { classifyTsLiterals } from './customization-surface-census.mjs';

const PROD = '/repo/src/ui/thing/index.ts';
const EMITTER = '/repo/src/infrastructure/compilers/kernel/runtime/x/index.ts';

test('a registry/allowlist literal is METADATA — it cannot keep a writer alive', () => {
  const { reads, writes, metadata } = classifyTsLiterals(
    `export const ALLOWLIST = ['--ds-color-primary', '--ds-color-accent'];`,
    PROD
  );
  assert.equal(reads.size, 0);
  assert.equal(writes.size, 0);
  assert.equal(metadata.get('--ds-color-primary'), 1);
});

test('getPropertyValue IS a read', () => {
  const { reads, metadata } = classifyTsLiterals(
    `const v = getComputedStyle(el).getPropertyValue('--ds-type-scale');`,
    PROD
  );
  assert.equal(reads.get('--ds-type-scale'), 1);
  assert.equal(metadata.size, 0);
});

test('a var() payload in TS IS a read', () => {
  const { reads } = classifyTsLiterals(
    `const style = { background: 'var(--ds-color-bg, #fff)' };`,
    PROD
  );
  assert.equal(reads.get('--ds-color-bg'), 1);
});

test('setProperty IS a write, never a read', () => {
  const { reads, writes } = classifyTsLiterals(
    `el.style.setProperty('--ds-motion-scale', '0.5');`,
    PROD
  );
  assert.equal(writes.get('--ds-motion-scale'), 1);
  assert.equal(reads.size, 0);
});

test('an emission-map KEY in a compiler module IS a write; the same map in product code is metadata', () => {
  const source = `export const MAP = { '--ds-card-bg': value };`;
  const compiler = classifyTsLiterals(source, EMITTER);
  assert.equal(compiler.writes.get('--ds-card-bg'), 1);
  const product = classifyTsLiterals(source, PROD);
  assert.equal(product.writes.size, 0);
  assert.equal(product.metadata.get('--ds-card-bg'), 1);
});

test('comments and docs never count anywhere', () => {
  const { reads, writes, metadata } = classifyTsLiterals(
    `// uses --ds-ghost-token for nothing\n/** and --ds-ghost-token again */\nexport const x = 1;`,
    PROD
  );
  assert.equal(reads.size + writes.size + metadata.size, 0);
});

test('writer and reader of the SAME name stay independent properties', () => {
  const { reads, writes } = classifyTsLiterals(
    `el.style.setProperty('--ds-x-bg', v); const s = 'var(--ds-x-bg)';`,
    PROD
  );
  assert.equal(writes.get('--ds-x-bg'), 1);
  assert.equal(reads.get('--ds-x-bg'), 1);
});

test("element-access assignment style['--ds-x'] = v IS a write", () => {
  const { writes, reads } = classifyTsLiterals(
    `el.style['--ds-panel-bg'] = value;`,
    PROD
  );
  assert.equal(writes.get('--ds-panel-bg'), 1);
  assert.equal(reads.size, 0);
});

test("element-access READ style['--ds-x'] outside an assignment LHS is a read", () => {
  const { reads, writes } = classifyTsLiterals(
    `const v = el.style['--ds-panel-bg'];`,
    PROD
  );
  assert.equal(reads.get('--ds-panel-bg'), 1);
  assert.equal(writes.size, 0);
});

test('var( with whitespace still counts as a read', () => {
  const { reads } = classifyTsLiterals(
    `const s = 'var(  --ds-gap , 4px)';`,
    PROD
  );
  assert.equal(reads.get('--ds-gap'), 1);
});

test('template literal payloads classify like strings', () => {
  const { reads } = classifyTsLiterals(
    'const s = `var(--ds-a) ${x} var( --ds-b)`;',
    PROD
  );
  assert.equal(reads.get('--ds-a'), 1);
  assert.equal(reads.get('--ds-b'), 1);
});

test('an UNREGISTERED helper call is metadata, never a read (declarative registry)', () => {
  const { reads, metadata } = classifyTsLiterals(
    `mysteryHelper('--ds-x-bg');`,
    PROD
  );
  assert.equal(reads.size, 0);
  assert.equal(metadata.get('--ds-x-bg'), 1);
});
