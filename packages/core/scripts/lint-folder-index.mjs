#!/usr/bin/env node

/**
 * lint-folder-index.mjs — Naming, folder/index, and ownership enforcement
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
 * Run: `node scripts/lint-folder-index.mjs`
 * Hook into package.json: `"lint:folders": "node scripts/lint-folder-index.mjs"`
 */

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const COMPONENTS_ROOT = resolve(__dirname, '../src/components');

const CATEGORY_ROOTS = ['primitives', 'patterns', 'structures', 'surfaces'];
const FORBIDDEN_PREFIXES = ['premium-', 'workspace-'];
const SURFACE_PREFIX_OUTSIDE_SURFACES = 'surface-';
const SHIM_MAX_LINES = 5;

// Known exceptions — families that still carry a forbidden prefix but
// were intentionally left as-is in the audit's Checkpoint D rename wave.
// Each entry: `category/folder-name`. Add a comment explaining why.
const ALLOWED_EXCEPTIONS = new Set([
  // workspace-switcher was not in the audit's D rename target list.
  // Now lives inside patterns/navigation/ after the TR-E regroup.
  'patterns/navigation/workspace-switcher',
]);

// Known exceptions for the repeated-parent-child rule.
// These were created by taxonomy grouping. Codex should decide whether
// to rename them before they can be removed from here.
const ALLOWED_REPEATED_PARENT = new Set([
  'structures/dashboard/dashboard-insights',
  'structures/record/record',
  // data-table inside data/ group repeats the prefix
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
function checkForbiddenPrefixes(dir, relPath, cat) {
  let dirs;
  try { dirs = walkDirs(dir); } catch { return; }

  for (const d of dirs) {
    const qualifiedPath = relPath ? `${relPath}/${d.name}` : `${cat}/${d.name}`;
    if (ALLOWED_EXCEPTIONS.has(qualifiedPath)) {
      // Still recurse into allowed exceptions — the exception covers
      // the folder itself, not its children.
      checkForbiddenPrefixes(join(dir, d.name), qualifiedPath, cat);
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
    if (cat !== 'surfaces' && d.name.startsWith(SURFACE_PREFIX_OUTSIDE_SURFACES)) {
      violations.push({
        rule: 'forbidden-prefix',
        path: qualifiedPath,
        message: `Folder name starts with "surface-" but is not inside surfaces/. Move it or rename it.`,
      });
    }

    // Recurse into children
    checkForbiddenPrefixes(join(dir, d.name), qualifiedPath, cat);
  }
}
for (const cat of CATEGORY_ROOTS) {
  checkForbiddenPrefixes(join(COMPONENTS_ROOT, cat), '', cat);
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
for (const cat of CATEGORY_ROOTS) {
  const catDir = join(COMPONENTS_ROOT, cat);
  try {
    const dirs = walkDirs(catDir);
    for (const d of dirs) {
      checkRepeatedParent(join(catDir, d.name), d.name);
    }
  } catch { /* category dir might not exist */ }
}

// Rule 3: Public-root support files
for (const cat of CATEGORY_ROOTS) {
  const catDir = join(COMPONENTS_ROOT, cat);
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
        path: `${cat}/${e.name}`,
        message: `File "${e.name}" sits at the category root and has ${lines} lines. Support files should live inside _internal/ or _foundation/. If this is a compat shim, keep it under ${SHIM_MAX_LINES} lines.`,
      });
    }
  } catch { /* category dir might not exist */ }
}

// ── Rule 4: Owner-boundary enforcement (non-component subsystems) ──
// These rules ensure the ownership cleanup from Waves G2-G3 stays honest.

const SRC_ROOT = resolve(__dirname, '../src');

// 4a. runtime/tenant/ must not have root-level .ts leaf files except index.ts
//     (personality-presets.ts was moved to personality/ in G3)
{
  const tenancyDir = join(SRC_ROOT, 'runtime/tenant');
  try {
    const entries = readdirSync(tenancyDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!/\.ts$/.test(e.name)) continue;
      if (e.name === 'index.ts') continue;
      violations.push({
        rule: 'tenancy-root-leaf',
        path: `runtime/tenant/${e.name}`,
        message: `Leaf file "${e.name}" should live in an owner folder under runtime/tenant/.`,
      });
    }
  } catch { /* dir might not exist */ }
}

