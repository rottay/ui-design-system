const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
const C=JSON.parse(fs.readFileSync(B+'classification.json','utf8'));
console.log('########## evnto B (reachable, rendered-different) ##########');
for(const n of Object.values(C.verticals.evnto.names)) if(n.perState.default.result==='B'){const p=n.perState.default;console.log(' '+n.name+'\n   compiled = '+p.compiledValue+'   ['+p.compiledFileLine+']\n   extension= '+p.extensionValue+'   ['+p.extensionFileLine+']\n   equality='+JSON.stringify(p.equality));}
console.log('\n########## evnto strict-B that are rendered-equal ##########');
for(const n of Object.values(C.verticals.evnto.names)) if(n.perState.default.resultStrictTextual==='B'&&n.perState.default.result==='A')console.log('  '+n.name+' : '+n.perState.default.compiledValue+' vs '+n.perState.default.extensionValue+' ('+n.perState.default.equality.mode+')');
console.log('\n########## bithire B (reachable default, rendered-different) count + list ##########');
const bb=Object.values(C.verticals.bithire.names).filter(n=>n.perState.default.result==='B');
console.log('count='+bb.length);
for(const n of bb){const p=n.perState.default;console.log(' '+n.name+' | c='+p.compiledValue+' | e='+p.extensionValue+' | '+p.equality.mode+' | '+(p.equality.detail||'')+' | §'+p.extensionSection+' ['+p.extensionFileLine+']');}
