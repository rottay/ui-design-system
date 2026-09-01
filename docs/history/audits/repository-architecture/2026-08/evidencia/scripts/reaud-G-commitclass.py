import sys,collections
cur=None; touch=collections.defaultdict(set)
for line in sys.stdin:
    line=line.rstrip("\n")
    if line.startswith("C:"): cur=line[2:]; touch[cur]; continue
    if not line.strip(): continue
    p=line.split("\t")[-1]
    if ("/skin/" in p and p.endswith(".css")) or "brand-theme" in p or ("/engines/" in p and p.endswith(".css")):
        touch[cur].add("VISUAL")
    if p.endswith((".tsx",)) and "/src/" in p: touch[cur].add("TSX")
    if "/scripts/" in p or "quality-evidence" in p or "test-artifacts" in p: touch[cur].add("INSTRU")
    if p.startswith("docs/"): touch[cur].add("DOCS")
tot=len(touch)
vis=[c for c,s in touch.items() if "VISUAL" in s]
onlyinstr=[c for c,s in touch.items() if "VISUAL" not in s and "TSX" not in s]
onlydocs=[c for c,s in touch.items() if s<= {"DOCS"}]
print("commits total:",tot)
print("tocan skin css / brand-themes / engines css:",len(vis), "= %.1f%%"%(100*len(vis)/tot))
print("no tocan NI visual NI tsx:",len(onlyinstr), "= %.1f%%"%(100*len(onlyinstr)/tot))
print("solo docs/:",len(onlydocs), "= %.1f%%"%(100*len(onlydocs)/tot))
