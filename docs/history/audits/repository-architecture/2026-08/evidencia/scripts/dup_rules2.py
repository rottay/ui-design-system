import re, sys, collections

path = sys.argv[1]
with open(path, encoding='utf-8', errors='replace') as f:
    text = f.read()

text_nc = re.sub(r'/\*.*?\*/', '', text, flags=re.S)
pattern = re.compile(r'([^{}]+)\{([^{}]*)\}', re.S)
rules = collections.Counter()
KEYFRAME_SEL = re.compile(r'^(from|to|\d+%(,\s*\d+%)*)$')
count = 0
skipped_kf = 0
for m in pattern.finditer(text_nc):
    sel = m.group(1).strip()
    body = m.group(2)
    sel_norm = re.sub(r'\s+', ' ', sel).strip()
    if sel_norm.startswith('@'):
        continue
    if KEYFRAME_SEL.match(sel_norm):
        skipped_kf += 1
        continue
    body_norm = re.sub(r'\s+', ' ', body).strip()
    body_norm = re.sub(r';\s*', ';', body_norm).strip(';')
    decls = sorted([d.strip() for d in body_norm.split(';') if d.strip()])
    if not decls:
        continue
    body_key = ';'.join(decls)
    key = sel_norm + '||' + body_key
    rules[key] += 1
    count += 1

dup_rules = {k:v for k,v in rules.items() if v > 1}
print(f"Non-keyframe leaf rules parsed: {count} (skipped {skipped_kf} keyframe steps)")
print(f"Unique combos: {len(rules)}")
print(f"Exact duplicate combos: {len(dup_rules)} (extra bytes-worth occurrences: {sum(v-1 for v in dup_rules.values())})")
total_dup_bytes = sum((v-1)*len(k) for k,v in dup_rules.items())
print(f"Approx wasted bytes from exact dup non-keyframe rules: {total_dup_bytes}")
print("\nTop 25 by occurrence:")
for k,v in sorted(dup_rules.items(), key=lambda x:-x[1])[:25]:
    sel, body = k.split('||',1)
    print(f"  x{v}  {sel[:90]}  {{ {body[:140]} }}")
