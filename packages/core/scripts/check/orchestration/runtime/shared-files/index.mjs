/**
 * @fileoverview The single-owner set: files that at most ONE lane in a plan
 * may write, and that no lane may write without saying so out loud.
 *
 * ONE SOURCE: ARCHITECTURE. Every entry names a region where a single edit
 * moves more than the family that made it — the default theme, the base CSS
 * layer, the tenant capability registry, the TypeScript token sources, the
 * component token layer, and the modern engine's skin. None of them lies
 * inside any family's source owner, so no family lane's own bound can reach
 * one; the set exists to refuse the ad-hoc lane that declares its `writeRoot`
 * straight into shared CSS.
 *
 * WHY THESE ARE NOT ARITHMETIC. The predecessor derived a second, narrower
 * half of this set by counting, per skin file, how many families the sealed R0
 * ledger recorded as owners, and protecting the ones with more than one. That
 * had three defects. It protected 36 of the 283 files in those directories,
 * leaving the rest open to exactly the same accident. It moved whenever the
 * catalog was renamed, so protection depended on a census rather than on what
 * the file is. And it made sealed history an active input. The regions below
 * are shared because of where they sit in the cascade, which is a property no
 * census can strengthen or repeal — and they cover all 283 files, not 36.
 *
 * HOW A LANE MAY STILL WRITE ONE — AND WHY A FAMILY LANE CANNOT. Silence is
 * refusal: a write set that happens to cover a shared file fails. A lane that
 * genuinely owns the file for this wave declares `claimsSharedFiles: [path]`,
 * and the checker then enforces what the declaration is for — exactly one
 * claimant per file per plan, and the claim has to fall inside the lane's own
 * declared root.
 *
 * That last clause is the routing. A family lane is bounded to its
 * `sourceOwner`, and no shared region lies inside one, so a family lane cannot
 * put a shared file in its write set at all: `R1-bound` refuses the write set
 * before `R4` ever reads the claim. Declaring `claimsSharedFiles` does not buy
 * a family lane through — the bound is checked first and separately, and
 * `R0-lane-role` refuses the shape before either. Writing shared CSS has to be
 * raised as its own INTEGRATOR lane, rooted in one of these regions.
 *
 * SINGLETON PER DOMAIN, NOT PER FILE. Two integrator lanes holding two
 * DIFFERENT skin sheets is not two independent jobs: the shared CSS is one
 * cascade, and two writers in it produce interleaved visual change that
 * neither can review. So at most one lane per plan may claim anything in a
 * given domain — `shared-css` covers the theme, the base layer, the component
 * token layer and the engine skin together. Per-file singleton alone permits
 * exactly the scenario the rule exists to prevent.
 */
import { compilePattern, matchesCompiled, normalizePath } from '../../foundation/glob/index.mjs';

/**
 * Seeded single-owner regions. Each entry carries the reason it is here,
 * because a list of paths with no reasons rots into a list nobody may edit.
 */
export const SEEDED_SINGLE_OWNER = Object.freeze([
  Object.freeze({
    pattern: 'packages/core/src/foundation/tokens/css/foundation/themes/default/index.css',
    domain: 'shared-css',
    root: 'packages/core/src/foundation/tokens/css/foundation/themes',
    reason: 'the default theme: one edit moves every vertical, and the programme refuses two lanes on it at once',
  }),
  Object.freeze({
    pattern: 'packages/core/src/foundation/tokens/css/foundation/base/**/index.css',
    domain: 'shared-css',
    root: 'packages/core/src/foundation/tokens/css/foundation/base',
    reason: 'the base CSS layer (borders, density, properties, shadows, spacing, typography, z-index) is read by every family',
  }),
  Object.freeze({
    pattern: 'packages/core/src/foundation/contracts/composition/tenants/capabilities/**',
    domain: 'tenant-contracts',
    root: 'packages/core/src/foundation/contracts/composition/tenants/capabilities',
    reason: 'the tenant capability registry declares access for every white-label axis; two writers fork the contract',
  }),
  Object.freeze({
    pattern: 'packages/core/src/foundation/tokens/ts/**',
    domain: 'token-sources',
    root: 'packages/core/src/foundation/tokens/ts',
    reason: 'the TypeScript token sources are the authority the CSS artifacts are generated from',
  }),
  Object.freeze({
    pattern: 'packages/core/src/foundation/tokens/css/presentation/components/**',
    domain: 'shared-css',
    root: 'packages/core/src/foundation/tokens/css/presentation/components',
    reason:
      'the component token layer and its skin sheets: one stylesheet per component name, shared by every family that renders it — not owned by any family source owner',
  }),
  Object.freeze({
    pattern: 'packages/core/src/foundation/tokens/css/runtime/engines/modern/skin/**',
    domain: 'shared-css',
    root: 'packages/core/src/foundation/tokens/css/runtime/engines/modern/skin',
    reason: 'the modern engine skin: one edit changes the engine, which is every family using it at once',
  }),
]);

/**
 * The roots an integrator lane may declare. An explicit `writeRoot` is only
 * legitimate when it lands in one of these, because these are the only regions
 * with no family owner to bind to.
 */
export const INTEGRATOR_ROOTS = Object.freeze([...new Set(SEEDED_SINGLE_OWNER.map((entry) => entry.root))]);

/** Build the single-owner set for a run. */
export function buildSingleOwnerSet() {
  return SEEDED_SINGLE_OWNER.map((entry) => ({
    pattern: entry.pattern,
    domain: entry.domain,
    root: entry.root,
    reason: entry.reason,
    origin: 'seeded',
    compiled: compilePattern(entry.pattern),
  }));
}

/** Which single-owner entries does this concrete path fall under? */
export function singleOwnerHits(path, singleOwnerSet) {
  const normalized = normalizePath(path);
  return singleOwnerSet.filter((entry) => matchesCompiled(normalized, entry.compiled));
}
