/**
 * @fileoverview The preview ingress: an unsaved tenant customization.
 *
 * @module Compilers/Theme/Ingress/Presentation/Preview
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import {
  isTenantThemeDocumentV2,
  type TenantThemeDocumentAny,
} from "@/contracts/theme/presentation/document";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import type { TenantThemeVerticalEnvelope } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";
import { admitDocument, type DocumentAdmission } from "../../runtime/document-v2";
import { authoredThemePatch } from "../../foundation/draft-patch";

/** What an unsaved document preview needs to name a compile. */
export interface PreviewThemeIntentInput {
  vertical: FirstPartyVerticalId;
  slug: string;
  document: TenantThemeDocumentAny;
  /** As on the persisted producer: preview clamps where publication clamps. */
  ranges?: TenantThemeVerticalEnvelope["ranges"];
}

/** What an unsaved BrandTheme draft needs to name a compile. */
export interface DraftPreviewThemeIntentInput {
  vertical: FirstPartyVerticalId;
  slug: string;
  draft: BrandTheme;
}

/**
 * The entitlement a document carries, or none. Identical to the persisted
 * producer's, because preview and publish read one document.
 */
function entitlementOf(
  document: TenantThemeDocumentAny
): Pick<ThemeIntent, "entitlement"> {
  return isTenantThemeDocumentV2(document)
    ? { entitlement: { plan: document.plan } }
    : {};
}

/**
 * The intent an unsaved document preview compiles under.
 *
 * Identical to the persisted producer except for the origin, and deliberately
 * so: `preview` resolves with tenant authorship exactly like `tenant-document`,
 * so a preview that paints is a publish that would have been admitted. The one
 * thing a preview must never be is a cheaper path with fewer laws on it.
 */
export function previewThemeIntent(input: PreviewThemeIntentInput): ThemeIntent {
  return previewThemeAdmission(input).intent;
}

/**
 * The preview admission, with the same report the persisted door emits.
 *
 * Preview and publish share the admission for the same reason they share the
 * patch: an editor that showed a tenant a different "not lit" list from the one
 * publish records would be a second answer about the same document.
 */
export function previewThemeAdmission(
  input: PreviewThemeIntentInput
): { intent: ThemeIntent; admission: DocumentAdmission } {
  const admission = admitDocument({
    vertical: input.vertical,
    document: input.document,
    ranges: input.ranges,
  });
  return {
    intent: {
      vertical: input.vertical,
      slug: input.slug,
      origin: "preview",
      patch: admission.patch,
      ...entitlementOf(input.document),
      ledger: admission.ledger,
    },
    admission,
  };
}

/**
 * The intent an unsaved BrandTheme draft compiles under.
 *
 * The authoring surfaces edit a `BrandTheme`, not a document, so their draft
 * reaches the same door through the draft projection rather than the v1
 * migration. Same origin, same authorship, same admission.
 */
export function draftPreviewThemeIntent(
  input: DraftPreviewThemeIntentInput
): ThemeIntent {
  return {
    vertical: input.vertical,
    slug: input.slug,
    origin: "preview",
    patch: authoredThemePatch(input.draft),
  };
}
