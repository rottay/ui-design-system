import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { createRootPublicResolver } from '../../../../libraries/taxonomy/roots/index.mjs';
import { REPOSITORY_ROOT, loadProgramContracts } from '../contracts/index.mjs';

const CORE_ROOT = 'packages/core';
const UI_ROOT = `${CORE_ROOT}/src/components`;

/**
 * Layer profiles are the rubric's acceptance-threshold vocabulary; divergence profiles are
 * the separate tenant-axis vocabulary. A family carries both, and neither may be guessed at
 * evaluation time — an unresolved family must fail closed instead of borrowing a neighbour's
 * floor.
 */
const INTERACTIVE_PRIMITIVE_CATEGORIES = new Set(['inputs', 'navigation', 'feedback', 'overlay']);

/**
 * Display and layout families that own collection/temporal data or a real interaction, and
 * therefore answer to the interactive-control-data-overlay floor rather than the static one.
 * Each entry names the capability that decides it.
 */
const DATA_OR_INTERACTIVE_EXCEPTIONS = Object.freeze({
  Calendar: 'renders a temporal data grid with selection',
  Carousel: 'owns paging interaction and focus order',
  Descriptions: 'renders a label/value data region',
  List: 'renders a collection with item interaction',
  Table: 'renders tabular data with header/row/cell anatomy',
  Timeline: 'renders temporal collection data',
  Tree: 'renders hierarchical data with expansion interaction',
  Tooltip: 'renders a floating overlay bound to a trigger',
  Collapse: 'owns disclosure interaction',
  Splitter: 'owns pointer-driven resize interaction',
  ResizeHandle: 'owns pointer-driven resize interaction',
  Meter: 'renders a value-bearing data indicator',
});

// Keyed by layerProfile, not by layer. `surface-composition` and `commercial`
// used to appear here as if they were layers of their own. Neither is: the five
// canonical family layers are primitive|pattern|structure|surface|chart, and a
// profile keyed on a sixth name let the forbidden layers survive inside the
// machinery that was supposed to police them. The surface profile now says
// `surface`, which is what it always described.
const LAYER_TO_DIVERGENCE_PROFILE = Object.freeze({
  'primitive-static-layout': 'atomic-static',
  'primitive-interactive-control-data-overlay': 'interactive-control-layout',
  pattern: 'pattern-chart',
  chart: 'pattern-chart',
  structure: 'structure',
  surface: 'surface-canary',
});

export function resolveLayerProfile(row) {
  if (row.layer === 'primitive') {
    if (INTERACTIVE_PRIMITIVE_CATEGORIES.has(row.category)) {
      return {
        layerProfile: 'primitive-interactive-control-data-overlay',
        signal: `primitive category ${row.category}`,
      };
    }
    const exception = componentsOf(row).find((component) => DATA_OR_INTERACTIVE_EXCEPTIONS[component]);
    if (exception) {
      return {
        layerProfile: 'primitive-interactive-control-data-overlay',
        signal: DATA_OR_INTERACTIVE_EXCEPTIONS[exception],
      };
    }
    return { layerProfile: 'primitive-static-layout', signal: `static ${row.category} primitive` };
  }
  if (row.layer === 'surface') return { layerProfile: 'surface', signal: 'page surface' };
  if (row.layer === 'chart') return { layerProfile: 'chart', signal: 'chart family' };
  if (row.layer === 'pattern') return { layerProfile: 'pattern', signal: 'pattern family' };
  if (row.layer === 'structure') return { layerProfile: 'structure', signal: 'structure family' };
  // Anything else is unclassified BY DESIGN. `surface-composition` and
  // `commercial` used to be answered here as if they were layers; that made this
  // resolver the last place in the pipeline where a forbidden layer still had a
  // home, so a bad row got a profile instead of a null and sailed past the gate.
  return { layerProfile: null, signal: 'unclassified layer' };
}

function componentsOf(row) {
  return Array.isArray(row.components) ? row.components : [];
}

export function resolveDivergenceProfile(layerProfile, row) {
  // Profile-keyed, with no layer special-case. The `row` argument survives for
  // the callers' signature; the surface branch that used to read it is gone
  // because `surface` now maps through LAYER_TO_DIVERGENCE_PROFILE like the
  // other four layers.
  void row;
  return LAYER_TO_DIVERGENCE_PROFILE[layerProfile] ?? null;
}

function readSourceFile(absolute) {
  return ts.createSourceFile(absolute, fs.readFileSync(absolute, 'utf8'), ts.ScriptTarget.Latest, true);
}

function resolveRelative(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

/** Every public entrypoint of the package: the root barrel plus each subpath index. */
function publicEntryFiles(root) {
  const entryFiles = new Set();

  const rootIndex = path.join(root, CORE_ROOT, 'src/index.ts');
  if (fs.existsSync(rootIndex)) entryFiles.add(rootIndex);

  const entrypointsRoot = path.join(root, CORE_ROOT, 'src/entrypoints');
  if (fs.existsSync(entrypointsRoot)) {
    const walk = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(absolute);
        else if (entry.name === 'index.ts' || entry.name === 'index.tsx') entryFiles.add(absolute);
      }
    };
    walk(entrypointsRoot);
  }
  return [...entryFiles].sort();
}

