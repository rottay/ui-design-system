#!/usr/bin/env node

/**
 * Enforces naming, folder/index, and ownership rules.
 * for the DS component tree and key subsystem boundaries.
 *
 * Fails (exit 1) if any of the following violations are found:
 *
 * 1. FORBIDDEN PREFIXES: folders matching `premium-*`, `surface-*`
 *    (outside surfaces/), or `workspace-*` at any depth under
 *    primitives/, patterns/, structures/, or surfaces/.
 *
 * 2. REPEATED PARENT-CHILD: a subfolder whose name starts with its
 *    parent's name (e.g., `form/form-header`, `dashboard/dashboard-*`).
 *
 * 3. PUBLIC-ROOT SUPPORT FILES: `.ts`/`.tsx` files other than `index.ts`
 *    or `index.tsx` sitting directly inside a category root (patterns/,
 *    structures/, surfaces/). Compat shims are allowed if they are <= 5
 *    lines (one re-export + comment).
 *
 * Run through the `lint:folders` package command.
 */

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
// EXCEPCIÓN DECLARADA (F0.5 lote C): este gate NO usa el helper repo-root a
// propósito — su self-test lo copia como archivo único a un tmpdir pelado, sin
// libraries/ al lado. Los 2 sitios a mano (`../../../../../src/components` aquí y `../../../../../src`
// en la regla 4) deben seguir resolviendo por profundidad relativa. No migrar.
const COMPONENTS_ROOT = resolve(__dirname, '../../../../../src/components');

const CATEGORY_ROOTS = [
  { category: 'primitives', relativeRoot: 'primitives' },
  { category: 'patterns', relativeRoot: 'patterns' },
  { category: 'structures', relativeRoot: 'structures' },
  { category: 'surfaces', relativeRoot: 'surfaces' },
];
const FORBIDDEN_PREFIXES = ['premium-', 'workspace-'];
const SURFACE_PREFIX_OUTSIDE_SURFACES = 'surface-';
const SHIM_MAX_LINES = 5;

// Exact-path exceptions to Rule 1 (forbidden prefixes) ONLY. This set never
// governs Rule 2 (repeated parent-child) — see ALLOWED_REPEATED_PARENT.
//
// Membership is tested with exact `Set.has(qualifiedPath)`: no wildcard, no
// prefix match, no whole-category escape hatch. A listed owner is exempted for
// itself alone — the walk still recurses into it, so a forbidden-prefix child
// under an allowed owner stays red.
//
// Each entry is the full `category/.../folder-name` path plus a reason.
const ALLOWED_FORBIDDEN_PREFIX_PATHS = new Set([
  // workspace-switcher was not in the audit's D rename target list.
  // Now lives inside patterns/navigation/ after the TR-E regroup.
  'patterns/navigation/workspace-switcher',
  // The one lifecycle-state family (CLAUDE.md Wave 5): `SurfaceLoadingSkeleton`,
  // `SurfaceEmptyState`, `SurfaceErrorState`, `SurfaceStaleBanner`,
  // `SurfaceOfflineBanner`, `SurfaceErrorBoundary`. "surface-" names the surface
  // whose lifecycle it renders, not a misplaced surfaces/ owner.
  'structures/feedback/surface-lifecycle',
  // Page chrome accompanying a surface; classified structure/shell per the
  // canonical family taxonomy, so it cannot move under surfaces/.
  'structures/shell/surface-chrome',
  // The workspace layout shell — structure/shell/*, named for the workspace
  // page-structure role it fills.
  'structures/shell/workspace-shell',
]);

// Exact-path exceptions to Rule 2 (repeated parent-child) ONLY. Disjoint from
// ALLOWED_FORBIDDEN_PREFIX_PATHS; also exact `Set.has`, no prefix matching.
// The `structures/record/record-*` owners are deliberately NOT listed: they are
// live debt and must stay red until they are renamed.
const ALLOWED_REPEATED_PARENT = new Set([
  // `data-table` is a concrete control name, not a duplicated owner such as
  // `dashboard/dashboard-insights` or `record/record`.
  'patterns/data/data-table',
]);

// Files at category root that are NOT support files even though they are
// not index.ts. Story files and test files belong at category root for
// Storybook/vitest discovery.
const ROOT_FILE_EXEMPT_PATTERNS = [
  /\.stories\.tsx?$/,
  /\.test\.tsx?$/,
  /\.spec\.tsx?$/,
];

const violations = [];

function walkDirs(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'));
}

