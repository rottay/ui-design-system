import assert from 'node:assert/strict';
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  readFirstPartyRosterSource,
  validateExecutableRoster,
} from './index.mjs';
import { packageRoot as findPackageRoot } from '../repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const ROSTER_PATH = resolve(
  CORE_ROOT,
  'src/foundation/presets/verticals/roster/index.ts',
);

test('executes the authored TypeScript roster rather than parsing its text', () => {
  const rows = readFirstPartyRosterSource(ROSTER_PATH);
  assert.deepEqual(rows.map((row) => row.slug), ['rottay', 'bithire', 'evnto']);
  assert.ok(rows.every((row) => row.verticalKey === row.slug && row.themeId === row.slug));
});

test('fails closed when the executable module does not export a roster', () => {
  const root = mkdtempSync(join(tmpdir(), 'roster-executable-'));
  try {
    const fixture = join(root, 'missing.mjs');
    writeFileSync(fixture, 'export const notTheRoster = [];\n');
    assert.throws(() => readFirstPartyRosterSource(fixture), /FIRST_PARTY_VERTICAL_ROSTER/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects semantic drift in an otherwise executable projection', () => {
  const valid = readFirstPartyRosterSource(ROSTER_PATH)[0];
  assert.throws(
    () => validateExecutableRoster([{ ...valid, selector: '[data-vertical=platform]' }]),
    /selector drifted/,
  );
  assert.throws(
    () => validateExecutableRoster([valid, { ...valid }]),
    /duplicate slug/,
  );
  assert.throws(
    () => validateExecutableRoster([{ ...valid, themeId: 'platform' }]),
    /slug, verticalKey and theme.id identical/,
  );
});

/** Installed Vite package directory; the only thing a fixture links to, read-only. */
const VITE_PACKAGE_DIR = realpathSync(
  dirname(createRequire(join(CORE_ROOT, 'package.json')).resolve('vite/package.json')),
);

/** Vite deletes `*_temp_*` cache entries whose directory mtime is older than this. */
const STALE_TEMP_AGE_MS = 24 * 60 * 60 * 1000;

/** A synthetic roster row that `validateExecutableRoster` accepts. */
const VALID_ROSTER_SOURCE = `type FixtureRow = {
  readonly slug: string;
  readonly verticalKey: string;
  readonly themeId: string;
  readonly name: string;
  readonly themeSourcePath: string;
  readonly artifactPath: string;
  readonly bundleFile: string;
  readonly styleEntry: string;
  readonly selector: string;
  readonly engine: 'modern';
  readonly fontPacks: readonly string[];
};

export const FIRST_PARTY_VERTICAL_ROSTER: readonly FixtureRow[] = [
  {
    slug: 'rottay',
    verticalKey: 'rottay',
    themeId: 'rottay',
    name: 'Rottay',
    themeSourcePath: 'foundation/presets/verticals/rottay/document/index.json',
    artifactPath: 'foundation/tokens/css/facade/artifacts/rottay/index.css',
    bundleFile: 'rottay.css',
    styleEntry: './styles/rottay',
    selector: ":is(html[data-tenant='rottay'], :where([data-ds-root][data-vertical='rottay']))",
    engine: 'modern',
    fontPacks: ['inter'],
  },
];
`;

/**
 * Build an owned fixture package whose Vite cache is a regular directory holding a
 * canary that Vite's stale-temp cleanup would delete.
 *
 * @param {Record<string, string>} modules File name to TypeScript source, written at the fixture root.
 * @returns {{ root: string, core: string, viteCache: string, canary: string, tmp: string }}
 *   `root` is the owned temp root, `core` the fixture package, `tmp` the owned TMPDIR for the call.
 */
function buildFixture(modules) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'roster-cache-fixture-')));
  const core = join(root, 'core');
  const viteCache = join(core, 'node_modules', '.vite');
  const canary = join(viteCache, 'deps_temp_canary');
  const tmp = join(root, 'tmp');
  mkdirSync(canary, { recursive: true });
  mkdirSync(tmp);
  // The package.json makes the fixture Vite's nearest package, so its default cache would be here.
  writeFileSync(
    join(core, 'package.json'),
    `${JSON.stringify({ name: 'roster-cache-fixture', private: true, type: 'module' })}\n`,
  );
  symlinkSync(VITE_PACKAGE_DIR, join(core, 'node_modules', 'vite'), 'dir');
  for (const [name, source] of Object.entries(modules)) writeFileSync(join(core, name), source);
  // Vite ages the DIRECTORY, so it is aged after `keep` is created (creating `keep` refreshes it).
  writeFileSync(join(canary, 'keep'), 'canary\n');
  const aged = new Date(Date.now() - 2 * STALE_TEMP_AGE_MS);
  utimesSync(join(canary, 'keep'), aged, aged);
  utimesSync(canary, aged, aged);
  return { root, core, viteCache, canary, tmp };
}

/**
 * Refuse to run the loader unless every writable path of the fixture is an owned regular entry
 * and its only link is the read-only Vite package leaf.
 *
 * @param {{ root: string, core: string, viteCache: string, canary: string }} fixture From `buildFixture`.
 */
