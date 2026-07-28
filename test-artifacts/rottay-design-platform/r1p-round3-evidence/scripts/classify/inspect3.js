const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
const J=v=>JSON.parse(fs.readFileSync(B+v+'-overlap.json','utf8'));
for(const v of ['bithire','evnto','rottay']){
  const j=J(v);
  console.log('\n======== '+v+' ========');
  console.log('counts:',JSON.stringify(j.counts));
  console.log('compiledSelector:',j.cascadeByState.compiledSelector);
  for(const [k,s] of Object.entries(j.cascadeByState.states)){
    console.log(` state=${k} applies=${s.compiledBlockApplies} spec=${JSON.stringify(s.compiledSpecificity)} arms=${JSON.stringify(s.compiledSelectorArmsMatchingState)} total=${s.sharedNamesTotal} root=${s.overriddenAtRoot} desc=${s.overriddenOnlyInsideADescendantSubtree} survives=${s.compiledValueSurvives}`);
  }
  // distinct extension selectors + atRules
  const selCount={},atCount={},secCount={};
  for(const r of j.overlapRecords){
    for(const d of r.extensionDeclarations){
      selCount[d.selector]=(selCount[d.selector]||0)+1;
      const a=JSON.stringify(d.atRules||[]);
      atCount[a]=(atCount[a]||0)+1;
      secCount[d.sectionTitle||'(none)']=(secCount[d.sectionTitle||'(none)']||0)+1;
    }
  }
  console.log(' TOP extension selectors:');
  Object.entries(selCount).sort((a,b)=>b[1]-a[1]).slice(0,25).forEach(([k,n])=>console.log('   '+n+'  '+k));
  console.log(' distinct selector count:',Object.keys(selCount).length);
  console.log(' atRules variants:');
  Object.entries(atCount).sort((a,b)=>b[1]-a[1]).slice(0,15).forEach(([k,n])=>console.log('   '+n+'  '+k));
  console.log(' sections:');
  Object.entries(secCount).sort((a,b)=>b[1]-a[1]).forEach(([k,n])=>console.log('   '+n+'  '+k));
  // compiled selectors distinct
  const cs={};
  for(const r of j.overlapRecords) for(const d of r.compiledDeclarations) cs[d.selector]=(cs[d.selector]||0)+1;
  console.log(' compiled selectors:',JSON.stringify(Object.keys(cs)));
}
