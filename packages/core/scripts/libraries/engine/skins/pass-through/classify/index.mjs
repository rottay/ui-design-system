/**
 * P-88 pass-through census -- CLASSIFY (WO-ARC-12). Turns the sweep into violating sites (the
 * five-condition definition, amended (e)(i)-(iv)), the excluded rows with their reasons (the
 * unpainted-wrapper TRIPWIRE rows among them), the caller enumeration and the dependents under
 * the v7 attribution (v3 owner skins, C4 engine scope, rule 4b, C7..C10 strikes). READ-ONLY.
 * The body is the adopted post.mjs verbatim; only its CLI shell is replaced.
 */
// Provenance: arc12/census-v715/post.mjs sha256 4c8ae5ca3cbe9388d2c4bec2969166e2772b333bbb1b4533dc286fddf006b80e (census v7.1.5, 2026-10-11: the pin
// inventory loses the two classic Card rows; v7.1.4 was arc12/census-v714/post.mjs 3bf98a0d, v7.1.2 arc12/dt3/post.mjs d6eb6187, v7 through v7.1.1 arc12/l2-tools/post.mjs 2632ae59).
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

// pin consistency: the 2 distinct pinned behaviours (2 it.fails, modern and rustic Card)
// v7.1.2: 10 rows left with their promotion to passing tests -- the modern Select pair at E1
// (bfe7d5f89), the modern/rustic Button eight at E9 (28e169406). A row leaves only that way.
// v7.1.4: the two classic Button rows left the same way, with the classic strip (step 3, S3-1).
// v7.1.5: the two classic Card rows left with theirs (S3-3); the PassThroughLaw table was split there.
const PINS = [
  { pin: 'PassThroughLaw:70 modern Card resting data-state', match: (s) => /display\/card\/engines\/modern/.test(s.file) && s.stateClass === 'state-rest' },
  { pin: 'PassThroughLaw:70 rustic Card resting data-state', match: (s) => /display\/card\/engines\/rustic/.test(s.file) && s.stateClass === 'state-rest' },
];
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
return { sites, excluded, pinCheck, callers, dependents, stateCallers, stateDependents, v4delta, c4Assertion: ATT.assertion, c7, v7 };
}
