/**
 * exports-artifact-gate — every declared `exports` target must exist as a
 * build artifact.
 *
 * The public boundary is honest or the build fails. This gate walks
 * `package.json#exports`, resolves every condition target, and asserts the
 * file exists on disk. It must run AFTER a build (`dist/` is produced there);
 * it is wired post-build/prepack, next to `distfresh:check` — never into the
 * pre-build `gates:ci` run.
 *
 * Wildcard targets (e.g. `./icons/roles/*`) are satisfied when the resolved
 * prefix directory exists and contains at least one matching file.
 *
 * Usage: node scripts/exports-artifact-gate.mjs
 * Exit 0 = every target exists. Exit 1 = missing targets, each reported.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = join(HERE, '..');
const PKG = JSON.parse(readFileSync(join(CORE_ROOT, 'package.json'), 'utf8'));

function collectTargets(value, out = new Set()) {
  if (typeof value === 'string') {
    if (value.startsWith('./')) out.add(value);
    return out;
  }
  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectTargets(nested, out);
  }
  return out;
}

function wildcardSatisfied(pattern) {
  // The search root is the literal prefix BEFORE the wildcard, treated as a
  // directory itself — never its parent (a trailing-slash prefix like
  // `./dist/*.css` must search inside `dist/`, not the whole package).
  const [prefix] = pattern.split('*');
  const dir = join(CORE_ROOT, prefix);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return false;
  const suffix = pattern.slice(pattern.indexOf('*') + 1);
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current)) {
      if (entry === 'node_modules') continue;
      const path = join(current, entry);
      if (statSync(path).isDirectory()) {
        stack.push(path);
      } else if (entry.endsWith(suffix) || suffix === '') {
        return true;
      }
    }
  }
  return false;
}

const missing = [];
const targets = new Set();
for (const value of Object.values(PKG.exports ?? {})) {
  for (const target of collectTargets(value)) targets.add(target);
}

for (const target of targets) {
  if (target.includes('*')) {
    if (!wildcardSatisfied(target)) missing.push(target);
  } else if (!existsSync(join(CORE_ROOT, target))) {
    missing.push(target);
  }
}

if (missing.length > 0) {
  console.error(`exports-artifact-gate: FAIL — ${missing.length} declared target(s) missing:`);
  for (const target of missing.sort()) console.error(`  ${target}`);
  console.error('Run the build first; if a target is no longer produced, remove the export.');
  process.exit(1);
}

console.log(`exports-artifact-gate: OK — ${targets.size} declared targets exist.`);
