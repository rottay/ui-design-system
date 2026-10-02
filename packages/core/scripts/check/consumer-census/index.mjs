#!/usr/bin/env node
/**
 * consumer-census — the decrease-only anchor for surface retirement.
 *
 * WHAT IT MEASURES, in one pass over the published map and the four
 * consumer roots:
 *
 *   1. Per public subpath of packages/core (the package.json `exports` map):
 *      which consumer roots import it. A consumer import is a static
 *      `import`/`export ... from`, a dynamic `import()` or a `require()` whose
 *      module specifier is a STRING LITERAL naming the package (`@rottay/
 *      design-system` or `@rottay/design-system/<subpath>`), parsed with the
 *      TypeScript compiler API. A specifier inside a comment or an ordinary
 *      string never reaches the AST as a module specifier, so prose cannot
 *      certify consumption.
 *   2. Internal reachability: every module under src/ that no export
 *      entrypoint reaches is `unreachable`; a module reachable only from
 *      test files is `test-only`. CSS files under src that no JS module
 *      imports AND the CSS build does not include (relative-`@import`
 *      closure of the build's entry stylesheets, the way
 *      scripts/build/verticals/css-build composes the shipped bundles) are
 *      `styles-unreferenced`.
 *
 * THE GATE is fail-closed in every mode. A required consumer root that is
 * missing or unreadable is a hard failure, never a skip: a census computed
 * over three roots when a fourth is absent reports consumption that may not
 * exist, and a retirement lot citing it would retire a surface a missing
 * root still uses. `--check` additionally fails when the measured
 * consumerless / unreachable / test-only sets GREW versus the baseline,
 * naming every new member; shrinkage never fails (retirements shrink it).
 * `--write` rewrites the baseline and refuses while a required root is
 * missing.
 *
 * Usage:
 *   node scripts/check/consumer-census/index.mjs            report, exit 0
 *   node scripts/check/consumer-census/index.mjs --check    CI ratchet
 *   node scripts/check/consumer-census/index.mjs --write    rewrite baseline
 *   [--baseline=<path>] [--package-root=<path>]
 *   [--consumers=<id>=<abs path>,[<id>=<abs path>...]]      override roots
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

import { importClosure } from '../../libraries/engine/frozen-mount/index.mjs';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);
const WORKSPACE_ROOT = findRepoRoot(HERE);

/**
 * The sibling application repositories live one level above this checkout.
 * A linked git worktree is not beside them: its `.git` is a FILE pointing
 * into the main checkout's `.git/worktrees/<name>`, so the directory that
 * holds the siblings is the main checkout's parent, read through the pointer.
 */
export function siblingReposRoot(fromDir = HERE) {
  const checkout = findRepoRoot(fromDir);
  const gitPath = join(checkout, '.git');
  const marker = `${sep}.git${sep}worktrees${sep}`;
  try {
    if (statSync(gitPath).isFile()) {
      const pointer = /^gitdir:\s*(.+)$/m.exec(readFileSync(gitPath, 'utf8'))?.[1]?.trim();
      if (pointer && pointer.includes(marker)) {
        return resolve(pointer.slice(0, pointer.indexOf(marker)), '..');
      }
    }
  } catch {
    // A checkout with no readable `.git` is the plain case: fall through.
  }
  return resolve(checkout, '..');
}

const SIBLING_ROOT = siblingReposRoot(HERE);

/**
 * Every root a retirement decision cites. All four are required and
 * READ-ONLY: this gate walks their source text and never writes under any
 * of them. `showroom` is the in-repo consumer; the applications are sibling
 * repositories resolved beside the checkout (see `siblingReposRoot`).
 */
export const DEFAULT_CONSUMER_ROOTS = Object.freeze([
  Object.freeze({ id: 'showroom', root: resolve(CORE_ROOT, '../showroom/src'), required: true }),
  Object.freeze({ id: 'app-bithire', root: resolve(SIBLING_ROOT, 'app-bithire/src'), required: true }),
  Object.freeze({ id: 'app-evnto', root: resolve(SIBLING_ROOT, 'app-evnto/src'), required: true }),
  Object.freeze({ id: 'app-platform', root: resolve(SIBLING_ROOT, 'app-platform/src'), required: true }),
]);

