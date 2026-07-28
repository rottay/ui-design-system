const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
for(const v of ['bithire','evnto','rottay']){
  const j=JSON.parse(fs.readFileSync(B+v+'-overlap.json','utf8'));
  console.log('==== '+v+' ====');
  console.log('top keys:',Object.keys(j));
  for(const k of Object.keys(j)){
    const val=j[k];
    if(Array.isArray(val)) console.log('  '+k+': array len '+val.length);
    else if(val&&typeof val==='object') console.log('  '+k+': object keys '+JSON.stringify(Object.keys(val)).slice(0,300));
    else console.log('  '+k+': '+JSON.stringify(val).slice(0,200));
  }
  if(j.overlapRecords&&j.overlapRecords.length){
    console.log('  --- overlapRecords[0] ---');
    console.log(JSON.stringify(j.overlapRecords[0],null,1).slice(0,3000));
  }
}
