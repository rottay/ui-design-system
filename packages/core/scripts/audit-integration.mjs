#!/usr/bin/env node

/**
 * audit-integration.mjs -- Integration guardrail for the Rottay Design System.
 *
 * Detects:
 * 1. Premium chrome CSS variables emitted by the brand compiler that have
 *    no non-test reader in engines/, components/, or surfaces/.
 * 2. Duplicate local `useCountUp` implementations that should use the
 *    canonical `useSmoothCounter` from motion/hooks/.
 * 3. Debug console.log/console.debug calls in runtime/ core files.
 *
 * Exit 0 = all checks passed.
 * Exit 1 = violations found.
 *
 * Run: `node scripts/audit-integration.mjs`
 * Hook: `"lint:integration": "node scripts/audit-integration.mjs"`
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SRC_ROOT = resolve(__dirname, '../src');

const violations = [];

// ============================================================================
// Helpers
// ============================================================================

function walkFiles(dir, pattern) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
        results.push(...walkFiles(full, pattern));
      } else if (e.isFile() && pattern.test(e.name)) {
        results.push(full);
      }
    }
  } catch { /* dir might not exist */ }
  return results;
}

function readSafe(path) {
  try { return readFileSync(path, 'utf8'); } catch { return ''; }
}

function relPath(abs) {
  return abs.replace(SRC_ROOT + '/', '');
}

// ============================================================================
// Rule 1: Premium chrome vars without non-test consumers
// ============================================================================

// Read the brand compiler to extract all emitted CSS variable names
const compilerPath = join(SRC_ROOT, 'compilers/brand-theme/index.ts');
const compilerSource = readSafe(compilerPath);

// Extract all --ds-* variable names emitted by the compiler
const emittedVars = new Set();
const varPattern = /vars\['(--ds-[a-z0-9-]+)'\]/g;
let match;
while ((match = varPattern.exec(compilerSource)) !== null) {
  emittedVars.add(match[1]);
}

