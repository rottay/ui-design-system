// The one root stamp, executed against a recording root: what it writes, that a second run
// changes nothing, and that no other file in the showroom serializes a stamp of its own.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildRootStampScript } from '../../src/components/probe-ground/stamp/index.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const KERNEL = 'src/components/probe-ground/stamp/index.mjs';

function recordingDocument({ classes = [], colorScheme = '' } = {}) {
  const attributes = new Map();
  const classList = new Set(classes);
  const root = {
    setAttribute: (name, value) => attributes.set(name, String(value)),
    classList: {
      toggle: (name, force) => (force ? classList.add(name) : classList.delete(name)),
    },
    style: { colorScheme },
  };
  const state = () => ({
    attributes: Object.fromEntries([...attributes].sort()),
    classes: [...classList].sort(),
    colorScheme: root.style.colorScheme,
  });
  return { document: { documentElement: root }, state };
}

const run = (script, document) => new Function('document', script)(document);

const BITHIRE = {
  'data-theme': 'light',
  'data-tenant-theme-mode': 'light',
  'data-engine': 'modern',
  lang: 'en',
  dir: 'ltr',
  'data-ds-root': '',
  'data-vertical': 'bithire',
  'data-tenant': 'bithire',
};

test('writes every attribute, the dark class and color-scheme for a dark root', () => {
  const { document, state } = recordingDocument();
  run(buildRootStampScript({ ...BITHIRE, 'data-theme': 'dark' }), document);
  assert.deepEqual(state(), {
    attributes: Object.fromEntries(Object.entries({ ...BITHIRE, 'data-theme': 'dark' }).sort()),
    classes: ['dark'],
    colorScheme: 'dark',
  });
});

test('a light root removes a dark class the host already carried', () => {
  const { document, state } = recordingDocument({ classes: ['dark', 'host'] });
  run(buildRootStampScript(BITHIRE), document);
  assert.deepEqual(state().classes, ['host']);
  assert.equal(state().colorScheme, 'light');
});

test('idempotent: one input, one script, and a second run changes nothing', () => {
  assert.equal(buildRootStampScript(BITHIRE), buildRootStampScript({ ...BITHIRE }));
  const { document, state } = recordingDocument();
  run(buildRootStampScript(BITHIRE), document);
  const once = state();
  run(buildRootStampScript(BITHIRE), document);
  assert.deepEqual(state(), once);
});

test('base leaves color-scheme to the stylesheet', () => {
  const { document, state } = recordingDocument({ colorScheme: 'normal' });
  run(buildRootStampScript({ ...BITHIRE, 'data-theme': 'base' }), document);
  assert.equal(state().colorScheme, 'normal');
  assert.deepEqual(state().classes, []);
});

test('an absent data-theme writes no color-scheme at all, never the string undefined', () => {
  const { document, state } = recordingDocument({ colorScheme: 'normal' });
  const withoutTheme = { ...BITHIRE };
  delete withoutTheme['data-theme'];
  run(buildRootStampScript(withoutTheme), document);
  assert.equal(state().colorScheme, 'normal');
  assert.deepEqual(state().classes, []);
  assert.equal('data-theme' in state().attributes, false);
});

test('a failing root never throws out of the stamp', () => {
  assert.doesNotThrow(() => run(buildRootStampScript(BITHIRE), { documentElement: null }));
});

test('the one stamp: no other showroom source serializes a root stamp', () => {
  const owners = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(?:ts|tsx|mjs|js)$/u.test(name) && readFileSync(path, 'utf8').includes('r.setAttribute(k,a[k])')) {
        owners.push(relative(ROOT, path));
      }
    }
  };
  walk(join(ROOT, 'src'));
  assert.deepEqual(owners, [KERNEL]);
});

test('torture-tenant and the ds-reference lab re-export the one stamp', () => {
  const torture = readFileSync(join(ROOT, 'src/components/torture-tenant/index.ts'), 'utf8');
  const lab = readFileSync(join(ROOT, 'src/app/probe/ds-reference/ground/stamp.ts'), 'utf8');
  assert.match(torture, /export \{ buildRootStampScript \} from '\.\.\/probe-ground\/stamp\/index\.mjs';/u);
  assert.match(lab, /export \{ buildRootStampScript as buildLabRootStampScript \} from '@\/components\/probe-ground\/stamp\/index\.mjs';/u);
});
