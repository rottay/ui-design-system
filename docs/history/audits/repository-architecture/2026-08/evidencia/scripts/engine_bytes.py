import re, sys

path = sys.argv[1]
with open(path, encoding='utf-8', errors='replace') as f:
    text = f.read()

# Split on the resolveImports markers isn't available (flat concatenation, no source comments per-file except doc comments).
# Instead: measure by @layer block boundaries is unreliable since layer names repeat non-contiguously.
# Approach: find blocks bounded by the recognizable per-file leading doc-comment headers is too fragile.
# Simpler: measure rustic-specific and classic-specific selector-scoped rule text via bracket-matching on
# lines containing 'rustic' or '.ant-' as SELECTOR (not value) to approximate bytes attributable.

lines = text.split('\n')
total = len(text)

def classify(line):
    l = line.strip()
    if not l or l.startswith('/*') or l.startswith('*'):
        return None
    # crude: a selector line contains { and no ':' before it typically, or standalone selector line
    return l

rustic_bytes = 0
classic_bytes = 0
in_rustic_block = False
in_classic_block = False
depth_r = 0
depth_c = 0

# Much simpler global heuristic: count bytes of every line where a rustic/.ant- marker
# appears anywhere on a *selector* line, then include bytes until matching closing brace
# by tracking brace depth from that selector's opening brace.
i = 0
n = len(lines)
while i < n:
    line = lines[i]
    is_selector_line = ('{' in line) and (':' not in line.split('{')[0] or True)
    if '{' in line:
        head = line.split('{')[0]
        if re.search(r'\brustic\b|engine-rustic', head):
            # consume block
            depth = line.count('{') - line.count('}')
            block = [line]
            j = i+1
            while depth > 0 and j < n:
                depth += lines[j].count('{') - lines[j].count('}')
                block.append(lines[j])
                j += 1
            rustic_bytes += sum(len(x)+1 for x in block)
            i = j
            continue
        if re.search(r'\.ant-', head):
            depth = line.count('{') - line.count('}')
            block = [line]
            j = i+1
            while depth > 0 and j < n:
                depth += lines[j].count('{') - lines[j].count('}')
                block.append(lines[j])
                j += 1
            classic_bytes += sum(len(x)+1 for x in block)
            i = j
            continue
    i += 1

print(f"Total bytes: {total}")
print(f"Bytes in rule-blocks whose selector mentions 'rustic': {rustic_bytes} ({rustic_bytes/total*100:.2f}%)")
print(f"Bytes in rule-blocks whose selector mentions '.ant-' (classic engine): {classic_bytes} ({classic_bytes/total*100:.2f}%)")
print(f"Combined dead engine weight (rustic+classic) for a modern-only app: {rustic_bytes+classic_bytes} ({(rustic_bytes+classic_bytes)/total*100:.2f}%)")
