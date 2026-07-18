#!/usr/bin/env node
/**
 * CSS layer paint gate (CMP-01 / P-76).
 *
 * Tailwind v4 hosts declare their unnamed `base` layer after every `rottay-*`
 * layer, so preflight's universal margin/padding/border reset outranks ANY
 * normal declaration inside those layers, whatever its specificity (measured;
 * P-47/P-76). Real paint that ships inside a layered import is therefore dead
 * in every Tailwind-hosting app while every other signal stays green.
 *
 * The gate parses both public entrypoints, resolves every first-party
 * `@import ... layer(...)` target (following nested relative imports, which
 * inherit the layer), and fails when a layered file carries a normal
 * (non-!important) declaration of a preflight-killable paint property:
 * padding*, margin*, border* (except border-radius), background*, box-shadow.
 *
 * Exemptions, each load-bearing:
 * - `!important` declarations: importance beats every normal preflight
 *   declaration, and the layered position itself is load-bearing (a layered
 *   important outranks an unlayered important).
 * - `border-radius`: preflight only resets radius on form controls; non-form
 *   -control radius is not part of the kill vector.
 * - Non-relative specifiers (antd/dist/reset.css): third-party reset whose
 *   paint is re-declared by the antd runtime; not first-party contract.
 * - `facade/artifacts/**`: generated tenant snapshots; layered by the tenant
 *   contract and owned by the brand compiler.
 * - Files declared in css-layer-paint-gate.allowlist.json, each with a
 *   reason and a per-file ceiling. The ceiling is decrease-only: a file that
 *   drops below it must have its entry tightened, a file that reaches zero
 *   must have its entry removed.
 *
 * Second law: an unlayered skin must never carry `layer(...)` -- that moves
 * an engine skin below preflight silently. Any import whose path contains a
 * `/skin/` segment with a layer() clause fails.
 *
 * Usage:
 *   node scripts/css-layer-paint-gate.mjs
 *   node scripts/css-layer-paint-gate.mjs --entry <file.css> [--entry ...] \
 *     --allowlist <allowlist.json>   (fixture mode for the self-test)
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');

const args = process.argv.slice(2);
const entryArgs = [];
let allowlistPath = join(scriptDir, 'css-layer-paint-gate.allowlist.json');
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === '--entry') entryArgs.push(resolve(args[i + 1]));
  if (args[i] === '--allowlist') allowlistPath = resolve(args[i + 1]);
}

const entrypoints = entryArgs.length
  ? entryArgs
  : [
      join(packageRoot, 'src/foundation/tokens/css/facade/entrypoints/base.css'),
      join(packageRoot, 'src/foundation/tokens/css/facade/entrypoints/styles.css'),
    ];

const PAINT_RE =
  /^(padding(-(top|right|bottom|left|inline|block)(-(start|end))?)?|margin(-(top|right|bottom|left|inline|block)(-(start|end))?)?|border|border-(top|right|bottom|left|inline|block)|border(-(top|right|bottom|left))?-(width|style|color)|border-(inline|block)(-(start|end))?-(width|style|color)|background(-[a-z]+)*|box-shadow)$/i;

const IMPORT_RE = /@import\s+(['"])([^'"]+)\1\s*(layer\(([^)]*)\))?\s*;/g;

const failures = [];
/** file (absolute) -> Set of "selector :: prop" rows for reporting */
const layeredPaint = new Map();
const visitedLayered = new Set();

function relPath(file) {
  return file.startsWith(packageRoot + sep) ? file.slice(packageRoot.length + 1) : file;
}

function collectLayeredImports(entryFile) {
  const css = readFileSync(entryFile, 'utf8');
  for (const match of css.matchAll(IMPORT_RE)) {
    const specifier = match[2];
    const hasLayer = Boolean(match[3]);
    if (!specifier.startsWith('.')) continue;
    const target = resolve(dirname(entryFile), specifier);
    if (hasLayer && target.split(sep).includes('skin')) {
      failures.push(`layered skin import: ${relPath(entryFile)} imports ${specifier} with layer(${match[4]})`);
      continue;
    }
    if (!hasLayer) continue;
    walkLayeredFile(target);
  }
}

