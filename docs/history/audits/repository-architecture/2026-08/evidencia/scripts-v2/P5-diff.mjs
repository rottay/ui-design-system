import fs from 'node:fs';
const SP='/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad';
const rd=f=>fs.readFileSync(SP+'/'+f,'utf8').split('\n').filter(Boolean);
const db=new Set(rd('P5-db-reachable.txt'));
const all=rd('P5-union-all.txt');
const defined=new Set(rd('P5-union-defined.txt'));
const never=new Set(rd('P5-union-neverdefined.txt'));

const onlyStaticAll=all.filter(p=>!db.has(p));
const onlyStaticDefined=[...defined].filter(p=>!db.has(p)).sort();
const onlyStaticNever=[...never].filter(p=>!db.has(p)).sort();
const onlyDb=[...db].filter(p=>!all.includes(p)).sort();  // slow but fine
const allSet=new Set(all);
const onlyDb2=[...db].filter(p=>!allSet.has(p)).sort();

const pct=(n,d)=>(100*n/d).toFixed(1)+'%';
console.log('=== CLOUD FRAMING (universe = every materialized leaf) ===');
console.log('static leaves (union, sans id/name/extends):', all.length);
console.log('DB-reachable                              :', db.size);
console.log('ONLY-STATIC                               :', onlyStaticAll.length, pct(onlyStaticAll.length, all.length));
console.log('ONLY-DB                                   :', onlyDb2.length);
console.log();
console.log('=== CODEX FRAMING (universe = leaves with a value in >=1 vertical) ===');
console.log('defined leaves                            :', defined.size);
console.log('ONLY-STATIC among defined                 :', onlyStaticDefined.length, pct(onlyStaticDefined.length, defined.size));
console.log('never-defined leaves                      :', never.size);
console.log('  ... of which also DB-unreachable        :', onlyStaticNever.length);
console.log('  ... of which DB-reachable (DB can write where NO vertical does):', never.size-onlyStaticNever.length);
console.log();
function group(list,depth,label,n=15){
  const g={}; for(const p of list){const t=p.split('.').slice(0,depth).join('.'); g[t]=(g[t]||0)+1;}
  console.log('--- '+label+' (top '+n+', depth '+depth+') ---');
  console.log(Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([k,v])=>String(v).padStart(5)+'  '+k).join('\n'));
  return g;
}
group(onlyStaticAll,1,'ONLY-STATIC (Cloud 5763) by root',20);
console.log();
group(onlyStaticAll,3,'ONLY-STATIC (Cloud 5763) by 3-seg',25);
console.log();
group(onlyStaticDefined,1,'ONLY-STATIC ∩ DEFINED (Codex 1439) by root',20);
console.log();
group(onlyStaticDefined,3,'ONLY-STATIC ∩ DEFINED by 3-seg',30);
console.log();
group([...never],1,'NEVER-DEFINED (Codex 5187) by root',20);
console.log();
group([...never],3,'NEVER-DEFINED by 3-seg',15);
console.log();
console.log('ONLY-DB list:'); console.log(onlyDb2.join('\n'));
fs.writeFileSync(SP+'/P5-only-static-defined.txt', onlyStaticDefined.join('\n'));
fs.writeFileSync(SP+'/P5-only-static-all.txt', onlyStaticAll.join('\n'));
