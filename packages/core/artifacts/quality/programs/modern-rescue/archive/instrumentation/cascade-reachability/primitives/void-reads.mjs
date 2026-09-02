#!/usr/bin/env node
/**
 * WO-CRA-23 task #27 — the declared-in-root, consumed-elsewhere token defect.
 *
 * A skin declares a custom property inside a rule keyed on [data-part='root'],
 * and reads it from a rule keyed on something else. When a caller replaces the
 * part, the DECLARING rule stops matching and the READING rule keeps matching:
 * live paint reading a property nothing declared.
 *
 * Two exclusions keep this from being a false-positive machine, and both are
 * laws this programme paid for:
 *
 *  1. If the property is ALSO declared anywhere outside a root-keyed rule
 *     (:root, a theme file, a class-keyed rule), severance does not empty it —
 *     the other declaration is still in scope.
 *  2. If the read carries a fallback, severance makes the property undeclared
 *     and the fallback FIRES. That is the reverse of the fallback-inert law:
 *     the fallback is dead while the property is declared, and alive once it
 *     is not. A read with a fallback degrades; it does not read the void.
 *
 * So the defect is: a var() read with NO fallback, of a property declared ONLY
 * in root-keyed rules, from a rule that survives severance.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';

const CORE = process.argv[2] ?? process.cwd();

/**
 * ESM resolves bare specifiers from the SCRIPT's location, not the cwd, so a
 * scratchpad script cannot see the package's postcss. Resolve it from the tree
 * being censused instead — the same defect class that made a sibling harness
 * report four of five corpora ABSENT when it moved.
 */
const require = createRequire(join(process.argv[3] ?? CORE, 'package.json'));
const postcss = require('postcss');
const CSS_ROOT = join(CORE, 'src/foundation/tokens/css');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

/** The part hook, in every quoting the tree actually uses. */
const ROOT_KEYED = /\[data-part\s*=\s*['"]?root['"]?\]/;

/**
 * var() reads, split by whether they carry a fallback. The comma has to be at
 * depth zero — var(--a, var(--b, #fff)) is ONE read with a fallback, and a
 * naive /,/ test would also see the inner one.
 */
function readsIn(value) {
  const found = [];
  for (let i = 0; i < value.length; i += 1) {
    if (!value.startsWith('var(', i)) continue;
    let depth = 0;
    let comma = -1;
    let j = i + 3;
    for (; j < value.length; j += 1) {
      const ch = value[j];
      if (ch === '(') depth += 1;
      else if (ch === ')') {
        depth -= 1;
        if (depth === 0) break;
      } else if (ch === ',' && depth === 1 && comma === -1) comma = j;
    }
    const name = (comma === -1 ? value.slice(i + 4, j) : value.slice(i + 4, comma)).trim();
    if (name.startsWith('--')) found.push({ name, hasFallback: comma !== -1 });
    /**
     * Recurse into the fallback. `var(--a, var(--b))` protects --a and leaves
     * --b bare: skipping to the closing paren would hide every nested read,
     * and that blind spot hid the case this census was written for. A false
     * negative here licenses "this family does not have the shape".
     */
    if (comma !== -1) found.push(...readsIn(value.slice(comma + 1, j)));
    i = j;
  }
  return found;
}

const files = walk(CSS_ROOT);

// Pass one: where is every custom property DECLARED, and under what kind of rule.
const declaredInRoot = new Map(); // name -> Set(file)
const declaredElsewhere = new Set();

for (const file of files) {
  let root;
  try {
    root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
  } catch {
    console.error(`  PARSE FAILED ${relative(CORE, file)}`);
    continue;
  }
  root.walkDecls((decl) => {
    if (!decl.prop.startsWith('--')) return;
    const sel = decl.parent?.selector ?? '';
    if (ROOT_KEYED.test(sel)) {
      if (!declaredInRoot.has(decl.prop)) declaredInRoot.set(decl.prop, new Set());
      declaredInRoot.get(decl.prop).add(file);
    } else {
      declaredElsewhere.add(decl.prop);
    }
  });
}

// Pass two: reads with no fallback, from rules that survive severance.
const findings = new Map(); // file -> [{ name, selector, prop }]

for (const file of files) {
  let root;
  try {
    root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
  } catch {
    continue;
  }
  root.walkDecls((decl) => {
    const sel = decl.parent?.selector ?? '';
    if (ROOT_KEYED.test(sel)) return; // dies with the declaration; no orphan
    for (const read of readsIn(decl.value)) {
      if (read.hasFallback) continue; // degrades, does not read the void
      if (!declaredInRoot.has(read.name)) continue;
      if (declaredElsewhere.has(read.name)) continue; // another declaration survives
      if (!findings.has(file)) findings.set(file, []);
      findings.get(file).push({ name: read.name, selector: sel, prop: decl.prop });
    }
  });
}

const rows = [...findings.entries()]
  .map(([file, hits]) => ({
    file: relative(CORE, file),
    family: file.split('/').pop().replace('.css', ''),
    tree: file.includes('/runtime/engines/') ? 'engine' : 'component',
    reads: hits.length,
    tokens: [...new Set(hits.map((h) => h.name))].sort(),
    sample: hits.slice(0, 3),
  }))
  .sort((a, b) => b.reads - a.reads);

console.log(`\nfiles parsed        ${files.length}`);
console.log(`props declared in a root-keyed rule   ${declaredInRoot.size}`);
console.log(`  of those, also declared elsewhere   ${[...declaredInRoot.keys()].filter((n) => declaredElsewhere.has(n)).length}`);
console.log(`\nFAMILIES WITH THE DEFECT SHAPE: ${rows.length}\n`);
for (const r of rows) {
  console.log(`  ${String(r.reads).padStart(3)} reads  ${r.tree.padEnd(9)} ${r.family}`);
  console.log(`           ${r.tokens.slice(0, 4).join(', ')}${r.tokens.length > 4 ? ` … +${r.tokens.length - 4}` : ''}`);
}

writeFileSync(
  join(process.env.SCRATCH ?? '/tmp', 'WO-CRA-23-void-read-census.json'),
  JSON.stringify({ filesParsed: files.length, rows }, null, 2)
);
console.log(`\ntotal reads-from-the-void: ${rows.reduce((n, r) => n + r.reads, 0)}`);
