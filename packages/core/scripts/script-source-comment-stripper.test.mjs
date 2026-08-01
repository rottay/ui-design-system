import assert from 'node:assert/strict';
import { test } from 'node:test';

import { stripScriptComments } from './lib/script-source-comment-stripper.mjs';

test('removes line and block comments while preserving source shape', () => {
  const source = '// forbidden 500ms\nconst value = 1; /* cubic-bezier(0,0,1,1) */\n';
  const clean = stripScriptComments(source, 'fixture.ts');

  assert.equal(clean.includes('500ms'), false);
  assert.equal(clean.includes('cubic-bezier'), false);
  assert.equal(clean.split('\n').length, source.split('\n').length);
  assert.match(clean, /const value = 1/);
});

test('does not treat URL, string, template, or JSX text content as comments', () => {
  const source = [
    'const url = "https://example.test/500ms";',
    'const copy = `// visible 200ms`;',
    'export const View = () => <span>/* visible 120ms */</span>;',
  ].join('\n');
  const clean = stripScriptComments(source, 'fixture.tsx');

  assert.match(clean, /https:\/\/example\.test\/500ms/);
  assert.match(clean, /\/\/ visible 200ms/);
  assert.match(clean, /\/\* visible 120ms \*\//);
});

test('keeps recognizing comments after ambiguous TSX syntax', () => {
  const source = [
    'const View = () => <div data-value={value < 3 ? "a" : "b"} />;',
    '// this 500ms is documentation only',
    'const live = "120ms";',
  ].join('\n');
  const clean = stripScriptComments(source, 'fixture.tsx');

  assert.equal(clean.includes('500ms'), false);
  assert.equal(clean.includes('120ms'), true);
});