export const DEFAULT_BASELINE_PATH = resolve(HERE, 'baseline/index.json');

const CONSUMER_SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx']);
const SOURCE_MODULE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.mjs', '.cjs', '.js', '.jsx']);
const RESOLVE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts', '.mjs', '.js', '.jsx', '.json', '.css', '.d.ts'];
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git', 'dist']);
const TEST_CONTAINERS = new Set(['tests', '__tests__', '__test__', 'fixtures', '_fixtures', '__fixtures__']);
const TEST_FILE_PATTERN = /\.(?:test|spec)\.[cm]?[jt]sx?$/u;
const STORY_FILE_PATTERN = /\.stories\.[cm]?[jt]sx?$/u;
const EXAMPLE_FILE_PATTERN = /(?:^|[.-])(?:examples?|usage-example|advanced-examples?)\.[cm]?[jt]sx?$/iu;
const DECLARATION_FILE_PATTERN = /\.d\.[cm]?ts$/u;
const PACKAGE_JSON = 'package.json';

// ── small filesystem + syntax helpers ──────────────────────────────────────

/** Every file under `root` whose extension passes `accept`, sorted, absolute. */
export function walkFiles(root, accept) {
  const found = [];
  const pending = [root];
  while (pending.length > 0) {
    const directory = pending.pop();
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.') continue;
      const full = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) pending.push(full);
      } else if (entry.isFile() && accept(full)) {
        found.push(full);
      }
    }
  }
  return found.sort();
}

/**
 * The module specifiers one source file names, from the AST only:
 * ImportDeclaration, ExportDeclaration, `import x = require(...)`,
 * `require('...')` and `import('...')` calls with a string literal (or a
 * template literal with no substitutions) as the first argument. Comments
 * and string expressions are never module specifiers, so they cannot be
 * counted as imports.
 */
export function parseModuleSpecifiers(filePath, text) {
  const kind = filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
    ? ts.ScriptKind.TSX
    : filePath.endsWith('.js') || filePath.endsWith('.jsx')
      ? ts.ScriptKind.JS
      : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.ES2020, false, kind);
  const specifiers = [];
  const visit = (node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifiers.push(node.moduleSpecifier.text);
      }
    } else if (ts.isImportEqualsDeclaration(node)
      && ts.isExternalModuleReference(node.moduleReference)
      && node.moduleReference.expression
      && ts.isStringLiteral(node.moduleReference.expression)) {
      specifiers.push(node.moduleReference.expression.text);
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const isRequire = ts.isIdentifier(callee) && callee.text === 'require';
      const isDynamicImport = callee.kind === ts.SyntaxKind.ImportKeyword;
      if ((isRequire || isDynamicImport) && node.arguments.length >= 1) {
        const argument = node.arguments[0];
        if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) {
          specifiers.push(argument.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return specifiers;
}

function readSpecifiers(filePath, cache) {
  if (!cache.has(filePath)) {
    let text;
    try {
      text = readFileSync(filePath, 'utf8');
    } catch {
      text = '';
    }
    cache.set(filePath, parseModuleSpecifiers(filePath, text));
  }
  return cache.get(filePath);
}

// ── the published map ──────────────────────────────────────────────────────

export function loadPackageManifest(packageRoot) {
  const path = join(packageRoot, PACKAGE_JSON);
  if (!existsSync(path)) {
    throw new Error(`consumer-census: no ${PACKAGE_JSON} at ${packageRoot}`);
  }
  return { path, manifest: JSON.parse(readFileSync(path, 'utf8')) };
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const body = Object.keys(value).sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',');
    return `{${body}}`;
  }
  return JSON.stringify(value);
}

