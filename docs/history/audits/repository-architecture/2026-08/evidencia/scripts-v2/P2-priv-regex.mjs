import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const CORE='/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
function walk(d,a=[]){let e;try{e=readdirSync(d,{withFileTypes:true})}catch{return a}for(const x of e){if(x.name==='node_modules')continue;const f=join(d,x.name);if(x.isDirectory())walk(f,a);else if(x.name.endsWith('.css'))a.push(f)}return a}
const files=walk(join(CORE,'src'));
const run=(strip,label)=>{
  const decl=new Set(), cons=new Set();
  for(const f of files){
    let t=readFileSync(f,'utf8');
    if(strip) t=t.replace(/\/\*[\s\S]*?\*\//g,'');
    for(const m of t.matchAll(/(--_ds-[a-zA-Z0-9_-]+)\s*:/g)) decl.add(m[1]);
    for(const m of t.matchAll(/var\(\s*(--_ds-[a-zA-Z0-9_-]+)/g)) cons.add(m[1]);
  }
  const cnd=[...cons].filter(x=>!decl.has(x));
  const dnc=[...decl].filter(x=>!cons.has(x));
  const uni=new Set([...decl,...cons]);
  console.log(label+': declared='+decl.size+' consumed='+cons.size+' union='+uni.size+' consumed-not-declared='+cnd.length+' declared-not-consumed='+dnc.length+' ['+dnc.join(', ')+']');
  return {decl,cons};
};
const a=run(false,'regex CRUDO (con comentarios)');
const b=run(true, 'regex con comentarios STRIPEADOS');