/**
 * The public surface is memoized per (root, alias configuration).
 *
 * Enumerating 101 entrypoints costs a full parse of the module graph behind each
 * one, which no caller wants to pay several times per process. A fixture root is
 * deliberately never cached BY DEFAULT: a drill that rewires a fixture and
 * re-measures must see the rewire, and a cache keyed on a mutable temp directory
 * would hand it the previous answer and report agreement with a tree that no longer
 * exists.
 *
 * The key is the root AND the aliases, because the aliases are half the question.
 * Keyed on root alone, two measurements of the SAME tree under DIFFERENT alias
 * configurations collapse into one entry and the second caller silently receives the
 * first caller's terminals -- a resolution answer for a module graph that was never
 * measured. Aliases are plain `{wildcard, prefix, baseDir, rawTargets}` records, so
 * they serialize stably; anything that does not is rejected rather than keyed on a
 * lossy stand-in.
 */
const SURFACE_CACHE = new Map();

function surfaceCacheKey(root, aliases) {
  // `undefined` means "discover the aliases from tsconfig", which is a function of the
  // tree alone and therefore a distinct, stable configuration.
  if (aliases === undefined) return JSON.stringify([root, null]);
  let serialized;
  try {
    serialized = JSON.stringify(aliases);
  } catch {
    serialized = undefined;
  }
  if (serialized === undefined) {
    throw new TypeError(
      'publicExportSurface: an explicit cache requires JSON-serializable aliases, because the alias configuration is part of the cache identity. Pass cache:false to measure without caching.',
    );
  }
  return JSON.stringify([root, serialized]);
}

/**
 * Every name each public entrypoint publishes, resolved to the file and declaration
 * that TERMINATES its re-export chain.
 *
 * This used to collect bare names, which made ownership a global-name coincidence.
 * `LinkProps` is a public name whose declaration lives in Typography's contracts;
 * the navigation Link folder separately exports a LOCAL `LinkProps` that reaches the
 * public surface only as the alias `NavLinkProps`. Intersecting a folder's exported
 * names with the global public-name set therefore credited the navigation family
 * with Typography's export -- a false attribution that no count could reveal, because
 * the name really is public and the folder really does export something spelled that
 * way. A binding is now (public name -> terminal file#name), so ownership is decided
 * by where the declaration physically lives.
 *
 * Fail-closed: MISSING / AMBIGUOUS / UNRESOLVED / CYCLE_ONLY are recorded as
 * failures. A resolver that cannot say where a public name comes from is a finding,
 * never a licence to drop the name and report agreement over a smaller surface.
 */
export function publicExportSurface({ root = REPOSITORY_ROOT, aliases, cache } = {}) {
  // The default caches ONLY the repository root measured under its own discovered
  // aliases -- the one configuration this process reads over and over. Any custom
  // alias configuration is opt-in, and then it is part of the key.
  const useCache = cache ?? (root === REPOSITORY_ROOT && aliases === undefined);
  const cacheKey = useCache ? surfaceCacheKey(root, aliases) : null;
  if (cacheKey !== null && SURFACE_CACHE.has(cacheKey)) return SURFACE_CACHE.get(cacheKey);

  const packageJson = JSON.parse(fs.readFileSync(path.join(root, CORE_ROOT, 'package.json'), 'utf8'));
  const declaredSubpaths = Object.keys(packageJson.exports ?? {});
  const entryFiles = publicEntryFiles(root);

  const names = new Set();
  const bindings = [];
  const seenBinding = new Set();
  const failures = [];
  const externalBindings = [];

  for (const entryFile of entryFiles) {
    const resolver = createRootPublicResolver({ entryFile, ts, aliases });
    for (const [name, resolution] of resolver.enumerate()) {
      if (resolution.state !== 'VALUE' && resolution.state !== 'TYPE_ONLY') {
        failures.push({
          entry: path.relative(root, entryFile),
          name,
          state: resolution.state,
          reason: resolution.reason ?? null,
        });
        continue;
      }
      names.add(name);
      const terminal = resolution.terminal;
      if (!terminal?.file || !terminal?.name) {
        // A public re-export of a third-party symbol. Legal, but it can never be
        // owned by a family folder, so it is recorded rather than silently dropped.
        externalBindings.push({
          entry: path.relative(root, entryFile),
          name,
          module: terminal?.module ?? null,
          terminalName: terminal?.name ?? name,
        });
        continue;
      }
      // Deduplicated by public name AND terminal: the same binding re-exported
      // through several entrypoints is one binding, while the same name arriving
      // at two different declarations is deliberately two records so the
      // ambiguity survives to be reported.
      // JSON.stringify of the tuple, not a delimiter-joined string: a separator
      // character is only injective while no field can contain it, and a file path
      // can contain very nearly anything.
      // Identity is physical just like containment. The real path and a symlink
      // spelling of the same declaration are one terminal, not an inexpressible
      // same-name collision.
      const terminalFile = canonicalize(terminal.file);
      const key = JSON.stringify([name, terminalFile, terminal.name]);
      if (seenBinding.has(key)) continue;
      seenBinding.add(key);
      bindings.push({
        name,
        file: terminalFile,
        terminalName: terminal.name,
        state: resolution.state,
      });
    }
  }

  const surface = { names, bindings, failures, externalBindings, entryFiles, declaredSubpaths };
  if (cacheKey !== null) SURFACE_CACHE.set(cacheKey, surface);
  return surface;
}

/**
 * PHYSICAL containment. The claim this function makes is "this declaration lives
 * inside that owner", and a lexical answer cannot make it: a symlink inside the
 * owner pointing at a file outside it produces a path that is lexically contained
 * and physically elsewhere, so the owner would claim an export it does not hold.
 *
 * Both sides are therefore canonicalized with `fs.realpathSync` before comparison.
 * Owners and resolver terminals must exist; inability to canonicalize either is a
 * hard failure rather than permission to fall back to the unsafe lexical answer.
 *
 * After canonicalization, `path.relative` answers it, and every escape spelling
 * (`..`, an absolute path, a sibling whose name merely starts with the owner's)
 * fails closed.
 */
