const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
const C=JSON.parse(fs.readFileSync(B+'classification-core.json','utf8'));
const IMPORTANT=/color-(bg|text|border|primary)|surface|button-(primary|secondary)-(bg|color|border)|sidebar-(bg|item)|table-(bg|row-bg|header-bg)|card-(bg|border)|input-(bg|border)|control-ink|on-primary|modal-bg/;
for(const [v,d] of Object.entries(C.verticals)){
  console.log('\n#### '+v+' ####');
  for(const st of ['default','light']){
    const bs=Object.values(d.names).filter(n=>n.perState[st].result==='B');
    if(!bs.length) continue;
    console.log(' -- state '+st+' B count='+bs.length+' (reachable='+bs[0].perState[st].reachable+') top by importance:');
    bs.sort((a,b)=>(IMPORTANT.test(b.name)?1:0)-(IMPORTANT.test(a.name)?1:0)||a.name.localeCompare(b.name));
    bs.slice(0,14).forEach(n=>{const p=n.perState[st];console.log('   '+n.name+'\n      compiled='+p.compiledValue+'  ['+n.compiled.file+':'+n.compiled.line+']\n      extension='+p.extensionValue+'  ['+p.extensionFile+':'+p.extensionLine+'] §'+p.extensionSection);});
  }
  const as=Object.values(d.names).filter(n=>n.perState.default.result==='A'||n.perState.light.result==='A');
  console.log(' -- A (exact duplication) count='+as.length+' sample:');
  as.slice(0,6).forEach(n=>console.log('   '+n.name+' = '+n.compiled.value));
}
