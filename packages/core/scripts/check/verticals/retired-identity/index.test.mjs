import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  blankMigrationSources,
  collectRetiredIdentityFindings,
  findRetiredIdentity,
  isCodemodReleaseMap,
  isExcludedRetiredIdentityPath,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

test('rejects each retired identity carrier', () => {
  const retired = ['plat', 'form'].join('');
  const planted = [
    `vertical: '${retired}'`,
    `data-vertical="${retired}"`,
    `data-theme="${retired}-dark"`,
    `./styles/${retired}`,
    `dist/${retired}.css`,
    `${retired}.admin`,
    `presets/${retired}/index.ts`,
    `/verticals/${retired}/overview`,
    'Rottay Platform',
    'Platform vertical',
    'rottay platform',
  ].join('\n');
  const findings = findRetiredIdentity(planted, 'planted-negative.ts');
  assert.deepEqual(
    new Set(findings.map(({ rule }) => rule)),
    new Set([
      'identity-field',
      'root-selector',
      'style-export',
      'bundle-path',
      'profile-id',
      'source-route',
      'semantic-display-name',
    ]),
  );
});

test('allows only the non-identity meanings: process, WebAuthn and the physical app name', () => {
  const allowed = [
    'const operatingSystem = process.platform;',
    `const authenticatorAttachment = 'platform';`,
    'const supportsWebAuthn = PublicKeyCredential.isConditionalMediationAvailable;',
    `const applicationRoot = '../app-platform';`,
  ].join('\n');
  assert.deepEqual(findRetiredIdentity(allowed, 'positive.ts'), []);
});

