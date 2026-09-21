import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
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

const isGenerated = (p) =>
  /\/facade\/artifacts\//.test(p) || /\/compiled\//.test(p) ||
  /_source\/extension\.css$/.test(p) || /\/tests?\//.test(p);

// the ground alias chain: every channel that reaches #e5e5e5 THROUGH bg-tertiary
const CHAIN = [
  '--ds-color-bg-tertiary',
  '--ds-surface-panel',
  '--ds-material-panel-background',
  '--ds-surface-panel-bg',
  '--ds-color-surface-subtle',
  '--ds-list-skeleton-bg',
  '--ds-live-feed-skeleton-bg',
  '--ds-stats-grid-skeleton-bg',
  '--ds-upload-card-bg',
];
const chainRe = new RegExp('var\\(\\s*(' + [...CHAIN].sort((a,b)=>b.length-a.length).join('|') + ')\\b', 'g');

// a declaration whose PROPERTY paints a background
const isBgProp = (prop) =>
  /^background(-color|-image)?$/.test(prop) ||
  /^--ds-[a-z0-9-]*-(bg|background)(-[a-z0-9-]+)?$/.test(prop);

const rows = [];
for (const f of files) {
  if (isGenerated(f)) continue;
  const text = readFileSync(f, 'utf8');
  const lines = text.split('\n');
  // crude declaration scan: prop : value ;  (value may span lines)
  for (const m of text.matchAll(/(^|[;{}\n])\s*([-a-zA-Z][-a-zA-Z0-9]*)\s*:\s*([^;{}]*)[;}]/g)) {
    const prop = m[2];
    const value = m[3];
    chainRe.lastIndex = 0;
    if (!chainRe.test(value)) continue;
    const line = text.slice(0, m.index).split('\n').length;
    chainRe.lastIndex = 0;
    const channels = [...value.matchAll(chainRe)].map((x) => x[1]);
    rows.push({
      file: relative(CORE, f), line, prop, value: value.trim().replace(/\s+/g, ' ').slice(0, 110),
      channels: [...new Set(channels)],
      role: isBgProp(prop) ? 'GROUND' : (/border|outline|shadow|color$/.test(prop) ? 'edge/ink' : 'other'),
    });
  }
}
rows.sort((a, b) => (a.file + a.line).localeCompare(b.file + b.line));
writeFileSync('/tmp/e5-census/wells.json', JSON.stringify(rows, null, 2));

const byRole = {};
for (const r of rows) byRole[r.role] = (byRole[r.role] ?? 0) + 1;
console.log('total chain reads in source (generated + tests excluded):', rows.length);
console.log('by role:', byRole);
console.log('\n=== GROUND reads (the wells) ===');
for (const r of rows.filter((r) => r.role === 'GROUND')) {
  console.log(`${r.file}:${r.line}\n    ${r.prop}: ${r.value}`);
}
console.log('\n=== NON-GROUND reads ===');
for (const r of rows.filter((r) => r.role !== 'GROUND')) {
  console.log(`[${r.role}] ${r.file}:${r.line}  ${r.prop}: ${r.value}`);
}
