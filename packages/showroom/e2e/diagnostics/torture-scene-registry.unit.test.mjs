import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOWROOM_ROOT = path.resolve(HERE, '../..');
const REGISTRY = path.join(SHOWROOM_ROOT, 'src/components/torture-sections/registry/index.ts');
const SCENES_ROOT = path.join(SHOWROOM_ROOT, 'src/app/probe/whitelabel-torture/scenes');
const SECTIONS_ROOT = path.join(SHOWROOM_ROOT, 'src/components/torture-sections');
const DISPATCHER = path.join(SHOWROOM_ROOT, 'src/app/probe/whitelabel-torture/page.tsx');

/**
 * After the R0 split, `TORTURE_SCENES[*].flags` became declarative: `ds-reference` reads
 * scene ids and labels, while each scene route expresses its composition through static
 * imports. Nothing at runtime compares the two, so they can drift apart silently. These
 * assertions are that missing reader.
 */

const registrySource = readFileSync(REGISTRY, 'utf8');

function sceneFlags() {
  const block = registrySource.slice(registrySource.indexOf('export const TORTURE_SCENES'));
  const scenes = {};
  for (const match of block.matchAll(/^ {2}([a-zA-Z]+): \{$/gm)) {
    const id = match[1];
    const rest = block.slice(match.index);
    const flagsMatch = rest.match(/flags: \[([^\]]*)\]/);
    scenes[id] = (flagsMatch?.[1] ?? '')
      .split(',')
      .map((entry) => entry.trim().replace(/^'|'$/g, ''))
      .filter((entry) => entry.length > 0);
  }
  return scenes;
}

function sectionFlags() {
  const block = registrySource.slice(
    registrySource.indexOf('export const TORTURE_SECTION_FLAGS'),
    registrySource.indexOf('export type TortureSectionFlag'),
  );
  return [...block.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

function sceneRouteImports(sceneId) {
  const source = readFileSync(path.join(SCENES_ROOT, sceneId, 'page.tsx'), 'utf8');
  return [...source.matchAll(/from '@\/components\/torture-sections\/([a-z0-9-]+)'/g)]
    .map((match) => match[1])
    .filter((folder) => folder !== 'frame' && folder !== 'registry');
}

// The registry is pure vocabulary. One section import here would pull every section into
// each scene route's graph and dissolve the per-scene boundary the round exists to create.
test('the flag registry imports no section module', () => {
  assert.equal(
    /from '@\/components\/torture-sections\/(?!registry)/.test(registrySource),
    false,
    'registry/index.ts must stay free of component imports',
  );
});

test('every declared scene has a route and every route has a declared scene', () => {
  const declared = Object.keys(sceneFlags()).sort();
  const routed = readdirSync(SCENES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(routed, declared);
});

test('each scene route statically imports exactly the sections its declared flags name', () => {
  const scenes = sceneFlags();
  // longTail renders an already-external fixture rather than a torture-section module.
  const EXTERNAL_FLAGS = new Set(['longTail']);
  const FLAG_TO_FOLDER = {
    interactive: 'interactive',
    tablestates: 'table-states',
    fieldfilters: 'field-filters',
    filterpanel: 'filter-panel',
    rail: 'rail',
    detailpanel: 'detail-panel',
    datatable: 'data-table',
    fields: 'fields',
    dropdowns: 'dropdowns',
    pickers: 'pickers',
    statusfb: 'status-feedback',
    overlayfb: 'overlay-feedback',
    overlay: 'overlay',
    nav: 'nav',
    mediaStates: 'media-states',
    dataDisplayStates: 'data-display-states',
    layout: 'layout',
    forms: 'forms',
    record: 'record',
    headers: 'headers',
    'headers-patterns': 'headers-patterns',
    navigation: 'navigation-patterns',
    dashboard: 'dashboard',
    communication: 'communication',
    workspace: 'workspace-chrome',
    applicationSurfaces: 'application-surfaces',
    tenantBranding: 'tenant-branding',
    visualizations: 'visualizations',
  };

  for (const [sceneId, flags] of Object.entries(scenes)) {
    const expected = flags
      .filter((flag) => !EXTERNAL_FLAGS.has(flag))
      .map((flag) => {
        const folder = FLAG_TO_FOLDER[flag];
        assert.ok(folder, `scene ${sceneId} declares unknown flag ${flag}`);
        return folder;
      })
      .sort();
    assert.deepEqual(
      sceneRouteImports(sceneId).sort(),
      expected,
      `scene ${sceneId} route imports drifted from its declared flags`,
    );
  }
});

test('a scene route never imports a section outside its own scene', () => {
  const scenes = sceneFlags();
  for (const sceneId of Object.keys(scenes)) {
    const imported = sceneRouteImports(sceneId);
    assert.equal(
      new Set(imported).size,
      imported.length,
      `scene ${sceneId} imports the same section twice`,
    );
  }
});

test('the legacy dispatcher still binds every section flag', () => {
  const dispatcher = readFileSync(DISPATCHER, 'utf8');
  for (const flag of sectionFlags()) {
    assert.ok(
      dispatcher.includes(`'${flag}'`),
      `dispatcher lost the ${flag} gate — 36 e2e specs address this route by query flag`,
    );
  }
});

test('NEGATIVE DRILL: a drifted scene declaration is rejected', () => {
  const compare = (declaredFolders, importedFolders) => {
    assert.deepEqual([...importedFolders].sort(), [...declaredFolders].sort());
  };

  // Positive control: the real data scene agrees with its route today.
  const dataDeclared = ['table-states', 'filter-panel', 'rail', 'detail-panel', 'data-table', 'headers', 'headers-patterns'];
  compare(dataDeclared, sceneRouteImports('data'));

  // Drift in either direction must fail, or the gate would be vacuous.
  assert.throws(
    () => compare([...dataDeclared, 'forms'], sceneRouteImports('data')),
    /Expected values to be strictly deep-equal|AssertionError/,
    'a flag declared but not imported must fail',
  );
  assert.throws(
    () => compare(dataDeclared.slice(1), sceneRouteImports('data')),
    /Expected values to be strictly deep-equal|AssertionError/,
    'a section imported but not declared must fail',
  );
});

test('every section folder on disk is reachable from the flag vocabulary', () => {
  const folders = readdirSync(SECTIONS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== 'frame' && name !== 'registry');
  const dispatcher = readFileSync(DISPATCHER, 'utf8');
  for (const folder of folders) {
    assert.ok(
      dispatcher.includes(`torture-sections/${folder}'`),
      `section ${folder} is orphaned — no dispatcher import reaches it`,
    );
  }
});
