/**
 * P1 task 2, decisive test: is a component-literal a COHERENT ALIAS of one
 * governed semantic channel, or a coincidental value collision?
 *
 * rottay declares each component channel TWICE — once in the dark block, once
 * in the light block — with different values. If `--ds-select-bg` equals the
 * same governed channel in BOTH states, the relation is semantic: the channel
 * is a second name for governed vocabulary and the compiler can derive it.
 * If the twin differs per state, the equality was a coincidence and the channel
 * carries independent intent.
 *
 * Only a channel that is coherent in every state it is declared in is
 * derivable; everything else stays authored.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/r1p-round3-evidence/r1p/closure/remediation';
const twins = JSON.parse(readFileSync(`${OUT}/p1-value-twins.json`, 'utf-8'));
const ledger = JSON.parse(readFileSync(`${OUT}/p1-ledger.json`, 'utf-8'));

const report = {};
for (const slug of Object.keys(twins)) {
  const byProp = new Map();
  for (const r of [...twins[slug].withGovernedTwin, ...twins[slug].noTwin]) {
    if (!byProp.has(r.prop)) byProp.set(r.prop, []);
    byProp.get(r.prop).push(r);
  }
  const coherent = [];      // same governed twin in every declared state
  const incoherent = [];    // twin set differs across states
  const singleState = [];   // declared in one state only — coherence untestable
  const noTwinAnywhere = [];
  for (const [prop, recs] of byProp) {
    const sets = recs.map((r) => new Set(r.twins));
    if (sets.every((s) => s.size === 0)) { noTwinAnywhere.push({ prop, states: recs.map((r) => r.state), values: recs.map((r) => r.value), cls: recs[0].cls, readers: recs[0].readers }); continue; }
    if (recs.length === 1) { singleState.push({ prop, state: recs[0].state, value: recs[0].value, twins: recs[0].twins, cls: recs[0].cls, readers: recs[0].readers }); continue; }
    // intersection of the governed twins across all declared states
    let inter = [...sets[0]];
    for (const s of sets.slice(1)) inter = inter.filter((x) => s.has(x));
    const rec = {
      prop, cls: recs[0].cls, readers: recs[0].readers,
      states: recs.map((r) => ({ state: r.state, value: r.value, twinCount: r.twinCount })),
      sharedTwins: inter,
    };
    if (inter.length) coherent.push(rec); else incoherent.push(rec);
  }
  report[slug] = { coherent, incoherent, singleState, noTwinAnywhere };
  console.log(`${slug}: ${byProp.size} distinct props -> coherent ${coherent.length} | incoherent ${incoherent.length} | single-state ${singleState.length} | no-twin ${noTwinAnywhere.length}`);
}

// how concentrated are the shared twins?
const hist = {};
for (const r of report.rottay.coherent) for (const t of r.sharedTwins) hist[t] = (hist[t] ?? 0) + 1;
const top = Object.entries(hist).sort((a, b) => b[1] - a[1]).slice(0, 25);
console.log('\nrottay coherent-alias targets (governed channel <- how many component channels):');
for (const [k, n] of top) console.log(`  ${String(n).padStart(4)}  ${k}`);
console.log(`\ndistinct governed targets: ${Object.keys(hist).length}`);
console.log(`coherent props with EXACTLY ONE shared twin: ${report.rottay.coherent.filter((r) => r.sharedTwins.length === 1).length}`);

writeFileSync(`${OUT}/p1-alias-coherence.json`, JSON.stringify(report, null, 1));