function canonicalize(absolute) {
  return fs.realpathSync(absolute);
}

function ownerContainsFile(ownerAbsolute, absoluteFile) {
  if (!ownerAbsolute || !absoluteFile) return false;
  // Callers canonicalize each owner and terminal once before the O(files × owners)
  // containment loop. Doing realpath here would turn 3,600 bindings × 255 owners
  // into nearly a million filesystem calls.
  const relative = path.relative(ownerAbsolute, absoluteFile);
  if (relative === '') return true;
  if (relative === '..' || relative.startsWith(`..${path.sep}`)) return false;
  return !path.isAbsolute(relative);
}

function normalizeSlug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Indexes every family folder under the UI tree by its normalized basename. Resolution is
 * folder-first on purpose: the inventory's `components` field carries internal family names
 * (`DetailPanel`), while the public surface exports the prefixed identity
 * (`PatternDetailPanel`). Discovering the export from the owning folder proves the link
 * instead of guessing a naming convention.
 *
 * Two keys are recorded per folder: its basename, and its parent-plus-basename pair. The
 * compound key exists because a family can be spelled across a grouping level -- the
 * `responsive-slot` primitive lives at `layout/responsive/slot`, where neither segment alone
 * spells the row. It is consulted last (see `pickFamilyFolder`) so it can only resolve a row
 * that basename matching leaves unresolved.
 */
function indexFamilyFolders({ root = REPOSITORY_ROOT } = {}) {
  const folders = new Map();
  const compound = new Map();
  const uiRoot = path.join(root, UI_ROOT);
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'tests' || entry.name === '__snapshots__' || entry.name === 'node_modules') continue;
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute);
      const key = normalizeSlug(entry.name);
      if (!folders.has(key)) folders.set(key, []);
      folders.get(key).push(relative);
      const parent = path.basename(path.dirname(absolute));
      const pairKey = normalizeSlug(`${parent}${entry.name}`);
      if (!compound.has(pairKey)) compound.set(pairKey, []);
      compound.get(pairKey).push(relative);
      walk(absolute);
    }
  };
  walk(uiRoot);
  return { byName: folders, byPair: compound };
}

function exportedNamesOfFolder(absoluteFolder) {
  const names = new Set();
  const index = ['index.ts', 'index.tsx']
    .map((file) => path.join(absoluteFolder, file))
    .find((candidate) => fs.existsSync(candidate));
  if (!index) return names;
  const collect = (file, seen = new Set()) => {
    if (!file || seen.has(file)) return;
    seen.add(file);
    const source = readSourceFile(file);
    for (const statement of source.statements) {
      if (ts.isExportDeclaration(statement)) {
        if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
          for (const element of statement.exportClause.elements) names.add(element.name.text);
          continue;
        }
        const specifier = statement.moduleSpecifier?.text;
        if (specifier?.startsWith('.')) collect(resolveRelative(file, specifier), seen);
        continue;
      }
      const exported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
      if (!exported) continue;
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
        }
      } else if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement) ||
          ts.isInterfaceDeclaration(statement) ||
          ts.isTypeAliasDeclaration(statement)) &&
        statement.name
      ) {
        names.add(statement.name.text);
      }
    }
  };
  collect(index);
  return names;
}

/**
 * Maps every exported symbol to the family folder whose index exposes it. This is the
 * second resolution signal: a row whose id slug does not match a folder name (the inventory
 * uses `pattern-data-table` where the tree uses `data-table`) is still resolvable through
 * the component symbol it declares.
 */
function indexSymbolOwners({ byName }, { root = REPOSITORY_ROOT } = {}) {
  const owners = new Map();
  for (const candidates of byName.values()) {
    for (const relative of candidates) {
      for (const name of exportedNamesOfFolder(path.join(root, relative))) {
        if (!owners.has(name)) owners.set(name, []);
        owners.get(name).push(relative);
      }
    }
  }
  return owners;
}

/**
 * A slug can match several folders because compound children reuse the family word
 * (`Card/compound/Image` also normalizes to `image`). Candidates are therefore ranked by how
 * closely they sit to the row's declared owner, then by shallowness, so a compound child can
 * never outrank the family root.
 */