// Rule 1: Forbidden prefixes (recursive — checks the entire subtree, not
// just the first level under each category root)
function checkForbiddenPrefixes(dir, relPath, relativeRoot, category) {
  let dirs;
  try { dirs = walkDirs(dir); } catch { return; }

  for (const d of dirs) {
    const qualifiedPath = relPath ? `${relPath}/${d.name}` : `${relativeRoot}/${d.name}`;
    if (ALLOWED_FORBIDDEN_PREFIX_PATHS.has(qualifiedPath)) {
      // Still recurse into allowed exceptions — the exception covers
      // the folder itself, not its children.
      checkForbiddenPrefixes(join(dir, d.name), qualifiedPath, relativeRoot, category);
      continue;
    }

    for (const prefix of FORBIDDEN_PREFIXES) {
      if (d.name.startsWith(prefix)) {
        violations.push({
          rule: 'forbidden-prefix',
          path: qualifiedPath,
          message: `Folder name starts with forbidden prefix "${prefix}". Use a declarative, purpose-describing name instead.`,
        });
      }
    }
    if (category !== 'surfaces' && d.name.startsWith(SURFACE_PREFIX_OUTSIDE_SURFACES)) {
      violations.push({
        rule: 'forbidden-prefix',
        path: qualifiedPath,
        message: `Folder name starts with "surface-" but is not inside surfaces/. Move it or rename it.`,
      });
    }

    // Recurse into children
    checkForbiddenPrefixes(join(dir, d.name), qualifiedPath, relativeRoot, category);
  }
}
for (const { category, relativeRoot } of CATEGORY_ROOTS) {
  checkForbiddenPrefixes(join(COMPONENTS_ROOT, relativeRoot), '', relativeRoot, category);
}

// Rule 2: Repeated parent-child
function checkRepeatedParent(dir, parentName) {
  try {
    const dirs = walkDirs(dir);
    for (const d of dirs) {
      if (d.name.startsWith(parentName + '-') || d.name === parentName) {
        const qualifiedPath = dir.replace(COMPONENTS_ROOT + '/', '') + '/' + d.name;
        if (!ALLOWED_REPEATED_PARENT.has(qualifiedPath)) {
          violations.push({
            rule: 'repeated-parent-child',
            path: qualifiedPath,
            message: `Subfolder "${d.name}" repeats its parent name "${parentName}". Use a shorter child name (e.g., "${d.name.replace(parentName + '-', '')}" or "detail/" instead of "${parentName}-detail/").`,
          });
        }
      }
      // Recurse
      checkRepeatedParent(join(dir, d.name), d.name);
    }
  } catch { /* dir might not exist */ }
}
for (const { relativeRoot } of CATEGORY_ROOTS) {
  const catDir = join(COMPONENTS_ROOT, relativeRoot);
  try {
    const dirs = walkDirs(catDir);
    for (const d of dirs) {
      checkRepeatedParent(join(catDir, d.name), d.name);
    }
  } catch { /* category dir might not exist */ }
}

// Rule 3: Public-root support files
for (const { relativeRoot } of CATEGORY_ROOTS) {
  const catDir = join(COMPONENTS_ROOT, relativeRoot);
  try {
    const entries = readdirSync(catDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!/\.(ts|tsx)$/.test(e.name)) continue;
      if (e.name === 'index.ts' || e.name === 'index.tsx') continue;

      // Allow story and test files at category root (Storybook/vitest
      // discovery depends on glob matching, not barrel imports)
      if (ROOT_FILE_EXEMPT_PATTERNS.some((re) => re.test(e.name))) continue;

      // Allow small compat shims (re-export files <= SHIM_MAX_LINES)
      const content = readFileSync(join(catDir, e.name), 'utf8');
      const lines = content.split('\n').length;
      if (lines <= SHIM_MAX_LINES) continue;

      violations.push({
        rule: 'public-root-support-file',
        path: `${relativeRoot}/${e.name}`,
        message: `File "${e.name}" sits at the category root and has ${lines} lines. Support files should live inside _internal/ or _foundation/. If this is a compat shim, keep it under ${SHIM_MAX_LINES} lines.`,
      });
    }
  } catch { /* category dir might not exist */ }
}

// ── Rule 4: Owner-boundary enforcement (non-component subsystems) ──
// These rules ensure the ownership cleanup from Waves G2-G3 stays honest.

const SRC_ROOT = resolve(__dirname, '../../../../../src');
const PACKAGE_ROOT = resolve(SRC_ROOT, '..');
const SHOWROOM_SOURCE_ROOT = resolve(PACKAGE_ROOT, '../showroom/src');
const SHOWROOM_COMPONENTS_ROOT = resolve(PACKAGE_ROOT, '../showroom/src/components');

const DECLARATIVE_DIRECTORY_NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;
const OPAQUE_DIRECTORY_NAME =
  /^(?:coh|cra|gat|ck|kimi|f\d+[a-z]?|r\d+|v\d+|phase)(?:-|$)/iu;
