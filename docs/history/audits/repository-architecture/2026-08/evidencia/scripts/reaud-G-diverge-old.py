import re,sys,collections
base="/private/tmp/claude-502/-Users-daniel-Developer-Rottay/6671f5ef-8630-452c-9957-732a01305a63/scratchpad/old0804/"
pat=re.compile(r'(--ds-[a-zA-Z0-9_-]+)\s*:\s*([^;}]+)')
def load(f):
    d=collections.defaultdict(set)
    with open(base+f,encoding='utf8') as fh:
        for m in pat.finditer(fh.read()):
            d[m.group(1)].add(m.group(2).strip())
    return d
b=load('bithire.css'); e=load('evnto.css'); r=load('rottay.css')
names=set(b)|set(e)|set(r)
same=0; diff=0; onlyone=0
for n in names:
    vals=[frozenset(x[n]) for x in (b,e,r) if n in x]
    if len(vals)<3: onlyone+=1; continue
    if vals[0]==vals[1]==vals[2]: same+=1
    else: diff+=1
print("nombres --ds-* unicos (union 3 artefactos):",len(names))
print("presentes en los 3:",same+diff)
print("  MISMO conjunto de valores en los 3 (indistinguibles):",same, "= %.1f%%"%(100*same/(same+diff)))
print("  con al menos un valor distinto (divergen):",diff, "= %.1f%%"%(100*diff/(same+diff)))
print("no presentes en los 3:",onlyone)