/** The digest pinning WHICH subpaths the package publishes, independent of file order. */
export function computeExportsDigest(exportsMap) {
  return `sha256-${createHash('sha256').update(stableStringify(exportsMap)).digest('hex')}`;
}

function exportTarget(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return value.import ?? value.default ?? null;
  }
  return null;
}

/**
 * The source entrypoints one published subpath is built from. `dist/<x>.js`
 * maps to `src/<x>` with a source extension (the vite build preserves the
 * module tree); flat dist files (`dist/icons.js`) map through the
 * `releaseSync.sourceEntrypoints` table. Wildcard targets make every
 * matching source file under the mapped directory an entrypoint. CSS and
 * JSON targets publish no JS modules.
 */
export function entrySourcesForSubpath(subpath, exportsMap, packageRoot) {
  const target = exportTarget(exportsMap[subpath]);
  if (typeof target !== 'string' || !target.startsWith('./dist/')) return [];
  const manifest = JSON.parse(readFileSync(join(packageRoot, PACKAGE_JSON), 'utf8'));

  if (target.includes('*')) {
    const base = target.slice('./dist/'.length).replace(/\*\.[cm]?js$/, '');
    const directory = resolve(packageRoot, 'src', base);
    if (!existsSync(directory)) return [];
    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile()
        && SOURCE_MODULE_EXTENSIONS.has(extnameOf(entry.name))
        && !DECLARATION_FILE_PATTERN.test(entry.name))
      .map((entry) => join(directory, entry.name))
      .sort();
  }

  const base = target.slice('./dist/'.length).replace(/\.(?:[cm]?js|cjs)$/, '');
  const candidates = [
    ...RESOLVE_EXTENSIONS.map((extension) => `src/${base}${extension}`),
    ...['.ts', '.tsx', '.mts', '.mjs'].map((extension) => `src/${base}/index${extension}`),
  ];
  for (const candidate of candidates) {
    const full = resolve(packageRoot, candidate);
    if (existsSync(full) && statSync(full).isFile()) return [full];
  }
  const synced = manifest.releaseSync?.sourceEntrypoints?.[subpath];
  if (typeof synced === 'string') {
    const full = resolve(packageRoot, 'src', synced);
    if (existsSync(full)) return [full];
  }
  return [];
}

function extnameOf(name) {
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot);
}

// ── consumer census ─────────────────────────────────────────────────────────

/**
 * Maps a consumer specifier onto the exports map. The bare package name is
 * the `.` subpath; `@rottay/design-system/x` and `@rottay/design-system/./x`
 * are the same subpath (the exports keys carry the `./` prefix, consumer
 * specifiers do not). Wildcard keys match by pattern. Specifiers that name
 * no published subpath are returned unmatched: they are counted nowhere.
 */
