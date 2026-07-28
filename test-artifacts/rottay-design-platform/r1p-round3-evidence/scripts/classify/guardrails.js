const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
const j=JSON.parse(fs.readFileSync(B+'bithire-overlap.json','utf8'));
const C=JSON.parse(fs.readFileSync(B+'classification.json','utf8'));
const g=j.overlapRecords.filter(r=>r.extensionDeclarations.some(d=>d.sectionTitle==='BITHIRE PRODUCTION GUARDRAILS (TOKEN REMAP)'));
console.log('guardrail shared names: '+g.length);
const cat={};
for(const r of g){const f=C.verticals.bithire.names[r.name].final;cat[f]=(cat[f]||0)+1;}
console.log('final categories among guardrail names: '+JSON.stringify(cat));
const strict={};
for(const r of g){const f=C.verticals.bithire.names[r.name].finalStrictTextual;strict[f]=(strict[f]||0)+1;}
console.log('strict-textual categories: '+JSON.stringify(strict));
console.log('\n-- sample of 18 with nearest comment --');
g.slice(0,18).forEach(r=>{const d=r.extensionDeclarations.find(x=>x.sectionTitle==='BITHIRE PRODUCTION GUARDRAILS (TOKEN REMAP)');
 const n=C.verticals.bithire.names[r.name];
 console.log(' '+r.name+' -> '+n.final+' | compiled='+n.compiled.value+' | ext='+d.value.replace(/\s+/g,' ')+' | comment@'+(d.nearestComment?d.nearestComment.line+' "'+d.nearestComment.title+'"':'NONE'));});
// scan the section text for owner/retirement markers
const css=fs.readFileSync(B+'snapshots/bithire/_source/extension.css','utf8').split('\n');
const start=3391,end=4010;
const seg=css.slice(start-1,end).join('\n');
const kw=['owner','Owner','OWNER','retire','Retire','RETIRE','remove by','TODO','FIXME','expires','deadline','sunset','temporary','WO-','ticket','until'];
console.log('\n-- keyword scan in guardrails section (lines '+start+'-'+end+') --');
kw.forEach(k=>{const c=(seg.match(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length; if(c)console.log('   "'+k+'": '+c+' occurrence(s)');});
// all comments in the section
console.log('\n-- comment lines in section --');
css.slice(start-1,end).forEach((l,i)=>{if(/^\s*(\/\*|\*|\*\/)/.test(l)&&l.trim().length>3)console.log('   '+(start+i)+': '+l.trim().slice(0,140));});
