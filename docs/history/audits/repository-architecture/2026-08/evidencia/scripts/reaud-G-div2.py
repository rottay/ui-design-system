import re,sys,collections
pat=re.compile(r'(--ds-[a-zA-Z0-9_-]+)\s*:\s*([^;}]+)')
def load(base,f):
    d=collections.defaultdict(set)
    with open(base+f,encoding='utf8') as fh:
        for m in pat.finditer(fh.read()):
            d[m.group(1)].add(m.group(2).strip())
    return d
def report(label,base):
    b=load(base,'bithire.css'); e=load(base,'evnto.css'); r=load(base,'rottay.css')
    names=set(b)&set(e)&set(r)
    def bucket(n):
        if re.search(r'color|bg|border|fg|ink|surface|shadow|glass|tint|ramp|palette|accent|primary',n): return 'CROMA'
        if re.search(r'font|type|leading|tracking|letter|weight',n): return 'TIPO'
        if re.search(r'radius|space|gap|size|width|height|density|pad|margin',n): return 'GEOM'
        return 'OTRO'
    agg=collections.defaultdict(lambda:[0,0])
    for n in names:
        d=not (b[n]==e[n]==r[n])
        k=bucket(n); agg[k][1]+=1
        if d: agg[k][0]+=1
    print(label)
    for k in ('CROMA','TIPO','GEOM','OTRO'):
        dv,tt=agg[k]
        print("  %-6s divergen %5d / %5d = %5.1f%%"%(k,dv,tt,100*dv/tt if tt else 0))
report("=== HEAD 2026-08-28 ===",'/Users/daniel/Developer/Rottay/ui-design-system/packages/core/styles/')
report("=== origin/main 2026-08-03 ===",'/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad/old0804/')
