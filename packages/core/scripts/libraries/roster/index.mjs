import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from '../repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/**
 * Name prefix of the Vite cache directory each roster execution creates for
 * itself under the OS temp root. The directory is removed when the execution
 * ends, so a leftover entry with this prefix is residue, never a shared cache.
 */
const OWNED_CACHE_PREFIX = 'ds-roster-vite-';

const EXECUTABLE_PROJECTION = String.raw`
import { createServer } from 'vite';
import { resolve, relative } from 'node:path';

const [modulePath, coreRoot, cacheDir] = process.argv.slice(1);
// The dependency optimizer writes into the directory the parent created for
// this execution alone. Vite's default <package>/node_modules/.vite is shared by
// every checkout that links the same node_modules, and the optimizer's startup
// cleanup deletes other runs' stale temp directories there.
const server = await createServer({
  root: coreRoot,
  cacheDir,
  configFile: false,
  logLevel: 'silent',
  appType: 'custom',
  server: { middlewareMode: true },
  resolve: { alias: { '@': resolve(coreRoot, 'src') } },
});
try {
  const rel = relative(coreRoot, modulePath).replaceAll('\\\\', '/');
  const id = rel.startsWith('../') ? '/@fs/' + modulePath : '/' + rel;
  const loaded = await server.ssrLoadModule(id);
  const roster = loaded.FIRST_PARTY_VERTICAL_ROSTER;
  if (!Array.isArray(roster)) throw new Error('FIRST_PARTY_VERTICAL_ROSTER is not an array');
  process.stdout.write(JSON.stringify(roster.map((row) => ({
    slug: row.slug,
    verticalKey: row.verticalKey,
    themeId: row.themeId,
    name: row.name,
    themeSourcePath: row.themeSourcePath,
    artifactPath: row.artifactPath,
    bundleFile: row.bundleFile,
    styleEntry: row.styleEntry,
    selector: row.selector,
    engine: row.engine,
    fontPacks: row.fontPacks,
    // The neutral foundation and the vertical presets author no spring, so no
    // first-party bundle carries a precomputed easing.
    springEasing: null,
  }))));
} finally {
  await server.close();
}
`;

function fail(message, path) {
  throw new Error(`Executable first-party roster rejected ${path}: ${message}`);
}

export function validateExecutableRoster(rows, path = '<runtime>') {
  if (!Array.isArray(rows) || rows.length === 0) fail('roster must be a non-empty array', path);
  const slugs = new Set();
  return Object.freeze(rows.map((candidate, index) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      fail(`row ${index} is not an object`, path);
    }
    const row = candidate;
    if (typeof row.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(row.slug)) {
      fail(`row ${index} slug is not canonical lower-kebab`, path);
    }
    if (slugs.has(row.slug)) fail(`duplicate slug ${row.slug}`, path);
    slugs.add(row.slug);
    if (row.verticalKey !== row.slug || row.themeId !== row.slug) {
      fail(`row ${row.slug} does not keep slug, verticalKey and theme.id identical`, path);
    }
    const expected = {
      themeSourcePath: `foundation/presets/verticals/${row.slug}/document/index.json`,
      artifactPath: `foundation/tokens/css/facade/artifacts/${row.slug}/index.css`,
      bundleFile: `${row.slug}.css`,
      styleEntry: `./styles/${row.slug}`,
      selector: `:is(html[data-tenant='${row.slug}'], :where([data-ds-root][data-vertical='${row.slug}']))`,
    };
    for (const [field, value] of Object.entries(expected)) {
      if (row[field] !== value) fail(`row ${row.slug} ${field} drifted: ${JSON.stringify(row[field])}`, path);
    }
    if (row.engine !== 'modern') fail(`row ${row.slug} engine is not modern`, path);
    if (typeof row.name !== 'string' || row.name.length === 0) fail(`row ${row.slug} has no name`, path);
    if (!Array.isArray(row.fontPacks) || row.fontPacks.length === 0) {
      fail(`row ${row.slug} fontPacks must be non-empty`, path);
    }
    if (
      row.fontPacks.some((pack) => typeof pack !== 'string' || pack.length === 0)
      || new Set(row.fontPacks).size !== row.fontPacks.length
    ) {
      fail(`row ${row.slug} fontPacks must be unique non-empty strings`, path);
    }
    if (row.springEasing !== null) {
      fail(`row ${row.slug} carries a spring easing no first-party source authors`, path);
    }
    return Object.freeze({ ...row, fontPacks: Object.freeze([...row.fontPacks]) });
  }));
}

