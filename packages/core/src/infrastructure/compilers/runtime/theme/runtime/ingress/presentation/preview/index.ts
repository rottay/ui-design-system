/**
 * @fileoverview The preview ingress: an unsaved tenant customization.
 *
 * @module Compilers/Theme/Ingress/Presentation/Preview
 * @category Compilers
 * @package @rottay/design-system
 */

import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeIntent } from "@/foundation/contracts/composition/tenants/themes/intent";
import type { TenantThemeDocumentAny } from "@/foundation/contracts/composition/tenants/themes/tenant-theme/decision-document";
import type { FirstPartyVerticalId } from "@/foundation/contracts/kernel/verticals";
import {
  admitDocument,
  documentAnyThemePatch,
  type DocumentAdmission,
} from "../../runtime/document-v2";
import { authoredThemePatch } from "../../foundation/draft-patch";

/** What an unsaved document preview needs to name a compile. */
export interface PreviewThemeIntentInput {
  vertical: FirstPartyVerticalId;
  slug: string;
  document: TenantThemeDocumentAny;
}

/** What an unsaved BrandTheme draft needs to name a compile. */
export interface DraftPreviewThemeIntentInput {
  vertical: FirstPartyVerticalId;
  slug: string;
  draft: BrandTheme;
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
  return {
    vertical: input.vertical,
    slug: input.slug,
    origin: "preview",
    patch: documentAnyThemePatch({
      vertical: input.vertical,
      document: input.document,
    }),
  };
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
  });
  return {
    intent: {
      vertical: input.vertical,
      slug: input.slug,
      origin: "preview",
      patch: admission.patch,
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