function pickFamilyFolder(row, { byName, byPair }) {
  // Schema validation records an invalid/missing id as a source blocker, but
  // resolution must remain total so the checker can REPORT that blocker rather
  // than throwing before preflight returns its verdict.
  const slug = typeof row.id === 'string' ? row.id.split('/').pop() : '';
  const primary = normalizeSlug(slug);
  // The inventory prefixes some ids with their group (`record-field` for `record/field`,
  // `record-panel` for `record/panel`); stripping the group word is a documented
  // normalization, not a guess. The example this comment used to give was
  // `record-content`, a single row that was never a component -- it has since been split
  // into the five real families it always exported, which is exactly the case the
  // prefix-stripping serves.
  const category = typeof row.category === 'string' ? row.category : '';
  const categoryPrefix = category ? `${category}-` : '';
  const stripped = normalizeSlug(categoryPrefix && slug.startsWith(categoryPrefix) ? slug.slice(categoryPrefix.length) : slug);

  // The tree's own shorthand, applied only after the literal spellings fail. A family
  // folder routinely drops the word its position already supplies: `patterns/data/data-
  // table` for `pattern-data-table`, `charts/families/gauge` for `gauge-chart`,
  // `headers/detail` for `detail-header`. These are the same three conventions
  // `taxonomy-parity-gate.mjs` documents and normalizes over, so both authorities read
  // the tree the same way instead of one gate inventing a fourth spelling rule.
  const singularCategory = category.replace(/s$/, '');
  const shorthand = new Set();
  if (primary.startsWith('pattern')) shorthand.add(primary.slice('pattern'.length));
  if (primary.endsWith('chart')) shorthand.add(primary.slice(0, -'chart'.length));
  if (singularCategory) {
    const tail = normalizeSlug(singularCategory);
    if (tail && primary.endsWith(tail) && primary !== tail) {
      shorthand.add(primary.slice(0, -tail.length));
    }
  }
  shorthand.delete('');

  // A folder outside the row's declared `sourceRoot` is never this row's owner, however
  // well its name scores. Slug matching plus group-prefix stripping is lossy enough to
  // collide across subtrees -- WorkspaceShell, then inventoried as
  // `surface/workspace/workspace-shell`, stripped to `shell` and landed on the
  // `ui/patterns/shell` GROUP folder, which exports no WorkspaceShell at all.
  // The scoring below used to rank such a match last but still return it when it was the
  // only candidate, so a cross-subtree collision beat the symbol-owner fallback that
  // resolves these correctly. Filtering first means an unresolvable slug falls through to
  // the symbol evidence instead of resolving to a confident wrong answer.
  const withinRoot = (candidate) =>
    candidate === row.sourceRoot || candidate.startsWith(`${row.sourceRoot}/`);

  const score = (candidate) => {
    const depth = candidate.split('/').length;
    if (candidate === `${row.sourceRoot}/${row.category}/${candidate.split('/').pop()}`) return [0, depth];
    if (candidate.includes(`/${row.category}/`)) return [1, depth];
    return [2, depth];
  };

  const best = (keys, index) => {
    const categoryRoot = `${row.sourceRoot}/${row.category}`;
    const candidates = [
      ...new Set(keys.flatMap((key) => index.get(key) ?? [])),
    ].filter((candidate) => withinRoot(candidate) && candidate !== categoryRoot);
    if (candidates.length === 0) return null;
    return candidates.sort((left, right) => {
      const [leftRank, leftDepth] = score(left);
      const [rightRank, rightDepth] = score(right);
      return leftRank - rightRank || leftDepth - rightDepth || left.localeCompare(right);
    })[0];
  };

  // Strictly ordered so a weaker spelling can only ever resolve a row the stronger one
  // leaves unresolved. Tier 1 is the literal id, tier 2 the tree's shorthand, tier 3 the
  // grouping-level pair. A row that resolves today keeps the owner it resolves to.
  return (
    best([primary, stripped], byName) ??
    best([...shorthand], byName) ??
    best([primary, stripped], byPair)
  );
}

/**
 * The public names a single owner is entitled to claim, in a stable order.
 *
 * The order is the owner's OWN export order (`exportedNamesOfFolder` reads the index
 * statement by statement), mapped terminal-aware: for each local name the folder
 * exports, the public names whose terminal declaration IS that local name. The
 * navigation Link folder exports `LinkProps, LinkType, LINK_DEFAULTS,
 * LINK_TYPE_COLORS, NavLink` and therefore projects
 * `NavLinkProps, NavLinkType, NAV_LINK_DEFAULTS, NAV_LINK_TYPE_COLORS, NavLink` --
 * the aliases the package really publishes, never the bare `LinkProps` that belongs
 * to Typography.
 *
 * Owned bindings whose terminal the folder index does not itself re-export (a
 * declaration reached through a deeper path) are appended afterwards in name order,
 * so nothing owned is dropped and the output is still deterministic.
 */
function projectPublicExports(folderExports, ownedBindings) {
  const byTerminalName = new Map();
  for (const binding of ownedBindings) {
    if (!byTerminalName.has(binding.terminalName)) byTerminalName.set(binding.terminalName, []);
    byTerminalName.get(binding.terminalName).push(binding.name);
  }

  const projected = [];
  const taken = new Set();
  const push = (name) => {
    if (taken.has(name)) return;
    taken.add(name);
    projected.push(name);
  };

  for (const local of folderExports) {
    for (const name of [...(byTerminalName.get(local) ?? [])].sort()) push(name);
  }
  for (const binding of [...ownedBindings].sort((left, right) => left.name.localeCompare(right.name))) {
    push(binding.name);
  }
  return projected;
}

