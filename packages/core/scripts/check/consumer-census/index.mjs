#!/usr/bin/env node
/**
 * consumer-census — the decrease-only anchor for surface retirement.
 *
 * WHAT IT MEASURES, in one pass over the published map and the four
 * consumer roots:
 *
 *   1. Per public subpath of packages/core (the package.json `exports` map):
 *      which consumer roots import it. A consumer import is a static
 *      `import`/`export ... from`, a dynamic `import()`, a `require()`,
 *      `require.resolve()` or `createRequire(...).resolve()` whose module
 *      specifier is a STRING LITERAL naming the package (`@rottay/
 *      design-system` or `@rottay/design-system/<subpath>`), parsed with the
 *      TypeScript compiler API; plus an `@import` in a consumer `.css` file
 *      (string or `url(...)` form) naming the package, after CSS comments are
 *      stripped. A specifier inside a comment or an ordinary string never
 *      reaches the AST as a module specifier, so prose cannot certify
 *      consumption; a commented-out `@import` is stripped before matching, so
 *      it cannot either.
 *   2. Internal reachability: every module under src/ that no export
 *      entrypoint reaches is `unreachable`; a module reachable only from
 *      test files is `test-only`. CSS files under src that no JS module
 *      imports AND the CSS build does not include (relative-`@import`
 *      closure of the build's entry stylesheets, the way
 *      scripts/build/verticals/css-build composes the shipped bundles) are
 *      `styles-unreferenced`.
 *
 *   3. Consumer areas. Each application root is read through four areas, and
 *      the kind is reported per door: `src` (src-import), `tests`
 *      (test-import), `scripts` (script-import) and the root `*.config.*`
 *      files (config-import). The same specifier law applies to all four.
 *   4. Named classes (attributions/index.json, authored, never written by
 *      this gate). A module the import graph cannot see is admitted only
 *      through a class whose reader the gate re-proves on every run: a story
 *      that imports it, a test that imports it, or a script in the import
 *      closure of a gate-manifest `run` target that names its path. A door no
 *      import consumes is admitted only through an attribution whose
 *      file:line evidence still holds in the live consumer roots, or through
 *      a `lab` / `retire-by` disposition naming an OPEN work order. An
 *      unreachable module outside the classes is red by name, baseline or
 *      not.
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
 *   [--consumers=<id>=<abs path>,[<id>=<abs path>...]]      override roots (one area)
 *   [--consumer-apps=<id>=<abs app dir>,...]                override roots (four areas)
 *   [--attributions=<path>] [--contract=<path>] [--registry=<path>]
 *   [--gate-manifest=<path>] [--assume-done=<WO>[,<WO>...]]
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  realpathSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
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
export function consumerApp(id, base) {
  return Object.freeze({ id, root: resolve(base, 'src'), base: resolve(base), required: true });
}

export const DEFAULT_CONSUMER_ROOTS = Object.freeze([
  consumerApp('showroom', resolve(CORE_ROOT, '../showroom')),
  consumerApp('app-bithire', resolve(SIBLING_ROOT, 'app-bithire')),
  consumerApp('app-evnto', resolve(SIBLING_ROOT, 'app-evnto')),
  consumerApp('app-platform', resolve(SIBLING_ROOT, 'app-platform')),
]);

export const DEFAULT_BASELINE_PATH = resolve(HERE, 'baseline/index.json');
export const ATTRIBUTIONS_RELATIVE_PATH = 'scripts/check/consumer-census/attributions/index.json';
export const CONTRACT_RELATIVE_PATH = 'docs/consumer-contract/index.md';
export const GATE_MANIFEST_RELATIVE_PATH = 'scripts/check/automation/gates/manifest/index.mjs';
export const DEFAULT_REGISTRY_PATH = resolve(WORKSPACE_ROOT, 'roadmap/registry.json');

const CONSUMER_SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']);
const CONFIG_FILE_PATTERN = /^[^/]+\.config\.(?:mjs|cjs|js|ts)$/u;
const INSTALLED_ROOT_FILE_LITERALS = Object.freeze([
  'supplier-contract.json',
  'consumer/ds-supplier-honesty.mjs',
  'hooks-manifest.json',
]);
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
  return parseSourceFacts(filePath, text).specifiers;
}

function scriptKindOf(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) return ts.ScriptKind.TSX;
  if (/\.[cm]?js$/u.test(filePath)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

/**
 * One parse, two readings: the module specifiers (the import law above) and
 * every string fragment with its 1-based line. A fragment is a string
 * literal, a template without substitutions, or one literal part of a
 * template; comments are never fragments.
 */
export function parseSourceFacts(filePath, text) {
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.ES2020, false, scriptKindOf(filePath));
  const specifiers = [];
  const strings = [];
  const lineOf = (node) => sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
      || node.kind === ts.SyntaxKind.TemplateHead
      || node.kind === ts.SyntaxKind.TemplateMiddle
      || node.kind === ts.SyntaxKind.TemplateTail) {
      strings.push({ text: node.text, line: lineOf(node) });
    }
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
      const isResolveCall = ts.isPropertyAccessExpression(callee)
        && callee.name.text === 'resolve'
        && ((ts.isIdentifier(callee.expression) && callee.expression.text === 'require')
          || (ts.isCallExpression(callee.expression)
            && ts.isIdentifier(callee.expression.expression)
            && callee.expression.expression.text === 'createRequire'));
      if ((isRequire || isDynamicImport || isResolveCall) && node.arguments.length >= 1) {
        const argument = node.arguments[0];
        if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) {
          specifiers.push(argument.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return { sourceFile, specifiers, strings };
}

const CSS_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
const CSS_IMPORT_PATTERNS = [
  /@import\s+["']([^"']+)["']/g,
  /@import\s+url\(\s*(?:["']([^"']+)["']|([^)\s]+))\s*\)/g,
];

/**
 * The `@import` specifiers one stylesheet names, after CSS comments are
 * stripped so a commented-out import cannot certify consumption. Covers the
 * string form (`@import "..."`) and the `url(...)` form, quoted or bare.
 */
