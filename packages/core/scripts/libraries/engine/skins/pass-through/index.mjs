/**
 * P-88 pass-through census (WO-ARC-12) -- the ONE measurement.
 *
 * Law: P-88 (src/foundation/contracts/kernel/common/index.ts, owner ruling 2026-10-06). A component
 * with a skin of its own keeps its canonical data-part/data-state; a caller value can neither
 * replace them nor be forwarded to an element the component paints. Composition goes through the
 * documented className/slot hooks. Only a structural component with no part of its own forwards.
 *
 * WHAT IT MEASURES (definition: summary/ `out.definition`, binding):
 *   - violating SITES: the elements where a caller data-part/data-state still lands today;
 *   - caller-part DEPENDENTS: callers handing a data-part (a literal attribute or, since v7.1.3,
 *     a `partAttributes` spread) to a skinned child whose
 *     owner skin is credited a rule on that part (v7 attribution) -- the rules that would die the
 *     day the child family stops honouring the caller part;
 *   - caller-state DEPENDENTS: the same for data-state;
 *   - the excluded rows, among them the unpainted-wrapper TRIPWIRES.
 *
 * ONE MEASUREMENT, NEVER TWO. The pass-through gate (scripts/check/engine/skins/pass-through),
 * the three engine-token-audit rows and family-cut's G1 arm all import this module. None of them
 * re-derives a site, a dependent or a caller part.
 *
 * The four sub-modules are the census v7 tools adopted by the DT on 2026-10-09
 * (arc12/l2-tools: census 1937b947 / post 2632ae59 / report 44b91e89 / attribution 7ab151e9),
 * ported with their bodies verbatim; each file names its provenance sha.
 *
 * v7.1 (2026-10-10; census 3ca4db81 / report d66a34b2, post and attribution unchanged): a caller
 * tag is also resolved THROUGH a barrel by its lexical re-export chain (Text/Heading ->
 * typography, the one family whose tag is not its name), and no opener is skipped in silence:
 * what does not resolve is listed, classified and counted in `census.unresolvedCallers`.
 *
 * v7.1.1 (2026-10-10; census be21d40e / report 8a8ca98c): the tag-name fallback is removed. A family
 * is attributed by proof only (import path or re-export chain); a tag that merely shares a
 * family's name (antd's Card, a local `Grid` element variable) is reported, never counted.
 *
 * v7.1.2 (2026-10-11; arc12/dt3: post d6eb6187 / report 2f340462, census and attribution unchanged):
 * the pin inventory follows the tree down. 10 of its 16 rows named tests promoted to passing by the
 * Select and Button engine lots; the 6 left are the 8 remaining it.fails. `pinCheck` is
 * informational -- no site, dependent or ledger value reads it.
 *
 * v7.1.3 (2026-10-11; arc12/census-v713: census 2f7e0518, post / report / attribution unchanged): a
 * `{...partAttributes('<part>', <state>)}` spread on an opener is a caller row like the literal
 * attributes -- the part is the first string-literal argument, the state is the serialized
 * (dynamic) interaction state. A part that is not static is reported `unresolvable`, never guessed.
 */
import { sweepPassThrough } from './sweep/index.mjs';
import { classifyPassThrough } from './classify/index.mjs';
import { summarizePassThrough } from './summary/index.mjs';

export { sweepPassThrough, classifyPassThrough, summarizePassThrough };
export { ALL_RULES } from './attribution/index.mjs';

/** The layout-carrier families whose dependents wait on the owner's carrier ruling (§6). */
export const LAYOUT_CARRIERS = Object.freeze(['box', 'flex', 'stack', 'grid', 'space', 'container']);

const memo = new Map();

/**
 * Run the census once for `repoRoot` (the workspace root).
 * @returns {{ raw: object, classified: object, census: object }}
 */
export function measurePassThrough({ repoRoot, rules, head = null, fresh = false } = {}) {
  if (!repoRoot) throw new Error('measurePassThrough: repoRoot (the workspace root) is required');
  const key = `${repoRoot}|${(rules ?? []).join(',')}|${head ?? ''}`;
  if (!fresh && memo.has(key)) return memo.get(key);
  const raw = sweepPassThrough({ repoRoot });
  const classified = classifyPassThrough(raw, { repoRoot, rules });
  const census = summarizePassThrough(classified, raw, { head });
  const measurement = { raw, classified, census };
  memo.set(key, measurement);
  return measurement;
}

const short = (file) => file.replace('packages/core/src/components/', '');

/**
 * Line-free keys. A key names WHAT an element is (file, owning component, tag, canonical part),
 * plus an ordinal among the elements sharing those four in source order, so editing an
 * unrelated line above it never churns the roster. Reordering two such twins does not change
 * the set either: their keys swap with them.
 */
function keyed(rows, base) {
  const seen = new Map();
  return [...rows]
    .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
    .map((row) => {
      const stem = base(row);
      const ordinal = seen.get(stem) ?? 0;
      seen.set(stem, ordinal + 1);
      return { key: `${stem}#${ordinal}`, row };
    });
}

/** Violating sites keyed `<file>#<owner>#<tag>#<canonicalPart|none>#<ordinal>`. */
export function siteKeys(sites) {
  return keyed(sites, (s) => `${short(s.file)}#${s.owner ?? '?'}#${s.tag}#${s.canonicalPart ?? 'none'}`);
}

/** Excluded rows keyed the same way (the tripwire set is the unpainted subset). */
export function excludedKeys(excluded) {
  return keyed(
    excluded.map((e) => ({ ...e, file: e.id.replace(/:\d+$/, ''), line: Number(e.id.split(':').pop()) })),
    (e) => `${e.file}#${e.owner ?? '?'}#${e.tag}#${e.canonicalPart ?? 'none'}`,
  );
}

/** Dependents (part or state) keyed `<file>#<child>#<callerPart|none>#<ordinal>`. */
export function dependentKeys(callers) {
  return keyed(callers, (c) => `${short(c.file)}#${c.child}#${c.callerPart ?? 'none'}`);
}

/**
 * The caller enumeration family-cut's G1 imports (review-arc12-rfc §3, G1.1): every JSX use in
 * packages/core/src/components that hands a LITERAL data-part (as an attribute or, since v7.1.3,
 * as the first argument of a `partAttributes` spread) to a DS component whose family
 * owns a part or ships a skin, resolved to that child family. This is the sweep's own list,
 * returned as-is: G1 classifies against it and never re-derives it.
 * @returns {Array<{ file: string, line: number, child: string, childFamily: string, callerPart: string }>}
 */
export function enumerateCallerParts(measurement) {
  return measurement.raw.compoundSites
    .filter((c) => c.callerPart)
    .map((c) => ({ file: c.file, line: c.line, child: c.tag, childFamily: c.childFamily, callerPart: c.callerPart }));
}