export function resolveInventory(options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const root = options.root ?? REPOSITORY_ROOT;
  const surface = publicExportSurface({ root, aliases: options.aliases, cache: options.cache });
  const folders = indexFamilyFolders({ root });
  const symbolOwners = indexSymbolOwners(folders, { root });
  const sourceBlockers = [];

  // A public name the resolver could not terminate is a hole in the authority this
  // module reads FROM. Projecting ownership over a surface with holes would report
  // agreement about names nobody can locate.
  for (const failure of surface.failures) {
    sourceBlockers.push(
      `public name ${failure.name} does not resolve from ${failure.entry} (${failure.state}${failure.reason ? `: ${failure.reason}` : ''})`,
    );
  }

  // A duplicated row id is a source defect in its own right. Every by-id index in the
  // program -- receipts, manifests, evidence -- silently collapses the second row onto
  // the first, so the duplicate is not merely cosmetic: it makes one family invisible
  // while its twin answers in its place.
  const idCounts = new Map();
  for (const row of contracts.inventory.rows) idCounts.set(row.id, (idCounts.get(row.id) ?? 0) + 1);
  for (const [id, count] of idCounts) {
    if (count > 1) sourceBlockers.push(`inventory declares family id ${id} ${count} times; ids must be unique`);
  }
  for (const row of contracts.inventory.rows) {
    const label = typeof row.id === 'string' && row.id.trim() ? row.id : '<missing-id>';
    for (const field of AUTHORED_ROW_FIELDS) {
      if (!Object.hasOwn(row, field)) sourceBlockers.push(`family ${label} is missing authored field ${field}`);
    }
    for (const field of ['id', 'layer', 'category', 'family', 'sourceRoot']) {
      if (typeof row[field] !== 'string' || row[field].trim() === '') {
        sourceBlockers.push(`family ${label} authored field ${field} must be a non-empty string`);
      }
    }
    for (const field of Object.keys(row)) {
      if (!PERSISTED_ROW_FIELD_SET.has(field)) {
        sourceBlockers.push(`family ${label} declares unknown row field ${field}; the writer may not discard unclassified data`);
      }
    }
    const components = componentsOf(row);
    if (components.length === 0) {
      sourceBlockers.push(`family ${row.id} must declare at least one component symbol`);
      continue;
    }
    const invalid = components.filter((component) => typeof component !== 'string' || component.trim() === '');
    if (invalid.length > 0) {
      sourceBlockers.push(`family ${row.id} components must be non-empty strings`);
    }
    const stringComponents = components.filter((component) => typeof component === 'string');
    if (new Set(stringComponents).size !== stringComponents.length) {
      sourceBlockers.push(`family ${row.id} declares duplicate component symbols`);
    }
  }

  // PASS 1 -- owners. Every owner must be known before any public export is
  // projected: "does this declaration land in more than one owner" is a question
  // about the whole owner set, and a row-at-a-time projection cannot ask it.
  const resolvedOwners = contracts.inventory.rows.map((row, index) => {
    let sourceOwner = pickFamilyFolder(row, folders);
    let resolvedBy = sourceOwner ? 'folder-slug' : null;
    if (!sourceOwner) {
      const categoryRoot = `${row.sourceRoot}/${row.category}`;
      const candidates = componentsOf(row)
        .flatMap((component) => symbolOwners.get(component) ?? [])
        .filter((candidate) => candidate !== categoryRoot)
        .sort((left, right) => left.split('/').length - right.split('/').length || left.localeCompare(right));
      const preferred =
        candidates.find((candidate) => candidate.startsWith(`${row.sourceRoot}/`)) ?? candidates[0];
      if (preferred) {
        sourceOwner = preferred;
        resolvedBy = 'component-symbol';
      }
    }
    return {
      row,
      sourceOwner,
      resolvedBy,
      ownerAbsolute: sourceOwner ? canonicalize(path.resolve(root, sourceOwner)) : null,
    };
  });

  // PASS 2 -- attribute each binding to the owners that physically contain its
  // terminal. Cached per file because thousands of bindings share a few hundred
  // declaration files.
  const ownersByFile = new Map();
  const ownersOfFile = (file) => {
    let owners = ownersByFile.get(file);
    if (!owners) {
      const absolute = canonicalize(path.resolve(file));
      owners = resolvedOwners.filter((entry) => ownerContainsFile(entry.ownerAbsolute, absolute));
      ownersByFile.set(file, owners);
    }
    return owners;
  };

  // Entries, not row ids, are the identity here. Duplicate ids are already a
  // blocker, but keying this intermediate map by id would merge the evidence of
  // two broken rows and could make both look resolved before the blocker is read.
  const bindingsByOwner = new Map();
  const multiOwnerFiles = new Map();
  const terminalsByName = new Map();
  // External terminals cannot belong to a family, but they still participate in
  // name identity. If the same public spelling also reaches an owned declaration,
  // a row's string[] cannot say which one it claims.
  for (const binding of surface.externalBindings) {
    if (!terminalsByName.has(binding.name)) terminalsByName.set(binding.name, new Map());
    terminalsByName
      .get(binding.name)
      .set(`external:${binding.module ?? '<unknown>'}#${binding.terminalName}`, { owned: false });
  }
  for (const binding of surface.bindings) {
    const owners = ownersOfFile(binding.file);
    const terminalIdentity = `${path.relative(root, binding.file)}#${binding.terminalName}`;
    if (!terminalsByName.has(binding.name)) terminalsByName.set(binding.name, new Map());
    const terminals = terminalsByName.get(binding.name);
    const previous = terminals.get(terminalIdentity);
    terminals.set(terminalIdentity, { owned: (previous?.owned ?? false) || owners.length > 0 });
    if (owners.length > 1) {
      const relative = path.relative(root, binding.file);
      if (!multiOwnerFiles.has(relative)) {
        multiOwnerFiles.set(relative, owners.map((entry) => entry.row.id));
      }
    }
    if (owners.length === 0) continue;

    for (const entry of owners) {
      if (!bindingsByOwner.has(entry)) bindingsByOwner.set(entry, []);
      bindingsByOwner.get(entry).push(binding);
    }
  }

  // One declaration inside two owners means the owner tree overlaps, and BOTH rows
  // would claim the same export. Ownership must be a partition, so this is a
  // blocker rather than a tie broken by some ranking.
  for (const [file, owners] of multiOwnerFiles) {
    sourceBlockers.push(`terminal ${file} lands inside ${owners.length} owners (${owners.join(', ')})`);
  }

  // A public name reaching two declarations cannot be attributed to a family if
  // ANY terminal is owned: `publicExports` is a string[], so it cannot express
  // which declaration the row claims. This includes the mixed owned/unowned case.
  // A collision wholly outside every family owner remains harmless because no row
  // claims either terminal.
  for (const [name, terminals] of terminalsByName) {
    const ownedCount = [...terminals.values()].filter(({ owned }) => owned).length;
    if (terminals.size < 2 || ownedCount === 0) continue;
    sourceBlockers.push(
      `public name ${name} resolves to ${terminals.size} terminals (${ownedCount} owned: ${[...terminals.entries()]
        .filter(([, value]) => value.owned)
        .map(([terminal]) => terminal)
        .sort()
        .join(', ')}); publicExports is a string[] and cannot express which declaration a row means`,
    );
  }

  // PASS 3 -- projection. Only now is a row's public export set decidable.
  const rows = resolvedOwners.map((entry) => {
    const { row, sourceOwner, resolvedBy } = entry;
    const { layerProfile, signal } = resolveLayerProfile(row);
    const divergenceProfile = resolveDivergenceProfile(layerProfile, row);

    const folderExports = sourceOwner ? [...exportedNamesOfFolder(path.join(root, sourceOwner))] : [];
    const publicExports = sourceOwner
      ? projectPublicExports(folderExports, bindingsByOwner.get(entry) ?? [])
      : [];

    // Computed HERE, from this row's own projection, and merely copied by the
    // writer. They used to be derived inside `writeResolvedInventory`, which meant
    // the check recomputed a different set of fields than the writer persisted and
    // could not detect drift in the two it never produced.
    const declaredComponentsPublic = componentsOf(row).filter((component) => publicExports.includes(component));
    const declaredComponentsNotPubliclyNamed = componentsOf(row).filter(
      (component) => !publicExports.includes(component),
    );

    return {
      ...row,
      layerProfile,
      layerProfileSignal: signal,
      divergenceProfile,
      applicableDimensions: contracts.rubric.dimensions.map((dimension) => dimension.id),
      sourceOwner,
      resolvedBy,
      folderExportCount: folderExports.length,
      publicExports,
      declaredComponentsPublic,
      declaredComponentsNotPubliclyNamed,
      // Public-export resolution is judged on the row's OWN declared components against
      // the row's OWN projection -- never against the global public-name set. The global
      // test answered "is this name public anywhere", which a homonym in another family
      // satisfies just as well as the row's own export.
      //
      // There is deliberately no alias exception here. 31 rows used to declare a LABEL
      // rather than a symbol -- 27 patterns naming `PricingTable` for an owner that only
      // ever exported `PatternPricingTable`, plus four naming a family heading with no
      // symbol behind it at all -- and the fix was to correct the declarations, not to
      // teach the test to accept near-misses. A prefix rule would also let a neighbouring
      // family answer for a row: `Surface` + `EmptyState` is a real public name owned by
      // somebody else entirely.
      sourceResolution: !sourceOwner
        ? 'UNRESOLVED'
        : componentsOf(row).length > 0 && componentsOf(row).every((component) => publicExports.includes(component))
          ? 'RESOLVED_SOURCE_AND_PUBLIC_EXPORT'
          : 'RESOLVED_SOURCE_ONLY',
    };
  });

  return {
    rows,
    publicNames: surface.names,
    bindings: surface.bindings,
    entryFiles: surface.entryFiles,
    declaredSubpaths: surface.declaredSubpaths,
    resolverFailureCount: surface.failures.length,
    sourceBlockers,
  };
}

