// W-C: per-region, per-rule inventory of a static vertical extension.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { readExtensionRegions } from '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/artifact-provenance-gate.mjs';

const ROOT = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/foundation/tokens/css/facade/artifacts';
const slug = process.argv[2] ?? 'bithire';
const css = readFileSync(resolve(ROOT, slug, '_source/extension.css'), 'utf8');
const { regions, orphans } = readExtensionRegions(css, `${slug}/_source/extension.css`);

const APP = /\.(?:rt|bithire|evnto|rottay)-[a-z0-9-]+|\[data-(?:bithire|evnto|rottay)-[a-z0-9-]+/g;
const ENGINE = /\.ant-[a-z0-9-]+|\.badge[a-z0-9-]*|\.btn-[a-z0-9-]+|\.tooltip[a-z0-9-]*/g;

function walk(node, out, depth = 0, atStack = []) {
  for (const child of node.nodes ?? []) {
    if (child.type === 'atrule') {
      walk(child, out, depth + 1, [...atStack, `@${child.name} ${child.params}`]);
    } else if (child.type === 'rule') {
      const decls = (child.nodes ?? []).filter((n) => n.type === 'decl');
      out.push({
        line: child.source?.start?.line ?? 0,
        endLine: child.source?.end?.line ?? 0,
        atStack: [...atStack],
        selector: child.selector.replace(/\s+/g, ' '),
        declCount: decls.length,
        important: decls.filter((d) => d.important).length,
        props: decls.map((d) => d.prop),
        appTokens: [...new Set(child.selector.match(APP) ?? [])],
        engineTokens: [...new Set(child.selector.match(ENGINE) ?? [])],
        customProps: decls.filter((d) => d.prop.startsWith('--')).length,
      });
      walk(child, out, depth + 1, atStack);
    }
  }
}

const report = regions.map((r, i) => {
  const rules = [];
  for (const n of r.nodes) walk({ nodes: [n] }, rules);
  const startLine = r.line;
  const endLine = Math.max(startLine, ...r.nodes.map((n) => n.source?.end?.line ?? 0));
  const text = css.split('\n').slice(startLine - 1, endLine).join('\n');
  return {
    idx: i,
    key: r.key,
    kind: r.header.fields.kind,
    owner: r.header.fields.owner,
    purpose: r.header.fields.purpose,
    startLine,
    endLine,
    bytes: Buffer.byteLength(text),
    ruleCount: rules.length,
    declCount: rules.reduce((a, b) => a + b.declCount, 0),
    important: rules.reduce((a, b) => a + b.important, 0),
    appTokens: [...new Set(rules.flatMap((r) => r.appTokens))],
    engineTokens: [...new Set(rules.flatMap((r) => r.engineTokens))],
    customProps: rules.reduce((a, b) => a + b.customProps, 0),
    rules,
  };
});

writeFileSync(process.argv[3] ?? '/dev/stdout', JSON.stringify({ slug, orphans: orphans.length, regions: report }, null, 2));
console.error(`${slug}: ${report.length} regions, ${report.reduce((a,b)=>a+b.ruleCount,0)} rules, ${report.reduce((a,b)=>a+b.declCount,0)} decls`);
for (const r of report) {
  console.error(`  [${r.idx}] ${r.key} L${r.startLine}-${r.endLine} rules=${r.ruleCount} decls=${r.declCount} !imp=${r.important} bytes=${r.bytes} app=${r.appTokens.length} eng=${r.engineTokens.length}`);
}
