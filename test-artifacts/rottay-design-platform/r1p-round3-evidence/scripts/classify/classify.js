'use strict';
const fs = require('fs');
const B = '/private/tmp/rottay-design-platform-independent-audit-round-3/';
const STATES = ['default', 'light', 'dark'];

/* ---------- reachability (evidence-backed, see classification.json) ---------- */
const REACH = {
  bithire: { default: 'REACHABLE', light: 'UNREACHABLE-BY-ABSENCE', dark: 'UNREACHABLE' },
  evnto:   { default: 'REACHABLE', light: 'UNREACHABLE-BY-ABSENCE', dark: 'UNREACHABLE-BY-ABSENCE' },
  rottay:  { default: 'REACHABLE', light: 'UNREACHABLE-BY-ABSENCE', dark: 'UNREACHABLE-BY-ABSENCE' },
};
const isReachable = (v, s) => REACH[v][s] === 'REACHABLE';

/* ---------- selector semantics ---------- */
function armThemeCondition(arm) {
  // strip :not(...) payloads first, recording what they exclude
  const nots = [];
  let stripped = arm.replace(/:not\(([^()]*)\)/g, (m, inner) => { nots.push(inner); return ''; });
  const notBlob = nots.join(' ');
  const excludesDark = /\[data-theme\s*=\s*['"]?dark['"]?\]/.test(notBlob) || /\.dark\b/.test(notBlob);
  const excludesLight = /\[data-theme\s*=\s*['"]?light['"]?\]/.test(notBlob) || /\.light\b/.test(notBlob);
  const requiresDark = /\[data-theme\s*=\s*['"]?dark['"]?\]/.test(stripped) || /\.dark\b/.test(stripped);
  const requiresLight = /\[data-theme\s*=\s*['"]?light['"]?\]/.test(stripped) || /\.light\b/.test(stripped);
  return { requiresDark, requiresLight, excludesDark, excludesLight };
}
function armMatchesState(arm, state) {
  const c = armThemeCondition(arm);
  if (c.requiresDark && state !== 'dark') return false;
  if (c.requiresLight && state !== 'light') return false;
  if (c.excludesDark && state === 'dark') return false;
  if (c.excludesLight && state === 'light') return false;
  return true;
}
function armIsDescendant(arm) {
  // a descendant combinator outside of parens => not the root element itself
  let depth = 0, sawCombinator = false;
  for (let i = 0; i < arm.length; i++) {
    const ch = arm[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0 && /[\s>+~]/.test(ch)) {
      const rest = arm.slice(i).trim();
      if (rest.length) { sawCombinator = true; break; }
    }
  }
  return sawCombinator;
}
function specificity(sel) {
  // max over comma-arms, [id, class/attr/pseudo-class, element]
  const arms = splitArms(sel);
  let best = [0, 0, 0];
  for (const arm of arms) {
    const s = armSpecificity(arm);
    if (cmpSpec(s, best) > 0) best = s;
  }
  return best;
}
function armSpecificity(arm) {
  let a = 0, b = 0, c = 0;
  let s = arm;
  // :where(...) contributes 0
  s = s.replace(/:where\(([^()]*(\([^()]*\))?[^()]*)\)/g, ' ');
  // :is(...) / :not(...) contribute max of their arguments
  const nested = [];
  s = s.replace(/:(?:is|not)\(([^()]*)\)/g, (m, inner) => { nested.push(inner); return ' '; });
  for (const n of nested) {
    let bestIn = [0, 0, 0];
    for (const arm2 of splitArms(n)) {
      const sp = armSpecificity(arm2);
      if (cmpSpec(sp, bestIn) > 0) bestIn = sp;
    }
    a += bestIn[0]; b += bestIn[1]; c += bestIn[2];
  }
  a += (s.match(/#[\w-]+/g) || []).length;
  b += (s.match(/\[[^\]]+\]/g) || []).length;
  b += (s.match(/\.[\w-]+/g) || []).length;
  b += (s.match(/:(?!:)[\w-]+/g) || []).length;
  c += (s.match(/(^|[\s>+~,])([a-zA-Z][\w-]*)/g) || []).length;
  c += (s.match(/::[\w-]+/g) || []).length;
  return [a, b, c];
}
function cmpSpec(x, y) {
  for (let i = 0; i < 3; i++) { if (x[i] !== y[i]) return x[i] - y[i]; }
  return 0;
}
function splitArms(sel) {
  const out = []; let depth = 0, cur = '';
  for (const ch of sel) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const norm = v => String(v).replace(/\s+/g, ' ').trim();

/* ---------- G detection (domain-semantic stems) ---------- */
const DOMAIN_STEMS = /(candidate|applicant|recruit|interview|vacancy|job|pipeline|evidence-ledger|ticket|attendee|venue|event-(?:live|draft|published|cancelled|ended)|invoice|tenant-plan)/;

/* ---------- main ---------- */
function classifyVertical(vKey) {
  const j = JSON.parse(fs.readFileSync(B + vKey + '-overlap.json', 'utf8'));
  const compiledSel = j.cascadeByState.compiledSelector;
  const compiledSpec = specificity(compiledSel);
  const compiledAppliesByState = {};
  for (const s of STATES) {
    const armsMatch = splitArms(compiledSel).some(a => armMatchesState(a, s));
    compiledAppliesByState[s] = armsMatch;
  }

  const names = {};
  const perStateComputed = { default: { root: [], desc: [], survive: [], soleAuthor: [] }, light: { root: [], desc: [], survive: [], soleAuthor: [] }, dark: { root: [], desc: [], survive: [], soleAuthor: [] } };

  for (const rec of j.overlapRecords) {
    const compiled = rec.compiledDeclarations[rec.compiledDeclarations.length - 1];
    const perState = {};
    const facets = new Set();

    for (const s of STATES) {
      const cApplies = compiledAppliesByState[s];
      // candidate extension declarations effective at ROOT in state s
      const rootCands = [];
      const descCands = [];
      const mediaCands = [];
      for (const d of rec.extensionDeclarations) {
        const arms = splitArms(d.selector).filter(a => armMatchesState(a, s));
        if (!arms.length) continue;
        const rootArms = arms.filter(a => !armIsDescendant(a));
        const hasMedia = (d.atRules || []).length > 0;
        if (!rootArms.length) { descCands.push(d); continue; }
        if (hasMedia) { mediaCands.push(d); continue; }
        rootCands.push({ d, spec: Math.max(...rootArms.map(a => 0)) === 0 ? specificity(rootArms.join(',')) : null });
      }
      // winner among root candidates: highest specificity, then latest source order
      let winner = null;
      for (const c of rootCands) {
        if (!winner) { winner = c; continue; }
        const k = cmpSpec(c.spec, winner.spec);
        if (k > 0 || (k === 0 && c.d.order > winner.d.order)) winner = c;
      }
      let extEffective = false;
      if (winner) {
        // extension file is emitted after the compiled block in the same sheet
        extEffective = cmpSpec(winner.spec, compiledSpec) >= 0 || !cApplies;
      }
      const entry = {
        compiledApplies: cApplies,
        compiledValue: cApplies ? norm(compiled.value) : null,
        extensionAtRoot: !!winner,
        extensionEffective: extEffective,
        extensionValue: winner ? norm(winner.d.value) : null,
        extensionSelector: winner ? winner.d.selector : null,
        extensionSpecificity: winner ? winner.spec : null,
        extensionFile: winner ? winner.d.file : null,
        extensionLine: winner ? winner.d.line : null,
        extensionSection: winner ? (winner.d.sectionTitle || null) : null,
        descendantOnly: !winner && descCands.length > 0,
        mediaConditional: mediaCands.length > 0,
        reachable: isReachable(vKey, s),
        result: null,
      };
      if (descCands.length) facets.add('E');
      if (mediaCands.length) facets.add('C');

      if (cApplies && extEffective) {
        entry.result = norm(entry.compiledValue) === norm(entry.extensionValue) ? 'A' : 'B';
      } else if (cApplies && !extEffective) {
        entry.result = entry.descendantOnly ? 'E' : (entry.mediaConditional ? 'C' : 'COMPILED_SURVIVES');
      } else if (!cApplies && extEffective) {
        entry.result = 'F'; // sole author: compiled block does not even apply here
      } else {
        entry.result = 'NONE';
      }
      perState[s] = entry;

      if (entry.extensionAtRoot && entry.extensionEffective && cApplies) perStateComputed[s].root.push(rec.name);
      if (entry.descendantOnly) perStateComputed[s].desc.push(rec.name);
      if (cApplies && !extEffective && !entry.descendantOnly) perStateComputed[s].survive.push(rec.name);
      if (!cApplies && extEffective) perStateComputed[s].soleAuthor.push(rec.name);
    }

    // ---- final label ----
    const isG = DOMAIN_STEMS.test(rec.name);
    if (isG) facets.add('G');
    const reachableResults = STATES.filter(s => isReachable(vKey, s)).map(s => perState[s].result);
    const unreachableCompetes = STATES.filter(s => !isReachable(vKey, s))
      .some(s => perState[s].result === 'A' || perState[s].result === 'B' || perState[s].result === 'F');
    for (const s of STATES) {
      if (!isReachable(vKey, s) && ['A', 'B', 'F'].includes(perState[s].result)) facets.add('D:' + s + ':' + perState[s].result);
    }
    let final;
    const sev = ['B', 'A', 'G', 'D', 'E', 'C', 'F'];
    const candidates = [];
    if (reachableResults.includes('B')) candidates.push('B');
    if (reachableResults.includes('A')) candidates.push('A');
    if (isG) candidates.push('G');
    if (unreachableCompetes) candidates.push('D');
    if (reachableResults.includes('E')) candidates.push('E');
    if (reachableResults.includes('C')) candidates.push('C');
    if (reachableResults.includes('F')) candidates.push('F');
    if (!candidates.length) candidates.push('I');
    final = candidates.sort((a, b) => sev.indexOf(a) - sev.indexOf(b))[0];

    names[rec.name] = {
      name: rec.name,
      final,
      facets: [...facets].sort(),
      compiled: { value: norm(compiled.value), file: compiled.file, line: compiled.line, selector: compiled.selector },
      extensionDeclarations: rec.extensionDeclarations.map(d => ({
        value: norm(d.value), file: d.file, line: d.line, selector: d.selector,
        section: d.sectionTitle || null, atRules: d.atRules || [], order: d.order,
      })),
      perState,
    };
  }

  return { j, compiledSel, compiledSpec, compiledAppliesByState, names, perStateComputed };
}

/* ---------- validation against cascadeByState ---------- */
function validate(vKey, r) {
  const out = {};
  for (const s of STATES) {
    const cb = r.j.cascadeByState.states[s];
    if (!cb || cb.compiledBlockApplies !== true) { out[s] = { cascadeByStateProvidesLists: false, note: 'compiled block does not apply in this state; no upstream lists to compare' }; continue; }
    const mineRoot = new Set(r.perStateComputed[s].root);
    const theirsRoot = new Set(cb.overriddenAtRootNames || []);
    const mineSurv = new Set(r.perStateComputed[s].survive);
    const theirsSurv = new Set(cb.compiledValueSurvivesNames || []);
    const mineDesc = new Set(r.perStateComputed[s].desc);
    const theirsDesc = new Set(cb.overriddenOnlyInsideADescendantSubtreeNames || []);
    const diff = (a, b) => [...a].filter(x => !b.has(x));
    out[s] = {
      cascadeByStateProvidesLists: true,
      overriddenAtRoot: { mine: mineRoot.size, theirs: theirsRoot.size, onlyMine: diff(mineRoot, theirsRoot), onlyTheirs: diff(theirsRoot, mineRoot) },
      compiledSurvives: { mine: mineSurv.size, theirs: theirsSurv.size, onlyMine: diff(mineSurv, theirsSurv), onlyTheirs: diff(theirsSurv, mineSurv) },
      descendantOnly: { mine: mineDesc.size, theirs: theirsDesc.size, onlyMine: diff(mineDesc, theirsDesc), onlyTheirs: diff(theirsDesc, mineDesc) },
    };
    out[s].exactMatch = out[s].overriddenAtRoot.onlyMine.length === 0 && out[s].overriddenAtRoot.onlyTheirs.length === 0
      && out[s].compiledSurvives.onlyMine.length === 0 && out[s].compiledSurvives.onlyTheirs.length === 0;
  }
  return out;
}

const RESULT = { generatedAt: new Date().toISOString(), verticals: {} };
for (const v of ['bithire', 'evnto', 'rottay']) {
  const r = classifyVertical(v);
  const counts = {};
  for (const n of Object.values(r.names)) counts[n.final] = (counts[n.final] || 0) + 1;
  const perStateCounts = {};
  for (const s of STATES) {
    const c = {};
    for (const n of Object.values(r.names)) { const k = n.perState[s].result; c[k] = (c[k] || 0) + 1; }
    perStateCounts[s] = c;
  }
  RESULT.verticals[v] = {
    sharedNameCount: Object.keys(r.names).length,
    compiledSelector: r.compiledSel,
    compiledSpecificity: r.compiledSpec,
    compiledAppliesByState: r.compiledAppliesByState,
    finalCategoryCounts: counts,
    perStateResultCounts: perStateCounts,
    validationAgainstCascadeByState: validate(v, r),
    names: r.names,
  };
}
fs.writeFileSync(B + 'classification-core.json', JSON.stringify(RESULT, null, 1));
console.log('WROTE classification-core.json');
for (const [v, d] of Object.entries(RESULT.verticals)) {
  console.log('\n== ' + v + ' (' + d.sharedNameCount + ') final:', JSON.stringify(d.finalCategoryCounts));
  console.log('   compiledApplies:', JSON.stringify(d.compiledAppliesByState), 'spec', JSON.stringify(d.compiledSpecificity));
  for (const s of STATES) console.log('   state ' + s + ':', JSON.stringify(d.perStateResultCounts[s]));
  for (const s of STATES) {
    const val = d.validationAgainstCascadeByState[s];
    if (val.cascadeByStateProvidesLists) console.log('   VALIDATE ' + s + ': exactMatch=' + val.exactMatch + ' root mine/theirs=' + val.overriddenAtRoot.mine + '/' + val.overriddenAtRoot.theirs + ' surv=' + val.compiledSurvives.mine + '/' + val.compiledSurvives.theirs + (val.exactMatch ? '' : ' onlyMine=' + JSON.stringify(val.overriddenAtRoot.onlyMine.slice(0,5)) + ' onlyTheirs=' + JSON.stringify(val.overriddenAtRoot.onlyTheirs.slice(0,5))));
    else console.log('   VALIDATE ' + s + ': ' + val.note);
  }
}
