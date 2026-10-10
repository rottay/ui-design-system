/**
 * P-88 pass-through census -- SUMMARY (WO-ARC-12). Totals, line-free-keyable sites, paths, the
 * per-child-family precondition, the dependents and state dependents, the excluded rows (with
 * the tripwire marker). READ-ONLY, pure. The body is the adopted report.mjs verbatim; its CLI
 * shell, the out-of-repo tool shas, the `generated` date and the markdown fragment are dropped.
 */
// Provenance: arc12/l2-tools/report.mjs sha256 8a8ca98cba3b6dab6637a9245ddcbab1cf59eb3ed220b6e65c630329afcb8696 (census v7.1.1, 2026-10-10: the
// tag-name audit list dropped with the fallback; v7.1 was d66a34b2 -- the unresolved-caller section; v7 was 44b91e89).

/** @param {object} d  classifyPassThrough() output. @param {object} raw  sweepPassThrough() output. */
export function summarizePassThrough(d, raw, { head = null } = {}) {
const short = (f) => f.replace('packages/core/src/components/', '');
const CARRIERS = new Set(['box', 'flex', 'stack', 'grid', 'space', 'container']);

// twins: same file+owner+mechanics within 2 lines -> one logical site
const sites = d.sites.map((s) => ({ ...s }));
let logical = 0; const seen = [];
for (const s of sites) {
  const twin = seen.find((t) => t.file === s.file && t.owner === s.owner && t.mechanics === s.mechanics && Math.abs(t.line - s.line) <= 2);
  if (twin) { s.twinOf = twin.id; } else { logical += 1; seen.push(s); }
}
const ADJ = {
  'primitives/inputs/toggle/engines/modern/index.tsx:140': 'RULED breach (review 304b6e7c section 8): the input is painted (.ds-toggle.ds-toggle--modern input); strip data-part/data-state from the rest; pin at promotion',
  'primitives/inputs/select/engines/modern/index.tsx:1010': 'RESOLVED: pinned at b044f9010 (PassThroughLaw custom-trigger resting data-state it.fails)',
  'primitives/inputs/button/engines/modern/index.tsx:516': 'RESOLVED: pinned at b044f9010 (Button.passthrough-contract modern anchor-path data-part + resting data-state it.fails, x2 with the rerun file)',
};
for (const s of sites) {
  const k = short(s.file) + ':' + s.line;
  if (ADJ[k]) s.adjudicate = ADJ[k];
  s.layoutCarrier = CARRIERS.has(s.family);
  s.route = s.kind === 'compound' ? 'step2-compound (engine-agnostic file)' : s.engine === 'classic' ? 'step3-classic-strip-only' : 'step2-modern-rustic';
}
const pathKey = (s) => `${s.family}/${s.engine}${s.subpart ? '/' + s.subpart : ''}`;
const paths = new Map();
for (const s of sites) { const k = pathKey(s); if (!paths.has(k)) paths.set(k, { path: k, kind: s.kind, classes: new Set(), sites: [] }); const p = paths.get(k); s.breachClasses.forEach((c) => p.classes.add(c)); p.sites.push(short(s.file) + ':' + s.line); }
const pathList = [...paths.values()].map((p) => ({ ...p, classes: [...p.classes] }));
const count = (arr, f) => arr.filter(f).length;
const replacesPaths = pathList.filter((p) => p.classes.includes('part-replace'));
const addsOnlyPaths = pathList.filter((p) => !p.classes.includes('part-replace') && p.classes.includes('part-forward'));
const totals = {
  unit_note: 'site = one JSX element / React.createElement call that is the public root or trigger of a component and that a caller data-part or data-state can reach; path = component x engine (x compound sub-part)',
  sites: sites.length,
  logicalSites: logical,
  twinsMerged: sites.length - logical,
  byKind: { engine: count(sites, (s) => s.kind === 'engine'), compound: count(sites, (s) => s.kind === 'compound') },
  byPartClass: { 'part-replace': count(sites, (s) => s.partClass === 'part-replace'), 'part-forward (ADDS)': count(sites, (s) => s.partClass?.startsWith('part-forward')), 'part kept': count(sites, (s) => !s.partClass) },
  byStateClass: { 'state-forward': count(sites, (s) => s.stateClass === 'state-forward'), 'state-rest': count(sites, (s) => s.stateClass === 'state-rest'), 'state kept': count(sites, (s) => !s.stateClass) },
  byEngine: Object.fromEntries(['classic', 'modern', 'rustic', 'all (compound)'].map((e) => [e, count(sites, (s) => s.engine === e)])),
  paths: pathList.length,
  pathsByKind: { engine: count(pathList, (p) => p.kind === 'engine'), compound: count(pathList, (p) => p.kind === 'compound') },
  historicalComparison: {
    historical: '49 = 36 engine + 13 compound (bb6b0525f commit body; per-site evidence lost)',
    reconstruction: 'data-part class only, path unit: engine REPLACES paths + compound REPLACES-or-ADDS paths',
    engineReplacesPaths: count(replacesPaths, (p) => p.kind === 'engine'),
    compoundReplacesPaths: count(replacesPaths, (p) => p.kind === 'compound'),
    compoundAddsOnlyPaths: count(addsOnlyPaths, (p) => p.kind === 'compound'),
    engineAddsOnlyPaths: count(addsOnlyPaths, (p) => p.kind === 'engine'),
  },
  layoutCarrierSites: count(sites, (s) => s.layoutCarrier),
  sitesExcludingLayoutCarriers: count(sites, (s) => !s.layoutCarrier),
  pinnedSites: 0,
};
const pinned = new Set(d.pinCheck.flatMap((p) => p.censusSites));
for (const s of sites) s.pinned = pinned.has(short(s.file) + ':' + s.line);
totals.pinnedSites = pinned.size;
totals.unpinnedSites = sites.length - pinned.size;

// dependents grouped by owner skin, route step 1
const deps = d.dependents.map((c) => ({ ...c, contingentOnCarrierRuling: CARRIERS.has(c.childFamily) }));
const byOwner = new Map();
for (const c of deps) {
  const k = c.ownerSkinFamily;
  if (!byOwner.has(k)) byOwner.set(k, { ownerSkin: k, callers: 0, nonCarrierCallers: 0, rules: 0, nonCarrierRules: 0, strict: 0, children: {} });
  const o = byOwner.get(k);
  o.callers++; o.rules += c.skinRulesSelectingCallerPart; if (/^strict/.test(c.dependency)) o.strict++;
  if (!c.contingentOnCarrierRuling) { o.nonCarrierCallers++; o.nonCarrierRules += c.skinRulesSelectingCallerPart; }
  o.children[c.childFamily] = (o.children[c.childFamily] ?? 0) + 1;
}
const ownerList = [...byOwner.values()].sort((a, b) => b.nonCarrierCallers - a.nonCarrierCallers || b.callers - a.callers);
const byChild = {};
for (const c of deps) { const k = c.childFamily; byChild[k] = byChild[k] ?? { callers: 0, strict: 0, rules: 0, ownerSkins: new Set(), carrier: CARRIERS.has(k) }; byChild[k].callers++; if (/^strict/.test(c.dependency)) byChild[k].strict++; byChild[k].rules += c.skinRulesSelectingCallerPart; byChild[k].ownerSkins.add(c.ownerSkinFamily); }
for (const v of Object.values(byChild)) v.ownerSkins = v.ownerSkins.size;

// C1 state dependents
const sdeps = d.stateDependents.map((c) => ({ ...c, contingentOnCarrierRuling: CARRIERS.has(c.childFamily) }));
const distinctStateRules = new Set();
for (const c of sdeps) for (const [f, n] of Object.entries(c.stateSkinFiles)) distinctStateRules.add(f + '#' + c.callerStateValues.join('|') + '#' + (c.callerPart ?? ''));
const sByOwner = {};
for (const c of sdeps) for (const o of Object.keys(c.stateSkinFiles)) { const k = o.replace(/^.*skin\/([^/]+)\/index\.css$/, '$1'); sByOwner[k] = sByOwner[k] ?? { callers: 0, ruleAttributions: 0, children: {} }; sByOwner[k].callers++; sByOwner[k].ruleAttributions += c.stateSkinFiles[o]; sByOwner[k].children[c.childFamily] = (sByOwner[k].children[c.childFamily] ?? 0) + 1; }
// per-child-family precondition (part AND state dependents must be 0 before that family's strip lot)
const precondition = {};
for (const c of deps) { precondition[c.childFamily] = precondition[c.childFamily] ?? { callerPartDependents: 0, callerStateDependents: 0 }; precondition[c.childFamily].callerPartDependents++; }
for (const c of sdeps) { precondition[c.childFamily] = precondition[c.childFamily] ?? { callerPartDependents: 0, callerStateDependents: 0 }; precondition[c.childFamily].callerStateDependents++; }
const unpainted = d.excluded.filter((e) => /unpainted/.test(e.excludedBecause));
totals.excludedUnpaintedC2 = unpainted.length;
totals.callerPartDependents = deps.length;
totals.callerStateDependents = sdeps.length;
totals.callerStateDependentRuleAttributions = sdeps.reduce((a, c) => a + c.skinRulesSelectingCallerState, 0);
totals.callerStateDependentDistinctRules = new Set(sdeps.flatMap((c) => c.stateSelectorsHit)).size;
totals.callersPassingDataState = d.stateCallers.length;
// v4 (M1-M5, review-arc12-c4c6 304b6e7c)
totals.callerPartDependentsNonCarrier = count(deps, (c) => !c.contingentOnCarrierRuling);
totals.callerPartDependentsCarrier = count(deps, (c) => c.contingentOnCarrierRuling);
totals.nonCarrierRuleAttributions = deps.filter((c) => !c.contingentOnCarrierRuling).reduce((a, c) => a + c.skinRulesSelectingCallerPart, 0);
totals.v4Delta = { left: d.v4delta.left.length, entered: d.v4delta.entered.length, enteredNonCarrier: d.v4delta.entered.filter((id) => !CARRIERS.has(d.callers.find((c) => c.id === id).childFamily)).length, enteredCarrier: d.v4delta.entered.filter((id) => CARRIERS.has(d.callers.find((c) => c.id === id).childFamily)).length, existingGainingRules: d.v4delta.gainedRules.length };
totals.c4AssertionViolations = d.c4Assertion.unresolved.length;
// v7.1: openers with a literal data-part/data-state whose family the sweep could not resolve.
// Never silent: counted here, listed in `unresolvedCallers`. A sweep without the list is refused.
if (!Array.isArray(raw.unresolvedCallers)) throw new Error('pass-through summary: the sweep carries no unresolvedCallers list (census v7.1 requires it)');
const GENUINE_UNRESOLVED = ['local-dynamic-binding', 'unresolvable'];
const unresolvedByClass = {};
for (const u of raw.unresolvedCallers) unresolvedByClass[u.class] = (unresolvedByClass[u.class] ?? 0) + 1;
const genuinelyUnresolvable = raw.unresolvedCallers.filter((u) => GENUINE_UNRESOLVED.includes(u.class));
totals.unresolvedCallers = raw.unresolvedCallers.length;
totals.unresolvedCallersGenuine = genuinelyUnresolvable.length;
// v6: C7 compound-satisfiability (review-arc12-l05-h1 §2)
totals.c7 = { leave: d.c7.leave.length, reduced: d.c7.reduced.length, rulesStruck: d.c7.rulesStruck, rulesStruckNonCarrier: d.callers.filter((c) => c.attribution && !CARRIERS.has(c.childFamily)).reduce((a, c) => a + c.attribution.c7Struck, 0), rulesStruckCarrier: d.callers.filter((c) => c.attribution && CARRIERS.has(c.childFamily)).reduce((a, c) => a + c.attribution.c7Struck, 0), stateCallersWithStruckRule: d.c7.stateCallersWithStruckRule.length }; // v5: UNRESOLVED count (the only failing class)
totals.c4EngineScope = { total: d.c4Assertion.partSelectingEngineRules, marked: d.c4Assertion.marked, anchored: d.c4Assertion.anchored, anchoredByDataAttribute: d.c4Assertion.anchoredByAttr, crossRows: d.c4Assertion.crossRows, crossDistinct: d.c4Assertion.crossDistinct, unresolved: d.c4Assertion.unresolved.length, passes: d.c4Assertion.passes };
const fenceFiles = (() => { const m = new Map(); for (const c of deps) { if (!m.has(c.file)) m.set(c.file, { nc: 0, c: 0 }); m.get(c.file)[c.contingentOnCarrierRuling ? 'c' : 'nc']++; } return { nonCarrierCallerFiles: [...m.values()].filter((v) => v.nc > 0).length, shared: [...m].filter(([, v]) => v.nc > 0 && v.c > 0).map(([f]) => f).sort() }; })();
totals.step1NonCarrierCallerFiles = fenceFiles.nonCarrierCallerFiles;
totals.concurrencyFenceFiles = fenceFiles.shared.length;
const out = {
  schema: 'arc12-l2-census/6',
  version: 'v6 (C7 compound-satisfiability + N-1 mandatory repo root per review-arc12-l05-h1.report.txt; v5 = C4 ENGINE SCOPE; v4 = M1-M5; v3 = R1-R4; v2 = C1/C2/C3)',
  c7: {
    authority: 'review-arc12-l05-h1.report.txt section 2 (binding for the census tool AND the pass-through gate dependent counters)',
    text: "A rule R credited to caller C (by attribution rule (1), (2), (3) or 4b) is STRUCK iff ALL hold: (i) every occurrence of C's part token in R is a TOP-LEVEL simple selector of some compound (inside :is()/:where()/:has()/:not() keeps R); (ii) C's opening JSX tag is located by its child name at C's line and its className is a single static string literal (or absent), no prop spread (dynamic className, template, cx(), variable or spread keeps R); (iii) EVERY compound of R carrying C's part token requires, as a top-level class, some ds-* K that is OWNED by C's component root (rule-4b ownership, non-empty emitters) AND absent from C's static className. Otherwise R stays credited (fail-closed). A caller whose credited count becomes 0 is not a dependent. Applied identically to state-rule attribution, using the [data-state…] compound with the caller part.",
    leave: d.c7.leave, reduced: d.c7.reduced, rulesStruck: d.c7.rulesStruck, stateCallersWithStruckRule: d.c7.stateCallersWithStruckRule,
  },
  v4: {
    attribution: 'C4 engine-dir scope (a caller under engines/<e>/ keeps only runtime/engines/<e>/skin + presentation rules) + rule 4b (owned-class: a ds-* class emitted by the caller file whose every emitter lies under the caller component root, within C4 scope). Rule 4 as worded is NOT implemented. Parts split on |. Selectors parsed paren-aware.',
    delta: d.v4delta,
    c4Assertion: {
      authority: 'review-arc12-m1-assertion.report.txt section 2 (binding; replaces the M1 marker-only assertion)',
      text: 'ANCHOR = a .ds-*/.rottay-* class or a [data-pattern=…]/[data-component=…] value in S; EMITTERS = non-test .ts/.tsx under packages/core/src/components containing it. For every comma-split S selecting [data-part=…] under runtime/engines/<e>/skin: (1) MARKED: .ds-engine-<e> | [data-engine=<e>] | a class ending -<e> -> SCOPE {<e>}; (2) ANCHORED: an ANCHOR whose EMITTERS are non-empty and all under components/**/engines/<e>/ -> SCOPE {<e>}; (3) CROSS: otherwise an ANCHOR with >=1 EMITTER, some outside engines/<e>/ -> SCOPE ALL; (4) UNRESOLVED: no MARK and no ANCHOR with emitters -> the gate FAILS and names S. C4 attribution excludes a rule for an engines/<x>/ caller only when SCOPE is a single engine != x; callers outside those dirs (incl. engines/foundation) keep every rule; presentation-skin rules are SCOPE ALL.',
      counts: { total: d.c4Assertion.partSelectingEngineRules, marked: d.c4Assertion.marked, anchored: d.c4Assertion.anchored, anchoredByDataAttribute: d.c4Assertion.anchoredByAttr, crossRows: d.c4Assertion.crossRows, crossDistinct: d.c4Assertion.crossDistinct, unresolved: d.c4Assertion.unresolved.length, passes: d.c4Assertion.passes },
      crossRosterRule: 'closed, line-free set (file#selector) in the ledger; a new CROSS selector is red until added through --update-baseline',
      crossRoster: d.c4Assertion.crossRoster,
      unresolved: d.c4Assertion.unresolved,
      superseded: 'v4 marker-only list (548) kept at arc12/l2-census-v2/v4/c4-assertion-violations.json for provenance',
    },
    concurrencyFence: { rule: 'files holding BOTH non-carrier and carrier part dependents: no carrier lot and no state lot concurrently on these files or their owner skins', files: fenceFiles.shared },
    c5: 'input modern :445/:488 classNameHookOnSameElement=false (className on the ds-input-field wrapper, part on the inner element); :321 stays true',
  },
  repo: 'ui-design-system', head, branch: 'main',
  readOnly: 'static TypeScript-AST sweep of packages/core/src (src verified clean vs HEAD: git diff --quiet HEAD -- packages/core/src); no test run, no repo write',
  law: 'P-88 (packages/core/src/foundation/contracts/kernel/common/index.ts:153-168, owner ruling 2026-10-06)',
  corpus: { engineFiles: raw.engineFileCount, skinSelectors: raw.skinSelectorCount, skinDirs: ['runtime/engines/modern/skin', 'runtime/engines/rustic/skin', 'presentation/components/skin'] },
  definition: {
    site: 'a JSX element or React.createElement call in packages/core/src/components (tests/stories excluded) that (a) receives the public caller props carrier (rest of the exported component props, aliases and one-level object indirection resolved) or a value derived from the caller data-part/data-state, (b) is rendered by an exported component (or a local component it delegates to), (c) lands on the DOM (intrinsic tag, dynamic tag variable, an Ant component that forwards rest, or a child DS component handed an explicit caller-derived data-part), and (d) belongs to a family that owns a part (any engine stamps a canonical part on its public root) or ships a skin, and (e) [amended, binding per review-arc12-l2-census-v2 304b6e7c] the landing element is painted: ANY of (i) a DS-owned class, (ii) a stamped canonical part, (iii) a DS skin selector reaches it, (iv) the component itself applies paint (component-authored inline style -- not a caller-style pass-through -- or an Ant/engine-owned paint class/root). An element carrying only caller className/style, or nothing, is an unpainted wrapper (excluded with tripwire)',
    classes: {
      'part-replace': 'the canonical part is resolved from the caller (dataPart ?? "x", imperative stampDataPart included) or the caller rest is spread AFTER the engine part stamp (REPLACES)',
      'part-forward': 'the element carries no engine part and the caller rest carries data-part (ADDS) on a skinned family',
      'state-forward': 'the caller rest carries data-state and the engine stamps no data-state after it (classic D1/D2 shape) or stamps it before the spread',
      'state-rest': 'the engine data-state lands after the rest but is conditional (partAttributes omits data-state at rest, or a ternary yields undefined), so a resting caller data-state survives (D3 shape)',
    },
    excluded: 'internal helpers fed only by engine props, delegations to a child component (the child is the accountable site), the Ant overlay Tooltip (landing not statically provable), structural families with no part and no skin (VisuallyHidden)',
    skinRuleCount: 'comma-split selectors in the engine skin set (modern -> modern+presentation, rustic -> rustic+presentation, classic -> presentation, compound -> all three) of the same family that select the canonical part; stateRules = those also selecting [data-state]',
  },
  totals,
  unresolvedCallers: { note: 'v7.1: every opener with a literal data-part/data-state on a capitalised tag whose family did not resolve (import path or lexical re-export chain; v7.1.1: a tag name alone proves nothing). The classes local-intrinsic-variable, local-component, third-party and non-family-component are proven by the evidence column; the GENUINELY UNRESOLVABLE set (local-dynamic-binding, unresolvable) must be empty or individually justified.', total: raw.unresolvedCallers.length, byClass: unresolvedByClass, genuinelyUnresolvable, rows: raw.unresolvedCallers, resolvedToNonBreachingFamily: raw.nonBreachingCallers ?? {} },
  sites,
  paths: pathList,
  pinCheck: d.pinCheck,
  stateDependents: { note: 'C1: callers that hand data-state to a component whose public root currently lets a caller state land, AND whose owner skin selects that state value (on the caller part when the caller passes one). These rules go dead on the day the child family strips data-state, so they must move to their named door first.', total: sdeps.length, ruleAttributions: totals.callerStateDependentRuleAttributions, byOwnerSkin: sByOwner, callers: sdeps, allStateCallers: d.stateCallers },
  perFamilyPrecondition: { rule: 'no part-strip lot for a child family until its callerPartDependents are 0; no state-strip lot for a child family until its callerStateDependents are 0', byChildFamily: precondition },
  dependents: { note: 'callers inside packages/core/src that hand a literal data-part to a component whose public root currently lets a caller part land, AND to which at least one skin rule is credited under the v4 attribution (v3 owner skins, C4 engine scope, plus rule 4b owned-class rules). These rules stop matching the day the engine stops honouring the caller part: route step 1 migrates them to className/slot hooks first.', total: deps.length, nonCarrierTotal: count(deps, (c) => !c.contingentOnCarrierRuling), byChildFamily: byChild, byOwnerSkin: ownerList, callers: deps },
  excluded: d.excluded.map((e) => ({ id: e.id, tag: e.tag, owner: e.owner, engine: e.engine, family: e.family, partClass: e.partClass, stateClass: e.stateClass, excludedBecause: e.excludedBecause, elementPaint: e.elementPaint, ...( /unpainted/.test(e.excludedBecause) ? { tripwire: 'pass-through gate must re-check condition (e) every run: the row re-enters the roster (counted) the moment any DS class, stamped part or skin selector reaches this element' } : {}) })),
};
return out;
}
