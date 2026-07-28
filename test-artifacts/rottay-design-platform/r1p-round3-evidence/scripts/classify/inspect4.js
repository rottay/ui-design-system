const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
for(const v of ['bithire','evnto','rottay']){
  const j=JSON.parse(fs.readFileSync(B+v+'-overlap.json','utf8'));
  console.log('\n======== '+v+' contradictionCheck ========');
  const c=j.contradictionCheck;
  for(const k of Object.keys(c)){
    const val=c[k];
    if(Array.isArray(val)){console.log(' '+k+': array len '+val.length); val.slice(0,8).forEach(x=>console.log('    '+JSON.stringify(x).slice(0,500)));}
    else console.log(' '+k+': '+JSON.stringify(val).slice(0,1200));
  }
  console.log(' -- method.buckets:',JSON.stringify(j.method.buckets).slice(0,600));
  // important flags present?
  let imp=0; for(const r of j.overlapRecords){for(const d of r.extensionDeclarations) if(d.important) imp++;}
  console.log(' extension !important decls in overlap:',imp);
}
