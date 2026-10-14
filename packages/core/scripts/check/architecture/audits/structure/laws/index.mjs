/**
 * Structure laws measured over the tracked tree.
 *
 * Five census quantities, each a decrease-only law pinned by member identity in
 * the structure baseline:
 *
 *   authored-line-count   authored files over LINE_COUNT_LIMIT lines, in the
 *                         LINE_COUNT_SCOPE (D3) of packages/{core,showroom};
 *   single-child-folder   packages/core/src folders whose only child is a folder;
 *   empty-directory       empty folders on disk under packages/core/src, minus
 *                         the registered worktree-only ones (Git holds none);
 *   showroom-loose-file   packages/showroom/src sources outside folder/index:
 *                         not index.*, not a Next route file, not a test/story;
 *   repeated-path-word    packages/core/src minimal owner folders that repeat a
 *                         path word under REPEATED_PATH_WORD_DEFINITION (D2).
 *
 * D3 is an open ruling; D2 was ruled word-any (owner 2026-10-13). The
 * definitions are named constants stored PER LAW: a ruling flips one constant,
 * only that law's stored definition stops matching, and only that law may be
 * re-keyed by a sighted re-anchor. Every candidate definition is also measured
 * and reported each run.
 *
 * Census method: git ls-files; .ts .tsx .mts .cts .js .jsx .mjs .cjs .css;
 * generated/, dist/ and .d.ts dropped; a generated banner in the first three
 * lines drops the file.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

export const LINE_COUNT_LIMIT = 800;
/** D3, unruled: which authored files the line-count law charges. */
export const LINE_COUNT_SCOPES = Object.freeze({
  'all-authored': () => true,
  'core-src-productive': (file) => file.scope === 'core/src' && !file.test,
});
export const LINE_COUNT_SCOPE = 'all-authored';

/** D2, ruled word-any (owner 2026-10-13): what counts as a repeated path word. */
export const REPEATED_PATH_WORD_DEFINITIONS = Object.freeze(['segment-adjacent', 'segment-any', 'word-any']);
export const REPEATED_PATH_WORD_DEFINITION = 'word-any';

/** Empty folders a live worktree may hold; Git cannot track them. An exemption list, not a definition: it may only shrink. */
export const REGISTERED_WORKTREE_EMPTY_DIRECTORIES = Object.freeze([]);

export const STRUCTURE_LAWS = Object.freeze([
  'authored-line-count',
  'single-child-folder',
  'empty-directory',
  'showroom-loose-file',
  'repeated-path-word',
]);

const CORE_SOURCE_PREFIX = 'packages/core/src/';
const SHOWROOM_SOURCE_PREFIX = 'packages/showroom/src/';
const AUTHORED_EXTENSION = /\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs|css)$/u;
const GENERATED_BANNER = /^\s*(?:\/\/|\/\*+|\*)\s*(?:@generated\b|GENERATED\b|auto-?generated\b|(?:this\s+)?file\s+(?:is\s+)?(?:auto-)?generated\b|do not edit\b)/iu;
const TEST_PATH = /(?:\.(?:test|spec)\.|\/tests?\/|\/__tests__\/|\.stories\.|\/fixtures?\/|\/__fixtures__\/|\/e2e\/)/u;
const NEXT_ROUTE_FILE = /^(?:page|layout|route|loading|error|not-found|template|default|global-error|opengraph-image|twitter-image|icon|apple-icon|sitemap|robots|manifest|head|middleware|instrumentation)\.[a-z]+$/u;
const SHOWROOM_SOURCE_EXTENSION = /\.(?:ts|tsx|js|jsx|mjs|cjs|css)$/u;
const SHOWROOM_TEST_PATH = /(?:\.(?:test|spec)\.|\/tests?\/|\/__tests__\/|\.stories\.)/u;

