/**
 * ds-underscore-prefix-gate — the `--ds_` experimentation space never ships.
 *
 * The canon is `--ds-` (governed, tenant-reachable). The `--ds_` prefix is the
 * free experimentation space: anything may be tried there during development,
 * and nothing there may ever reach a shipped artifact. This gate scans every
 * CSS payload the package ships or sources one from (the committed vertical
 * bundles in `styles/` and every authored sheet under `src/`) and fails on the
 * first `--ds_` occurrence. Zero uses exist today; this keeps it that way.
 *
 * Usage: node scripts/tokens/ds-underscore-prefix-gate/index.mjs
 * Exit 0 = clean. Exit 1 = one or more `--ds_` occurrences, each reported.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

function* walkCss(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      yield* walkCss(path);
    } else if (entry.endsWith('.css')) {
      yield path;
    }
  }
}

const ROOTS = [join(CORE_ROOT, 'src'), join(CORE_ROOT, 'styles')];
const PATTERN = /--ds_[a-zA-Z0-9-]*/g;

const findings = [];
for (const root of ROOTS) {
  let files;
  try {
    files = [...walkCss(root)];
  } catch {
    continue;
  }
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      if (PATTERN.test(line)) {
        findings.push(`${relative(CORE_ROOT, file)}:${index + 1}: ${line.trim()}`);
      }
      PATTERN.lastIndex = 0;
    });
  }
}

if (findings.length > 0) {
  console.error('ds-underscore-prefix-gate: FAIL — `--ds_` reached shipped CSS:');
  for (const finding of findings) console.error(`  ${finding}`);
  process.exit(1);
}

console.log('ds-underscore-prefix-gate: OK — no `--ds_` in shipped or authored CSS.');