/**
 * Run the projection child against one roster module and validate what it prints.
 *
 * @param {string} path Roster module to execute.
 * @param {string} coreRoot Vite root, child working directory and `@` alias base.
 * @param {string} cacheDir Owned Vite cache directory created for this execution.
 * @returns {ReadonlyArray<Readonly<Record<string, unknown>>>} The validated, frozen roster rows.
 * @throws {Error} When the child cannot run, exits non-zero, prints non-JSON or the rows fail validation.
 */
function executeProjection(path, coreRoot, cacheDir) {
  const outcome = spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', EXECUTABLE_PROJECTION, resolve(path), coreRoot, cacheDir],
    { cwd: coreRoot, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 30_000 },
  );
  if (outcome.error) {
    fail(`source execution could not complete: ${outcome.error.message}`, relative(coreRoot, path));
  }
  if (outcome.status !== 0) {
    fail(
      `source execution failed (${outcome.signal ?? outcome.status}): ${(outcome.stderr || outcome.stdout).trim()}`,
      relative(coreRoot, path),
    );
  }
  let rows;
  try {
    rows = JSON.parse(outcome.stdout);
  } catch (error) {
    fail(`source execution returned non-JSON: ${error.message}`, relative(coreRoot, path));
  }
  return validateExecutableRoster(rows, relative(coreRoot, path));
}

/**
 * Execute the authored TypeScript roster through Vite's source loader.
 *
 * Each call gives Vite a cache directory of its own: it is created under the OS
 * temp root before the child starts and removed when the call ends, whatever the
 * outcome. Nothing is written to, or deleted from, the `.vite` cache that
 * `coreRoot`'s `node_modules` may share with other checkouts.
 *
 * @param {string} path Roster module to execute (absolute, or relative to the working directory).
 * @param {{ coreRoot?: string }} [options] `coreRoot`: Vite root, child working directory and
 *   `@` alias base; defaults to this package.
 * @returns {ReadonlyArray<Readonly<Record<string, unknown>>>} The validated, frozen roster rows.
 * @throws {Error} `Executable first-party roster rejected …` when the owned cache cannot be
 *   created, the child cannot run, exits non-zero, prints non-JSON, the rows fail validation, or
 *   the owned cache cannot be removed. A removal failure after another failure keeps that first
 *   message as the prefix and the first error as `cause`.
 */
export function readFirstPartyRosterSource(path, { coreRoot = CORE_ROOT } = {}) {
  // Created before the child exists, so every later outcome (spawn or cwd error, timeout kill,
  // failing module, rejected output) reaches the single removal below.
  let cacheDir;
  try {
    cacheDir = mkdtempSync(join(tmpdir(), OWNED_CACHE_PREFIX));
  } catch (error) {
    fail(`owned Vite cache could not be created: ${error.message}`, relative(coreRoot, path));
  }

  let rows;
  let primary = null;
  try {
    rows = executeProjection(path, coreRoot, cacheDir);
  } catch (error) {
    primary = error;
  }

  // `force` only tolerates an already-missing directory; any other removal error is
  // reported, never swallowed, without hiding a failure that happened first.
  let cleanupError = null;
  try {
    rmSync(cacheDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  } catch (error) {
    cleanupError = error;
  }

  if (primary !== null) {
    if (cleanupError === null) throw primary;
    throw new Error(`${primary.message}; owned Vite cache cleanup also failed: ${cleanupError.message}`, {
      cause: primary,
    });
  }
  if (cleanupError !== null) {
    fail(`owned Vite cache cleanup failed: ${cleanupError.message}`, relative(coreRoot, path));
  }
  return rows;
}
