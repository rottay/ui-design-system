#!/usr/bin/env node

/**
 * component-determinism-gate — anatomy is never drawn by a die roll.
 *
 * WHY THIS GATE EXISTS (F-18). `data-terminal-card` picked one of four skins
 * with `Math.floor(Math.random() * 4) + 1` and cached the result on `window`;
 * `insights` picked its metrics and activity variants the same way. The server
 * renders variant 1 and the client renders whatever the die said, so the first
 * paint of a dashboard was a hydration mismatch by construction, and two users
 * of the same tenant saw two different products. Randomness in a component is
 * therefore not a style preference: it is a second customization path that
 * outranks every tenant decision and cannot be reproduced, reviewed or tested.
 *
 * THE LAW. No authored file under `src/components` may name `Math.random`.
 * Not in a render, not in an id allocator, not in a comment: the closure
 * criterion of F-18 is the literal `grep -rn "Math.random" src/components` at
 * zero, and a counter a comment can satisfy is the exact defect WO-CAN-02 was
 * opened against. A component that needs an identity uses React's `useId`; a
 * component that needs a sequence uses a module counter; a component that
 * needs noise uses a seeded generator whose seed is an input.
 *
 * There is NO baseline and NO allowlist. A finding is a failure.
 *
 * --check (default)  exit 1 listing every occurrence with path:line.
 * --drill            scan a planted corpus that carries one violation and
 *                    require it to be found; exit 1 if it is not.
 */

import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = findPackageRoot(HERE);

/** The authored corpus this law governs. */
export const COMPONENTS_ROOT = 'src/components';

/** Extensions that carry authored component source. */
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css']);

/**
 * The literal the closure criterion greps for. Kept as a computed string so
 * this gate's own source does not trip the criterion it enforces.
 */
export const FORBIDDEN_TOKEN = ['Math', 'random'].join('.');

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

function extensionOf(name) {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot);
}

/**
 * Every occurrence of the forbidden token under `root`, as
 * `{ file, line, text }` with `file` relative to `base`.
 */
export function scanDeterminism(root, base = root) {
  const findings = [];
  for (const file of walk(root)) {
    let source;
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    if (!source.includes(FORBIDDEN_TOKEN)) continue;
    source.split('\n').forEach((text, index) => {
      if (text.includes(FORBIDDEN_TOKEN)) {
        findings.push({ file: relative(base, file).replaceAll('\\', '/'), line: index + 1, text: text.trim() });
      }
    });
  }
  return findings;
}

function reportAndExit(findings, label) {
  if (findings.length === 0) {
    console.log(`component-determinism-gate OK — 0 occurrences of ${FORBIDDEN_TOKEN} under ${label}`);
    return 0;
  }
  console.error(`component-determinism-gate FAILED — ${findings.length} occurrence(s) of ${FORBIDDEN_TOKEN} under ${label}:`);
  for (const finding of findings) {
    console.error(`  ${finding.file}:${finding.line}: ${finding.text}`);
  }
  console.error('  Use useId() for identity, a module counter for sequence, or a seeded generator whose seed is an input.');
  return 1;
}

/**
 * A throwaway corpus carrying exactly one violation, written at drill time
 * rather than committed. A planted fixture on disk would be a second corpus
 * for every other tree law to walk, and the violation it carries is the very
 * literal the closure criterion counts.
 */
function plantDrillCorpus() {
  const corpus = mkdtempSync(join(tmpdir(), 'ds-determinism-drill-'));
  const planted = join(corpus, 'planted');
  writeFileSync(
    join(corpus, 'clean.tsx'),
    'export const Clean = () => 1;\n',
    'utf8',
  );
  writeFileSync(
    `${planted}.tsx`,
    `export function Planted() {\n  return ${FORBIDDEN_TOKEN}();\n}\n`,
    'utf8',
  );
  return corpus;
}

function main(argv) {
  if (argv.includes('--drill')) {
    const corpus = plantDrillCorpus();
    try {
      const findings = scanDeterminism(corpus, corpus);
      if (findings.length !== 1 || findings[0].line !== 2) {
        console.error('component-determinism-gate DRILL FAILED — the planted corpus was not reported exactly once; the scanner has no teeth.');
        return 1;
      }
      console.log('component-determinism-gate DRILL OK — the planted occurrence was reported at line 2.');
      return 0;
    } finally {
      rmSync(corpus, { recursive: true, force: true });
    }
  }

  const root = resolve(PACKAGE_ROOT, COMPONENTS_ROOT);
  return reportAndExit(scanDeterminism(root, PACKAGE_ROOT), COMPONENTS_ROOT);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