export function listTrackedFiles(repoRoot) {
  return execFileSync('git', ['-C', repoRoot, 'ls-files', '-z'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0')
    .filter(Boolean);
}

function lineCountScope(path) {
  if (path.startsWith('packages/core/src/')) return 'core/src';
  if (path.startsWith('packages/core/scripts/')) return 'core/scripts';
  if (path.startsWith('packages/showroom/src/')) return 'showroom/src';
  return path.startsWith('packages/core/') ? 'core/other' : 'showroom/other';
}

/** Lines as the census counts them: newlines, plus one for an unterminated last line. */
export function countLines(text) {
  if (!text) return 0;
  const newlines = text.split('\n').length - 1;
  return newlines + (text.endsWith('\n') ? 0 : 1);
}

/** The authored files the census reads, with their line counts. */
export function authoredFiles(files, readText, exempt = { banner: 0 }) {
  const authored = [];
  for (const path of files) {
    if (!path.startsWith('packages/core/') && !path.startsWith('packages/showroom/')) continue;
    if (!AUTHORED_EXTENSION.test(path)) continue;
    if (path.includes('/generated/') || path.includes('/dist/') || path.endsWith('.d.ts')) continue;
    const text = readText(path);
    if (text === null) continue;
    if (text.split('\n').slice(0, 3).some((line) => GENERATED_BANNER.test(line))) {
      exempt.banner += 1;
      continue;
    }
    authored.push({ path, lines: countLines(text), scope: lineCountScope(path), test: TEST_PATH.test(path) });
  }
  return authored;
}

export function measureLineCount(authored, { limit = LINE_COUNT_LIMIT, scope = LINE_COUNT_SCOPE } = {}) {
  const inScope = LINE_COUNT_SCOPES[scope];
  if (!inScope) throw new Error(`unknown line-count scope ${JSON.stringify(scope)}`);
  const over = authored.filter((file) => file.lines > limit);
  const split = {};
  for (const file of over) {
    const key = `${file.scope} ${file.test ? 'test' : 'productive'}`;
    split[key] = (split[key] ?? 0) + 1;
  }
  const byScope = Object.fromEntries(
    Object.entries(LINE_COUNT_SCOPES).map(([name, filter]) => [name, over.filter(filter).length]),
  );
  return { members: over.filter(inScope).map((file) => file.path).sort(), split, byScope };
}

/** Folders derived from tracked files under `prefix`, each with its child names. */
export function folderTree(files, prefix) {
  const children = new Map();
  const folders = new Set();
  for (const path of files) {
    if (!path.startsWith(prefix)) continue;
    const parts = path.slice(prefix.length).split('/');
    for (let index = 0; index < parts.length; index += 1) {
      const parent = parts.slice(0, index).join('/');
      if (!children.has(parent)) children.set(parent, new Set());
      children.get(parent).add(parts[index]);
      if (index < parts.length - 1) folders.add(parts.slice(0, index + 1).join('/'));
    }
  }
  return { folders, children };
}

export function measureSingleChildFolders(files, prefix = CORE_SOURCE_PREFIX) {
  const { folders, children } = folderTree(files, prefix);
  return [...folders]
    .filter((folder) => {
      const kids = children.get(folder);
      if (kids?.size !== 1) return false;
      const [only] = kids;
      return folders.has(`${folder}/${only}`);
    })
    .sort();
}

/** Empty folders on disk; the tracked tree cannot hold one, so this measures a checkout. */
export function measureEmptyDirectories(sourceRoot, registered = REGISTERED_WORKTREE_EMPTY_DIRECTORIES) {
  const empty = [];
  const walk = (directory) => {
    const entries = readdirSync(directory, { withFileTypes: true });
    if (entries.length === 0) empty.push(relative(sourceRoot, directory).split('\\').join('/'));
    for (const entry of entries) if (entry.isDirectory()) walk(join(directory, entry.name));
  };
  if (existsSync(sourceRoot)) walk(sourceRoot);
  const known = new Set(registered);
  return {
    members: empty.filter((path) => !known.has(path)).sort(),
    registeredPresent: empty.filter((path) => known.has(path)).sort(),
  };
}

export function measureShowroomLooseFiles(files, prefix = SHOWROOM_SOURCE_PREFIX) {
  return files
    .filter((path) => path.startsWith(prefix))
    .map((path) => path.slice(prefix.length))
    .filter((path) => {
      const name = path.split('/').pop();
      if (!SHOWROOM_SOURCE_EXTENSION.test(name)) return false;
      if (name.startsWith('index.')) return false;
      if (SHOWROOM_TEST_PATH.test(path)) return false;
      return !NEXT_ROUTE_FILE.test(name);
    })
    .sort();
}

function firstRepeatIndex(segments, definition) {
  if (definition === 'segment-adjacent') {
    for (let index = 1; index < segments.length; index += 1) {
      if (segments[index] === segments[index - 1]) return index;
    }
    return null;
  }
  const byWord = definition === 'word-any';
  const seen = new Set();
  for (let index = 0; index < segments.length; index += 1) {
    const words = (byWord ? segments[index].split(/[-_.]/u) : [segments[index]]).filter(Boolean);
    if (words.some((word) => seen.has(word))) return index;
    for (const word of words) seen.add(word);
  }
  return null;
}

/** Minimal owner folders (the prefix ending at the first repeat) under `definition`. */
export function measureRepeatedPathWords(files, definition = REPEATED_PATH_WORD_DEFINITION, prefix = CORE_SOURCE_PREFIX) {
  if (!REPEATED_PATH_WORD_DEFINITIONS.includes(definition)) {
    throw new Error(`unknown repeated-path-word definition ${JSON.stringify(definition)}`);
  }
  const { folders } = folderTree(files, prefix);
  const owners = new Set();
  for (const folder of folders) {
    const segments = folder.split('/');
    const index = firstRepeatIndex(segments, definition);
    if (index !== null) owners.add(segments.slice(0, index + 1).join('/'));
  }
  return [...owners].sort();
}

/** The definition each law ran under, per law; a stored pin must match its own law's entry. */
export function lawDefinitions() {
  return {
    'authored-line-count': { limit: LINE_COUNT_LIMIT, scope: LINE_COUNT_SCOPE },
    'single-child-folder': { root: CORE_SOURCE_PREFIX, child: 'folder' },
    'empty-directory': { root: CORE_SOURCE_PREFIX, measures: 'disk' },
    'showroom-loose-file': { root: SHOWROOM_SOURCE_PREFIX, rule: 'folder-index-next-route-test' },
    'repeated-path-word': { root: CORE_SOURCE_PREFIX, definition: REPEATED_PATH_WORD_DEFINITION },
  };
}

/** The laws whose stored definition differs from the current one (all of them when nothing is pinned). */
export function changedLawDefinitions(measured, pinned) {
  return STRUCTURE_LAWS.filter((law) => !pinned?.definitions?.[law] || !sameJson(pinned.definitions[law], measured.definitions[law]));
}

export function measureStructureLaws({ repoRoot, files = listTrackedFiles(repoRoot), readText } = {}) {
  const read = readText ?? ((path) => {
    try {
      return readFileSync(join(repoRoot, path), 'utf8');
    } catch {
      return null;
    }
  });
  const exempt = { banner: 0 };
  const lineCount = measureLineCount(authoredFiles(files, read, exempt));
  const empty = measureEmptyDirectories(join(repoRoot, CORE_SOURCE_PREFIX));
  const repeated = Object.fromEntries(
    REPEATED_PATH_WORD_DEFINITIONS.map((definition) => [definition, measureRepeatedPathWords(files, definition)]),
  );
  return {
    definitions: lawDefinitions(),
    members: {
      'authored-line-count': lineCount.members,
      'single-child-folder': measureSingleChildFolders(files),
      'empty-directory': empty.members,
      'showroom-loose-file': measureShowroomLooseFiles(files),
      'repeated-path-word': repeated[REPEATED_PATH_WORD_DEFINITION],
    },
    informational: {
      lineCountSplit: lineCount.split,
      lineCountByScope: lineCount.byScope,
      repeatedPathWordByDefinition: Object.fromEntries(
        Object.entries(repeated).map(([definition, owners]) => [definition, owners.length]),
      ),
      registeredWorktreeEmptyDirectoriesPresent: empty.registeredPresent,
      generatedBannerExempt: exempt.banner,
    },
  };
}

const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);

/**
 * Exact pinning: a member the baseline does not hold is new debt, and a pinned
 * member that is gone is a stale pin the tighten-only producer must drop.
 */
export function compareStructureLaws(measured, pinned) {
  const problems = [];
  if (!pinned) {
    return { passed: false, problems: ['the baseline pins no structure laws: run --re-anchor once (sighted)'], added: {}, stale: {} };
  }
  for (const law of changedLawDefinitions(measured, pinned)) {
    problems.push(`${law}: definition changed (${JSON.stringify(pinned.definitions?.[law] ?? null)} -> ${JSON.stringify(measured.definitions[law])}): only this law may be re-keyed, by one sighted --re-anchor`);
  }
  const added = {};
  const stale = {};
  for (const law of STRUCTURE_LAWS) {
    const held = new Set(pinned.members?.[law] ?? []);
    const live = new Set(measured.members[law]);
    added[law] = [...live].filter((member) => !held.has(member)).sort();
    stale[law] = [...held].filter((member) => !live.has(member)).sort();
    if (added[law].length > 0) problems.push(`${law}: ${added[law].length} new member(s): ${added[law].slice(0, 5).join(', ')}`);
    if (stale[law].length > 0) problems.push(`${law}: ${stale[law].length} stale pin(s), live below the pin -- lower it with --update-baseline`);
  }
  return { passed: problems.length === 0, problems, added, stale };
}
