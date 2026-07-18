/**
 * @fileoverview Contrast-adjustment rows surfaced by the tenant-theme preview.
 *
 * The DB-tenant compiler auto-corrects text/background pairs that fall below
 * their APCA threshold and records each correction on the artifact's optional
 * `adjustments` field. This module re-exports that compiler-owned row type as
 * the preview-side contract and owns the pure selector the hook and report read.
 * The selector accepts a structural fragment with an optional `adjustments`
 * list, so an artifact with no corrections (or one that predates the field)
 * degrades to an empty list instead of throwing.
 */

import type {
  TenantThemeArtifactV1,
  TenantThemeContrastAdjustmentV1,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

export type { TenantThemeContrastAdjustmentV1 };

/**
 * Read the compiler-emitted contrast adjustments off a compiled artifact.
 *
 * Returns an empty list when the artifact recorded no corrections so the preview
 * degrades to "no corrections" rather than throwing.
 */
export function selectTenantThemeAdjustments(
  artifact: Pick<TenantThemeArtifactV1, 'adjustments'> | null | undefined
): readonly TenantThemeContrastAdjustmentV1[] {
  return artifact?.adjustments ?? [];
}
