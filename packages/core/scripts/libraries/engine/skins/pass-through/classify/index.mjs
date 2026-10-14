/**
 * P-88 pass-through census -- CLASSIFY (WO-ARC-12). Turns the sweep into violating sites (the
 * five-condition definition, amended (e)(i)-(iv)), the excluded rows with their reasons (the
 * unpainted-wrapper TRIPWIRE rows among them), the caller enumeration and the dependents under
 * the v7 attribution (v3 owner skins, C4 engine scope, rule 4b, C7..C10 strikes). READ-ONLY.
 * The body is the adopted post.mjs verbatim; only its CLI shell is replaced.
 */
// Provenance: arc12/census-v719/post.mjs sha256 33ef798a84c16bff09dd2a94ce882cc3db34871a9a352cff177217e3f90a07b1 (census v7.1.9, 2026-10-14: the
// structural-forward class, its s1-s5 predicate and the closed STRUCTURAL_FORWARDS roster; v7.1.6 was arc12/census-v716/post.mjs c23e82f4 -- the pin
// inventory is empty, the modern and rustic Card rows left; v7.1.5 was arc12/census-v715/post.mjs 4c8ae5ca, v7.1.4 arc12/census-v714/post.mjs 3bf98a0d, v7.1.2 arc12/dt3/post.mjs d6eb6187, v7 through v7.1.1 arc12/l2-tools/post.mjs 2632ae59).
import { buildAttribution, ALL_RULES } from '../attribution/index.mjs';

