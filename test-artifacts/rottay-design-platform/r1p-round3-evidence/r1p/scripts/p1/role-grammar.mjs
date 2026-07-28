/**
 * P1 task 2, last structural test before choosing a design.
 *
 * 253 distinct roles is only a long tail if the roles are unstructured. If they
 * decompose into a closed grammar — [part-][status-]property[-state] — then a
 * typed subcontract IS honest: a small closed cross-product, not 671 fields.
 * If a large share of roles fall outside the grammar, they are bespoke and no
 * subcontract can carry them without becoming a second UI system.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const slotRoles = JSON.parse(readFileSync(`${OUT}/p1-slot-roles.json`, 'utf-8'));

const PROPERTY = ['bg', 'color', 'border', 'shadow', 'ring', 'size', 'radius', 'width', 'height', 'gap', 'padding', 'margin', 'opacity', 'font-size', 'font-weight', 'letter-spacing', 'line-height'];
const STATE = ['hover', 'active', 'focus', 'disabled', 'selected', 'checked', 'rest', 'visited', 'expanded', 'collapsed'];
const STATUS = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'default', 'ghost', 'text', 'link', 'danger', 'neutral', 'accent', 'muted', 'subtle'];
const PART = ['item', 'label', 'title', 'description', 'header', 'footer', 'body', 'track', 'thumb', 'icon', 'dot', 'arrow', 'panel', 'content', 'cell', 'row', 'group', 'tail', 'handle', 'rail', 'bar', 'chip', 'count', 'bubble', 'close', 'divider', 'overlay', 'placeholder', 'addon', 'prefix', 'suffix', 'option', 'tab', 'step', 'line', 'mask', 'caret', 'indicator', 'separator', 'shell', 'menu', 'tooltip', 'value', 'input', 'button', 'link', 'card', 'section'];

function parse(role) {
  const seg = role.split('-');
  const out = { part: null, status: null, property: null, state: null, leftover: [] };
  // state is a suffix
  if (STATE.includes(seg.at(-1))) out.state = seg.pop();
  // property is the longest matching suffix (font-size etc. are two segments)
  for (const p of PROPERTY.slice().sort((a, b) => b.split('-').length - a.split('-').length)) {
    const n = p.split('-').length;
    if (seg.slice(-n).join('-') === p) { out.property = p; seg.splice(-n); break; }
  }
  // remaining leading segments: part then status, in either order
  const rest = [...seg];
  for (let i = 0; i < rest.length; i += 1) {
    if (out.status == null && STATUS.includes(rest[i])) { out.status = rest[i]; rest[i] = null; }
    else if (out.part == null && PART.includes(rest[i])) { out.part = rest[i]; rest[i] = null; }
  }
  out.leftover = rest.filter(Boolean);
  return out;
}

let inGrammar = 0, outGrammar = 0, noProperty = 0;
const leftoverHist = {};
const rows = [];
for (const c of slotRoles.coverage) {
  const p = parse(c.role);
  const ok = p.property != null && p.leftover.length === 0;
  if (ok) inGrammar += c.n;
  else {
    outGrammar += c.n;
    if (p.property == null) noProperty += c.n;
    for (const l of p.leftover) leftoverHist[l] = (leftoverHist[l] ?? 0) + c.n;
  }
  rows.push({ role: c.role, n: c.n, ...p, ok });
}
const total = inGrammar + outGrammar;
console.log(`roles parsed over ${total} declarations`);
console.log(`  IN grammar  [part-][status-]property[-state] : ${inGrammar} (${(100 * inGrammar / total).toFixed(1)}%)`);
console.log(`  OUT of grammar                                : ${outGrammar} (${(100 * outGrammar / total).toFixed(1)}%)`);
console.log(`    of which no recognizable property at all    : ${noProperty}`);
console.log('\ntop leftover (unmodelled) segments:');
for (const [k, n] of Object.entries(leftoverHist).sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log(`  ${String(n).padStart(4)}  ${k}`);

const slots = Object.keys(slotRoles.slots).filter((s) => s !== '(no-slot)');
const distinctRoles = slotRoles.coverage.length;
console.log(`\ncross-product size if modelled as closed slot x role: ${slots.length} slots x ${distinctRoles} roles = ${slots.length * distinctRoles}`);
console.log(`actually populated: ${total} declarations across ${Object.values(slotRoles.slots).reduce((a, b) => a + b.props.length, 0)} distinct channels`);
console.log(`density: ${(100 * Object.values(slotRoles.slots).reduce((a, b) => a + b.props.length, 0) / (slots.length * distinctRoles)).toFixed(2)}%`);

writeFileSync(`${OUT}/p1-role-grammar.json`, JSON.stringify({ inGrammar, outGrammar, noProperty, leftoverHist, rows }, null, 1));
