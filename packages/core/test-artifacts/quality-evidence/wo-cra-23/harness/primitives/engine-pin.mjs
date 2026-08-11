#!/usr/bin/env node
/**
 * WO-CRA-23 — class 3: a primitive that pins an engine instead of resolving one.
 *
 * Two shapes, and they fail differently:
 *   PINNED PROP   `engine="modern"` written at a call site inside the tier
 *   PINNED IMPORT a non-engine file importing ONE engine implementation, so the
 *                 engine context cannot reach it at all
 */
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const CORE = new URL('../../../../../', import.meta.url).pathname.replace(/\/$/, '');
const req = createRequire(CORE + '/package.json');
const ts = req('typescript');
const ENGINES = ['classic', 'modern', 'rustic'];

// `--control` scans the planted fixture instead of the tree. Class 3a reports a
// ZERO against the real tree, and a zero from an instrument that has never been
// shown to find anything is not a measurement.
const CONTROL = process.argv.includes('--control');
const SNAP = CONTROL ? new URL('./control/', import.meta.url).pathname.replace(/\/$/, '') : CORE;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

const PRIM = CONTROL ? SNAP : join(SNAP, 'src/ui/primitives');
const files = walk(PRIM)
  .filter((f) => !/\/tests\//.test(f) && !/\.stories\./.test(f) && !/\.test\./.test(f))
  .filter((f) => !CONTROL || /engine-pin-control/.test(f));

const pinnedProps = [];
const pinnedImports = [];

for (const file of files) {
  const rel = relative(SNAP, file);
  const isEngineFile = /\/engines\/(classic|modern|rustic)\//.test(rel);
  const text = readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // --- pinned prop -------------------------------------------------------
  const visit = (n) => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      for (const a of n.attributes.properties) {
        if (!ts.isJsxAttribute(a)) continue;
        const name = a.name.getText();
        if (name !== 'engine' && name !== 'defaultEngine') continue;
        const init = a.initializer;
        let v = null;
        if (init && ts.isStringLiteral(init)) v = init.text;
        else if (init && ts.isJsxExpression(init) && init.expression && ts.isStringLiteral(init.expression)) v = init.expression.text;
        if (v && ENGINES.includes(v)) {
          pinnedProps.push({ file: rel, line: sf.getLineAndCharacterOfPosition(n.getStart()).line + 1, tag: n.tagName.getText(), prop: name, value: v });
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);

  // --- pinned import -----------------------------------------------------
  if (isEngineFile) continue;
  const engineImports = new Set();
  const specs = [];
  sf.forEachChild((n) => {
    if (!ts.isImportDeclaration(n)) return;
    const spec = n.moduleSpecifier.getText().replace(/['"]/g, '');
    const m = spec.match(/engines\/(classic|modern|rustic)(\/|$)/);
    if (m) { engineImports.add(m[1]); specs.push(spec); }
  });
  if (engineImports.size > 0 && engineImports.size < 3) {
    pinnedImports.push({ file: rel, engines: [...engineImports], specs });
  }
}

console.log(`scanned ${files.length} primitive source files (tests and stories excluded)\n`);
console.log(`--- class 3a: an engine pinned as a prop (${pinnedProps.length}) ---`);
for (const p of pinnedProps) console.log(`  ${p.file}:${p.line}  <${p.tag} ${p.prop}="${p.value}">`);
console.log(`\n--- class 3b: a non-engine file importing fewer than three engines (${pinnedImports.length}) ---`);
for (const p of pinnedImports) console.log(`  ${p.file}\n      imports only: ${p.engines.join(', ')}   [${p.specs.join(' ')}]`);

if (CONTROL) {
  // The fixture plants: engine="modern", defaultEngine={'rustic'}, a dynamic
  // engine={someVar} that must NOT be flagged, and a single-engine import.
  const props = pinnedProps.map((p) => `${p.prop}=${p.value}`).sort();
  const okProps = JSON.stringify(props) === JSON.stringify(['defaultEngine=rustic', 'engine=modern']);
  const okImports = pinnedImports.length === 1 && pinnedImports[0].engines.join() === 'modern';
  console.log(`\n${okProps ? 'ok  ' : 'FAIL'} pinned props: want engine=modern + defaultEngine=rustic, and the dynamic one ignored`);
  console.log(`${okImports ? 'ok  ' : 'FAIL'} pinned import: want exactly one, modern`);
  console.log(`\nengine-pin control: ${[okProps, okImports].filter(Boolean).length} pass / ${[okProps, okImports].filter((x) => !x).length} fail`);
  process.exit(okProps && okImports ? 0 : 1);
}