export function classifyConsumerSpecifier(specifier, packageName, exportsMap) {
  let rest = null;
  if (specifier === packageName) rest = '';
  else if (specifier.startsWith(`${packageName}/`)) rest = specifier.slice(packageName.length + 1);
  else return { matched: null, unmatched: false };

  const normalized = rest.replace(/^\.\//, '');
  if (normalized.length === 0) return { matched: '.', unmatched: false };
  const exact = `./${normalized}`;
  if (Object.hasOwn(exportsMap, exact)) return { matched: exact, unmatched: false };
  for (const key of Object.keys(exportsMap).sort()) {
    const star = key.indexOf('*');
    if (star < 0) continue;
    const prefix = key.slice(2, star);
    const suffix = key.slice(star + 1);
    if (normalized.startsWith(prefix) && normalized.endsWith(suffix)
      && normalized.length >= prefix.length + suffix.length) {
      return { matched: key, unmatched: false };
    }
  }
  return { matched: null, unmatched: rest !== null };
}

function isReadableDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Which consumer roots import which published subpath. Every parse error is
 * a hard failure: a consumer root whose files cannot be read is absent
 * census coverage, and reporting consumption over a partial walk is the
 * silent failure this gate exists to prevent.
 */
export function measureConsumers({ packageRoot, consumerRoots }) {
  const { manifest } = loadPackageManifest(packageRoot);
  const packageName = manifest.name;
  const exportsMap = manifest.exports ?? {};
  const subpaths = Object.keys(exportsMap).sort();
  const consumersBySubpath = new Map(subpaths.map((key) => [key, new Set()]));
  const unmatched = new Map();
  const unreadable = [];

  for (const root of consumerRoots) {
    if (!isReadableDirectory(root.root)) {
      if (root.required) unreadable.push(root.id);
      continue;
    }
    const files = walkFiles(root.root, (path) => CONSUMER_SOURCE_EXTENSIONS.has(extnameOf(path)));
    for (const file of files) {
      let specifiers;
      try {
        specifiers = parseModuleSpecifiers(file, readFileSync(file, 'utf8'));
      } catch (error) {
        throw new Error(`consumer-census: cannot parse ${file}: ${error.message}`);
      }
      for (const specifier of specifiers) {
        const { matched, unmatched: isUnmatched } = classifyConsumerSpecifier(specifier, packageName, exportsMap);
        if (matched) consumersBySubpath.get(matched).add(root.id);
        else if (isUnmatched) {
          if (!unmatched.has(specifier)) unmatched.set(specifier, new Set());
          unmatched.get(specifier).add(root.id);
        }
      }
    }
  }

  const perSubpathConsumers = {};
  for (const key of subpaths) {
    perSubpathConsumers[key] = [...consumersBySubpath.get(key)].sort();
  }
  const consumerlessSubpaths = subpaths.filter((key) => consumersBySubpath.get(key).size === 0);
  return {
    packageName,
    subpaths,
    perSubpathConsumers,
    consumerlessSubpaths,
    unmatchedSpecifiers: Object.fromEntries(
      [...unmatched.keys()].sort().map((specifier) => [specifier, [...unmatched.get(specifier)].sort()]),
    ),
    unreadableRoots: unreadable,
  };
}

// ── internal reachability ───────────────────────────────────────────────────

function isTestFile(relativePath) {
  return TEST_FILE_PATTERN.test(relativePath);
}

/**
 * Authored-unit classification for the module buckets. Test files, stories,
 * examples, fixtures and declaration files are walked (their imports count,
 * e.g. for CSS referencing) but are never reported as unreachable or
 * test-only modules: a demo-only or test-only consumer is not a productive
 * reachability fact, and the structure audit owns their placement laws.
 */
function isCensusModule(relativePath) {
  if (DECLARATION_FILE_PATTERN.test(relativePath)) return false;
  if (TEST_FILE_PATTERN.test(relativePath)) return false;
  if (STORY_FILE_PATTERN.test(relativePath)) return false;
  if (EXAMPLE_FILE_PATTERN.test(relativePath)) return false;
  const segments = relativePath.split('/');
  return !segments.slice(0, -1).some((segment) => TEST_CONTAINERS.has(segment));
}

/** Resolves a relative or `@/`-aliased specifier from `fromFile` to an absolute src path. */
export function resolveSourceSpecifier(fromFile, specifier, srcRoot) {
  let base = null;
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    base = resolve(dirname(fromFile), specifier);
  } else if (specifier === '.' || specifier === '..') {
    base = resolve(dirname(fromFile), specifier);
  } else if (specifier.startsWith('@/')) {
    base = resolve(srcRoot, specifier.slice(2));
  } else if (specifier.startsWith('@types/')) {
    base = resolve(srcRoot, 'foundation/contracts', specifier.slice('@types/'.length));
  } else if (specifier.startsWith('@ui/')) {
    base = resolve(srcRoot, 'components', specifier.slice('@ui/'.length));
  } else {
    return null;
  }
  const candidates = [base, ...RESOLVE_EXTENSIONS.map((extension) => `${base}${extension}`)];
  const directory = base.endsWith('/') ? base.slice(0, -1) : base;
  for (const extension of RESOLVE_EXTENSIONS) candidates.push(`${directory}/index${extension}`);
  for (const candidate of candidates) {
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

/**
 * The entry stylesheets scripts/build/verticals/css-build composes the
 * shipped bundles from. Vertical artifacts and font packs are enumerated
 * from the same directories the build reads; the roster contract pins each
 * vertical's artifact path to `facade/artifacts/<slug>/index.css`, so the
 * directory population IS the build corpus. A missing seed is a measurement
 * failure, not an empty closure: the skins load through the build, and a
 * build whose entry stylesheet is gone includes nothing by absence.
 */
export function cssBuildEntries(packageRoot) {
  const cssRoot = resolve(packageRoot, 'src/foundation/tokens/css');
  const seeds = [
    resolve(cssRoot, 'facade/entrypoints/base/index.css'),
    resolve(cssRoot, 'runtime/engines/frozen/index.css'),
    resolve(cssRoot, 'runtime/engines/modern/compiled/index.css'),
  ];
  const directories = [
    resolve(cssRoot, 'facade/artifacts'),
    resolve(cssRoot, 'foundation/typography/font-packs'),
  ];
  for (const directory of directories) {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || TEST_CONTAINERS.has(entry.name) || SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const candidate = join(directory, entry.name, 'index.css');
      if (existsSync(candidate)) seeds.push(candidate);
    }
  }
  return seeds.sort();
}

function reachableFrom(roots, srcRoot, specifiersCache) {
  const seen = new Set();
  const pending = [...roots];
  while (pending.length > 0) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!file.startsWith(srcRoot)) continue;
    if (!SOURCE_MODULE_EXTENSIONS.has(extnameOf(file)) && extnameOf(file) !== '.json') continue;
    if (extnameOf(file) === '.json') continue; // a JSON document names no module specifiers
    for (const specifier of readSpecifiers(file, specifiersCache)) {
      const target = resolveSourceSpecifier(file, specifier, srcRoot);
      if (target && !seen.has(target)) pending.push(target);
    }
  }
  return seen;
}

