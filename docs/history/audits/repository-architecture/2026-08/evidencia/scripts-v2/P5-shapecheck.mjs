import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const SP = '/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad';
const m = require(SP + '/P5-bundle.cjs');
function leaves(v,p,o){ if(v===null||typeof v!=='object'){o.push(p);return;} if(Array.isArray(v)){v.forEach((x,i)=>leaves(x,p+'['+i+']',o));return;} const ks=Object.keys(v); if(!ks.length){return;} for(const k of ks) leaves(v[k],p?p+'.'+k:k,o); }
const s={};
for(const v of ['bithire','evnto','rottay']){ const o=[]; leaves(m.FIRST_PARTY_THEMES[v],'',o); s[v]=new Set(o); }
const b=s.bithire,e=s.evnto,r=s.rottay;
const diff=(a,x)=>[...a].filter(k=>!x.has(k));
console.log('sizes', b.size, e.size, r.size);
console.log('bithire\\evnto', diff(b,e).length, 'evnto\\bithire', diff(e,b).length);
console.log('bithire\\rottay', diff(b,r).length, 'rottay\\bithire', diff(r,b).length);
console.log('sample b\\e', diff(b,e).slice(0,10));
console.log('sample e\\b', diff(e,b).slice(0,10));
console.log('sample r\\b', diff(r,b).slice(0,10));
