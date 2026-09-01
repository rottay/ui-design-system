import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const postcssModule = require('/Users/daniel/Developer/Rottay/ui-design-system/packages/core/node_modules/postcss');
const postcss = postcssModule.default ?? postcssModule;
const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const OUT = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad/';
function walk(dir, ext, acc = []) {
  let e; try { e = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const x of e) { if (x.name === 'node_modules' || x.name === '.git') continue; const f = join(dir, x.name); if (x.isDirectory()) walk(f, ext, acc); else if (ext.some(s => x.name.endsWith(s))) acc.push(f); }
  return acc;
}
// 1) TS/TSX string-literal occurrences of --ds-* names (potential producers)
const tsFiles = walk(join(CORE, 'src'), ['.ts', '.tsx']).filter(f => !/\.(test|spec)\.[tj]sx?$/.test(f) && !f.includes('/tests/') && !f.includes('/__tests__/'));
const tsAll = walk(join(CORE, 'src'), ['.ts', '.tsx']);
console.log('ts/tsx (sin tests):', tsFiles.length, ' total:', tsAll.length);
const NAME = /--ds-[a-zA-Z0-9_-]+/g;
const tsProd = new Map();      // name -> Set(file)  (prod, non-test)
const tsAny = new Map();
function scanTs(files, target) {
  for (const f of files) {
    const rel = f.split('packages/core/')[1];
    const txt = readFileSync(f, 'utf8');
    for (const m of txt.matchAll(NAME)) {
      if (!target.has(m[0])) target.set(m[0], new Set());
      target.get(m[0]).add(rel);
    }
  }
}
scanTs(tsFiles, tsProd); scanTs(tsAll, tsAny);
console.log('nombres --ds-* mencionados en TS/TSX prod:', tsProd.size, ' en todo TS/TSX:', tsAny.size);
writeFileSync(OUT + 'P2-ts-names.txt', [...tsProd.keys()].sort().join('\n') + '\n');

// 2) Built bundles: declarations present in styles/*.css
const bundles = ['rottay.css', 'bithire.css', 'evnto.css', 'index.css', 'modern.css'];
const bundleDecl = new Map();
for (const b of bundles) {
  const p = join(CORE, 'styles', b);
  if (!existsSync(p)) { console.log('MISSING', b); continue; }
  const src = readFileSync(p, 'utf8');
  const root = postcss.parse(src, { from: p });
  let c = 0;
  root.walkDecls((d) => { if (d.prop.startsWith('--ds-')) { if (!bundleDecl.has(d.prop)) bundleDecl.set(d.prop, new Set()); bundleDecl.get(d.prop).add(b); c += 1; } });
  console.log(' bundle', b, 'decl sites', c);
}
console.log('nombres --ds-* declarados en algun bundle styles/*.css:', bundleDecl.size);
writeFileSync(OUT + 'P2-bundle-declared.txt', [...bundleDecl.keys()].sort().join('\n') + '\n');

// 3) facade artifacts
const facade = walk(join(CORE, 'src/foundation/tokens/css/facade/artifacts'), ['.css']);
const facadeDecl = new Set();
for (const f of facade) { const root = postcss.parse(readFileSync(f, 'utf8'), { from: f }); root.walkDecls(d => { if (d.prop.startsWith('--ds-')) facadeDecl.add(d.prop); }); }
console.log('facade artifacts css:', facade.length, 'nombres declarados:', facadeDecl.size);
writeFileSync(OUT + 'P2-facade-declared.txt', [...facadeDecl].sort().join('\n') + '\n');