/**
 * Internal census over the authored source tree. One parse per module; the
 * productive reachability set is the import closure of every export
 * entrypoint source, the test reachability set is the closure of every test
 * file, and CSS is referenced when any parsed JS module imports it or the
 * build's entry-style closure reaches it.
 */
export function measureInternals({ packageRoot }) {
  const srcRoot = resolve(packageRoot, 'src');
  if (!isReadableDirectory(srcRoot)) {
    throw new Error(`consumer-census: no readable src root at ${srcRoot}`);
  }
  const allFiles = walkFiles(srcRoot, () => true);
  const jsFiles = allFiles.filter((path) => SOURCE_MODULE_EXTENSIONS.has(extnameOf(path)));
  const cssFiles = allFiles.filter((path) => extnameOf(path) === '.css');

  const { manifest } = loadPackageManifest(packageRoot);
  const exportsMap = manifest.exports ?? {};
  const subpaths = Object.keys(exportsMap).sort();

  const specifiersCache = new Map();
  const entrySources = [];
  for (const key of subpaths) {
    entrySources.push(...entrySourcesForSubpath(key, exportsMap, packageRoot));
  }

  const productive = reachableFrom(entrySources, srcRoot, specifiersCache);
  const testRoots = jsFiles.filter((file) => isTestFile(relative(srcRoot, file)));
  const testReachable = reachableFrom(testRoots, srcRoot, specifiersCache);

  const toPackagePath = (absolute) => relative(packageRoot, absolute).split(sep).join('/');

  const censusModules = new Map();
  for (const file of jsFiles) {
    const rel = toPackagePath(file);
    if (isCensusModule(rel)) censusModules.set(file, rel);
  }

  const reachableModules = [];
  const testOnlyModules = [];
  const unreachableModules = [];
  for (const [file, rel] of [...censusModules.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
    if (productive.has(file)) reachableModules.push(rel);
    else if (testReachable.has(file)) testOnlyModules.push(rel);
    else unreachableModules.push(rel);
  }

  const referencedCss = new Set();
  for (const file of jsFiles) {
    for (const specifier of readSpecifiers(file, specifiersCache)) {
      const target = resolveSourceSpecifier(file, specifier, srcRoot);
      if (target && extnameOf(target) === '.css') referencedCss.add(target);
    }
  }
  const missingCssSeeds = [];
  let buildCss = new Set();
  for (const seed of cssBuildEntries(packageRoot)) {
    if (!existsSync(seed)) {
      missingCssSeeds.push(toPackagePath(seed));
      continue;
    }
    buildCss = new Set([...buildCss, ...importClosure(seed)]);
  }
  const stylesUnreferenced = cssFiles
    .filter((file) => !referencedCss.has(file) && !buildCss.has(file))
    .map(toPackagePath)
    .sort();

  return {
    srcRoot,
    entrySourceCount: entrySources.length,
    moduleCount: censusModules.size,
    reachableModules,
    testOnlyModules,
    unreachableModules,
    stylesUnreferenced,
    missingCssSeeds,
  };
}

// ── the measurement, the baseline and the gate ──────────────────────────────

export function measure(options = {}) {
  const packageRoot = options.packageRoot ?? CORE_ROOT;
  const consumerRoots = options.consumerRoots ?? DEFAULT_CONSUMER_ROOTS;
  const consumers = measureConsumers({ packageRoot, consumerRoots });
  const internals = measureInternals({ packageRoot });
  const { manifest } = loadPackageManifest(packageRoot);
  const missingRoots = consumerRoots
    .filter((root) => root.required !== false && !isReadableDirectory(root.root))
    .map((root) => ({ id: root.id, root: root.root }));
  return {
    packageRoot,
    exportsDigest: computeExportsDigest(manifest.exports ?? {}),
    subpaths: consumers.subpaths,
    perSubpathConsumers: consumers.perSubpathConsumers,
    consumerlessSubpaths: consumers.consumerlessSubpaths,
    unmatchedSpecifiers: consumers.unmatchedSpecifiers,
    reachableModules: internals.reachableModules,
    unreachableModules: internals.unreachableModules,
    testOnlyModules: internals.testOnlyModules,
    stylesUnreferenced: internals.stylesUnreferenced,
    missingCssSeeds: internals.missingCssSeeds,
    entrySourceCount: internals.entrySourceCount,
    moduleCount: internals.moduleCount,
    missingRoots,
  };
}

export const BASELINE_SCHEMA_VERSION = 1;

export function createBaseline(measured) {
  return {
    schemaVersion: BASELINE_SCHEMA_VERSION,
    policy: 'decrease-only',
    purpose:
      'Consumer census anchor (WO-RET-01 step 1): every published subpath classified by consumption '
      + 'across the four consumer roots, plus the internal reachability census. Growth in '
      + 'consumerlessSubpaths / unreachableModules / testOnlyModules fails --check naming every new '
      + 'member; shrinkage never fails (retirements shrink it). stylesUnreferenced is reported, not '
      + 'ratcheted. exportsDigest pins the published subpath map; a drifted digest means the map '
      + 'moved and the baseline must be rewritten by a sighted --write.',
    measured: 'consumer-census',
    exportsDigest: measured.exportsDigest,
    consumerlessSubpaths: [...measured.consumerlessSubpaths].sort(),
    unreachableModules: [...measured.unreachableModules].sort(),
    testOnlyModules: [...measured.testOnlyModules].sort(),
    stylesUnreferenced: [...measured.stylesUnreferenced].sort(),
  };
}

export function writeBaseline(measured, baselinePath = DEFAULT_BASELINE_PATH) {
  const baseline = createBaseline(measured);
  mkdirSync(dirname(baselinePath), { recursive: true });
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  return baseline;
}

export function readBaseline(baselinePath = DEFAULT_BASELINE_PATH) {
  if (!existsSync(baselinePath)) {
    throw new Error(`consumer-census: missing baseline at ${baselinePath} — run with --write after a sighted review`);
  }
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  } catch (error) {
    throw new Error(`consumer-census: baseline at ${baselinePath} does not parse: ${error.message}`);
  }
  if (baseline.schemaVersion !== BASELINE_SCHEMA_VERSION || !Array.isArray(baseline.consumerlessSubpaths)) {
    throw new Error('consumer-census: baseline must use schemaVersion 1 with the sorted sets this gate writes');
  }
  return baseline;
}

