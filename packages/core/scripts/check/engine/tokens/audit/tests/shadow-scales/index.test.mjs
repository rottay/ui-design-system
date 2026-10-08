import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { shadowScaleDefinitions } from '../../shadow-scales/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

test('a style-query condition naming an elevation channel is not a scale', () => {
  assert.equal(shadowScaleDefinitions(`
    @container not style(--ds-elevation-1: none) {
      .a { box-shadow: var(--ds-focus-ring), var(--ds-elevation-1); }
    }
  `), 0);
  assert.equal(shadowScaleDefinitions(`
    @container not (style(--ds-popover-shadow: none) or style(--ds-elevation-1: none)) { .a { color: red; } }
  `), 0);
});

test('a style-query condition naming a shadow channel with a literal is not a parallel scale', () => {
  assert.equal(shadowScaleDefinitions('@container not style(--ds-shadow-md: none) { .a { color: red; } }'), 0);
  assert.equal(shadowScaleDefinitions('@container style(--ds-shadow-md: 0 1px 2px rgba(0, 0, 0, 0.1)) { .a { color: red; } }'), 0);
  assert.equal(shadowScaleDefinitions('@supports (--ds-shadow-sm: 0 1px 2px black) { .a { color: red; } }'), 0);
});

test('the elevation ramp declared with a literal is one scale, also inside a conditional block', () => {
  assert.equal(shadowScaleDefinitions(':root { --ds-elevation-1: 0 1px 2px rgba(0, 0, 0, 0.08); }'), 1);
  assert.equal(shadowScaleDefinitions(':root { --ds-elevation-1: none; }'), 1);
  assert.equal(shadowScaleDefinitions(`
    @container not style(--ds-elevation-1: none) {
      .a { --ds-elevation-1: 0 2px 4px rgba(0, 0, 0, 0.1); }
    }
  `), 1, 'the condition is dropped; the declaration inside its block still counts');
});

test('MUTANT: a parallel --ds-shadow-* ramp declared with literals is a second scale; an alias of the ramp is not', () => {
  const ramp = ':root { --ds-elevation-1: 0 1px 2px rgba(0, 0, 0, 0.08); }';
  assert.equal(shadowScaleDefinitions(`${ramp} :root { --ds-shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12); }`), 2);
  assert.equal(shadowScaleDefinitions(':root { --ds-shadow-sm: 0 1px 2px black; }'), 1);
  assert.equal(shadowScaleDefinitions(`${ramp} :root { --ds-shadow-md: var(--ds-elevation-2); }`), 1);
  assert.equal(shadowScaleDefinitions(':root { --ds-elevation-1: var(--ds-elevation-base); }'), 0);
});

function auditSources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return ['tests', 'shadow-scales', 'baseline'].includes(entry.name) ? [] : auditSources(full);
    return entry.name.endsWith('.mjs') ? [full] : [];
  });
}

test('the audit counts scales through this classifier and no other', () => {
  const sources = auditSources(join(HERE, '../..')).map((file) => [file, readFileSync(file, 'utf8')]);
  const callers = sources.filter(([, text]) => /scales \+= shadowScaleDefinitions\(readFileSync\(f, 'utf8'\)\);/u.test(text));
  assert.deepEqual(callers.map(([file]) => file), [join(HERE, '../../counters/depth/index.mjs')]);
  for (const [file, text] of sources) {
    assert.ok(!/--ds-elevation-1:\\s\*/u.test(text), `${file} must not keep a second copy of the scale pattern`);
  }
});
