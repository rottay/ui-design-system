const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
const C=JSON.parse(fs.readFileSync(B+'classification.json','utf8'));
const IMP=/color-(bg-primary|bg-secondary|text-primary|text-secondary|border|primary)$|surface-(canvas|card|panel)$|button-primary-(bg|color)$|sidebar-bg$|modal-bg$|table-row-bg$/;
console.log('##### rottay light-state B (unreachable in product; live in showroom) — high-traffic sample #####');
const rb=Object.values(C.verticals.rottay.names).filter(n=>n.perState.light.result==='B');
console.log('total B in light state = '+rb.length);
rb.sort((a,b)=>(IMP.test(b.name)?1:0)-(IMP.test(a.name)?1:0)||a.name.localeCompare(b.name));
rb.slice(0,16).forEach(n=>{const p=n.perState.light;console.log(' '+n.name+'\n   compiled(light) = '+p.compiledValue+'  ['+p.compiledFileLine+']\n   extension(light)= '+p.extensionValue+'  ['+p.extensionFileLine+']\n   default-state extension (SOLE AUTHOR) = '+n.perState.default.extensionValue+'  ['+n.perState.default.extensionFileLine+']');});
console.log('\n##### rottay: the 3 compiled-survives names in light #####');
Object.values(C.verticals.rottay.names).filter(n=>n.perState.light.result==='COMPILED_SURVIVES').forEach(n=>console.log('  '+n.name+' compiled='+n.perState.light.compiledValue+' | default-state ext='+n.perState.default.extensionValue));
console.log('\n##### UNKNOWN / inconclusive equality (per vertical, reachable states) #####');
for(const [v,d] of Object.entries(C.verticals)){
  const u=Object.values(d.names).filter(n=>n.facets.includes('B-resolvedEquality-UNKNOWN'));
  console.log(' '+v+': '+u.length);
  u.slice(0,50).forEach(n=>{const st=['default','light','dark'].find(s=>n.perState[s].equality&&n.perState[s].equality.equal===null);console.log('    '+n.name+' ('+st+', reachable='+n.perState[st].reachable+') '+n.perState[st].equality.mode);});
}
console.log('\n##### E and C names #####');
for(const [v,d] of Object.entries(C.verticals)){
  const e=Object.values(d.names).filter(n=>n.final==='E').map(n=>n.name);
  const c=Object.values(d.names).filter(n=>n.final==='C').map(n=>n.name);
  console.log(' '+v+' E='+JSON.stringify(e)+' C='+JSON.stringify(c));
}
