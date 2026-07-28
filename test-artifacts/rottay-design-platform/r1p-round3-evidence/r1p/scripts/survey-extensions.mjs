/** Structural survey of each extension.css: top-level nodes, selectors, decl counts. */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const postcss = createRequire(`${CORE}/package.json`)('postcss');

for (const slug of process.argv.slice(2)) {
  const file = `${CORE}/src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`;
  const root = postcss.parse(readFileSync(file, 'utf-8'), { from: file });
  console.log(`\n########## ${slug} ##########`);
  let pendingComments = [];
  root.each((node) => {
    const line = node.source?.start?.line;
    if (node.type === 'comment') {
      const text = node.text.split('\n').map((s) => s.trim()).filter(Boolean);
      pendingComments.push(`L${line} /* ${text[0]}${text.length > 1 ? ` … (+${text.length - 1})` : ''} */`);
      return;
    }
    if (pendingComments.length) {
      for (const c of pendingComments) console.log(`  ${c}`);
      pendingComments = [];
    }
    if (node.type === 'rule') {
      const decls = node.nodes.filter((n) => n.type === 'decl');
      const custom = decls.filter((d) => d.prop.startsWith('--')).length;
      console.log(`L${line} RULE  ${node.selector.replace(/\s+/g, ' ').slice(0, 110)}  [${decls.length} decls, ${custom} custom]`);
    } else if (node.type === 'atrule') {
      let decls = 0, rules = 0;
      node.walkDecls(() => { decls += 1; });
      node.walkRules(() => { rules += 1; });
      console.log(`L${line} @${node.name} ${node.params.slice(0, 90)}  [${rules} rules, ${decls} decls]`);
    }
  });
  for (const c of pendingComments) console.log(`  ${c}`);
}
