/**
 * WO-CRA-23 merge lane — the executable backlog, final pass.
 *
 * Sources: cells8.json (8 resolved cells, artifacts rendered from source),
 * sites.json (every declaration, PARSED with postcss), fieldmap.json (the whole
 * BrandTheme contract, probed by perturbation).
 *
 * Rules, in order — role, then the fill guard, then contrast. A raw luminance
 * bucket reports 129 where the answer is 13.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Outputs land beside this file, so the harness is runnable from anywhere. */
const SP = dirname(fileURLToPath(import.meta.url));

const { cells, corpus, provenance } = JSON.parse(readFileSync(`${SP}/cells8.json`, 'utf-8'));
const { channelToField } = JSON.parse(readFileSync(`${SP}/fieldmap.json`, 'utf-8'));
const sites = JSON.parse(readFileSync(`${SP}/sites.json`, 'utf-8'));
const V = ['platform', 'bithire', 'evnto'];

const HEX = /#([0-9a-fA-F]{3,8})\b/g;
const lin = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const ph = (h) => { let s = h; if (s.length === 3 || s.length === 4) s = [...s].map((c) => c + c).join('');
  const n = (i) => parseInt(s.slice(i, i + 2), 16); return { rgb: [n(0), n(2), n(4)], alpha: s.length === 8 ? n(6) / 255 : 1 }; };
const op = (v) => [...(v ?? '').matchAll(HEX)].map((m) => ph(m[1])).filter((c) => c.alpha >= 0.9);
const L = (v) => { const o = op(v); return o.length ? o.reduce((s, c) => s + (0.2126 * lin(c.rgb[0]) + 0.7152 * lin(c.rgb[1]) + 0.0722 * lin(c.rgb[2])), 0) / o.length : null; };
const chroma = (v) => { const o = op(v); return o.length ? Math.max(...o.map((c) => (Math.max(...c.rgb) - Math.min(...c.rgb)) / 255)) : null; };
const contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

function role(name) { const n = name.replace(/^--ds-/, '');
  if (/(^|-)(shadow|glow|ring|elevation)(-|$)/.test(n)) return 'depth';
  if (/(^|-)(border|outline|divider|rule|hairline|stroke)/.test(n)) return 'edge';
  if (/(^|-)(bg|background|surface|fill|backdrop|scrim|overlay|sheet|canvas|ground|track|shimmer|tint|wash|highlight|material|gradient|texture)(-|$)/.test(n)) return 'ground';
  if (/(^|-)(color|text|ink|fg|foreground|icon|label|placeholder|caret)(-|$)/.test(n)) return 'ink';
  return 'other'; }
const FILLED = /(-foreground$|checked|handle|dot|tooltip|backtop|tag-primary|toggle|steps-item|pagination-item|switch|slider|timeline|inverse|contrast|on-[a-z]|badge-(primary|secondary|default)|selected|active|cover|overlay-content)/;
const TONED = /(error|warning|success|info|danger|critical)/;
const PALETTE = (n) => /^--ds-color-(primary|secondary|accent|neutral|success|warning|error|info)(-\d{1,3})?$/.test(n)
  || /^--ds-color-(dark|on)-/.test(n) || /^--ds-color-(black|white)$/.test(n);
function exempt(name, probe) { const n = name.replace(/^--ds-/, '');
  if (PALETTE(name)) return 'palette-identity';
  if (TONED.test(n)) return 'tone';
  if ((chroma(probe) ?? 0) >= 0.25) return 'tone';
  if (FILLED.test(n)) return 'filled-or-inverted';
  return null; }

