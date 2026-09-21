import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const SRC = join(CORE, 'src');
const files = [];
(function walk(d){for(const e of readdirSync(d)){const p=join(d,e);const st=statSync(p);
if(st.isDirectory()){if(e==='node_modules'||e==='dist')continue;walk(p);}else if(/\.css$/.test(e))files.push(p);}})(SRC);
const isGenerated = (p)=>/\/facade\/artifacts\//.test(p)||/\/compiled\//.test(p)||/_source\/extension\.css$/.test(p);
const CHAIN=['--ds-color-bg-tertiary','--ds-surface-panel','--ds-material-panel-background','--ds-surface-panel-bg','--ds-color-surface-subtle','--ds-list-skeleton-bg','--ds-live-feed-skeleton-bg','--ds-stats-grid-skeleton-bg','--ds-upload-card-bg'];
const chainRe=new RegExp('var\\(\\s*('+CHAIN.join('|')+')\\b');
const rows=[];
for(const f of files){
  if(isGenerated(f))continue;
  const text=readFileSync(f,'utf8');
  // split into rule blocks at top level-ish: selector { ...decls... }
  for(const m of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
    const sel=m[1].trim().split('\n').pop().trim();
    const body=m[2];
    const bg=[...body.matchAll(/(^|\n|;)\s*(background(?:-color|-image)?)\s*:\s*([^;]+)/g)].filter(d=>chainRe.test(d[3]));
    if(!bg.length)continue;
    const ink=[...body.matchAll(/(^|\n|;)\s*color\s*:\s*([^;]+)/g)].map(d=>d[2].trim().replace(/\s+/g,' '));
    if(!ink.length)continue;
    const line=text.slice(0,m.index).split('\n').length;
    rows.push({file:relative(CORE,f),line,sel:sel.slice(0,90),bg:bg.map(b=>b[3].trim().replace(/\s+/g,' ').slice(0,70)),ink});
  }
}
writeFileSync('/tmp/e5-census/ink-on-ground.json',JSON.stringify(rows,null,2));
console.log('rule blocks painting a chain ground AND an ink:',rows.length,'\n');
for(const r of rows){console.log(`${r.file}:${r.line}  ${r.sel}\n    bg  ${r.bg.join(' | ')}\n    ink ${r.ink.join(' | ')}`);}
