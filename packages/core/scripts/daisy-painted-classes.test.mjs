/**
 * Executable contract for the Daisy painted-class taxonomy.
 *
 * The vocabulary behind `daisy.classConsumers` used to be a hand-written array
 * in the counter, annotated "verified against the `daisyui@5.5.19` package
 * source". Nothing enforced that annotation, and it was false: five painted
 * classes were missing, three of them rendered by files the ratchet scored as
 * clean. These tests make the claim executable -- the manifest must be
 * derivable from the INSTALLED package, and a DaisyUI upgrade must fail here
 * rather than silently change what the ratchet measures.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  MANIFEST_PATH,
  PINNED_DAISY_VERSION,
  checkManifest,
  derivePaintedClasses,
  installedDaisyVersion,
  paintedClassNames,
  readManifest,
} from './daisy-painted-classes.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));

test('the manifest is pinned to the installed daisyui version', () => {
  assert.equal(
    installedDaisyVersion(),
    PINNED_DAISY_VERSION,
    'daisyui moved; re-derive the painted-class manifest against the new version deliberately',
  );
  assert.equal(readManifest().daisyuiVersion, PINNED_DAISY_VERSION);
});

test('the manifest still matches what the installed package derives', async () => {
  assert.deepEqual(await checkManifest(), []);
});

test('the `--check` CLI agrees with the library, and exits 0 when clean', () => {
  const result = spawnSync(
    process.execPath,
    [join(scriptDir, 'daisy-painted-classes.mjs'), '--check'],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /daisy-painted-classes OK/);
});

/**
 * The five the hand-list missed. `timeline-box`, `timeline-end` and
 * `timeline-vertical` are rendered by the timeline pattern; `link-hover` by
 * file-manager; `loading-spinner` by saved-views, filter-builder and
 * kanban-board. Each one is a class the pinned DaisyUI really paints, so each
 * one was residue the ratchet could not see.
 */
test('the classes the hand-list omitted are in the manifest', () => {
  const painted = paintedClassNames();
  for (const name of [
    'timeline-box',
    'timeline-end',
    'timeline-vertical',
    'link-hover',
    'loading-spinner',
  ]) {
    assert.ok(painted.has(name), `${name} is painted by daisyui@${PINNED_DAISY_VERSION}`);
  }
});

/** Everything the old hand-list DID have must survive: this is a superset. */
test('the manifest is a superset of the hand-list it replaced', () => {
  const painted = paintedClassNames();
  const handList = [
    'alert', 'skeleton', 'step', 'steps', 'link', 'breadcrumbs', 'rating', 'range',
    'progress', 'radial-progress', 'stat-title', 'stat-value', 'carousel', 'carousel-item',
    'timeline', 'timeline-middle', 'timeline-start', 'toast', 'toast-top', 'toast-bottom',
    'modal', 'modal-open', 'modal-box', 'modal-backdrop', 'modal-action',
  ];
  assert.deepEqual(
    handList.filter((name) => !painted.has(name)),
    [],
    'the generated vocabulary dropped a class the hand-list already tracked',
  );
});

/**
 * The negation rule, which is the difference between a taxonomy and a grep.
 *
 * `disabled` appears twice in the pinned package, both times inside
 * `li:not(.menu-title, .disabled)` in the `.menu` rule. DaisyUI paints things
 * that are NOT `.disabled`; it never paints `.disabled`. Harvesting class
 * tokens without stripping negations puts it in the vocabulary, and three
 * modern-engine primitives -- AutoComplete, Cascader, Mentions -- render a bare
 * `disabled` state class for their own reasons. That is three false consumers
 * from one missing `:not`, on a ratchet whose whole job is to be believed.
 */
test('a class DaisyUI only ever negates is not painted', () => {
  const painted = paintedClassNames();
  assert.ok(!painted.has('disabled'), '.disabled appears only inside :not() in daisyui');
});

/**
 * Classes that appear only as the CONTEXT of another rule are not painted
 * either: `.pika-single .is-today .pika-button` declares properties on
 * `pika-button`, and nothing at all on `is-today`.
 */
test('a class that only ever contextualizes another rule is not painted', () => {
  const painted = paintedClassNames();
  for (const name of ['is-today', 'is-selected', 'has-event', 'row-hover']) {
    assert.ok(!painted.has(name), `${name} carries no declarations of its own`);
  }
});

test('standalone and contextual painting are distinguished', async () => {
  const { classes } = await derivePaintedClasses();

  // `.loading-spinner` sets `mask-image` on its own -- no base class required.
  assert.equal(classes['loading-spinner'].paints, 'standalone');
  // `.step` only ever paints inside a `.steps` ancestor.
  assert.equal(classes.step.paints, 'contextual');
  assert.ok(classes.step.requires.some((context) => context.split(' ').includes('steps')));
});

/**
 * `base` is what lets the counter say "this file renders `loading-spinner` and
 * never renders `loading`" without a second hand-maintained table.
 */
test('modifier classes name the base class they modify', async () => {
  const { classes } = await derivePaintedClasses();
  assert.equal(classes['loading-spinner'].base, 'loading');
  assert.equal(classes['timeline-box'].base, 'timeline');
  assert.equal(classes['link-hover'].base, 'link');
  assert.equal(classes['modal-box'].base, 'modal');
  // A root class has no base, and a compound name whose prefix paints nothing
  // is a root class: `radial` is not a DaisyUI class.
  assert.equal(classes.timeline.base, null);
  assert.equal(classes['radial-progress'].base, null);
});

test('the manifest records enough provenance to be re-derived', () => {
  const manifest = readManifest();
  assert.equal(manifest.classCount, Object.keys(manifest.classes).length);
  assert.ok(manifest.derivedFrom.includes('components/timeline'));
  assert.ok(manifest.derivedFrom.includes('utilities/join'));
  assert.match(manifest.$comment, /GENERATED/);
  assert.ok(MANIFEST_PATH.endsWith('lib/daisy-painted-classes.json'));
});