function walkLayeredFile(file) {
  if (visitedLayered.has(file)) return;
  visitedLayered.add(file);
  if (file.includes(`${sep}facade${sep}artifacts${sep}`)) return;
  if (!existsSync(file)) {
    failures.push(`layered import target does not exist: ${relPath(file)}`);
    return;
  }
  const css = readFileSync(file, 'utf8');
  // Nested imports inherit the layer of their importer.
  for (const match of css.matchAll(IMPORT_RE)) {
    if (!match[2].startsWith('.')) continue;
    walkLayeredFile(resolve(dirname(file), match[2]));
  }
  let root;
  try {
    root = postcss.parse(css, { from: file });
  } catch (err) {
    failures.push(`layered import does not parse: ${relPath(file)} -- ${err.message}`);
    return;
  }
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--')) return;
    if (decl.important) return;
    let scope = decl.parent;
    while (scope) {
      if (scope.type === 'atrule' && /keyframes/i.test(scope.name)) return;
      scope = scope.parent;
    }
    if (!PAINT_RE.test(decl.prop)) return;
    const selector = (decl.parent.selector || '').replace(/\s+/g, ' ');
    if (!layeredPaint.has(file)) layeredPaint.set(file, []);
    layeredPaint.get(file).push(`${selector} :: ${decl.prop}`);
  });
}

for (const entry of entrypoints) {
  if (!existsSync(entry)) {
    failures.push(`entrypoint does not exist: ${entry}`);
    continue;
  }
  collectLayeredImports(entry);
}

let allowlist = [];
if (existsSync(allowlistPath)) {
  allowlist = JSON.parse(readFileSync(allowlistPath, 'utf8'));
  if (!Array.isArray(allowlist)) {
    failures.push(`allowlist must be an array: ${allowlistPath}`);
    allowlist = [];
  }
}
const allowByFile = new Map();
for (const entry of allowlist) {
  if (!entry || typeof entry.file !== 'string' || typeof entry.reason !== 'string' || entry.reason.trim() === '' || !Number.isInteger(entry.maxDeclarations) || entry.maxDeclarations < 1) {
    failures.push(`malformed allowlist entry (needs file, non-empty reason, maxDeclarations >= 1): ${JSON.stringify(entry)}`);
    continue;
  }
  allowByFile.set(entry.file, entry);
}

const seenAllowlistFiles = new Set();
for (const [file, rows] of layeredPaint) {
  const rel = relPath(file).split(sep).join('/');
  const entry = allowByFile.get(rel);
  if (!entry) {
    failures.push(
      `paint inside a layered import: ${rel} carries ${rows.length} preflight-killable declaration(s):\n    ${rows.join('\n    ')}`
    );
    continue;
  }
  seenAllowlistFiles.add(rel);
  if (rows.length > entry.maxDeclarations) {
    failures.push(
      `allowlisted layered paint grew: ${rel} carries ${rows.length} declaration(s), ceiling is ${entry.maxDeclarations}:\n    ${rows.join('\n    ')}`
    );
  } else if (rows.length < entry.maxDeclarations) {
    console.log(`css-layer-paint-gate: ${rel} is at ${rows.length}/${entry.maxDeclarations} -- tighten the allowlist ceiling`);
  }
}
for (const rel of allowByFile.keys()) {
  if (!seenAllowlistFiles.has(rel)) {
    failures.push(`stale allowlist entry (file carries no layered paint or is not a layered import): ${rel}`);
  }
}

if (failures.length > 0) {
  console.error(`css-layer-paint-gate: FAIL (${failures.length})`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log(
  `css-layer-paint-gate: OK -- ${visitedLayered.size} layered file(s) scanned, ${layeredPaint.size} allowlisted residue file(s), 0 violations`
);
