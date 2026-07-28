const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
const susp=/workspace|command|listing|filter|breadcrumb|shell|tab|evidence|ledger|candidate|ticket|event|job|pipeline|recruit|attendee|venue/;
for(const v of ['bithire','evnto','rottay']){
  const j=JSON.parse(fs.readFileSync(B+v+'-overlap.json','utf8'));
  const names=j.overlapRecords.map(r=>r.name).sort().filter(n=>susp.test(n));
  console.log('\n===== '+v+' suspicious ('+names.length+') =====');
  names.forEach(n=>console.log('  '+n));
}
// also: extension-only names with domain stems (context, not classified)
for(const v of ['bithire','evnto','rottay']){
  const j=JSON.parse(fs.readFileSync(B+v+'-overlap.json','utf8'));
  const eo=(j.names.extensionUnique||[]).filter(n=>!j.names.intersection.includes(n));
  const dom=eo.filter(n=>/evidence|ledger|candidate|ticket|event|attendee|venue|recruit|bithire|evnto|rottay|collection-polish/.test(n));
  console.log('\n--- '+v+' extension-ONLY domain-ish ('+dom.length+' of '+eo.length+') ---');
  dom.slice(0,40).forEach(n=>console.log('   '+n));
}
