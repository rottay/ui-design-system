import sys,collections
add=collections.Counter(); dele=collections.Counter(); files=collections.Counter(); commits=collections.defaultdict(set)
cur=None
def bucket(p):
    if p.startswith("docs/"): return "docs/ (roadmap+planes)"
    if "/scripts/" in p or p.startswith("scripts/"): return "scripts/ (gates+instrumento)"
    if "quality-evidence" in p or "test-artifacts" in p: return "quality-evidence/receipts"
    if "/skin/" in p and p.endswith(".css"): return "SKIN CSS (pintura)"
    if "brand-theme" in p: return "BRAND-THEMES (themes)"
    if p.endswith(".css"): return "otros CSS"
    if "/manifest" in p or "manifest" in p: return "manifests/baselines"
    if "baseline" in p: return "manifests/baselines"
    if p.startswith("roadmap"): return "roadmap registry"
    if "/tokens/" in p: return "tokens (fuente TS/JSON)"
    if p.endswith((".tsx",".ts")) and "/src/" in p: return "src TS/TSX (componentes)"
    if p.endswith(".md"): return "otros .md"
    return "otros"
for line in sys.stdin:
    line=line.rstrip("\n")
    if line.startswith("C:"): cur=line[2:]; continue
    if not line.strip(): continue
    parts=line.split("\t")
    if len(parts)!=3: continue
    a,d,p=parts
    b=bucket(p)
    if a.isdigit(): add[b]+=int(a)
    if d.isdigit(): dele[b]+=int(d)
    files[b]+=1
    commits[b].add(cur)
tot=sum(add.values())
print("%-34s %10s %10s %9s %8s  %%add" % ("bucket","+lineas","-lineas","archivos","commits"))
for b,_ in add.most_common():
    print("%-34s %10d %10d %9d %8d  %5.1f%%" % (b,add[b],dele[b],files[b],len(commits[b]),100*add[b]/tot))
print("TOTAL add:",tot)
