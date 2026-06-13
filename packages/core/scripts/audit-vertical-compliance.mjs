#!/usr/bin/env node

/**
 * audit-vertical-compliance.mjs
 *
 * World-class architecture compliance checks:
 *   Rule 1: vertical/manifest.ts must exist if vertical/ dir exists
 *   Rule 2: No shell imports from old locations outside compat layers
 *   Rule 3: Route page files should import from @/features/ not @/surfaces/
 *   Rule 4: No new shell/page-chrome/workspace code in _shared
 *   Rule 5: Recipes must have at least one runtime consumer
 *   Rule 6: No hardcoded shell geometry outside vertical/
 *   Rule 7: Permanent roots only (app, vertical, features, core, ui, styles, worker, main, preload)
 *   Rule 9: Permanent roots may only import explicit components/ exceptions
 *
 * Source of truth: world-class-app-architecture/00-final-decision.md
 *
 * Usage:
 *   node scripts/audit-vertical-compliance.mjs --app-dir /path/to/app/src
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const appDirIdx = args.indexOf('--app-dir');
if (appDirIdx === -1 || !args[appDirIdx + 1]) {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = resolve(scriptDir, '../../../..');
  const appDirs = readdirSync(repoRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('app-'))
    .map((entry) => join(repoRoot, entry.name, 'src'))
    .filter((srcPath) => existsSync(srcPath) && statSync(srcPath).isDirectory())
    .sort();

  if (appDirs.length === 0) {
    console.error('Usage: node audit-vertical-compliance.mjs --app-dir <path-to-src>');
    console.error('No sibling app-* src directories were found for default auditing.');
    process.exit(2);
  }

  let failed = false;
  for (const appDir of appDirs) {
    console.log(`vertical-compliance: auditing ${relative(repoRoot, appDir)}`);
    const result = spawnSync(
      process.execPath,
      [fileURLToPath(import.meta.url), '--app-dir', appDir],
      { stdio: 'inherit' },
    );
    if (result.status !== 0) {
      failed = true;
    }
  }

  process.exit(failed ? 1 : 0);
}
const srcDir = resolve(args[appDirIdx + 1]);
const appName = basename(resolve(srcDir, '..'));

if (!existsSync(srcDir)) {
  console.error(`Directory not found: ${srcDir}`);
  process.exit(2);
}

const violations = [];

// ---------------------------------------------------------------------------
// Rule 1: vertical/manifest.ts must exist when vertical/ directory exists
// ---------------------------------------------------------------------------
const verticalDir = join(srcDir, 'vertical');
if (existsSync(verticalDir) && statSync(verticalDir).isDirectory()) {
  const hasManifest =
    existsSync(join(verticalDir, 'manifest.ts')) ||
    existsSync(join(verticalDir, 'manifest.tsx'));
  if (!hasManifest) {
    violations.push({
      rule: 1,
      file: join(verticalDir, 'manifest.ts'),
      message: 'vertical/ directory exists but manifest.ts is missing',
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function walk(dir, filter) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      results.push(...walk(full, filter));
    } else if (filter(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const isTsFile = (n) => /\.(ts|tsx)$/.test(n) && !n.endsWith('.d.ts');

// ---------------------------------------------------------------------------
// Rule 2: No shell imports from legacy locations outside _shared and vertical/
// Covers the known legacy shell import paths across apps:
//   - @/components/_shared/layouts/app-layout (platform)
//   - @/components/_shared/layout (evnto)
//   - @/components/layout (bithire)
// ---------------------------------------------------------------------------
const shellImportPatterns = [
  /from\s+['"]@\/components\/_shared\/layout(?:s)?\/app-layout/,
  /from\s+['"]@\/components\/_shared\/layout(?:\/|['"])/,
  /from\s+['"]@\/components\/layout(?:\/|['"])/,
];

const allTsFiles = walk(srcDir, isTsFile);
for (const file of allTsFiles) {
  const rel = relative(srcDir, file);
  // Allow compat re-exports inside _shared/ and vertical/
  if (
    rel.startsWith('components/_shared') ||
    rel.startsWith('vertical')
  ) continue;
  // Allow providers/ (they may legitimately import shell for wrapping)
  if (rel.startsWith('providers')) continue;
  const content = readFileSync(file, 'utf8');
  for (const re of shellImportPatterns) {
    if (re.test(content)) {
      violations.push({
        rule: 2,
        file,
        message: 'Imports shell from old location instead of @/vertical/shell',
      });
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 3: Dashboard route page files should import from @/features/
// ---------------------------------------------------------------------------
const dashboardDir = join(srcDir, 'app', '(dashboard)');
if (existsSync(dashboardDir)) {
  const pageFiles = walk(dashboardDir, (n) => n === 'page.tsx' || n === 'page.ts');
  const surfaceDirectRe = /from\s+['"]@\/surfaces\//;
  const featuresRe = /from\s+['"]@\/features\//;

  for (const file of pageFiles) {
    const content = readFileSync(file, 'utf8');
    if (surfaceDirectRe.test(content) && !featuresRe.test(content)) {
      violations.push({
        rule: 3,
        file,
        message: 'Page imports directly from @/surfaces/ instead of @/features/',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 4: No new shell/page-chrome/workspace code in _shared
// ---------------------------------------------------------------------------
const sharedDir = join(srcDir, 'components', '_shared');
if (existsSync(sharedDir)) {
  const SHELL_PATTERNS = /\b(AppShell|AppLayout|ShellSidebar|ShellHeader|PageChrome|WorkspaceShell)\b/;
  const sharedFiles = walk(sharedDir, isTsFile);
  for (const file of sharedFiles) {
    const rel = relative(srcDir, file);
    // Skip known compat re-export files (they are thin shims)
    const content = readFileSync(file, 'utf8');
    const isCompatReExport = content.includes('@/vertical/') && content.split('\n').length < 20;
    if (isCompatReExport) continue;
    // Skip barrel re-export files
    if (rel.endsWith('index.ts') && !content.includes('function ') && !content.includes('const ')) continue;
    // Check if file defines new shell/workspace abstractions (not just mentions in comments)
    // Strip comments before checking
    const codeOnly = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    if (SHELL_PATTERNS.test(codeOnly) && !rel.includes('layouts/app-layout')) {
      violations.push({
        rule: 4,
        file,
        message: 'New shell/page-chrome/workspace code in _shared — should be in vertical/ or DS',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 5: Recipes should have at least one consumer outside vertical/recipes/
// ---------------------------------------------------------------------------
if (existsSync(join(srcDir, 'vertical', 'recipes'))) {
  const recipeFiles = walk(join(srcDir, 'vertical', 'recipes'), isTsFile);
  for (const recipeFile of recipeFiles) {
    const recipeName = relative(srcDir, recipeFile);
    if (recipeName.endsWith('index.ts')) continue;
    const content = readFileSync(recipeFile, 'utf8');
    // Extract exported const names
    const exportMatches = content.matchAll(/export\s+const\s+(\w+)/g);
    for (const match of exportMatches) {
      const constName = match[1];
      // Search for this name in files outside vertical/recipes/
      let found = false;
      for (const file of allTsFiles) {
        const rel = relative(srcDir, file);
        if (rel.startsWith('vertical/recipes')) continue;
        if (rel.startsWith('vertical/index.ts')) continue; // barrel
        const fileContent = readFileSync(file, 'utf8');
        if (fileContent.includes(constName)) {
          found = true;
          break;
        }
      }
      if (!found) {
        violations.push({
          rule: 5,
          file: recipeFile,
          message: `Recipe "${constName}" has no consumer outside vertical/recipes/`,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 6: Detect inline shell geometry bypasses outside vertical/shell
// ---------------------------------------------------------------------------
const SHELL_GEOMETRY_RE = /(?:sidebarWidth|sidebarCollapsedWidth|headerHeight)\s*[:=]\s*\d+/;
const FIXED_SIDEBAR_RE = /position\s*:\s*['"]?fixed['"]?.*(?:left|right)\s*:\s*0/;
for (const file of allTsFiles) {
  const rel = relative(srcDir, file);
  // Allow vertical/shell, vertical/profile, _shared compat, layout, and ui/layout
  if (
    rel.startsWith('vertical/') ||
    rel.startsWith('components/_shared/layouts') ||
    rel.startsWith('components/_shared/layout') ||
    rel.startsWith('ui/layout') ||
    rel.includes('node_modules')
  ) continue;
  const content = readFileSync(file, 'utf8');
  // Check for hardcoded shell metrics outside the vertical layer
  // Exclude DS surface config contexts (sidebarWidth in createDetailSurfaceConfig is a panel width, not shell)
  if (SHELL_GEOMETRY_RE.test(content) && !content.includes('createDetailSurfaceConfig') && !content.includes('SurfaceConfig')) {
    violations.push({
      rule: 6,
      file,
      message: 'Hardcoded shell geometry (sidebarWidth/headerHeight) outside vertical/ — use PLATFORM_PROFILE or SHELL_DEFAULTS',
    });
  }
}

// ---------------------------------------------------------------------------
// Rule 7: Only permanent roots allowed (app, vertical, features, core, ui, styles, worker, main, preload)
// Transitional roots (surfaces, actions, components, constants, hooks, providers,
// stores, types, contexts, config) are flagged for awareness but not as hard errors.
// ---------------------------------------------------------------------------
const PERMANENT_ROOTS = new Set([
  'app',
  'vertical',
  'features',
  'core',
  'ui',
  'styles',
  'worker',
  'main',
  'preload',
]);
const TRANSITIONAL_ROOTS = new Set([
  'surfaces', 'actions', 'components', 'constants', 'hooks', 'providers',
  'stores', 'types', 'contexts', 'config', 'database', 'platform', 'lib',
]);
if (existsSync(srcDir)) {
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;
    if (name.startsWith('.') || name === 'node_modules' || name === 'content') continue;
    if (!PERMANENT_ROOTS.has(name) && !TRANSITIONAL_ROOTS.has(name)) {
      violations.push({
        rule: 7,
        file: join(srcDir, name),
        message: `Unknown root directory "${name}" — only permanent roots (${[...PERMANENT_ROOTS].join(', ')}) are allowed`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 8: Feature barrels must not fall back to @/surfaces/*
// ---------------------------------------------------------------------------
const featuresDir = join(srcDir, 'features');
if (existsSync(featuresDir)) {
  const featureBarrels = walk(featuresDir, (n) => n === 'index.ts');
  const surfaceFallbackRe = /from\s+['"]@\/surfaces\//;
  for (const file of featureBarrels) {
    const content = readFileSync(file, 'utf8');
    if (surfaceFallbackRe.test(content)) {
      violations.push({
        rule: 8,
        file,
        message: 'Feature barrel re-exports from @/surfaces/ — feature should own its screens physically',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Rule 9: Permanent roots may only import explicit components/ exceptions
// ---------------------------------------------------------------------------
const permanentRootPrefixes = ['app/', 'vertical/', 'features/', 'core/', 'ui/'];
const componentImportRe = /(?:from\s+['"]|import\(\s*['"])(@\/components\/[^'"]+)/g;
const marketingComponentRe = /^@\/components\/(landing|showroom|showcase|marketing)(\/|$)/;

function isInPermanentRoot(relPath) {
  return permanentRootPrefixes.some((prefix) => relPath.startsWith(prefix));
}

function isAllowedComponentImport(relPath, importPath) {
  if (relPath.startsWith('app/') && marketingComponentRe.test(importPath)) {
    return true;
  }

  if (relPath.startsWith('features/showcase-marketing/') && marketingComponentRe.test(importPath)) {
    return true;
  }

  if (relPath.startsWith('features/marketing/') && marketingComponentRe.test(importPath)) {
    return true;
  }

  return false;
}

for (const file of allTsFiles) {
  const rel = relative(srcDir, file);
  if (!isInPermanentRoot(rel)) continue;
  const content = readFileSync(file, 'utf8');
  for (const match of content.matchAll(componentImportRe)) {
    const importPath = match[1];
    if (!isAllowedComponentImport(rel, importPath)) {
      violations.push({
        rule: 9,
        file,
        message: `Permanent roots may not import "${importPath}" from components/ unless it is an explicit allowlisted exception`,
      });
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
if (violations.length === 0) {
  console.log('vertical-compliance: all checks passed');
  process.exit(0);
} else {
  console.log(`vertical-compliance: ${violations.length} violation(s) found\n`);
  for (const v of violations) {
    console.log(`  [Rule ${v.rule}] ${v.file}`);
    console.log(`    ${v.message}\n`);
  }
  process.exit(1);
}
