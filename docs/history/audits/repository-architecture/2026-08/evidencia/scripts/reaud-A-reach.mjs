import fs from 'node:fs'; import path from 'node:path';
const ROOT='/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src';
const files=[];(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(e.name==='node_modules')return;w(p);}else if(e.name.endsWith('.css'))files.push(p);}})(ROOT);
const defs=new Map(), paint=[];
const declRe=/(--[A-Za-z0-9_-]+|[a-z-]+)\s*:\s*([^;{}]+)[;}]/g, varRe=/var\(\s*(--[A-Za-z0-9_-]+)/g;
for(const f of files){const s=fs.readFileSync(f,'utf8');let m;declRe.lastIndex=0;
 while((m=declRe.exec(s))){const prop=m[1],val=m[2];const reads=new Set();let v;varRe.lastIndex=0;while((v=varRe.exec(val)))reads.add(v[1]);
 if(!reads.size)continue; if(prop.startsWith('--')){if(!defs.has(prop))defs.set(prop,new Set());for(const r of reads)defs.get(prop).add(r);} else paint.push({prop,reads,file:f});}}
const rev=new Map(); for(const[p,rs]of defs)for(const r of rs){if(!rev.has(r))rev.set(r,new Set());rev.get(r).add(p);}
function closure(seeds){const seen=new Set(seeds);const q=[...seeds];while(q.length){const x=q.pop();for(const p of(rev.get(x)||[]))if(!seen.has(p)){seen.add(p);q.push(p);}}return seen;}
const art=JSON.parse(fs.readFileSync('reaud-A-tm-artifact.json','utf8'));
const moved=Object.keys(art.variables).concat(...(art.modeDeltas||[]).map(b=>Object.keys(b.variables)));
const uniq=[...new Set(moved)];
const c=closure(uniq);
const hits=paint.filter(p=>[...p.reads].some(r=>c.has(r)));
const fset=new Set(hits.map(h=>h.file));
console.log('themanagement moved channels:', uniq.length);
console.log('transitive closure:', c.size, 'custom props');
console.log('paint declarations reached:', hits.length, 'of', paint.length, '=', (100*hits.length/paint.length).toFixed(1)+'%');
console.log('css files touched:', fset.size, 'of', files.length, '=', (100*fset.size/files.length).toFixed(1)+'%');
// per-directory
const byDir={}; for(const f of fset){const d=f.replace(ROOT+'/','').split('/').slice(0,6).join('/').replace(/\/[^/]+\.css$/,'');byDir[d]=(byDir[d]||0)+1;}
console.log(Object.entries(byDir).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([k,v])=>String(v).padStart(4)+' '+k).join('\n'));
// which css files are NOT touched at all
const untouched=files.filter(f=>!fset.has(f));
console.log(); console.log('UNTOUCHED css files:', untouched.length);
console.log(untouched.slice(0,25).map(f=>'  '+f.replace(ROOT+'/','')).join('\n'));
