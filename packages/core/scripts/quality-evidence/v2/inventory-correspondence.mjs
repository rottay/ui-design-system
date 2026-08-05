import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { REPOSITORY_ROOT, loadProgramContracts } from './contracts.mjs';

const CORE_ROOT = 'packages/core';
const UI_ROOT = `${CORE_ROOT}/src/ui`;

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

const LAYER_TO_DIVERGENCE_PROFILE = Object.freeze({
  'primitive-static-layout': 'atomic-static',
  'primitive-interactive-control-data-overlay': 'interactive-control-layout',
  pattern: 'pattern-chart',
  chart: 'pattern-chart',
  structure: 'structure',
  'surface-composition': 'surface-composition-canary',
  commercial: 'pattern-chart',
});

export function resolveLayerProfile(row) {
  if (row.layer === 'primitive') {
    if (INTERACTIVE_PRIMITIVE_CATEGORIES.has(row.category)) {
      return {
        layerProfile: 'primitive-interactive-control-data-overlay',
        signal: `primitive category ${row.category}`,
      };
    }
    const exception = row.components.find((component) => DATA_OR_INTERACTIVE_EXCEPTIONS[component]);
    if (exception) {
      return {
        layerProfile: 'primitive-interactive-control-data-overlay',
        signal: DATA_OR_INTERACTIVE_EXCEPTIONS[exception],
      };
    }
    return { layerProfile: 'primitive-static-layout', signal: `static ${row.category} primitive` };
  }
  if (row.layer === 'surface') return { layerProfile: 'surface-composition', signal: 'page surface' };
  if (row.layer === 'surface-composition') {
    return { layerProfile: 'surface-composition', signal: 'surface composition' };
  }
  if (row.layer === 'chart') return { layerProfile: 'chart', signal: 'chart family' };
  if (row.layer === 'pattern') return { layerProfile: 'pattern', signal: 'pattern family' };
  if (row.layer === 'structure') return { layerProfile: 'structure', signal: 'structure family' };
  if (row.layer === 'commercial') return { layerProfile: 'commercial', signal: 'commercial kit family' };
  return { layerProfile: null, signal: 'unclassified layer' };
}

export function resolveDivergenceProfile(layerProfile, row) {
  if (row.layer === 'surface' || row.layer === 'surface-composition') return 'surface-composition-canary';
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

/**
 * Collects the names reachable from a public entrypoint by following relative re-exports.
 * A star re-export contributes the target module's own exported names, so a family is only
 * "public" when a real chain of `export` statements reaches it.
 */
function collectPublicNames(entryFile, seen = new Set()) {
  if (!entryFile || seen.has(entryFile)) return new Set();
  seen.add(entryFile);
  const names = new Set();
  const source = readSourceFile(entryFile);

  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      const specifier = statement.moduleSpecifier?.text;
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) names.add(element.name.text);
        continue;
      }
      if (specifier?.startsWith('.')) {
        const target = resolveRelative(entryFile, specifier);
        for (const name of collectPublicNames(target, seen)) names.add(name);
      }
      continue;
    }
    const hasExportModifier = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!hasExportModifier) continue;
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
      }
    } else if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.name
    ) {
      names.add(statement.name.text);
    }
  }
  return names;
}

export function publicExportSurface({ root = REPOSITORY_ROOT } = {}) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, CORE_ROOT, 'package.json'), 'utf8'));
  const subpaths = Object.keys(packageJson.exports ?? {});
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

  const names = new Set();
  for (const entry of entryFiles) {
    for (const name of collectPublicNames(entry)) names.add(name);
  }
  return { names, entryFiles: [...entryFiles], declaredSubpaths: subpaths };
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
 */
