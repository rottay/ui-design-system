'use strict';
const fs = require('fs');
const path = require('path');
const B = '/private/tmp/rottay-design-platform-independent-audit-round-3/';
const { splitArms, armMatchesState, armIsDescendant, specificity, cmpSpec } = require('./selector-lib.js');
const { buildEffectiveMap, resolveOneLevel } = require('./resolve.js');
const STATES = ['default', 'light', 'dark'];

const REACH = {
  bithire: {
    default: { verdict: 'REACHABLE', note: 'Shipped state. DS ThemeProvider stamps data-theme="base" (registry theme for bundled bithire). "base" is selector-equivalent to the model\'s default state: no selector in either snapshot tests any data-theme value other than light/dark.' },
    light:   { verdict: 'UNREACHABLE-BY-ABSENCE', note: 'No writer of data-theme="light"/.light. Outcome is IMMATERIAL: every selector present treats light and default identically for this vertical, so light-state results equal default-state results.' },
    dark:    { verdict: 'UNREACHABLE', note: 'Given by task (extension pin comments + CLEAR MODE GUARD + official audit L108); independently corroborated: registry theme for bithire is "base", DS stamps data-theme="base", and app-bithire/src contains no data-theme/forceTheme writer (2 hits, both comments).' },
  },
  evnto: {
    default: { verdict: 'REACHABLE', note: 'Shipped state. layout.tsx sets data-theme={serverTheme}; for the bundled evnto tenant serverTheme="base".' },
    light:   { verdict: 'UNREACHABLE-BY-ABSENCE', note: 'serverTheme is only ever base|light|dark and equals "light" only for a DB-configured non-bundled tenant, whose data-tenant is that tenant\'s slug -- so html[data-tenant=\'evnto\'] extension rules cannot match. Immaterial anyway: light == default for every selector here.' },
    dark:    { verdict: 'UNREACHABLE-BY-ABSENCE', note: 'Dark requires data-theme="dark"/.dark ON html[data-tenant=\'evnto\']. Bundled evnto resolves configuredTheme="base" (branding not fetched for bundled tenants), so serverTheme="base" and the auto pre-paint script is not emitted (it is gated on configuredTheme==="auto"). Non-bundled tenants can be dark but carry a different data-tenant.' },
  },
  rottay: {
    default: { verdict: 'REACHABLE', note: 'Shipped state, and the ONLY reachable one. app-platform/layout.tsx sets no data-theme; DesignSystemProvider resolves theme for bundled rottay to registry "base" -> ThemeProvider stamps data-theme="base". The compiled block is gated on [data-theme=light]/.light and therefore DOES NOT APPLY.' },
    light:   { verdict: 'UNREACHABLE-BY-ABSENCE', note: 'Requires data-theme="light"/.light on html[data-tenant=\'rottay\']. No writer exists: app-platform/src has 1 data-theme hit (a boot script that only READS localStorage "ds-theme-preference"), that key is never written anywhere in monorepo production source, no setTheme/useTheme/ThemeToggle in app-platform/src (0 hits), no forceTheme prop passed, registry theme="base", rottayBrandTheme declares no appearance.backgroundMode.' },
    dark:    { verdict: 'UNREACHABLE-BY-ABSENCE', note: 'Same absence of writers. Immaterial: the extension dark-default block is :not([data-theme=light]):not(.light), so it already paints the reachable default state.' },
  },
};
const SHOWROOM_CAVEAT = 'SCOPED TO THE PRODUCT SHELL. ui-design-system/packages/showroom passes forceTheme explicitly (e.g. components/k1-lane-a/index.tsx:266 forceTheme="light", app/probe/wl-canary/page.tsx:836 forceTheme={theme}, components/K4LaneDProbe.tsx:315 forceTheme={ground}) together with a tenantConfig whose slug reaches documentElement via TenantProvider. Inside the showroom the light and dark states ARE reachable, so every D-labelled contradiction below is observable there and becomes live the moment any product enables a mode switch.';
const isReachable = (v, s) => REACH[v][s].verdict === 'REACHABLE';

