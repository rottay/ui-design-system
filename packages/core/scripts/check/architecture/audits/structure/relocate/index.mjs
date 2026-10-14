/**
 * The structure baseline's rename door (--relocate --map <file.json>): after a
 * physical move it re-keys every path-keyed pin and changes nothing else.
 *
 * Input is a rename map `{ "<old repo path>": "<new repo path>" }`, one entry
 * per baseline key path (file or folder; no prefix expansion). The door:
 *
 *   - refuses a map that is not a bijection: a duplicated source or target, an
 *     identity entry, a nested entry that contradicts its parent entry;
 *   - refuses an entry that matches no baseline key, and a baseline key whose
 *     path left the live tree without an entry (coverage, both directions);
 *   - witnesses each entry on the trees: the source existed at the reference
 *     revision and is gone, the target is new and holds the same bytes (or,
 *     only with --specifier-edits, the same text up to module specifiers);
 *   - re-keys in place: a finding keeps its rule and its direction, a pin keeps
 *     its law, and no count, threshold or definition is touched;
 *   - asserts the re-keyed baseline against the live measurement: every moved
 *     pin is a live member at its new path (else its value changed) and the
 *     live tree holds no member the baseline does not (semantic growth).
 *
 * The map may also be sectioned, `{ "rename": {…}, "within": {…}, "drop": {…} }`
 * (the flat form is `rename` alone):
 *
 *   - `within` lists renames nested inside a renamed folder entry that key no
 *     pin; each is witnessed like a rename, and the folder's subtree witness
 *     discounts exactly those subtrees and nothing else;
 *   - `drop` lists, per law, the exact pins a move resolves. A drop is admitted
 *     only for a pin the baseline holds, whose path existed at the reference
 *     revision and left the live tree, and that its law no longer holds live,
 *     neither at its old key nor at the key a rename gives it. Dropping only
 *     ever lowers a law; findings and rootEntrypoints are never dropped.
 *
 * Every refusal is named and nothing is written unless the whole map passes.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { compareStructureBaseline } from '../index.mjs';
import { STRUCTURE_LAWS, changedLawDefinitions, compareStructureLaws, countLines } from '../laws/index.mjs';

const CORE_SOURCE = 'packages/core/src/';
const SHOWROOM_SOURCE = 'packages/showroom/src/';
/** The rule whose right-hand side is an import specifier, not a path. */
const SPECIFIER_RULE = 'unresolved-local-import';

/** Every path-keyed baseline class, with the repository prefix its keys are relative to. */
export const PATH_KEYED_CLASSES = Object.freeze([
  { name: 'laws.members.authored-line-count', law: 'authored-line-count', prefix: '' },
  { name: 'laws.members.single-child-folder', law: 'single-child-folder', prefix: CORE_SOURCE },
  { name: 'laws.members.empty-directory', law: 'empty-directory', prefix: CORE_SOURCE, disk: true },
  { name: 'laws.members.showroom-loose-file', law: 'showroom-loose-file', prefix: SHOWROOM_SOURCE },
  { name: 'laws.members.repeated-path-word', law: 'repeated-path-word', prefix: CORE_SOURCE },
  { name: 'snapshot.findings', prefix: CORE_SOURCE },
  { name: 'snapshot.inventory.rootEntrypoints', prefix: CORE_SOURCE },
]);

/** Baseline fields the door carries forward byte-identical: none is keyed by a path it may move. */
export const CARRIED_FIELDS = Object.freeze([
  'schemaVersion',
  'policy',
  'laws.definitions',
  'snapshot.inventory (every count, ignoredByKind, findingsByRule, findingsByTopLevelScope)',
]);

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*|\b(?:vi|jest)\.(?:mock|doMock|unmock|importActual|importMock)\s*\(\s*|@import\s+(?:url\(\s*)?)(['"`])[^'"`\n]*\2/gu;
const MAP_KEY = /"((?:[^"\\]|\\.)*)"\s*:/gu;

const MAP_SECTIONS = Object.freeze(['rename', 'within', 'drop']);

