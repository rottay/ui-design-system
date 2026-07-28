import { readFileSync, writeFileSync } from 'node:fs';
const C = '/private/tmp/rottay-design-platform-independent-audit-round-3/r1p/closure';
const L = JSON.parse(readFileSync(`${C}/phase3-ledger.json`, 'utf8'));
const out = [];
out.push('# Phase 3 migration ledger — bithire static vertical extension (Codex C6.9)');
out.push('');
out.push('One row per authored region. `destination` ∈ {BrandTheme/Appearance, Modern-DS, app-bithire,');
out.push('retired-dead, DS-extension-kept, BLOCKED-by-WIP}. No region resolved to BrandTheme/Appearance');
out.push('(W-B already drained every brand value out of the mode blocks) and none to Modern-DS — every');
out.push('surviving rule was scoped to a single tenant, so a Modern destination would have repainted the');
out.push('other verticals. None was BLOCKED-by-WIP: no rule needed a dirty Modern skin file.');
out.push('');
out.push('| region id | kind | destination | rules | decls | !imp | app tokens | engine tokens |');
out.push('|---|---|---|---:|---:|---:|---:|---:|');
for (const e of L.entries) {
  out.push(`| \`${e.region}\` | ${e.kind} | **${e.destination}**${e.partial ? ' (partial)' : ''} | ${e.rules} | ${e.declarations} | ${e.important} | ${(e.appSelectorTokens ?? []).length} | ${(e.engineSelectorTokens ?? []).length} |`);
}
out.push('');
out.push('## Totals by destination');
out.push('');
out.push('| destination | regions | rules | declarations | !important |');
out.push('|---|---:|---:|---:|---:|');
for (const [k, v] of Object.entries(L.totals)) {
  out.push(`| ${k} | ${v.regions} | ${v.rules} | ${v.declarations} | ${v.important} |`);
}
out.push('');
out.push('## Per-region rationale, cascade analysis and selector evidence');
for (const e of L.entries) {
  out.push('');
  out.push(`### \`${e.region}\` → ${e.destination}${e.partial ? ' (partial)' : ''}`);
  out.push('');
  out.push(`Destination file: \`${e.file ?? '(deleted)'}\``);
  out.push('');
  out.push(`**Rationale.** ${e.rationale}`);
  out.push('');
  out.push(`**Cascade position.** ${e.cascade}`);
  out.push('');
  out.push(`**Volume.** ${e.rules} rule(s), ${e.declarations} declaration(s), ${e.important} \`!important\`.`);
  if ((e.appSelectorTokens ?? []).length) out.push(`\n**App selector tokens.** \`${e.appSelectorTokens.join('`, `')}\``);
  if ((e.engineSelectorTokens ?? []).length) out.push(`\n**Engine selector tokens.** \`${e.engineSelectorTokens.join('`, `')}\``);
  out.push('');
  out.push('<details><summary>Selectors</summary>');
  out.push('');
  out.push('```css');
  for (const s of [...new Set(e.selectors)]) out.push(s);
  out.push('```');
  out.push('');
  out.push('</details>');
}
writeFileSync(`${C}/phase3-ledger.md`, `${out.join('\n')}\n`);
console.log(`wrote phase3-ledger.md (${out.length} lines)`);
