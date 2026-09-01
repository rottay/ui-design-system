import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const postcssModule = require('/Users/daniel/Developer/Rottay/ui-design-system/packages/core/node_modules/postcss');
const postcss = postcssModule.default ?? postcssModule;

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const OUT = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad/';

function walk(dir, ext, acc = []) {
  let entries; try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, ext, acc);
    else if (e.isFile() && ext.some(x => e.name.endsWith(x))) acc.push(full);
  }
  return acc;
}

const cssFiles = walk(join(CORE, 'src'), ['.css']);
console.log('css files under src:', cssFiles.length);

const declared = new Map();      // --ds-x -> Set(relfile)
const declaredPriv = new Map();  // --_ds-x
const consumedPriv = new Map();  // --_ds-x -> {total, withFallback, withoutFallback, files:Set}
const rootDeclared = new Map();  // declared inside a rule whose selector mentions :root or [data-...] top-level

function* varCalls(text) {
  const opener = /var\(\s*(--[a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = opener.exec(text))) {
    let index = opener.lastIndex, depth = 1;
    while (index < text.length && depth > 0) { const c = text[index]; if (c === '(') depth += 1; else if (c === ')') depth -= 1; index += 1; }
    const inner = text.slice(match.index + 4, index - 1);
    let comma = -1, nested = 0;
    for (let i = 0; i < inner.length; i += 1) { const c = inner[i]; if (c === '(') nested += 1; else if (c === ')') nested -= 1; else if (c === ',' && nested === 0) { comma = i; break; } }
    yield { name: match[1], fallback: comma >= 0 ? inner.slice(comma + 1) : null };
  }
}

for (const f of cssFiles) {
  const rel = f.split('packages/core/')[1];
  const src = readFileSync(f, 'utf8');
  let root;
  try { root = postcss.parse(src, { from: f }); } catch (e) { console.error('PARSE FAIL', rel, e.message); continue; }
  root.walkDecls((decl) => {
    const prop = decl.prop;
    const selector = decl.parent && decl.parent.selector ? decl.parent.selector : '';
    if (prop.startsWith('--ds-')) {
      if (!declared.has(prop)) declared.set(prop, new Set());
      declared.get(prop).add(rel);
      if (/(^|[\s,])(:root|html|:where\(:root\))/.test(selector) || selector.includes(':root')) {
        if (!rootDeclared.has(prop)) rootDeclared.set(prop, new Set());
        rootDeclared.get(prop).add(rel + ' @ ' + selector.slice(0, 80));
      }
    } else if (prop.startsWith('--_ds-')) {
      if (!declaredPriv.has(prop)) declaredPriv.set(prop, new Set());
      declaredPriv.get(prop).add(rel);
    }
    // consumption inside decl.value
    for (const call of varCalls(decl.value)) {
      if (call.name.startsWith('--_ds-')) {
        let e = consumedPriv.get(call.name);
        if (!e) { e = { total: 0, withFallback: 0, withoutFallback: 0, files: new Set() }; consumedPriv.set(call.name, e); }
        e.total += 1;
        if (call.fallback === null || call.fallback.trim() === '') e.withoutFallback += 1; else e.withFallback += 1;
        e.files.add(rel);
      }
    }
  });
  // also at-rule params (e.g. @supports, @media) can carry var() - scan params
  root.walkAtRules((at) => {
    for (const call of varCalls(at.params || '')) {
      if (call.name.startsWith('--_ds-')) {
        let e = consumedPriv.get(call.name);
        if (!e) { e = { total: 0, withFallback: 0, withoutFallback: 0, files: new Set() }; consumedPriv.set(call.name, e); }
        e.total += 1;
        if (call.fallback === null || call.fallback.trim() === '') e.withoutFallback += 1; else e.withFallback += 1;
        e.files.add(rel);
      }
    }
  });
}

console.log('--ds-* declarados en src/**/*.css:', declared.size, '| de esos con al menos un sitio :root-ish:', rootDeclared.size);
writeFileSync(OUT + 'P2-declared-ds.txt', [...declared.keys()].sort().join('\n') + '\n');
writeFileSync(OUT + 'P2-declared-ds-root.txt', [...rootDeclared.keys()].sort().join('\n') + '\n');
writeFileSync(OUT + 'P2-declared-ds-files.json', JSON.stringify(Object.fromEntries([...declared].map(([k, v]) => [k, [...v]]))));

console.log('--_ds-* declarados:', declaredPriv.size, 'consumidos:', consumedPriv.size);
const unionPriv = new Set([...declaredPriv.keys(), ...consumedPriv.keys()]);
console.log('union --_ds-*:', unionPriv.size);
const consumedNotDeclared = [...consumedPriv.keys()].filter(n => !declaredPriv.has(n)).sort();
const declaredNotConsumed = [...declaredPriv.keys()].filter(n => !consumedPriv.has(n)).sort();
console.log('consumidos y NUNCA declarados:', consumedNotDeclared.length);
console.log('declarados y NUNCA consumidos:', declaredNotConsumed.length, declaredNotConsumed.join(', '));
const cndNoFallbackSomewhere = consumedNotDeclared.filter(n => consumedPriv.get(n).withoutFallback > 0);
console.log('  de esos, con AL MENOS una lectura SIN fallback:', cndNoFallbackSomewhere.length, cndNoFallbackSomewhere.join(', '));
writeFileSync(OUT + 'P2-priv-consumed-not-declared.txt', consumedNotDeclared.join('\n') + '\n');
writeFileSync(OUT + 'P2-priv-nofallback.txt', cndNoFallbackSomewhere.join('\n') + '\n');
writeFileSync(OUT + 'P2-priv-occ.json', JSON.stringify(Object.fromEntries([...consumedPriv].map(([k, v]) => [k, { total: v.total, withFallback: v.withFallback, withoutFallback: v.withoutFallback, files: [...v.files] }]))));
