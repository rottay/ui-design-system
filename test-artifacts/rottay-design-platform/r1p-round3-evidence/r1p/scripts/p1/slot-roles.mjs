/**
 * P1 task 2: derive the component slot x role vocabulary FROM THE DATA.
 *
 * A typed subcontract is only honest if its vocabulary is measured, not
 * invented. This decomposes every component-literal declaration into
 * `--ds-<slot>-<role>` and reports how concentrated the role vocabulary is:
 * if a handful of roles cover the corpus, one reusable role interface x a
 * closed slot union replaces N hand-listed fields. If the roles are a long
 * tail, the family is not a subcontract and must stay residue.
 *
 * Only slots the DS itself READS are eligible; a slot no component reads is
 * dead vocabulary regardless of how tidy the decomposition looks.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const ledger = JSON.parse(readFileSync(`${OUT}/p1-ledger.json`, 'utf-8'));
const census = JSON.parse(readFileSync(`${OUT}/p1-consumer-census.json`, 'utf-8'));
const twins = JSON.parse(readFileSync(`${OUT}/p1-value-twins.json`, 'utf-8'));

/**
 * Slot = the longest leading segment run that names a widget. Roles are the
 * remainder. Because `--ds-input-number-bg` and `--ds-input-bg` both exist we
 * match the slot greedily against the observed widget list, longest first.
 */
const SLOT_NAMES = [
  'floatbutton', 'float-button', 'command-palette', 'live-feed', 'stats-grid',
  'back-top', 'segmented', 'inputnumber', 'input-number', 'datepicker',
  'date-picker', 'timepicker', 'time-picker', 'autocomplete', 'notification',
  'descriptions', 'breadcrumb', 'pagination', 'watermark', 'statistic',
  'skeleton', 'progress', 'checkbox', 'collapse', 'calendar', 'dropdown',
  'textarea', 'popover', 'spinner', 'divider', 'tooltip', 'transfer', 'message',
  'timeline', 'toggle', 'upload', 'avatar', 'switch', 'slider', 'select',
  'drawer', 'result', 'anchor', 'steps', 'empty', 'badge', 'modal', 'table',
  'input', 'radio', 'alert', 'card', 'menu', 'tabs', 'tree', 'form', 'rate',
  'list', 'tag', 'button', 'image', 'sidebar', 'layout', 'shell', 'code',
  'scrollbar', 'selection',
];

function decompose(prop) {
  const body = prop.replace(/^--ds-/, '');
  for (const slot of SLOT_NAMES.slice().sort((a, b) => b.length - a.length)) {
    if (body === slot) return { slot, role: 'root' };
    if (body.startsWith(`${slot}-`)) return { slot, role: body.slice(slot.length + 1) };
  }
  return { slot: null, role: body };
}

const bySlot = {};
const roleTally = {};
let total = 0;
for (const [slug, v] of Object.entries(ledger.verticals)) {
  const twinIndex = new Map();
  for (const r of [...twins[slug].withGovernedTwin, ...twins[slug].noTwin]) twinIndex.set(`${r.prop}|${r.state}`, r);
  for (const row of v.rows) {
    if (row.cls !== 'component-literal') continue;
    total += 1;
    const { slot, role } = decompose(row.prop);
    const key = slot ?? '(no-slot)';
    (bySlot[key] ??= { decls: 0, verticals: {}, roles: {}, dsReaders: 0, props: new Set(), withTwin: 0 });
    const b = bySlot[key];
    b.decls += 1;
    b.verticals[slug] = (b.verticals[slug] ?? 0) + 1;
    b.roles[role] = (b.roles[role] ?? 0) + 1;
    b.props.add(row.prop);
    b.dsReaders = Math.max(b.dsReaders, census[row.prop]?.byRoot?.['ds-core'] ?? 0);
    const t = twinIndex.get(`${row.prop}|${row.state ?? ''}`);
    roleTally[role] = (roleTally[role] ?? 0) + 1;
  }
}
for (const b of Object.values(bySlot)) b.props = [...b.props].sort();

const roles = Object.entries(roleTally).sort((a, b) => b[1] - a[1]);
let cum = 0;
const coverage = roles.map(([r, n]) => { cum += n; return { role: r, n, cumPct: +(100 * cum / total).toFixed(1) }; });

const slots = Object.entries(bySlot).sort((a, b) => b[1].decls - a[1].decls);
console.log(`component-literal declarations: ${total} across ${slots.length} slots, ${roles.length} distinct roles`);
console.log(`\ntop 30 roles (cumulative % of the corpus):`);
for (const c of coverage.slice(0, 30)) console.log(`  ${String(c.n).padStart(4)}  ${c.cumPct.toFixed(1).padStart(5)}%  ${c.role}`);
console.log(`\nroles covering 80% : ${coverage.findIndex((c) => c.cumPct >= 80) + 1}`);
console.log(`roles covering 90% : ${coverage.findIndex((c) => c.cumPct >= 90) + 1}`);
console.log(`\nslots by size (decls / distinct props / max DS readers of any prop):`);
for (const [name, b] of slots) console.log(`  ${String(b.decls).padStart(4)}  ${String(b.props.length).padStart(3)}p  ds=${String(b.dsReaders).padStart(3)}  ${name}`);

writeFileSync(`${OUT}/p1-slot-roles.json`, JSON.stringify({ total, coverage, slots: Object.fromEntries(slots) }, null, 1));
