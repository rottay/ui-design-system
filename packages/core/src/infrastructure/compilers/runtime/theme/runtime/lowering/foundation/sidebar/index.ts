/**
 * @fileoverview Sidebar tone-leaf retention across a mode overlay.
 *
 * @module Compilers/Theme/Lowering/Foundation/sidebar
 * @category Compilers
 * @package @rottay/design-system
 */

import type { TenantAuthoredPaths } from "@/foundation/contracts/composition/tenants/themes/iso";
import { SIDEBAR_TONE_LEAF_FIELDS } from "@/infrastructure/compilers/kernel/foundation/css/chrome-variables";

/**
 * Keep a tenant's base-authored sidebar leaf authoritative INSIDE a mode.
 *
 * A mode overlay is a statement about the other mode, not a statement about
 * who outranks whom. `applyModeOverlay` merges structurally, so the vertical
 * baseline's `modes.dark.chrome.sidebar.*` lands on top of the tenant's base
 * leaf purely because it is more specific -- and that is the same
 * BASELINE_LEAF(1) beating TENANT_LEAF(4) inversion this wave exists to close,
 * displaced by one block. A tenant that states its sidebar colour once, without
 * qualifying a mode, has stated it for every mode; only the TENANT can narrow
 * that statement, by authoring the mode leaf itself.
 *
 * So the base block's emitted value is restored whenever the tenant authored
 * the leaf at the base and did NOT restate it for this mode. The delta filter
 * downstream then withdraws the channel entirely, which is the visible
 * signature of the rule: a tenant sidebar colour produces no mode row at all,
 * rather than a row painting it back to the vertical's.
 *
 * Scope is Site B's closed table and nothing else. It is deliberately NOT
 * generalised to every authored chrome field: an overlay that carries a
 * genuinely mode-specific value (a dark card surface against a light one) is
 * not an inversion, and re-ranking those is a separate contest this wave has
 * no standing in.
 *
 * Rank does not consult the shape of the value. Site A's `bakesItsOwnColor`
 * predicate governs SEED-DERIVED rewriting, where the question is whether an
 * assembled value already tracks the seed; it has no authority here. A tenant
 * leaf holding `var(--ds-tint-8)` is a TENANT_LEAF(4) statement exactly as
 * much as one holding `#101014`, and filtering on literal-vs-reference would
 * hand the channel back to the baseline overlay it outranks. If carrying a
 * reference across a mode makes a contrast pair unverifiable, that is an
 * intake question for the document, answered at ingestion -- not a reason to
 * demote the rank.
 */
export function keepTenantBaseSidebarLeaves(
  modeVars: Record<string, string>,
  baseVars: Record<string, string>,
  authoredPaths: TenantAuthoredPaths | undefined,
  modePrefix: string
): void {
  if (authoredPaths === undefined) return;
  for (const [channel, field] of Object.entries(SIDEBAR_TONE_LEAF_FIELDS)) {
    // Base authorship only -- `isTenantAuthoredField` would also answer yes for
    // a mode-qualified path, and a tenant's own mode leaf is exactly the case
    // that must NOT be overwritten here.
    if (!authoredPaths.has(field)) continue;
    if (authoredPaths.has(`${modePrefix}${field}`)) continue;
    const base = baseVars[channel];
    if (base === undefined) continue;
    modeVars[channel] = base;
  }
}