const DIRECTORY_NAME_EXCEPTIONS = new Set([
  '__fixtures__',
  '__tests__',
  'fixtures',
  'tests',
]);
const NON_AUTHORED_TREES = new Set([
  'artifacts',
  'coverage',
  'dist',
  'evidence',
  'generated',
  'history',
  'node_modules',
  'test-artifacts',
]);

function walkDirectories(root, visit, relativeRoot = '') {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || NON_AUTHORED_TREES.has(entry.name)) continue;
    const rel = relativeRoot ? `${relativeRoot}/${entry.name}` : entry.name;
    visit(entry.name, rel);
    walkDirectories(join(root, entry.name), visit, rel);
  }
}

function walkFiles(root, visit, relativeRoot = '') {
  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (NON_AUTHORED_TREES.has(entry.name)) continue;
      const rel = relativeRoot ? `${relativeRoot}/${entry.name}` : entry.name;
      walkFiles(join(root, entry.name), visit, rel);
      continue;
    }
    const rel = relativeRoot ? `${relativeRoot}/${entry.name}` : entry.name;
    visit(entry.name, rel);
  }
}

// 4a. infrastructure/runtime/tenant/ must not have root-level .ts leaf files
//     except index.ts (personality presets live under
//     infrastructure/runtime/tenant/foundation/personality/presets/).
{
  const tenancyDir = join(SRC_ROOT, 'infrastructure/runtime/tenant');
  try {
    const entries = readdirSync(tenancyDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!/\.ts$/.test(e.name)) continue;
      if (e.name === 'index.ts') continue;
      violations.push({
        rule: 'tenancy-root-leaf',
        path: `infrastructure/runtime/tenant/${e.name}`,
        message: `Leaf file "${e.name}" should live in an owner folder under infrastructure/runtime/tenant/.`,
      });
    }
  } catch { /* dir might not exist */ }
}

// 4b. foundation/contracts/ root must only have owner folders, index.ts, and docs
{
  const contractsDir = join(SRC_ROOT, 'foundation', 'contracts');
  try {
    const entries = readdirSync(contractsDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) continue; // folders are fine (owner folders + _internal)
      if (e.name === 'index.ts' || e.name === 'README.md') continue;
      violations.push({
        rule: 'contracts-root-file',
        path: `foundation/contracts/${e.name}`,
        message: `File "${e.name}" should not sit in foundation/contracts/ root. Move it to an owned layer.`,
      });
    }
  } catch { /* dir might not exist */ }
}

// 4c. foundation/tokens/ts/presentation/brand-themes/ is the canonical authored source
{
  const brandThemesDir = join(SRC_ROOT, 'foundation/tokens/ts/presentation/brand-themes');
  try {
    statSync(brandThemesDir);
  } catch {
    violations.push({
      rule: 'brand-themes-missing',
      path: 'foundation/tokens/ts/presentation/brand-themes/',
      message: 'Canonical authored premium source directory is missing.',
    });
  }
}

// 4d. foundation/tokens/ts/ declares the local dependency layers.
{
  const tsDir = join(SRC_ROOT, 'foundation/tokens/ts');
  try {
    const entries = readdirSync(tsDir, { withFileTypes: true });
    const allowedTs = ['foundation', 'runtime', 'presentation', 'facade'];
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (e.name.startsWith('_')) continue;
      if (!allowedTs.includes(e.name)) {
        violations.push({
          rule: 'ts-undeclared-folder',
          path: `foundation/tokens/ts/${e.name}`,
          message: `Folder "${e.name}" is not a recognized token layer. Expected: ${allowedTs.join(', ')}.`,
        });
      }
    }
    const requiredOwners = [
      ['runtime', 'mirrors'],
      ['presentation', 'brand-themes'],
    ];
    for (const [layer, required] of requiredOwners) {
      const layerEntries = readdirSync(join(tsDir, layer), { withFileTypes: true });
      if (layerEntries.some((entry) => entry.isDirectory() && entry.name === required)) continue;
      violations.push({
        rule: `${required}-missing`,
        path: `foundation/tokens/ts/${layer}/${required}/`,
        message: `Required directory "${required}" is missing.`,
      });
    }
  } catch { /* dir might not exist */ }
}

// 4e. foundation/tokens/css/ declares the CSS dependency layers.
{
  const cssDir = join(SRC_ROOT, 'foundation/tokens/css');
  try {
    const entries = readdirSync(cssDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const allowed = ['foundation', 'runtime', 'presentation', 'facade'];
      if (!allowed.includes(e.name) && !e.name.startsWith('_')) {
        violations.push({
          rule: 'css-undeclared-folder',
          path: `foundation/tokens/css/${e.name}`,
          message: `Folder "${e.name}" is not a recognized CSS layer. Expected: ${allowed.join(', ')}.`,
        });
      }
    }
  } catch { /* dir might not exist */ }
}

