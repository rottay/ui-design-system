/**
 * @fileoverview The single-owner set: files that at most ONE lane in a plan
 * may write, and that no lane may write without saying so out loud.
 *
 * TWO SOURCES, ONE RULE.
 *
 *  - SEEDED. Four regions where a single edit moves every vertical at once:
 *    the default theme, the base CSS layer, the tenant capability registry,
 *    and the TypeScript token sources. These are named here because they are
 *    single-owner by ARCHITECTURE, not by arithmetic — no census would show
 *    it, and `themes/default.css` is already refused to two lanes at once by
 *    the programme's own standing fences.
 *
 *  - DERIVED. Every skin CSS file that the ledger's own rows show is claimed
 *    by more than one family. These are single-owner by ARITHMETIC, and the
 *    arithmetic is redone from `rows[].skinFiles` on every run rather than
 *    read out of the ledger's summary field.
 *
 * HOW A LANE MAY STILL WRITE ONE. Silence is refusal: a write set that
 * happens to cover a shared file fails. A lane that genuinely owns the file
 * for this wave declares `claimsSharedFiles: [path]`, and then the checker
 * enforces what the declaration is for — exactly one claimant per file per
 * plan, and the claim has to fall inside the lane's own declared root. That
 * is the mechanism behind "single ownership, always"; without the escape
 * hatch the base-layer lane could not run at all, and with an unchecked one
 * the rule would be prose again.
 */
import { compilePattern, matchesCompiled, normalizePath } from '../../foundation/glob/index.mjs';

/**
 * Seeded single-owner regions. Each entry carries the reason it is here,
 * because a list of paths with no reasons rots into a list nobody may edit.
 */
export const SEEDED_SINGLE_OWNER = Object.freeze([
  Object.freeze({
    pattern: 'packages/core/src/foundation/tokens/css/foundation/themes/default.css',
    reason: 'the default theme: one edit moves every vertical, and the programme refuses two lanes on it at once',
  }),
  Object.freeze({
    pattern: 'packages/core/src/foundation/tokens/css/foundation/base/*.css',
    reason: 'the base CSS layer (borders, density, properties, shadows, spacing, typography, z-index) is read by every family',
  }),
  Object.freeze({
    pattern: 'packages/core/src/foundation/contracts/composition/tenants/capabilities/**',
    reason: 'the tenant capability registry declares access for every white-label axis; two writers fork the contract',
  }),
  Object.freeze({
    pattern: 'packages/core/src/foundation/tokens/ts/**',
    reason: 'the TypeScript token sources are the authority the CSS artifacts are generated from',
  }),
]);

/**
 * Build the single-owner set for a run: seeded regions plus every
 * multi-owner skin file derived from the ledger rows.
 */
export function buildSingleOwnerSet(derivedSharedSkinFiles) {
  const entries = SEEDED_SINGLE_OWNER.map((entry) => ({
    pattern: entry.pattern,
    reason: entry.reason,
    origin: 'seeded',
    compiled: compilePattern(entry.pattern),
  }));

  for (const [file, owners] of derivedSharedSkinFiles) {
    entries.push({
      pattern: normalizePath(file),
      reason: `skin CSS claimed by ${owners.length} families (${owners.slice(0, 3).join(', ')}${owners.length > 3 ? ', …' : ''})`,
      origin: 'derived-from-ledger',
      owners,
      compiled: compilePattern(file),
    });
  }

  return entries;
}

/** Which single-owner entries does this concrete path fall under? */
export function singleOwnerHits(path, singleOwnerSet) {
  const normalized = normalizePath(path);
  return singleOwnerSet.filter((entry) => matchesCompiled(normalized, entry.compiled));
}