function indexFamilyFolders({ root = REPOSITORY_ROOT } = {}) {
  const folders = new Map();
  const uiRoot = path.join(root, UI_ROOT);
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'tests' || entry.name === '__snapshots__' || entry.name === 'node_modules') continue;
      const absolute = path.join(directory, entry.name);
      const key = normalizeSlug(entry.name);
      if (!folders.has(key)) folders.set(key, []);
      folders.get(key).push(path.relative(root, absolute));
      walk(absolute);
    }
  };
  walk(uiRoot);
  return folders;
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
function indexSymbolOwners(folders, { root = REPOSITORY_ROOT } = {}) {
  const owners = new Map();
  for (const candidates of folders.values()) {
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
function pickFamilyFolder(row, folders) {
  const primary = normalizeSlug(row.id.split('/').pop());
  // The inventory prefixes some ids with their group (`record-content` for `record/content`);
  // stripping the group word is a documented normalization, not a guess.
  const stripped = normalizeSlug(row.id.split('/').pop().replace(new RegExp(`^${row.category}-`), ''));
  const candidates = [...new Set([...(folders.get(primary) ?? []), ...(folders.get(stripped) ?? [])])];
  if (candidates.length === 0) return null;

  const score = (candidate) => {
    const depth = candidate.split('/').length;
    if (candidate === `${row.sourceRoot}/${row.category}/${candidate.split('/').pop()}`) return [0, depth];
    if (candidate.startsWith(`${row.sourceRoot}/`) && candidate.includes(`/${row.category}/`)) return [1, depth];
    if (candidate.startsWith(`${row.sourceRoot}/`)) return [2, depth];
    return [3, depth];
  };

  return [...candidates].sort((left, right) => {
    const [leftRank, leftDepth] = score(left);
    const [rightRank, rightDepth] = score(right);
    return leftRank - rightRank || leftDepth - rightDepth || left.localeCompare(right);
  })[0];
}

export function resolveInventory(options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const root = options.root ?? REPOSITORY_ROOT;
  const { names: publicNames, entryFiles, declaredSubpaths } = publicExportSurface({ root });
  const folders = indexFamilyFolders({ root });
  const symbolOwners = indexSymbolOwners(folders, { root });

  const rows = contracts.inventory.rows.map((row) => {
    const { layerProfile, signal } = resolveLayerProfile(row);
    const divergenceProfile = resolveDivergenceProfile(layerProfile, row);

    let sourceOwner = pickFamilyFolder(row, folders);
    let resolvedBy = sourceOwner ? 'folder-slug' : null;
    if (!sourceOwner) {
      for (const component of row.components) {
        const bySymbol = symbolOwners.get(component) ?? [];
        const preferred =
          bySymbol.find((candidate) => candidate.startsWith(`${row.sourceRoot}/`)) ?? bySymbol[0];
        if (preferred) {
          sourceOwner = preferred;
          resolvedBy = 'component-symbol';
          break;
        }
      }
    }

    const folderExports = sourceOwner ? [...exportedNamesOfFolder(path.join(root, sourceOwner))] : [];
    const publicExports = folderExports.filter((name) => publicNames.has(name));

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
      sourceResolution:
        sourceOwner && publicExports.length > 0
          ? 'RESOLVED_SOURCE_AND_PUBLIC_EXPORT'
          : sourceOwner
            ? 'RESOLVED_SOURCE_ONLY'
            : 'UNRESOLVED',
    };
  });

  return { rows, publicNames, entryFiles, declaredSubpaths };
}

/**
 * Rewrites family-inventory.json with resolved source and public-export evidence, which the
 * file's own `resolutionLaw` requires before any visual round. The output is deterministic so
 * the inventory stays regenerable rather than hand-maintained.
 */
export function writeResolvedInventory(options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const root = options.root ?? REPOSITORY_ROOT;
  const resolved = resolveInventory({ ...options, contracts });
  const target = path.join(PROGRAM_ROOT_FILE(root), 'family-inventory.json');

  const rows = resolved.rows.map((row) => {
    const declaredPresent = row.components.filter((component) => row.publicExports.includes(component));
    const declaredMissing = row.components.filter((component) => !row.publicExports.includes(component));
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
      declaredComponentsPublic: declaredPresent,
      declaredComponentsNotPubliclyNamed: declaredMissing,
      sourceResolution: row.sourceResolution,
    };
  });

  const next = {
    ...contracts.inventory,
    resolutionLaw:
      'Resolved by packages/core/scripts/quality-evidence/v2/inventory-correspondence.mjs; regenerate with `node scripts/quality-evidence/v2/cli.mjs inventory --write` rather than hand-editing a row.',
    dimensionPolicy: {
      default: 'all twelve quality-rubric dimensions apply to every family',
      narrowingRequires:
        'a per-receipt NOT_APPLICABLE_WITH_REASON that names the absent capability; the inventory never pre-narrows a family',
    },
    rows,
  };

  fs.writeFileSync(target, `${JSON.stringify(next, null, 2)}\n`);
  return { target: path.relative(root, target), rows: rows.length };
}

function PROGRAM_ROOT_FILE(root) {
  return path.join(root, CORE_ROOT, 'scripts/quality-evidence/programs/modern-rescue');
}

export function checkInventoryCorrespondence(options = {}) {
  const contracts = options.contracts ?? loadProgramContracts();
  const resolved = resolveInventory({ ...options, contracts });
  const blockers = [];
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

  const familyNames = new Set(resolved.rows.map((row) => row.family));
  if (!familyNames.has('SemanticSurface')) blockers.push('canonical SemanticSurface is missing from the inventory');
  if (familyNames.has('OverlayModal')) {
    blockers.push('deprecated OverlayModal must not occupy an independent family row');
  }
  if (resolved.publicNames.has('OverlayModal') === false) {
    warnings.push('OverlayModal is no longer publicly exported; the R5 retirement census must record this');
  }

  const counts = {};
  for (const row of resolved.rows) counts[row.layer] = (counts[row.layer] ?? 0) + 1;
  for (const [layer, expected] of Object.entries(contracts.inventory.counts)) {
    if (counts[layer] !== expected) blockers.push(`layer ${layer} resolves ${counts[layer] ?? 0}, expected ${expected}`);
  }

  const profileCounts = {};
  for (const row of resolved.rows) profileCounts[row.layerProfile] = (profileCounts[row.layerProfile] ?? 0) + 1;

  return {
    schemaVersion: 2,
    valid: blockers.length === 0,
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
    blockers,
    warnings,
  };
}