test('walks operational manifests and unquoted CSS in the planted corpus', () => {
  const root = mkdtempSync(join(tmpdir(), 'retired-identity-'));
  try {
    mkdirSync(join(root, 'ops'), { recursive: true });
    mkdirSync(join(root, 'ops', 'presets', 'platform'), { recursive: true });
    writeFileSync(
      join(root, 'ops', 'verticals.manifest.json'),
      JSON.stringify({ verticalKey: 'platform' }, null, 2),
    );
    writeFileSync(
      join(root, 'ops', 'tenant.css'),
      '[data-vertical=platform] { color: red; }\n',
    );
    writeFileSync(join(root, 'ops', 'clean.mjs'), "export const app = '../app-platform';\n");
    writeFileSync(join(root, 'ops', 'presets', 'platform', 'index.ts'), 'export {};\n');

    const findings = collectRetiredIdentityFindings({
      uiRoot: root,
      roots: [join(root, 'ops')],
      exclude: () => false,
    });
    assert.deepEqual(
      findings.map(({ path, rule }) => [path, rule]),
      [
        ['ops/presets/platform/index.ts', 'source-path'],
        ['ops/tenant.css', 'root-selector'],
        ['ops/verticals.manifest.json', 'identity-field'],
      ],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('JSON quoted registry keys are semantic identities, not invisible text', () => {
  const findings = findRetiredIdentity(
    JSON.stringify({ platform: { styleEntry: './styles/rottay' } }, null, 2),
    'verticals.manifest.json',
  );
  assert.equal(findings.some(({ rule }) => rule === 'registry-key'), true);
});

test('every source route carrying the retired identity fails', () => {
  const retired = ['plat', 'form'].join('');
  for (const planted of [
    `verticals/${retired}`,
    `verticals/${retired}/overview`,
    `verticals/${retired}-dark`,
    `verticals/${retired}-identity`,
    `presets/${retired}/index.ts`,
    `demos/${retired}`,
  ]) {
    assert.ok(
      findRetiredIdentity(planted, 'planted.ts').some(({ rule }) => rule === 'source-route'),
      `the retired route must fail: ${planted}`,
    );
  }
});

test('excludes only the gate files at their exact repository paths, not matching basenames', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const core = findPackageRoot(here);
  assert.equal(isExcludedRetiredIdentityPath(join(here, 'index.mjs')), true);
  // A same-named file anywhere else is NOT excluded: the exclusion is the exact
  // repository path of this capability, never a basename.
  assert.equal(
    isExcludedRetiredIdentityPath(join(core, 'src/retired-identity-gate/index.mjs')),
    false,
  );
  assert.equal(isExcludedRetiredIdentityPath(join(core, 'src/index.mjs')), false);
});

test('the named dated artifact exemption is exact-path: the worklist is exempt, a neighbour is not', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const core = findPackageRoot(here);
  const worklist = join(core, 'scripts/check/tokens/customization/visual-worklist/index.json');
  assert.equal(isExcludedRetiredIdentityPath(worklist), true);
  // Same basename elsewhere, or a sibling name in the same folder: NOT excluded.
  assert.equal(
    isExcludedRetiredIdentityPath(join(core, 'scripts/generate/tokens/customization/preservation/index.json')),
    false,
  );
  assert.equal(
    isExcludedRetiredIdentityPath(join(core, 'scripts/check/tokens/customization/visual-worklist/other.json')),
    false,
  );
});

test('rejects identity modifiers in fields and every root identity attribute', () => {
  const findings = findRetiredIdentity([
    `tenantSlug: 'platform-preview'`,
    `[data-tenant='platform.preview'] {}`,
    `[data-vertical=platform-dark] {}`,
    `[data-theme="platform/light"] {}`,
  ].join('\n'), 'modifiers.ts');
  assert.deepEqual(
    findings.map(({ rule }) => rule).sort(),
    ['identity-field', 'profile-id', 'root-selector', 'root-selector', 'root-selector'].sort(),
  );
});

const RELEASE_MAP = 'packages/core/scripts/maintain/codemods/release-3-0-map/index.json';
const DOOR = ['./styles/plat', 'form'].join('');
const BUNDLE = ['./dist/plat', 'form.css'].join('');

function plantedMap(mutate = () => {}) {
  const map = {
    schemaVersion: 1,
    line: '3.0',
    entries: [
      {
        id: `subpath-removed/${DOOR}#*`,
        class: 'subpath-removed',
        subpath: DOOR,
        symbol: '*',
        replacement: { subpath: './styles/rottay' },
        resolves: 'the specifier is re-pointed to `./styles/rottay`',
      },
      {
        id: `subpath-removed/${BUNDLE}#*`,
        class: 'subpath-removed',
        subpath: BUNDLE,
        symbol: '*',
        replacement: { subpath: './styles/rottay' },
        resolves: `an import of the retired \`${BUNDLE.slice(2)}\` artifact is re-pointed`,
      },
      { id: 'symbol-removed-no-replacement/.#Gone', class: 'symbol-removed-no-replacement', subpath: '.', symbol: 'Gone', guidance: 'Nothing replaces it.' },
    ],
  };
  mutate(map);
  return JSON.stringify(map, null, 2);
}

function mapFindings(text, rel = RELEASE_MAP) {
  return findRetiredIdentity(blankMigrationSources(text, rel), rel);
}

test('a codemod release map may name a retired door only as the source a subpath-removed entry migrates away from', () => {
  assert.notEqual(findRetiredIdentity(plantedMap(), RELEASE_MAP).length, 0, 'the planted map must carry residues before blanking');
  assert.deepEqual(mapFindings(plantedMap()), []);

  const here = dirname(fileURLToPath(import.meta.url));
  const real = join(findPackageRoot(here), 'scripts/maintain/codemods/release-3-0-map/index.json');
  const text = readFileSync(real, 'utf8');
  assert.notEqual(findRetiredIdentity(text, RELEASE_MAP).length, 0, 'the real map still names the retired doors');
  assert.deepEqual(mapFindings(text), []);
  assert.equal(isExcludedRetiredIdentityPath(real), false, 'the map is scanned, not excluded');
});

test('blanking preserves every offset, so a finding elsewhere in the map keeps its line and column', () => {
  const text = plantedMap((map) => { map.entries[2].guidance = `Import ${DOOR} instead.`; });
  assert.equal(blankMigrationSources(text, RELEASE_MAP).length, text.length);
  const [finding] = mapFindings(text);
  const raw = findRetiredIdentity(text, RELEASE_MAP).find(({ line }) => line === finding.line);
  assert.deepEqual([finding.line, finding.column, finding.rule], [raw.line, raw.column, 'style-export']);
});

test('the same retired name outside a migration-source position of the same map fails', () => {
  const planted = {
    'a replacement': (map) => { map.entries[0].replacement = { subpath: DOOR }; },
    'the guidance of an entry of another class': (map) => { map.entries[2].guidance = `Import ${DOOR} instead.`; },
    'the subpath of an entry of another class': (map) => { map.entries[2].subpath = DOOR; },
    'the map header': (map) => { map.line = DOOR; },
    'a key the class does not name': (map) => { map.entries[0].symbol = DOOR; },
    'another retired door in the prose of a subpath-removed entry': (map) => { map.entries[0].resolves = `see ${BUNDLE}`; },
    'an id that does not restate the subpath': (map) => { map.entries[0].id = `subpath-removed/${BUNDLE}#*`; },
    'a field outside the entries array': (map) => { map.groups = { legacy: { resolves: `re-pointed from ${DOOR}` } }; },
  };
  for (const [where, mutate] of Object.entries(planted)) {
    assert.notEqual(mapFindings(plantedMap(mutate)).length, 0, `a retired name in ${where} must fail`);
  }
});

test('the migration-source class belongs to the release map path alone: a neighbour and a namesake fail', () => {
  const text = plantedMap();
  for (const rel of [
    'packages/core/scripts/maintain/codemods/index.json',
    'packages/core/scripts/maintain/codemods/release-3-0-map/other.json',
    'packages/core/scripts/maintain/codemods/resolve/index.json',
    'packages/core/scripts/maintain/codemods/release-map/index.json',
    'packages/core/scripts/maintain/engine/release-3-0-map/index.json',
    'packages/core/src/release-3-0-map/index.json',
    'packages/showroom/scripts/maintain/codemods/release-3-0-map/index.json',
  ]) {
    assert.equal(isCodemodReleaseMap(rel), false, rel);
    assert.notEqual(mapFindings(text, rel).length, 0, `${rel} must stay under the law`);
  }
  assert.equal(isCodemodReleaseMap('packages/core/scripts/maintain/codemods/release-4-0-map/index.json'), true);
  assert.notEqual(mapFindings('{ not json', RELEASE_MAP).length + mapFindings(`{ "x": "${DOOR}" `, RELEASE_MAP).length, 0,
    'a map that does not parse is scanned whole');
});