export function parseCssImports(text) {
  const stripped = text.replace(CSS_COMMENT_PATTERN, '');
  const specifiers = [];
  for (const pattern of CSS_IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(stripped)) !== null) {
      const specifier = match[1] ?? match[2];
      if (specifier) specifiers.push(specifier);
    }
  }
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
 * The areas one consumer root is read through. A root that declares its
 * application directory (`base`) is read through `src`, `tests`, `scripts`
 * and its root `*.config.*` files; a bare root is one `src-import` area.
 * Only `root` is required: an application without a `tests` directory has
 * no test imports, which is a measurement, not a gap.
 */
export function consumerAreas(root) {
  const areas = [{ kind: 'src-import', path: root.root }];
  if (!root.base) return areas;
  areas.push({ kind: 'test-import', path: join(root.base, 'tests') });
  areas.push({ kind: 'script-import', path: join(root.base, 'scripts') });
  let entries = [];
  try {
    entries = readdirSync(root.base, { withFileTypes: true });
  } catch {
    entries = [];
  }
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isFile() && CONFIG_FILE_PATTERN.test(entry.name)) {
      areas.push({ kind: 'config-import', path: join(root.base, entry.name), file: true });
    }
  }
  return areas;
}

function globToPattern(glob) {
  let body = '';
  for (let index = 0; index < glob.length; index += 1) {
    const character = glob[index];
    if (character === '*' && glob[index + 1] === '*') {
      if (glob[index + 2] === '/') {
        body += '(?:.*/)?';
        index += 2;
      } else {
        body += '.*';
        index += 1;
      }
    } else if (character === '*') body += '[^/]*';
    else body += character.replace(/[.+?^${}()|[\]\\]/gu, '\\$&');
  }
  return new RegExp(`^${body}(?:/.*)?$`, 'u');
}

/**
 * Whether the package's `files` list ships `path` (npm always ships
 * package.json). A path with no file extension is read as a directory: it
 * ships when some entry can place a file beneath it.
 */
