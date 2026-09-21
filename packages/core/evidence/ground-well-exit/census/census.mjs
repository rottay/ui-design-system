import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const SRC = join(CORE, 'src');

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const st = statSync(p);
    if (st.isDirectory()) { if (e === 'node_modules' || e === 'dist') continue; walk(p); }
    else if (/\.(css|ts|tsx)$/.test(e)) files.push(p);
  }
})(SRC);

// generated artifact / snapshot files are NOT source authorities
const isGenerated = (p) => /\/facade\/artifacts\//.test(p) || /\/compiled\//.test(p) || /_source\/extension\.css$/.test(p);

// ---- step 1: build the var graph from the default theme :root (light) ----
const theme = readFileSync(join(SRC, 'foundation/tokens/css/foundation/themes/default/index.css'), 'utf8');
// take text up to the dark block
const darkIdx = theme.search(/\n(html\.dark|\.dark|:root\.dark)/);
const lightText = darkIdx > 0 ? theme.slice(0, darkIdx) : theme;
const decls = new Map();
for (const m of lightText.matchAll(/(--ds-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  if (!decls.has(m[1])) decls.set(m[1], m[2].trim().replace(/\s+/g, ' '));
}

function resolve(name, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const v = decls.get(name);
  if (!v) return null;
  const hex = v.match(/^#[0-9a-fA-F]{3,8}$/);
  if (hex) return v.toLowerCase();
  const varm = v.match(/^var\(\s*(--ds-[a-z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (varm) {
    const r = resolve(varm[1], seen);
    if (r) return r;
    if (varm[2]) {
      const f = varm[2].trim();
      if (/^#[0-9a-fA-F]{3,8}$/.test(f)) return f.toLowerCase();
      const fv = f.match(/^var\(\s*(--ds-[a-z0-9-]+)/);
      if (fv) return resolve(fv[1], seen);
    }
    return null;
  }
  return null;
}

const TARGET = '#e5e5e5';
const resolving = [];
for (const name of decls.keys()) {
  const r = resolve(name);
  if (r === TARGET) resolving.push(name);
}
resolving.sort();
console.log('=== channels in the default light :root resolving to ' + TARGET + ' (' + resolving.length + ') ===');
for (const n of resolving) console.log('  ' + n.padEnd(42) + ' = ' + decls.get(n));
