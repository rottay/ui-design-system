import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { effectiveMap } from './effective-map.mjs';
const CORE='/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const norm=v=>v==null?null:v.replace(/\s+/g,' ').replace(/\(\s+/g,'(').replace(/\s+\)/g,')').trim().toLowerCase();
const out={};
for (const slug of ['bithire','evnto','rottay']){
  const rel=`packages/core/src/foundation/tokens/css/facade/artifacts/${slug}/index.css`;
  const before=execSync(`git -C /Users/daniel/Developer/Rottay/ui-design-system show HEAD:${rel}`,{maxBuffer:1<<28}).toString();
  const after=readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/index.css`,'utf-8');
  out[slug]={};
  for (const state of ['default','light','dark']){
    const b=Object.fromEntries([...effectiveMap(before,state,slug)].map(([k,v])=>[k,v.value]));
    const a=Object.fromEntries([...effectiveMap(after,state,slug)].map(([k,v])=>[k,v.value]));
    const added=Object.keys(a).filter(k=>!(k in b));
    const dropped=Object.keys(b).filter(k=>!(k in a));
    const changed=Object.keys(b).filter(k=>k in a && norm(b[k])!==norm(a[k])).map(k=>({k,before:b[k],after:a[k]}));
    out[slug][state]={added:added.map(k=>({k,v:a[k]})),dropped:dropped.map(k=>({k,was:b[k]})),changed};
    console.log(`${slug} ${state}: +${added.length} -${dropped.length} ~${changed.length}`);
  }
}
writeFileSync('/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/true-acid-delta.json',JSON.stringify(out,null,1));
