#!/usr/bin/env node

/**
 * component-runtime-boundary-gate — a component reaches the browser through
 * the declared runtime, never around it.
 *
 * WHY THIS GATE EXISTS (F-56). `collection-workspace` read and wrote
 * `localStorage` under a key derived from the surface TITLE, navigated by
 * assigning `window.location.href`, and toggled its own column menu by
 * dispatching a `CustomEvent` on `window`. Each of those is implicit global
 * state inside a config-driven surface: two workspaces that happen to share a
 * title share a preference record, a surface decides a navigation the app
 * never asked for, and a keyboard shortcut travels through a channel with no
 * owner and no types. None of it is visible in a prop, a contract or a test of
 * the consuming app.
 *
 * THE LAW. `src/components/surfaces` and `src/components/structures` may not
 * name `window.location`, `localStorage` or `CustomEvent`. Those capabilities
 * belong to the DECLARED RUNTIME — `src/infrastructure/runtime/**`, which owns
 * `useLayoutPreference` for persistence, `useRouterState` for URL state, and
 * the interaction owners for keyboard — and a component reaches them by
 * calling a hook, so the dependency is visible in the render tree instead of
 * hiding in a global.
 *
 * DECLARED RUNTIME, LITERALLY. The runtime is a path list this file owns, not
 * an adjective a component can claim about itself. A component that needs a
 * new browser capability adds it to the runtime and calls it; it does not get
 * added here.
 *
 * There is NO baseline. A finding is a failure.
 *
 * --check (default)  exit 1 listing every occurrence with path:line.
 * --drill            scan a planted corpus carrying one occurrence of each
 *                    forbidden name and require all three to be found.
 */

import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = findPackageRoot(HERE);

/** The two component tiers F-56 measured, in the order the closure grep names them. */
export const GOVERNED_ROOTS = Object.freeze([
  'src/components/surfaces',
  'src/components/structures',
]);

/**
 * The owners allowed to hold these capabilities. A path here is a promise that
 * the capability is wrapped in a typed, testable hook — not a licence.
 */
export const DECLARED_RUNTIME_ROOTS = Object.freeze([
  'src/infrastructure/runtime',
]);

/** The three names F-56's closure criterion counts. */
export const FORBIDDEN_NAMES = Object.freeze([
  'window.location',
  'localStorage',
  'CustomEvent',
]);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function extensionOf(name) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot);
}

function walk(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') continue;
        stack.push(full);
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(extensionOf(entry.name))) {
        files.push(full);
      }
    }
  }
  return files.sort();
}

/** Every forbidden-name occurrence under `root`, as `{ file, line, name, text }`. */
export function scanRuntimeBoundary(root, base = root) {
  const findings = [];
  for (const file of walk(root)) {
    let source;
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    if (!FORBIDDEN_NAMES.some((name) => source.includes(name))) continue;
    source.split('\n').forEach((text, index) => {
      for (const name of FORBIDDEN_NAMES) {
        if (text.includes(name)) {
          findings.push({
            file: relative(base, file).replaceAll('\\', '/'),
            line: index + 1,
            name,
            text: text.trim(),
          });
        }
      }
    });
  }
  return findings;
}

function plantDrillCorpus() {
  const corpus = mkdtempSync(join(tmpdir(), 'ds-runtime-boundary-drill-'));
  writeFileSync(join(corpus, 'clean.tsx'), 'export const Clean = () => 1;\n', 'utf8');
  writeFileSync(
    join(corpus, 'planted.tsx'),
    [
      'export function Planted() {',
      '  window.location.href = "/elsewhere";',
      '  window.localStorage.setItem("k", "v");',
      '  window.dispatchEvent(new CustomEvent("ds:toggle"));',
      '}',
      '',
    ].join('\n'),
    'utf8',
  );
  return corpus;
}

function main(argv) {
  if (argv.includes('--drill')) {
    const corpus = plantDrillCorpus();
    try {
      const findings = scanRuntimeBoundary(corpus, corpus);
      const found = new Set(findings.map((finding) => finding.name));
      const missed = FORBIDDEN_NAMES.filter((name) => !found.has(name));
      if (missed.length > 0) {
        console.error(`component-runtime-boundary-gate DRILL FAILED — the planted corpus was reported clean for: ${missed.join(', ')}`);
        return 1;
      }
      console.log(`component-runtime-boundary-gate DRILL OK — all ${FORBIDDEN_NAMES.length} planted names were reported.`);
      return 0;
    } finally {
      rmSync(corpus, { recursive: true, force: true });
    }
  }

  const findings = GOVERNED_ROOTS.flatMap(
    (root) => scanRuntimeBoundary(resolve(PACKAGE_ROOT, root), PACKAGE_ROOT),
  );

  if (findings.length === 0) {
    console.log(
      `component-runtime-boundary-gate OK — 0 occurrences of ${FORBIDDEN_NAMES.join(' / ')} under ${GOVERNED_ROOTS.join(' + ')}; ` +
      `the declared runtime is ${DECLARED_RUNTIME_ROOTS.join(', ')}`,
    );
    return 0;
  }

  console.error(`component-runtime-boundary-gate FAILED — ${findings.length} browser-global escape(s) outside the declared runtime:`);
  for (const finding of findings) {
    console.error(`  ${finding.file}:${finding.line}: ${finding.name} — ${finding.text}`);
  }
  console.error(`  Move the capability into ${DECLARED_RUNTIME_ROOTS.join(', ')} and call it as a hook.`);
  return 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
