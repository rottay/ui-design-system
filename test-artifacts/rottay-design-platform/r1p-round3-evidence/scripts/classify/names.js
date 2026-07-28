const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
for(const v of ['bithire','evnto','rottay']){
  const j=JSON.parse(fs.readFileSync(B+v+'-overlap.json','utf8'));
  const names=j.overlapRecords.map(r=>r.name).sort();
  console.log('\n===== '+v+' ('+names.length+') =====');
  // group by second segment stem
  const stems={};
  for(const n of names){const p=n.replace(/^--ds-/,'').split('-')[0]; (stems[p]=stems[p]||[]).push(n);}
  console.log(Object.entries(stems).sort((a,b)=>b[1].length-a[1].length).map(([k,v2])=>k+'('+v2.length+')').join(' '));
}