// 4f. foundation/tokens/css/ root must not have stale CSS files (entrypoints live in entrypoints/)
{
  const cssDir = join(SRC_ROOT, 'foundation/tokens/css');
  try {
    const entries = readdirSync(cssDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!/\.css$/.test(e.name)) continue;
      violations.push({
        rule: 'css-root-file',
        path: `foundation/tokens/css/${e.name}`,
        message: `CSS file "${e.name}" should not sit at foundation/tokens/css/ root. Entrypoints go in facade/entrypoints/.`,
      });
    }
  } catch { /* dir might not exist */ }
}

// 5. Authored CSS is always a folder-owned index.
for (const [root, prefix] of [
  [SRC_ROOT, 'src'],
  [join(PACKAGE_ROOT, 'tests/fixtures'), 'tests/fixtures'],
  [join(PACKAGE_ROOT, '.storybook'), '.storybook'],
  [SHOWROOM_COMPONENTS_ROOT, 'showroom/src/components'],
]) {
  walkFiles(root, (name, rel) => {
    if (!name.endsWith('.css') || name === 'index.css') return;
    const packageRelative = `${prefix}/${rel}`;
    violations.push({
      rule: 'css-folder-index',
      path: packageRelative,
      message: `Authored CSS "${name}" must live at <owner>/index.css.`,
    });
  });
}

// 6. Durable authored trees use readable lowercase-kebab owner names.
for (const [root, prefix] of [
  [join(PACKAGE_ROOT, 'governance'), 'governance'],
  [join(SRC_ROOT, 'foundation/contracts'), 'src/foundation/contracts'],
  [join(PACKAGE_ROOT, 'docs'), 'docs'],
  [join(PACKAGE_ROOT, '.storybook/components'), '.storybook/components'],
  [SHOWROOM_COMPONENTS_ROOT, 'showroom/src/components'],
]) {
  walkDirectories(root, (name, rel) => {
    if (DIRECTORY_NAME_EXCEPTIONS.has(name)) return;
    if (DECLARATIVE_DIRECTORY_NAME.test(name) && !OPAQUE_DIRECTORY_NAME.test(name)) return;
    violations.push({
      rule: 'non-declarative-directory-name',
      path: `${prefix}/${rel}`,
      message: `Directory "${name}" must use a descriptive lowercase-kebab name, not an agent, wave, opaque, PascalCase, or underscore label.`,
    });
  });
}

// 7. Governance, contracts, current docs, and Showroom components express
// authored units as folder/index. Scripts remain under scripts-tree-gate;
// core src architecture remains under structure/index.mjs.
const INDEX_UNIT_PATTERN = /^index(?:\.d)?\.(?:css|json|mdx?|[cm]?[jt]sx?)$/u;
const DISCOVERY_FILE_PATTERN = /\.(?:test|spec|stories)\.(?:[cm]?[jt]sx?)$/u;
for (const [root, prefix, extensionPattern] of [
  [join(PACKAGE_ROOT, 'governance'), 'governance', /\.(?:json|mdx?|mjs|ts)$/u],
  [join(SRC_ROOT, 'foundation/contracts'), 'src/foundation/contracts', /\.(?:[cm]?[jt]sx?)$/u],
  [join(PACKAGE_ROOT, 'docs'), 'docs', /\.(?:mdx?|tsx?)$/u],
  [SHOWROOM_COMPONENTS_ROOT, 'showroom/src/components', /\.(?:css|[cm]?[jt]sx?)$/u],
]) {
  walkFiles(root, (name, rel) => {
    if (!extensionPattern.test(name) || INDEX_UNIT_PATTERN.test(name)) return;
    if (DISCOVERY_FILE_PATTERN.test(name)) return;
    violations.push({
      rule: 'authored-unit-folder-index',
      path: `${prefix}/${rel}`,
      message: `Authored unit "${name}" must live in a descriptive folder as index.<ext>.`,
    });
  });
}

// 8. Active Showroom routes and fixtures may describe a capability, but never
// a campaign, model, agent, wave, or numbered round. Next.js route groups and
// dynamic segments retain their framework syntax; this rule targets only the
// opaque vocabulary that previously produced r2-*, r6-* and similar owners.
walkDirectories(SHOWROOM_SOURCE_ROOT, (name, rel) => {
  if (!OPAQUE_DIRECTORY_NAME.test(name)) return;
  violations.push({
    rule: 'opaque-campaign-directory',
    path: `showroom/src/${rel}`,
    message: `Directory "${name}" names a campaign or numbered round. Name the capability or behavior the route owns.`,
  });
});

// Report
if (violations.length === 0) {
  console.log('folder-naming: all checks passed.');
  process.exit(0);
} else {
  console.error(`folder-naming: ${violations.length} violation(s) found:\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.path}`);
    console.error(`    ${v.message}\n`);
  }
  process.exit(1);
}
