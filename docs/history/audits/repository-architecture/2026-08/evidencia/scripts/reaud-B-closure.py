import json,glob,re,os,collections,sys
ROOT='/Users/daniel/Developer/Rottay/ui-design-system/packages/core'
css=[p for p in glob.glob(ROOT+'/src/**/*.css',recursive=True)]
texts={p:open(p,encoding='utf8',errors='replace').read() for p in css}
print('css files scanned:',len(css))
DEF=re.compile(r'(--[A-Za-z0-9_-]+)\s*:\s*([^;{}]*)',re.S)
VAR=re.compile(r'var\(\s*(--[A-Za-z0-9_-]+)')
feeds=collections.defaultdict(set)   # src -> set(dst)  (dst derives from src)
defined=set()
for p,t in texts.items():
    for m in DEF.finditer(t):
        dst=m.group(1); val=m.group(2)
        defined.add(dst)
        for v in VAR.findall(val):
            feeds[v].add(dst)
# readers index: channel -> set(files) where var(channel) appears
readers=collections.defaultdict(set)
for p,t in texts.items():
    for v in set(VAR.findall(t)):
        readers[v].add(p)
def closure(seeds):
    seen=set(seeds); stack=list(seeds)
    while stack:
        x=stack.pop()
        for y in feeds.get(x,()):
            if y not in seen:
                seen.add(y); stack.append(y)
    return seen
MOD='/src/foundation/tokens/css/runtime/engines/modern/skin/'
PRE='/src/foundation/tokens/css/presentation/components/skin/'
ctrls={}
for f in sorted(glob.glob(ROOT+'/manifest/controls/*.json')):
    d=json.load(open(f)); ctrls[d['controlId']]=d
# extra seeds discovered from source for controls whose declared set is unrepresentative
EXTRA=json.loads(os.environ.get('EXTRA_SEEDS','{}'))
rows=[]
for cid,d in ctrls.items():
    seeds=set(d.get('declaredOutputs',{}).get('channels',[]))|set(EXTRA.get(cid,[]))
    cl=closure(seeds)
    files=set()
    for c in cl: files|=readers.get(c,set())
    mo=len([p for p in files if MOD in p]); pr=len([p for p in files if PRE in p])
    rows.append((cid,d['tier'],len(seeds),len(cl),len(files),mo,pr))
rows.sort(key=lambda r:-(r[5]+r[6]))
print(f"{'control':28} {'tier':9} {'seed':>4} {'closure':>7} {'anyfile':>7} {'modern':>6} {'presen':>6} {'skinTOT':>7}")
for r in rows:
    print(f"{r[0]:28} {r[1]:9} {r[2]:4} {r[3]:7} {r[4]:7} {r[5]:6} {r[6]:6} {r[5]+r[6]:7}")
