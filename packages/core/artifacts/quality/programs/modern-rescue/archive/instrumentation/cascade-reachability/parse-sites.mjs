/**
 * Declaring sites, PARSED with postcss.
 *
 * The first version of this used a `([^{}]+)\{([^{}]*)\}` regex and found 6
 * blocks in a 99 KB file carrying 1,057 root declarations — a broken instrument
 * reporting "not declared anywhere", which reads exactly like a finding. Parse,
 * never grep, for any claim about selectors.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

/** Outputs land beside this file, so the harness is runnable from anywhere. */
const SP = dirname(fileURLToPath(import.meta.url));
const CORE = resolve(SP, '../../../..');
const CSS_ROOT = resolve(CORE, 'src/foundation/tokens/css');

/** postcss comes from core's own install, not a path pinned to one machine. */
const postcss = createRequire(`${CORE}/package.json`)('postcss');

const files = [];
(function walk(d) { for (const e of readdirSync(d)) { const p = join(d, e);
  if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.css')) files.push(p); } })(CSS_ROOT);

const sites = new Map();
let blocks = 0, decls = 0;
for (const file of files) {
  const rel = relative(CORE, file);
  const isArtifact = rel.includes('/facade/artifacts/');
  let root;
  try { root = postcss.parse(readFileSync(file, 'utf-8'), { from: file }); } catch { continue; }
  root.walkRules((rule) => {
    blocks += 1;
    const selector = rule.selector.replace(/\s+/g, ' ').trim();
    const isDark = /data-theme=['"]?dark|\.dark/.test(selector);
    const isLight = /data-theme=['"]?light|\.light|:not\(\[data-theme=['"]?dark/.test(selector);
    rule.walkDecls(/^--ds-/, (d) => {
      decls += 1;
      if (!sites.has(d.prop)) sites.set(d.prop, []);
      sites.get(d.prop).push({
        file: rel, selector: selector.slice(0, 100), value: d.value.replace(/\s+/g, ' ').slice(0, 60),
        theme: isDark ? 'dark' : isLight ? 'light' : 'unconditional',
        tier: isArtifact ? 'artifact' : 'base',
      });
    });
  });
}
writeFileSync(`${SP}/sites.json`, `${JSON.stringify(Object.fromEntries(sites), null, 1)}\n`);
console.log(`files=${files.length} rules=${blocks} --ds-* declarations=${decls} distinct names=${sites.size}`);
const f = sites.get('--ds-form-label-color') ?? [];
console.log(`control --ds-form-label-color: ${f.length} site(s)`);
for (const s of f) console.log(`   ${s.tier}/${s.theme}  ${s.file}  {${s.selector.slice(0, 40)}}  = ${s.value}`);
