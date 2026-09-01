import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const m = require('./reaud-A-mig.cjs');
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
  if(v===null||typeof v!=='object'){o.push(p);return;}
  if(Array.isArray(v)){ v.forEach((x,i)=>leaves(x,p+'['+i+']',o)); return;}
  for(const [k,x] of Object.entries(v)) leaves(x,p?p+'.'+k:k,o);
}

const reach = new Set();
for(const bg of ['light','dark','auto']){
  for(const docName of ['simple','advanced']){
    const doc = build(S.documents[docName], bg);
    const env = m.migrateV1(doc, 'light');
    const env2 = m.migrateV1(doc, 'dark');
    for(const e of [env,env2]){ const o=[]; leaves(e.patch,'',o); o.forEach(x=>reach.add(x)); }
  }
}
const arr=[...reach].sort();
console.log('DB-REACHABLE ThemePatch leaves:', arr.length);
const g={};for(const p of arr){const t=p.split('.')[0];g[t]=(g[t]||0)+1;}
console.log(JSON.stringify(g,null,1));
console.log('--- modes.* ---');
console.log(arr.filter(x=>x.startsWith('modes.')).join('\n'));
import('node:fs').then(fs=>fs.writeFileSync('reaud-A-db-reachable.txt', arr.join('\n')));
