import {
  isTenantAuthoredOrigin,
  type ThemeIntent,
} from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  resolveTheme as isoResolveTheme,
  type Theme,
} from "@/foundation/contracts/composition/tenants/themes/iso";
import {
  EMPTY_PROVENANCE,
  tenantProvenance,
  type ThemeResolution,
} from "@/foundation/contracts/composition/tenants/themes/resolved";

/**
 * Applies one intent to a baseline and records what the merge destroys.
 *
 * The origin decides authorship, not the presence of a patch: a
 * `static-vertical` intent may change the resolved `Theme` while creating no
 * tenant floor and no tenant status-seed authorship. Provenance is always
 * computed from the RAW patch, because a resolved `Theme` can no longer say
 * whose a value is.
 */
export function resolveTheme(baseline: Theme, intent?: ThemeIntent): ThemeResolution {
  if (!intent) return { theme: baseline, provenance: EMPTY_PROVENANCE };
  return {
    theme: isoResolveTheme(baseline, intent.patch),
    provenance: isTenantAuthoredOrigin(intent.origin)
      ? tenantProvenance(intent.patch)
      : EMPTY_PROVENANCE,
    intent,
  };
}
