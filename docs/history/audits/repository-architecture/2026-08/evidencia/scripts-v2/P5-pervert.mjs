import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const SP='/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad';
const m = require(SP+'/P5-bundle2.cjs');
const db = new Set(fs.readFileSync(SP+'/P5-db-reachable.txt','utf8').split('\n').filter(Boolean));
function leaves(v,p,o){ if(v===null||typeof v!=='object'){o.push([p,v]);return;} if(Array.isArray(v)){v.forEach((x,i)=>leaves(x,p+'['+i+']',o));return;} const ks=Object.keys(v); if(!ks.length)return; for(const k of ks) leaves(v[k],p?p+'.'+k:k,o); }
const norm=s=>s.replace(/\[\d+\]/g,'[]');
const META=new Set(['id','name','extends']);
console.log('vertical | authored(defined) | authored∩DB | authored\\DB | % inexpressible');
for(const v of ['bithire','evnto','rottay']){
  const o=[]; leaves(m.FIRST_PARTY_THEMES[v],'',o);
  const def=[...new Set(o.filter(([p,val])=>val!==undefined).map(([p])=>norm(p)))].filter(p=>!META.has(p.split('.')[0]));
  const inDb=def.filter(p=>db.has(p));
  const out=def.filter(p=>!db.has(p));
  console.log(v.padEnd(9), String(def.length).padStart(5), String(inDb.length).padStart(6), String(out.length).padStart(6), '  '+(100*out.length/def.length).toFixed(1)+'%');
  const g={}; for(const p of out){const t=p.split('.').slice(0,2).join('.');g[t]=(g[t]||0)+1;}
  console.log('   top gaps:', Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,c])=>k+':'+c).join('  '));
}
