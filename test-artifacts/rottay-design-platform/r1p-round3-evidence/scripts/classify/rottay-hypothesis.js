const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
const C=JSON.parse(fs.readFileSync(B+'classification.json','utf8'));
const norm=v=>String(v).replace(/\s+/g,' ').trim().toLowerCase();
for(const v of ['rottay','bithire','evnto']){
  const d=C.verticals[v];
  let eqDefault=0,neqDefault=0,eqLight=0,neqLight=0,noDefault=0,noLight=0;
  const neqSamples=[];
  for(const n of Object.values(d.names)){
    const cv=norm(n.compiled.value);
    const dv=n.perState.default.extensionValue; const lv=n.perState.light.extensionValue;
    if(dv==null) noDefault++; else if(norm(dv)===cv) eqDefault++; else {neqDefault++; if(neqSamples.length<8)neqSamples.push(n.name+': compiled='+n.compiled.value+' vs defaultExt='+dv);}
    if(lv==null) noLight++; else if(norm(lv)===cv) eqLight++; else neqLight++;
  }
  console.log('== '+v+' (n='+Object.keys(d.names).length+')');
  console.log('   compiled == extension DEFAULT-state value : '+eqDefault+' equal / '+neqDefault+' different / '+noDefault+' no-decl');
  console.log('   compiled == extension LIGHT-state value   : '+eqLight+' equal / '+neqLight+' different / '+noLight+' no-decl');
  if(neqSamples.length){console.log('   sample differences (default-state):'); neqSamples.forEach(s=>console.log('     '+s));}
}
