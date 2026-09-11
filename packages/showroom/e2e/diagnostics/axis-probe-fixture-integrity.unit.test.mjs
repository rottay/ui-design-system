import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { familyElements } from '../../../core/scripts/check/theme/axis-difference/index.mjs';

/**
 * THE PROBE'S FIXTURES ARE NOT FICTION.
 *
 * `check/theme/axis-difference` measures the by-axis tenant-difference rule by
 * mounting one SYNTHESIZED element per family, built from the selector its
 * Modern skin declares. That is the only way to read 248 families in one page,
 * and it has one failure mode that would make every percentage it publishes
 * meaningless: a fixture whose classes and `data-part` no component ever
 * stamps matches nothing, the browser answers with initial values for every
 * property, and the whole run reports a clean, confident zero.
 *
 * So every token of every mounted fixture is corroborated against the authored
 * component corpus. It lives in the showroom's diagnostics rather than beside
 * the probe on purpose: this is the showroom's standing question -- does what
 * the design system claims to paint correspond to what the components render --
 * and `test:diagnostics` is the one inventory that asks it.
 *
 * WHAT IS PINNED AND WHY. Seven fixtures carry a class no literal in the corpus
 * contains, because the component COMPOSES it at runtime from a base name and
 * the engine suffix (`rottay-button` + `--modern`). They are named here so the
 * list can only shrink, and so a genuinely invented selector -- the defect this
 * file exists for -- cannot hide among them.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = path.resolve(HERE, '../../../core');
const COMPONENT_ROOT = path.join(CORE_ROOT, 'src/components');

/** class/attribute tokens the corpus composes rather than spells. */
const COMPOSED_TOKENS = new Map([
  ['button', ['rottay-button--modern']],
  ['button-icon', ['rottay-button--modern']],
  ['card', ['ds-card--modern']],
  ['tabs', ['rottay-tabs--modern']],
  ['upload', ['ds-upload--picture-card']],
  ['overlay-modal-compounds', ['rottay-overlay-modal-header']],
  ['surface-accent-bar', ['ds-accent-bar']],
]);

function authoredSources(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'tests' || entry.name === '__tests__') continue;
      authoredSources(target, found);
    } else if (/\.tsx?$/u.test(entry.name) && !/\.test\.tsx?$/u.test(entry.name)) {
      found.push(target);
    }
  }
  return found;
}

const CORPUS = authoredSources(COMPONENT_ROOT)
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

const FIXTURES = familyElements(CORE_ROOT);

test('the probe mounts a real corpus, not a handful of families', () => {
  const mountable = [...FIXTURES].filter(([, element]) => element !== null);
  assert.ok(FIXTURES.size > 200, `only ${FIXTURES.size} families found; the skin walk is broken`);
  assert.ok(
    mountable.length / FIXTURES.size > 0.85,
    `only ${mountable.length} of ${FIXTURES.size} families mount; a by-axis percentage over that is not a fleet number`,
  );
  assert.ok(CORPUS.length > 1_000_000, 'the component corpus read back almost empty; the walk is broken');
});

test('every mounted fixture is stamped by the authored components, or is a pinned composed name', () => {
  const uncorroborated = [];
  for (const [family, element] of FIXTURES) {
    if (element === null) continue;
    const tokens = [...element.classes, ...Object.values(element.attributes).filter((value) => value !== '')];
    assert.ok(tokens.length > 0, `${family}: a fixture with no class and no attribute matches every div`);
    const pinned = COMPOSED_TOKENS.get(family) ?? [];
    const missing = tokens.filter((token) => !CORPUS.includes(token) && !pinned.includes(token));
    if (missing.length > 0) uncorroborated.push(`${family}: ${missing.join(', ')}`);
  }
  assert.deepEqual(
    uncorroborated,
    [],
    'a fixture whose selector no component stamps matches nothing, and every property it reads comes back as an '
      + 'initial value that looks exactly like "this axis does not move here"',
  );
});

test('the pinned composed names may only shrink', () => {
  for (const [family, tokens] of COMPOSED_TOKENS) {
    const element = FIXTURES.get(family);
    assert.ok(element, `${family} is pinned and is no longer a mounted fixture; remove it`);
    const mounted = [...element.classes, ...Object.values(element.attributes)];
    for (const token of tokens) {
      assert.ok(mounted.includes(token), `${family}: ${token} is pinned and the fixture no longer carries it`);
      assert.ok(
        !CORPUS.includes(token),
        `${family}: ${token} is now spelled literally in the corpus; remove it from COMPOSED_TOKENS`,
      );
    }
  }
});
