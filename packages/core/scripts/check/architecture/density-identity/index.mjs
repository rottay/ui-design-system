#!/usr/bin/env node
/**
 * Density type-identity sentinel (WO-RET-06 W-3a follow-up, the owner's P2 correction).
 *
 * WHY IT EXISTS. `tests/architecture/density-one-type-per-axis` pins the density identities with
 * `expectTypeOf`, but Vitest never evaluates types, and the only static reader of that file,
 * `typecheck:tests`, carries a pre-existing error with its own receiver. A broken pin there adds
 * one more error to a red gate nobody reads. This gate compiles a dedicated probe
 * (`probe/index.ts`) under its own tsconfig (`probe/tsconfig/index.json`, which extends the
 * production `tsconfig.json`), so its scope is the probe plus the production graph it imports:
 * no test file is in it, and nothing outside it can mask or credit it.
 *
 * GREEN means all of: tsc exits 0 with zero diagnostics in that scope; no test file is in the
 * compiled set; and each survivor type of the two density axes is declared exactly once, where
 * its owner declares it.
 *
 * Usage (from packages/core): node scripts/check/architecture/density-identity/index.mjs
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { packageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const CORE_ROOT = packageRoot(HERE);
export const PROBE_TSCONFIG = join(HERE, 'probe/tsconfig/index.json');
export const PROBE_FILE = join(HERE, 'probe/index.ts');

const require = createRequire(join(CORE_ROOT, 'package.json'));
const ts = require('typescript');
const TSC = require.resolve('typescript/bin/tsc');

/** The one declaration each survivor may have (paths relative to packages/core). */
export const SURVIVORS = Object.freeze({
  DensityPosture: 'src/foundation/tokens/ts/foundation/base/density/index.ts',
  DensityMode: 'src/contracts/theme/foundation/decisions/index.ts',
});

const TEST_FILE = /(?:^|\/)(?:tests?|__tests__|fixtures)\/|\.(?:test|spec)\.[cm]?tsx?$/u;

/** Compiles one probe tsconfig; returns the exit status, the parsed diagnostics and the compiled set. */
export function compileProbe(tsconfig = PROBE_TSCONFIG) {
  const run = spawnSync(process.execPath, [TSC, '--noEmit', '--pretty', 'false', '-p', tsconfig, '--listFiles'], {
    cwd: CORE_ROOT,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  const lines = `${run.stdout ?? ''}${run.stderr ?? ''}`.split('\n');
  const diagnostics = [];
  const files = [];
  for (const line of lines) {
    const match = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/u.exec(line);
    if (match) diagnostics.push({ file: match[1], line: Number(match[2]), code: match[4], message: match[5] });
    else if (/^\/.+\.[cm]?tsx?$/u.test(line.trim())) files.push(line.trim());
  }
  return { status: run.status, diagnostics, files };
}

/** Files of the compiled set that belong to the package and are tests or fixtures. */
export function testFilesInScope(files) {
  return files
    .filter((file) => file.startsWith(CORE_ROOT) && !file.includes(`${sep}node_modules${sep}`))
    .map((file) => relative(CORE_ROOT, file).split(sep).join('/'))
    .filter((file) => TEST_FILE.test(file));
}

/** Every type alias or interface declaring a survivor name, as `name @ path`, from `{ path: text }`. */
export function survivorDeclarations(sources) {
  const found = [];
  for (const [path, text] of Object.entries(sources)) {
    if (!Object.keys(SURVIVORS).some((name) => text.includes(name))) continue;
    const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      if ((ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) && node.name.text in SURVIVORS) {
        found.push(`${node.name.text} @ ${path}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return found.sort();
}

/** The findings of the survivor law: each name declared exactly once, at its owner. */
export function survivorFindings(declarations) {
  const expected = Object.entries(SURVIVORS).map(([name, path]) => `${name} @ ${path}`).sort();
  const findings = [];
  for (const declaration of declarations) {
    if (!expected.includes(declaration)) findings.push(`unexpected declaration: ${declaration}`);
  }
  for (const declaration of expected) {
    const count = declarations.filter((item) => item === declaration).length;
    if (count !== 1) findings.push(`${declaration} declared ${count} time(s), expected exactly 1`);
  }
  return findings;
}

function sourceTree(root) {
  const out = {};
  const walk = (directory) => {
    for (const entry of readdirSync(directory)) {
      const absolute = join(directory, entry);
      if (statSync(absolute).isDirectory()) walk(absolute);
      else if (/\.tsx?$/u.test(entry)) out[relative(CORE_ROOT, absolute).split(sep).join('/')] = readFileSync(absolute, 'utf8');
    }
  };
  walk(root);
  return out;
}

/** The whole verdict for one probe tsconfig. */
export function evaluate(tsconfig = PROBE_TSCONFIG) {
  const compiled = compileProbe(tsconfig);
  const findings = [];
  if (compiled.status !== 0 || compiled.diagnostics.length > 0) {
    for (const diagnostic of compiled.diagnostics) {
      findings.push(`${relative(CORE_ROOT, diagnostic.file) || diagnostic.file}:${diagnostic.line} ${diagnostic.code} ${diagnostic.message}`);
    }
    if (compiled.diagnostics.length === 0) findings.push(`tsc exited ${compiled.status} with no parseable diagnostics`);
  }
  if (!compiled.files.some((file) => file.endsWith('density-identity/probe/index.ts'))) {
    findings.push('the probe file is not in the compiled set: the sentinel compiled something else');
  }
  for (const file of testFilesInScope(compiled.files)) findings.push(`test file in scope: ${file}`);
  const declarations = survivorDeclarations(sourceTree(join(CORE_ROOT, 'src')));
  findings.push(...survivorFindings(declarations));
  return { findings, compiled, declarations };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { findings, compiled, declarations } = evaluate();
  const version = require('typescript/package.json').version;
  console.log(`density-identity: typescript@${version}; ${compiled.files.length} file(s) compiled; `
    + `${compiled.diagnostics.length} diagnostic(s); survivors: ${declarations.join(', ')}`);
  if (findings.length > 0) {
    console.error(`density-identity: FAIL (${findings.length})\n${findings.map((finding) => `- ${finding}`).join('\n')}`);
    process.exit(1);
  }
  console.log('density-identity: OK — every pinned density identity compiles, no test file is in scope, each survivor is declared once.');
}