// 4b. contracts/ root must only have owner folders, index.ts, and docs
{
  const contractsDir = join(SRC_ROOT, 'contracts');
  try {
    const entries = readdirSync(contractsDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) continue; // folders are fine (owner folders + _internal)
      if (e.name === 'index.ts' || e.name === 'README.md') continue;
      violations.push({
        rule: 'contracts-root-file',
        path: `contracts/${e.name}`,
        message: `File "${e.name}" should not sit in contracts/ root. Move to _internal/ or a subsystem folder.`,
      });
    }
  } catch { /* dir might not exist */ }
}

// 4c. tokens/ts/brand-themes/ must exist as the canonical authored source
{
  const brandThemesDir = join(SRC_ROOT, 'tokens/ts/brand-themes');
  try {
    statSync(brandThemesDir);
  } catch {
    violations.push({
      rule: 'brand-themes-missing',
      path: 'tokens/ts/brand-themes/',
      message: 'Canonical authored premium source directory is missing.',
    });
  }
}

// 4d. tokens/ts/ must use declarative folder names (I1 taxonomy)
//     Allowed: base, components, brand-themes, mirrors + internal prefixes
{
  const tsDir = join(SRC_ROOT, 'tokens/ts');
  try {
    const entries = readdirSync(tsDir, { withFileTypes: true });
    const allowedTs = ['base', 'components', 'brand-themes', 'mirrors'];
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (e.name.startsWith('_')) continue;
      if (!allowedTs.includes(e.name)) {
        violations.push({
          rule: 'ts-undeclared-folder',
          path: `tokens/ts/${e.name}`,
          message: `Folder "${e.name}" is not a recognized role folder. Expected: ${allowedTs.join(', ')}. If this was "tenants/", it was renamed to "mirrors/" in I1.`,
        });
      }
    }
    // brand-themes and mirrors must both exist
    for (const required of ['brand-themes', 'mirrors']) {
      if (!entries.some((e) => e.isDirectory() && e.name === required)) {
        violations.push({
          rule: `${required}-missing`,
          path: `tokens/ts/${required}/`,
          message: `Required directory "${required}" is missing.`,
        });
      }
    }
  } catch { /* dir might not exist */ }
}

// 4e. tokens/css/ must use declarative folder names (I1 taxonomy)
{
  const cssDir = join(SRC_ROOT, 'tokens/css');
  try {
    const entries = readdirSync(cssDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      // These are the allowed declarative folder names after I1
      const allowed = ['artifacts', 'legacy', 'foundation', 'entrypoints', 'components', 'engines'];
      if (!allowed.includes(e.name) && !e.name.startsWith('_')) {
        violations.push({
          rule: 'css-undeclared-folder',
          path: `tokens/css/${e.name}`,
          message: `Folder "${e.name}" is not a recognized role folder. Expected: ${allowed.join(', ')}.`,
        });
      }
    }
  } catch { /* dir might not exist */ }
}

// 4f. tokens/css/ root must not have stale CSS files (entrypoints live in entrypoints/)
{
  const cssDir = join(SRC_ROOT, 'tokens/css');
  try {
    const entries = readdirSync(cssDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!/\.css$/.test(e.name)) continue;
      violations.push({
        rule: 'css-root-file',
        path: `tokens/css/${e.name}`,
        message: `CSS file "${e.name}" should not sit at tokens/css/ root. Entrypoints go in entrypoints/, foundation in foundation/.`,
      });
    }
  } catch { /* dir might not exist */ }
}

// Report
if (violations.length === 0) {
  console.log('lint-folder-index: all checks passed.');
  process.exit(0);
} else {
  console.error(`lint-folder-index: ${violations.length} violation(s) found:\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.path}`);
    console.error(`    ${v.message}\n`);
  }
  process.exit(1);
}