const sorted = (values) => [...values].sort((left, right) => left.localeCompare(right));
/** Each class keeps its producer's order: tighten pins laws and findings by code unit, the audit sorts entrypoints by locale. */
const byCodeUnit = (values) => [...values].sort();
const topLevel = (path) => path.split('/')[0] ?? '';

function validRepoPath(path) {
  return typeof path === 'string'
    && path.length > 0
    && !path.startsWith('/')
    && !path.endsWith('/')
    && !path.includes('\\')
    && path.split('/').every((segment) => segment && segment !== '.' && segment !== '..');
}

const plainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function parsePairs(section, label, refused) {
  const entries = [];
  for (const [from, to] of Object.entries(section)) {
    if (typeof to !== 'string') {
      refused.push(`malformed entry ${from}: the target must be a path string; a map carries no value, count or rule`);
      continue;
    }
    if (!validRepoPath(from) || !validRepoPath(to)) {
      refused.push(`malformed entry ${from} -> ${to}: paths are repository-relative, without ./, .., backslashes or a trailing /`);
      continue;
    }
    if (from === to) {
      refused.push(`identity entry: ${from} maps to itself`);
      continue;
    }
    entries.push({ from, to, section: label });
  }
  return entries.sort((left, right) => left.from.localeCompare(right.from));
}

function parseDrops(section, refused) {
  const drops = [];
  for (const [law, keys] of Object.entries(section)) {
    if (!STRUCTURE_LAWS.includes(law)) {
      refused.push(`malformed drop: ${law} is not a structure law; only law pins may be dropped (findings and rootEntrypoints never are)`);
      continue;
    }
    if (!Array.isArray(keys) || keys.some((key) => typeof key !== 'string' || key.length === 0)) {
      refused.push(`malformed drop: ${law} must list the exact pin keys as non-empty strings; a drop carries no value or count`);
      continue;
    }
    const seen = new Set();
    for (const key of keys) {
      if (seen.has(key)) refused.push(`malformed drop: ${law} ${key} listed more than once`);
      else drops.push({ law, key });
      seen.add(key);
    }
  }
  return drops;
}

/** Parse the map text; duplicate keys are read from the raw text, which JSON.parse would silently drop. */
export function parseRenameMap(text) {
  const refused = [];
  let document;
  try {
    document = JSON.parse(text);
  } catch (error) {
    return { entries: [], within: [], drops: [], refused: [`malformed map: ${error.message}`] };
  }
  if (!plainObject(document)) {
    return { entries: [], within: [], drops: [], refused: ['malformed map: expected a JSON object { "<old path>": "<new path>" } or { "rename", "within", "drop" }'] };
  }
  const rawKeys = [...text.matchAll(MAP_KEY)].map((match) => JSON.parse(`"${match[1]}"`));
  const seenSources = new Set();
  for (const key of rawKeys) {
    if (seenSources.has(key)) refused.push(`non-bijective map: source listed more than once: ${key}`);
    seenSources.add(key);
  }
  const sectioned = Object.entries(document).some(([key, value]) => MAP_SECTIONS.includes(key) && typeof value !== 'string');
  const sections = sectioned ? document : { rename: document };
  if (sectioned) {
    for (const key of Object.keys(document)) {
      if (!MAP_SECTIONS.includes(key)) refused.push(`malformed map: unknown section ${key}; a sectioned map holds only ${MAP_SECTIONS.join(', ')}`);
    }
    for (const key of MAP_SECTIONS) {
      if (key in document && !plainObject(document[key])) refused.push(`malformed map: section ${key} must be an object`);
    }
  }
  const pick = (key) => (plainObject(sections[key]) ? sections[key] : {});
  const entries = parsePairs(pick('rename'), 'rename', refused);
  const within = parsePairs(pick('within'), 'within', refused);
  const drops = parseDrops(pick('drop'), refused);
  const byTarget = new Map();
  for (const entry of [...entries, ...within]) byTarget.set(entry.to, [...(byTarget.get(entry.to) ?? []), entry.from]);
  for (const [to, froms] of byTarget) {
    if (froms.length > 1) refused.push(`non-bijective map: ${froms.length} sources map to ${to}: ${sorted(froms).join(', ')}`);
  }
  for (const outer of entries) {
    for (const inner of entries) {
      if (inner === outer || !inner.from.startsWith(`${outer.from}/`)) continue;
      const expected = `${outer.to}${inner.from.slice(outer.from.length)}`;
      if (inner.to !== expected) refused.push(`inconsistent nested entry: ${inner.from} -> ${inner.to} contradicts ${outer.from} -> ${outer.to} (expected ${expected})`);
    }
  }
  return { entries, within, drops, refused };
}