/**
 * Growth fails, by name, in either direction of bad news. Shrinkage is a
 * ratchet opportunity, never a failure. stylesUnreferenced is a report
 * bucket: it is stored in the baseline for visibility and deliberately not
 * growth-checked, because a new unreferenced stylesheet is a report fact a
 * retirement lot cites, not a census defect by itself.
 */
export function compareWithBaseline(measured, baseline) {
  const findings = [];
  if (baseline.exportsDigest !== measured.exportsDigest) {
    findings.push({
      leg: 'exports-digest',
      detail:
        `the package.json exports map changed (baseline ${baseline.exportsDigest}, measured `
        + `${measured.exportsDigest}) and the census baseline was not rewritten — run --write after `
        + 'a sighted review of which subpaths moved',
    });
  }
  const legs = [
    ['consumerless-subpaths', 'consumerlessSubpaths', measured.consumerlessSubpaths, baseline.consumerlessSubpaths],
    ['unreachable-modules', 'unreachableModules', measured.unreachableModules, baseline.unreachableModules],
    ['test-only-modules', 'testOnlyModules', measured.testOnlyModules, baseline.testOnlyModules],
  ];
  const opportunities = [];
  for (const [leg, field, current, pinned] of legs) {
    const currentSet = new Set(current);
    const pinnedSet = new Set(pinned ?? []);
    const grown = [...currentSet].filter((member) => !pinnedSet.has(member)).sort();
    if (grown.length > 0) {
      findings.push({
        leg,
        detail: `${field} grew by ${grown.length}: ${grown.join(', ')}`,
      });
    }
    const shrank = [...pinnedSet].filter((member) => !currentSet.has(member)).sort();
    if (shrank.length > 0) opportunities.push(`${field}: ${shrank.length} resolved (${shrank.slice(0, 5).join(', ')}${shrank.length > 5 ? ', …' : ''})`);
  }
  return { findings, opportunities };
}