// Also catch the direct string literals like `--ds-sidebar-*`
const directVarPattern = /['"`](--ds-(?:sidebar|layout|shell|page-shell|button-disabled|button-default|button-ghost|input-disabled|input-bg-disabled|input-color-disabled|input-border-disabled|table)[a-z0-9-]*)['"`]/g;
while ((match = directVarPattern.exec(compilerSource)) !== null) {
  emittedVars.add(match[1]);
}

// Known aliases: these vars duplicate a consumed var with a different naming
// convention. They exist for compatibility with component token files.
const KNOWN_ALIASES = new Set([
  '--ds-button-disabled-border-color', // alias for --ds-button-disabled-border
  '--ds-input-border-color-disabled',  // alias for --ds-input-border-disabled
]);

if (emittedVars.size > 0) {
  // Search for consumers in engines/, components/, surfaces/ (excluding test files)
  const consumerDirs = [
    join(SRC_ROOT, 'tokens/css/engines'),
    join(SRC_ROOT, 'components'),
    join(SRC_ROOT, 'tokens/css/runtime'),
    join(SRC_ROOT, 'tokens/css/foundation'),
  ];

  const consumerFiles = [];
  for (const dir of consumerDirs) {
    consumerFiles.push(...walkFiles(dir, /\.(css|tsx?)$/));
  }

  // Filter out test files
  const nonTestConsumers = consumerFiles.filter(
    (f) => !f.includes('.test.') && !f.includes('.spec.') && !f.includes('.stories.')
  );

  const allConsumerContent = nonTestConsumers.map((f) => readSafe(f)).join('\n');

  for (const varName of emittedVars) {
    if (KNOWN_ALIASES.has(varName)) continue;
    // Check if the var is consumed (referenced via var(--ds-...) or as a property name in CSS)
    if (!allConsumerContent.includes(varName)) {
      violations.push({
        rule: 'orphan-premium-var',
        path: relPath(compilerPath),
        message: `Premium var "${varName}" is emitted by the compiler but has no non-test consumer in engines/components/surfaces.`,
      });
    }
  }
}

// ============================================================================
// Rule 2: Duplicate local useCountUp implementations
// ============================================================================

const componentFiles = walkFiles(join(SRC_ROOT, 'components'), /\.tsx?$/);
for (const file of componentFiles) {
  if (file.includes('.test.') || file.includes('.spec.') || file.includes('.stories.')) continue;

  const content = readSafe(file);
  if (/function\s+useCountUp\s*\(/.test(content)) {
    // Check if it's the thin wrapper in StatsHeader (delegating to useSmoothCounter)
    if (content.includes('useSmoothCounter')) continue;

    violations.push({
      rule: 'duplicate-use-count-up',
      path: relPath(file),
      message: 'Local useCountUp implementation found. Use the canonical useSmoothCounter from motion/hooks/ instead.',
    });
  }
}

// ============================================================================
// Rule 3: Debug console logging in runtime core
// ============================================================================

const runtimeFiles = walkFiles(join(SRC_ROOT, 'runtime'), /\.tsx?$/);
for (const file of runtimeFiles) {
  if (file.includes('.test.') || file.includes('.spec.') || file.includes('.stories.')) continue;

  const content = readSafe(file);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip commented-out lines
    if (/^\s*\/\//.test(line)) continue;
    // Skip multi-line comment bodies
    if (/^\s*\*/.test(line)) continue;

    if (/console\.(log|debug)\s*\(/.test(line)) {
      // Allow NODE_ENV-gated dev-only logging (check preceding 5 lines)
      const context = lines.slice(Math.max(0, i - 5), i + 1).join('\n');
      if (/NODE_ENV\s*===?\s*['"]development['"]/.test(context)) continue;
      if (/process\.env\.NODE_ENV/.test(context)) continue;
      if (/__DEV__/.test(context)) continue;

      violations.push({
        rule: 'runtime-debug-log',
        path: `${relPath(file)}:${i + 1}`,
        message: `Debug logging found in runtime core. Remove or gate behind __DEV__/NODE_ENV check.`,
      });
    }
  }
}

// ============================================================================
// Rule 4: Stale "not yet wired" comments in contracts
// ============================================================================

const contractFiles = walkFiles(join(SRC_ROOT, 'contracts'), /\.ts$/);
for (const file of contractFiles) {
  const content = readSafe(file);
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/not yet wired|not yet implemented|declaration[- ]only/i.test(lines[i])) {
      violations.push({
        rule: 'stale-contract-comment',
        path: `${relPath(file)}:${i + 1}`,
        message: `Stale comment found: "${lines[i].trim()}". Update to reflect current implementation status.`,
      });
    }
  }
}

// ============================================================================
// Rule 5: Token surface consumption ratio
// ============================================================================
// For component token CSS files, count defined --ds-{name}-* vars.
// For the corresponding modern engine file, count references.
// Flag if a component has >15 defined tokens but the modern engine references <3.

const COMPONENT_TOKEN_DIR = join(SRC_ROOT, 'tokens', 'css', 'components');
const componentTokenFiles = walkFiles(COMPONENT_TOKEN_DIR, /\.css$/).filter(
  (f) => !f.endsWith('index.css')
);

for (const tokenFile of componentTokenFiles) {
  const tokenContent = readSafe(tokenFile);
  if (!tokenContent) continue;

  // Derive the component name from the CSS filename (e.g. button.css -> button)
  const baseName = tokenFile.split('/').pop().replace('.css', '');
  const tokenPrefix = `--ds-${baseName}-`;

  // Count defined vars (lines that declare --ds-{name}-* inside :root)
  const definedMatches = tokenContent.match(new RegExp(tokenPrefix, 'g'));
  const definedCount = definedMatches ? definedMatches.length : 0;

  if (definedCount <= 15) continue;

  // Find the corresponding modern engine file.
  // Component names are PascalCase in the file system; try common mappings.
  const pascalName = baseName.charAt(0).toUpperCase() + baseName.slice(1);

  // Search across all primitive categories for the modern engine
  const primitiveDirs = ['display', 'inputs', 'feedback', 'layout', 'navigation', 'overlay'];
  let modernContent = '';
  let modernPath = '';
  for (const category of primitiveDirs) {
    const candidate = join(SRC_ROOT, 'components', 'primitives', category, pascalName, 'engines', 'modern.tsx');
    const content = readSafe(candidate);
    if (content) {
      modernContent = content;
      modernPath = candidate;
      break;
    }
  }

  if (!modernContent) continue; // No modern engine found -- skip silently

  const refMatches = modernContent.match(new RegExp(tokenPrefix, 'g'));
  const refCount = refMatches ? refMatches.length : 0;

  if (refCount < 3) {
    violations.push({
      rule: 'token-consumption-ratio',
      path: relPath(modernPath),
      message: `Component "${baseName}" defines ${definedCount} ${tokenPrefix}* tokens but the modern engine only references ${refCount}. Expected >= 3 references.`,
    });
  }
}

// ============================================================================
// Report
// ============================================================================

if (violations.length === 0) {
  console.log('audit-integration: all checks passed.');
  process.exit(0);
} else {
  console.error(`audit-integration: ${violations.length} violation(s) found:\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.path}`);
    console.error(`    ${v.message}\n`);
  }
  process.exit(1);
}