/** A tree view over a file list; folders are derived, an empty folder is invisible (Git holds none). */
export function treeView(files, read) {
  const fileSet = new Set(files);
  const folders = new Set();
  for (const path of files) {
    const parts = path.split('/');
    for (let index = 1; index < parts.length; index += 1) folders.add(parts.slice(0, index).join('/'));
  }
  return {
    files,
    read,
    isFile: (path) => fileSet.has(path),
    exists: (path) => fileSet.has(path) || folders.has(path),
    under: (path) => (fileSet.has(path) ? [''] : files.filter((file) => file.startsWith(`${path}/`)).map((file) => file.slice(path.length))),
  };
}

function findingParts(id) {
  const colon = id.indexOf(':');
  const rule = id.slice(0, colon);
  const rest = id.slice(colon + 1);
  const ends = rest.split('->');
  return { rule, ends, pathEnds: rule === SPECIFIER_RULE ? [0] : ends.map((_, index) => index) };
}

/** Every path-keyed key of the baseline, each with its repository-relative path(s). */
export function baselineKeys(baseline) {
  const keys = [];
  for (const spec of PATH_KEYED_CLASSES) {
    if (spec.law) {
      for (const key of baseline.laws?.members?.[spec.law] ?? []) keys.push({ spec, key, paths: [`${spec.prefix}${key}`] });
    } else if (spec.name === 'snapshot.findings') {
      for (const ids of Object.values(baseline.snapshot?.findings ?? {})) {
        for (const id of ids) {
          const { ends, pathEnds } = findingParts(id);
          keys.push({ spec, key: id, paths: pathEnds.map((index) => `${spec.prefix}${ends[index]}`) });
        }
      }
    } else {
      for (const key of baseline.snapshot?.inventory?.rootEntrypoints ?? []) keys.push({ spec, key, paths: [`${spec.prefix}${key}`] });
    }
  }
  return keys;
}

const normalizeSpecifiers = (text) => text.replace(SPECIFIER, (_, head, quote) => `${head}${quote}${quote}`);

const inside = (path, folder) => path.startsWith(`${folder}/`);
const outside = (suffixes, nested) => suffixes.filter((suffix) => !nested.some((relative) => suffix === relative || suffix.startsWith(`${relative}/`)));

/**
 * same-byte, specifier-only, or the first difference that makes it a content
 * change. `nested` are the within entries inside this folder entry: their
 * subtrees are discounted on both sides and witnessed by their own entry.
 */
function compareContent(entry, before, after, nested = []) {
  const left = outside(before.under(entry.from), nested.map(({ from }) => from.slice(entry.from.length)));
  const right = outside(after.under(entry.to), nested.map(({ to }) => to.slice(entry.to.length)));
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const missing = left.filter((suffix) => !rightSet.has(suffix));
  const extra = right.filter((suffix) => !leftSet.has(suffix));
  if (missing.length > 0 || extra.length > 0) {
    return { status: 'changed', detail: `subtree differs (missing ${missing.length}: ${missing.slice(0, 3).join(', ') || '-'}; extra ${extra.length}: ${extra.slice(0, 3).join(', ') || '-'})` };
  }
  let status = 'same-byte';
  for (const suffix of sorted(left)) {
    const oldText = before.read(`${entry.from}${suffix}`);
    const newText = after.read(`${entry.to}${suffix}`);
    if (oldText === null || newText === null) return { status: 'changed', detail: `unreadable ${entry.to}${suffix}` };
    if (oldText === newText) continue;
    const oldLines = countLines(oldText);
    const newLines = countLines(newText);
    if (oldLines !== newLines) return { status: 'changed', detail: `line count ${oldLines} -> ${newLines} in ${entry.to}${suffix}` };
    if (normalizeSpecifiers(oldText) !== normalizeSpecifiers(newText)) return { status: 'changed', detail: `content changed in ${entry.to}${suffix}` };
    status = 'specifier-only';
  }
  if (nested.length > 0 && status === 'same-byte') {
    return { status: `same-byte modulo within ${nested.map(({ from, to }) => `${from.slice(entry.from.length + 1)} -> ${to.slice(entry.to.length + 1)}`).join(', ')}` };
  }
  return { status };
}

