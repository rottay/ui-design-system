#!/usr/bin/env node

/**
 * Core source-tree structure audit.
 *
 * This gate turns the owner tree laws into a reproducible ratchet:
 *
 * 1. authored units use folder/index.ts(x), not free-standing leaf modules;
 * 2. a barrel is not mixed with productive peers at the same level;
 * 3. two or more flat modules form a family that needs another owner level;
 * 4. tests live in tests/, __tests__/ or __test__/ containers;
 * 5. a test container is anchored to one immediate owner, not shared by two
 *    or more productive sibling units without an aggregate index;
 * 6. a module does not depend on a peer at the same structural level, except
 *    for an explicit downstream -> upstream local-layer edge;
 * 7. named layers do not coexist with unlayered capability peers;
 * 8. top-level domains belong to an explicit architectural tier;
 * 9. physical owner paths do not repeat an adjacent segment, use the retired
 *    generic root owner `composition`, or hide authored ownership behind a
 *    generic directory (`_internal`, `internal`, `misc`, `shared`, `utils`,
 *    `hooks`).
 *
 * Generated code, declarations, fixtures, stories/examples and real package
 * entrypoints are classified explicitly and are not charged as authored-unit
 * debt. The baseline stores every finding identity, not only totals: deleting a
 * finding is green, moving or adding one is red until the deliberate ratchet is
 * updated.
 *
 * Usage:
 *   node scripts/core-structure-audit.mjs --check
 *   node scripts/core-structure-audit.mjs --report --details=30
 *   node scripts/core-structure-audit.mjs --write-baseline
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIRECTORY = dirname(SCRIPT_PATH);
const DEFAULT_PACKAGE_ROOT = resolve(SCRIPT_DIRECTORY, '..');
const DEFAULT_SOURCE_ROOT = resolve(DEFAULT_PACKAGE_ROOT, 'src');
const DEFAULT_BASELINE_PATH = resolve(SCRIPT_DIRECTORY, 'core-structure-audit.baseline.json');

const SOURCE_EXTENSION_PATTERN = /\.(?:[cm]?[jt]sx?)$/u;
const INDEX_FILE_PATTERN = /^index\.(?:[cm]?[jt]sx?)$/u;
const TEST_FILE_PATTERN = /\.(?:test|spec)\.(?:[cm]?[jt]sx?)$/u;
const STORY_FILE_PATTERN = /\.stories\.(?:[cm]?[jt]sx?)$/u;
const EXAMPLE_FILE_PATTERN = /(?:^|[.-])(?:examples?|usage-example|advanced-examples?)\.(?:[cm]?[jt]sx?)$/iu;
const DECLARATION_FILE_PATTERN = /\.d\.(?:ts|mts|cts)$/u;
const GENERATED_HEADER_PATTERN = /^(?:\s*\/\/|\s*\/\*+|\s*\*)\s*(?:@generated\b|(?:this\s+)?file\s+(?:is\s+)?(?:auto-)?generated\b|(?:auto-)?generated\s+file\b|do not edit\b)/imu;
const TEST_CONTAINERS = new Set(['tests', '__tests__', '__test__']);
const FIXTURE_CONTAINERS = new Set(['fixtures', '_fixtures', '__fixtures__']);
const GENERATED_CONTAINERS = new Set(['generated']);
const AUXILIARY_OWNER_CONTAINERS = new Set([
  ...TEST_CONTAINERS,
  ...FIXTURE_CONTAINERS,
  ...GENERATED_CONTAINERS,
  'integration',
  'architecture',
]);
const CONVENTIONAL_ROOT_ENTRYPOINTS = new Set(['index.ts']);
const FORBIDDEN_GENERIC_ROOT_OWNERS = new Set(['composition']);
const FORBIDDEN_GENERIC_OWNER_SEGMENTS = new Set([
  '_internal',
  'hooks',
  'internal',
  'misc',
  'shared',
  'utils',
]);

/**
 * Source-support roots are explicit package mechanics, not architectural
 * tiers. They stay outside ARCHITECTURE_TIERS and carry their own closed
 * shape: registered package/build entrypoints represented by folder/index.
 */
export const CLASSIFIED_SUPPORT_ROOTS = Object.freeze(['entrypoints']);
const CLASSIFIED_SUPPORT_ROOT_SET = new Set(CLASSIFIED_SUPPORT_ROOTS);

/**
 * These are architectural destinations, not import aliases. Keeping the map
 * closed makes a new root-level domain fail instead of silently becoming a new
 * peer. Physical migration can happen tier by tier without changing the public
 * API because package entrypoints remain at src/.
 */
export const ARCHITECTURE_TIERS = Object.freeze({
  foundation: Object.freeze(['behavior', 'contracts', 'i18n', 'kernel', 'presets', 'tokens']),
  infrastructure: Object.freeze(['compilers', 'runtime']),
  graphics: Object.freeze(['icons', 'brand-marks', 'motion', 'pictograms']),
  ui: Object.freeze(['primitives', 'patterns', 'structures', 'surfaces']),
  tooling: Object.freeze(['eslint']),
});

/**
 * Local layer vocabulary. Rank increases toward the rendered/product edge.
 * Named kernel facets are foundation synonyms so `spatial/react ->
 * spatial/policy` and `charts/react -> charts/kernel` are directional rather
 * than blanket exceptions. Unknown sibling names remain strict peer debt.
 */
export const LOCAL_LAYER_RANKS = Object.freeze({
  foundation: 0,
  kernel: 0,
  contracts: 0,
  policy: 0,
  quality: 0,
  spec: 0,
  validation: 0,
  runtime: 1,
  composition: 2,
  react: 2,
  presentation: 3,
  facade: 4,
  public: 4,
});

/**
 * Canonical UI composition hierarchy. Unlike LOCAL_LAYER_RANKS, which is a
 * reusable vocabulary inside any capability owner, these ranks apply only to
 * the direct children of the physical `ui/` macro root. A higher UI layer may
 * consume any lower layer; upward edges and dependencies between peer owners
 * in the same UI layer remain structural debt.
 */
export const UI_LAYER_RANKS = Object.freeze({
  primitives: 0,
  patterns: 1,
  structures: 2,
  surfaces: 3,
});

/**
 * Scoped macro owners whose direct children are an intentional dependency
 * stack. This stays separate from LOCAL_LAYER_RANKS: `runtime` is a reusable
 * local layer name, while `compilers` is meaningful only directly under the
 * infrastructure macro root.
 */