const names = Object.keys(cells['tenantless/light']);
const out = [];
for (const name of names) {
  const r = role(name);
  if (r === 'other' || r === 'depth') continue;
  const val = (c) => cells[c][name] ?? '';
  let why = exempt(name, val('bithire/dark') || val('tenantless/dark') || val('tenantless/light'));
  // Ink that is near-white in EVERY cell cannot be page ink — white on a light
  // page would be invisible in a shipped product. It is the label on a filled
  // tone, and its reference ground is that fill, not the page.
  if (!why && r === 'ink') {
    const ls = Object.keys(cells).map((c) => L(val(c))).filter((x) => x !== null);
    if (ls.length && ls.every((x) => x >= 0.85)) why = 'on-tone-ink';
  }

  // Defective CELLS: a ground/edge on the opposite side from its own page
  // ground, or ink on the same side as it. The cell is the unit — a vertical
  // can be right in dark and wrong in light.
  // A ground's defect is being on the wrong SIDE of the divide from its own
  // page — a white panel on a dark page. An edge's and an ink's defect is too
  // little CONTRAST against the ground they sit on; an edge on the same side as
  // the page is precisely the invisible one, so a side test inverts the answer.
  const defective = [];
  for (const v of V) for (const theme of ['light', 'dark']) {
    const value = val(`${v}/${theme}`); const l = L(value); if (l === null) continue;
    const grounds = [L(cells[`${v}/${theme}`]['--ds-color-bg-primary']), L(cells[`${v}/${theme}`]['--ds-surface-card'])].filter((x) => x !== null);
    if (!grounds.length) continue;
    let bad;
    if (r === 'ground') {
      const side = l >= 0.5 ? 'light' : 'dark', page = grounds[0] >= 0.5 ? 'light' : 'dark';
      bad = side !== page;
    } else {
      const best = Math.max(...grounds.map((g) => contrast(l, g)));
      bad = r === 'edge' ? best < 1.15 : best < 4.5;   // 1.15 calibrated: good hairlines 1.25-1.46, dead ones 1.06
    }
    if (!bad) continue;
    defective.push({ cell: `${v}/${theme}`, value, inherits: value === val(`tenantless/${theme}`) });
  }
  if (!defective.length) continue;

  const decls = sites[name] ?? [];
  const baseDecls = decls.filter((d) => d.tier === 'base');
  const baseUnconditional = baseDecls.filter((d) => d.theme === 'unconditional');
  const baseHasSplit = baseDecls.some((d) => d.theme !== 'unconditional');

  // Severity from the role: for a ground the wrong side IS the defect and page
  // contrast says nothing; for ink and edges the contrast is the harm.
  let worst = null;
  for (const d of defective) {
    const [v, theme] = d.cell.split('/');
    const l = L(d.value); const grounds = [L(cells[d.cell]['--ds-color-bg-primary']), L(cells[d.cell]['--ds-surface-card'])].filter((x) => x !== null);
    if (l === null || !grounds.length) continue;
    const best = Math.max(...grounds.map((g) => contrast(l, g)));
    if (worst === null || best < worst.ratio) worst = { ratio: best, cell: d.cell };
  }
  const ratio = worst?.ratio ?? 99;
  const severity = why ? 'correct-by-design'
    : r === 'ink' ? (ratio < 3 ? 'unreadable-text' : ratio < 4.5 ? 'low-contrast-text' : 'cosmetic')
    : r === 'edge' ? (ratio < 1.15 ? 'invisible-boundary' : 'cosmetic')
    : 'wrong-ground';

  const inh = defective.filter((d) => d.inherits), own = defective.filter((d) => !d.inherits);
  out.push({
    name, role: r, severity, exemptBecause: why,
    worstContrast: worst ? { ratio: Number(worst.ratio.toFixed(2)), cell: worst.cell } : null,
    cells: Object.fromEntries(Object.entries(cells).map(([k, v]) => [k, v[name] ?? ''])),
    defectiveCells: defective.map((d) => d.cell),
    cellsInheritingBase: inh.map((d) => d.cell),
    cellsVerticalDeclares: own.map((d) => d.cell),
    owner: inh.length && own.length ? 'base-layer + vertical' : inh.length ? 'base-layer' : 'vertical',
    baseSites: baseDecls.map((d) => `${d.file}#${d.theme}=${d.value}`),
    baseHasThemeSplit: baseHasSplit,
    contractField: channelToField[name]?.[0] ?? null,
    fixSite: why ? 'nothing — correct by design'
      : channelToField[name] ? `contract: modes.dark.${channelToField[name][0]} (and/or the base body)`
      : baseUnconditional.length && !baseHasSplit ? `base-layer: ${baseUnconditional[0].file} declares it unconditionally with no theme split`
      : baseDecls.length ? `base-layer: ${baseDecls[0].file}`
      : 'new contract field — nothing in the base tier declares it',
    blastRadius: `${inh.length} inherited cell(s) move if the base is repaired; ${own.length} need the owning vertical`,
  });
}

const live = out.filter((r) => !r.exemptBecause);
const order = ['unreadable-text', 'invisible-boundary', 'wrong-ground', 'low-contrast-text', 'cosmetic'];
live.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity) || (a.worstContrast?.ratio ?? 9) - (b.worstContrast?.ratio ?? 9));
writeFileSync(`${SP}/BACKLOG.json`, `${JSON.stringify({ provenance, corpus, totals: {
  candidates: out.length, exempt: out.length - live.length, live: live.length,
  bySeverity: Object.fromEntries(order.map((s) => [s, live.filter((r) => r.severity === s).length])),
  byOwner: Object.fromEntries(['base-layer', 'base-layer + vertical', 'vertical'].map((o) => [o, live.filter((r) => r.owner === o).length])),
}, rows: live }, null, 1)}\n`);

console.log(`corpus ${corpus}  candidates ${out.length}  exempt ${out.length - live.length}  LIVE ${live.length}`);
console.log(`severity: ${JSON.stringify(Object.fromEntries(order.map((s) => [s, live.filter((r) => r.severity === s).length])))}`);
console.log(`owner   : ${JSON.stringify(Object.fromEntries(['base-layer', 'base-layer + vertical', 'vertical'].map((o) => [o, live.filter((r) => r.owner === o).length])))}`);
const fix = live.reduce((a, r) => { const k = r.fixSite.split(':')[0]; a[k] = (a[k] ?? 0) + 1; return a; }, {});
console.log(`fix site: ${JSON.stringify(fix)}`);
const files = {};
for (const r of live) for (const s of new Set(r.baseSites.map((x) => x.split('#')[0]))) files[s] = (files[s] ?? 0) + 1;
console.log('\nbase files that would be edited:');
for (const [f, n] of Object.entries(files).sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`  ${String(n).padStart(3)}  ${f}`);
