/**
 * The drill for `foundation-defaults`.
 *
 * The producer's whole value is that the module and the stylesheet cannot
 * disagree, so the load-bearing assertions are the ones that make a
 * disagreement visible: a planted edit on either side has to turn `--check`
 * red, and an empty read has to refuse rather than publish an empty map.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { allDeclarations, closure, colorDeclarations, readScopes, render, build } from './index.mjs';

const SYNTHETIC = `
:root {
  --ds-color-neutral-100: #f5f5f5;
  --ds-color-text-primary: var(--ds-color-neutral-900);
  --ds-spacing-2: 8px;
  --ds-color-white: #ffffff;
}
:root[data-theme='dark'],
html.dark {
  --ds-color-text-primary: #f3f4f6;
  --ds-color-white: #ffffff;
}
`;

test('the colour family is the seed, and a channel it never reads stays out', () => {
  const declarations = colorDeclarations(SYNTHETIC);
  assert.equal(declarations.get('--ds-color-neutral-100'), '#f5f5f5');
  assert.equal(declarations.has('--ds-spacing-2'), false, 'nothing reads it: not in the closure');
});

test('the closure pulls in a channel OUTSIDE the family that a colour reads', () => {
  const sheet = `:root { --ds-color-bg: var(--ds-surface-panel-bg); --ds-surface-panel-bg: var(--ds-deep); --ds-deep: #123456; --ds-unread: 4px; }`;
  const kept = closure(allDeclarations(sheet));
  assert.deepEqual(
    [...kept].sort(),
    ['--ds-color-bg', '--ds-deep', '--ds-surface-panel-bg'],
    'a fixed point, not one hop',
  );
  assert.equal(kept.has('--ds-unread'), false);
});

test('the dark scope is a DELTA: a channel it restates unchanged is not carried', () => {
  const { light, darkDelta } = readScopes(SYNTHETIC);
  assert.equal(light.get('--ds-color-text-primary'), 'var(--ds-color-neutral-900)');
  assert.deepEqual([...darkDelta.keys()], ['--ds-color-text-primary']);
  assert.equal(
    darkDelta.has('--ds-color-white'),
    false,
    'the dark scope restates white with the same value: not a delta',
  );
});

test('a stylesheet with no dark scope is a broken read, not a light-only map', () => {
  assert.throws(() => readScopes(':root { --ds-color-white: #fff; }'), /declares no/);
});

test('the module carries the source path and the regenerate command', () => {
  const text = render(readScopes(SYNTHETIC));
  assert.match(text, /GENERATED -- do not edit/);
  assert.match(text, /foundation\/themes\/default\/index\.css/);
  assert.match(text, /node scripts\/generate\/tokens\/foundation-defaults\/index\.mjs/);
});

test('DRILL: a moved value on either side changes the rendered module', () => {
  const before = render(readScopes(SYNTHETIC));
  const after = render(readScopes(SYNTHETIC.replace('#f5f5f5', '#eeeeee')));
  assert.notEqual(before, after, 'a stylesheet edit the module did not follow must be visible');
});

/**
 * The one reference the foundation theme cannot carry, pinned by name.
 *
 * `--ds-surface-panel-bg` is declared a layer ABOVE this sheet
 * (`presentation/components/patterns/index.css`), so a foundation colour
 * default that reads it reaches upward. That is a finding of its own and is
 * not this producer's to fix; what this producer owes is that the list stays
 * visible and cannot grow in silence.
 */
const UNCARRIED_REFERENCES = ['--ds-surface-panel-bg'];

test('the LIVE stylesheet projects a non-empty map, and what it cannot carry is NAMED', () => {
  const text = build();
  assert.match(text, /"--ds-color-neutral-100": "#f5f5f5"/);
  assert.match(text, /"--ds-color-text-primary"/);
  // Every value is a literal or a reference INTO the same family, which is
  // what lets the contrast floor resolve without a second lookup table.
  // Every reference a kept value makes is itself kept, except the ones this
  // sheet does not declare at all -- those are named above, so the map closes
  // and the exception cannot grow without turning this row red.
  const kept = new Set([...text.matchAll(/"(--ds-[a-z0-9-]+)": "/g)].map((match) => match[1]));
  const missing = new Set();
  for (const [, value] of text.matchAll(/"--ds-[a-z0-9-]+": "([^"]+)"/g)) {
    for (const [, reference] of value.matchAll(/var\(\s*(--ds-[a-z0-9-]+)/g)) {
      if (!kept.has(reference)) missing.add(reference);
    }
  }
  assert.deepEqual([...missing].sort(), UNCARRIED_REFERENCES);
});
