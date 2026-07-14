import assert from 'node:assert/strict';
import test from 'node:test';

import { collectStampedPartsFromSource } from './skin-dead-part-audit.mjs';

test('dead-part audit recognizes JSX, createElement, forwarded and D3 anatomy', () => {
  const source = `
    const jsx = <div data-part="root" />;
    const props = { 'data-part': 'brush-selection' };
    const forwarded = <SkeletonBlock part="skeleton-row" />;
    g.append('line')
      .attr('data-part', 'axis-tick')
      .attr("data-part", "axis-domain");
  `;

  assert.deepEqual(
    [...collectStampedPartsFromSource(source)].sort(),
    ['axis-domain', 'axis-tick', 'brush-selection', 'root', 'skeleton-row'],
  );
});

test('dead-part audit does not invent a literal part from D3 getters or dynamic values', () => {
  const source = `
    selection.attr('data-part');
    selection.attr('data-part', resolvePart(datum));
  `;

  assert.deepEqual([...collectStampedPartsFromSource(source)], []);
});