function rekeyFindingId(id, destination) {
  const { rule, ends, pathEnds } = findingParts(id);
  const moved = ends.map((end, index) => (pathEnds.includes(index) ? destination(`${CORE_SOURCE}${end}`)?.slice(CORE_SOURCE.length) ?? end : end));
  return `${rule}:${moved.join('->')}`;
}

function carriedView(baseline) {
  const { rootEntrypoints, ...counts } = baseline.snapshot?.inventory ?? {};
  return JSON.stringify([baseline.schemaVersion, baseline.policy, baseline.laws?.definitions, counts, rootEntrypoints?.length]);
}

/**
 * Validate the whole map, then re-key. Returns { refused, baseline }: on any
 * refusal `baseline` is the input object, untouched.
 */
export function relocateStructureBaseline({ baseline, mapText, result, laws, before, after, specifierEdits = false }) {
  const parsed = parseRenameMap(mapText);
  const refused = [...parsed.refused];
  const { entries, within, drops } = parsed;
  if (refused.length === 0 && entries.length + within.length + drops.length === 0) return { refused, noop: true, baseline, rekeyed: [], dropped: [], content: [], staleUntouched: [] };

  const lawSpec = (law) => PATH_KEYED_CLASSES.find((spec) => spec.law === law);
  const dropped = new Set(drops.map(({ law, key }) => `${law}\0${key}`));
  const isDropped = (key) => Boolean(key.spec.law) && dropped.has(`${key.spec.law}\0${key.key}`);
  for (const { law, key } of drops) {
    if (!(baseline.laws?.members?.[law] ?? []).includes(key)) refused.push(`drop names no pin: ${law} ${key} is not held by the baseline`);
  }

  const keys = baselineKeys(baseline);
  const keyedPaths = new Map();
  const anyKeyedPaths = new Set();
  for (const key of keys) {
    for (const path of key.paths) {
      anyKeyedPaths.add(path);
      if (!isDropped(key)) keyedPaths.set(path, [...(keyedPaths.get(path) ?? []), key]);
    }
  }
  const destinationByPath = new Map(entries.map((entry) => [entry.from, entry.to]));
  const sources = new Set([...entries, ...within].map(({ from }) => from));
  const targets = new Set([...entries, ...within].map(({ to }) => to));

  for (const entry of entries) {
    if (!keyedPaths.has(entry.from)) {
      refused.push(anyKeyedPaths.has(entry.from)
        ? `map entry re-keys nothing: every pin at ${entry.from} is dropped`
        : `map entry matches no baseline key: ${entry.from} -> ${entry.to}`);
    }
    for (const key of keyedPaths.get(entry.from) ?? []) {
      if (!entry.to.startsWith(key.spec.prefix)) refused.push(`class change: ${entry.to} leaves the ${key.spec.name} root ${key.spec.prefix}`);
    }
  }
  const parentOf = new Map();
  for (const nested of within) {
    if (anyKeyedPaths.has(nested.from)) refused.push(`within entry keys a pin: ${nested.from} belongs in rename`);
    const parents = entries.filter((entry) => inside(nested.from, entry.from)).sort((left, right) => right.from.length - left.from.length);
    if (parents.length === 0) refused.push(`within entry outside every renamed folder: ${nested.from}`);
    else if (!inside(nested.to, parents[0].to)) refused.push(`within entry leaves its renamed folder: ${nested.to} is not inside ${parents[0].to}`);
    else parentOf.set(nested, parents[0]);
  }
  if (refused.length > 0) return { refused: [...new Set(refused)], baseline, rekeyed: [], dropped: [], content: [] };

  const content = [];
  const witness = (entry, nested = []) => {
    if (!before.exists(entry.from)) refused.push(`source absent from the reference tree: ${entry.from}`);
    if (!after.exists(entry.to)) refused.push(`target absent from the live tree: ${entry.to}`);
    if (after.exists(entry.from) && !targets.has(entry.from)) refused.push(`source still present in the live tree (a copy, not a move): ${entry.from}`);
    if (before.exists(entry.to) && !sources.has(entry.to)) refused.push(`target collides with an existing unmapped path: ${entry.to}`);
    if (!before.exists(entry.from) || !after.exists(entry.to)) return;
    const compared = compareContent(entry, before, after, nested);
    content.push({ ...entry, status: entry.section === 'within' ? `${compared.status} (within ${parentOf.get(entry).from})` : compared.status });
    if (compared.status === 'changed') refused.push(`content change: ${entry.from} -> ${entry.to}: ${compared.detail}`);
    else if (compared.status === 'specifier-only' && !specifierEdits) {
      refused.push(`content change: ${entry.from} -> ${entry.to}: module specifiers edited; only --specifier-edits admits a specifier-only delta`);
    }
  };
  for (const entry of entries) {
    const matched = keyedPaths.get(entry.from) ?? [];
    if (matched.every((key) => key.spec.disk)) {
      content.push({ ...entry, status: 'disk-only (empty folder; witnessed by the live measurement)' });
      continue;
    }
    witness(entry, within.filter((nested) => parentOf.get(nested) === entry));
  }
  for (const nested of within) witness(nested);

  for (const key of keys) {
    if (key.spec.disk || isDropped(key)) continue;
    for (const path of key.paths) {
      if (!sources.has(path) && !after.exists(path)) refused.push(`unmapped baseline path: ${key.spec.name} ${key.key} (${path} left the live tree and the map does not cover it)`);
    }
  }

  const destination = (path) => destinationByPath.get(path) ?? null;
  if (drops.length > 0 && !laws?.members) refused.push('drop unwitnessed: no live law measurement to prove the dropped pins are gone');
  for (const { law, key } of drops) {
    const spec = lawSpec(law);
    const path = `${spec.prefix}${key}`;
    const target = destination(path)?.slice(spec.prefix.length);
    if (!spec.disk && !before.exists(path)) refused.push(`drop unwitnessed: ${law} ${key} did not exist at the reference revision`);
    if (!spec.disk && after.exists(path)) refused.push(`drop unwitnessed: ${law} ${key} is still in the live tree; a rename door drops only what a move resolves (tighten owns in-place resolution)`);
    if (laws?.members?.[law]?.includes(key)) refused.push(`drop of a live pin: ${law} still holds ${key}`);
    if (target && laws?.members?.[law]?.includes(target)) refused.push(`drop of a pin still live at its target: ${law} holds ${key} -> ${target}`);
  }

  const rekeyed = [];
  const rekey = (spec, list, move, order = byCodeUnit) => {
    const next = list.map((key) => {
      const moved = move(key);
      if (moved !== key) rekeyed.push({ class: spec.name, from: key, to: moved });
      return moved;
    });
    const seen = new Set();
    for (const key of next) {
      if (seen.has(key)) refused.push(`re-key collision in ${spec.name}: ${key} would be held twice`);
      seen.add(key);
    }
    return order(next);
  };

  const members = { ...baseline.laws?.members };
  for (const spec of PATH_KEYED_CLASSES.filter(({ law }) => law)) {
    const kept = (baseline.laws?.members?.[spec.law] ?? []).filter((key) => !dropped.has(`${spec.law}\0${key}`));
    members[spec.law] = rekey(spec, kept, (key) => destination(`${spec.prefix}${key}`)?.slice(spec.prefix.length) ?? key);
  }
  const findingsSpec = PATH_KEYED_CLASSES.find(({ name }) => name === 'snapshot.findings');
  const findings = {};
  for (const [rule, ids] of Object.entries(baseline.snapshot?.findings ?? {})) {
    findings[rule] = rekey(findingsSpec, ids, (id) => rekeyFindingId(id, destination));
  }
  for (const move of rekeyed.filter((entry) => entry.class === findingsSpec.name)) {
    const oldPath = move.from.slice(move.from.indexOf(':') + 1).split('->')[0];
    const newPath = move.to.slice(move.to.indexOf(':') + 1).split('->')[0];
    if (topLevel(oldPath) !== topLevel(newPath)) refused.push(`value change: ${move.from} would move from scope ${topLevel(oldPath)} to ${topLevel(newPath)}, changing findingsByTopLevelScope`);
  }
  const entrypointsSpec = PATH_KEYED_CLASSES.find(({ name }) => name === 'snapshot.inventory.rootEntrypoints');
  const rootEntrypoints = baseline.snapshot?.inventory?.rootEntrypoints;

  const candidate = {
    ...baseline,
    snapshot: {
      ...baseline.snapshot,
      inventory: rootEntrypoints
        ? { ...baseline.snapshot.inventory, rootEntrypoints: rekey(entrypointsSpec, rootEntrypoints, (key) => destination(`${CORE_SOURCE}${key}`)?.slice(CORE_SOURCE.length) ?? key, sorted) }
        : baseline.snapshot?.inventory,
      findings,
    },
    laws: { ...baseline.laws, members },
  };

  if (carriedView(candidate) !== carriedView(baseline)) refused.push('invariant broken: a carried field changed');
  const movedTargets = new Set(rekeyed.map(({ class: name, to }) => `${name}\0${to}`));
  if (laws && result) {
    for (const law of changedLawDefinitions(laws, candidate.laws)) refused.push(`${law}: definition changed: the door never re-rules a law`);
    const lawComparison = compareStructureLaws(laws, candidate.laws);
    const findingComparison = compareStructureBaseline(result, candidate);
    for (const law of STRUCTURE_LAWS) {
      for (const member of lawComparison.added[law] ?? []) refused.push(`semantic growth: ${law} gains live member ${member} the baseline never held`);
      for (const member of lawComparison.stale[law] ?? []) {
        if (movedTargets.has(`laws.members.${law}\0${member}`)) refused.push(`value change: ${law} pin re-keyed to ${member} is not a live member there`);
      }
    }
    for (const id of findingComparison.added) refused.push(`semantic growth: live finding ${id} the baseline never held`);
    for (const id of findingComparison.resolved) {
      if (movedTargets.has(`snapshot.findings\0${id}`)) refused.push(`value change: finding re-keyed to ${id} is not live there`);
    }
  }
  const droppedList = drops.map(({ law, key }) => ({ class: `laws.members.${law}`, key }));
  if (refused.length > 0) return { refused: [...new Set(refused)], baseline, rekeyed, dropped: droppedList, content };

  const staleUntouched = [];
  if (laws && result) {
    const lawComparison = compareStructureLaws(laws, candidate.laws);
    for (const law of STRUCTURE_LAWS) for (const member of lawComparison.stale[law] ?? []) staleUntouched.push(`${law}: ${member}`);
    for (const id of compareStructureBaseline(result, candidate).resolved) staleUntouched.push(id);
  }
  for (const { class: name, key } of droppedList) content.push({ from: key, to: '(dropped)', status: `drop ${name} (witnessed: left the tree, not live)` });
  return { refused, baseline: candidate, rekeyed, dropped: droppedList, content, staleUntouched };
}

/** The reference tree at a Git revision and the live tree (index + worktree), as the laws' census reads them. */
export function gitTrees({ repoRoot, rev = 'HEAD', liveFiles }) {
  const listed = execFileSync('git', ['-C', repoRoot, 'ls-tree', '-r', '--name-only', '-z', rev], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0')
    .filter(Boolean);
  const readAt = (path) => {
    try {
      return execFileSync('git', ['-C', repoRoot, 'show', `${rev}:${path}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      return null;
    }
  };
  const readLive = (path) => {
    try {
      return readFileSync(join(repoRoot, path), 'utf8');
    } catch {
      return null;
    }
  };
  return {
    before: treeView(listed, readAt),
    after: treeView(liveFiles.filter((path) => existsSync(join(repoRoot, path))), readLive),
  };
}
