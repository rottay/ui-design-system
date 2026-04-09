#!/usr/bin/env node

/**
 * lint-folder-index.mjs — Naming and folder/index enforcement for the DS
 * component tree.
 *
 * Fails (exit 1) if any of the following violations are found under
 * packages/core/src/components/:
 *
 * 1. FORBIDDEN PREFIXES: folders matching `premium-*`, `surface-*`
 *    (outside surfaces/), or `workspace-*` at any depth under
 *    primitives/, patterns/, chrome/, or surfaces/.
 *
 * 2. REPEATED PARENT-CHILD: a subfolder whose name starts with its
 *    parent's name (e.g., `form/form-header`, `dashboard/dashboard-*`).
 *
 * 3. PUBLIC-ROOT SUPPORT FILES: `.ts`/`.tsx` files other than `index.ts`
 *    or `index.tsx` sitting directly inside a category root (patterns/,
 *    chrome/, surfaces/). Compat shims are allowed if they are <= 5
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

const CATEGORY_ROOTS = ['primitives', 'patterns', 'page-structure', 'surfaces'];
const FORBIDDEN_PREFIXES = ['premium-', 'workspace-'];
const SURFACE_PREFIX_OUTSIDE_SURFACES = 'surface-';
const SHIM_MAX_LINES = 5;

// Known exceptions — families that still carry a forbidden prefix but
// were intentionally left as-is in the audit's Checkpoint D rename wave.
// Each entry: `category/folder-name`. Add a comment explaining why.
const ALLOWED_EXCEPTIONS = new Set([
  // workspace-switcher was not in the audit's D rename target list.
  // It is a small utility pattern (horizontal pill strip for switching
  // between workspaces) that may be renamed to `workspace-picker` or
  // similar in a future cleanup pass.
  'patterns/workspace-switcher',
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
        violations.push({
          rule: 'repeated-parent-child',
          path: dir.replace(COMPONENTS_ROOT + '/', '') + '/' + d.name,
          message: `Subfolder "${d.name}" repeats its parent name "${parentName}". Use a shorter child name (e.g., "${d.name.replace(parentName + '-', '')}" or "detail/" instead of "${parentName}-detail/").`,
        });
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
