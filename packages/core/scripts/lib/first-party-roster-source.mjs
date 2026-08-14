import { spawnSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CORE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const EXECUTABLE_PROJECTION = String.raw`
import { createServer } from 'vite';
import { resolve, relative } from 'node:path';

const [modulePath, coreRoot] = process.argv.slice(1);
const server = await createServer({
  root: coreRoot,
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
  const { springLinearEasing } = await server.ssrLoadModule(
    '/src/infrastructure/compilers/kernel/foundation/motion/spring-easing/index.ts'
  );
  const roster = loaded.FIRST_PARTY_VERTICAL_ROSTER;
  if (!Array.isArray(roster)) throw new Error('FIRST_PARTY_VERTICAL_ROSTER is not an array');
  process.stdout.write(JSON.stringify(roster.map((row) => {
    const motion = row.theme?.motion;
    const springEligible = motion
      && typeof motion.springTension === 'number'
      && typeof motion.springFriction === 'number'
      && motion.useSpring !== false;
    return {
      slug: row.slug,
      verticalKey: row.verticalKey,
      themeId: row.theme?.id,
      name: row.name,
      themeSourcePath: row.themeSourcePath,
      artifactPath: row.artifactPath,
      bundleFile: row.bundleFile,
      styleEntry: row.styleEntry,
      selector: row.selector,
      engine: row.engine,
      fontPacks: row.fontPacks,
      springTension: motion?.springTension,
      springFriction: motion?.springFriction,
      useSpring: motion?.useSpring,
      springEasing: springEligible
        ? springLinearEasing(motion.springTension, motion.springFriction)
        : null,
    };
  })));
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
      themeSourcePath: `foundation/tokens/ts/presentation/brand-themes/${row.slug}/index.ts`,
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
    const springEligible = typeof row.springTension === 'number'
      && typeof row.springFriction === 'number'
      && row.useSpring !== false;
    if (springEligible && (typeof row.springEasing !== 'string' || !row.springEasing.startsWith('linear('))) {
      fail(`row ${row.slug} has no source-computed spring easing`, path);
    }
    if (!springEligible && row.springEasing !== null) {
      fail(`row ${row.slug} has a spring easing despite being ineligible`, path);
    }
    return Object.freeze({ ...row, fontPacks: Object.freeze([...row.fontPacks]) });
  }));
}

/** Execute the authored TypeScript roster through Vite's source loader. */
export function readFirstPartyRosterSource(path, { coreRoot = CORE_ROOT } = {}) {
  const outcome = spawnSync(
    process.execPath,
    ['--input-type=module', '--eval', EXECUTABLE_PROJECTION, resolve(path), coreRoot],
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
