import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { collectStampedPartsFromSource, findDeadParts } from './index.mjs';

test('dead-part audit recognizes JSX, createElement, forwarded and D3 anatomy', () => {
  const source = `
    const jsx = <div data-part="root" />;
    const conditional = (
      <button data-part={isPrevious ? 'overflow-previous' : 'overflow-next'} />
    );
    const props = { 'data-part': 'brush-selection' };
    const forwarded = <SkeletonBlock part="skeleton-row" />;
    g.append('line')
      .attr('data-part', 'axis-tick')
      .attr("data-part", "axis-domain");
  `;

  assert.deepEqual(
    [...collectStampedPartsFromSource(source)].sort(),
    [
      'axis-domain',
      'axis-tick',
      'brush-selection',
      'overflow-next',
      'overflow-previous',
      'root',
      'skeleton-row',
    ],
  );
});

test('dead-part audit does not invent a literal part from D3 getters or dynamic values', () => {
  const source = `
    selection.attr('data-part');
    selection.attr('data-part', resolvePart(datum));
  `;

  assert.deepEqual([...collectStampedPartsFromSource(source)], []);
});

test('dead-part audit discovers folder-index CSS and distinguishes live from dead selectors', (t) => {
  const sourceRoot = mkdtempSync(join(tmpdir(), 'dead-parts-folder-index-'));
  t.after(() => rmSync(sourceRoot, { recursive: true, force: true }));

  const componentsRoot = join(sourceRoot, 'components');
  const skinRoot = join(sourceRoot, 'skins', 'example');
  mkdirSync(join(componentsRoot, 'example'), { recursive: true });
  mkdirSync(skinRoot, { recursive: true });
  writeFileSync(join(componentsRoot, 'example', 'index.tsx'), '<div data-part="live" />\n');
  writeFileSync(join(skinRoot, 'index.css'), '[data-part="live"] { color: currentColor; }\n');

  const options = { componentsRoot, sourceRoot, skinDirs: ['skins'] };
  assert.deepEqual(findDeadParts(options).dead, [], 'a stamped folder-index selector is live');

  writeFileSync(
    join(skinRoot, 'index.css'),
    '[data-part="live"] { color: currentColor; }\n[data-part="ghost"] { color: red; }\n',
  );
  assert.deepEqual(findDeadParts(options).dead, ['ghost'], 'an unstamped folder-index selector is dead');
});
