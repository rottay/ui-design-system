import fs from 'node:fs';
import path from 'node:path';
const ROOT='/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src';
const files=[];
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
  if(e.isDirectory()){ if(e.name==='node_modules')continue; walk(p);} else if(e.name.endsWith('.css')) files.push(p);}})(ROOT);
console.log('css files scanned:', files.length);

// decl: property: value;  capture custom-prop definitions and paint declarations
const defs=new Map();      // customProp -> Set of vars it reads
const paint=[];            // {prop, reads:Set, file}
const declRe=/(--[A-Za-z0-9_-]+|[a-z-]+)\s*:\s*([^;{}]+)[;}]/g;
const varRe=/var\(\s*(--[A-Za-z0-9_-]+)/g;
let totalDecl=0;
for(const f of files){
  const src=fs.readFileSync(f,'utf8');
  let m;
  while((m=declRe.exec(src))){
    const prop=m[1], val=m[2];
    const reads=new Set(); let v;
    varRe.lastIndex=0;
    while((v=varRe.exec(val))) reads.add(v[1]);
    if(reads.size===0) continue;
    totalDecl++;
    if(prop.startsWith('--')){ if(!defs.has(prop))defs.set(prop,new Set()); for(const r of reads)defs.get(prop).add(r); }
    else paint.push({prop, reads, file:f});
  }
}
console.log('declarations reading a var:', totalDecl, '| custom-prop definitions:', defs.size, '| paint declarations:', paint.length);

// reverse: var -> custom props that read it
const rev=new Map();
for(const [p,rs] of defs) for(const r of rs){ if(!rev.has(r))rev.set(r,new Set()); rev.get(r).add(p); }

function closure(seed){
  const seen=new Set([seed]); const q=[seed];
  while(q.length){ const x=q.pop(); for(const p of (rev.get(x)||[])) if(!seen.has(p)){seen.add(p);q.push(p);} }
  return seen;
}
const SEEDS=['--ds-density-mode-factor','--ds-rhythm-scale','--ds-type-scale','--ds-radius-scale','--ds-effect-intensity','--ds-motion-intensity','--ds-motion-duration-scale','--ds-radius-button','--ds-elevation-1','--ds-edge-emphasis-width','--ds-color-primary','--ds-surface-card','--ds-font-family-base','--ds-sidebar-bg'];
console.log();
console.log('SEED'.padEnd(30),'closure','paintDecls','files');
for(const s of SEEDS){
  const c=closure(s);
  const hits=paint.filter(p=>[...p.reads].some(r=>c.has(r)));
  const fset=new Set(hits.map(h=>h.file));
  console.log(s.padEnd(30), String(c.size).padStart(7), String(hits.length).padStart(10), String(fset.size).padStart(5));
}
