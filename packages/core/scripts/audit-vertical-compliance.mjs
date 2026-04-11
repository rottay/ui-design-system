#!/usr/bin/env node

/**
 * audit-vertical-compliance.mjs
 *
 * Checks that apps follow the vertical/ architecture conventions:
 *   Rule 1: vertical/manifest.ts must exist if vertical/ dir exists
 *   Rule 2: No new shell imports from _shared outside _shared and vertical/
 *   Rule 3: Route page files should import from @/features/ not @/surfaces/
 *
 * Usage:
 *   node scripts/audit-vertical-compliance.mjs --app-dir /path/to/app/src
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const appDirIdx = args.indexOf('--app-dir');
if (appDirIdx === -1 || !args[appDirIdx + 1]) {
  console.error('Usage: node audit-vertical-compliance.mjs --app-dir <path-to-src>');
  process.exit(2);
}
const srcDir = resolve(args[appDirIdx + 1]);

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
// Rule 2: No shell imports from _shared outside _shared and vertical/
// ---------------------------------------------------------------------------
const sharedImportRe =
  /from\s+['"]@\/components\/_shared\/layout(?:s)?\/app-layout['"]/;

const allTsFiles = walk(srcDir, isTsFile);
for (const file of allTsFiles) {
  const rel = relative(srcDir, file);
  // Allow compat re-exports inside _shared/ and vertical/
  if (rel.startsWith('components/_shared') || rel.startsWith('vertical')) continue;
  const content = readFileSync(file, 'utf8');
  if (sharedImportRe.test(content)) {
    violations.push({
      rule: 2,
      file,
      message: 'Imports shell from _shared instead of @/vertical/shell',
    });
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