/**
 * The row fields this module GENERATES. Everything else on a persisted row -- id, layer,
 * category, family, components, sourceRoot -- is authored by a human and is an input here,
 * never an output.
 *
 * The distinction is the whole point of the drift check. While the writer derived some
 * fields and the checker derived others, the checker could only ever agree with itself:
 * it recomputed a value, compared it to the value it had just recomputed, and reported
 * correspondence. `declaredComponentsPublic` and `declaredComponentsNotPubliclyNamed`
 * lived only inside the writer, so no check in the program had ever looked at them.
 */
export const GENERATED_ROW_FIELDS = Object.freeze([
  'sourceOwner',
  'resolvedBy',
  'layerProfile',
  'layerProfileSignal',
  'divergenceProfile',
  'publicExports',
  'declaredComponentsPublic',
  'declaredComponentsNotPubliclyNamed',
  'sourceResolution',
]);

export const AUTHORED_ROW_FIELDS = Object.freeze([
  'id',
  'layer',
  'category',
  'family',
  'components',
  'sourceRoot',
]);

const PERSISTED_ROW_FIELD_SET = new Set([...AUTHORED_ROW_FIELDS, ...GENERATED_ROW_FIELDS]);

/**
 * The two generated TOP-LEVEL values, exported for the same reason the row shape is:
 * a test that retyped this prose would be asserting against its own copy of it.
 */
export const RESOLUTION_LAW =
  'Resolved by packages/core/scripts/check/evidence/framework/inventory-correspondence/index.mjs; regenerate with `node scripts/check/evidence/framework/cli/index.mjs inventory --write` rather than hand-editing a row.';

export const DIMENSION_POLICY = Object.freeze({
  default: 'all twelve quality-rubric dimensions apply to every family',
  narrowingRequires:
    'a per-receipt NOT_APPLICABLE_WITH_REASON that names the absent capability; the inventory never pre-narrows a family',
});

/**
 * The single persisted shape, shared by the writer and the check. A pure function of a
 * resolved row: it copies, it never derives. Two spellings of "the row we persist" is
 * exactly how a field ends up written but never verified.
 *
 * Key order is the file's existing order, so regenerating an already-current inventory
 * produces a byte-identical file and a real change shows up as a real diff.
 */