export function shipsPath(path, files) {
  if (path === PACKAGE_JSON) return true;
  if (!Array.isArray(files)) return true;
  const entries = files.filter((entry) => !entry.startsWith('!'))
    .map((entry) => entry.replace(/^\.\//u, '').replace(/\/$/u, ''));
  if (!/\.[A-Za-z0-9]+$/u.test(path)) {
    const directory = `${path.replace(/\/$/u, '')}/`;
    return entries.some((entry) => {
      const fixed = entry.slice(0, entry.search(/\*|$/u));
      return fixed.startsWith(directory) || directory.startsWith(fixed.endsWith('/') ? fixed : `${fixed}/`);
    });
  }
  const included = entries.some((entry) => globToPattern(entry).test(path));
  const excluded = files.filter((entry) => entry.startsWith('!'))
    .some((entry) => globToPattern(entry.slice(1)).test(path));
  return included && !excluded;
}

/**
 * Reads of the installed package by filesystem path, which no specifier law
 * can see: a string fragment naming `node_modules/<package>/<path>`, or one
 * of the root files the 2.x line shipped, in a file that also names the
 * package. Reported, never ratcheted; `breaksOnUpgrade` when the current
 * `files` list does not ship the path.
 */
function installedPathReadsOf(strings, packageName, files) {
  const marker = `node_modules/${packageName}/`;
  const namesPackage = strings.some((fragment) => fragment.text === packageName);
  const reads = [];
  for (const fragment of strings) {
    const at = fragment.text.indexOf(marker);
    let path = null;
    if (at >= 0) path = fragment.text.slice(at + marker.length).split(/[\s"'`]/u)[0].replace(/\/$/u, '');
    else if (namesPackage && INSTALLED_ROOT_FILE_LITERALS.includes(fragment.text)) path = fragment.text;
    if (path) reads.push({ line: fragment.line, path, breaksOnUpgrade: !shipsPath(path, files) });
  }
  return reads;
}

/**
 * Which consumer roots import which published subpath, and through which
 * area. Every parse error is a hard failure: a consumer root whose files
 * cannot be read is absent census coverage, and reporting consumption over
 * a partial walk is the silent failure this gate exists to prevent.
 */
export function measureConsumers({ packageRoot, consumerRoots }) {
  const { manifest } = loadPackageManifest(packageRoot);
  const packageName = manifest.name;
  const exportsMap = manifest.exports ?? {};
  const subpaths = Object.keys(exportsMap).sort();
  const consumersBySubpath = new Map(subpaths.map((key) => [key, new Map()]));
  const unmatched = new Map();
  const unreadable = [];
  const installedPathReads = [];

  for (const root of consumerRoots) {
    if (!isReadableDirectory(root.root)) {
      if (root.required) unreadable.push(root.id);
      continue;
    }
    const seen = new Set();
    for (const area of consumerAreas(root)) {
      const files = area.file
        ? [area.path]
        : walkFiles(area.path, (path) => {
          const extension = extnameOf(path);
          return CONSUMER_SOURCE_EXTENSIONS.has(extension) || extension === '.css';
        });
      for (const file of files) {
        if (seen.has(file)) continue;
        seen.add(file);
        let specifiers;
        try {
          const text = readFileSync(file, 'utf8');
          if (extnameOf(file) === '.css') specifiers = parseCssImports(text);
          else {
            const facts = parseSourceFacts(file, text);
            specifiers = facts.specifiers;
            for (const read of installedPathReadsOf(facts.strings, packageName, manifest.files)) {
              installedPathReads.push({
                root: root.id,
                file: relative(root.base ?? root.root, file).split(sep).join('/'),
                ...read,
              });
            }
          }
        } catch (error) {
          throw new Error(`consumer-census: cannot parse ${file}: ${error.message}`);
        }
        for (const specifier of specifiers) {
          const { matched, unmatched: isUnmatched } = classifyConsumerSpecifier(specifier, packageName, exportsMap);
          if (matched) {
            const kinds = consumersBySubpath.get(matched);
            if (!kinds.has(root.id)) kinds.set(root.id, new Set());
            kinds.get(root.id).add(area.kind);
          } else if (isUnmatched) {
            if (!unmatched.has(specifier)) unmatched.set(specifier, new Set());
            unmatched.get(specifier).add(root.id);
          }
        }
      }
    }
  }

  const perSubpathConsumers = {};
  const perSubpathConsumerKinds = {};
  for (const key of subpaths) {
    const kinds = consumersBySubpath.get(key);
    perSubpathConsumers[key] = [...kinds.keys()].sort();
    perSubpathConsumerKinds[key] = Object.fromEntries(
      perSubpathConsumers[key].map((id) => [id, [...kinds.get(id)].sort()]),
    );
  }
  const consumerlessSubpaths = subpaths.filter((key) => consumersBySubpath.get(key).size === 0);
  return {
    packageName,
    subpaths,
    perSubpathConsumers,
    perSubpathConsumerKinds,
    consumerlessSubpaths,
    installedPathReads,
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
    sourceFiles: jsFiles,
    specifiersCache,
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
  const measured = {
    packageRoot,
    exportsDigest: computeExportsDigest(manifest.exports ?? {}),
    subpaths: consumers.subpaths,
    perSubpathConsumers: consumers.perSubpathConsumers,
    perSubpathConsumerKinds: consumers.perSubpathConsumerKinds,
    consumerlessSubpaths: consumers.consumerlessSubpaths,
    installedPathReads: consumers.installedPathReads,
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
  // The parsed import graph, handed to the class law so it reads the same
  // parse; non-enumerable so the measurement stays a plain report.
  Object.defineProperty(measured, 'sourceGraph', {
    value: { sourceFiles: internals.sourceFiles, specifiersCache: internals.specifiersCache },
    enumerable: false,
  });
  return measured;
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

// ── named classes and door attributions ─────────────────────────────────────

export const ATTRIBUTIONS_SCHEMA_VERSION = 1;

/**
 * What proves each module class, and whether a receiver is owed. Membership
 * is never the row: it is the reader the gate finds again on every run.
 */
export const MODULE_CLASSES = Object.freeze({
  'story-support': Object.freeze({ readerKind: 'story-import', receiver: 'required' }),
  'tooling-path-read': Object.freeze({ readerKind: 'path-read', receiver: 'required' }),
  'test-support': Object.freeze({ readerKind: 'test-import', receiver: 'required', testOnly: true }),
  'drift-test-reader': Object.freeze({ readerKind: 'test-import', receiver: 'none', testOnly: true }),
  'lab-data': Object.freeze({
    readerKind: 'test-import',
    receiver: 'required',
    testOnly: true,
    under: 'src/foundation/presets/candidates/',
  }),
});

const DRIFT_READER_FOLDERS = new Set(['contract', 'parse']);
const DRIFT_OWNER_TEST_PATTERN = /^index\.test\.[cm]?[jt]sx?$/u;
const DECLARATION_MODULE_PATTERN = /^src\/foundation\/(?:[^/]+\/)*(?:manifest|roster)\/index\.tsx?$/u;

/**
 * The tests a drift reader may be owned by: `tests/index.test.*` beside a
 * `contract/` or `parse/` folder the module sits in. A reader anywhere else
 * is ordinary test support and owes a receiver.
 */
export function driftOwnerDirectories(modulePath) {
  const segments = modulePath.split('/').slice(0, -1);
  return segments
    .map((segment, index) => (DRIFT_READER_FOLDERS.has(segment) ? [...segments.slice(0, index), 'tests'].join('/') : null))
    .filter((directory) => directory !== null);
}

export const DOOR_CLASSES = Object.freeze(['structural-admission', 'resource-boundary']);
export const DOOR_DISPOSITIONS = Object.freeze(['guaranteed', 'retire-by', 'lab']);
export const CORE_EVIDENCE_ROOT = 'core';

const WORK_ORDER_PATTERN = /^WO-[A-Z0-9]+-\d+$/u;
const GLOB_CHARACTERS = /[*?[\]{}]/u;
const MINIMUM_NEEDLE_LENGTH = 8;
const MODULE_ROW_KEYS = new Set(['path', 'class', 'readers', 'reason', 'receiver', 'owner', 'document']);
const READER_KEYS = new Set(['file', 'kind']);
const DOOR_ROW_KEYS = new Set(['subpath', 'class', 'evidence', 'reason', 'receiver']);
const EVIDENCE_KEYS = new Set(['root', 'file', 'line', 'needle']);
const DOCUMENT_KEYS = new Set(['schemaVersion', 'residueReceiver', 'modules', 'doors']);
const PUBLISHED_TABLE_START = '<!-- consumer-contract:published:start -->';
const PUBLISHED_TABLE_END = '<!-- consumer-contract:published:end -->';

function unknownKeys(value, allowed) {
  return Object.keys(value).filter((key) => !allowed.has(key));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isExactRelativePath(value) {
  return typeof value === 'string' && value.length > 0 && !isAbsolute(value)
    && !GLOB_CHARACTERS.test(value) && !value.split('/').includes('..');
}

function isRegularFile(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/** The authored attribution document. Read-only: no mode of this gate writes it. */
export function readAttributions(path) {
  if (!existsSync(path)) throw new Error(`the attribution document is missing at ${path}`);
  let document;
  try {
    document = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`the attribution document at ${path} does not parse: ${error.message}`);
  }
  if (!isPlainObject(document) || document.schemaVersion !== ATTRIBUTIONS_SCHEMA_VERSION
    || !Array.isArray(document.modules) || !Array.isArray(document.doors)) {
    throw new Error(
      `the attribution document at ${path} must carry schemaVersion ${ATTRIBUTIONS_SCHEMA_VERSION}, `
      + 'modules[] and doors[]',
    );
  }
  const unknown = unknownKeys(document, DOCUMENT_KEYS);
  if (unknown.length > 0) {
    throw new Error(`the attribution document at ${path} carries unknown key(s): ${unknown.join(', ')}`);
  }
  return document;
}

/** The published table of the consumer contract: subpath -> disposition and work order. */
export function readContractRows(markdown) {
  const start = markdown.indexOf(PUBLISHED_TABLE_START);
  const end = markdown.indexOf(PUBLISHED_TABLE_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('the published table fences of the consumer contract are missing or inverted');
  }
  const rows = new Map();
  for (const line of markdown.slice(start, end).split('\n')) {
    const cells = line.trim().split('|').map((cell) => cell.trim());
    const subpath = /^`(.+)`$/u.exec(cells[1] ?? '')?.[1];
    if (!subpath) continue;
    const workOrder = WORK_ORDER_PATTERN.test(cells[3] ?? '') ? cells[3] : null;
    rows.set(subpath, { disposition: cells[2] ?? '', workOrder, workOrderCell: cells[3] ?? '' });
  }
  if (rows.size === 0) throw new Error('the published table of the consumer contract carries no row');
  return rows;
}

/** Work-order id -> status, from the roadmap registry. */
export function readWorkOrders(registryPath) {
  if (!existsSync(registryPath)) throw new Error(`the roadmap registry is missing at ${registryPath}`);
  let registry;
  try {
    registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  } catch (error) {
    throw new Error(`the roadmap registry at ${registryPath} does not parse: ${error.message}`);
  }
  if (!Array.isArray(registry.workOrders)) {
    throw new Error(`the roadmap registry at ${registryPath} carries no workOrders[]`);
  }
  return new Map(registry.workOrders.map((workOrder) => [workOrder.id, workOrder.status]));
}

/** Why `id` cannot receive anything, or null when it is an open work order. */
function receiverProblem(id, workOrders, assumeDone) {
  if (typeof id !== 'string' || !WORK_ORDER_PATTERN.test(id)) return 'is not a work-order id';
  if (workOrders === null) return 'cannot be verified: the roadmap registry is unreadable';
  if (!workOrders.has(id)) return 'is not in the roadmap registry';
  if (workOrders.get(id) === 'done') return 'is done';
  if (assumeDone.includes(id)) return 'is assumed done (--assume-done)';
  return null;
}

/**
 * The script files a gate-manifest entry runs. Read from the manifest's
 * source text: every `run: [...]` array literal, its string elements that
 * name an existing script. A `node --test` entry runs a drill, not a gate
 * that reads product paths, so its target is not a reader.
 */
export function gateRunTargets(manifestPath, packageRoot) {
  if (!existsSync(manifestPath)) throw new Error(`the gate manifest is missing at ${manifestPath}`);
  const text = readFileSync(manifestPath, 'utf8');
  const sourceFile = ts.createSourceFile(manifestPath, text, ts.ScriptTarget.ES2020, false, ts.ScriptKind.JS);
  const targets = new Set();
  const visit = (node) => {
    if (ts.isPropertyAssignment(node) && node.name.getText(sourceFile) === 'run'
      && ts.isArrayLiteralExpression(node.initializer)) {
      const elements = node.initializer.elements.filter((element) => ts.isStringLiteral(element))
        .map((element) => element.text);
      if (!elements.includes('--test')) {
        for (const element of elements) {
          const full = resolve(packageRoot, element);
          if (SOURCE_MODULE_EXTENSIONS.has(extnameOf(element)) && !isTestFile(element) && isRegularFile(full)) {
            targets.add(full);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...targets].sort();
}

function scriptImportClosure(entries, specifiersCache) {
  const seen = new Set();
  const pending = [...entries];
  while (pending.length > 0) {
    const file = pending.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const specifier of readSpecifiers(file, specifiersCache)) {
      if (!specifier.startsWith('./') && !specifier.startsWith('../')) continue;
      const base = resolve(dirname(file), specifier);
      const target = [base, ...RESOLVE_EXTENSIONS.map((extension) => `${base}${extension}`),
        ...RESOLVE_EXTENSIONS.map((extension) => `${base}/index${extension}`)].find(isRegularFile);
      if (target && SOURCE_MODULE_EXTENSIONS.has(extnameOf(target)) && !seen.has(target)) pending.push(target);
    }
  }
  return seen;
}

/**
 * Every string a script can name a path with: its string literals, and its
 * templates once each substitution is a module-level string constant. A
 * path spelled in a comment is not a string and is never returned.
 */
export function resolvedStringConstants(filePath, text) {
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.ES2020, false, scriptKindOf(filePath));
  const constants = new Map();
  const evaluate = (node) => {
    if (!node) return null;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isIdentifier(node)) return constants.get(node.text) ?? null;
    if (ts.isParenthesizedExpression(node)) return evaluate(node.expression);
    if (ts.isTemplateExpression(node)) {
      let value = node.head.text;
      for (const span of node.templateSpans) {
        const part = evaluate(span.expression);
        if (part === null) return null;
        value += part + span.literal.text;
      }
      return value;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const left = evaluate(node.left);
      const right = evaluate(node.right);
      return left === null || right === null ? null : left + right;
    }
    return null;
  };
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    if ((statement.declarationList.flags & ts.NodeFlags.Const) === 0) continue;
    for (const declaration of statement.declarationList.declarations) {
      const value = evaluate(declaration.initializer);
      if (value !== null && ts.isIdentifier(declaration.name)) constants.set(declaration.name.text, value);
    }
  }
  const values = new Set();
  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
      const value = evaluate(node);
      if (value !== null) values.add(value);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return [...values];
}

function namesModulePath(values, modulePath, packageRoot) {
  const target = resolve(packageRoot, modulePath);
  return values.some((value) => value.length > 0 && !isAbsolute(value) && resolve(packageRoot, value) === target);
}

/** Whether offset `position` of a parsed source sits inside a token (never in a comment). */
function isCodePosition(sourceFile, position) {
  let node = sourceFile;
  for (;;) {
    const children = node.getChildren(sourceFile);
    const child = children.find((candidate) => candidate.pos <= position && position < candidate.end);
    if (!child) return node !== sourceFile && children.length === 0;
    if (child.kind >= ts.SyntaxKind.FirstJSDocNode && child.kind <= ts.SyntaxKind.LastJSDocNode) return false;
    if (position < child.getStart(sourceFile)) return false;
    node = child;
  }
}

/**
 * One piece of door evidence: the named file still exists in the named
 * root, still has that line, and the line still carries the needle outside
 * a comment. Evidence inside the package's own `scripts/` is refused: a DS
 * gate asserting that a door exists is not a consumer of it.
 */
function evidenceProblem(entry, evidenceRoots, packageRoot, reachable) {
  if (!isPlainObject(entry)) return 'is not an object';
  const unknown = unknownKeys(entry, EVIDENCE_KEYS);
  if (unknown.length > 0) return `carries unknown key(s): ${unknown.join(', ')}`;
  const label = `${entry.root}:${entry.file}:${entry.line}`;
  if (!isExactRelativePath(entry.file)) return `${label} — file must be an exact relative path`;
  if (!Number.isInteger(entry.line) || entry.line < 1) return `${label} — line must be a 1-based integer`;
  if (typeof entry.needle !== 'string' || entry.needle.trim().length < MINIMUM_NEEDLE_LENGTH) {
    return `${label} — needle must be at least ${MINIMUM_NEEDLE_LENGTH} characters`;
  }
  let base;
  if (entry.root === CORE_EVIDENCE_ROOT) {
    if (entry.file === 'scripts' || entry.file.startsWith('scripts/')) {
      return `${label} — evidence under the package's own scripts/ is refused: a gate that asserts the door is not a consumer of it`;
    }
    if (!DECLARATION_MODULE_PATTERN.test(entry.file)) {
      return `${label} — package evidence is admitted only from a manifest/ or roster/ index module under src/foundation/`;
    }
    if (!reachable.has(entry.file)) {
      return `${label} — the declaring module is not reachable from an export entrypoint: a module that exists to carry the literal declares nothing`;
    }
    base = packageRoot;
  } else if (evidenceRoots.has(entry.root)) {
    base = evidenceRoots.get(entry.root);
  } else {
    return `${label} — root must be "${CORE_EVIDENCE_ROOT}" or a consumer root (${[...evidenceRoots.keys()].join(', ')})`;
  }
  const full = resolve(base, entry.file);
  if (!isRegularFile(full)) return `${label} — the evidence file no longer exists`;
  const text = readFileSync(full, 'utf8');
  const lines = text.split('\n');
  if (entry.line > lines.length) return `${label} — the evidence line no longer exists (the file has ${lines.length} lines)`;
  const column = lines[entry.line - 1].indexOf(entry.needle);
  if (column < 0) {
    const moved = lines.findIndex((line) => line.includes(entry.needle));
    return `${label} — the line no longer carries ${JSON.stringify(entry.needle)}`
      + (moved >= 0 ? ` (it now reads on line ${moved + 1}; re-cite it)` : ' (it is gone from the file)');
  }
  const offset = lines.slice(0, entry.line - 1).reduce((sum, line) => sum + line.length + 1, 0) + column;
  const extension = extnameOf(full);
  let inComment = false;
  if (SOURCE_MODULE_EXTENSIONS.has(extension)) {
    const sourceFile = ts.createSourceFile(full, text, ts.ScriptTarget.ES2020, false, scriptKindOf(full));
    inComment = !isCodePosition(sourceFile, offset);
  } else if (extension === '.css') {
    CSS_COMMENT_PATTERN.lastIndex = 0;
    let match;
    while ((match = CSS_COMMENT_PATTERN.exec(text)) !== null) {
      if (match.index <= offset && offset < match.index + match[0].length) inComment = true;
    }
  } else if (extension === '.yml' || extension === '.yaml') {
    inComment = lines[entry.line - 1].slice(0, column).includes('#');
  }
  if (inComment) return `${label} — the needle sits inside a comment, which certifies nothing`;
  return null;
}

/**
 * The class law. Findings are red in `--check`; the report names what each
 * class proved. `measured` supplies the import-graph buckets and is never
 * altered: a class explains a bucket member, it does not remove it from the
 * baseline's decrease-only sets.
 */
export function auditClasses({
  measured,
  packageRoot,
  consumerRoots,
  attributionsPath,
  contractPath,
  registryPath,
  gateManifestPath,
  assumeDone = [],
}) {
  const findings = [];
  const add = (leg, detail) => findings.push({ leg, detail });
  const report = { moduleClasses: [], doorAttributions: [], doorDispositions: [], testOnlyOutsideClasses: [] };

  let document = { modules: [], doors: [], residueReceiver: null };
  try {
    document = readAttributions(attributionsPath);
  } catch (error) {
    add('attributions', error.message);
  }
  let workOrders = null;
  try {
    workOrders = readWorkOrders(registryPath);
  } catch (error) {
    add('registry', error.message);
  }
  let contractRows = new Map();
  try {
    contractRows = readContractRows(readFileSync(contractPath, 'utf8'));
  } catch (error) {
    add('contract', `cannot read the consumer contract at ${contractPath}: ${error.message}`);
  }

  // ── modules ──
  const srcRoot = resolve(packageRoot, 'src');
  const specifiersCache = measured.sourceGraph?.specifiersCache ?? new Map();
  const reachable = new Set(measured.reachableModules);
  const unreachable = new Set(measured.unreachableModules);
  const testOnly = new Set(measured.testOnlyModules);
  let gateScripts = null;
  const gateClosure = () => {
    if (gateScripts === null) {
      try {
        gateScripts = scriptImportClosure(gateRunTargets(gateManifestPath, packageRoot), specifiersCache);
      } catch (error) {
        add('gate-manifest', error.message);
        gateScripts = new Set();
      }
    }
    return gateScripts;
  };

  const readerProblem = (reader, spec, moduleFile, modulePath) => {
    if (!isPlainObject(reader)) return 'a reader is not an object';
    const unknown = unknownKeys(reader, READER_KEYS);
    if (unknown.length > 0) return `a reader carries unknown key(s): ${unknown.join(', ')}`;
    if (!isExactRelativePath(reader.file)) return `reader ${JSON.stringify(reader.file)} must be an exact relative path`;
    if (reader.kind !== spec.readerKind) {
      return `reader ${reader.file} declares kind ${JSON.stringify(reader.kind)}; this class is proven only by ${spec.readerKind}`;
    }
    const readerFile = resolve(packageRoot, reader.file);
    if (reader.kind === 'story-import' && !STORY_FILE_PATTERN.test(reader.file)) {
      return `reader ${reader.file} is not a story file`;
    }
    if (reader.kind === 'test-import' && !isTestFile(reader.file)) {
      return `reader ${reader.file} is not a test file`;
    }
    if (reader.kind === 'path-read' && (!reader.file.startsWith('scripts/') || isTestFile(reader.file))) {
      return `reader ${reader.file} is not a script under scripts/`;
    }
    if (!isRegularFile(readerFile)) return `reader ${reader.file} no longer exists`;
    if (reader.kind === 'path-read') {
      if (!gateClosure().has(readerFile)) {
        return `reader ${reader.file} is not run by any gate-manifest entry (no \`run\` target imports it)`;
      }
      if (!namesPath(readerFile, modulePath)) {
        return `reader ${reader.file} no longer names ${modulePath} in a string`;
      }
      return null;
    }
    if (!filesReaching(moduleFile).has(readerFile)) {
      return `reader ${reader.file} no longer imports ${modulePath}`;
    }
    return null;
  };

  const READER_FILE_PATTERNS = { 'story-import': STORY_FILE_PATTERN, 'test-import': TEST_FILE_PATTERN };
  let importers = null;
  const readersOf = new Map();
  const filesReaching = (moduleFile) => {
    if (importers === null) {
      importers = new Map();
      const sourceFiles = measured.sourceGraph?.sourceFiles
        ?? walkFiles(srcRoot, (path) => SOURCE_MODULE_EXTENSIONS.has(extnameOf(path)));
      for (const file of sourceFiles) {
        for (const specifier of readSpecifiers(file, specifiersCache)) {
          const target = resolveSourceSpecifier(file, specifier, srcRoot);
          if (!target) continue;
          if (!importers.has(target)) importers.set(target, new Set());
          importers.get(target).add(file);
        }
      }
    }
    if (!readersOf.has(moduleFile)) {
      const seen = new Set([moduleFile]);
      const pending = [moduleFile];
      while (pending.length > 0) {
        for (const importer of importers.get(pending.pop()) ?? []) {
          if (!seen.has(importer)) {
            seen.add(importer);
            pending.push(importer);
          }
        }
      }
      seen.delete(moduleFile);
      readersOf.set(moduleFile, seen);
    }
    return readersOf.get(moduleFile);
  };
  const pathReaders = new Map();
  const namesPath = (scriptFile, modulePath) => {
    if (!pathReaders.has(scriptFile)) {
      pathReaders.set(scriptFile, resolvedStringConstants(scriptFile, readFileSync(scriptFile, 'utf8')));
    }
    return namesModulePath(pathReaders.get(scriptFile), modulePath, packageRoot);
  };
  const discoveredReaders = (spec, moduleFile, modulePath) => {
    if (spec.readerKind === 'path-read') {
      return [...gateClosure()].filter((file) => namesPath(file, modulePath)).length;
    }
    return [...filesReaching(moduleFile)].filter((file) => READER_FILE_PATTERNS[spec.readerKind].test(file)).length;
  };

  const verifiedModules = new Set();
  const seenModules = new Set();
  for (const row of document.modules) {
    const name = isPlainObject(row) && typeof row.path === 'string' ? row.path : JSON.stringify(row);
    const problems = [];
    if (!isPlainObject(row)) problems.push('the row is not an object');
    else {
      const unknown = unknownKeys(row, MODULE_ROW_KEYS);
      if (unknown.length > 0) problems.push(`unknown key(s): ${unknown.join(', ')}`);
      const spec = MODULE_CLASSES[row.class];
      const moduleFile = isExactRelativePath(row.path) ? resolve(packageRoot, row.path) : null;
      if (!moduleFile) problems.push('path must be an exact relative path (no glob)');
      else if (seenModules.has(row.path)) problems.push('duplicate row');
      else if (!isRegularFile(moduleFile)) problems.push('the module no longer exists: delete the row with it');
      else if (reachable.has(row.path)) problems.push('the module is reachable from an export entrypoint: the row is stale');
      else if (!unreachable.has(row.path) && !testOnly.has(row.path)) problems.push('the path is not a census module');
      if (moduleFile) seenModules.add(row.path);
      if (!spec) problems.push(`class ${JSON.stringify(row.class)} is not one of ${Object.keys(MODULE_CLASSES).join(', ')}`);
      if (typeof row.reason !== 'string' || row.reason.trim().length === 0) problems.push('reason is empty');
      if (spec && moduleFile && problems.length === 0) {
        if (spec.testOnly && !testOnly.has(row.path)) {
          problems.push(`class ${row.class} names a test-only module, and no test reaches this one`);
        }
        if (!Array.isArray(row.readers) || row.readers.length === 0) problems.push('readers[] is empty');
        else {
          for (const reader of row.readers) {
            const problem = readerProblem(reader, spec, moduleFile, row.path);
            if (problem) problems.push(problem);
          }
        }
        if (spec.receiver === 'required') {
          const problem = receiverProblem(row.receiver, workOrders, assumeDone);
          if (problem) problems.push(`receiver ${JSON.stringify(row.receiver)} ${problem}`);
          if (Object.hasOwn(row, 'owner') || Object.hasOwn(row, 'document')) {
            problems.push('owner and document belong to drift-test-reader rows only');
          }
          if (spec.under && !row.path.startsWith(spec.under)) {
            problems.push(`class ${row.class} names a module under ${spec.under}, and this one is not`);
          }
        } else {
          if (row.receiver !== null) problems.push('a drift-test-reader row carries receiver null and an owner test');
          if (typeof row.owner !== 'string' || !Array.isArray(row.readers)
            || !row.readers.some((reader) => reader?.file === row.owner)) {
            problems.push(`owner ${JSON.stringify(row.owner)} is not one of the row's readers`);
          } else {
            const admitted = driftOwnerDirectories(row.path);
            const slash = row.owner.lastIndexOf('/');
            if (!admitted.includes(row.owner.slice(0, slash)) || !DRIFT_OWNER_TEST_PATTERN.test(row.owner.slice(slash + 1))) {
              problems.push(
                `owner ${row.owner} is not the tests/index.test.* beside a contract/ or parse/ folder of the module`
                + ` (${admitted.length > 0 ? admitted.join(', ') : 'the module sits in neither'}): this is test support and owes a receiver`,
              );
            } else if (!isExactRelativePath(row.document) || !isRegularFile(resolve(packageRoot, row.document))) {
              problems.push(`document ${JSON.stringify(row.document)} must name the existing document the owner test re-derives`);
            } else if (row.document === row.path || !isRegularFile(resolve(packageRoot, row.owner))
              || !namesPath(resolve(packageRoot, row.owner), row.document)) {
              problems.push(`owner ${row.owner} does not read ${row.document}: no string in the test names it`);
            }
          }
        }
      }
    }
    if (problems.length > 0) {
      for (const problem of problems) add('module-class', `${name}: ${problem}`);
    } else {
      verifiedModules.add(row.path);
      report.moduleClasses.push({
        path: row.path,
        class: row.class,
        readers: row.readers.length,
        discovered: discoveredReaders(MODULE_CLASSES[row.class], resolve(packageRoot, row.path), row.path),
        receiver: row.receiver ?? `owner ${row.owner}`,
      });
    }
  }

  for (const path of measured.unreachableModules) {
    if (!verifiedModules.has(path)) {
      add('module-class', `unreachable module outside every named class: ${path} — nothing imports it, no story, `
        + 'test or gate script is proven to read it; retire it or prove its reader');
    }
  }
  report.testOnlyOutsideClasses = measured.testOnlyModules.filter((path) => !verifiedModules.has(path));
  if (report.testOnlyOutsideClasses.length > 0) {
    const problem = receiverProblem(document.residueReceiver, workOrders, assumeDone);
    if (problem) {
      add('module-class', `test-only module(s) outside every named class: ${report.testOnlyOutsideClasses.join(', ')} — `
        + `the residue receiver ${JSON.stringify(document.residueReceiver ?? null)} ${problem}, so nothing owes their retirement`);
    }
  }

  // ── doors ──
  const packageName = loadPackageManifest(packageRoot).manifest.name;
  const evidenceRoots = new Map(consumerRoots.map((root) => [root.id, root.base ?? root.root]));
  const published = new Set(measured.subpaths);
  const consumerless = new Set(measured.consumerlessSubpaths);
  const verifiedDoors = new Set();
  const seenDoors = new Set();
  for (const row of document.doors) {
    const name = isPlainObject(row) && typeof row.subpath === 'string' ? row.subpath : JSON.stringify(row);
    const problems = [];
    if (!isPlainObject(row)) problems.push('the row is not an object');
    else {
      const unknown = unknownKeys(row, DOOR_ROW_KEYS);
      if (unknown.length > 0) problems.push(`unknown key(s): ${unknown.join(', ')}`);
      if (seenDoors.has(row.subpath)) problems.push('duplicate row');
      seenDoors.add(row.subpath);
      if (!published.has(row.subpath)) problems.push('the subpath is not published: delete the row with the door');
      else if (!consumerless.has(row.subpath)) {
        const consumers = measured.perSubpathConsumers[row.subpath].join(', ');
        problems.push(`the door has a measured import consumer (${consumers}): an attribution is only for what cannot be measured`);
      }
      if (!DOOR_CLASSES.includes(row.class)) {
        problems.push(`class ${JSON.stringify(row.class)} is not one of ${DOOR_CLASSES.join(', ')}`);
      }
      if (typeof row.reason !== 'string' || row.reason.trim().length === 0) problems.push('reason is empty');
      if (!Object.hasOwn(row, 'receiver')) problems.push('receiver is missing (null when no disposition is owed)');
      else if (row.receiver !== null) {
        const problem = receiverProblem(row.receiver, workOrders, assumeDone);
        if (problem) problems.push(`receiver ${JSON.stringify(row.receiver)} ${problem}`);
      }
      if (!Array.isArray(row.evidence) || row.evidence.length === 0) problems.push('evidence[] is empty');
      else {
        for (const entry of row.evidence) {
          const problem = evidenceProblem(entry, evidenceRoots, packageRoot, reachable);
          if (problem) problems.push(`evidence ${problem}`);
        }
        const declared = row.evidence.filter((entry) => entry?.root === CORE_EVIDENCE_ROOT);
        const specifier = `${packageName}/${String(row.subpath).replace(/^\.\//u, '')}`;
        if (declared.length > 0 && !declared.some((entry) => typeof entry.needle === 'string' && entry.needle.includes(specifier))) {
          problems.push(`no package evidence names the door's specifier ${specifier}`);
        }
      }
    }
    if (problems.length > 0) {
      for (const problem of problems) add('door-attribution', `${name}: ${problem}`);
    } else {
      verifiedDoors.add(row.subpath);
      report.doorAttributions.push({ subpath: row.subpath, class: row.class, evidence: row.evidence.length });
    }
  }

  const brokenDispositions = new Set();
  for (const [subpath, row] of contractRows) {
    if (!DOOR_DISPOSITIONS.includes(row.disposition)) {
      brokenDispositions.add(subpath);
      add('door-disposition', `${subpath}: disposition ${JSON.stringify(row.disposition)} is not one of ${DOOR_DISPOSITIONS.join(', ')}`);
    } else if (row.disposition !== 'guaranteed') {
      const problem = receiverProblem(row.workOrder ?? row.workOrderCell, workOrders, assumeDone);
      if (problem) {
        brokenDispositions.add(subpath);
        add('door-disposition', `${subpath}: ${row.disposition} ${JSON.stringify(row.workOrderCell)} ${problem} — a disposition `
          + 'must name an open work order');
      }
    }
  }
  for (const subpath of measured.consumerlessSubpaths) {
    if (verifiedDoors.has(subpath)) continue;
    const row = contractRows.get(subpath);
    if (!row) {
      add('door-disposition', `${subpath}: no import consumer, no verified attribution and no row in the consumer contract`);
    } else if (row.disposition === 'guaranteed') {
      add('door-disposition', `${subpath}: guaranteed, yet no import consumer and no verified attribution — attribute it `
        + 'with file:line evidence, or give it a lab / retire-by disposition');
    } else if (!brokenDispositions.has(subpath)) {
      report.doorDispositions.push({ subpath, disposition: row.disposition, workOrder: row.workOrder });
    }
  }

  return { findings, report };
}

// ── cli ─────────────────────────────────────────────────────────────────────

function optionOf(argv, name, fallback) {
  const prefixed = argv.find((argument) => argument.startsWith(`--${name}=`));
  if (prefixed) return prefixed.slice(name.length + 3);
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] && !argv[index + 1].startsWith('--') ? argv[index + 1] : fallback;
}

function samePath(left, right) {
  try {
    return realpathSync(left) === realpathSync(right);
  } catch {
    return resolve(left) === resolve(right);
  }
}

/**
 * Where the class law reads from, and whether it applies. It always applies
 * to this package; a foreign package root opts in by carrying an attribution
 * document at the same relative path or by naming one. It cannot be opted
 * out of: an absent document under the law is a finding, not a skip, and
 * on this package no flag may substitute the document, the contract, the
 * registry or the gate manifest.
 */
export function classLawOptions(argv, packageRoot) {
  const live = samePath(packageRoot, CORE_ROOT);
  const attributionsFlag = optionOf(argv, 'attributions', null);
  const attributionsPath = resolve(attributionsFlag ?? join(packageRoot, ATTRIBUTIONS_RELATIVE_PATH));
  const assumeDone = argv
    .flatMap((argument, index) => {
      if (argument.startsWith('--assume-done=')) return argument.slice('--assume-done='.length).split(',');
      return argument === '--assume-done' ? (argv[index + 1] ?? '').split(',') : [];
    })
    .filter((id) => id.length > 0);
  const substituted = live
    ? ['attributions', 'contract', 'registry', 'gate-manifest'].filter((name) => optionOf(argv, name, null) !== null)
    : [];
  return {
    substituted,
    active: live || attributionsFlag !== null || existsSync(attributionsPath),
    attributionsPath,
    contractPath: resolve(optionOf(argv, 'contract', join(packageRoot, CONTRACT_RELATIVE_PATH))),
    registryPath: resolve(optionOf(argv, 'registry', live ? DEFAULT_REGISTRY_PATH : resolve(packageRoot, '../../roadmap/registry.json'))),
    gateManifestPath: resolve(optionOf(argv, 'gate-manifest', join(packageRoot, GATE_MANIFEST_RELATIVE_PATH))),
    assumeDone,
  };
}

function printList(out, label, members, limit = 20) {
  out(`${label} (${members.length}):`);
  for (const member of members.slice(0, limit)) out(`  ${member}`);
  if (members.length > limit) out(`  … ${members.length - limit} more`);
}

export function run({ argv = process.argv.slice(2), out = console.log, err = console.error } = {}) {
  const mode = argv.includes('--check') ? 'check' : argv.includes('--write') ? 'write' : 'report';
  const packageRoot = resolve(optionOf(argv, 'package-root', CORE_ROOT));
  const baselinePath = resolve(optionOf(argv, 'baseline', DEFAULT_BASELINE_PATH));
  const consumersFlag = optionOf(argv, 'consumers', null);
  const consumerAppsFlag = optionOf(argv, 'consumer-apps', null);
  const pairsOf = (flag) => flag.split(',').map((pair) => {
    const equals = pair.indexOf('=');
    return [pair.slice(0, equals), resolve(pair.slice(equals + 1))];
  });
  const consumerRoots = consumersFlag || consumerAppsFlag
    ? [
      ...(consumersFlag ? pairsOf(consumersFlag).map(([id, root]) => ({ id, root, required: true })) : []),
      ...(consumerAppsFlag ? pairsOf(consumerAppsFlag).map(([id, base]) => consumerApp(id, base)) : []),
    ]
    : DEFAULT_CONSUMER_ROOTS;
  const law = classLawOptions(argv, packageRoot);
  if (law.substituted.length > 0) {
    err(
      `consumer-census: FAIL — ${law.substituted.map((name) => `--${name}`).join(', ')} cannot replace the authorities `
      + 'of this package: the flag is for fixture and foreign package roots only.',
    );
    return 1;
  }

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

  let classes = null;
  if (law.active) {
    classes = auditClasses({ measured, packageRoot, consumerRoots, ...law });
    const outside = measured.unreachableModules.length
      - classes.report.moduleClasses.filter((row) => measured.unreachableModules.includes(row.path)).length;
    out(
      `consumer-census: named classes — ${outside} unreachable outside named classes; `
      + `${classes.report.moduleClasses.length} module(s) in a proven class; `
      + `${classes.report.testOnlyOutsideClasses.length} test-only outside classes; `
      + `${classes.report.doorAttributions.length} door(s) attributed; `
      + `${classes.report.doorDispositions.length} consumerless door(s) held by an open disposition.`,
    );
  } else {
    out(
      'consumer-census: named classes — NOT APPLIED: this package root carries no attribution document '
      + '(pass --attributions); only the decrease-only ratchet is enforced.',
    );
  }
  const breaking = measured.installedPathReads.filter((read) => read.breaksOnUpgrade);
  if (measured.installedPathReads.length > 0) {
    out(
      `consumer-census: installed-path reads — ${measured.installedPathReads.length} `
      + `(${breaking.length} name a path the package no longer ships).`,
    );
  }

  if (mode === 'report') {
    const consumedSubpaths = measured.subpaths.filter((key) => measured.perSubpathConsumers[key].length > 0);
    out('');
    for (const key of consumedSubpaths) {
      const kinds = measured.perSubpathConsumerKinds[key];
      out(`${key} -> ${measured.perSubpathConsumers[key].map((id) => `${id} [${kinds[id].join(', ')}]`).join(', ')}`);
    }
    if (classes) {
      out('');
      out(`moduleClasses (${classes.report.moduleClasses.length}):`);
      for (const row of classes.report.moduleClasses) {
        out(`  ${row.path} — ${row.class}, ${row.readers} cited reader(s) proven of ${row.discovered} found, ${row.receiver}`);
      }
      out(`doorAttributions (${classes.report.doorAttributions.length}):`);
      for (const row of classes.report.doorAttributions) {
        out(`  ${row.subpath} — ${row.class}, ${row.evidence} evidence line(s) verified`);
      }
      out(`doorDispositions (${classes.report.doorDispositions.length}):`);
      for (const row of classes.report.doorDispositions) {
        out(`  ${row.subpath} — ${row.disposition} ${row.workOrder}`);
      }
      printList(out, 'testOnlyOutsideClasses', classes.report.testOnlyOutsideClasses);
      for (const finding of classes.findings) out(`would fail --check: [${finding.leg}] ${finding.detail}`);
    }
    out('');
    out(`installedPathReads (${measured.installedPathReads.length}):`);
    for (const read of measured.installedPathReads) {
      out(`  ${read.root}:${read.file}:${read.line} ${read.path}${read.breaksOnUpgrade ? ' — breaksOnUpgrade' : ''}`);
    }
    out('');
    printList(out, 'consumerlessSubpaths', measured.consumerlessSubpaths);
    out('');
    printList(out, 'unreachableModules', measured.unreachableModules);
    out('');
    printList(out, 'testOnlyModules', measured.testOnlyModules);
    out('');
    printList(out, 'stylesUnreferenced', measured.stylesUnreferenced);
    if (Object.keys(measured.unmatchedSpecifiers).length > 0) {
      out('');
      printList(
        out,
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
    const checkFindings = [...comparison.findings, ...(classes ? classes.findings : [])];
    for (const finding of checkFindings) err(`consumer-census: [${finding.leg}] ${finding.detail}`);
    for (const opportunity of comparison.opportunities) out(`consumer-census: ratchet opportunity — ${opportunity}`);
    if (checkFindings.length > 0) {
      err(`consumer-census: FAIL — ${checkFindings.length} finding(s).`);
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
