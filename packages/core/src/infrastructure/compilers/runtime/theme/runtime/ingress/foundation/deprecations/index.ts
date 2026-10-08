/**
 * @fileoverview The retiring-capability census: every admitted entry of a capability whose retirement is ruled, named.
 *
 * @module Compilers/Theme/Ingress/Foundation/Deprecations
 * @category Compilers
 * @package @rottay/design-system
 */

import type {
  TenantThemeDeprecationNotice,
  TenantThemeDocument,
} from "@/foundation/contracts/composition/tenants/themes/tenant-theme";

/** The ruling that retires the raw escape: owner R32 Q2, 2026-10-04. */
export const TOKEN_OVERRIDES_RETIREMENT_RULING =
  "R32 Q2 (owner, 2026-10-04): the raw escape retires in every door, v1 included";

/** Where the migration of a stored row is documented. */
export const TOKEN_OVERRIDES_MIGRATION_DOCUMENT =
  "packages/core/docs/reference/contracts/token-overrides-migration";

const PREFIX = "visualFoundation.advanced.tokenOverrides";

/**
 * A v1 row: one notice per admitted raw token override. The entry is still
 * admitted and lowered -- a stored row stays readable (D-C) -- so this reports,
 * it never refuses. v2/v3 never reach here: their door refuses the decision by
 * name (`THEME_CATALOG_RETIRED`).
 */
export function censusRetiringCapabilitiesV1(
  document: TenantThemeDocument
): TenantThemeDeprecationNotice[] {
  if (document.mode !== "advanced") return [];
  const overrides = document.visualFoundation?.advanced?.tokenOverrides as
    | Record<string, unknown>
    | undefined;
  if (!overrides) return [];
  return Object.keys(overrides)
    .filter((token) => overrides[token] !== undefined)
    .sort()
    .map((token) => {
      const path = `${PREFIX}["${token}"]`;
      return {
        code: "retiring-capability",
        capability: "token-overrides",
        path,
        ruling: TOKEN_OVERRIDES_RETIREMENT_RULING,
        message:
          `${path}: the raw tokenOverrides escape is retiring (${TOKEN_OVERRIDES_RETIREMENT_RULING}). ` +
          "The stored row is still read; migrate it as documented in " +
          `${TOKEN_OVERRIDES_MIGRATION_DOCUMENT} -- decisions v2/v3 refuse raw --ds-* authorship ` +
          "(use overrides.chrome.<family>.<channel>).",
      };
    });
}
