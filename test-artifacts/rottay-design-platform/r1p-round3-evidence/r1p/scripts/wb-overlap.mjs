/**
 * Where do the counted capability-gap overlaps live: the default-state region
 * (W1's AD-1 residue) or the mode residue W-B just rewrote?
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const require_ = createRequire(`${CORE}/package.json`);
const postcss = require_('postcss');

for (const [slug, mode] of [['bithire', 'dark'], ['evnto', 'dark'], ['rottay', 'light']]) {
  const artifact = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/index.css`, 'utf-8');
  const root = postcss.parse(artifact, { from: slug });

  const compiledBase = new Set();
  const compiledMode = new Set();
  let armed = null;
  root.each((node) => {
    if (node.type === 'comment' && /Compiled from BrandTheme via/.test(node.text)) { armed = compiledBase; return; }
    if (node.type === 'comment' && /Compiled from BrandTheme\.modes\./.test(node.text)) { armed = compiledMode; return; }
    if (armed && node.type === 'rule') {
      for (const d of node.nodes ?? []) if (d.type === 'decl' && d.prop.startsWith('--')) armed.add(d.prop);
      armed = null;
    }
  });

  const ext = readFileSync(`${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`, 'utf-8');
  const extRoot = postcss.parse(ext, { from: slug });
  const regions = [];
  extRoot.walkComments((c) => {
    const m = /@ds-exception\s+kind=(\S+)[\s\S]*?reachability=(\S+)/.exec(c.text);
    if (!m) return;
    let n = c.next();
    while (n && n.type !== 'rule') n = n.next();
    if (!n) return;
    regions.push({
      kind: m[1],
      reachability: m[2],
      selector: n.selector.slice(0, 70),
      props: (n.nodes ?? []).filter((d) => d.type === 'decl' && d.prop.startsWith('--')).map((d) => d.prop),
    });
  });

  console.log(`\n=== ${slug} ===  compiled base ${compiledBase.size} ch, compiled ${mode} block ${compiledMode.size} ch`);
  for (const r of regions) {
    const overlapBase = r.props.filter((p) => compiledBase.has(p));
    const overlapMode = r.props.filter((p) => compiledMode.has(p));
    if (overlapBase.length + overlapMode.length === 0 && r.props.length === 0) continue;
    console.log(`  [${r.kind} / ${r.reachability}] ${r.props.length} props | overlaps base ${overlapBase.length}, overlaps ${mode} block ${overlapMode.length}`);
    console.log(`     ${r.selector}`);
    if (overlapMode.length) console.log(`     mode-overlap: ${overlapMode.slice(0, 10).join(' ')}${overlapMode.length > 10 ? ' …' : ''}`);
  }
}
