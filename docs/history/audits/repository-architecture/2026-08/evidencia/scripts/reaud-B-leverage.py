import json,glob,os,re,collections
ROOT='/Users/daniel/Developer/Rottay/ui-design-system/packages/core'
MOD=glob.glob(ROOT+'/src/foundation/tokens/css/runtime/engines/modern/skin/*.css')
PRE=glob.glob(ROOT+'/src/foundation/tokens/css/presentation/components/skin/*.css')
files=[(p,open(p,encoding='utf8',errors='replace').read()) for p in MOD+PRE]
print('modern skin files',len(MOD),'presentation skin files',len(PRE))
ctrls={}
for f in sorted(glob.glob(ROOT+'/manifest/controls/*.json')):
    d=json.load(open(f))
    ctrls[d['controlId']]=d
rows=[]
for cid,d in ctrls.items():
    chans=d.get('declaredOutputs',{}).get('channels',[])
    per={}
    filesetall=set()
    for c in chans:
        pat='var('+c
        hit=set()
        for p,t in files:
            if pat in t: hit.add(p)
        per[c]=len(hit)
        filesetall|=hit
    mo=len([p for p in filesetall if '/modern/skin/' in p])
    pr=len([p for p in filesetall if '/components/skin/' in p])
    rows.append((cid,d.get('tier'),len(chans),len(filesetall),mo,pr,per))
rows.sort(key=lambda r:-r[3])
print(f"{'control':30} {'tier':9} {'#ch':>4} {'files':>6} {'mod':>4} {'pres':>5}  per-channel")
for cid,tier,nch,tot,mo,pr,per in rows:
    print(f"{cid:30} {tier:9} {nch:4} {tot:6} {mo:4} {pr:5}  "+', '.join(f'{k}={v}' for k,v in per.items()))