export function toPersistedInventoryRow(row) {
  return {
    id: row.id,
    layer: row.layer,
    category: row.category,
    family: row.family,
    components: row.components,
    sourceRoot: row.sourceRoot,
    sourceOwner: row.sourceOwner,
    resolvedBy: row.resolvedBy,
    layerProfile: row.layerProfile,
    layerProfileSignal: row.layerProfileSignal,
    divergenceProfile: row.divergenceProfile,
    publicExports: row.publicExports,
    declaredComponentsPublic: row.declaredComponentsPublic,
    declaredComponentsNotPubliclyNamed: row.declaredComponentsNotPubliclyNamed,
    sourceResolution: row.sourceResolution,
  };
}

/**
 * Rewrites family-inventory/index.json with resolved source and public-export evidence, which the
 * file's own `resolutionLaw` requires before any visual round. The output is deterministic so
 * the inventory stays regenerable rather than hand-maintained.
 */
export function writeResolvedInventory(options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const root = options.root ?? REPOSITORY_ROOT;
  const resolved = resolveInventory({ ...options, contracts });
  const target = path.join(PROGRAM_ROOT_FILE(root), 'family-inventory/index.json');

  const next = {
    ...contracts.inventory,
    resolutionLaw: RESOLUTION_LAW,
    dimensionPolicy: DIMENSION_POLICY,
    rows: resolved.rows.map(toPersistedInventoryRow),
  };

  fs.writeFileSync(target, `${JSON.stringify(next, null, 2)}\n`);
  return { target: path.relative(root, target), rows: next.rows.length };
}

function PROGRAM_ROOT_FILE(root) {
  return path.join(root, CORE_ROOT, 'scripts/check/modern-rescue');
}

/**
 * Structural equality over the JSON the writer would emit. Array ORDER is significant on
 * purpose: `publicExports` has a documented deterministic order, so a reordering is drift,
 * not noise.
 */
function samePersistedValue(left, right) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