export const SCOPED_OWNER_RANKS = Object.freeze({
  foundation: Object.freeze({
    contracts: 0,
    presets: 1,
  }),
  // Locale metadata and message catalogs are the data floor that the
  // resolution layer reads; resolution never publishes back into them.
  'foundation/i18n/runtime': Object.freeze({
    catalog: 0,
    resolution: 1,
  }),
  // Colorimetry sits below the accessibility math that consumes it.
  'foundation/kernel': Object.freeze({
    color: 0,
    accessibility: 1,
  }),
  // Scalar WCAG colorimetry sits below the color-space modules that consume it.
  'foundation/kernel/color': Object.freeze({
    contrast: 0,
    oklch: 1,
  }),
  infrastructure: Object.freeze({
    compilers: 0,
    runtime: 1,
  }),
  // The top-layer host is the overlay substrate a portal resolves against:
  // it decides whether portaled content stays inside an open dialog's
  // top-layer subtree or falls back to the shared portal root.
  'ui/primitives/runtime/overlay': Object.freeze({
    'top-layer-host': 0,
    portal: 1,
  }),
  'ui/primitives/feedback/Toast/runtime/state': Object.freeze({
    'method-registry': 0,
    provider: 1,
  }),
});

/**
 * Internal ownership branches used by one direct UI component owner. These
 * names are intentionally scoped to `ui/<tier>/<category>/<Component>` instead
 * of being added to LOCAL_LAYER_RANKS: `engines` is also a standalone runtime
 * capability elsewhere in the package and must not become a global synonym
 * for presentation.
 *
 * The component facade remains the owner index. Its authored branches flow
 * from stable contracts through optional runtime behavior and physical engine
 * implementations to compound public composition.
 */
export const UI_COMPONENT_BRANCH_RANKS = Object.freeze({
  foundation: 0,
  contracts: 0,
  runtime: 1,
  engines: 2,
  presentation: 3,
  compound: 4,
});

