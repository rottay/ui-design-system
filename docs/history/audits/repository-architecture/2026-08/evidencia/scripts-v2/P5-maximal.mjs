import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const SP = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad';
const m = require(SP + '/P5-bundle.cjs');
const S = m.TENANT_THEME_CONFIG_SCHEMA;

function val(node){
  switch(node.type){
    case 'literal': return node.value;
    case 'enum': return node.values[node.values.length-1];
    case 'number': return node.min ?? 1;
    case 'string':
      if(node.format==='color'||node.format==='hex-color') return '#123456';
      if(node.format==='font-family') return 'Probe, sans-serif';
      if(node.format==='identifier') return 'probe';
      if(node.format==='slug') return 'probe';
      return '1px';
    default: return undefined;
  }
}
function build(node, bgMode){
  if(node.type!=='object') return val(node);
  const out={};
  for(const [k,v] of Object.entries(node.fields||{})){
    if(k==='backgroundMode'){ out[k]=bgMode; continue; }
    out[k]=build(v,bgMode);
  }
  return out;
}
function leaves(v,p,o){
  if(v===null||typeof v!=='object'){o.push([p,v]);return;}
  if(Array.isArray(v)){ v.forEach((x,i)=>leaves(x,p+'['+i+']',o)); return;}
  const ks=Object.keys(v); if(!ks.length){o.push([p,'<EMPTY-OBJ>']);return;}
  for(const k of ks) leaves(v[k],p?p+'.'+k:k,o);
}
const norm = s => s.replace(/\[\d+\]/g,'[]');

const reach = new Set();
const reachDefined = new Set();
let undefLeaves = 0;
for(const bg of ['light','dark','auto']){
  for(const docName of ['simple','advanced']){
    const doc = build(S.documents[docName], bg);
    for(const dm of ['light','dark']){
      let env;
      try { env = m.migrateV1(doc, dm); }
      catch(err){ console.error('THROW', docName, bg, dm, err.message); continue; }
      const o=[]; leaves(env.patch,'',o);
      for(const [p,v] of o){ const n=norm(p); reach.add(n); if(v===undefined) undefLeaves++; else reachDefined.add(n); }
    }
  }
}
const arr=[...reach].sort();
console.log('DB-REACHABLE ThemePatch leaves (any):', arr.length);
console.log('DB-REACHABLE with defined value     :', reachDefined.size);
console.log('undefined-valued leaf emissions     :', undefLeaves);
const g={};for(const p of arr){const t=p.split('.')[0];g[t]=(g[t]||0)+1;}
console.log(JSON.stringify(g,null,1));
console.log('--- modes.* ---');
console.log(arr.filter(x=>x.startsWith('modes.')).join('\n'));
fs.writeFileSync(SP+'/P5-db-reachable.txt', arr.join('\n'));