export function checkInventoryCorrespondence(options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const resolved = resolveInventory({ ...options, contracts });
  // Resolver-level findings come first: they say the public surface itself could not be
  // read, which makes every judgement below it provisional.
  const blockers = [...resolved.sourceBlockers];
  const warnings = [];

  if (resolved.rows.length !== contracts.program.denominators.visibleFamilies) {
    blockers.push(
      `inventory holds ${resolved.rows.length} rows, denominator is ${contracts.program.denominators.visibleFamilies}`,
    );
  }

  const unresolvedOwner = resolved.rows.filter((row) => !row.sourceOwner).map((row) => row.id);
  if (unresolvedOwner.length > 0) {
    blockers.push(`${unresolvedOwner.length} families have no resolved source owner`);
  }

  const unresolvedProfile = resolved.rows.filter((row) => !row.layerProfile || !row.divergenceProfile);
  if (unresolvedProfile.length > 0) {
    blockers.push(`${unresolvedProfile.length} families have no resolved layer or divergence profile`);
  }

  const nonPublic = resolved.rows.filter((row) => row.publicExports.length === 0);
  if (nonPublic.length > 0) {
    blockers.push(
      `${nonPublic.length} families expose nothing through a public entrypoint export chain`,
    );
  }

  const incompletelyPublic = resolved.rows.filter(
    (row) => row.sourceResolution !== 'RESOLVED_SOURCE_AND_PUBLIC_EXPORT',
  );
  for (const row of incompletelyPublic) {
    blockers.push(
      `family ${row.id} does not publicly resolve every declared component: ${row.declaredComponentsNotPubliclyNamed.join(', ') || '<none>'}`,
    );
  }

  const familyNames = new Set(resolved.rows.map((row) => row.family));
  if (!familyNames.has('SemanticSurface')) blockers.push('canonical SemanticSurface is missing from the inventory');

  // Retirement regression guards. Each of these three names was adjudicated out of the
  // catalog, so the interesting condition is now RE-APPEARANCE, not absence. The
  // OverlayModal check below used to warn when the name was NOT publicly exported, which
  // was correct while the alias was still shipping and being drained; once the alias was
  // deleted that warning fired on every single run and meant nothing. Inverted, it earns
  // its keep: it fails if anyone republishes the alias.
  const RETIRED_FAMILIES = Object.freeze({
    OverlayModal: 'a forwarding alias for feedback/Modal; the shim folder and its export are deleted',
    TableCheckboxStyles: 'a global-CSS injector with no productive consumer; source and family are deleted',
    RecordContent: 'never a component; split into the five record families it actually exported',
  });
  for (const [name, why] of Object.entries(RETIRED_FAMILIES)) {
    if (familyNames.has(name)) blockers.push(`retired ${name} must not occupy a family row (${why})`);
    if (resolved.publicNames.has(name)) blockers.push(`retired ${name} must not be publicly exported (${why})`);
  }

  // Forbidden layers, checked against the row's own declaration rather than against the
  // count table below, so a planted row fails with a layer-shaped message instead of an
  // off-by-one on some unrelated layer.
  const CANONICAL_LAYERS = new Set(['primitive', 'pattern', 'structure', 'surface', 'chart']);
  for (const row of resolved.rows) {
    if (!CANONICAL_LAYERS.has(row.layer)) {
      blockers.push(`family ${row.id} declares forbidden layer '${row.layer}'; the five canonical layers are primitive|pattern|structure|surface|chart`);
    }
  }

  // Acronym-slug law. A family id's last segment is a SPELLING of the folder that owns it,
  // never a re-derivation of the component name. `surface/experience/o-auth-transition`
  // owned `.../experience/oauth-transition`: the same letters, with a dash driven into the
  // middle of the OAuth acronym by a per-capital slugger reading `OAuthTransitionScreen`.
  // normalizeSlug() erases punctuation, so the row still resolved and the drift survived a
  // full round labelled "cosmetic id-generator drift".
  //
  // Two preconditions keep this exact rather than stylistic. The folder must already be
  // written in the id's own vocabulary -- lowercase kebab -- so it is authoritative about
  // where the word boundaries fall; the many PascalCase primitive folders (`AlertDialog`,
  // `Tabs`) say nothing about kebab boundaries and are not judged here. And the two
  // spellings must normalize EQUAL, meaning the id already denotes this folder and merely
  // punctuates it differently, so the folder wins and there is nothing to weigh. The tree's
  // three documented shorthands normalize UNEQUAL and are untouched: `pattern-data-table`
  // for `data-table`, `gauge-chart` for `gauge`, `detail-header` for `detail`. This is a
  // strictness increase that adds no tolerance anywhere.
  for (const row of resolved.rows) {
    if (row.resolvedBy !== 'folder-slug' || !row.sourceOwner) continue;
    if (typeof row.id !== 'string' || row.id.trim() === '') continue;
    const idSlug = row.id.split('/').pop();
    const folderName = path.basename(row.sourceOwner);
    if (folderName !== folderName.toLowerCase()) continue;
    if (idSlug !== folderName && normalizeSlug(idSlug) === normalizeSlug(folderName)) {
      blockers.push(
        `family ${row.id} punctuates its own owner differently: id slug '${idSlug}' vs folder '${folderName}'. An id spells its folder exactly, so an acronym stays whole (oauth, never o-auth).`,
      );
    }
  }

  const counts = {};
  for (const row of resolved.rows) counts[row.layer] = (counts[row.layer] ?? 0) + 1;
  for (const [layer, expected] of Object.entries(contracts.inventory.counts)) {
    if (counts[layer] !== expected) blockers.push(`layer ${layer} resolves ${counts[layer] ?? 0}, expected ${expected}`);
  }

  const profileCounts = {};
  for (const row of resolved.rows) profileCounts[row.layerProfile] = (profileCounts[row.layerProfile] ?? 0) + 1;

  // Everything above judges SOURCE. Everything below judges the persisted FILE against
  // that source. The two are reported separately because they need different remedies: a
  // source blocker is a defect a human must go fix, while drift is repaired by rerunning
  // the writer -- and a writer that refused to run until the file it rewrites was already
  // current could never repair anything.
  const sourceBlockers = [...blockers];
  const sourceValid = sourceBlockers.length === 0;

  // Paired by position: `resolved.rows` is a 1:1 map over `contracts.inventory.rows`, so
  // index i is the same family on both sides even if two rows shared an id.
  const staleGeneratedRows = [];
  for (const [index, row] of resolved.rows.entries()) {
    const persisted = contracts.inventory.rows[index];
    if (!persisted) continue;
    const expected = toPersistedInventoryRow(row);
    const fields = GENERATED_ROW_FIELDS.filter(
      (field) => !samePersistedValue(persisted[field], expected[field]),
    );
    // The writer reconstructs each row from the exact authored + generated
    // schema. An extra legacy key would therefore disappear on write and must be
    // reported by the checker instead of allowing a supposedly clean rewrite to
    // change bytes behind its back.
    for (const field of Object.keys(persisted)) {
      if (!PERSISTED_ROW_FIELD_SET.has(field)) fields.push(`unexpected:${field}`);
    }
    if (fields.length > 0) staleGeneratedRows.push({ id: row.id, fields });
  }

  const staleGeneratedTopLevelFields = [];
  if (contracts.inventory.resolutionLaw !== RESOLUTION_LAW) staleGeneratedTopLevelFields.push('resolutionLaw');
  if (!samePersistedValue(contracts.inventory.dimensionPolicy, DIMENSION_POLICY)) {
    staleGeneratedTopLevelFields.push('dimensionPolicy');
  }

  if (staleGeneratedRows.length > 0) {
    const sample = staleGeneratedRows
      .slice(0, 5)
      .map((entry) => `${entry.id} [${entry.fields.join(', ')}]`)
      .join('; ');
    blockers.push(
      `${staleGeneratedRows.length} inventory rows carry generated fields that disagree with source: ${sample}${staleGeneratedRows.length > 5 ? '; ...' : ''}. Regenerate with \`node scripts/check/evidence/framework/cli/index.mjs inventory --write\`.`,
    );
  }
  if (staleGeneratedTopLevelFields.length > 0) {
    blockers.push(
      `inventory top-level generated fields disagree with source: ${staleGeneratedTopLevelFields.join(', ')}`,
    );
  }

  return {
    schemaVersion: 2,
    valid: blockers.length === 0,
    sourceValid,
    denominator: contracts.program.denominators.visibleFamilies,
    resolvedFamilies: resolved.rows.filter((row) => row.sourceOwner).length,
    resolvedWithPublicExport: resolved.rows.filter(
      (row) => row.sourceResolution === 'RESOLVED_SOURCE_AND_PUBLIC_EXPORT',
    ).length,
    layerCounts: counts,
    layerProfileCounts: profileCounts,
    publicExportSurfaceSize: resolved.publicNames.size,
    publicEntrypoints: resolved.entryFiles.length,
    declaredSubpaths: resolved.declaredSubpaths.length,
    unresolvedSourceOwner: resolved.rows.filter((row) => !row.sourceOwner).map((row) => row.id),
    familiesWithoutPublicExport: nonPublic.map((row) => row.id),
    publicResolutionFailures: resolved.resolverFailureCount,
    staleGeneratedRows,
    staleGeneratedTopLevelFields,
    sourceBlockers,
    blockers,
    warnings,
  };
}