function toPosix(path) {
  return path.split(sep).join('/');
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function groupBy(items, keyFor) {
  const groups = {};
  for (const item of items) {
    const key = keyFor(item);
    (groups[key] ??= []).push(item);
  }
  return groups;
}

function walkFiles(root, current = root) {
  const files = [];
  for (const entry of readdirSync(current, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const path = resolve(current, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(root, path));
    if (entry.isFile()) files.push(path);
  }
  return files;
}

function pathSegments(relativePath) {
  return relativePath.split('/').filter(Boolean);
}

function hasContainer(relativePath, containers) {
  return pathSegments(relativePath).some((segment) => containers.has(segment));
}

function scriptKind(path) {
  if (/\.tsx$/u.test(path)) return ts.ScriptKind.TSX;
  if (/\.jsx$/u.test(path)) return ts.ScriptKind.JSX;
  if (/\.js$/u.test(path) || /\.mjs$/u.test(path) || /\.cjs$/u.test(path)) {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

function isDirectiveStatement(statement) {
  return ts.isExpressionStatement(statement)
    && ts.isStringLiteral(statement.expression);
}

/** A barrel contains only directives and import/re-export declarations. */
export function isBarrelSource(source, path = 'index.ts') {
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(path),
  );
  if (sourceFile.statements.length === 0) return false;
  return sourceFile.statements.every((statement) => (
    isDirectiveStatement(statement)
    || ts.isImportDeclaration(statement)
    || ts.isImportEqualsDeclaration(statement)
    || ts.isExportDeclaration(statement)
    || ts.isExportAssignment(statement)
    || ts.isEmptyStatement(statement)
  ));
}

function moduleSpecifiers(source, path) {
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(path),
  );
  const specifiers = [];
  function collect(node) {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      && node.moduleSpecifier
      && ts.isStringLiteralLike(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text);
    } else if (ts.isImportEqualsDeclaration(node)
      && ts.isExternalModuleReference(node.moduleReference)
      && node.moduleReference.expression
      && ts.isStringLiteralLike(node.moduleReference.expression)) {
      specifiers.push(node.moduleReference.expression.text);
    } else if (ts.isCallExpression(node)
      && node.arguments.length === 1
      && ts.isStringLiteralLike(node.arguments[0])
      && (node.expression.kind === ts.SyntaxKind.ImportKeyword
        || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, collect);
  }
  collect(sourceFile);
  return sorted(new Set(specifiers));
}

function discoverRootEntrypoints({ packageRoot, sourceRoot, explicitEntrypoints = [] }) {
  const entrypoints = new Set([...CONVENTIONAL_ROOT_ENTRYPOINTS, ...explicitEntrypoints]);
  const packageJsonPath = resolve(packageRoot, 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    for (const sourceEntrypoint of Object.values(packageJson.releaseSync?.sourceEntrypoints ?? {})) {
      entrypoints.add(toPosix(sourceEntrypoint));
    }
  }
  const viteConfigPath = resolve(packageRoot, 'vite.config.ts');
  if (existsSync(viteConfigPath)) {
    const viteSource = readFileSync(viteConfigPath, 'utf8');
    for (const match of viteSource.matchAll(/src\/([^'"`]+\.(?:[cm]?[jt]sx?))/gu)) {
      entrypoints.add(toPosix(match[1]));
    }
  }
  return new Set(
    [...entrypoints].filter((entry) => existsSync(resolve(sourceRoot, entry)) || explicitEntrypoints.includes(entry)),
  );
}

function classifyFile({ path, sourceRoot, rootEntrypoints }) {
  const relativePath = toPosix(relative(sourceRoot, path));
  const name = pathSegments(relativePath).at(-1) ?? relativePath;
  const source = readFileSync(path, 'utf8');
  const isSource = SOURCE_EXTENSION_PATTERN.test(name);
  const isDeclaration = isSource && DECLARATION_FILE_PATTERN.test(name);
  const isTest = isSource && TEST_FILE_PATTERN.test(name);
  const isTestSupport = hasContainer(relativePath, TEST_CONTAINERS)
    || /(?:^|[-.])(?:test-utils|test-helpers)\.(?:[cm]?[jt]sx?)$/iu.test(name);
  const isStory = isSource && STORY_FILE_PATTERN.test(name);
  const isExample = isSource && EXAMPLE_FILE_PATTERN.test(name);
  const isFixture = hasContainer(relativePath, FIXTURE_CONTAINERS);
  const isGenerated = hasContainer(relativePath, GENERATED_CONTAINERS)
    || GENERATED_HEADER_PATTERN.test(source.slice(0, 1_000));
  const isIndex = isSource && INDEX_FILE_PATTERN.test(name);
  const isEntrypoint = isSource && rootEntrypoints.has(relativePath);
  const isBarrel = isIndex && isBarrelSource(source, path);
  const ignoredKind = isDeclaration
    ? 'declaration'
    : isTest
      ? 'test'
      : isTestSupport
        ? 'test-support'
      : isStory
        ? 'story'
        : isExample
          ? 'example'
          : isFixture
            ? 'fixture'
            : isGenerated
              ? 'generated'
              : isEntrypoint
                ? 'entrypoint'
                : null;
  return {
    path,
    relativePath,
    name,
    source,
    isSource,
    isDeclaration,
    isIndex,
    isBarrel,
    isEntrypoint,
    isTest,
    ignoredKind,
  };
}

function finding(rule, id, path, message, metadata = {}) {
  return { rule, id: `${rule}:${id}`, path, message, metadata };
}

function resolveSourceModule({ importer, specifier, sourceRoot, sourcePaths }) {
  // Vite resource queries and URL fragments select how an existing file is
  // loaded; they are not part of its physical repository path.
  const physicalSpecifier = specifier.replace(/[?#].*$/u, '');
  let unresolved;
  if (physicalSpecifier.startsWith('.')) {
    unresolved = resolve(dirname(importer), physicalSpecifier);
  } else if (physicalSpecifier.startsWith('@/')) {
    unresolved = resolve(sourceRoot, physicalSpecifier.slice(2));
  } else if (physicalSpecifier.startsWith('@ui/')) {
    unresolved = resolve(sourceRoot, 'ui', physicalSpecifier.slice('@ui/'.length));
  } else if (physicalSpecifier.startsWith('@types/')) {
    unresolved = resolve(
      sourceRoot,
      'foundation',
      'contracts',
      physicalSpecifier.slice('@types/'.length),
    );
  } else {
    return null;
  }

  const candidates = [unresolved];
  if (!SOURCE_EXTENSION_PATTERN.test(unresolved)) {
    for (const extension of ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']) {
      candidates.push(`${unresolved}${extension}`);
    }
    for (const extension of ['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs']) {
      candidates.push(resolve(unresolved, `index${extension}`));
    }
  }
  return candidates.find((candidate) => {
    const absoluteCandidate = resolve(candidate);
    if (sourcePaths.has(absoluteCandidate)) return true;

    // Stories may intentionally consume package-owned Storybook helpers that
    // sit beside `src/`. Recognize real repository files without adding them
    // to source ownership/dependency analysis.
    const relativeToPackage = relative(dirname(sourceRoot), absoluteCandidate);
    const isPackageOwned = relativeToPackage !== '..'
      && !relativeToPackage.startsWith(`..${sep}`);
    return isPackageOwned
      && existsSync(absoluteCandidate)
      && statSync(absoluteCandidate).isFile();
  }) ?? null;
}

function lowestCommonDirectory(leftFile, rightFile) {
  const left = dirname(leftFile).split(sep);
  const right = dirname(rightFile).split(sep);
  let index = 0;
  while (index < left.length && index < right.length && left[index] === right[index]) index += 1;
  return {
    directory: left.slice(0, index).join(sep) || sep,
    leftOwner: left[index] ?? null,
    rightOwner: right[index] ?? null,
  };
}

function resolveLocalLayer(file, commonDirectory) {
  const relativeDirectory = toPosix(relative(commonDirectory, dirname(file)));
  for (const segment of pathSegments(relativeDirectory)) {
    // The first declared layer below the common owner defines this dependency
    // boundary. Deeper owners may declare their own nested layers, but those
    // must not overwrite the outer taxonomy (for example a surface's internal
    // `runtime/` still belongs to the outer `ui/surfaces` layer when it
    // consumes `ui/patterns`).
    if (LOCAL_LAYER_RANKS[segment] !== undefined) {
      return { name: segment, rank: LOCAL_LAYER_RANKS[segment] };
    }
  }
  const ownerLayer = basename(commonDirectory);
  return LOCAL_LAYER_RANKS[ownerLayer] === undefined
    ? null
    : { name: ownerLayer, rank: LOCAL_LAYER_RANKS[ownerLayer] };
}

function resolveUiLayer(file, sourceRoot) {
  const segments = pathSegments(toPosix(relative(sourceRoot, file)));
  if (segments[0] !== 'ui') return null;
  const name = segments[1];
  const rank = UI_LAYER_RANKS[name];
  return rank === undefined ? null : { name, rank };
}

function isUiCapabilityOwner(relativeDirectory) {
  const segments = pathSegments(relativeDirectory);
  return segments.length >= 4
    && segments[0] === 'ui'
    && Object.prototype.hasOwnProperty.call(UI_LAYER_RANKS, segments[1]);
}

function resolveUiComponentBranch(file, commonDirectory, sourceRoot) {
  const commonSegments = pathSegments(toPosix(relative(sourceRoot, commonDirectory)));
  if (!isUiCapabilityOwner(commonSegments.join('/'))) {
    return null;
  }

  const fileSegments = pathSegments(toPosix(relative(commonDirectory, file)));
  const name = fileSegments[0];
  const rank = UI_COMPONENT_BRANCH_RANKS[name];
  return rank === undefined ? null : { name, rank };
}

function topLevelDomain(relativePath) {
  return pathSegments(relativePath)[0] ?? '';
}

function countBy(items, keyFor) {
  const counts = {};
  for (const item of items) {
    const key = keyFor(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)));
}

export function auditCoreStructure({
  sourceRoot = DEFAULT_SOURCE_ROOT,
  packageRoot = dirname(sourceRoot),
  explicitEntrypoints = [],
  architectureTiers = ARCHITECTURE_TIERS,
} = {}) {
  const absoluteSourceRoot = resolve(sourceRoot);
  const absolutePackageRoot = resolve(packageRoot);
  const rootEntrypoints = discoverRootEntrypoints({
    packageRoot: absolutePackageRoot,
    sourceRoot: absoluteSourceRoot,
    explicitEntrypoints,
  });
  const allPaths = walkFiles(absoluteSourceRoot);
  const files = allPaths.map((path) => classifyFile({
    path,
    sourceRoot: absoluteSourceRoot,
    rootEntrypoints,
  }));
  const sourceFiles = files.filter(({ isSource }) => isSource);
  const sourcePaths = new Set(sourceFiles.map(({ path }) => resolve(path)));
  const knownPaths = new Set(files.map(({ path }) => resolve(path)));
  const authoredFiles = sourceFiles.filter(({ ignoredKind, isIndex }) => !ignoredKind && !isIndex);
  const productionIndexes = sourceFiles.filter(({ ignoredKind, isIndex }) => !ignoredKind && isIndex);
  const fileByPath = new Map(sourceFiles.map((file) => [resolve(file.path), file]));
  const findings = [];
  const tierByDomain = new Map();
  const tierRank = new Map();
  Object.entries(architectureTiers).forEach(([tier, domains], rank) => {
    tierRank.set(tier, rank);
    // A tier name is also its final physical root. This permits incremental
    // migration from flat domains (for example `primitives/`) into the governed
    // hierarchy (`ui/primitives/`) without creating an anonymous root.
    tierByDomain.set(tier, tier);
    for (const domain of domains) tierByDomain.set(domain, tier);
  });

  // Physical path law: inspect directory segments only. Source text and the
  // filename are deliberately excluded, so `composition.ts`, a comment that
  // says "composition", or `record/record.ts` cannot masquerade as an owner
  // violation. Adjacent exact repeats are the accidental move shape this gate
  // prevents (`ui/structures/record/record/**`); non-adjacent layer names such
  // as `runtime/tenant/runtime/**` remain valid and are governed directionally
  // by LOCAL_LAYER_RANKS instead.
  const repeatedOwnerPaths = new Map();
  const genericRootOwners = new Set();
  const genericOwnerPaths = new Map();
  for (const file of files) {
    const directorySegments = pathSegments(file.relativePath).slice(0, -1);
    const rootOwner = directorySegments[0];
    if (FORBIDDEN_GENERIC_ROOT_OWNERS.has(rootOwner)) genericRootOwners.add(rootOwner);

    for (let index = 1; index < directorySegments.length; index += 1) {
      if (directorySegments[index] !== directorySegments[index - 1]) continue;
      const ownerPath = directorySegments.slice(0, index + 1).join('/');
      repeatedOwnerPaths.set(ownerPath, directorySegments[index]);
      break;
    }
  }
  for (const file of sourceFiles.filter(({ ignoredKind }) => !ignoredKind)) {
    const directorySegments = pathSegments(file.relativePath).slice(0, -1);
    for (let index = 0; index < directorySegments.length; index += 1) {
      const segment = directorySegments[index];
      if (!FORBIDDEN_GENERIC_OWNER_SEGMENTS.has(segment)) continue;
      genericOwnerPaths.set(directorySegments.slice(0, index + 1).join('/'), segment);
    }
  }
  for (const [ownerPath, segment] of [...repeatedOwnerPaths]
    .sort(([left], [right]) => left.localeCompare(right))) {
    findings.push(finding(
      'repeated-path-segment',
      ownerPath,
      ownerPath,
      `Physical owner path repeats the adjacent segment "${segment}". Collapse the duplicate owner level.`,
      { segment },
    ));
  }
  for (const owner of sorted(genericRootOwners)) {
    findings.push(finding(
      'generic-owner-segment',
      owner,
      owner,
      `Top-level owner "${owner}" is generic and retired; place the capability under its governed macro root.`,
      { owner },
    ));
  }
  for (const [ownerPath, segment] of [...genericOwnerPaths]
    .sort(([left], [right]) => left.localeCompare(right))) {
    findings.push(finding(
      'generic-owner-segment',
      ownerPath,
      ownerPath,
      `Physical owner path uses the generic segment "${segment}". Replace it with the capability it owns.`,
      { segment },
    ));
  }

  // Root declarations are not runtime/package entrypoints and must not float
  // beside them. Keep ambient shims under the explicit tooling declaration
  // owner so the source root contains only discoverable public entrypoints.
  for (const file of sourceFiles.filter(({ isDeclaration, relativePath }) => (
    isDeclaration && !relativePath.includes('/')
  ))) {
    findings.push(finding(
      'root-declaration-file',
      file.relativePath,
      file.relativePath,
      'Root declaration file is loose; move it under tooling/declarations.',
      { destination: 'tooling/declarations' },
    ));
  }

  // The entrypoint support root is deliberately not a sixth architecture
  // tier. It may contain only registered folder/index package boundaries;
  // general authored modules belong to the capability that owns them.
  for (const file of files.filter(({ relativePath }) => (
    pathSegments(relativePath)[0] === 'entrypoints'
  ))) {
    if (!file.isSource || !file.isIndex) {
      findings.push(finding(
        'invalid-entrypoint-support-module',
        file.relativePath,
        file.relativePath,
        'Entrypoint support files must use a capability owner folder with index.ts(x).',
      ));
      continue;
    }
    if (!rootEntrypoints.has(file.relativePath)) {
      findings.push(finding(
        'unregistered-entrypoint-support-module',
        file.relativePath,
        file.relativePath,
        'Entrypoint support index is not registered by package releaseSync, Vite, or an explicit entrypoint.',
      ));
    }
  }

  // Rule 1: test files must be in a named test container.
  for (const file of sourceFiles.filter(({ isTest }) => isTest)) {
    const parentName = pathSegments(toPosix(relative(absoluteSourceRoot, dirname(file.path)))).at(-1) ?? '';
    if (!TEST_CONTAINERS.has(parentName)) {
      findings.push(finding(
        'co-located-test-file',
        file.relativePath,
        file.relativePath,
        'Test/spec file is co-located with productive source; move it under a tests/ container.',
      ));
    }
  }

  // Rule 2: every authored non-entrypoint unit is represented by folder/index.
  for (const file of authoredFiles) {
    findings.push(finding(
      'flat-authored-module',
      file.relativePath,
      file.relativePath,
      'Authored source is a leaf module instead of a folder/index.ts(x) unit.',
    ));
  }

  const directAuthoredByDirectory = new Map();
  const indexesByDirectory = new Map();
  for (const file of authoredFiles) {
    const directory = dirname(file.path);
    const peers = directAuthoredByDirectory.get(directory) ?? [];
    peers.push(file);
    directAuthoredByDirectory.set(directory, peers);
  }
  for (const file of productionIndexes) {
    const directory = dirname(file.path);
    const indexes = indexesByDirectory.get(directory) ?? [];
    indexes.push(file);
    indexesByDirectory.set(directory, indexes);
  }

  // Test-container anchoring law: a named test container belongs to its
  // immediate parent owner. The parent is unambiguous when it exposes a
  // productive index.ts(x), when it is a test-only suite, or when there is at
  // most one productive child owner.
  // Without an aggregate index, two or more productive children make a sibling
  // tests/ directory ownerless: its physical position cannot say which unit it
  // verifies. Direct productive leaf files count as owners too, so a flat pair
  // cannot hide behind a shared tests/ container.
  const testContainerDirectories = new Set(
    sourceFiles
      .filter(({ ignoredKind, path }) => (
        (ignoredKind === 'test' || ignoredKind === 'test-support')
        && TEST_CONTAINERS.has(basename(dirname(path)))
      ))
      .map(({ path }) => dirname(path)),
  );
  const productiveSourceFiles = sourceFiles.filter(({ ignoredKind }) => !ignoredKind);
  for (const containerDirectory of sorted(testContainerDirectories)) {
    const ownerDirectory = dirname(containerDirectory);
    if ((indexesByDirectory.get(ownerDirectory) ?? []).length > 0) continue;

    const productiveOwners = new Set();
    for (const file of productiveSourceFiles) {
      const relativeToOwner = toPosix(relative(ownerDirectory, file.path));
      if (relativeToOwner.startsWith('../') || relativeToOwner === '..') continue;
      const segments = pathSegments(relativeToOwner);
      if (segments.length === 1) {
        if (!file.isIndex) productiveOwners.add(`file:${file.name}`);
        continue;
      }
      const childOwner = segments[0];
      if (AUXILIARY_OWNER_CONTAINERS.has(childOwner)) continue;
      productiveOwners.add(childOwner);
    }
    if (productiveOwners.size < 2) continue;

    const relativeContainer = toPosix(relative(absoluteSourceRoot, containerDirectory));
    findings.push(finding(
      'orphan-test-container',
      relativeContainer,
      relativeContainer,
      'Test container is shared by multiple productive sibling units without an aggregate index.ts(x) owner.',
      {
        owner: toPosix(relative(absoluteSourceRoot, ownerDirectory)) || '.',
        productiveOwners: sorted(productiveOwners),
      },
    ));
  }

  // Rules 3-5: directory ownership and family shape.
  for (const [directory, peers] of [...directAuthoredByDirectory].sort(([left], [right]) => left.localeCompare(right))) {
    const relativeDirectory = toPosix(relative(absoluteSourceRoot, directory)) || '.';
    const indexes = indexesByDirectory.get(directory) ?? [];
    if (indexes.length === 0) {
      findings.push(finding(
        'missing-folder-index',
        relativeDirectory,
        relativeDirectory,
        'Directory owns authored modules but has no index.ts(x) entry.',
        { peers: sorted(peers.map(({ name }) => name)) },
      ));
    }
    const barrel = indexes.find(({ isBarrel }) => isBarrel);
    if (barrel) {
      findings.push(finding(
        'barrel-with-authored-peers',
        relativeDirectory,
        relativeDirectory,
        'A pure barrel and authored units share one level; each unit needs its own folder.',
        { barrel: barrel.name, peers: sorted(peers.map(({ name }) => name)) },
      ));
    }
    if (peers.length >= 2) {
      findings.push(finding(
        'flat-module-family',
        relativeDirectory,
        relativeDirectory,
        'Two or more authored peer modules form a flat family; add an owner level.',
        { peers: sorted(peers.map(({ name }) => name)), size: peers.length },
      ));
    }
  }

  // Rule 6: once a capability owner uses its governing branch vocabulary,
  // unknown peers cannot sit beside those branches anonymously. UI tier roots
  // are intentional category catalogs, and collection owners declare the same
  // shape with `families/`; both may expose owner-wide support without a vague
  // `shared/` wrapper. Requiring at least two branch children avoids mistaking
  // a capability literally named `contracts` or `runtime` for a layer.
  const directChildDirectories = new Map();
  for (const file of files) {
    const segments = pathSegments(file.relativePath);
    for (let prefixLength = 0; prefixLength < segments.length - 1; prefixLength += 1) {
      const directory = segments.slice(0, prefixLength).join('/') || '.';
      const children = directChildDirectories.get(directory) ?? new Set();
      children.add(segments[prefixLength]);
      directChildDirectories.set(directory, children);
    }
  }
  for (const [directory, children] of [...directChildDirectories]
    .sort(([left], [right]) => left.localeCompare(right))) {
    if (directory === '.') continue;
    const directorySegments = pathSegments(directory);
    // A canonical UI tier is itself an aggregate catalog: its category owners
    // may consume tier-wide foundation/runtime support without an artificial
    // `shared` or `catalog` wrapper. Collection owners make the same shape
    // explicit with a `families/` branch.
    if (directorySegments.length === 2
      && directorySegments[0] === 'ui'
      && Object.prototype.hasOwnProperty.call(UI_LAYER_RANKS, directorySegments[1])) {
      continue;
    }
    // Runtime is an aggregate capability catalog with one explicit shared
    // foundation branch. Concrete services (tenant, motion, responsive, ...)
    // may depend on that branch without hiding ownership behind `shared/`.
    if (directory === 'infrastructure/runtime') continue;
    if (children.has('families')) continue;
    if (directorySegments.length === 1
      && Object.prototype.hasOwnProperty.call(architectureTiers, directorySegments[0])) {
      continue;
    }
    const branchRanks = isUiCapabilityOwner(directory)
      ? UI_COMPONENT_BRANCH_RANKS
      : LOCAL_LAYER_RANKS;
    const layerChildren = sorted([...children].filter((child) => (
      Object.prototype.hasOwnProperty.call(branchRanks, child)
    )));
    if (layerChildren.length < 2) continue;
    const capabilityChildren = sorted([...children].filter((child) => (
      !Object.prototype.hasOwnProperty.call(branchRanks, child)
      && !AUXILIARY_OWNER_CONTAINERS.has(child)
    )));
    if (capabilityChildren.length === 0) continue;
    findings.push(finding(
      'mixed-layer-and-capability-peers',
      directory,
      directory,
      'Named architectural layers and unlayered capabilities share one owner level.',
      { capabilityChildren, layerChildren },
    ));
  }

  // Every local/aliased source edge must resolve, including edges from tests,
  // stories and fixtures. Those files are excluded from production ownership
  // rules, but stale mocks/imports still break the repository's executable
  // validation and must never be hidden by that classification.
  for (const sourceFile of sourceFiles) {
    for (const specifier of moduleSpecifiers(sourceFile.source, sourceFile.path)) {
      const isLocalSpecifier = specifier.startsWith('.')
        || specifier.startsWith('@/')
        || specifier.startsWith('@ui/')
        || specifier.startsWith('@types/');
      if (!isLocalSpecifier) continue;
      const targetPath = resolveSourceModule({
        importer: sourceFile.path,
        specifier,
        sourceRoot: absoluteSourceRoot,
        sourcePaths: knownPaths,
      });
      if (targetPath) continue;
      findings.push(finding(
        'unresolved-local-import',
        `${sourceFile.relativePath}->${specifier}`,
        sourceFile.relativePath,
        `Local module specifier "${specifier}" does not resolve to a repository file.`,
        { specifier },
      ));
    }
  }

  // Rules 7-8: peer dependencies. Pure barrels are aggregators, not dependants.
  for (const sourceFile of sourceFiles.filter((file) => !file.ignoredKind && !file.isBarrel)) {
    for (const specifier of moduleSpecifiers(sourceFile.source, sourceFile.path)) {
      const targetPath = resolveSourceModule({
        importer: sourceFile.path,
        specifier,
        sourceRoot: absoluteSourceRoot,
        sourcePaths,
      });
      if (!targetPath || resolve(targetPath) === resolve(sourceFile.path)) continue;
      const targetFile = fileByPath.get(resolve(targetPath));
      if (!targetFile || targetFile.ignoredKind) continue;
      const sourceDirectory = dirname(sourceFile.path);
      const targetDirectory = dirname(targetFile.path);

      const sourceDomain = topLevelDomain(sourceFile.relativePath);
      const targetDomain = topLevelDomain(targetFile.relativePath);
      if (sourceDomain !== targetDomain) {
        const sourceTier = tierByDomain.get(sourceDomain);
        const targetTier = tierByDomain.get(targetDomain);
        if (sourceTier && targetTier && sourceTier === targetTier) {
          findings.push(finding(
            'same-tier-domain-dependency',
            `${sourceFile.relativePath}->${targetFile.relativePath}`,
            sourceFile.relativePath,
            `Domain "${sourceDomain}" depends on peer domain "${targetDomain}" inside tier ${sourceTier}.`,
            { sourceDomain, sourceTier, target: targetFile.relativePath, targetDomain },
          ));
        } else if (sourceTier && targetTier && tierRank.get(sourceTier) < tierRank.get(targetTier)) {
          findings.push(finding(
            'architecture-layer-inversion',
            `${sourceFile.relativePath}->${targetFile.relativePath}`,
            sourceFile.relativePath,
            `Lower tier ${sourceTier} depends upward on ${targetTier}.`,
            { sourceDomain, sourceTier, target: targetFile.relativePath, targetDomain, targetTier },
          ));
        }
      }

      if (sourceDirectory === targetDirectory) {
        findings.push(finding(
          'same-level-module-dependency',
          `${sourceFile.relativePath}->${targetFile.relativePath}`,
          sourceFile.relativePath,
          'Module imports a productive peer in the same directory.',
          { target: targetFile.relativePath },
        ));
        continue;
      }
      const common = lowestCommonDirectory(sourceFile.path, targetFile.path);
      if (!common.leftOwner || !common.rightOwner || common.leftOwner === common.rightOwner) continue;
      if (resolve(common.directory) === absoluteSourceRoot) continue;
      const relativeCommon = toPosix(relative(absoluteSourceRoot, common.directory));

      // The four canonical UI tiers are one directional composition stack:
      // surfaces -> structures -> patterns -> primitives. Resolve this outer
      // taxonomy before looking for nested local layers so, for example, a
      // surface's internal `foundation/` may still consume a pattern's
      // internal `presentation/` without the nested vocabulary reversing the
      // governing UI direction. Same-rank UI owners deliberately fall through
      // to the strict peer-owner/local-layer checks below.
      const sourceUiLayer = resolveUiLayer(sourceFile.path, absoluteSourceRoot);
      const targetUiLayer = resolveUiLayer(targetFile.path, absoluteSourceRoot);
      if (sourceUiLayer && targetUiLayer && sourceUiLayer.rank !== targetUiLayer.rank) {
        if (sourceUiLayer.rank > targetUiLayer.rank) continue;
        findings.push(finding(
          'local-layer-inversion',
          `${sourceFile.relativePath}->${targetFile.relativePath}`,
          sourceFile.relativePath,
          `UI layer "${sourceUiLayer.name}" depends upward on "${targetUiLayer.name}" under ui.`,
          {
            commonOwner: 'ui',
            sourceLayer: sourceUiLayer.name,
            sourceRank: sourceUiLayer.rank,
            target: targetFile.relativePath,
            targetLayer: targetUiLayer.name,
            targetRank: targetUiLayer.rank,
          },
        ));
        continue;
      }

      if (sourceUiLayer && targetUiLayer && sourceUiLayer.rank === targetUiLayer.rank) {
        const scopedRanks = SCOPED_OWNER_RANKS[relativeCommon];
        if (scopedRanks) {
          const sourceScopedRank = scopedRanks[common.leftOwner];
          const targetScopedRank = scopedRanks[common.rightOwner];
          if (sourceScopedRank !== undefined && targetScopedRank !== undefined) {
            if (sourceScopedRank > targetScopedRank) continue;
            if (sourceScopedRank < targetScopedRank) {
              findings.push(finding(
                'local-layer-inversion',
                `${sourceFile.relativePath}->${targetFile.relativePath}`,
                sourceFile.relativePath,
                `Scoped owner "${common.leftOwner}" depends upward on "${common.rightOwner}" under ${relativeCommon}.`,
                {
                  commonOwner: relativeCommon,
                  sourceLayer: common.leftOwner,
                  sourceRank: sourceScopedRank,
                  target: targetFile.relativePath,
                  targetLayer: common.rightOwner,
                  targetRank: targetScopedRank,
                },
              ));
              continue;
            }
          }
        }

        const sourceComponentBranch = resolveUiComponentBranch(
          sourceFile.path,
          common.directory,
          absoluteSourceRoot,
        );
        const targetComponentBranch = resolveUiComponentBranch(
          targetFile.path,
          common.directory,
          absoluteSourceRoot,
        );
        if (sourceComponentBranch && targetComponentBranch) {
          if (sourceComponentBranch.rank > targetComponentBranch.rank) continue;
          if (sourceComponentBranch.rank < targetComponentBranch.rank) {
            findings.push(finding(
              'local-layer-inversion',
              `${sourceFile.relativePath}->${targetFile.relativePath}`,
              sourceFile.relativePath,
              `UI component branch "${sourceComponentBranch.name}" depends upward on "${targetComponentBranch.name}" under ${relativeCommon}.`,
              {
                commonOwner: relativeCommon,
                sourceLayer: sourceComponentBranch.name,
                sourceRank: sourceComponentBranch.rank,
                target: targetFile.relativePath,
                targetLayer: targetComponentBranch.name,
                targetRank: targetComponentBranch.rank,
              },
            ));
            continue;
          }
        }

        const sourceDirectLayerRank = LOCAL_LAYER_RANKS[common.leftOwner];
        const targetDirectLayerRank = LOCAL_LAYER_RANKS[common.rightOwner];
        if (sourceDirectLayerRank === undefined && targetDirectLayerRank !== undefined) {
          // A complete capability/category is downstream of support declared
          // directly by its aggregate UI owner.
          continue;
        }
        if (sourceDirectLayerRank !== undefined && targetDirectLayerRank === undefined) {
          findings.push(finding(
            'local-layer-inversion',
            `${sourceFile.relativePath}->${targetFile.relativePath}`,
            sourceFile.relativePath,
            `Support layer "${common.leftOwner}" depends upward on capability "${common.rightOwner}" under ${relativeCommon}.`,
            {
              commonOwner: relativeCommon,
              sourceLayer: common.leftOwner,
              sourceRank: sourceDirectLayerRank,
              target: targetFile.relativePath,
              targetLayer: common.rightOwner,
            },
          ));
          continue;
        }

        const commonSegments = pathSegments(relativeCommon);
        const commonOwnsLocalLayer = commonSegments
          .slice(2)
          .some((segment) => Object.prototype.hasOwnProperty.call(LOCAL_LAYER_RANKS, segment));
        const branchesAreLocalLayers = (
          Object.prototype.hasOwnProperty.call(LOCAL_LAYER_RANKS, common.leftOwner)
          && Object.prototype.hasOwnProperty.call(LOCAL_LAYER_RANKS, common.rightOwner)
        );

        // Nested foundation/runtime/presentation layers inside one UI family
        // still use the local hierarchy below. Different capability branches
        // in the same UI tier are peers even if each branch happens to contain
        // a layer-named descendant; those names must not launder a pattern ->
        // pattern (or equivalent) dependency into an allowed edge.
        if (!commonOwnsLocalLayer && !branchesAreLocalLayers) {
          findings.push(finding(
            'sibling-owner-dependency',
            `${sourceFile.relativePath}->${targetFile.relativePath}`,
            sourceFile.relativePath,
            `Owner "${common.leftOwner}" depends on sibling owner "${common.rightOwner}" under ${relativeCommon}.`,
            {
              commonOwner: relativeCommon,
              sourceOwner: common.leftOwner,
              target: targetFile.relativePath,
              targetOwner: common.rightOwner,
            },
          ));
          continue;
        }
      }

      const scopedRanks = SCOPED_OWNER_RANKS[relativeCommon];
      if (scopedRanks) {
        const sourceScopedRank = scopedRanks[common.leftOwner];
        const targetScopedRank = scopedRanks[common.rightOwner];
        if (sourceScopedRank !== undefined && targetScopedRank !== undefined) {
          if (sourceScopedRank > targetScopedRank) continue;
          if (sourceScopedRank < targetScopedRank) {
            findings.push(finding(
              'local-layer-inversion',
              `${sourceFile.relativePath}->${targetFile.relativePath}`,
              sourceFile.relativePath,
              `Scoped owner "${common.leftOwner}" depends upward on "${common.rightOwner}" under ${relativeCommon}.`,
              {
                commonOwner: relativeCommon,
                sourceLayer: common.leftOwner,
                sourceRank: sourceScopedRank,
                target: targetFile.relativePath,
                targetLayer: common.rightOwner,
                targetRank: targetScopedRank,
              },
            ));
            continue;
          }
        }
      }


      const sourceDirectLayerRank = LOCAL_LAYER_RANKS[common.leftOwner];
      const targetDirectLayerRank = LOCAL_LAYER_RANKS[common.rightOwner];
      if (sourceDirectLayerRank === undefined && targetDirectLayerRank !== undefined) {
        continue;
      }
      if (sourceDirectLayerRank !== undefined && targetDirectLayerRank === undefined) {
        findings.push(finding(
          'local-layer-inversion',
          `${sourceFile.relativePath}->${targetFile.relativePath}`,
          sourceFile.relativePath,
          `Support layer "${common.leftOwner}" depends upward on capability "${common.rightOwner}" under ${relativeCommon}.`,
          {
            commonOwner: relativeCommon,
            sourceLayer: common.leftOwner,
            sourceRank: sourceDirectLayerRank,
            target: targetFile.relativePath,
            targetLayer: common.rightOwner,
          },
        ));
        continue;
      }

      const sourceLocalLayer = resolveLocalLayer(sourceFile.path, common.directory);
      const targetLocalLayer = resolveLocalLayer(targetFile.path, common.directory);
      if (sourceLocalLayer && targetLocalLayer) {
        if (sourceLocalLayer.rank > targetLocalLayer.rank) {
          // Explicit downstream -> upstream dependency: this is the hierarchy
          // the owner requested, not sibling debt.
          continue;
        }
        if (sourceLocalLayer.rank < targetLocalLayer.rank) {
          findings.push(finding(
            'local-layer-inversion',
            `${sourceFile.relativePath}->${targetFile.relativePath}`,
            sourceFile.relativePath,
            `Local layer "${sourceLocalLayer.name}" depends upward on "${targetLocalLayer.name}" under ${relativeCommon}.`,
            {
              commonOwner: relativeCommon,
              sourceLayer: sourceLocalLayer.name,
              sourceRank: sourceLocalLayer.rank,
              target: targetFile.relativePath,
              targetLayer: targetLocalLayer.name,
              targetRank: targetLocalLayer.rank,
            },
          ));
          continue;
        }
      }
      findings.push(finding(
        'sibling-owner-dependency',
        `${sourceFile.relativePath}->${targetFile.relativePath}`,
        sourceFile.relativePath,
        `Owner "${common.leftOwner}" depends on sibling owner "${common.rightOwner}" under ${relativeCommon}.`,
        {
          commonOwner: relativeCommon,
          sourceOwner: common.leftOwner,
          target: targetFile.relativePath,
          targetOwner: common.rightOwner,
        },
      ));
    }
  }

  // Rule 8: top-level domains are explicit tier debt, never anonymous peers.
  const rootDomains = readdirSync(absoluteSourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map(({ name }) => name)
    .sort((left, right) => left.localeCompare(right));
  for (const domain of rootDomains) {
    if (CLASSIFIED_SUPPORT_ROOT_SET.has(domain)) continue;
    const tier = tierByDomain.get(domain);
    if (!tier) {
      findings.push(finding(
        'unclassified-root-domain',
        domain,
        domain,
        'Root domain has no declared architectural tier.',
      ));
      continue;
    }
    // Once a domain reaches its declared physical tier root it is no longer
    // flat debt. Unmigrated legacy roots remain decrease-only findings.
    if (Object.prototype.hasOwnProperty.call(architectureTiers, domain)) continue;
    findings.push(finding(
      'flat-architecture-domain',
      domain,
      domain,
      `Root domain is still physically flat; its declared destination tier is ${tier}/.`,
      { tier },
    ));
  }

  const uniqueFindings = [...new Map(findings.map((entry) => [entry.id, entry])).values()]
    .sort((left, right) => left.id.localeCompare(right.id));
  const ignoredFiles = sourceFiles.filter(({ ignoredKind }) => ignoredKind);
  const inventory = {
    totalFiles: files.length,
    sourceFiles: sourceFiles.length,
    cssFiles: files.filter(({ path }) => extname(path) === '.css').length,
    authoredLeafModules: authoredFiles.length,
    productionIndexes: productionIndexes.length,
    barrels: productionIndexes.filter(({ isBarrel }) => isBarrel).length,
    implementationIndexes: productionIndexes.filter(({ isBarrel }) => !isBarrel).length,
    ignoredByKind: countBy(ignoredFiles, ({ ignoredKind }) => ignoredKind),
    rootEntrypoints: sorted(rootEntrypoints),
    findingsByRule: countBy(uniqueFindings, ({ rule }) => rule),
    findingsByTopLevelScope: countBy(uniqueFindings, ({ path }) => topLevelDomain(path)),
  };
  return { findings: uniqueFindings, inventory };
}

export function createStructureBaseline(result) {
  const findings = {};
  for (const [rule, entries] of Object.entries(
    groupBy(result.findings, ({ rule }) => rule),
  ).sort(([left], [right]) => left.localeCompare(right))) {
    findings[rule] = sorted(entries.map(({ id }) => id));
  }
  return {
    schemaVersion: 1,
    policy: {
      mode: 'finding-identity-subset-ratchet',
      physicalRoots: Object.keys(ARCHITECTURE_TIERS),
      classifiedSupportRoots: CLASSIFIED_SUPPORT_ROOTS,
      generated: 'excluded by generated/ segment or generated-file header',
      tests: 'must live directly in tests/, __tests__/ or __test__/; a container shared by 2+ productive sibling owners requires an aggregate index.ts(x)',
      entrypoints: 'derived from Vite/releaseSync plus conventional index.ts; nested entrypoints live only in the classified entrypoints/ support root as folder/index units',
      localLayers: 'foundation/kernel/contracts/policy/quality/spec/validation < runtime < composition/react < presentation < facade/public; ui/primitives < ui/patterns < ui/structures < ui/surfaces; inside one UI capability foundation/contracts < runtime < engines < presentation < compound',
      layerClosure: 'an owner with two or more named layers has no unlayered capability peers; UI tier roots and infrastructure/runtime are explicit catalogs with a foundation support branch',
      physicalPaths: 'directory segments cannot repeat adjacently; the retired generic root owner composition and generic authored owner segments _internal/internal/misc/shared/utils/hooks are forbidden',
    },
    snapshot: {
      inventory: result.inventory,
      findings,
    },
  };
}

export function compareStructureBaseline(result, baseline) {
  if (baseline?.schemaVersion !== 1 || !baseline.snapshot?.findings) {
    throw new Error('core structure baseline must use schemaVersion 1 and snapshot.findings');
  }
  const currentByRule = groupBy(result.findings, ({ rule }) => rule);
  const rules = sorted(new Set([
    ...Object.keys(baseline.snapshot.findings),
    ...Object.keys(currentByRule),
  ]));
  const added = [];
  const resolved = [];
  for (const rule of rules) {
    const baselineIds = new Set(baseline.snapshot.findings[rule] ?? []);
    const currentIds = new Set((currentByRule[rule] ?? []).map(({ id }) => id));
    for (const id of currentIds) if (!baselineIds.has(id)) added.push(id);
    for (const id of baselineIds) if (!currentIds.has(id)) resolved.push(id);
  }
  return { added: sorted(added), resolved: sorted(resolved), passed: added.length === 0 };
}

function parseCliArguments(argv) {
  const flagValue = (name) => {
    const exact = argv.indexOf(name);
    if (exact >= 0) return argv[exact + 1];
    const prefix = `${name}=`;
    return argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
  };
  return {
    mode: argv.includes('--write-baseline')
      ? 'write-baseline'
      : argv.includes('--report')
        ? 'report'
        : 'check',
    json: argv.includes('--json'),
    details: Number.parseInt(flagValue('--details') ?? '20', 10),
    sourceRoot: resolve(flagValue('--source-root') ?? DEFAULT_SOURCE_ROOT),
    packageRoot: resolve(flagValue('--package-root') ?? DEFAULT_PACKAGE_ROOT),
    baselinePath: resolve(flagValue('--baseline') ?? DEFAULT_BASELINE_PATH),
  };
}

function printSummary(result) {
  const { inventory } = result;
  console.log([
    'core-structure-audit',
    `files=${inventory.totalFiles}`,
    `source=${inventory.sourceFiles}`,
    `authored-leaves=${inventory.authoredLeafModules}`,
    `indexes=${inventory.productionIndexes}`,
    `barrels=${inventory.barrels}`,
    `findings=${result.findings.length}`,
  ].join(' | '));
  for (const [rule, count] of Object.entries(inventory.findingsByRule)) {
    console.log(`  ${rule}: ${count}`);
  }
}

function runCli() {
  const options = parseCliArguments(process.argv.slice(2));
  const result = auditCoreStructure(options);
  if (options.mode === 'write-baseline') {
    const baseline = createStructureBaseline(result);
    writeFileSync(options.baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
    printSummary(result);
    console.log(`baseline written: ${options.baselinePath}`);
    return;
  }
  if (options.mode === 'report') {
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    printSummary(result);
    const limit = Number.isFinite(options.details) ? Math.max(0, options.details) : 20;
    for (const entry of result.findings.slice(0, limit)) {
      console.log(`  [${entry.rule}] ${entry.path} — ${entry.message}`);
    }
    if (result.findings.length > limit) {
      console.log(`  ... ${result.findings.length - limit} more; use --json for the complete inventory.`);
    }
    return;
  }
  if (!existsSync(options.baselinePath)) {
    throw new Error(`missing core structure baseline: ${options.baselinePath}`);
  }
  const baseline = JSON.parse(readFileSync(options.baselinePath, 'utf8'));
  const comparison = compareStructureBaseline(result, baseline);
  printSummary(result);
  if (comparison.added.length > 0) {
    console.error(`core-structure-audit: ${comparison.added.length} new finding(s):`);
    for (const id of comparison.added.slice(0, options.details)) console.error(`  + ${id}`);
    if (comparison.added.length > options.details) {
      console.error(`  ... ${comparison.added.length - options.details} more`);
    }
    process.exitCode = 1;
    return;
  }
  if (comparison.resolved.length > 0) {
    console.log(`ratchet opportunity: ${comparison.resolved.length} finding(s) resolved; rewrite the baseline after review.`);
  }
  console.log('core-structure-audit: passed (no new structural debt).');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(SCRIPT_PATH)) {
  runCli();
}