function missingRootFindings(measured) {
  return measured.missingRoots.map((root) => ({
    leg: 'consumer-root',
    detail:
      `required consumer root "${root.id}" is missing or unreadable at ${root.root} — a census over `
      + 'the remaining roots reports consumption that may not exist; restore the root and re-run',
  }));
}

// ── cli ─────────────────────────────────────────────────────────────────────

function optionOf(argv, name, fallback) {
  const prefixed = argv.find((argument) => argument.startsWith(`--${name}=`));
  if (prefixed) return prefixed.slice(name.length + 3);
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[index + 1] : fallback;
}

function printList(label, members, limit = 20) {
  console.log(`${label} (${members.length}):`);
  for (const member of members.slice(0, limit)) console.log(`  ${member}`);
  if (members.length > limit) console.log(`  … ${members.length - limit} more`);
}

export function run({ argv = process.argv.slice(2), out = console.log, err = console.error } = {}) {
  const mode = argv.includes('--check') ? 'check' : argv.includes('--write') ? 'write' : 'report';
  const packageRoot = resolve(optionOf(argv, 'package-root', CORE_ROOT));
  const baselinePath = resolve(optionOf(argv, 'baseline', DEFAULT_BASELINE_PATH));
  const consumersFlag = optionOf(argv, 'consumers', null);
  const consumerRoots = consumersFlag
    ? consumersFlag.split(',').map((pair) => {
      const equals = pair.indexOf('=');
      return { id: pair.slice(0, equals), root: resolve(pair.slice(equals + 1)), required: true };
    })
    : DEFAULT_CONSUMER_ROOTS;

  let measured;
  try {
    measured = measure({ packageRoot, consumerRoots });
  } catch (error) {
    err(`consumer-census: FAIL — ${error.message}`);
    return 1;
  }

  const findings = [...missingRootFindings(measured)];
  if (measured.missingCssSeeds.length > 0) {
    findings.push({
      leg: 'css-build-corpus',
      detail:
        `CSS build entry stylesheet(s) missing; the styles-unreferenced bucket cannot be trusted: `
        + measured.missingCssSeeds.join(', '),
    });
  }

  if (mode === 'write') {
    if (findings.length > 0) {
      for (const finding of findings) err(`consumer-census: [${finding.leg}] ${finding.detail}`);
      err('consumer-census: FAIL — refusing to write the baseline while the measurement is incomplete.');
      return 1;
    }
    const baseline = writeBaseline(measured, baselinePath);
    out(
      `consumer-census: baseline written: ${baselinePath} `
      + `(${baseline.consumerlessSubpaths.length} consumerless, ${baseline.unreachableModules.length} unreachable, `
      + `${baseline.testOnlyModules.length} test-only, ${baseline.stylesUnreferenced.length} styles-unreferenced) `
      + `digest ${baseline.exportsDigest.slice(0, 19)}…`,
    );
    return 0;
  }

  const consumed = measured.subpaths.length - measured.consumerlessSubpaths.length;
  out(
    `consumer-census: ${measured.subpaths.length} published subpaths — ${consumed} consumed, `
    + `${measured.consumerlessSubpaths.length} consumerless; ${measured.moduleCount} census modules — `
    + `${measured.moduleCount - measured.unreachableModules.length - measured.testOnlyModules.length} reachable, `
    + `${measured.testOnlyModules.length} test-only, ${measured.unreachableModules.length} unreachable; `
    + `${measured.stylesUnreferenced.length} styles unreferenced; `
    + `${measured.entrySourceCount} export entry sources.`,
  );
  const rootStatus = consumerRoots
    .map((root) => `${root.id}:${measured.missingRoots.some((missing) => missing.id === root.id) ? 'MISSING' : 'ok'}`)
    .join(' ');
  out(`consumer-census: consumer roots — ${rootStatus}`);

  if (mode === 'report') {
    const consumedSubpaths = measured.subpaths.filter((key) => measured.perSubpathConsumers[key].length > 0);
    out('');
    for (const key of consumedSubpaths) {
      out(`${key} -> ${measured.perSubpathConsumers[key].join(', ')}`);
    }
    out('');
    printList('consumerlessSubpaths', measured.consumerlessSubpaths);
    out('');
    printList('unreachableModules', measured.unreachableModules);
    out('');
    printList('testOnlyModules', measured.testOnlyModules);
    out('');
    printList('stylesUnreferenced', measured.stylesUnreferenced);
    if (Object.keys(measured.unmatchedSpecifiers).length > 0) {
      out('');
      printList(
        'specifiers naming no published subpath (not counted)',
        Object.keys(measured.unmatchedSpecifiers),
      );
    }
  }

  if (findings.length > 0) {
    for (const finding of findings) err(`consumer-census: [${finding.leg}] ${finding.detail}`);
    err(`consumer-census: FAIL — ${findings.length} finding(s).`);
    return 1;
  }

  if (mode === 'check') {
    let comparison;
    try {
      comparison = compareWithBaseline(measured, readBaseline(baselinePath));
    } catch (error) {
      err(`consumer-census: FAIL — ${error.message}`);
      return 1;
    }
    for (const finding of comparison.findings) err(`consumer-census: [${finding.leg}] ${finding.detail}`);
    for (const opportunity of comparison.opportunities) out(`consumer-census: ratchet opportunity — ${opportunity}`);
    if (comparison.findings.length > 0) {
      err(`consumer-census: FAIL — ${comparison.findings.length} finding(s).`);
      return 1;
    }
    out('consumer-census: OK — the census matches the baseline; every growth direction is pinned.');
    return 0;
  }

  out('consumer-census: OK');
  return 0;
}

if (resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url))) {
  process.exitCode = run();
}