const DOMAIN_STEMS = /(candidate|applicant|recruit|interview|vacancy|job|pipeline|evidence-ledger|ticket|attendee|venue|invoice)/;
const norm = v => String(v).replace(/\s+/g, ' ').trim();
const isLiteral = v => !/^var\(/.test(v.trim());

function renderedEquality(cv, ev, map) {
  const a = norm(cv), b = norm(ev);
  if (a === b) return { equal: true, mode: 'textual-exact', detail: null };
  if (a.toLowerCase() === b.toLowerCase()) return { equal: true, mode: 'case-only-difference', detail: 'values differ only in hex/keyword letter case' };
  const ra = resolveOneLevel(a, map), rb = resolveOneLevel(b, map);
  const A = ra.resolved != null ? norm(ra.resolved) : a;
  const Bv = rb.resolved != null ? norm(rb.resolved) : b;
  if (ra.resolved != null || rb.resolved != null) {
    if (A.toLowerCase() === Bv.toLowerCase()) {
      return { equal: true, mode: 'resolved-one-level-equal', detail: 'compiled=' + a + ' extension=' + b + ' | resolved: ' + (ra.via || '(literal)') + ' vs ' + (rb.via || '(literal)') + ' -> ' + A };
    }
    if (isLiteral(A) && isLiteral(Bv) && !/color-mix|calc\(|var\(/.test(A + Bv)) {
      return { equal: false, mode: 'resolved-one-level-different', detail: 'compiled ' + a + ' -> ' + A + ' | extension ' + b + ' -> ' + Bv };
    }
    return { equal: null, mode: 'resolved-one-level-inconclusive', detail: 'compiled ' + a + ' -> ' + A + ' | extension ' + b + ' -> ' + Bv + ' (non-literal after one level)' };
  }
  if (isLiteral(a) && isLiteral(b) && !/color-mix|calc\(/.test(a + b)) return { equal: false, mode: 'literal-different', detail: null };
  return { equal: null, mode: 'unresolvable-one-level', detail: 'compiled=' + a + ' extension=' + b };
}

function classifyVertical(vKey) {
  const j = JSON.parse(fs.readFileSync(B + vKey + '-overlap.json', 'utf8'));
  const compiledSel = j.cascadeByState.compiledSelector;
  const compiledSpec = specificity(compiledSel);
  const maps = {}; for (const s of STATES) maps[s] = buildEffectiveMap(vKey, s);
  const compiledApplies = {}; for (const s of STATES) compiledApplies[s] = splitArms(compiledSel).some(a => armMatchesState(a, s));

  const names = {}, computed = { default: {}, light: {}, dark: {} };
  for (const s of STATES) computed[s] = { root: [], desc: [], survive: [], soleAuthor: [] };

  for (const rec of j.overlapRecords) {
    const compiled = rec.compiledDeclarations[rec.compiledDeclarations.length - 1];
    const perState = {}; const facets = new Set();
    for (const s of STATES) {
      const cA = compiledApplies[s];
      const rootCands = [], descCands = [], mediaCands = [];
      for (const d of rec.extensionDeclarations) {
        const arms = splitArms(d.selector).filter(a => armMatchesState(a, s));
        if (!arms.length) continue;
        const rootArms = arms.filter(a => !armIsDescendant(a));
        if (!rootArms.length) { descCands.push(d); continue; }
        if ((d.atRules || []).length) { mediaCands.push(d); continue; }
        rootCands.push({ d, spec: specificity(rootArms.join(',')) });
      }
      let w = null;
      for (const c of rootCands) { if (!w) { w = c; continue; } const k = cmpSpec(c.spec, w.spec); if (k > 0 || (k === 0 && c.d.order > w.d.order)) w = c; }
      const extEffective = !!w && (cmpSpec(w.spec, compiledSpec) >= 0 || !cA);
      const e = {
        compiledApplies: cA,
        compiledValue: cA ? norm(compiled.value) : null,
        compiledFileLine: cA ? compiled.file + ':' + compiled.line : null,
        extensionAtRoot: !!w, extensionEffective: extEffective,
        extensionValue: w ? norm(w.d.value) : null,
        extensionFileLine: w ? w.d.file + ':' + w.d.line : null,
        extensionSelector: w ? w.d.selector : null,
        extensionSection: w ? (w.d.sectionTitle || null) : null,
        extensionSpecificity: w ? w.spec : null,
        descendantOnly: !w && descCands.length > 0,
        mediaConditional: mediaCands.length > 0,
        mediaConditionalAtRules: mediaCands.map(d => ({ atRules: d.atRules, value: norm(d.value), fileLine: d.file + ':' + d.line })),
        reachable: isReachable(vKey, s),
        effectiveWinner: null, resultStrictTextual: null, result: null, equality: null,
      };
      if (descCands.length) facets.add('E');
      if (mediaCands.length) facets.add('C');
      if (cA && extEffective) {
        const eq = renderedEquality(e.compiledValue, e.extensionValue, maps[s]);
        e.equality = eq;
        e.effectiveWinner = 'extension';
        e.resultStrictTextual = norm(e.compiledValue) === norm(e.extensionValue) ? 'A' : 'B';
        e.result = eq.equal === true ? 'A' : 'B';
        if (eq.equal === true && e.resultStrictTextual === 'B') facets.add('B-textual-rendered-equal');
        if (eq.equal === null) facets.add('B-resolvedEquality-UNKNOWN');
      } else if (cA && !extEffective) {
        e.effectiveWinner = 'compiled';
        e.result = e.result = e.descendantOnly ? 'E' : (e.mediaConditional ? 'C' : 'COMPILED_SURVIVES');
        e.resultStrictTextual = e.result;
      } else if (!cA && extEffective) {
        e.effectiveWinner = 'extension (sole author -- compiled block does not apply in this state)';
        e.result = 'F'; e.resultStrictTextual = 'F';
      } else { e.effectiveWinner = 'none'; e.result = 'NONE'; e.resultStrictTextual = 'NONE'; }
      perState[s] = e;
      if (e.extensionAtRoot && extEffective && cA) computed[s].root.push(rec.name);
      if (e.descendantOnly) computed[s].desc.push(rec.name);
      if (cA && !extEffective && !e.descendantOnly) computed[s].survive.push(rec.name);
      if (!cA && extEffective) computed[s].soleAuthor.push(rec.name);
    }
    const isG = DOMAIN_STEMS.test(rec.name); if (isG) facets.add('G');
    function finalOf(key) {
      const reach = STATES.filter(s => isReachable(vKey, s)).map(s => perState[s][key]);
      const unreachCompetes = STATES.filter(s => !isReachable(vKey, s)).some(s => ['A', 'B', 'F'].includes(perState[s][key]));
      const c = [];
      if (reach.includes('B')) c.push('B');
      if (reach.includes('A')) c.push('A');
      if (isG) c.push('G');
      if (unreachCompetes) c.push('D');
      if (reach.includes('E')) c.push('E');
      if (reach.includes('C')) c.push('C');
      if (reach.includes('F')) c.push('F');
      if (!c.length) c.push('I');
      const sev = ['B', 'A', 'G', 'D', 'E', 'C', 'F', 'I'];
      return c.sort((x, y) => sev.indexOf(x) - sev.indexOf(y))[0];
    }
    for (const s of STATES) if (!isReachable(vKey, s) && ['A', 'B', 'F'].includes(perState[s].result)) facets.add('D-facet:' + s + '=' + perState[s].result);
    for (const s of STATES) if (perState[s].result === 'F') facets.add('F-facet:' + s);
    names[rec.name] = {
      name: rec.name, final: finalOf('result'), finalStrictTextual: finalOf('resultStrictTextual'),
      facets: [...facets].sort(),
      compiled: { value: norm(compiled.value), fileLine: compiled.file + ':' + compiled.line, selector: compiled.selector },
      extensionDeclarations: rec.extensionDeclarations.map(d => ({ value: norm(d.value), fileLine: d.file + ':' + d.line, selector: d.selector, section: d.sectionTitle || null, atRules: d.atRules || [], order: d.order })),
      perState,
    };
  }
  return { j, compiledSel, compiledSpec, compiledApplies, names, computed };
}

function validate(vKey, r) {
  const out = {};
  for (const s of STATES) {
    const cb = r.j.cascadeByState.states[s];
    if (!cb || cb.compiledBlockApplies !== true) { out[s] = { upstreamListsAvailable: false, note: 'compiled block does not apply in this state; upstream emitted no lists' }; continue; }
    const set = a => new Set(a); const diff = (a, b) => [...a].filter(x => !b.has(x));
    const mr = set(r.computed[s].root), tr = set(cb.overriddenAtRootNames || []);
    const ms = set(r.computed[s].survive), ts = set(cb.compiledValueSurvivesNames || []);
    const md = set(r.computed[s].desc), td = set(cb.overriddenOnlyInsideADescendantSubtreeNames || []);
    out[s] = { upstreamListsAvailable: true,
      overriddenAtRoot: { mine: mr.size, upstream: tr.size, onlyMine: diff(mr, tr), onlyUpstream: diff(tr, mr) },
      compiledSurvives: { mine: ms.size, upstream: ts.size, onlyMine: diff(ms, ts), onlyUpstream: diff(ts, ms) },
      descendantOnly: { mine: md.size, upstream: td.size, onlyMine: diff(md, td), onlyUpstream: diff(td, md) } };
    out[s].exactMatch = !out[s].overriddenAtRoot.onlyMine.length && !out[s].overriddenAtRoot.onlyUpstream.length && !out[s].compiledSurvives.onlyMine.length && !out[s].compiledSurvives.onlyUpstream.length;
  }
  return out;
}

const RESULT = {
  generatedAt: new Date().toISOString(),
  scope: 'Classification of shared custom-property names declared BOTH in the compiled BrandTheme block and in the authored extension, per vertical.',
  inputs: { bithire: 'bithire-overlap.json (188 shared)', evnto: 'evnto-overlap.json (82 shared)', rottay: 'rottay-overlap.json (267 shared)' },
  methodNotes: [
    'States modelled: default (no data-theme), light, dark. The SHIPPED state of all three verticals is data-theme="base" (bundled tenant registry theme). Verified selector-equivalence: across all six snapshot files the only data-theme values appearing in any selector are "light" and "dark" (grep: 8x data-theme="dark", 6x data-theme=\'dark\', 7x data-theme=\'light\', 2x data-theme="light"), therefore "base" satisfies exactly the same selectors as the modelled default state.',
    'Effective winner per state = among extension declarations whose selector matches the ROOT element in that state and that are not gated by an at-rule, the one with highest specificity, ties broken by later source order. The extension is appended after the compiled block inside the shipped index.css, so an equal-specificity extension declaration always wins.',
    'Specificity: :where() scores 0, :is()/:not() take the max of their arguments -- matching the upstream projection contract.',
    'Value comparison: (1) whitespace-collapsed textual equality; (2) case-insensitive equality (hex letter case); (3) one-level var() resolution against the effective root map built from the shipped <vertical>/index.css with postcss 8.5.10, per state. A pair that resolves to the same literal is reported as rendered-equal (A) with the strict-textual verdict (B) preserved in finalStrictTextual and in the facet list.',
    'color-mix()/calc() expressions are never declared equal or unequal by computation; they are reported as resolvedEquality UNKNOWN.',
    'Category D is applied when a name\'s only competition lies in states that product policy makes unreachable. Reachability is scoped to the product shell -- see reachability.showroomCaveat.',
    'Divergence from upstream cascadeByState: the 3 bithire motion names declared inside @media (prefers-reduced-motion: reduce) are counted by upstream as overriddenAtRoot; this classification treats an at-rule-gated declaration as a separate conditional context (category C), which is the only difference in the reconciliation below.',
  ],
  reachability: { showroomCaveat: SHOWROOM_CAVEAT, evidence: {}, perVertical: REACH },
  verticals: {},
};

for (const v of ['bithire', 'evnto', 'rottay']) {
  const r = classifyVertical(v);
  const counts = {}, countsStrict = {};
  for (const n of Object.values(r.names)) { counts[n.final] = (counts[n.final] || 0) + 1; countsStrict[n.finalStrictTextual] = (countsStrict[n.finalStrictTextual] || 0) + 1; }
  const perStateCounts = {};
  for (const s of STATES) { const c = {}; for (const n of Object.values(r.names)) { const k = n.perState[s].result; c[k] = (c[k] || 0) + 1; } perStateCounts[s] = c; }
  RESULT.verticals[v] = {
    sharedNameCount: Object.keys(r.names).length,
    compiledSelector: r.compiledSel, compiledSpecificity: r.compiledSpec, compiledAppliesByState: r.compiledApplies,
    finalCategoryCounts: counts, finalCategoryCountsStrictTextual: countsStrict, perStateResultCounts: perStateCounts,
    validationAgainstUpstreamCascade: validate(v, r), names: r.names,
  };
}
fs.writeFileSync(B + 'classification.json', JSON.stringify(RESULT, null, 1));
console.log('WROTE classification.json (' + (fs.statSync(B + 'classification.json').size / 1048576).toFixed(1) + ' MB)');
for (const [v, d] of Object.entries(RESULT.verticals)) {
  console.log('\n== ' + v + ' n=' + d.sharedNameCount);
  console.log('   FINAL (rendered):', JSON.stringify(d.finalCategoryCounts));
  console.log('   FINAL (strict textual):', JSON.stringify(d.finalCategoryCountsStrictTextual));
  console.log('   compiledApplies:', JSON.stringify(d.compiledAppliesByState));
  for (const s of STATES) console.log('     ' + s + ':', JSON.stringify(d.perStateResultCounts[s]));
  for (const s of STATES) { const val = d.validationAgainstUpstreamCascade[s]; console.log('     VALIDATE ' + s + ': ' + (val.upstreamListsAvailable ? 'exact=' + val.exactMatch + ' root ' + val.overriddenAtRoot.mine + '/' + val.overriddenAtRoot.upstream + (val.exactMatch ? '' : ' onlyUpstream=' + JSON.stringify(val.overriddenAtRoot.onlyUpstream)) : val.note)); }
}
