const fs=require('fs');
const B='/private/tmp/rottay-design-platform-independent-audit-round-3/';
for(const v of ['bithire','evnto','rottay']){
  const j=JSON.parse(fs.readFileSync(B+v+'-overlap.json','utf8'));
  console.log('\n======== '+v+' ========');
  console.log('counts:',JSON.stringify(j.counts));
  console.log('cascadeByState.method:',JSON.stringify(j.cascadeByState.method).slice(0,800));
  console.log('cascadeByState.compiledSelector:',JSON.stringify(j.cascadeByState.compiledSelector));
  const st=j.cascadeByState.states;
  console.log('states type:',Array.isArray(st)?'array':'object','keys/len:',Array.isArray(st)?st.length:Object.keys(st));
  const arr=Array.isArray(st)?st:Object.entries(st).map(([k,x])=>({__k:k,...x}));
  for(const s of arr){
    console.log('  --- state entry keys:',Object.keys(s));
    for(const k of Object.keys(s)){
      const val=s[k];
      if(Array.isArray(val)) console.log('     '+k+': array len '+val.length+' e0='+JSON.stringify(val[0]).slice(0,400));
      else if(val&&typeof val==='object') console.log('     '+k+': obj keys '+JSON.stringify(Object.keys(val)).slice(0,300));
      else console.log('     '+k+': '+JSON.stringify(val).slice(0,300));
    }
  }
}