/** @param {object} raw  sweepPassThrough() output. @param {{ repoRoot: string, rules?: string[] }} options */
export function classifyPassThrough(raw, { repoRoot, rules } = {}) {
const REPO = repoRoot;
if (!REPO) throw new Error('classifyPassThrough: repoRoot (the workspace root) is required');
const RULES = rules ? [...rules] : [...ALL_RULES];
for (const r of RULES) if (!ALL_RULES.includes(r)) throw new Error('classifyPassThrough: unknown rule ' + r);
const ATT = buildAttribution(REPO, { rules: RULES });

const all = [...raw.engineSites, ...raw.structuralSites];
const short = (f) => f.replace('packages/core/src/components/', '');

// families that own a part of their own (any public site stamps a canonical part) or a skin
const familyHasPart = new Set(all.filter((r) => r.publicOwner && r.canonicalPart).map((r) => r.family));
const skinned = (fam) => raw.familiesWithSkin.includes(fam) || familyHasPart.has(fam);

// reachability: internal owner reached by a public site delegating to it (same file)
const reach = new Set(all.filter((r) => r.publicOwner).map((r) => `${r.file}#${r.owner}`));
for (let i = 0; i < 4; i++) for (const r of all) if (reach.has(`${r.file}#${r.owner}`) && r.tagKind === 'local-component') reach.add(`${r.file}#${r.tag}`);

function landing(r) {
  if (r.tagKind === 'intrinsic' || r.tagKind === 'ant') {
    if (/^AntTooltip$/.test(r.tag)) return 'ant-unverified';
    return r.tagKind === 'ant' ? 'ant-forwards' : 'dom';
  }
  if (r.tagKind === 'dynamic') return /Engine$|^Resolved/.test(r.tag) ? 'delegate' : 'dom';
  if (r.seq.some((x) => x.startsWith('part[caller]'))) return 'via-child-explicit';
  if (/^(Box|Flex|Stack|Grid|Space|Container)$/.test(r.tag)) return 'via-forwarding-layout-carrier';
  return 'delegate';
}

const sites = [];
const excluded = [];
for (const r of all) {
  const land = landing(r);
  const reachable = reach.has(`${r.file}#${r.owner}`);
  const fam = r.family;
  const breachPart = r.part !== 'keeps' ? r.part : null;
  const breachState = r.state !== 'keeps' ? r.state : null;
  const base = {
    id: `${short(r.file)}:${r.line}`,
    file: r.file, line: r.line, tag: r.tag, owner: r.owner,
    kind: r.isEngine ? 'engine' : 'compound',
    engine: r.engine ?? 'all (compound)', family: fam, subpart: r.subpart ?? null,
    canonicalPart: r.canonicalPart,
    partClass: breachPart === 'part-replace' ? 'part-replace' : breachPart === 'part-forward' ? 'part-forward (ADDS)' : null,
    stateClass: breachState,
    breachClasses: [breachPart === 'part-replace' ? 'part-replace' : breachPart === 'part-forward' ? 'part-forward' : null, breachState].filter(Boolean),
    mechanics: r.seq.join(' > '),
    landing: land,
    skinRulesOnCanonicalPart: r.skinRulesOnCanonicalPart,
    skinStateRulesOnCanonicalPart: r.skinStateRulesOnCanonicalPart,
    familySkinSelectorTotal: r.engineSkinSelectorTotal,
    skinFiles: r.engineSkinFiles.map((f) => f.replace('packages/core/src/foundation/tokens/css/', '')),
    classNameHookOnSameElement: r.classNameHook,
    elementPaint: r.elementPaint,
    // v7.1.9: the element's own DS classes and the anatomy rules that select it by them
    ownClasses: r.dsClasses, ownClassPartial: r.dsClassPartial, ownAnatomyRules: r.ownAnatomyRules,
    ownSkinFiles: r.ownSkinFiles.map((f) => f.replace('packages/core/src/foundation/tokens/css/', '')),
    engineStampsState: r.engineStampsState,
    ...(r.familyRelabel ? { familyRelabel: r.familyRelabel } : {}),
  };
  let reason = null;
  if (!breachPart && !breachState) reason = 'keeps both';
  else if (!reachable) reason = 'internal helper not reached by public caller props';
  else if (land === 'delegate') reason = 'delegates to a child component (child is the accountable site)';
  else if (land === 'ant-unverified') reason = 'Ant overlay; DOM landing not statically provable';
  else if (!skinned(fam)) reason = 'structural: family has no part of its own and no skin (P-88 allows forwarding)';
  else if (!r.elementPainted) reason = 'unpainted wrapper (amended condition e: no DS-owned class, no stamped part, no DS skin selector, no component-applied paint -- only caller className/style or nothing) -- TRIPWIRE: re-enters the census the moment any of (i)-(iv) reaches it';
  if (reason) excluded.push({ ...base, excludedBecause: reason });
  else sites.push(base);
}
sites.sort((a, b) => a.id.localeCompare(b.id));

// pin consistency: no pinned behaviour is left (0 it.fails); a new pin is a row here
// v7.1.2: 10 rows left with their promotion to passing tests -- the modern Select pair at E1
// (bfe7d5f89), the modern/rustic Button eight at E9 (28e169406). A row leaves only that way.
// v7.1.4: the two classic Button rows left the same way, with the classic strip (step 3, S3-1).
// v7.1.5: the two classic Card rows left with theirs (S3-3); the PassThroughLaw table was split there.
// v7.1.6: the modern and rustic Card rows left with the Card engine lot (O-3). The inventory is empty.
const PINS = [];
const pinCheck = PINS.map((p) => { const hit = sites.filter(p.match).map((s) => s.id); return { pin: p.pin, censusSites: hit, present: hit.length > 0 }; });

// ---------- compound dependents (callers passing a part/state to a breaching family) ----------
const landsPart = new Map(); // family -> [engines whose public root lets a caller part land]
const landsState = new Map();
for (const s of sites) {
  if (s.kind !== 'engine') continue;
  if (s.partClass) { if (!landsPart.has(s.family)) landsPart.set(s.family, new Set()); landsPart.get(s.family).add(`${s.engine}:${s.partClass.split(' ')[0]}`); }
  if (s.stateClass) { if (!landsState.has(s.family)) landsState.set(s.family, new Set()); landsState.get(s.family).add(`${s.engine}:${s.stateClass}`); }
}
for (const s of sites) if (s.kind === 'compound' && s.partClass) { if (!landsPart.has(s.family)) landsPart.set(s.family, new Set()); landsPart.get(s.family).add(`compound:${s.partClass.split(' ')[0]}`); }
// M3 (C5, review 304b6e7c): input modern :445/:488 put the caller className on the
// ds-input-field wrapper and the caller part on the inner shell/<input> -- different elements.
// Only the file-input path :321 is a same-element door.
const C5_NO_DOOR = new Set(['primitives/inputs/input/engines/modern/index.tsx:445', 'primitives/inputs/input/engines/modern/index.tsx:488']);
for (const s of sites) if (C5_NO_DOOR.has(short(s.file) + ':' + s.line)) { s.classNameHookOnSameElement = false; s.c5 = 'className lands on the ds-input-field wrapper, part on the inner element (C5)'; }
const hookByFamily = new Map();
for (const s of sites) if (s.kind === 'engine') hookByFamily.set(`${s.family}:${s.engine}`, (hookByFamily.get(`${s.family}:${s.engine}`) ?? false) || s.classNameHookOnSameElement);
const hookSites = new Map();
for (const s of sites) if (s.kind === 'engine') { const k = `${s.family}:${s.engine}`; if (!hookSites.has(k)) hookSites.set(k, {}); hookSites.get(k)[short(s.file) + ':' + s.line] = s.classNameHookOnSameElement; }

const callers = [];
for (const c of raw.compoundSites) {
  const partLands = c.callerPart && landsPart.has(c.childFamily);
  const stateLands = c.callerState && landsState.has(c.childFamily);
  if (!partLands && !stateLands) continue;
  const engines = [...(landsPart.get(c.childFamily) ?? [])].map((e) => e.split(':')[0]).filter((e) => e !== 'compound');
  callers.push({
    id: `${short(c.file)}:${c.line}`, file: c.file, line: c.line, child: c.tag, childFamily: c.childFamily,
    callerPart: c.callerPart, callerState: c.callerState,
    landsOnEngines: [...(landsPart.get(c.childFamily) ?? [])],
    stateLandsOnEngines: c.callerState ? [...(landsState.get(c.childFamily) ?? [])] : [],
    ownerSkinFamily: c.ownerSkinFamily, ownerSkins: c.ownerSkins, partLands: Boolean(partLands), stateLands: Boolean(stateLands),
    skinRulesSelectingCallerPart: c.skinRulesSelectingCallerPart,
    callerPartNativelyStamped: c.callerPartNativelyStamped,
    skinFiles: Object.fromEntries(Object.entries(c.skinFiles).map(([k, v]) => [k.replace('packages/core/src/foundation/tokens/css/', ''), v])),
    classNameHookOnChildRoot: engines.length ? engines.every((e) => hookByFamily.get(`${c.childFamily}:${e}`) !== false) : null,
    classNameHookOnChildRootBySite: Object.assign({}, ...engines.map((e) => hookSites.get(`${c.childFamily}:${e}`) ?? {})),
  });
}
// v4 attribution: C4 engine scope + rule 4b on top of the v3 owner-skin attribution
for (const c of callers) {
  c.v3SkinRules = c.skinRulesSelectingCallerPart;
  c.v3SkinFiles = c.skinFiles; // owner-skin attribution INPUT (v3 rules 1-3); skinFiles below = v4-credited OUTPUT
  if (!c.partLands || !c.callerPart) continue;
  const a = ATT.attribute(c);
  c.attribution = { engineScope: a.engineScope, base: a.base, c4Dropped: a.c4Dropped, r4b: a.r4b, r4bFiles: a.r4bFiles, ownedClasses: a.ownedClasses, preC7: a.preC7, c7Struck: a.c7Struck, c7StruckSelectors: a.c7StruckSelectors, staticTag: a.staticTag, struckBy: a.struckBy, ruleEvidence: a.rules, c10Diag: a.c10Diag };
  c.skinRulesSelectingCallerPart = a.total;
  c.skinFiles = a.skinFiles;
}
const dependents = callers.filter((c) => c.partLands && c.skinRulesSelectingCallerPart > 0);
const v4delta = {
  left: callers.filter((c) => c.partLands && c.v3SkinRules > 0 && c.skinRulesSelectingCallerPart === 0).map((c) => c.id),
  entered: callers.filter((c) => c.partLands && !(c.v3SkinRules > 0) && c.skinRulesSelectingCallerPart > 0).map((c) => c.id),
  gainedRules: callers.filter((c) => c.partLands && c.v3SkinRules > 0 && c.attribution && c.attribution.r4b > 0).map((c) => c.id),
};
// C1: state dependents + named door per dependent
const STATUS = new Set(['pass', 'fail', 'valid', 'invalid', 'checked', 'idle', 'complete', 'verified', 'open', 'adjusted', 'warning', 'error', 'loading', 'empty', 'ready', 'query', 'results']);
const raw2 = new Map(raw.compoundSites.map((c) => [`${short(c.file)}:${c.line}`, c]));
const stateCallers = callers.filter((c) => c.callerState).map((c) => {
  const r = raw2.get(c.id);
  const vals = r.callerStateValues;
  let door;
  if (r.callerStateDynamic && /serializeState/.test(c.callerState)) door = 'non-anatomy data-* (data-interaction="<serialized state>") on the forwarded rest; the skin re-anchors [data-state~=x] -> [data-interaction~=x]';
  else if (r.callerStateDynamic || vals.every((v) => STATUS.has(v))) door = `non-anatomy data-status (${r.callerStateDynamic ? 'data-status={' + c.callerState + '}' : vals.map((v) => 'data-status="' + v + '"').join(' | ')}); forwarded to the child root by the pass-through honesty law (id/aria/data-* other than part/state)`;
  else door = `className modifier on the documented root hook: ${vals.map((v) => `${c.ownerSkinFamily}__${c.callerPart ?? c.childFamily}--${v}`).join(' | ')} (BaseComponentProps.className lands on the ${c.childFamily} root)`;
  return { id: c.id, file: c.file, line: c.line, child: c.child, childFamily: c.childFamily, callerPart: c.callerPart, callerState: c.callerState, callerStateValues: vals, dynamic: r.callerStateDynamic, ownerSkinFamily: c.ownerSkinFamily, ownerSkins: r.ownerSkins, stateLandsOnEngines: c.stateLandsOnEngines, skinRulesSelectingCallerState: r.skinRulesSelectingCallerState, stateSelectorsHit: r.stateSelectorsHit.map((x) => x.replace('packages/core/src/foundation/tokens/css/', '')), stateSkinFiles: Object.fromEntries(Object.entries(r.stateSkinFiles).map(([k, v]) => [k.replace('packages/core/src/foundation/tokens/css/', ''), v])), door };
});
// C7 applied identically to state attribution: the [data-state…] compound carrying the caller part
for (const c of stateCallers) {
  const hits = c.stateSelectorsHit;
  const struck = hits.filter((h) => ATT.c7Strikes(c, h.split(' :: ').slice(1).join(' :: '), /\[data-state/));
  c.preC7StateRules = c.skinRulesSelectingCallerState;
  c.c7StateStruck = struck;
  c.skinRulesSelectingCallerState -= struck.length;
}
const stateDependents = stateCallers.filter((c) => c.skinRulesSelectingCallerState > 0);
const c7 = {
  leave: callers.filter((c) => c.attribution && c.attribution.preC7 > 0 && c.skinRulesSelectingCallerPart === 0).map((c) => ({ id: c.id, family: c.childFamily, part: c.callerPart, before: c.attribution.preC7, after: 0 })),
  reduced: callers.filter((c) => c.attribution && c.attribution.c7Struck > 0 && c.skinRulesSelectingCallerPart > 0).map((c) => ({ id: c.id, family: c.childFamily, part: c.callerPart, before: c.attribution.preC7, after: c.skinRulesSelectingCallerPart })),
  rulesStruck: callers.reduce((n, c) => n + (c.attribution ? c.attribution.c7Struck : 0), 0),
  stateCallersWithStruckRule: stateCallers.filter((c) => c.c7StateStruck.length > 0).map((c) => c.id),
};
for (const c of dependents) c.dependency = c.callerPartNativelyStamped ? 'shared-name (part also stamped natively elsewhere; this instance still loses its paint)' : 'strict (part exists only as a caller stamp; rules die fleet-wide)';

const v7 = { enabledRules: RULES, struckBy: Object.fromEntries(['C7', 'C8', 'C9', 'C10'].map((k) => [k, callers.reduce((n, c) => n + ((c.attribution && c.attribution.struckBy && c.attribution.struckBy[k]) || 0), 0)])) };

// ---------- v7.1.9: STRUCTURAL FORWARDS (owner 2026-10-14, CARRIERS answer 2, option 3) ----------
// P-88 (kernel/common:166): only a structural component with no part of its own may forward a caller
// data-part/data-state. A classic/rustic layout carrier that stamps no part or state of its own and
// that no loaded skin selects by anatomy forwards by contract: the part it carries is its CALLER's.
// A PUBLISHED third outcome beside `sites` and `excluded`, never inside `excluded`: a site leaves
// `sites` only when the predicate holds AND the closed roster below ratifies its key with an
// authority and an evidence string. The tool never infers a row. Every forward stays measured
// (forwardingMeasured = sites + structuralForwards), and the dependents above are computed over
// both, so a carrier's callers stay counted until their own adoption.
if (!Array.isArray(raw.layoutCarriers) || !raw.layoutCarriers.length) throw new Error('classifyPassThrough: the sweep carries no layoutCarriers (census v7.1.9 requires it)');
const STRUCTURAL_AUTHORITY = 'owner 2026-10-14 CARRIERS answer 2 (option 3); P-88 kernel/common:166';
const STRUCTURAL_FORWARDS = [
  { key: 'primitives/layout/box/engines/classic/index.tsx#ClassicBox#createElement(ElementType)#none#0', engine: 'classic', family: 'box', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 C1 box/engines/classic :456 (void) (static a-c); carriers-i1 battery › C1 classic Box void (as="hr") (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/box/engines/classic/index.tsx#ClassicBox#createElement(ElementType)#none#1', engine: 'classic', family: 'box', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 C2 box/engines/classic :457 (static a-c); carriers-i1 battery › C2 classic Box (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); pre-flight 27273599d (8,878 rendered classic Box instances carry a caller part); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/flex/engines/classic/index.tsx#Flex#AntFlex#none#0', engine: 'classic', family: 'flex', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 C3 flex/engines/classic :57 (AntFlex) (static a-c); carriers-i1 battery › C3 classic Flex (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); pre-flight 27273599d (2,170 rendered instances); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/stack/engines/classic/index.tsx#TitanStack#createElement(ElementType)#none#0', engine: 'classic', family: 'stack', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 C4 stack/engines/classic :76 (static a-c); carriers-i1 battery › C4 classic Stack (with divider) (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); pre-flight 27273599d (1,082 rendered instances); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/space/engines/classic/index.tsx#Space#AntSpace#none#0', engine: 'classic', family: 'space', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 C5 space/engines/classic :74 (AntSpace) (static a-c); carriers-i1 battery › C5 classic Space (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/container/engines/classic/index.tsx#Container#div#none#0', engine: 'classic', family: 'container', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 C6 container/engines/classic :81 (static a-c); carriers-i1 battery › C6 classic Container (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/box/engines/rustic/index.tsx#RusticBox#createElement(ElementType)#none#0', engine: 'rustic', family: 'box', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 R1 box/engines/rustic :411 (void) (static a-c); carriers-i1 battery › R1 rustic Box void (as="hr") (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/box/engines/rustic/index.tsx#RusticBox#createElement(ElementType)#none#1', engine: 'rustic', family: 'box', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 R2 box/engines/rustic :412 (static a-c); carriers-i1 battery › R2 rustic Box (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/flex/engines/rustic/index.tsx#Flex#div#none#0', engine: 'rustic', family: 'flex', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 R3 flex/engines/rustic :56 (static a-c); carriers-i1 battery › R3 rustic Flex (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/stack/engines/rustic/index.tsx#ApolloStack#createElement(ElementType)#none#0', engine: 'rustic', family: 'stack', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 R4 stack/engines/rustic :76 (static a-c); carriers-i1 battery › R4 rustic Stack (with divider) (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/space/engines/rustic/index.tsx#Space#div#none#0', engine: 'rustic', family: 'space', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 R5 space/engines/rustic :113 (static a-c); carriers-i1 battery › R5 rustic Space (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
  { key: 'primitives/layout/container/engines/rustic/index.tsx#Container#div#none#0', engine: 'rustic', family: 'container', authority: STRUCTURAL_AUTHORITY,
    evidence: 'lane-i-carriers-debrief §3 R6 container/engines/rustic :84 (static a-c); carriers-i1 battery › R6 rustic Container (render d: caller part/state land on the root, own computed paint identical over 8 caller arms, negative control moves; results sha256 f5635cbe); reviewer receipt: independent review session 10855df0-865d-4a30-b24b-f6af12435535 (claude-opus-5-5, NORMAL daniel.avila@rottay.com), ACCEPT-WITH-NOTES, 2026-10-14, battery 12/12, results sha256 f5635cbe' },
];
// line-free keys over every forwarding element (the pass-through gate's siteKeys formula), so a
// site's key never depends on which of its twins the roster ratifies
const keyOrdinals = new Map();
for (const s of [...sites].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
  const stem = `${short(s.file)}#${s.owner ?? '?'}#${s.tag}#${s.canonicalPart ?? 'none'}`;
  const ordinal = keyOrdinals.get(stem) ?? 0;
  keyOrdinals.set(stem, ordinal + 1);
  s.key = `${stem}#${ordinal}`;
}
const CARRIER_ENGINE_FILE = new RegExp(`^packages/core/src/components/primitives/layout/(${raw.layoutCarriers.join('|')})/engines/(classic|rustic)/index\\.tsx$`);
const structuralPredicate = (s) => {
  const m = s.file.match(CARRIER_ENGINE_FILE);
  return {
    s1: s.kind === 'engine' && Boolean(m) && m[1] === s.family && m[2] === s.engine,
    s2: s.canonicalPart === null && s.engineStampsState !== true,
    s3: (s.partClass === null || s.partClass === 'part-forward (ADDS)') && (s.stateClass === null || s.stateClass === 'state-forward'),
    s4: s.ownAnatomyRules === 0 && s.ownClassPartial === false,
    s5: s.landing === 'dom' || s.landing === 'ant-forwards', // reachable: an unreachable row is excluded above
  };
};
const rosterRows = new Map();
for (const row of STRUCTURAL_FORWARDS) {
  if (rosterRows.has(row.key)) throw new Error('classifyPassThrough: STRUCTURAL_FORWARDS names ' + row.key + ' twice');
  rosterRows.set(row.key, row);
}
const structuralForwards = [];
const structuralRosterMismatch = [];
for (const s of sites) {
  s.structuralPredicate = structuralPredicate(s);
  const holds = Object.values(s.structuralPredicate).every(Boolean);
  const row = rosterRows.get(s.key);
  const failed = Object.entries(s.structuralPredicate).filter(([, ok]) => !ok).map(([k]) => k);
  if (!row) { if (holds) s.structuralCandidate = true; continue; }
  const rowFaults = [row.engine !== s.engine && 'engine', row.family !== s.family && 'family', !row.authority && 'authority', !row.evidence && 'evidence'].filter(Boolean);
  if (holds && !rowFaults.length) { s.structuralForward = { authority: row.authority, evidence: row.evidence }; structuralForwards.push(s); }
  else structuralRosterMismatch.push({ key: s.key, id: s.id, reason: [...failed.map((k) => `predicate ${k} fails`), ...rowFaults.map((k) => `roster row ${k} ${k === 'authority' || k === 'evidence' ? 'missing' : 'differs from the measured site'}`)].join('; ') });
}
for (const key of rosterRows.keys()) {
  if (sites.some((s) => s.key === key)) continue;
  // a ratified element that now stamps a part of its own changes key (the part is in it): same file, owner and tag
  const stem = key.split('#').slice(0, 3).join('#') + '#';
  const now = sites.find((s) => s.key.startsWith(stem) && !rosterRows.has(s.key));
  structuralRosterMismatch.push(now ? { key, id: now.id, reason: `the ratified element is measured as ${now.key}: it stamps a part of its own` } : { key, id: null, reason: 'the roster row names no measured forwarding element' });
}
for (const s of structuralForwards) sites.splice(sites.indexOf(s), 1);
const structural = { authority: STRUCTURAL_AUTHORITY, carrierFamilies: [...raw.layoutCarriers], roster: STRUCTURAL_FORWARDS.map((r) => ({ ...r })) };
return { sites, excluded, pinCheck, callers, dependents, stateCallers, stateDependents, v4delta, c4Assertion: ATT.assertion, c7, v7, structuralForwards, structuralRosterMismatch, structural };
}
