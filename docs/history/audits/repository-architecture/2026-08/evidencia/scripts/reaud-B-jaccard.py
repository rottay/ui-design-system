import json,glob,re,os,collections,itertools
ROOT='/Users/daniel/Developer/Rottay/ui-design-system/packages/core'
css=glob.glob(ROOT+'/src/**/*.css',recursive=True)
texts={p:open(p,encoding='utf8',errors='replace').read() for p in css}
DEF=re.compile(r'(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]*)',re.S)
VAR=re.compile(r'var\(\s*(--[A-Za-z0-9_-]+)')
feeds=collections.defaultdict(set)
for p,t in texts.items():
    for m in DEF.finditer(t):
        for v in VAR.findall(m.group(2)): feeds[v].add(m.group(1))
readers=collections.defaultdict(set)
for p,t in texts.items():
    for v in set(VAR.findall(t)): readers[v].add(p)
def closure(seeds):
    seen=set(seeds); st=list(seeds)
    while st:
        x=st.pop()
        for y in feeds.get(x,()):
            if y not in seen: seen.add(y); st.append(y)
    return seen
ctrls={}
for f in sorted(glob.glob(ROOT+'/manifest/controls/*.json')):
    d=json.load(open(f)); ctrls[d['controlId']]=set(d.get('declaredOutputs',{}).get('channels',[]))
FS={}; CL={}
for cid,seeds in ctrls.items():
    cl=closure(seeds); CL[cid]=cl
    fs=set()
    for c in cl: fs|=readers.get(c,set())
    FS[cid]=fs
print('Jaccard sobre FILE SETS (transitive closure, src/**/*.css):')
rows=[]
for a,b in itertools.combinations(sorted(FS),2):
    A,B=FS[a],FS[b]
    if not A and not B: continue
    u=len(A|B)
    j=len(A&B)/u if u else 0
    rows.append((j,a,b,len(A),len(B),len(A&B)))
rows.sort(reverse=True)
for j,a,b,na,nb,ni in rows[:18]:
    print(f'  J={j:.3f}  {a:28} x {b:28} |A|={na:3} |B|={nb:3} inter={ni:3}')
print()
print('Jaccard sobre CHANNEL CLOSURES:')
rows2=[]
for a,b in itertools.combinations(sorted(CL),2):
    A,B=CL[a],CL[b]
    if not A and not B: continue
    u=len(A|B); j=len(A&B)/u if u else 0
    rows2.append((j,a,b,len(A),len(B),len(A&B)))
rows2.sort(reverse=True)
for j,a,b,na,nb,ni in rows2[:15]:
    print(f'  J={j:.3f}  {a:28} x {b:28} |A|={na:3} |B|={nb:3} inter={ni:3}')