function assertFixtureIsolated(fixture) {
  for (const directory of [fixture.root, fixture.core, join(fixture.core, 'node_modules'), fixture.viteCache]) {
    const stat = lstatSync(directory);
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), `${directory} must be a regular owned directory`);
    assert.equal(realpathSync(directory), directory, `${directory} must not resolve elsewhere`);
  }
  const manifest = lstatSync(join(fixture.core, 'package.json'));
  assert.ok(manifest.isFile() && !manifest.isSymbolicLink(), 'fixture package.json must be a regular file');
  const links = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) links.push(path);
      else if (entry.isDirectory()) walk(path);
      else assert.equal(lstatSync(path).nlink, 1, `${path} must not be a hard link`);
    }
  };
  walk(fixture.root);
  assert.deepEqual(links, [join(fixture.core, 'node_modules', 'vite')], 'the Vite leaf is the only link');
  assert.equal(realpathSync(links[0]), VITE_PACKAGE_DIR, 'the Vite leaf points at the installed package');
  assert.ok(realpathSync(fixture.viteCache).startsWith(`${fixture.root}${sep}`), 'the cache lies in the owned root');
}

/**
 * Snapshot the canary immediately before a loader call, asserting it is old enough to be deleted.
 *
 * @param {{ viteCache: string, canary: string }} fixture From `buildFixture`.
 * @returns {{ mtimeMs: number, entries: string[] }} Canary directory mtime and the cache entry names.
 */
function snapshotAgedCanary(fixture) {
  const { mtimeMs } = lstatSync(fixture.canary);
  assert.ok(mtimeMs < Date.now() - STALE_TEMP_AGE_MS, 'the canary directory must be older than Vite\'s cutoff');
  return { mtimeMs, entries: readdirSync(fixture.viteCache).sort() };
}

/**
 * Assert the loader left the fixture cache exactly as it was and no owned cache behind.
 *
 * @param {{ viteCache: string, canary: string, tmp: string }} fixture From `buildFixture`.
 * @param {{ mtimeMs: number, entries: string[] }} before From `snapshotAgedCanary`.
 */
function assertCacheUntouched(fixture, before) {
  const stat = lstatSync(fixture.canary);
  assert.ok(stat.isDirectory(), 'the canary directory survives');
  assert.equal(stat.mtimeMs, before.mtimeMs, 'the canary directory is not touched');
  assert.ok(existsSync(join(fixture.canary, 'keep')), 'the canary content survives');
  assert.deepEqual(readdirSync(fixture.viteCache).sort(), before.entries, 'nothing is written to the fixture cache');
  assert.deepEqual(readdirSync(fixture.tmp), [], 'no owned cache directory is left behind');
}

/**
 * Run `body` against a fresh isolated fixture with TMPDIR pointed at the fixture's owned temp dir.
 *
 * @param {Record<string, string>} modules Fixture modules, see `buildFixture`.
 * @param {(fixture: ReturnType<typeof buildFixture>) => void} body The test steps.
 */
function withFixture(modules, body) {
  const savedTmpdir = process.env.TMPDIR;
  const fixture = buildFixture(modules);
  try {
    assertFixtureIsolated(fixture);
    process.env.TMPDIR = fixture.tmp;
    body(fixture);
  } finally {
    if (savedTmpdir === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = savedTmpdir;
    rmSync(fixture.root, { recursive: true, force: true });
  }
}

test('executes a roster with a cache of its own, leaving the package cache and its stale entries intact', () => {
  withFixture({ 'roster.ts': VALID_ROSTER_SOURCE }, (fixture) => {
    const before = snapshotAgedCanary(fixture);
    const rows = readFirstPartyRosterSource(join(fixture.core, 'roster.ts'), { coreRoot: fixture.core });
    assert.deepEqual(rows.map((row) => row.slug), ['rottay']);
    assert.ok(Object.isFrozen(rows) && Object.isFrozen(rows[0]));
    assertCacheUntouched(fixture, before);
  });
});

test('removes its own cache when the module does not export a roster', () => {
  withFixture({ 'missing.ts': 'export const notTheRoster: readonly string[] = [];\n' }, (fixture) => {
    const before = snapshotAgedCanary(fixture);
    assert.throws(
      () => readFirstPartyRosterSource(join(fixture.core, 'missing.ts'), { coreRoot: fixture.core }),
      /FIRST_PARTY_VERTICAL_ROSTER/,
    );
    assertCacheUntouched(fixture, before);
  });
});

test('removes its own cache when the module fails to load', () => {
  const broken = "throw new Error('fixture module fails at load');\nexport const FIRST_PARTY_VERTICAL_ROSTER = [];\n";
  withFixture({ 'broken.ts': broken }, (fixture) => {
    const before = snapshotAgedCanary(fixture);
    assert.throws(
      () => readFirstPartyRosterSource(join(fixture.core, 'broken.ts'), { coreRoot: fixture.core }),
      /source execution failed/,
    );
    assertCacheUntouched(fixture, before);
  });
});

test('creates its cache in TMPDIR before spawning and removes it when the child cannot start', () => {
  assert.notEqual(process.getuid?.(), 0, 'an unwritable TMPDIR is only a witness for a non-root user');
  withFixture({ 'roster.ts': VALID_ROSTER_SOURCE }, (fixture) => {
    const before = snapshotAgedCanary(fixture);
    chmodSync(fixture.tmp, 0o500);
    try {
      assert.throws(
        () => readFirstPartyRosterSource(join(fixture.core, 'roster.ts'), { coreRoot: fixture.core }),
        /owned Vite cache could not be created/,
      );
    } finally {
      chmodSync(fixture.tmp, 0o700);
    }
    assert.deepEqual(snapshotAgedCanary(fixture), before);
    assert.throws(
      () => readFirstPartyRosterSource(join(fixture.core, 'roster.ts'), { coreRoot: join(fixture.core, 'absent') }),
      /could not complete/,
    );
    assertCacheUntouched(fixture, before);
  });
});
