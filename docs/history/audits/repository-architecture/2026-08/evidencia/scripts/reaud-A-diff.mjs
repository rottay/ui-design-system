import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const m = require('./reaud-A-mig.cjs');
function leaves(v,p,o){
  if(v===null||typeof v!=='object'){o.push(p);return;}
  if(Array.isArray(v)){ v.forEach((x,i)=>leaves(x,p+'[]',o)); return;}
  for(const [k,x] of Object.entries(v)) leaves(x,p?p+'.'+k:k,o);
}
const norm = s => s.replace(/\[\d+\]/g,'[]');
const db = new Set(fs.readFileSync('reaud-A-db-reachable.txt','utf8').split('\n').filter(Boolean).map(norm));

const staticSet = new Set();
for(const v of ['bithire','evnto','rottay']){
  const o=[]; leaves(m.FIRST_PARTY_THEMES[v],'',o); o.map(norm).forEach(x=>staticSet.add(x));
}
// drop identity/meta that no patch should carry
const META = new Set(['id','name','extends']);
const st = [...staticSet].filter(p=>!META.has(p.split('.')[0]));
const onlyStatic = st.filter(p=>!db.has(p)).sort();
const onlyDb = [...db].filter(p=>!staticSet.has(p)).sort();
console.log('static-authored Theme leaves (union of 3 verticals, sans id/name):', st.length);
console.log('DB-reachable:', db.size);
console.log('ONLY-STATIC (DB cannot express):', onlyStatic.length);
const g={};for(const p of onlyStatic){const t=p.split('.').slice(0,3).join('.');g[t]=(g[t]||0)+1;}
console.log(Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,45).map(([k,v])=>String(v).padStart(4)+' '+k).join('\n'));
console.log();
console.log('ONLY-DB (static verticals author none of these):', onlyDb.length);
const g2={};for(const p of onlyDb){const t=p.split('.').slice(0,3).join('.');g2[t]=(g2[t]||0)+1;}
console.log(Object.entries(g2).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>String(v).padStart(4)+' '+k).join('\n'));
fs.writeFileSync('reaud-A-only-static.txt', onlyStatic.join('\n'));
fs.writeFileSync('reaud-A-only-db.txt', onlyDb.join('\n'));
